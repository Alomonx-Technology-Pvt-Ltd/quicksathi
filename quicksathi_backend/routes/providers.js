import { Router } from "express";
import Provider from "../models/Provider.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
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
      categoryName, thumbnail, bannerImage, gallery,
      startingPrice, priceUnit, serviceMode, tags, packages, faqs,
    } = req.body;

    // Auto-generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await Service.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: `A service with this name already exists` });
    }

    const service = await Service.create({
      slug,
      name,
      shortDescription: shortDescription || "",
      fullDescription: fullDescription || "",
      category: provider.category,
      categoryName: categoryName || provider.categoryName,
      thumbnail: thumbnail || "",
      bannerImage: bannerImage || "",
      gallery: gallery || [],
      startingPrice: startingPrice || 0,
      priceUnit: priceUnit || "per service",
      serviceMode: serviceMode || "ON_SITE",
      tags: tags || [],
      packages: packages || [],
      faqs: faqs || [],
      provider: provider._id,
      approvalStatus: "pending", // needs admin approval
      providers: [{
        provider: provider._id,
        name: provider.businessName,
        rating: provider.rating,
        experience: provider.experience,
        location: provider.location?.city || "",
        startingPrice: startingPrice || 0,
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
