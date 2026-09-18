const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const { validateEnv } = require("./config/env");
validateEnv();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const logger = require("./config/logger");

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
const isProduction = process.env.ENVIRONMENT === "production";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://habibsalonacademy.com",
  "https://www.habibsalonacademy.com",
  "https://ellieshairbeauty.com",
  "https://www.ellieshairbeauty.com",
];

app.set("trust proxy", 1);

app.use(compression());

app.use(
  cors({
    origin: function (origin, callback) {
      if (isProduction && !origin) {
        return callback(new Error("CORS not allowed"));
      }
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

app.use(securityHeaders());
app.use(securityLogger);
app.use(botProtection);
app.use(globalLimiter);
app.use(requestSizeLimiter("2mb"));

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

app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/contact", contactRouter);
app.use("/api/supercoins", supercoinsRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/memberships", membershipRouter);
app.use("/api/payments", paymentRouter);

app.use("/api/admin", adminRouter);

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus[dbState] || "unknown",
    environment: process.env.ENVIRONMENT || "development",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.message === "CORS not allowed") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled error");
  const status = err.status || 500;
  res.status(status).json({
    error: isProduction ? "Internal server error" : err.message,
  });
});

let server;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`API running on port ${PORT} [${process.env.ENVIRONMENT || "development"}]`);
  });
});

function gracefulShutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
      mongoose.connection.close(false).then(() => {
        logger.info("MongoDB connection closed");
        process.exit(0);
      });
    });
  }
  setTimeout(() => {
    logger.error("Forced shutdown — could not close connections in time");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

module.exports = app;
