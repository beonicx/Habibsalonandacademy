const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getUserPoints,
  addPoints,
  redeemPoints,
  getLeaderboard,
} = require("../../controllers/admin/superCoinsController");

router.get("/transactions", getTransactions);
router.get("/leaderboard", getLeaderboard);
router.get("/user/:userId", getUserPoints);
router.post("/add", addPoints);
router.post("/redeem", redeemPoints);

module.exports = router;
