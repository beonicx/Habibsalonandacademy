const express = require("express");
const router = express.Router();
const { getMyMembership } = require("../../controllers/userapp/membershipController");
const { authenticateToken } = require("../../middleware/auth");

router.get("/my", authenticateToken, getMyMembership);

module.exports = router;
