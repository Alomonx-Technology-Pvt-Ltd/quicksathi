import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Coupon title or offer name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount value must be at least 1"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Cap for percentage discount (e.g. 20% up to ₹500)
      min: [0, "Maximum discount cannot be negative"],
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // Total platform usage limit across all users
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    // Strictly tracks which users have redeemed this coupon (one time per user enforcement)
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        },
        discountApplied: {
          type: Number,
          default: 0,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

couponSchema.pre("validate", function (next) {
  if (this.discountType === "percentage" && this.discountValue > 100) {
    this.invalidate("discountValue", "A percentage discount can't exceed 100");
  }
  if (this.validFrom && this.validUntil && this.validUntil <= this.validFrom) {
    this.invalidate("validUntil", "Expiry must be after the start date");
  }
  next();
});

// High-speed indices for active coupons and user redemption checks (code index is handled by unique: true)
couponSchema.index({ isActive: 1, validUntil: 1 });
couponSchema.index({ "usedBy.user": 1 });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
