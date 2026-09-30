import { Router } from "express";
import Banner from "../models/Banner.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = Router();

const DEFAULT_BANNERS = [
  {
    title: "Deep clean with foam-jet AC service",
    subtitle: "AC service, gas refill & doorstep repair",
    badge: "Top Summer Pick",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    cta: "BOOK",
    link: "/services/ac",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#0284c7",
    buttonText: "#ffffff",
    image: "/images/ac/foam-jet.webp",
    imageAlt: "Foam jet AC service deep cleaning",
    overlayGradient:
      "linear-gradient(90deg, rgba(8, 28, 48, 0.85) 0%, rgba(12, 38, 64, 0.70) 52%, rgba(12, 38, 64, 0.25) 82%, rgba(12, 38, 64, 0.05) 100%)",
    bgFallback: "#0d2b45",
    order: 0,
    isActive: true,
  },
  {
    title: "Home repairs at affordable prices",
    subtitle: "Electricians, plumbers & carpentry help",
    badge: "Home Essential",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    cta: "BOOK",
    link: "/category/house-services",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#0066cc",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Electrician home repairs",
    overlayGradient:
      "linear-gradient(90deg, rgba(2, 45, 102, 0.86) 0%, rgba(3, 62, 138, 0.70) 52%, rgba(3, 62, 138, 0.25) 82%, rgba(3, 62, 138, 0.05) 100%)",
    bgFallback: "#00488f",
    order: 1,
    isActive: true,
  },
  {
    title: "Glow at home with expert salon",
    subtitle: "Hair styling, facials, waxing & makeup",
    badge: "Salon at Home",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    cta: "BOOK",
    link: "/category/home-salon",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#be185d",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Home salon and beauty grooming",
    overlayGradient:
      "linear-gradient(90deg, rgba(76, 12, 48, 0.86) 0%, rgba(102, 18, 64, 0.70) 52%, rgba(102, 18, 64, 0.25) 82%, rgba(102, 18, 64, 0.05) 100%)",
    bgFallback: "#5c133a",
    order: 2,
    isActive: true,
  },
  {
    title: "Chauffeur & self-drive rentals",
    subtitle: "Sedans, SUVs & luxury wedding cars",
    badge: "Instant Booking",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    cta: "BOOK",
    link: "/category/vehicle-rental",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#1d4ed8",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Car rental fleet",
    overlayGradient:
      "linear-gradient(90deg, rgba(8, 20, 42, 0.88) 0%, rgba(12, 30, 62, 0.70) 52%, rgba(12, 30, 62, 0.25) 82%, rgba(12, 30, 62, 0.05) 100%)",
    bgFallback: "#091a38",
    order: 3,
    isActive: true,
  },
  {
    title: "Plan Your Perfect Wedding",
    subtitle: "Venues, decor, photo & catering",
    badge: "Grand Setup",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    cta: "BOOK",
    link: "/category/wedding",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#e11d48",
    buttonText: "#ffffff",
    image: "/banners/wedding_banner.webp",
    imageAlt: "Wedding and event arrangements",
    overlayGradient:
      "linear-gradient(90deg, rgba(76, 8, 24, 0.88) 0%, rgba(100, 10, 32, 0.70) 52%, rgba(100, 10, 32, 0.25) 82%, rgba(100, 10, 32, 0.05) 100%)",
    bgFallback: "#4c0818",
    order: 4,
    isActive: true,
  },
];

// Seed default banners once if table is empty
const ensureDefaultBanners = async () => {
  try {
    const count = await Banner.countDocuments();
    if (count === 0) {
      await Banner.insertMany(DEFAULT_BANNERS);
      console.log("✅ Default platform banners seeded successfully");
    }
  } catch (err) {
    console.warn("⚠️ Banner auto-seed skipped:", err.message);
  }
};
ensureDefaultBanners();

// GET /api/banners — Public list of active banners (lean & fast)
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/banners/admin — All banners for Admin Management
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const banners = await Banner.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/banners — Create a banner (Admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      badge,
      badgeBg,
      badgeColor,
      image,
      imageAlt,
      link,
      cta,
      textColor,
      subtitleColor,
      buttonBg,
      buttonText,
      bgFallback,
      overlayGradient,
      category,
      order,
      isActive,
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ message: "Title and Image are required" });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      badge: badge || "",
      badgeBg: badgeBg || "rgba(255, 255, 255, 0.22)",
      badgeColor: badgeColor || "#ffffff",
      image,
      imageAlt: imageAlt || title,
      link: link || "/services",
      cta: cta || "BOOK",
      textColor: textColor || "#ffffff",
      subtitleColor: subtitleColor || "rgba(255, 255, 255, 0.9)",
      buttonBg: buttonBg || "#0284c7",
      buttonText: buttonText || "#ffffff",
      bgFallback: bgFallback || "#0d2b45",
      overlayGradient:
        overlayGradient ||
        "linear-gradient(90deg, rgba(8, 28, 48, 0.85) 0%, rgba(12, 38, 64, 0.70) 52%, rgba(12, 38, 64, 0.25) 82%, rgba(12, 38, 64, 0.05) 100%)",
      category: category || "",
      order: Number(order) || 0,
      isActive: isActive !== false,
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/banners/:id — Update a banner (Admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/banners/:id/toggle — Toggle active state (Admin)
router.patch("/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ message: `Banner ${banner.isActive ? "activated" : "deactivated"}`, banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/banners/:id — Delete a banner (Admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
