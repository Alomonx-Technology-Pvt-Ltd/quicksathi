import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  vertical: { type: String },
  type: { type: String, enum: ["SERVICE_ONLY", "PRODUCT_ONLY", "BOTH"], default: "SERVICE_ONLY" },
  imageUrl: { type: String, default: "" },
  secondaryImageUrl: { type: String, default: "" },
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
    vertical: {
      type: String,
      required: true,
      enum: ["WEDDING", "VEHICLE_RENTAL", "CCTV_SECURITY", "HOME_TUITION", "HOUSE_HELP", "HOME_SALON"],
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
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    subCategories: [subCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
