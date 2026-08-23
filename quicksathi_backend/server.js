import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

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

const app = express();
const PORT = process.env.PORT || 5000;

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

    // Check exact match against allowed list
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    // Allow any Vercel preview deployment URL for this project
    // Pattern: https://quicksathi[anything].vercel.app
    if (/^https:\/\/quicksathi[a-z0-9-]*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Block everything else
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

app.use(express.json({ limit: "10mb" }));

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

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
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
  console.error("Server error:", err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ── Start server ──
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 QuickSathi backend running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Allowed origins : ${ALLOWED_ORIGINS.join(", ")} + *.vercel.app previews`);
  });
};

startServer();
