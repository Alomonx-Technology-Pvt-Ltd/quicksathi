import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import Banner from "../models/Banner.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

// ── Default Carousel Banners (Homepage "Featured Services" slider) ──
const DEFAULT_CAROUSEL_BANNERS = [
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
    section: "carousel",
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
    section: "carousel",
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
    section: "carousel",
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
    section: "carousel",
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
    section: "carousel",
    order: 4,
    isActive: true,
  },
];

// ── Default Spotlight Promo Banners (Homepage large promo) ──
const DEFAULT_SPOTLIGHT_BANNERS = [
  {
    title: "Plan Your Perfect Wedding.",
    subtitle: "Venues • Decorators • Photographers • Makeup • Catering & More",
    tag: "Wedding & Celebration",
    tagBg: "rgba(225, 29, 72, 0.1)",
    tagColor: "#e11d48",
    headline: "Plan Your Perfect Wedding.",
    subheadLabel: "Find trusted services for your special day:",
    subheadItems: "Venues • Decorators • Photographers • Makeup • Catering & More",
    bullets: ["💍 Trusted Service Providers", "✨ Multiple Options", "📅 Easy Booking"],
    ctaText: "Book Wedding Services →",
    ctaLink: "/category/wedding",
    image: "/banners/wedding_banner.webp",
    bgFallback: "#fdf8f5",
    themeColor: "#be123c",
    buttonBg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
    buttonShadow: "0 6px 20px rgba(225, 29, 72, 0.35)",
    section: "spotlight",
    category: "wedding",
    order: 0,
    isActive: true,
  },
  {
    title: "Find trusted home tutors",
    subtitle: "Maths • Science • English • Computer • Other Subjects",
    tag: "Verified Expert Tutors",
    tagBg: "rgba(14, 165, 233, 0.12)",
    tagColor: "#0284c7",
    headline: "Find trusted home tutors for:",
    subheadLabel: "",
    subheadItems: "Maths • Science • English • Computer • Other Subjects",
    bullets: ["👨‍🏫 Experienced Tutors", "🏠 One-to-One Learning", "📚 Personalized Classes"],
    ctaText: "Book a Tutor Today →",
    ctaLink: "/category/home-tuition",
    image: "/banners/tuition_banner.webp",
    bgFallback: "#f0f9ff",
    themeColor: "#0284c7",
    buttonBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    buttonShadow: "0 6px 20px rgba(2, 132, 199, 0.35)",
    section: "spotlight",
    category: "tuition",
    order: 1,
    isActive: true,
  },
];

