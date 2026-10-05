import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Notification from "../models/Notification.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
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

    const booking = await Booking.create({
      user: req.user._id,
      service: service._id,             // always use the resolved ObjectId
      provider: providerOid,
      serviceName: service.name,
      packageTitle: pkg?.title || "",
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

    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this booking" });
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

// PATCH /api/bookings/:id/status — Update any booking's status (ADMIN ONLY).
// Providers use PATCH /api/providers/bookings/:id/status, which is scoped to their own bookings.
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
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

export default router;
