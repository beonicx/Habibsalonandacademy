const express = require("express");
const router = express.Router();
const { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../../controllers/admin/couponController");

router.get("/", getAllCoupons);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
