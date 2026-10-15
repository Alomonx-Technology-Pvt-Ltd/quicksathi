import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  vertical: { type: String },
  type: { type: String, enum: ["SERVICE_ONLY", "PRODUCT_ONLY", "BOTH"], default: "SERVICE_ONLY" },
  imageUrl: { type: String, default: "" },
  secondaryImageUrl: { type: String, default: "" },
  iconUrl: { type: String, default: "" },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Fixed list (owner decision 2026-10-11). Adding a vertical is a code change: update this list
    // and the dropdown in quicksathi_frontend/src/admin/pages/AdminCategories.jsx.
    vertical: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ["WEDDING", "VEHICLE_RENTAL", "CCTV_SECURITY", "HOME_TUITION", "HOUSE_HELP", "HOME_SALON", "HOUSE_SERVICES", "PAINTING", "AC_APPLIANCES", "CONSTRUCTION"],
    },
    type: {
      type: String,
      enum: ["SERVICE_ONLY", "PRODUCT_ONLY", "BOTH"],
      default: "BOTH",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    secondaryImageUrl: {
      type: String,
      default: "",
    },
    iconUrl: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // When true, this category's services show "Coming Soon" on the frontend
    // (cards are non-bookable and a coming-soon notice is displayed).
    comingSoon: {
      type: Boolean,
      default: false,
    },
    subCategories: [subCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
