const Membership = require("../../models/Membership");

const getMyMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user.id,
      status: "active",
    }).populate("plan", "name description price durationMonths discountPercent benefits");

    res.json({ success: true, data: membership });
  } catch (err) {
    console.error("Get membership error:", err);
    res.status(500).json({ error: "Failed to fetch membership" });
  }
};

module.exports = { getMyMembership };
