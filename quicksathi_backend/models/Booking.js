import crypto from "node:crypto";
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },
    serviceName: {
      type: String,
      required: true,
    },
    packageTitle: {
      type: String,
      default: "",
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    scheduledTime: {
      type: String,
      default: "",
    },
    location: {
      address: { type: String, default: "" },
      road: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      lat: { type: Number },
      lon: { type: Number },
      accuracy: { type: Number },
    },
    notes: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
    },
    couponCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "refund_pending"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    cancelledBy: {
      type: String,
      enum: ["user", "provider", "admin"],
    },
    cancelReason: {
      type: String,
      default: "",
    },
    // Audit trail of every status change (who, from/to, when).
    statusHistory: [
      {
        _id: false,
        from: String,
        to: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: String,
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
    // ── Doorstep start code + live service timer ──
    // The customer reads the 4-digit start code to the provider at the door; only the customer
    // ever receives it (select:false; customer routes opt in with .select("+startOtp")).
    startOtp: {
      type: String,
      select: false,
    },
    startOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    startedAt: {
      type: Date,
    },
    expectedEndAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    completionNotes: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

export const newStartOtp = () => String(crypto.randomInt(0, 10000)).padStart(4, "0");

// Generate booking ID and (for new bookings only) the doorstep start code.
bookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId = "QS-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  // Only on insert: startOtp is select:false, so on later saves it is simply not loaded.
  if (this.isNew && !this.startOtp) {
    this.startOtp = newStartOtp();
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
