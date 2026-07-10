import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const providerRefSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  experience: { type: String, default: "" },
  location: { type: String, default: "" },
  startingPrice: { type: Number, default: 0 },
  image: { type: String, default: "" },
});

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
    },
    fullDescription: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    gallery: [{ type: String }],
    startingPrice: {
      type: Number,
      required: true,
    },
    priceUnit: {
      type: String,
      default: "per service",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    experience: {
      type: String,
      default: "",
    },
    available: {
      type: Boolean,
      default: true,
    },
    serviceMode: {
      type: String,
      enum: ["ON_SITE", "AT_HOME", "RENTAL", "REMOTE"],
      default: "ON_SITE",
    },
    tags: [{ type: String }],
    featured: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // admin-created services are auto-approved
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    packages: [packageSchema],
    faqs: [faqSchema],
    reviews: [reviewSchema],
    providers: [providerRefSchema],
  },
  {
    timestamps: true,
  }
);

// Text index for search
serviceSchema.index({ name: "text", shortDescription: "text", tags: "text" });

const Service = mongoose.model("Service", serviceSchema);
export default Service;
