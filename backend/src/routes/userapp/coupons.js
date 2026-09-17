const express = require("express");
const router = express.Router();
const { getAvailableCoupons, applyCoupon } = require("../../controllers/userapp/couponController");
const { optionalAuth } = require("../../middleware/auth");

router.get("/available", getAvailableCoupons);
router.post("/apply", optionalAuth, applyCoupon);

module.exports = router;
