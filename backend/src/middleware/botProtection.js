const BLOCKED_UA_PATTERNS = [
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
  /\bscraper\b/i,
  /python-requests/i,
  /\bcurl\b/i,
  /\bwget\b/i,
  /\bhttpie\b/i,
  /\bpostman/i,
  /\binsomnia/i,
  /\bChatGPT/i,
  /\bGPTBot\b/i,
  /\bCCBot\b/i,
  /\bClaudeBot\b/i,
  /\bClaude-Web\b/i,
  /\bAnthropic/i,
  /\bGoogle-Extended/i,
  /\bBytespider\b/i,
  /\bPetalBot\b/i,
  /\bSemrush/i,
  /\bAhrefs/i,
  /\bDotBot\b/i,
  /\bMJ12bot\b/i,
  /\bYandexBot\b/i,
  /\bSogou/i,
  /\bBaidu/i,
  /\bApplebot\b/i,
  /\bDataForSeoBot\b/i,
  /\bHeadlessChrome\b/i,
  /\bPhantomJS\b/i,
  /\bSelenium\b/i,
  /\bPuppeteer\b/i,
  /\bPlaywright\b/i,
];

const ALLOWED_UA_PATTERNS = [
  /Googlebot/i,
  /Bingbot/i,
  /facebookexternalhit/i,
];

const suspiciousRequestTracker = new Map();
const TRACKER_CLEANUP_INTERVAL = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of suspiciousRequestTracker) {
    if (now - data.firstSeen > TRACKER_CLEANUP_INTERVAL) {
      suspiciousRequestTracker.delete(key);
    }
  }
}, TRACKER_CLEANUP_INTERVAL);

function botProtection(req, res, next) {
  if (req.path === "/api/health") return next();

  const ua = req.headers["user-agent"] || "";

  if (!ua || ua.length < 10) {
    return res.status(403).json({ error: "Access denied" });
  }

  const isAllowed = ALLOWED_UA_PATTERNS.some((p) => p.test(ua));
  if (!isAllowed) {
    const isBlocked = BLOCKED_UA_PATTERNS.some((p) => p.test(ua));
    if (isBlocked) {
      return res.status(403).json({ error: "Access denied" });
    }
  }

  const ip = req.ip;
  const tracker = suspiciousRequestTracker.get(ip) || {
    firstSeen: Date.now(),
    count: 0,
    flagged: false,
  };

  tracker.count++;

  if (tracker.count > 100 && Date.now() - tracker.firstSeen < 60 * 1000) {
    tracker.flagged = true;
  }

  suspiciousRequestTracker.set(ip, tracker);

  if (tracker.flagged) {
    return res.status(429).json({ error: "Suspicious activity detected, request blocked" });
  }

  next();
}

function honeypotCheck(fieldName = "_hp_field") {
  return (req, res, next) => {
    if (req.body && req.body[fieldName]) {
      console.warn(`Honeypot triggered from ${req.ip} on ${req.path}`);
      return res.status(200).json({ success: true, message: "Thank you!" });
    }
    next();
  };
}

function validateReferer(req, res, next) {
  if (req.method === "GET") return next();

  const referer = req.headers["referer"] || req.headers["origin"] || "";
  const allowedHosts = [
    "localhost",
    "habibsalonacademy.com",
    "www.habibsalonacademy.com",
    "ellieshairbeauty.com",
    "www.ellieshairbeauty.com",
  ];

  if (!referer) return next();

  try {
    const url = new URL(referer);
    if (!allowedHosts.includes(url.hostname)) {
      return res.status(403).json({ error: "Invalid request origin" });
    }
  } catch {
    // malformed referer
  }

  next();
}

module.exports = { botProtection, honeypotCheck, validateReferer };
