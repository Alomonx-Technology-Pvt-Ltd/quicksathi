import rateLimit from "express-rate-limit";

// Per-IP limits (behind Render's proxy: app.set("trust proxy", 1) in server.js).
const make = ({ windowMs, limit, message, ...rest }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message },
    ...rest,
  });

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Whole API: generous, stops scripted hammering.
export const apiLimiter = make({ windowMs: MINUTE, limit: 600, message: "Too many requests. Please slow down." });

// Credential guessing: only FAILED attempts count, so normal users are never affected.
export const credentialLimiter = make({
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed sign-in attempts. Try again in 15 minutes.",
});

// Account creation / federated sign-in.
export const authLimiter = make({ windowMs: MINUTE, limit: 30, message: "Too many sign-in requests. Please wait a minute." });

export const contactLimiter = make({ windowMs: HOUR, limit: 5, message: "Too many messages. Please try again later." });
export const aiLimiter = make({ windowMs: HOUR, limit: 20, message: "Chat limit reached. Please try again later." });
export const couponLimiter = make({ windowMs: MINUTE, limit: 10, message: "Too many coupon attempts. Please wait a minute." });
export const geoLimiter = make({ windowMs: MINUTE, limit: 60, message: "Too many location lookups. Please slow down." });
