const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../../models/Booking");
const Payment = require("../../models/Payment");
const User = require("../../models/User");
const Service = require("../../models/Service");
const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const Notification = require("../../models/Notification");

let razorpay;
function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }
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

    if (!bookingId) {
      return res.status(400).json({ success: false, error: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    let finalAmount = Number(amount) || 0;

    if (finalAmount <= 0) {
      const serviceName = booking.services?.[0]?.name;
      if (serviceName) {
        const svc = await Service.findOne({ name: serviceName, isActive: true });
        if (svc) {
          finalAmount = svc.price - (booking.superCoinsDiscount || 0) - (booking.couponDiscount || 0);
          finalAmount = Math.max(finalAmount, 0);
        }
      }
    }

    if (finalAmount <= 0) {
      return res.status(400).json({ success: false, error: "Amount must be greater than 0" });
    }

    booking.totalAmount = booking.totalAmount || finalAmount + (booking.superCoinsDiscount || 0) + (booking.couponDiscount || 0);
    booking.finalAmount = finalAmount;

    const options = {
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `bk_${bookingId}`,
      notes: {
        bookingId: String(bookingId),
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
    console.error("Create Razorpay order error:", err.statusCode || err.message, err.error || "");
    let message = "Failed to create payment order";
    if (err.message?.includes("credentials")) {
      message = "Payment gateway not configured";
    } else if (err.statusCode === 401) {
      message = "Payment gateway authentication failed — please contact support";
    } else if (err.error?.description) {
      message = err.error.description;
    }
    res.status(500).json({ success: false, error: message });
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

    const paymentAmount = booking.finalAmount || booking.totalAmount || 0;
    const payment = await Payment.create({
      user: booking.user || undefined,
      booking: booking._id,
      amount: paymentAmount,
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
