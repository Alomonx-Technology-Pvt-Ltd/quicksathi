import "dotenv/config";
import "./config/validateEnv.js"; // exits in production if configuration is missing/unsafe
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import compression from "compression";
import connectDB from "./config/db.js";
import helmet from "helmet";
import { apiLimiter, credentialLimiter, authLimiter, contactLimiter, aiLimiter, couponLimiter, geoLimiter } from "./middleware/rateLimits.js";

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

// Behind Render's proxy: trust one hop so rate limits see the real client IP.
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());

// Enable gzip/brotli compression for optimized response speed & bandwidth
app.use(compression());

// ── CORS — allow local dev + production + all Vercel preview URLs ──
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
];

// Add the configured production URL if present (set CLIENT_URL in Render env vars)
if (process.env.CLIENT_URL) {
  ALLOWED_ORIGINS.push(process.env.CLIENT_URL);
}

// Add additional origins from comma-separated ADDITIONAL_ORIGINS env var
if (process.env.ADDITIONAL_ORIGINS) {
  process.env.ADDITIONAL_ORIGINS.split(",").forEach((o) => {
    const trimmed = o.trim();
    if (trimmed) ALLOWED_ORIGINS.push(trimmed);
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Allow any localhost / 127.0.0.1 port (e.g. 5173, 5174, 5175, 3000, 4173)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Check exact match against allowed list
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    // Allow any Vercel preview deployment URL for this project
    if (/^https:\/\/(tiptobook|quicksathi)[a-z0-9-]*\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }

    // Allow in non-production environments
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // Block everything else in production
    callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS for all routes explicitly
// Express 5 requires named wildcards — use /*path instead of *
app.options("/*path", cors(corsOptions));

// Razorpay webhook needs the exact raw bytes to verify its signature, so it is parsed
// before (and instead of) the JSON body parser.
app.use("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }));
// Large bodies only where base64 uploads happen (admin image upload, provider KYC); everything else is capped at 100 KB.
const bigJson = express.json({ limit: "10mb" });
app.use("/api/admin/upload", bigJson);
app.use("/api/providers/register", bigJson);
app.use(express.json({ limit: "100kb" }));
app.use("/api", apiLimiter);
app.use(["/api/auth/login", "/api/auth/provider-login", "/api/auth/admin-login"], credentialLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/contact", (req, res, next) => (req.method === "POST" ? contactLimiter(req, res, next) : next()));
app.use("/api/ai", aiLimiter);
app.use("/api/coupons/validate", couponLimiter);
app.use("/api/geo", geoLimiter);

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
      auth:       "POST /api/auth/login | /api/auth/register",
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
  app.listen(PORT, () => {
    console.log(`🚀 TiptoBook backend running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Allowed origins : ${ALLOWED_ORIGINS.join(", ")} + *.vercel.app previews`);

    // ── Self-ping keepalive (Render free tier) ──────────────────────────────
    // Render free plan sleeps after 15 minutes of inactivity (causes 30-60s cold starts).
    // Pinging every 14 minutes keeps the service warm at no extra cost.
    // Only runs in production — skipped in local dev to avoid noise.
    if (process.env.NODE_ENV === "production") {
      const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      setInterval(async () => {
        try {
          await fetch(`${RENDER_URL}/api/health`);
          console.log("🏓 Keepalive ping sent");
        } catch (err) {
          console.warn("Keepalive ping failed:", err.message);
        }
      }, 14 * 60 * 1000); // every 14 minutes
      console.log(`   Keepalive : pinging ${RENDER_URL}/api/health every 14 min`);
    }
  });
};

startServer();

