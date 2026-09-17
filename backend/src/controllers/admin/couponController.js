const Coupon = require("../../models/Coupon");

async function getAllCoupons(req, res) {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const filter = {};
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Coupon.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error("Get coupons error:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
}

async function createCoupon(req, res) {
  try {
    const { code, description, discountType, discountValue, maxDiscount, minOrderAmount, validFrom, validTill, usageLimit, perUserLimit, applicableServices } = req.body;

    if (!code || !discountType || discountValue == null || !validTill) {
      return res.status(400).json({ error: "Code, discountType, discountValue and validTill are required" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minOrderAmount: minOrderAmount || 0,
      validFrom: validFrom || new Date(),
      validTill,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit ?? 1,
      applicableServices: applicableServices || [],
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    console.error("Create coupon error:", err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
}

async function updateCoupon(req, res) {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error("Update coupon error:", err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
}

async function deleteCoupon(req, res) {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    console.error("Delete coupon error:", err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
}

module.exports = { getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