// ── Default Category Page Banners (shown on each category detail page) ──
const DEFAULT_CATEGORY_PAGE_BANNERS = [
  {
    title: "Keep Your Home Cool & Functional.",
    subtitle: "AC Foam Jet • Washing Machine • Refrigerator • Smart TV • Geyser",
    badge: "AC & Appliance Experts",
    badgeStyle: "bg-sky-100 text-sky-700 border-sky-200/80",
    headline: "Keep Your Home Cool & Functional.",
    subheadLabel: "Doorstep repair & deep servicing for all appliances:",
    subheadItems: "AC Foam Jet • Washing Machine • Refrigerator • Smart TV • Geyser",
    bullets: ["⚡ 30-Day Service Warranty", "🔧 Certified Expert Technicians", "🏷️ Upfront Transparent Pricing"],
    image: "/banners/ac_banner.webp",
    bgFallback: "#f0f9ff",
    borderColor: "border-sky-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(240, 249, 255, 0.90)",
    matchKeywords: ["ac", "appliance", "air conditioner", "ac_appliances"],
    section: "category_page",
    category: "ac",
    order: 0,
    isActive: true,
  },
  {
    title: "Plan Your Perfect Wedding.",
    subtitle: "Venues • Decorators • Photographers • Makeup • Catering & More",
    badge: "Wedding & Celebration",
    badgeStyle: "bg-rose-100 text-rose-700 border-rose-200/80",
    headline: "Plan Your Perfect Wedding.",
    subheadLabel: "Find trusted services for your special day:",
    subheadItems: "Venues • Decorators • Photographers • Makeup • Catering & More",
    bullets: ["💍 Trusted Service Providers", "✨ Multiple Options", "📅 Easy Booking"],
    image: "/banners/wedding_banner.webp",
    bgFallback: "#fdf8f5",
    borderColor: "border-rose-100/80",
    overlayLeft: "rgba(255, 255, 255, 0.96)",
    overlayMid: "rgba(253, 248, 245, 0.88)",
    matchKeywords: ["wedding", "party", "events", "celebration"],
    section: "category_page",
    category: "wedding",
    order: 1,
    isActive: true,
  },
  {
    title: "Find trusted home tutors for:",
    subtitle: "Maths • Science • English • Computer • Other Subjects",
    badge: "Verified Expert Tutors",
    badgeStyle: "bg-sky-100 text-sky-700 border-sky-200/80",
    headline: "Find trusted home tutors for:",
    subheadLabel: "",
    subheadItems: "Maths • Science • English • Computer • Other Subjects",
    bullets: ["👨‍🏫 Experienced Tutors", "🏠 One-to-One Learning", "📚 Personalized Classes"],
    image: "/banners/tuition_banner.webp",
    bgFallback: "#f0f9ff",
    borderColor: "border-sky-100/80",
    overlayLeft: "rgba(255, 255, 255, 0.96)",
    overlayMid: "rgba(240, 249, 255, 0.88)",
    matchKeywords: ["tuition", "tutor", "tution", "home_tuition"],
    section: "category_page",
    category: "tuition",
    order: 2,
    isActive: true,
  },
  {
    title: "Reliable Home Repairs at Honest Prices.",
    subtitle: "Electricians • Plumbers • Carpenters • CCTV Cameras • Smart Locks",
    badge: "Verified Home Repairs",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-200/80",
    headline: "Reliable Home Repairs at Honest Prices.",
    subheadLabel: "Expert doorstep solutions for your house:",
    subheadItems: "Electricians • Plumbers • Carpenters • CCTV Cameras • Smart Locks",
    bullets: ["🛡️ Verified Background-Checked Pros", "⏱️ 60-Minute Doorstep Arrival", "💯 100% Satisfaction Guarantee"],
    image: "/banners/repair_banner.webp",
    bgFallback: "#fffbeb",
    borderColor: "border-amber-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(255, 251, 235, 0.90)",
    matchKeywords: ["repair", "house-services", "house_services", "plumbing", "electrician", "carpentry", "cctv", "home-repair"],
    section: "category_page",
    category: "repair",
    order: 3,
    isActive: true,
  },
  {
    title: "Rent Your Ride With Total Peace of Mind.",
    subtitle: "Sedans • SUVs • Luxury Wedding Cars • Daily Self-Drive • Outstation",
    badge: "Chauffeur & Self-Drive",
    badgeStyle: "bg-indigo-100 text-indigo-700 border-indigo-200/80",
    headline: "Rent Your Ride With Total Peace of Mind.",
    subheadLabel: "Clean, insured cars & bikes for every journey:",
    subheadItems: "Sedans • SUVs • Luxury Wedding Cars • Daily Self-Drive • Outstation",
    bullets: ["🚗 Insured & Sanitized Fleet", "⚡ Instant Booking Confirmation", "📍 Free Doorstep Delivery & Pickup"],
    image: "/banners/rental_banner.webp",
    bgFallback: "#eef2ff",
    borderColor: "border-indigo-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(238, 242, 255, 0.90)",
    matchKeywords: ["vehicle-rental", "rental", "cars", "car", "bike", "vehicle", "vehicle_rental"],
    section: "category_page",
    category: "rental",
    order: 4,
    isActive: true,
  },
  {
    title: "Glow at Home With Top Beauty Experts.",
    subtitle: "Hair Styling • Facials & Clean-up • Waxing • Bridal Makeup • Manicure",
    badge: "Salon & Spa at Home",
    badgeStyle: "bg-pink-100 text-pink-700 border-pink-200/80",
    headline: "Glow at Home With Top Beauty Experts.",
    subheadLabel: "Professional parlour & grooming services at your doorstep:",
    subheadItems: "Hair Styling • Facials & Clean-up • Waxing • Bridal Makeup • Manicure",
    bullets: ["💄 100% Genuine Branded Products", "🧼 Single-Use Sealed Hygiene Kits", "👩‍🦰 Trained & Certified Beauticians"],
    image: "/banners/salon_banner.webp",
    bgFallback: "#fdf2f8",
    borderColor: "border-pink-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(253, 242, 248, 0.90)",
    matchKeywords: ["home-salon", "salon", "beauty", "home_salon", "makeup", "parlour"],
    section: "category_page",
    category: "salon",
    order: 5,
    isActive: true,
  },
  {
    title: "Verified Daily House Help & Cooking Experts.",
    subtitle: "All-Round Maids • Expert Cooks • Deep Cleaning • Babysitters • Elderly Care",
    badge: "Trusted Domestic Assistance",
    badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-200/80",
    headline: "Verified Daily House Help & Cooking Experts.",
    subheadLabel: "Dedicated domestic helpers tailored to your routine:",
    subheadItems: "All-Round Maids • Expert Cooks • Deep Cleaning • Babysitters • Elderly Care",
    bullets: ["👮 Police Verified & Document Checked", "🔄 Instant Replacement Guarantee", "⏰ Flexible Part-Time & Full-Time"],
    image: "/banners/help_banner.webp",
    bgFallback: "#f0fdf4",
    borderColor: "border-emerald-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(240, 253, 244, 0.90)",
    matchKeywords: ["house-help", "help", "maid", "cook", "house_help", "cleaning"],
    section: "category_page",
    category: "help",
    order: 6,
    isActive: true,
  },
  {
    title: "Transform Your Walls With Expert Finish.",
    subtitle: "Interior Painting • Exterior Weatherproof • Waterproofing • Texture Walls",
    badge: "Professional Home Painting",
    badgeStyle: "bg-orange-100 text-orange-800 border-orange-200/80",
    headline: "Transform Your Walls With Expert Finish.",
    subheadLabel: "Hassle-free interior & exterior painting with warranty:",
    subheadItems: "Interior Painting • Exterior Weatherproof • Waterproofing • Texture Walls",
    bullets: ["📐 Free On-Site Laser Measurement", "🎨 Asian Paints & Berger Authorized", "✨ Post-Paint Complete Cleanup"],
    image: "/banners/painting_banner.webp",
    bgFallback: "#fff7ed",
    borderColor: "border-orange-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(255, 247, 237, 0.90)",
    matchKeywords: ["painting", "paint"],
    section: "category_page",
    category: "painting",
    order: 7,
    isActive: true,
  },
];

