const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

async function getTransactions(req, res) {
  try {
    const { page = 1, limit = 20, userId, type, source } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (type) filter.type = type;
    if (source) filter.source = source;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      SuperCoinTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email phone superCoins"),
      SuperCoinTransaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Get SuperCoin transactions error:", err);
    res.status(500).json({ error: "Failed to fetch SuperCoin transactions" });
  }
}

async function getUserPoints(req, res) {
  try {
    const user = await User.findById(req.params.userId).select("name email superCoins");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const history = await SuperCoinTransaction.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const stats = await SuperCoinTransaction.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$points" },
        },
      },
    ]);

    const totalEarned = stats.find((s) => s._id === "earned")?.total || 0;
    const totalRedeemed = stats.find((s) => s._id === "redeemed")?.total || 0;

    res.json({
      success: true,
      data: {
        user,
        currentBalance: user.superCoins,
        totalEarned,
        totalRedeemed,
        history,
      },
    });
  } catch (err) {
    console.error("Get user SuperCoins error:", err);
    res.status(500).json({ error: "Failed to fetch user SuperCoins" });
  }
}

async function addPoints(req, res) {
  try {
    const { userId, points, source = "manual", description } = req.body;

    if (!userId || !points || points <= 0) {
      return res.status(400).json({ error: "Valid userId and positive points are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { superCoins: points } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await SuperCoinTransaction.create({
      user: userId,
      points,
      type: "earned",
      source,
      description: description || `Manually added ${points} SuperCoins`,
      balanceAfter: user.superCoins,
    });

    await Notification.create({
      user: userId,
      title: "SuperCoins Earned",
      message: `You earned ${points} SuperCoins! Current balance: ${user.superCoins}`,
      type: "supercoins",
    });

    res.json({ success: true, data: { superCoins: user.superCoins } });
  } catch (err) {
    console.error("Add SuperCoins error:", err);
    res.status(500).json({ error: "Failed to add SuperCoins" });
  }
}

async function redeemPoints(req, res) {
  try {
    const { userId, points, description } = req.body;

    if (!userId || !points || points <= 0) {
      return res.status(400).json({ error: "Valid userId and positive points are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.superCoins < points) {
      return res.status(400).json({ error: "Insufficient SuperCoins" });
    }

    user.superCoins -= points;
    await user.save();

    await SuperCoinTransaction.create({
      user: userId,
      points,
      type: "redeemed",
      source: "redemption",
      description: description || `Redeemed ${points} SuperCoins`,
      balanceAfter: user.superCoins,
    });

    await Notification.create({
      user: userId,
      title: "SuperCoins Redeemed",
      message: `You redeemed ${points} SuperCoins. Remaining balance: ${user.superCoins}`,
      type: "supercoins",
    });

    res.json({ success: true, data: { superCoins: user.superCoins } });
  } catch (err) {
    console.error("Redeem SuperCoins error:", err);
    res.status(500).json({ error: "Failed to redeem SuperCoins" });
  }
}

async function getLeaderboard(req, res) {
  try {
    const { limit = 20 } = req.query;

    const topCustomers = await User.find({ role: "user", isActive: true })
      .sort({ superCoins: -1 })
      .limit(Number(limit))
      .select("name email phone superCoins totalSpent visitCount");

    res.json({ success: true, data: topCustomers });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}

module.exports = {
  getTransactions,
  getUserPoints,
  addPoints,
  redeemPoints,
  getLeaderboard,
};
