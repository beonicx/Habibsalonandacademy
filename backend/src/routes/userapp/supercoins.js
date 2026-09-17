const express = require("express");
const router = express.Router();
const { getMyCoins } = require("../../controllers/userapp/superCoinsController");
const { authenticateToken } = require("../../middleware/auth");

router.get("/my", authenticateToken, getMyCoins);

module.exports = router;
