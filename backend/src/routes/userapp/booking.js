const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/userapp/bookingController");
const { validateBooking } = require("../../middleware/validation");
const { authenticateToken, optionalAuth } = require("../../middleware/auth");
const { bookingLimiter } = require("../../middleware/rateLimiter");
const { honeypotCheck } = require("../../middleware/botProtection");

router.get("/slots", bookingController.getBookedSlots);
router.post("/", bookingLimiter, optionalAuth, honeypotCheck(), validateBooking, bookingController.createBooking);
router.get("/", authenticateToken, bookingController.getAllBookings);
router.get("/:id", authenticateToken, bookingController.getBookingById);
router.patch("/:id/status", authenticateToken, bookingController.updateBookingStatus);

module.exports = router;
