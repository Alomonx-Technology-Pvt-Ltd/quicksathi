import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    // ── Common Fields (used by all banner sections) ──
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    badgeBg: {
      type: String,
      default: "rgba(255, 255, 255, 0.22)",
    },
    badgeColor: {
      type: String,
      default: "#ffffff",
    },
    image: {
      type: String,
      required: [true, "Banner image URL is required"],
    },
    imageAlt: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "/services",
      trim: true,
    },
    cta: {
      type: String,
      default: "BOOK",
      trim: true,
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },
    subtitleColor: {
      type: String,
      default: "rgba(255, 255, 255, 0.9)",
    },
    buttonBg: {
      type: String,
      default: "#0284c7",
    },
    buttonText: {
      type: String,
      default: "#ffffff",
    },
    bgFallback: {
      type: String,
      default: "#0d2b45",
    },
    overlayGradient: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Section: which area of the site this banner appears in ──
    // "carousel"      → Homepage Featured Services carousel (CategoryBannersCarousel)
    // "spotlight"     → Homepage Spotlight Promo Banners (SpotlightPromoBanners)
    // "category_page" → Individual category pages (CategorySpotlightBanner)
    section: {
      type: String,
      enum: ["carousel", "spotlight", "category_page"],
      default: "carousel",
    },

    // ── Spotlight Promo Banner Fields ──
    tag: {
      type: String,
      default: "",
      trim: true,
    },
    tagBg: {
      type: String,
      default: "rgba(14, 165, 233, 0.12)",
    },
    tagColor: {
      type: String,
      default: "#0284c7",
    },
    headline: {
      type: String,
      default: "",
      trim: true,
    },
    subheadLabel: {
      type: String,
      default: "",
      trim: true,
    },
    subheadItems: {
      type: String,
      default: "",
      trim: true,
    },
    // Bullet points stored as array of strings (e.g. ["💍 Trusted Providers", "✨ Multiple Options"])
    bullets: {
      type: [String],
      default: [],
    },
    ctaText: {
      type: String,
      default: "",
      trim: true,
    },
    ctaLink: {
      type: String,
      default: "",
      trim: true,
    },
    themeColor: {
      type: String,
      default: "",
    },
    buttonShadow: {
      type: String,
      default: "",
    },

    // ── Category Page Spotlight Fields ──
    badgeStyle: {
      type: String,
      default: "",
      trim: true,
    },
    matchKeywords: {
      type: [String],
      default: [],
    },
    borderColor: {
      type: String,
      default: "",
    },
    overlayLeft: {
      type: String,
      default: "rgba(255, 255, 255, 0.97)",
    },
    overlayMid: {
      type: String,
      default: "rgba(248, 250, 252, 0.90)",
    },
  },
  {
    timestamps: true,
  }
);

// Index for high-performance sorting of active banners
bannerSchema.index({ isActive: 1, section: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
