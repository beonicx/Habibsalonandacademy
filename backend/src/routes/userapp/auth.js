const express = require("express");
const router = express.Router();
const { sendRegistrationOtp, register, login, refreshToken, getProfile, updateProfile, googleAuth, forgotPassword, resetPassword, changePassword } = require("../../controllers/userapp/authController");
const { authenticateToken } = require("../../middleware/auth");
const { authLimiter, otpLimiter } = require("../../middleware/rateLimiter");
const { honeypotCheck } = require("../../middleware/botProtection");

router.post("/send-registration-otp", otpLimiter, honeypotCheck(), sendRegistrationOtp);
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, honeypotCheck(), login);
router.post("/google", authLimiter, googleAuth);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/forgot-password", otpLimiter, honeypotCheck(), forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.put("/change-password", authenticateToken, changePassword);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;
