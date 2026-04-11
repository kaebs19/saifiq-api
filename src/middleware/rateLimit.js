const rateLimit = require('express-rate-limit');

const arabicMessage = (msg) => ({
  success: false,
  message: msg,
  data: null,
  errors: null,
});

// Global limiter — 200 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: arabicMessage('\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u062D\u062F \u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u062D\u0627\u0648\u0644 \u0644\u0627\u062D\u0642\u0627\u064B'),
});

// Auth limiter — 10 attempts / 15 min per IP (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: arabicMessage('\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u062A\u0633\u062C\u064A\u0644 \u0643\u062B\u064A\u0631\u0629\u060C \u0627\u0646\u062A\u0638\u0631 15 \u062F\u0642\u064A\u0642\u0629'),
  skipSuccessfulRequests: true,
});

// AI limiter — 5 requests / min per IP (expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: arabicMessage('\u062D\u062F \u0637\u0644\u0628\u0627\u062A AI: 5 \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629. \u0627\u0646\u062A\u0638\u0631 \u0642\u0644\u064A\u0644\u0627\u064B'),
});

module.exports = { globalLimiter, authLimiter, aiLimiter };
