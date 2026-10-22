import { Router } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Provider from "../models/Provider.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import Booking, { newStartOtp } from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
import { providerOnly } from "../middleware/admin.js";
import { changeStatus, saveBooking, markCashCollected, confirmFare, BookingStateError } from "../services/bookingStatus.js";
import { sendBookingStatusEmail } from "../services/emailService.js";
import { otpLimiter } from "../middleware/rateLimits.js";
import { releaseCouponIfUnpaid, maxRentalFare } from "../services/pricing.js";
import { uploadPrivateKyc } from "../services/kyc.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

// POST /api/providers/register — Register as a provider
router.post("/register", protect, async (req, res) => {
  try {
    // Check if user already has a provider profile
    const existing = await Provider.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Provider profile already exists", provider: existing });
    }

    const {
      businessName,
      businessType,
      description,
      category, // ObjectId of selected category
      servicesOffered,
      experience,
      location,
      phone,
      email,
      selfiePhoto, // base64 or url
      idProof,     // base64 or url
      businessReg, // base64 or url
    } = req.body;

    // Look up category name from DB
    let categoryName = "";
    let categoryRef = null;
    if (category) {
      const cat = await Category.findById(category);
      if (cat) {
        categoryName = cat.name;
        categoryRef = cat._id;
      }
    }

    // KYC documents must be real image uploads (data URIs). Arbitrary URLs are rejected, and a failed
    // upload fails the application instead of silently creating one with no documents.
    const uploadKyc = async (value, folder, label) => {
      if (!value) return "";
      if (typeof value !== "string" || !/^data:image\/(png|jpe?g|webp);base64,/i.test(value)) {
        const err = new Error(`${label} must be an image file (PNG, JPG or WebP)`);
        err.status = 400;
        throw err;
      }
      if (value.length > 7 * 1024 * 1024) {
        const err = new Error(`${label} is too large (max 5 MB)`);
        err.status = 400;
        throw err;
      }
      try {
        // Private (authenticated) asset: no public URL exists; admins view it via a signed link.
        return await uploadPrivateKyc(value, folder);
      } catch (uploadErr) {
        console.error(`${label} upload failed:`, uploadErr?.message || uploadErr);
        const err = new Error(`Could not upload your ${label.toLowerCase()}. Please try again.`);
        err.status = 502;
        throw err;
      }
    };

    let selfieUrl, idProofUrl, businessRegUrl;
    try {
      selfieUrl = await uploadKyc(selfiePhoto, "TiptoBook/providers/selfies", "Selfie photo");
      idProofUrl = await uploadKyc(idProof, "TiptoBook/providers/documents", "ID proof");
      businessRegUrl = await uploadKyc(businessReg, "TiptoBook/providers/documents", "Business registration");
    } catch (uploadError) {
      return res.status(uploadError.status || 500).json({ message: uploadError.message });
    }

    const provider = await Provider.create({
      user: req.user._id,
      businessName,
      businessType,
      description,
      category: categoryRef,
      categoryName,
      servicesOffered: servicesOffered || [],
      experience,
      location,
      phone: phone || req.user.phone,
      email: email || req.user.email,
      documents: {
        idProof: idProofUrl,
        businessRegistration: businessRegUrl,
        selfiePhoto: selfieUrl,
      },
      approvalStatus: "pending", // requires admin approval
    });

    // Don't change user role yet — wait for admin approval

    res.status(201).json(provider);
  } catch (error) {
    // Two simultaneous submissions: the unique index on Provider.user lets only one through.
    if (error?.code === 11000) return res.status(400).json({ message: "Provider profile already exists" });
    res.status(500).json({ message: error.message });
  }
});

