import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Notification from "../models/Notification.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { sendBookingConfirmationEmail, sendBookingStatusEmail } from "../services/emailService.js";

const router = Router();

/**
 * Resolve a serviceId that may be a MongoDB ObjectId, a slug string, or a service name.
 * Returns the Service document or null.
 */
async function resolveService(serviceId) {
  if (!serviceId) return null;

  // 1. Try as ObjectId
  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    const byId = await Service.findById(serviceId);
    if (byId) return byId;
  }

  // 2. Try as slug or exact name (frontend often passes slug)
  const bySlugOrName = await Service.findOne({
    $or: [
      { slug: serviceId.toLowerCase() },
      { name: { $regex: new RegExp(`^${serviceId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
    ],
  });
  return bySlugOrName || null;
}

/**
 * Safely cast a value to ObjectId. Returns ObjectId or undefined.
 */
function toObjectId(val) {
  if (!val) return undefined;
  if (val instanceof mongoose.Types.ObjectId) return val;
  if (mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
  return undefined;
}

// POST /api/bookings — Create a booking
router.post("/", protect, async (req, res) => {
  try {
    const {
      serviceId,
      packageIndex,
      scheduledDate,
      scheduledTime,
      location,
      notes,
      paymentMethod,
      amount,
      couponCode,
    } = req.body;

    // ── Resolve service (supports ObjectId, slug, and name) ──
    const service = await resolveService(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // ── Validate scheduledDate ──
    const parsedDate = new Date(scheduledDate);
    if (!scheduledDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "A valid scheduled date is required (e.g. 2025-12-31)" });
    }

    // ── Validate paymentMethod ──
    if (!paymentMethod || !["razorpay", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be 'razorpay' or 'cod'" });
    }

    const pkg = service.packages?.[packageIndex];
    const basePrice = Number(amount) || pkg?.price || service.startingPrice || 0;

    let appliedDiscount = 0;
    let validatedCoupon = null;

    // Handle coupon application if couponCode was provided
    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      validatedCoupon = await Coupon.findOne({ code: cleanCode });

      if (validatedCoupon && validatedCoupon.isActive) {
        // Enforce ONE-TIME-PER-USER rule
        const alreadyUsed = validatedCoupon.usedBy?.some(
          (entry) => entry.user && entry.user.toString() === req.user._id.toString()
        );

        if (alreadyUsed) {
          return res.status(400).json({
            message: "You have already used this coupon code. Each coupon can only be applied once per user.",
          });
        }

        // Check expiry and min order amount
        const isExpired = validatedCoupon.validUntil && new Date(validatedCoupon.validUntil) < new Date();
        const meetsMinAmount = !validatedCoupon.minOrderAmount || basePrice >= validatedCoupon.minOrderAmount;

        if (!isExpired && meetsMinAmount) {
          if (validatedCoupon.discountType === "percentage") {
            appliedDiscount = Math.round((basePrice * validatedCoupon.discountValue) / 100);
            if (validatedCoupon.maxDiscountAmount && appliedDiscount > validatedCoupon.maxDiscountAmount) {
              appliedDiscount = validatedCoupon.maxDiscountAmount;
            }
          } else {
            appliedDiscount = Math.min(validatedCoupon.discountValue, basePrice);
          }
        }
      }
    }

    const finalPayable = Math.max(0, basePrice - appliedDiscount);

    // ── Safely cast provider to ObjectId ──
    const providerOid = toObjectId(service.provider);

    // ── Calculate service duration in minutes (default 60 mins if unspecified) ──
    const serviceDuration = Number(req.body.durationMinutes) || pkg?.durationMinutes || service.durationMinutes || 60;

    const booking = await Booking.create({
      user: req.user._id,
      service: service._id,             // always use the resolved ObjectId
      provider: providerOid,
      serviceName: service.name,
      packageTitle: pkg?.title || "",
      durationMinutes: serviceDuration,
      scheduledDate: parsedDate,
      scheduledTime,
      location,
      notes,
      originalAmount: basePrice,
      amount: finalPayable,
      couponCode: validatedCoupon ? validatedCoupon.code : "",
      discountAmount: appliedDiscount,
      paymentMethod,
      paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
      status: paymentMethod === "razorpay" ? "confirmed" : "pending",
    });

    // Record coupon usage for this user
    if (validatedCoupon && appliedDiscount > 0) {
      await Coupon.findByIdAndUpdate(validatedCoupon._id, {
        $inc: { usedCount: 1 },
        $push: {
          usedBy: {
            user: req.user._id,
            bookingId: booking._id,
            discountApplied: appliedDiscount,
            usedAt: new Date(),
          },
        },
      });
    }

    // Send confirmation email asynchronously (does not block HTTP response)
    if (req.user?.email) {
      sendBookingConfirmationEmail({
        to: req.user.email,
        name: req.user.name,
        booking,
      }).catch((err) => console.error("Email notification error:", err?.message || err));
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings — Get current user's bookings
router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("service", "name thumbnail startingPrice slug")
      .populate("provider", "businessName phone email")
      .sort("-createdAt");

    // Ensure legacy/seeded bookings have a 4-digit startOtp
    for (const b of bookings) {
      if (!b.startOtp && ["pending", "confirmed"].includes(b.status)) {
        b.startOtp = Math.floor(1000 + Math.random() * 9000).toString();
        await b.save();
      }
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/:id — Get single booking
router.get("/:id", protect, async (req, res) => {
  try {
    // ── Validate ObjectId to avoid CastError ──
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("service")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only allow owner or admin to view
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!booking.startOtp && ["pending", "confirmed"].includes(booking.status)) {
      booking.startOtp = Math.floor(1000 + Math.random() * 9000).toString();
      await booking.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/bookings/:id/cancel — Cancel a booking
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["completed", "cancelled", "in_progress"].includes(booking.status) && req.user.role !== "admin") {
      return res.status(400).json({ message: "Cannot cancel a booking that is currently in progress or completed." });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.user.role === "admin" ? "admin" : "user";
    booking.cancelReason = req.body?.reason || "";
    await booking.save();

    // Create In-Website Notification
    try {
      await Notification.create({
        recipient: booking.user,
        title: "Booking Cancelled ❌",
        message: `Your booking ${booking.bookingId || "request"} has been cancelled by ${booking.cancelledBy}. Reason: ${booking.cancelReason || "No reason specified"}`,
        type: "booking",
      });
    } catch (notifError) {
      console.error("Failed to create cancellation notification:", notifError);
    }

    // Send cancellation email notification asynchronously
    (async () => {
      try {
        const bookedUser = await User.findById(booking.user).select("name email");
        if (bookedUser?.email) {
          await sendBookingStatusEmail({
            to: bookedUser.email,
            name: bookedUser.name,
            booking,
            status: "cancelled",
          });
        }
      } catch (emailErr) {
        console.error("Booking cancellation email error:", emailErr?.message || emailErr);
      }
    })();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/bookings/:id/status — Update booking status (admin/provider)
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "provider") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Providers cannot bypass doorstep OTP or complete-work endpoints
    if (req.user.role === "provider") {
      if (req.body.status === "in_progress") {
        return res.status(400).json({
          message: "To start work, please verify the customer's 4-digit doorstep OTP.",
        });
      }
      if (req.body.status === "completed") {
        return res.status(400).json({
          message: "To complete work, please use the Submit Work action.",
        });
      }
    }

    const updateFields = { status: req.body.status };
    if (req.body.status === "completed") {
      updateFields.paymentStatus = "paid";
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create In-Website Notification
    try {
      await Notification.create({
        recipient: booking.user,
        title: `Booking Update: ${req.body.status.toUpperCase()} 🔄`,
        message: `The status of your booking ${booking.bookingId || ""} for ${booking.serviceName} has been updated to "${req.body.status}".`,
        type: "booking",
      });
    } catch (notifError) {
      console.error("Failed to create status update notification:", notifError);
    }

    // Send status update email notification asynchronously
    (async () => {
      try {
        const bookedUser = await User.findById(booking.user).select("name email");
        if (bookedUser?.email) {
          await sendBookingStatusEmail({
            to: bookedUser.email,
            name: bookedUser.name,
            booking,
            status: req.body.status,
          });
        }
      } catch (emailErr) {
        console.error("Booking status email error:", emailErr?.message || emailErr);
      }
    })();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bookings/:id/verify-otp-start — Serviceman verifies OTP & starts countdown
router.post("/:id/verify-otp-start", protect, async (req, res) => {
  try {
    if (req.user.role !== "provider" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only service partners or admins can start service work." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const { otp } = req.body;
    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ message: "Please provide the 4-digit start OTP provided by the customer." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "in_progress") {
      return res.status(400).json({ 
        message: "This service is already in progress.",
        booking 
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ message: "This service has already been completed." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Cannot start a cancelled booking." });
    }

    // Validate provider assignment
    if (req.user.role === "provider") {
      const Provider = mongoose.model("Provider");
      const providerDoc = await Provider.findOne({ user: req.user._id });
      if (!providerDoc) {
        return res.status(403).json({ message: "Provider profile not found." });
      }
      if (booking.provider && booking.provider.toString() !== providerDoc._id.toString()) {
        return res.status(403).json({ message: "This booking is assigned to another provider." });
      }
      if (!booking.provider) {
        booking.provider = providerDoc._id;
      }
    }

    // Auto-generate startOtp if legacy booking had none
    if (!booking.startOtp) {
      booking.startOtp = Math.floor(1000 + Math.random() * 9000).toString();
      await booking.save();
      return res.status(400).json({
        message: "A new start OTP was generated. Please ask customer to refresh their screen and share the 4-digit OTP.",
      });
    }

    // Verify OTP
    const cleanOtp = otp.toString().trim();
    if (booking.startOtp !== cleanOtp) {
      return res.status(400).json({ 
        message: "Invalid OTP! Please check the 4-digit start code with the customer." 
      });
    }

    // Calculate duration & timestamps
    const duration = booking.durationMinutes || 60;
    const now = new Date();
    const expectedEnd = new Date(now.getTime() + duration * 60 * 1000);

    booking.status = "in_progress";
    booking.startedAt = now;
    booking.expectedEndAt = expectedEnd;

    await booking.save();

    // Populate user and service so provider UI retains all details
    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("service", "name thumbnail startingPrice slug");

    // Create In-Website Notification for customer
    try {
      await Notification.create({
        recipient: booking.user,
        title: "Service Started! ⏱️",
        message: `Your professional has verified your OTP and started work on ${booking.serviceName}. The ${duration}-minute countdown timer is now active.`,
        type: "booking",
      });
    } catch (notifErr) {
      console.error("Failed to create start notification:", notifErr);
    }

    res.json({
      message: "OTP verified successfully! Service countdown timer has started.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bookings/:id/complete-work — Serviceman finishes work and submits
router.post("/:id/complete-work", protect, async (req, res) => {
  try {
    if (req.user.role !== "provider" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only service partners or admins can complete service work." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Validate provider assignment
    if (req.user.role === "provider") {
      const Provider = mongoose.model("Provider");
      const providerDoc = await Provider.findOne({ user: req.user._id });
      if (!providerDoc) {
        return res.status(403).json({ message: "Provider profile not found." });
      }
      if (booking.provider && booking.provider.toString() !== providerDoc._id.toString()) {
        return res.status(403).json({ message: "This booking is assigned to another provider." });
      }
    }

    if (booking.status !== "in_progress") {
      return res.status(400).json({ 
        message: `Cannot complete booking with status "${booking.status}". Service must be in progress first.` 
      });
    }

    booking.status = "completed";
    booking.completedAt = new Date();
    booking.paymentStatus = "paid";
    if (req.body?.notes) {
      booking.completionNotes = req.body.notes;
    }

    await booking.save();

    // Populate user and service so provider UI retains all details
    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("service", "name thumbnail startingPrice slug");

    // Create In-Website Notification for customer
    try {
      await Notification.create({
        recipient: booking.user,
        title: "Service Completed! ✅",
        message: `Your service for ${booking.serviceName} has been successfully completed by your professional. Thank you for choosing QuickSathi!`,
        type: "booking",
      });
    } catch (notifErr) {
      console.error("Failed to create completion notification:", notifErr);
    }

    // Send email notification asynchronously
    (async () => {
      try {
        const bookedUser = await User.findById(booking.user).select("name email");
        if (bookedUser?.email) {
          await sendBookingStatusEmail({
            to: bookedUser.email,
            name: bookedUser.name,
            booking,
            status: "completed",
          });
        }
      } catch (err) {
        console.error("Email notification error:", err?.message || err);
      }
    })();

    res.json({
      message: "Service work submitted as completed!",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Complete work error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
