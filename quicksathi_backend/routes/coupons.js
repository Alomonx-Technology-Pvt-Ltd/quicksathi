import { Router } from "express";
import Coupon from "../models/Coupon.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

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

const ensureDefaultCoupons = async () => {
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
ensureDefaultCoupons();

// ── GET /api/coupons/active — Public list of available offers ──
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    })
      .select("code title description discountType discountValue minOrderAmount maxDiscountAmount validUntil")
      .lean();

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/coupons/validate — Validate and apply coupon for authenticated user ──
// Strictly enforces ONE-TIME-PER-USER rule
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    const userId = req.user._id.toString();

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Please enter a valid coupon code." });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ message: `Coupon code '${cleanCode}' does not exist.` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is currently inactive or disabled." });
    }

    // Check expiry
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired." });
    }

    // Check overall platform usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon has reached its maximum global usage limit." });
    }

    // ── STRICT AUTH CHECK: One user can apply a coupon only ONE time ──
    const alreadyUsed = coupon.usedBy?.some(
      (entry) => entry.user && entry.user.toString() === userId
    );

    if (alreadyUsed) {
      return res.status(400).json({
        message: "You have already used this coupon code. Each coupon can only be applied once per user.",
        alreadyUsed: true,
      });
    }

    // Check minimum order value
    const amountNum = Number(orderAmount) || 0;
    if (coupon.minOrderAmount && amountNum < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum booking amount of ₹${coupon.minOrderAmount.toLocaleString()} required to use this coupon.`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((amountNum * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount discount
      discountAmount = Math.min(coupon.discountValue, amountNum);
    }

    const finalAmount = Math.max(0, amountNum - discountAmount);

    res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
      finalAmount,
      savingsMessage: `You save ₹${discountAmount.toLocaleString()} with ${coupon.code}!`,
    });
  } catch (error) {
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

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon with code '${cleanCode}' already exists.` });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      title: title.trim(),
      description: description || "",
      discountType: discountType || "fixed",
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive !== false,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      validUntil,
      isActive,
      usageLimit,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const conflict = await Coupon.findOne({ code: cleanCode, _id: { $ne: coupon._id } });
        if (conflict) {
          return res.status(400).json({ message: `Code '${cleanCode}' already in use by another coupon.` });
        }
        coupon.code = cleanCode;
      }
    }

    if (title) coupon.title = title.trim();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    }
    if (validUntil !== undefined) {
      coupon.validUntil = validUntil ? new Date(validUntil) : null;
    }
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    }

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
