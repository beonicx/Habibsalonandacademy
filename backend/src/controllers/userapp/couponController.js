const Coupon = require("../../models/Coupon");

async function getAvailableCoupons(req, res) {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
    })
      .select("code description discountType discountValue maxDiscount minOrderAmount validTill applicableServices")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: coupons });
  } catch (err) {
    console.error("Get available coupons error:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
}

async function applyCoupon(req, res) {
  try {
    const { code, service } = req.body;
    const userId = req.user?.id;

    if (!code) {
      return res.status(400).json({ success: false, error: "Coupon code is required" });
    }

    const now = new Date();
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, error: "Invalid coupon code" });
    }

    if (now < coupon.validFrom || now > coupon.validTill) {
      return res.status(400).json({ success: false, error: "Coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: "Coupon usage limit reached" });
    }

    if (userId && coupon.perUserLimit) {
      const userUseCount = coupon.usedBy.filter((u) => u.user?.toString() === userId).length;
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

    const discountLabel =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% off${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""}`
        : `₹${coupon.discountValue} off`;

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description,
        discountLabel,
      },
    });
  } catch (err) {
    console.error("Apply coupon error:", err);
    res.status(500).json({ success: false, error: "Failed to apply coupon" });
  }
}

module.exports = { getAvailableCoupons, applyCoupon };
