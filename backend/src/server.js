const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const { securityHeaders, sanitizeInput, preventParameterPollution, requestSizeLimiter, securityLogger } = require("./middleware/security");
const { globalLimiter } = require("./middleware/rateLimiter");
const { botProtection, validateReferer } = require("./middleware/botProtection");

const authRouter = require("./routes/userapp/auth");
const servicesRouter = require("./routes/userapp/services");
const bookingRouter = require("./routes/userapp/booking");
const galleryRouter = require("./routes/userapp/gallery");
const contactRouter = require("./routes/userapp/contact");
const supercoinsRouter = require("./routes/userapp/supercoins");
const couponsRouter = require("./routes/userapp/coupons");
const membershipRouter = require("./routes/userapp/membership");
const paymentRouter = require("./routes/userapp/payment");

const adminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://habibsalonacademy.com",
  "https://www.habibsalonacademy.com",
  "https://ellieshairbeauty.com",
  "https://www.ellieshairbeauty.com",
];

app.set("trust proxy", 1);

app.use(securityHeaders());
app.use(securityLogger);
app.use(botProtection);
app.use(globalLimiter);
app.use(requestSizeLimiter("2mb"));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(sanitizeInput());
app.use(preventParameterPollution());
app.use(validateReferer);

app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  dotfiles: "deny",
  maxAge: "1d",
  etag: true,
  index: false,
}));

// User-facing routes
app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/contact", contactRouter);
app.use("/api/supercoins", supercoinsRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/memberships", membershipRouter);
app.use("/api/payments", paymentRouter);

// Admin routes
app.use("/api/admin", adminRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.message === "CORS not allowed") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.ENVIRONMENT === "production" ? "Internal server error" : err.message,
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT} [${process.env.ENVIRONMENT || "development"}]`);
  });
});
