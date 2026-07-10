import { Router } from "express";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── DASHBOARD STATS ───────────────────────────────────

// GET /api/admin/stats — Dashboard stats (real data from MongoDB)
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0,0,0,0);

    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      totalBookings,
      totalServices,
      totalCategories,
      revenueAgg,
      monthlyRevenueAgg,
      dailyBookingsAgg
    ] = await Promise.all([
      User.countDocuments(),
      Provider.countDocuments({ approvalStatus: "approved" }),
      Provider.countDocuments({ approvalStatus: "pending" }),
      Booking.countDocuments(),
      Service.countDocuments(),
      Category.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.aggregate([
        { 
          $match: { 
            paymentStatus: "paid",
            createdAt: { $gte: sixMonthsAgo }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format Monthly Revenue for the last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = monthNames[d.getMonth()];
      
      const match = monthlyRevenueAgg.find(r => r._id.year === year && r._id.month === month);
      monthlyRevenue.push({
        label,
        revenue: match ? match.revenue : 0
      });
    }

    // Format Daily Bookings for the last 7 days
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyBookings = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay() + 1; // MongoDB $dayOfWeek is 1-indexed (Sunday = 1)
      const label = dayNames[d.getDay()];
      
      const match = dailyBookingsAgg.find(b => b._id === dayOfWeek);
      weeklyBookings.push({
        day: label,
        count: match ? match.count : 0
      });
    }

    res.json({
      totalUsers,
      totalProviders,
      pendingProviders,
      totalBookings,
      totalServices,
      totalCategories,
      totalRevenue: revenueAgg[0]?.total || 0,
      monthlyRevenue,
      weeklyBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── SERVICES CRUD ─────────────────────────────────────

// GET /api/admin/services — List ALL services (including unavailable)
router.get("/services", protect, adminOnly, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(filter),
    ]);

    res.json({
      services,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/services/:id — Get single service (admin view)
router.get("/services/:id", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/services — Create a new service
router.post("/services", protect, adminOnly, async (req, res) => {
  try {
    const {
      slug, name, shortDescription, fullDescription,
      category, categoryName, thumbnail, bannerImage, gallery,
      startingPrice, priceUnit, rating, totalReviews, experience,
      available, serviceMode, tags, featured, packages, faqs, reviews, providers,
    } = req.body;

    // Auto-generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const existing = await Service.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ message: `Service with slug "${finalSlug}" already exists` });
    }

    const service = await Service.create({
      slug: finalSlug,
      name,
      shortDescription: shortDescription || "",
      fullDescription: fullDescription || "",
      category,
      categoryName: categoryName || "",
      thumbnail: thumbnail || "",
      bannerImage: bannerImage || "",
      gallery: gallery || [],
      startingPrice: startingPrice || 0,
      priceUnit: priceUnit || "per service",
      rating: rating || 0,
      totalReviews: totalReviews || 0,
      experience: experience || "",
      available: available !== undefined ? available : true,
      serviceMode: serviceMode || "ON_SITE",
      tags: tags || [],
      featured: featured || false,
      packages: packages || [],
      faqs: faqs || [],
      reviews: reviews || [],
      providers: providers || [],
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/services/:id — Update a service (any field)
router.put("/services/:id", protect, adminOnly, async (req, res) => {
  try {
    // If slug is being changed, check uniqueness
    if (req.body.slug) {
      const existing = await Service.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: `Service with slug "${req.body.slug}" already exists` });
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/services/:id — Delete a service
router.delete("/services/:id", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Service deleted successfully", deletedService: service.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/services/:id/toggle — Toggle service availability
router.patch("/services/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.available = !service.available;
    await service.save();

    res.json({ message: `Service ${service.available ? "enabled" : "disabled"}`, service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── CATEGORIES CRUD ───────────────────────────────────

// GET /api/admin/categories — List ALL categories (including inactive)
router.get("/categories", protect, adminOnly, async (req, res) => {
  try {
    const categories = await Category.find().sort("displayOrder");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/categories/:id — Get single category
router.get("/categories/:id", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/categories — Create a new category
router.post("/categories", protect, adminOnly, async (req, res) => {
  try {
    const {
      name, description, vertical, type,
      imageUrl, secondaryImageUrl, displayOrder, active, subCategories,
    } = req.body;

    const category = await Category.create({
      name,
      description: description || "",
      vertical,
      type: type || "BOTH",
      imageUrl: imageUrl || "",
      secondaryImageUrl: secondaryImageUrl || "",
      displayOrder: displayOrder || 0,
      active: active !== undefined ? active : true,
      subCategories: subCategories || [],
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/categories/:id — Update a category
router.put("/categories/:id", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/categories/:id — Delete a category
router.delete("/categories/:id", protect, adminOnly, async (req, res) => {
  try {
    // Check if any services reference this category
    const servicesCount = await Service.countDocuments({ category: req.params.id });
    if (servicesCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${servicesCount} service(s) still reference this category. Remove or reassign them first.`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully", deletedCategory: category.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/categories/:id/toggle — Toggle category active status
router.patch("/categories/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.active = !category.active;
    await category.save();

    res.json({ message: `Category ${category.active ? "activated" : "deactivated"}`, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PROVIDERS ─────────────────────────────────────────

// GET /api/admin/providers — List all providers with status filter
router.get("/providers", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.approvalStatus = status;

    const providers = await Provider.find(filter)
      .populate("user", "name email avatar phone")
      .sort("-createdAt");

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/providers/:id/approve — Approve a provider
router.patch("/providers/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "approved",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    ).populate("user", "name email");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Promote user role to provider
    await User.findByIdAndUpdate(provider.user._id, { role: "provider" });

    res.json({ message: "Provider approved", provider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/providers/:id/reject — Reject a provider
router.patch("/providers/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "rejected",
        rejectionReason: req.body.reason || "",
      },
      { new: true }
    ).populate("user", "name email");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Provider rejected", provider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── BOOKINGS ──────────────────────────────────────────

// GET /api/admin/bookings — List all bookings
router.get("/bookings", protect, adminOnly, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("service", "name thumbnail")
      .sort("-createdAt")
      .limit(parseInt(limit));

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/bookings/:id/status — Update booking status
router.patch("/bookings/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "in_progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status specified" });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.status = status;
    await booking.save();
    res.json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── USERS ─────────────────────────────────────────────

// GET /api/admin/users — List all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt").limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/role — Update user role
router.patch("/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["client", "provider", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id — Delete user
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── SERVICE REQUESTS (Provider facility listings) ─────

// GET /api/admin/service-requests — List provider-submitted service listings
router.get("/service-requests", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { provider: { $ne: null } }; // only provider-submitted
    if (status) filter.approvalStatus = status;

    const services = await Service.find(filter)
      .populate("provider", "businessName user")
      .sort("-createdAt");

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/service-requests/:id/approve — Approve a service listing
router.patch("/service-requests/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "approved",
        approvedBy: req.user._id,
        approvedAt: new Date(),
        available: true,
      },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service listing approved", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/service-requests/:id/reject — Reject a service listing
router.patch("/service-requests/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "rejected",
        rejectionReason: req.body.reason || "",
        available: false,
      },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service listing rejected", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/upload — Upload base64 image to Cloudinary
router.post("/upload", protect, adminOnly, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image data provided" });
    }
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "quicksathi",
    });
    res.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
});

export default router;
