const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../../controllers/userapp/paymentController");
const { optionalAuth } = require("../../middleware/auth");

router.post("/create-order", optionalAuth, createOrder);
router.post("/verify", optionalAuth, verifyPayment);

module.exports = router;
