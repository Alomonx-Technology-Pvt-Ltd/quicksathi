import { Router } from "express";
import Coupon from "../models/Coupon.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { quote, PricingError } from "../services/pricing.js";

const router = Router();

// ── Default Initial Coupons to seed if table is empty ──
const DEFAULT_COUPONS = [
  {
    code: "WELCOME50",
    title: "Flat ₹50 OFF on First Booking",
    description: "Special welcome offer for new TiptoBook users on any service.",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 199,
    isActive: true,
  },
  {
    code: "QUICK100",
    title: "Flat ₹100 OFF on AC & Repairs",
    description: "Save ₹100 instantly on home repairs, AC servicing, and deep cleaning.",
    discountType: "fixed",
    discountValue: 100,
    minOrderAmount: 499,
    isActive: true,
  },
  {
    code: "FESTIVE15",
    title: "15% OFF (Up to ₹300)",
    description: "Get 15% discount on weddings, car rentals, and luxury salon packages.",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 1000,
    maxDiscountAmount: 300,
    isActive: true,
  },
];

// Dev-only: called from seed/seedData.js. Never run at import time (it resurrected coupons an admin had deleted).
export const ensureDefaultCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.insertMany(DEFAULT_COUPONS);
      console.log("✅ Default platform coupons & offers seeded");
    }
  } catch (err) {
    console.warn("⚠️ Coupon auto-seed skipped:", err.message);
  }
};
// (intentionally not invoked here)

// Bad input from an admin form is a 400, not a 500.
const failure = (res, error) => {
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: error.message });
};

// "2026-10-04" (date-only from <input type="date">) means the END of that day in IST.
const parseDateInput = (value, { endOfDay = false } = {}) => {
  if (value === null || value === "" || value === undefined) return null;
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+05:30`)
    : new Date(text);
  if (Number.isNaN(date.getTime())) {
    const err = new Error("Invalid date");
    err.name = "ValidationError";
    throw err;
  }
  return date;
};

// ── GET /api/coupons/active — Public list of available offers ──
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      $and: [
        { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
        { $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
      ],
    })
      .select("code title description discountType discountValue minOrderAmount maxDiscountAmount validUntil")
      .lean();

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/coupons/validate — Preview a coupon for a specific booking ──
// Same rules and price as booking creation (services/pricing.js); nothing is redeemed here.
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, serviceId, packageIndex, packageTitle, distanceKm } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ message: "Please enter a valid coupon code." });
    }

    const q = await quote({ serviceId, packageIndex, packageTitle, distanceKm, couponCode: code, userId: req.user._id });

    res.json({
      valid: true,
      coupon: {
        id: q.coupon._id,
        code: q.coupon.code,
        title: q.coupon.title,
        description: q.coupon.description,
        discountType: q.coupon.discountType,
        discountValue: q.coupon.discountValue,
      },
      originalAmount: q.originalAmount,
      discountAmount: q.discountAmount,
      finalAmount: q.amount,
      savingsMessage: `You save ₹${q.discountAmount.toLocaleString("en-IN")} with ${q.coupon.code}!`,
    });
  } catch (error) {
    if (error instanceof PricingError) return res.status(error.status).json({ message: error.message, ...error.extra });
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/coupons/admin — Full coupon management list with stats (Admin) ──
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .populate("usedBy.user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate aggregated stats
    const stats = {
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter((c) => c.isActive).length,
      totalRedemptions: coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0),
      totalDiscountGiven: coupons.reduce(
        (sum, c) =>
          sum + (c.usedBy || []).reduce((subSum, u) => subSum + (u.discountApplied || 0), 0),
        0
      ),
    };

    res.json({ coupons, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/coupons — Create a new Coupon / Offer (Admin) ──
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      isActive,
      usageLimit,
    } = req.body;

    if (!code || !title || discountValue === undefined) {
      return res.status(400).json({ message: "Code, Title, and Discount Value are required." });
    }

    const cleanCode = String(code).trim().toUpperCase();

    // Check if code already exists
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon with code '${cleanCode}' already exists.` });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      title: String(title).trim(),
      description: description || "",
      discountType: discountType || "fixed",
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      validFrom: parseDateInput(validFrom) || new Date(),
      validUntil: parseDateInput(validUntil, { endOfDay: true }),
      isActive: isActive !== false,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    res.status(201).json(coupon);
  } catch (error) {
    failure(res, error);
  }
});

// ── PUT /api/coupons/:id — Update coupon (Admin) ──
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      isActive,
      usageLimit,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (code) {
      const cleanCode = String(code).trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const conflict = await Coupon.findOne({ code: cleanCode, _id: { $ne: coupon._id } });
        if (conflict) {
          return res.status(400).json({ message: `Code '${cleanCode}' already in use by another coupon.` });
        }
        coupon.code = cleanCode;
      }
    }

    if (title) coupon.title = String(title).trim();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    }
    if (validFrom !== undefined) coupon.validFrom = parseDateInput(validFrom) || new Date();
    if (validUntil !== undefined) coupon.validUntil = parseDateInput(validUntil, { endOfDay: true });
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    }

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    failure(res, error);
  }
});

// ── PATCH /api/coupons/:id/toggle — Toggle active state (Admin) ──
router.patch("/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/coupons/:id — Delete coupon (Admin) ──
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
