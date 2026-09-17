const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/userapp/bookingController");
const { validateBooking } = require("../../middleware/validation");
const { optionalAuth } = require("../../middleware/auth");

router.post("/", optionalAuth, validateBooking, bookingController.createBooking);
router.get("/", optionalAuth, bookingController.getAllBookings);
router.get("/:id", optionalAuth, bookingController.getBookingById);
router.patch("/:id/status", bookingController.updateBookingStatus);

module.exports = router;