// Seed default banners once if needed and ensure all sections have defaults
const ensureDefaultBanners = async () => {
  try {
    // If any legacy banner is missing section, default to carousel
    await Banner.updateMany({ section: { $exists: false } }, { $set: { section: "carousel" } });

    const allDefaults = [
      ...DEFAULT_CAROUSEL_BANNERS,
      ...DEFAULT_SPOTLIGHT_BANNERS,
      ...DEFAULT_CATEGORY_PAGE_BANNERS,
    ];

    let inserted = 0;
    for (const item of allDefaults) {
      const exists = await Banner.findOne({
        title: item.title,
        section: item.section || "carousel",
      });
      if (!exists) {
        await Banner.create(item);
        inserted++;
      }
    }
    if (inserted > 0) {
      console.log(`✅ Platform banner sync completed: ${inserted} new banner(s) seeded`);
    }
  } catch (err) {
    console.warn("⚠️ Banner auto-seed skipped:", err.message);
  }
};
ensureDefaultBanners();

// GET /api/banners — Public list of active banners (lean & fast)
// Supports ?section=carousel|spotlight|category_page to filter by type
router.get("/", async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.section) {
      if (req.query.section === "carousel") {
        filter.$or = [{ section: "carousel" }, { section: { $exists: false } }];
      } else {
        filter.section = req.query.section;
      }
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/banners/admin — All banners for Admin Management
// Supports ?section= filter
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.section) {
      filter.section = req.query.section;
    }
    const banners = await Banner.find(filter)
      .sort({ section: 1, order: 1, createdAt: -1 })
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
      section,
      // Spotlight fields
      tag,
      tagBg,
      tagColor,
      headline,
      subheadLabel,
      subheadItems,
      bullets,
      ctaText,
      ctaLink,
      themeColor,
      buttonShadow,
      // Category page fields
      badgeStyle,
      matchKeywords,
      borderColor,
      overlayLeft,
      overlayMid,
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
      section: section || "carousel",
      // Spotlight
      tag: tag || "",
      tagBg: tagBg || "rgba(14, 165, 233, 0.12)",
      tagColor: tagColor || "#0284c7",
      headline: headline || "",
      subheadLabel: subheadLabel || "",
      subheadItems: subheadItems || "",
      bullets: Array.isArray(bullets) ? bullets : [],
      ctaText: ctaText || "",
      ctaLink: ctaLink || "",
      themeColor: themeColor || "",
      buttonShadow: buttonShadow || "",
      // Category Page
      badgeStyle: badgeStyle || "",
      matchKeywords: Array.isArray(matchKeywords) ? matchKeywords : [],
      borderColor: borderColor || "",
      overlayLeft: overlayLeft || "rgba(255, 255, 255, 0.97)",
      overlayMid: overlayMid || "rgba(248, 250, 252, 0.90)",
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/banners/upload — Upload banner image directly to Cloudinary
router.post("/upload", protect, adminOnly, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image data provided" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary credentials are not configured in environment variables.");
      return res.status(500).json({ message: "Cloudinary storage is not properly configured on server." });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "TiptoBook",
      resource_type: "auto",
      timeout: 60000,
    });

    res.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("Cloudinary banner upload failed:", error);
    res.status(500).json({ message: error.message || "Failed to upload banner image" });
  }
});

// PUT /api/banners/:id — Update a banner (Admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
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
