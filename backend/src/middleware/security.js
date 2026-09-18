const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const logger = require("../config/logger");

function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

function sanitizeInput() {
  return mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      logger.warn({ ip: req.ip, key }, "NoSQL injection attempt blocked");
    },
  });
}

function preventParameterPollution() {
  return hpp({
    whitelist: ["service", "date", "status", "tags"],
  });
}

function requestSizeLimiter(maxSize = "1mb") {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    const maxBytes = parseSize(maxSize);
    if (contentLength > maxBytes) {
      return res.status(413).json({ error: "Request payload too large" });
    }
    next();
  };
}

function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = String(size).match(/^(\d+)(b|kb|mb|gb)?$/i);
  if (!match) return 1024 * 1024;
  return parseInt(match[1], 10) * (units[match[2]?.toLowerCase() || "b"] || 1);
}

function securityLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logger.warn({
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ua: (req.headers["user-agent"] || "").substring(0, 100),
      }, "Security event");
    }
  });

  next();
}

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts) {
    if (now - data.firstAttempt > LOGIN_WINDOW_MS + LOCKOUT_DURATION_MS) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkAccountLockout(identifier) {
  const data = loginAttempts.get(identifier);
  if (!data) return { locked: false };

  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    const remainingMs = data.lockedUntil - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    return { locked: true, remainingMin };
  }

  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    loginAttempts.delete(identifier);
    return { locked: false };
  }

  return { locked: false };
}

function recordFailedLogin(identifier) {
  const data = loginAttempts.get(identifier) || {
    attempts: 0,
    firstAttempt: Date.now(),
  };

  data.attempts++;

  if (data.attempts >= MAX_LOGIN_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    logger.warn({ identifier, attempts: data.attempts }, "Account locked after failed attempts");
  }

  loginAttempts.set(identifier, data);
}

function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

const otpAttempts = new Map();
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 30 * 60 * 1000;

function checkOtpLockout(identifier) {
  const data = otpAttempts.get(identifier);
  if (!data) return { locked: false };

  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return { locked: true };
  }

  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    otpAttempts.delete(identifier);
    return { locked: false };
  }

  return { locked: false };
}

function recordFailedOtp(identifier) {
  const data = otpAttempts.get(identifier) || { attempts: 0 };
  data.attempts++;

  if (data.attempts >= MAX_OTP_ATTEMPTS) {
    data.lockedUntil = Date.now() + OTP_LOCKOUT_MS;
    logger.warn({ identifier, attempts: data.attempts }, "OTP locked after failed attempts");
  }

  otpAttempts.set(identifier, data);
}

function clearOtpAttempts(identifier) {
  otpAttempts.delete(identifier);
}

module.exports = {
  securityHeaders,
  sanitizeInput,
  preventParameterPollution,
  requestSizeLimiter,
  securityLogger,
  checkAccountLockout,
  recordFailedLogin,
  clearLoginAttempts,
  checkOtpLockout,
  recordFailedOtp,
  clearOtpAttempts,
};
