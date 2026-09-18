const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const User = require("../../models/User");

const COIN_VALUE = 1;

async function getMyCoins(req, res) {
  try {
    const user = await User.findById(req.user.id).select("superCoins");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const history = await SuperCoinTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("points type source description balanceAfter createdAt");

    const stats = await SuperCoinTransaction.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$type", total: { $sum: "$points" } } },
    ]);

    const totalEarned = stats.find((s) => s._id === "earned")?.total || 0;
    const totalRedeemed = stats.find((s) => s._id === "redeemed")?.total || 0;

    res.json({
      success: true,
      data: {
        balance: user.superCoins,
        totalEarned,
        totalRedeemed,
        coinValue: COIN_VALUE,
        history,
      },
    });
  } catch (err) {
    console.error("Get my SuperCoins error:", err);
    res.status(500).json({ error: "Failed to fetch SuperCoins" });
  }
}

module.exports = { getMyCoins, COIN_VALUE };
