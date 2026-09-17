const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../../middleware/adminAuth");

router.use(authenticateAdmin);

router.use("/dashboard", require("./dashboard"));
router.use("/customers", require("./customers"));
router.use("/appointments", require("./appointments"));
router.use("/payments", require("./payments"));
router.use("/services", require("./services"));
router.use("/memberships", require("./memberships"));
router.use("/supercoins", require("./supercoins"));
router.use("/products", require("./products"));
router.use("/notifications", require("./notifications"));
router.use("/gallery", require("./gallery"));
router.use("/contacts", require("./contacts"));
router.use("/coupons", require("./coupons"));

module.exports = router;
