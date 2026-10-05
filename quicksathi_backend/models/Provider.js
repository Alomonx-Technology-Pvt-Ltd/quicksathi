import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    categoryName: {
      type: String,
      default: "",
    },
    servicesOffered: [
      {
        type: String,
      },
    ],
    experience: {
      type: String,
      default: "",
    },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    // KYC documents are private: excluded from every query unless explicitly requested
    // with .select("+documents.idProof +documents.businessRegistration +documents.selfiePhoto +documents.other").
    documents: {
      idProof: { type: String, default: "", select: false },
      businessRegistration: { type: String, default: "", select: false },
      selfiePhoto: { type: String, default: "", select: false },
      other: { type: [String], select: false },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
    rating: {
      type: Number,
      default: 0,
    },
    totalBookings: {
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

const Provider = mongoose.model("Provider", providerSchema);
export default Provider;
