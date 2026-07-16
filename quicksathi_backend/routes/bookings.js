import { Router } from "express";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST /api/bookings — Create a booking
router.post("/", protect, async (req, res) => {
  try {
    const { serviceId, packageIndex, scheduledDate, scheduledTime, location, notes, paymentMethod, amount } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const pkg = service.packages?.[packageIndex];

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: service.provider || undefined,
      serviceName: service.name,
      packageTitle: pkg?.title || "",
      scheduledDate,
      scheduledTime,
      location,
      notes,
      amount: amount || pkg?.price || service.startingPrice,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: "pending",
    });

    res.status(201).json(booking);
  } catch (error) {
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
      .populate("service", "name thumbnail startingPrice")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/:id — Get single booking
router.get("/:id", protect, async (req, res) => {
  try {
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
    booking.cancelReason = req.body.reason || "";
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

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
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

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
