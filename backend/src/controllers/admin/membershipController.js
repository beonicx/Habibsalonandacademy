const MembershipPlan = require("../../models/MembershipPlan");
const Membership = require("../../models/Membership");
const User = require("../../models/User");
const Payment = require("../../models/Payment");
const Notification = require("../../models/Notification");

async function getAllPlans(req, res) {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const plans = await MembershipPlan.find(filter).sort({ sortOrder: 1, price: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ error: "Failed to fetch membership plans" });
  }
}

async function createPlan(req, res) {
  try {
    const { name, description, price, durationMonths, benefits, discountPercent, freeServices, superCoinsMultiplier, sortOrder } = req.body;

    if (!name || price === undefined || !durationMonths) {
      return res.status(400).json({ error: "Name, price and duration are required" });
    }

    const plan = await MembershipPlan.create({
      name,
      description,
      price,
      durationMonths,
      benefits,
      discountPercent,
      freeServices,
      superCoinsMultiplier,
      sortOrder,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    console.error("Create plan error:", err);
    res.status(500).json({ error: "Failed to create membership plan" });
  }
}

async function updatePlan(req, res) {
  try {
    const fields = ["name", "description", "price", "durationMonths", "benefits", "discountPercent", "freeServices", "superCoinsMultiplier", "isActive", "sortOrder"];
    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
}

async function deletePlan(req, res) {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ success: true, message: "Plan deactivated" });
  } catch (err) {
    console.error("Delete plan error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
}

async function getAllMembers(req, res) {
  try {
    const { page = 1, limit = 20, status, planId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (planId) filter.plan = planId;

    const skip = (Number(page) - 1) * Number(limit);

    const [memberships, total] = await Promise.all([
      Membership.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email phone")
        .populate("plan", "name price durationMonths"),
      Membership.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: memberships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
}

async function assignMembership(req, res) {
  try {
    const { userId, planId, paymentMethod } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ error: "User and plan are required" });
    }

    const [user, plan] = await Promise.all([
      User.findById(userId),
      MembershipPlan.findById(planId),
    ]);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const existingActive = await Membership.findOne({ user: userId, status: "active" });
    if (existingActive) {
      return res.status(400).json({ error: "User already has an active membership" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    let paymentId;
    if (paymentMethod) {
      const payment = await Payment.create({
        user: userId,
        amount: plan.price,
        method: paymentMethod,
        status: "completed",
        notes: `Membership: ${plan.name}`,
      });
      paymentId = payment._id;
      await User.findByIdAndUpdate(userId, { $inc: { totalSpent: plan.price } });
    }

    const freeServices = (plan.freeServices || []).map((fs) => ({
      service: fs.service,
      name: fs.name,
      remaining: fs.quantity,
    }));

    const membership = await Membership.create({
      user: userId,
      plan: planId,
      startDate,
      endDate,
      paymentId,
      remainingFreeServices: freeServices,
    });

    await Notification.create({
      user: userId,
      title: "Membership Activated",
      message: `Your ${plan.name} membership is now active until ${endDate.toLocaleDateString()}.`,
      type: "membership",
    });

    res.status(201).json({ success: true, data: membership });
  } catch (err) {
    console.error("Assign membership error:", err);
    res.status(500).json({ error: "Failed to assign membership" });
  }
}

async function cancelMembership(req, res) {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    ).populate("user", "name email");

    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }

    if (membership.user) {
      await Notification.create({
        user: membership.user._id,
        title: "Membership Cancelled",
        message: "Your membership has been cancelled.",
        type: "membership",
      });
    }

    res.json({ success: true, data: membership });
  } catch (err) {
    console.error("Cancel membership error:", err);
    res.status(500).json({ error: "Failed to cancel membership" });
  }
}

module.exports = {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllMembers,
  assignMembership,
  cancelMembership,
};