// GET /api/providers/me — Get current provider's profile
router.get("/me", protect, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate("user", "name email avatar")
      .populate("category", "name");
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/providers/status — Check provider approval status (any logged-in user)
router.get("/status", protect, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate("category", "name");
    if (!provider) {
      return res.json({ hasProfile: false });
    }
    res.json({
      hasProfile: true,
      approvalStatus: provider.approvalStatus,
      rejectionReason: provider.rejectionReason,
      businessName: provider.businessName,
      categoryName: provider.categoryName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/providers/me — Update provider profile
const PROVIDER_EDITABLE_FIELDS = [
  "businessName", "businessType", "description", "logo", "servicesOffered",
  "experience", "location", "phone", "email", "isActive",
];

router.put("/me", protect, providerOnly, async (req, res) => {
  try {
    // Allowlist only. approvalStatus, rating, totalBookings, documents, user, approvedBy... are never client-editable.
    const updates = {};
    for (const field of PROVIDER_EDITABLE_FIELDS) {
      if (req.body?.[field] !== undefined) updates[field] = req.body[field];
    }

    const current = await Provider.findOne({ user: req.user._id }).select("approvalStatus");
    if (!current) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    if (updates.isActive !== undefined) {
      if (typeof updates.isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be true or false" });
      }
      if (current.approvalStatus !== "approved") {
        return res.status(403).json({ message: "Only approved providers can change availability" });
      }
    }

    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // When provider toggles online/offline, also update all their services' availability
    if (req.body.isActive !== undefined) {
      await Service.updateMany(
        { provider: provider._id, approvalStatus: "approved" },
        { available: req.body.isActive }
      );
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PROVIDER SERVICE LISTINGS ─────────────────────────

// POST /api/providers/services — Provider requests to list a service/facility
router.post("/services", protect, providerOnly, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    if (provider.approvalStatus !== "approved") {
      return res.status(403).json({ message: "Your provider profile must be approved first" });
    }

    const {
      name, shortDescription, fullDescription,
      category, categoryName, thumbnail, bannerImage, gallery,
      startingPrice, priceUnit, serviceMode, tags, packages, faqs, cities
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Service name is required" });
    }

    // 1. Resolve Category & CategoryName safely
    let categoryRef = category || provider.category;
    let resolvedCategoryName = categoryName || provider.categoryName || "";

    if (categoryRef && mongoose.Types.ObjectId.isValid(categoryRef)) {
      const catObj = await Category.findById(categoryRef);
      if (catObj) {
        resolvedCategoryName = catObj.name;
      }
    }

    // If categoryRef is still null/invalid, pick the first available Category in DB
    if (!categoryRef || !mongoose.Types.ObjectId.isValid(categoryRef)) {
      const firstCat = await Category.findOne({});
      if (firstCat) {
        categoryRef = firstCat._id;
        resolvedCategoryName = firstCat.name;
      }
    }

    // 2. Auto-generate a unique slug
    let baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!baseSlug) baseSlug = "service";

    let slug = baseSlug;
    let count = 1;
    while (await Service.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const service = await Service.create({
      slug,
      name: name.trim(),
      shortDescription: shortDescription || "",
      fullDescription: fullDescription || "",
      category: categoryRef,
      categoryName: resolvedCategoryName || "General",
      thumbnail: thumbnail || "",
      bannerImage: bannerImage || "",
      gallery: gallery || [],
      startingPrice: Number(startingPrice) || 0,
      priceUnit: priceUnit || "per service",
      serviceMode: serviceMode || "ON_SITE",
      tags: tags || [],
      packages: packages || [],
      faqs: faqs || [],
      cities: cities || [],
      provider: provider._id,
      approvalStatus: "pending", // needs admin approval
      providers: [{
        provider: provider._id,
        name: provider.businessName,
        rating: provider.rating || 5.0,
        experience: provider.experience || "",
        location: provider.location?.city || "",
        startingPrice: Number(startingPrice) || 0,
      }],
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/providers/services — Provider views their own submitted services
router.get("/services", protect, providerOnly, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const services = await Service.find({ provider: provider._id })
      .sort("-createdAt");

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Provider booking actions ────────────────────────────────────────────────
// Only an approved provider acts on bookings, and only on bookings assigned to them. (Provider.isActive is
// the provider's own "available for new jobs" toggle; going offline must not strand jobs already accepted.
// Rejection, demotion and account deletion are covered by approvalStatus, providerOnly and protect.)
async function actingProvider(req) {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) throw new BookingStateError("Provider profile not found", 404);
  if (provider.approvalStatus !== "approved") {
    throw new BookingStateError("Your provider profile isn't approved", 403);
  }
  return provider;
}

// Responses carry the customer/service details the dashboard shows; never the start code.
const providerBookingView = (id) =>
  Booking.findById(id).populate("user", "name email phone").populate("service", "name thumbnail");

const notifyCustomer = (booking, title, message) =>
  Notification.create({ recipient: booking.user, title, message, type: "booking" }).catch((err) =>
    console.error("Provider booking notification error:", err?.message || err)
  );

const sendError = (res, error) => {
  if (error instanceof BookingStateError) return res.status(error.status).json({ message: error.message });
  res.status(500).json({ message: error.message });
};

// GET /api/providers/bookings — Provider views their assigned bookings
router.get("/bookings", protect, providerOnly, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const bookings = await Booking.find({ provider: provider._id })
      .populate("user", "name email phone")
      .populate("service", "name thumbnail")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/providers/bookings/:id/status — accept or cancel an assigned booking.
// Starting needs the customer's doorstep code (/start); finishing uses /complete.
router.patch("/bookings/:id/status", protect, providerOnly, async (req, res) => {
  try {
    const provider = await actingProvider(req);

    const { status } = req.body;
    if (status === "in_progress") {
      return res.status(400).json({ message: "To start work, enter the customer's 4-digit doorstep code." });
    }
    if (status === "completed") {
      return res.status(400).json({ message: "To finish, use the Complete work action." });
    }

    const booking = await Booking.findOne({ _id: req.params.id, provider: provider._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    changeStatus(booking, status, { actorId: req.user._id, role: "provider", reason: req.body?.reason });
    await saveBooking(booking);
    await releaseCouponIfUnpaid(booking);

    await notifyCustomer(
      booking,
      `Booking Update: ${status.toUpperCase()} 🔄`,
      `Your booking ${booking.bookingId || ""} for ${booking.serviceName} has been updated to "${status}" by the provider.`
    );

    res.json({ message: "Booking status updated successfully", booking: await providerBookingView(booking._id) });
  } catch (error) {
    sendError(res, error);
  }
});

const MAX_START_ATTEMPTS = 5;

// POST /api/providers/bookings/:id/start — the customer's doorstep code starts the job and its timer.
router.post("/bookings/:id/start", protect, otpLimiter, providerOnly, async (req, res) => {
  try {
    const provider = await actingProvider(req);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }
    const otp = typeof req.body?.otp === "string" || typeof req.body?.otp === "number" ? String(req.body.otp).trim() : "";
    if (!/^\d{4}$/.test(otp)) {
      return res.status(400).json({ message: "Enter the 4-digit start code from the customer." });
    }

    // Count the attempt atomically before checking, so parallel guesses can't exceed the limit.
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, provider: provider._id },
      { $inc: { startOtpAttempts: 1 } },
      { new: true }
    ).select("+startOtp +startOtpAttempts");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }
    if (booking.status !== "confirmed") {
      return res.status(409).json({ message: `A ${booking.status.replace("_", " ")} booking can't be started` });
    }

    const reissue = async (message) => {
      await Booking.updateOne({ _id: booking._id }, { $set: { startOtp: newStartOtp(), startOtpAttempts: 0 } });
      await notifyCustomer(booking, "New start code 🔐", `Your start code for booking ${booking.bookingId} was changed. Open My Bookings to see the new code.`);
      return res.status(429).json({ message });
    };

    if (!booking.startOtp) {
      return reissue("A start code has been sent to the customer. Ask them to open My Bookings.");
    }
    if (booking.startOtpAttempts > MAX_START_ATTEMPTS) {
      return reissue("Too many wrong codes. A new code has been sent to the customer.");
    }
    if (booking.startOtp !== otp) {
      if (booking.startOtpAttempts >= MAX_START_ATTEMPTS) {
        return reissue("Too many wrong codes. A new code has been sent to the customer.");
      }
      return res.status(400).json({
        message: `Wrong code. ${MAX_START_ATTEMPTS - booking.startOtpAttempts} attempt(s) left.`,
      });
    }

    changeStatus(booking, "in_progress", { actorId: req.user._id, role: "provider" });
    const now = new Date();
    booking.startedAt = now;
    booking.expectedEndAt = new Date(now.getTime() + (booking.durationMinutes || 60) * 60 * 1000);
    booking.startOtp = undefined;
    booking.startOtpAttempts = 0;
    await saveBooking(booking);

    await notifyCustomer(
      booking,
      "Service started ⏱️",
      `Your professional has started work on ${booking.serviceName}. The ${booking.durationMinutes || 60}-minute timer is running.`
    );

    res.json({ message: "Code verified. The service timer has started.", booking: await providerBookingView(booking._id) });
  } catch (error) {
    sendError(res, error);
  }
});

// POST /api/providers/bookings/:id/complete — the provider finishes the job. Payment is untouched:
// cash jobs still need "Cash collected", online jobs were paid before they could start.
router.post("/bookings/:id/complete", protect, providerOnly, async (req, res) => {
  try {
    const provider = await actingProvider(req);
    const booking = await Booking.findOne({ _id: req.params.id, provider: provider._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    changeStatus(booking, "completed", { actorId: req.user._id, role: "provider" });
    booking.completedAt = new Date();
    if (typeof req.body?.notes === "string") booking.completionNotes = req.body.notes.trim().slice(0, 1000);
    await saveBooking(booking);

    await notifyCustomer(
      booking,
      "Service completed ✅",
      `Your service for ${booking.serviceName} has been completed. Thank you for choosing TiptoBook!`
    );
    (async () => {
      const bookedUser = await User.findById(booking.user).select("name email");
      if (bookedUser?.email) {
        await sendBookingStatusEmail({ to: bookedUser.email, name: bookedUser.name, booking, status: "completed" });
      }
    })().catch((err) => console.error("Completion email error:", err?.message || err));

    res.json({ message: "Work marked as completed.", booking: await providerBookingView(booking._id) });
  } catch (error) {
    sendError(res, error);
  }
});

// POST /api/providers/bookings/:id/cash-collected — provider confirms they received the cash for a COD job
router.post("/bookings/:id/cash-collected", protect, providerOnly, async (req, res) => {
  try {
    const provider = await actingProvider(req);
    const booking = await Booking.findOne({ _id: req.params.id, provider: provider._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }
    markCashCollected(booking, { actorId: req.user._id, role: "provider" });
    await booking.save();
    res.json({ message: "Marked as paid", booking: await providerBookingView(booking._id) });
  } catch (error) {
    sendError(res, error);
  }
});

// POST /api/providers/bookings/:id/fare — rental trips: record the final fare (cash is collected after this).
router.post("/bookings/:id/fare", protect, providerOnly, async (req, res) => {
  try {
    const provider = await actingProvider(req);
    const booking = await Booking.findOne({ _id: req.params.id, provider: provider._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }
    const service = await Service.findById(booking.service).select("perKmRate");
    confirmFare(booking, req.body?.amount, { actorId: req.user._id, role: "provider", maxAmount: maxRentalFare(service, booking) });
    await booking.save();
    await notifyCustomer(booking, "Final fare confirmed", `Your trip fare for ${booking.bookingId} is ₹${booking.amount}, payable in cash.`);
    res.json({ message: "Fare confirmed", booking: await providerBookingView(booking._id) });
  } catch (error) {
    sendError(res, error);
  }
});

// GET /api/providers — Public list of approved providers
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { approvalStatus: "approved", isActive: true };
    if (category) filter.categoryName = category;

    const providers = await Provider.find(filter)
      .select("businessName businessType description logo categoryName servicesOffered experience location.city rating totalBookings")
      .sort("-rating");

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve providers" });
  }
});

export default router;
