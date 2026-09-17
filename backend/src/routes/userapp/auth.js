const express = require("express");
const router = express.Router();
const { register, login, refreshToken, getProfile, updateProfile, googleAuth, forgotPassword, resetPassword, changePassword } = require("../../controllers/userapp/authController");
const { authenticateToken } = require("../../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", authenticateToken, changePassword);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;
