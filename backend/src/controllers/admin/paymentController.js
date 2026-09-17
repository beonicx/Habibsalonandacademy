const Payment = require("../../models/Payment");
const Booking = require("../../models/Booking");
const User = require("../../models/User");
const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const Notification = require("../../models/Notification");

async function getAllPayments(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email phone")
        .populate("booking", "customerName date timeSlot"),
      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

async function getPaymentById(req, res) {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("booking");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    console.error("Get payment error:", err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
}

async function createPayment(req, res) {
  try {
    const { userId, bookingId, amount, method, transactionId, notes } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ error: "Amount and method are required" });
    }

    const doc = { amount, method, status: "completed" };
    if (userId) doc.user = userId;
    if (bookingId) doc.booking = bookingId;
    if (transactionId) doc.transactionId = transactionId;
    if (notes) doc.notes = notes;

    const payment = await Payment.create(doc);

    try {
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "paid" });
      }

      if (userId) {
        await User.findByIdAndUpdate(userId, { $inc: { totalSpent: amount } });

        const pointsEarned = Math.floor(amount / 10);
        if (pointsEarned > 0) {
          const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { superCoins: pointsEarned } },
            { new: true }
          );

          if (user) {
            await SuperCoinTransaction.create({
              user: userId,
              points: pointsEarned,
              type: "earned",
              source: "booking",
              referenceId: payment._id,
              referenceModel: "Payment",
              description: `Earned ${pointsEarned} SuperCoins for payment of ₹${amount}`,
              balanceAfter: user.superCoins,
            });
          }
        }

        await Notification.create({
          user: userId,
          title: "Payment Received",
          message: `Payment of ₹${amount} received via ${method}.${pointsEarned > 0 ? ` You earned ${pointsEarned} SuperCoins!` : ""}`,
          type: "payment",
        });
      }
    } catch (sideErr) {
      console.error("Payment side-effect error (payment was created):", sideErr);
    }

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    console.error("Create payment error:", err);
    const message = err.name === "ValidationError"
      ? Object.values(err.errors).map((e) => e.message).join(", ")
      : "Failed to create payment";
    res.status(err.name === "ValidationError" ? 400 : 500).json({ error: message });
  }
}

async function processRefund(req, res) {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({ error: "Can only refund completed payments" });
    }

    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      return res.status(400).json({ error: "Refund amount exceeds payment amount" });
    }

    payment.status = refundAmount >= payment.amount ? "refunded" : "partially-refunded";
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    await payment.save();

    if (payment.booking) {
      await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: "refunded" });
    }

    if (payment.user) {
      await User.findByIdAndUpdate(payment.user, { $inc: { totalSpent: -refundAmount } });

      await Notification.create({
        user: payment.user,
        title: "Refund Processed",
        message: `A refund of ${refundAmount} has been processed.${reason ? ` Reason: ${reason}` : ""}`,
        type: "payment",
      });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: "Failed to process refund" });
  }
}

async function getRevenueSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const [summary, byMethod] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalTransactions: { $sum: 1 },
            avgTransaction: { $avg: "$amount" },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: "$method",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const refunds = await Payment.aggregate([
      { $match: { status: { $in: ["refunded", "partially-refunded"] }, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalRefunds: { $sum: "$refundAmount" }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        ...(summary[0] || { totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 }),
        totalRefunds: refunds[0]?.totalRefunds || 0,
        refundCount: refunds[0]?.count || 0,
        byMethod,
      },
    });
  } catch (err) {
    console.error("Revenue summary error:", err);
    res.status(500).json({ error: "Failed to fetch revenue summary" });
  }
}

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  processRefund,
  getRevenueSummary,
};
