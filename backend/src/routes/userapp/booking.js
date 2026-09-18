const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/userapp/bookingController");
const { validateBooking } = require("../../middleware/validation");
const { optionalAuth } = require("../../middleware/auth");
const { bookingLimiter } = require("../../middleware/rateLimiter");
const { honeypotCheck } = require("../../middleware/botProtection");

router.post("/", bookingLimiter, optionalAuth, honeypotCheck(), validateBooking, bookingController.createBooking);
router.get("/", optionalAuth, bookingController.getAllBookings);
router.get("/:id", optionalAuth, bookingController.getBookingById);
router.patch("/:id/status", bookingController.updateBookingStatus);

module.exports = router;
