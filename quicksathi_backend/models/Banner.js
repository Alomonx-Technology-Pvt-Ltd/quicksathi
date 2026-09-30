import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Index for high-performance sorting of active banners
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
