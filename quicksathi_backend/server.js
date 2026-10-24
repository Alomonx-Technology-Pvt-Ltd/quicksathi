import "dotenv/config";
import "./config/validateEnv.js"; // exits in production if configuration is missing/unsafe
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import compression from "compression";
import connectDB from "./config/db.js";
import helmet from "helmet";
import { apiLimiter, credentialLimiter, authLimiter, contactLimiter, aiLimiter, couponLimiter, geoLimiter, nominatimLimiter } from "./middleware/rateLimits.js";
import { trustProxySetting, makeOriginChecker } from "./config/hosting.js";
import { protect } from "./middleware/auth.js";
import { adminOnly } from "./middleware/admin.js";

// Import routes
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import serviceRoutes from "./routes/services.js";
import bookingRoutes from "./routes/bookings.js";
import providerRoutes from "./routes/providers.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payments.js";
import notificationRoutes from "./routes/notifications.js";
import contactRoutes from "./routes/contact.js";
import aiRoutes from "./routes/ai.js";
import bannerRoutes from "./routes/banners.js";
import couponRoutes from "./routes/coupons.js";
import geoRoutes from "./routes/geo.js";

const app = express();
const PORT = process.env.PORT || 5050; // 5000 is taken by macOS AirPlay Receiver on developer machines

// Number of reverse proxies in front of the app (TRUST_PROXY, default 1) so rate limits see the real client IP.
app.set("trust proxy", trustProxySetting());
app.disable("x-powered-by");
// One-time check that TRUST_PROXY matches the host's proxy hops: req.ip must be the client, not a proxy,
// or every user would share one rate-limit bucket. Look for this line in the server log after deploy.
if (process.env.NODE_ENV === "production") {
  let logged = false;
  app.use((req, _res, next) => {
    if (!logged) {
      logged = true;
      console.log(`trust-proxy check: req.ip=${req.ip} hops=${JSON.stringify(req.ips)} xff=${req.get("x-forwarded-for") || "-"}`);
    }
    next();
  });
}
app.use(helmet());

// Enable gzip/brotli compression for optimized response speed & bandwidth
app.use(compression());

// ── CORS — origins come from env (config/hosting.js): CLIENT_URL, CORS_ORIGINS, CORS_ORIGIN_PATTERNS ──
const isAllowedOrigin = makeOriginChecker();

const corsOptions = {
  origin: (origin, callback) =>
    isAllowedOrigin(origin) ? callback(null, true) : callback(new Error(`CORS: Origin '${origin}' is not allowed.`)),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS for all routes explicitly
// Express 5 requires named wildcards — use /*path instead of *
app.options("/*path", cors(corsOptions));

// Rate limits run before any body is read, so a flood of large bodies is cut off cheaply.
app.use("/api", apiLimiter);
app.use(["/api/auth/login", "/api/auth/provider-login", "/api/auth/admin-login"], credentialLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/contact", (req, res, next) => (req.method === "POST" ? contactLimiter(req, res, next) : next()));
app.use("/api/ai", aiLimiter);
app.use("/api/coupons/validate", couponLimiter);
app.use("/api/geo", geoLimiter);
app.use("/api/geo/nominatim", nominatimLimiter);

// Razorpay webhook needs the exact raw bytes to verify its signature, so it is parsed
// before (and instead of) the JSON body parser.
app.use("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }));
// Large bodies only where base64 uploads happen (admin image upload, provider KYC), and only after the
// caller is signed in (and an admin, for uploads): anonymous requests never get a 10 MB body parsed.
// Everything else is capped at 100 KB.
const bigJson = express.json({ limit: "10mb" });
app.use("/api/admin/upload", protect, adminOnly, bigJson);
app.use("/api/providers/register", protect, bigJson);
app.use(express.json({ limit: "100kb" }));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/geo", geoRoutes);

// ── Root route — friendly API info ──
app.get("/", (req, res) => {
  res.json({
    name: "TiptoBook API",
    status: "🟢 Running",
    version: "1.0.0",
    message: "Welcome to the TiptoBook backend. Use /api/* endpoints to interact with the API.",
    endpoints: {
      health:     "GET /api/health",
      auth:       "POST /api/auth/google | /api/auth/phone | /api/auth/login",
      categories: "GET /api/categories",
      services:   "GET /api/services",
      bookings:   "GET /api/bookings",
      providers:  "GET /api/providers",
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Health check ──
app.get("/api/health", (req, res) => {
  // 503 while the database is not connected, so the host's health check restarts/avoids this instance.
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? "ok" : "degraded",
    db: dbUp ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  // Return CORS errors as 403
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ message: err.message });
  }
  // Client errors raised by middleware (body too large, malformed JSON, ...) keep their own 4xx status.
  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500) {
    return res.status(status).json({ message: err.type === "entity.too.large" ? "Request body too large" : "Invalid request" });
  }
  console.error("Server error:", err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ── Start server ──
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 TiptoBook backend running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Allowed origins : ${isAllowedOrigin.describe()}`);

    // ── Optional self-ping keepalive ─────────────────────────────────────────
    // Free tiers on some hosts (e.g. Render) sleep after ~15 idle minutes, causing 30-60 s cold starts.
    // Set SELF_PING_URL to this service's public URL to ping /api/health every 14 minutes.
    // Leave it unset on hosts that don't sleep (Railway, paid plans, a VPS).
    const selfPingUrl = (process.env.SELF_PING_URL || "").replace(/\/+$/, "");
    if (selfPingUrl) {
      setInterval(async () => {
        try {
          await fetch(`${selfPingUrl}/api/health`);
        } catch (err) {
          console.warn("Keepalive ping failed:", err.message);
        }
      }, 14 * 60 * 1000);
      console.log(`   Keepalive : pinging ${selfPingUrl}/api/health every 14 min`);
    }
  });

  // Hosts stop the old instance with SIGTERM on every deploy. Finish requests already in flight
  // (payment verify, webhooks) instead of being killed mid-write; give up after 10 s.
  let stopping = false;
  const shutdown = (signal) => {
    if (stopping) return;
    stopping = true;
    console.log(`${signal} received: closing the server`);
    setTimeout(() => process.exit(1), 10_000).unref();
    server.close(async () => {
      await mongoose.connection.close().catch(() => {});
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer();

