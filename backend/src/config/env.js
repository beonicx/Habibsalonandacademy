const REQUIRED_VARS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "SALON_EMAIL",
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables:\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }
}

module.exports = { validateEnv };
