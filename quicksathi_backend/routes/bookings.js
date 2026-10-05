import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Notification from "../models/Notification.js";
import { quote, redeemCoupon, releaseCoupon, assertFutureSlot, PricingError } from "../services/pricing.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { sendBookingConfirmationEmail, sendBookingStatusEmail } from "../services/emailService.js";

const router = Router();

/**
 * Safely cast a value to ObjectId. Returns ObjectId or undefined.
 */
function toObjectId(val) {
  if (!val) return undefined;
  if (val instanceof mongoose.Types.ObjectId) return val;
  if (mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
  return undefined;
}

// POST /api/bookings/quote — price a booking exactly as creation would (no side effects).
router.post("/quote", protect, async (req, res) => {
  try {
    const q = await quote({ ...pickQuoteInput(req.body), userId: req.user._id });
    res.json({
      originalAmount: q.originalAmount,
      discountAmount: q.discountAmount,
      amount: q.amount,
      packageTitle: q.pkg?.title || "",
      coupon: q.coupon ? { code: q.coupon.code, title: q.coupon.title } : null,
    });
  } catch (error) {
    if (error instanceof PricingError) return res.status(error.status).json({ message: error.message, ...error.extra });
    res.status(500).json({ message: error.message });
  }
});

const pickQuoteInput = (body = {}) => ({
  serviceId: body.serviceId,
  packageIndex: body.packageIndex,
  packageTitle: body.packageTitle,
  distanceKm: body.distanceKm,
  couponCode: body.couponCode,
});

// POST /api/bookings — Create a booking. The price is computed here from the catalog;
// any `amount` sent by the client is ignored.
router.post("/", protect, async (req, res) => {
  let redeemed = null;
  try {
    const { scheduledDate, scheduledTime, location, notes, paymentMethod } = req.body;

    if (!paymentMethod || !["razorpay", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be 'razorpay' or 'cod'" });
    }
    const parsedDate = assertFutureSlot(scheduledDate, scheduledTime);

    const q = await quote({ ...pickQuoteInput(req.body), userId: req.user._id });
    const { service, pkg, coupon } = q;

    const bookingObjectId = new mongoose.Types.ObjectId();
    if (coupon && q.discountAmount > 0) {
      const ok = await redeemCoupon(coupon, { userId: req.user._id, bookingId: bookingObjectId, discountApplied: q.discountAmount });
      if (!ok) return res.status(400).json({ message: "This coupon can't be used (already redeemed or fully used)." });
      redeemed = coupon._id;
    }

    let booking;
    try {
      booking = await Booking.create({
        _id: bookingObjectId,
        user: req.user._id,
        service: service._id,
        provider: toObjectId(service.provider),
        serviceName: service.name,
        packageTitle: pkg?.title || "",
        scheduledDate: parsedDate,
        scheduledTime,
        location,
        notes,
        originalAmount: q.originalAmount,
        amount: q.amount,
        couponCode: coupon && q.discountAmount > 0 ? coupon.code : "",
        discountAmount: q.discountAmount,
        paymentMethod,
        // Money is never marked received at creation. Online payments become "paid" only via
        // verified Razorpay confirmation (see routes/payments.js).
        paymentStatus: "pending",
        status: "pending",
      });
    } catch (err) {
      if (redeemed) await releaseCoupon(redeemed, bookingObjectId);
      throw err;
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
    if (error instanceof PricingError) return res.status(error.status).json({ message: error.message, ...error.extra });
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
