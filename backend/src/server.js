const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRouter = require("./routes/userapp/auth");
const servicesRouter = require("./routes/userapp/services");
const bookingRouter = require("./routes/userapp/booking");
const galleryRouter = require("./routes/userapp/gallery");
const contactRouter = require("./routes/userapp/contact");
const supercoinsRouter = require("./routes/userapp/supercoins");
const couponsRouter = require("./routes/userapp/coupons");

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
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// User-facing routes
app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/contact", contactRouter);
app.use("/api/supercoins", supercoinsRouter);
app.use("/api/coupons", couponsRouter);

// Admin routes
app.use("/api/admin", adminRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Ellie's Hair & Beauty API running on port ${PORT}`);
  });
});
