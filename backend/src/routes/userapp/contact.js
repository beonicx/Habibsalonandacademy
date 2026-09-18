const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/userapp/contactController");
const { validateContact } = require("../../middleware/validation");
const { contactLimiter } = require("../../middleware/rateLimiter");
const { honeypotCheck } = require("../../middleware/botProtection");

router.post("/", contactLimiter, honeypotCheck(), validateContact, contactController.sendMessage);

module.exports = router;
