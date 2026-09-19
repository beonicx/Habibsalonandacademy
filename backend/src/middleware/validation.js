const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateBooking = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required")
    .matches(/^\d{10}$/).withMessage("Phone number must be exactly 10 digits"),
  body("service").trim().notEmpty().withMessage("Service is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("time").trim().notEmpty().withMessage("Time is required"),
  handleValidationErrors,
];

const validateContact = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 characters"),
  handleValidationErrors,
];

module.exports = { validateBooking, validateContact };
