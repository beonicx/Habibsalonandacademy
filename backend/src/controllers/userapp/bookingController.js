const Booking = require("../../models/Booking");
const User = require("../../models/User");
const Coupon = require("../../models/Coupon");
const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const Notification = require("../../models/Notification");
const { sendBookingNotification } = require("../../services/emailService");

const COIN_VALUE = 0.5;

const createBooking = async (req, res) => {
  try {
    const { name, email, phone, service, date, time, notes, redeemSuperCoins, couponCode } = req.body;

    let superCoinsUsed = 0;
    let superCoinsDiscount = 0;
    let appliedCouponCode = "";
    let couponDiscount = 0;

    if (couponCode) {
      const now = new Date();
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

      if (!coupon) {
        return res.status(400).json({ success: false, error: "Invalid coupon code" });
      }
      if (now < coupon.validFrom || now > coupon.validTill) {
        return res.status(400).json({ success: false, error: "Coupon has expired" });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, error: "Coupon usage limit reached" });
      }
      if (req.user?.id && coupon.perUserLimit) {
        const userUseCount = coupon.usedBy.filter((u) => u.user?.toString() === req.user.id).length;
        if (userUseCount >= coupon.perUserLimit) {
          return res.status(400).json({ success: false, error: "You have already used this coupon" });
        }
      }
      if (coupon.applicableServices.length > 0 && service) {
        const serviceMatch = coupon.applicableServices.some(
          (s) => s.toLowerCase() === service.toLowerCase()
        );
        if (!serviceMatch) {
          return res.status(400).json({ success: false, error: "Coupon is not valid for this service" });
        }
      }

      appliedCouponCode = coupon.code;

      if (coupon.discountType === "percentage") {
        couponDiscount = coupon.discountValue;
        if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      } else {
        couponDiscount = coupon.discountValue;
      }

      coupon.usedCount += 1;
      if (req.user?.id) {
        coupon.usedBy.push({ user: req.user.id });
      }
      await coupon.save();
    }

    if (redeemSuperCoins && redeemSuperCoins > 0 && req.user?.id) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const coinsToUse = Math.min(redeemSuperCoins, user.superCoins);
      if (coinsToUse <= 0) {
        return res.status(400).json({ success: false, error: "Insufficient SuperCoins" });
      }

      superCoinsUsed = coinsToUse;
      superCoinsDiscount = coinsToUse * COIN_VALUE;

      user.superCoins -= coinsToUse;
      await user.save();

      await SuperCoinTransaction.create({
        user: user._id,
        points: coinsToUse,
        type: "redeemed",
        source: "redemption",
        description: `Redeemed ${coinsToUse} SuperCoins on booking (₹${superCoinsDiscount} discount)`,
        balanceAfter: user.superCoins,
      });

      await Notification.create({
        user: user._id,
        title: "SuperCoins Redeemed",
        message: `You redeemed ${coinsToUse} SuperCoins for ₹${superCoinsDiscount} off your booking. Remaining: ${user.superCoins}`,
        type: "supercoins",
      });
    }

    const booking = await Booking.create({
      user: req.user?.id || undefined,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      services: [{ name: service }],
      date: new Date(date),
      timeSlot: time,
      notes: notes || "",
      status: "pending",
      couponCode: appliedCouponCode,
      couponDiscount,
      superCoinsUsed,
      superCoinsDiscount,
    });

    const discountParts = [];
    if (appliedCouponCode) discountParts.push(`Coupon ${appliedCouponCode} applied`);
    if (superCoinsUsed) discountParts.push(`${superCoinsUsed} SuperCoins redeemed for ₹${superCoinsDiscount} discount`);

    console.log(
      `New booking: ${booking.customerName} — ${service} on ${booking.date.toISOString()} at ${booking.timeSlot}${discountParts.length ? ` (${discountParts.join(", ")})` : ""}`
    );

    await sendBookingNotification({
      name,
      email,
      phone,
      service,
      date,
      time,
      notes: notes || "",
    });

    const message = discountParts.length
      ? `Booking confirmed! ${discountParts.join(". ")}.`
      : "Booking confirmed! We'll send a reminder before your appointment.";

    res.status(201).json({ success: true, message, data: booking });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ success: false, error: "Failed to create booking" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.id) {
      filter.user = req.user.id;
    }
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch booking" });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ success: false, error: "Failed to update booking" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
};
