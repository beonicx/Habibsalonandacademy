const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../../controllers/userapp/paymentController");
const { optionalAuth } = require("../../middleware/auth");
const { paymentLimiter } = require("../../middleware/rateLimiter");

router.post("/create-order", paymentLimiter, optionalAuth, createOrder);
router.post("/verify", paymentLimiter, optionalAuth, verifyPayment);

module.exports = router;
