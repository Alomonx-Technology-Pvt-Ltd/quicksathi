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

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// ── Start server ──
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 QuickSathi backend running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
