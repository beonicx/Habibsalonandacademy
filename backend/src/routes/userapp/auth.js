const express = require("express");
const router = express.Router();
const { register, login, refreshToken, getProfile, updateProfile, googleAuth } = require("../../controllers/userapp/authController");
const { authenticateToken } = require("../../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/refresh-token", refreshToken);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;
