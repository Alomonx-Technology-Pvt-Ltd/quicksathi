import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false, // true only when set from a verified Firebase token
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "phone", "firebase"],
      default: "local",
    },
    firebaseUid: {
      type: String,
    },
    deletedAt: { type: Date },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Profile address fields (for booking auto-fill)
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  }
);

// One account per phone number / Firebase identity. Empty or missing values are ignored.
// (Production already has legacy sparse indexes named phone_1 / firebaseUid_1: run
//  scripts/migrations/001-user-unique-indexes.mjs once to replace them.)
userSchema.index({ phone: 1 }, { unique: true, name: "phone_unique", partialFilterExpression: { phone: { $type: "string", $gt: "" } } });
userSchema.index({ firebaseUid: 1 }, { unique: true, name: "firebaseUid_unique", partialFilterExpression: { firebaseUid: { $type: "string", $gt: "" } } });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
