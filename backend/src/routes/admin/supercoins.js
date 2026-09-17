const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getUserPoints,
  addPoints,
  redeemPoints,
  getLeaderboard,
  editUserCoins,
  getCustomerEmails,
} = require("../../controllers/admin/superCoinsController");

router.get("/transactions", getTransactions);
router.get("/leaderboard", getLeaderboard);
router.get("/customers", getCustomerEmails);
router.get("/user/:userId", getUserPoints);
router.post("/add", addPoints);
router.post("/redeem", redeemPoints);
router.put("/edit", editUserCoins);

module.exports = router;
