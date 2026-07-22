import { Router } from "express";
import Provider from "../models/Provider.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
import { providerOnly } from "../middleware/admin.js";

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
      approvalStatus: "pending", // requires admin approval
    });

    // Don't change user role yet — wait for admin approval

    res.status(201).json(provider);
  } catch (error) {
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
router.put("/me", protect, providerOnly, async (req, res) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
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

// PATCH /api/providers/bookings/:id/status — Provider updates status of their assigned booking
router.patch("/bookings/:id/status", protect, providerOnly, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const { status } = req.body;
    if (!["pending", "confirmed", "in_progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, provider: provider._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    booking.status = status;
    await booking.save();

    // Create Notification for the client user
    try {
      await Notification.create({
        recipient: booking.user,
        title: `Booking Update: ${status.toUpperCase()} 🔄`,
        message: `Your booking ${booking.bookingId || ""} for ${booking.serviceName} has been updated to "${status}" by the provider.`,
        type: "booking",
      });
    } catch (notifErr) {
      console.error("Failed to create provider booking notification:", notifErr);
    }

    res.json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/providers — Public list of approved providers
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { approvalStatus: "approved", isActive: true };
    if (category) filter.categoryName = category;

    const providers = await Provider.find(filter)
      .populate("user", "name avatar")
      .sort("-rating");

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
