const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../../models/Booking");
const Payment = require("../../models/Payment");
const User = require("../../models/User");
const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const Notification = require("../../models/Notification");

let razorpay;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, error: "Booking ID and amount are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
      },
    };

    const order = await getRazorpay().orders.create(options);

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error("Create Razorpay order error:", err);
    res.status(500).json({ success: false, error: "Failed to create payment order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, error: "Missing payment verification data" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Payment verification failed" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentStatus = "paid";
    await booking.save();

    const payment = await Payment.create({
      user: booking.user || undefined,
      booking: booking._id,
      amount: booking.finalAmount || booking.totalAmount || 0,
      method: "razorpay",
      status: "completed",
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      notes: "Online payment via Razorpay",
    });

    if (booking.user) {
      const amount = payment.amount;
      const pointsEarned = Math.floor(amount / 10);

      if (pointsEarned > 0) {
        const user = await User.findByIdAndUpdate(
          booking.user,
          { $inc: { superCoins: pointsEarned, totalSpent: amount } },
          { new: true }
        );

        if (user) {
          await SuperCoinTransaction.create({
            user: booking.user,
            points: pointsEarned,
            type: "earned",
            source: "booking",
            referenceId: payment._id,
            referenceModel: "Payment",
            description: `Earned ${pointsEarned} SuperCoins for online payment of ₹${amount}`,
            balanceAfter: user.superCoins,
          });
        }
      } else {
        await User.findByIdAndUpdate(booking.user, { $inc: { totalSpent: amount } });
      }

      await Notification.create({
        user: booking.user,
        title: "Payment Successful",
        message: `Payment of ₹${payment.amount} received for your booking. ${pointsEarned > 0 ? `You earned ${pointsEarned} SuperCoins!` : ""}`,
        type: "payment",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: { paymentId: payment._id },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, error: "Payment verification failed" });
  }
};

module.exports = { createOrder, verifyPayment };
