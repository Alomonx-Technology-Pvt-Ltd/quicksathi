import { Router } from "express";
import { sendMail, sendTestEmail, escapeHtml } from "../services/emailService.js";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { adminUpdateBookingStatus } from "./bookings.js";
import { markCashCollected, BookingStateError } from "../services/bookingStatus.js";
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
    // All dashboard buckets are in India time (the server runs in UTC on Render).
    const IST_MS = 5.5 * 3600 * 1000;
    const istNow = new Date(Date.now() + IST_MS);
    const istYear = istNow.getUTCFullYear();
    const istMonth = istNow.getUTCMonth();
    const monthStartIst = (offset) => new Date(Date.UTC(istYear, istMonth - offset, 1) - IST_MS);
    const sixMonthsAgo = monthStartIst(5);
    const startOfWeek = new Date(Date.UTC(istYear, istMonth, istNow.getUTCDate() - 6) - IST_MS);
    const TZ = "Asia/Kolkata";
    // Revenue = money actually received: paid bookings that weren't cancelled or refunded.
    const paidMatch = { paymentStatus: "paid", status: { $ne: "cancelled" } };

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
        { $match: paidMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.aggregate([
        { 
          $match: { 
            ...paidMatch,
            createdAt: { $gte: sixMonthsAgo }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: { date: "$createdAt", timezone: TZ } },
              month: { $month: { date: "$createdAt", timezone: TZ } }
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
          _id: { $dayOfWeek: { date: "$createdAt", timezone: TZ } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format Monthly Revenue for the last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(istYear, istMonth - i, 1));
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      const label = monthNames[d.getUTCMonth()];
      
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
      const d = new Date(istNow.getTime() - i * 24 * 3600 * 1000); // shifted clock: use UTC getters for IST fields
      const dayOfWeek = d.getUTCDay() + 1; // MongoDB $dayOfWeek is 1-indexed (Sunday = 1)
      const label = dayNames[d.getUTCDay()];
      
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
      available, serviceMode, tags, featured, packages, faqs, reviews, providers, cities, perKmRate,
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
      cities: Array.isArray(cities) ? cities : [],
      ...(perKmRate ? { perKmRate: Number(perKmRate) } : {}),
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
      imageUrl, secondaryImageUrl, displayOrder, active, comingSoon, subCategories,
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
      comingSoon: comingSoon !== undefined ? comingSoon : false,
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

// PATCH /api/admin/categories/:id/coming-soon — Toggle category "Coming Soon" mode.
// When ON, the frontend shows this category's services in Coming Soon mode
// (badges shown, booking/navigation disabled).
router.patch("/categories/:id/coming-soon", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.comingSoon = !category.comingSoon;
    await category.save();

    res.json({
      message: category.comingSoon
        ? `"${category.name}" is now in Coming Soon mode — its services are hidden from booking on the frontend.`
        : `"${category.name}" is now live — its services are bookable again.`,
      category,
    });
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
      .select("+documents.idProof +documents.businessRegistration +documents.selfiePhoto +documents.other")
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
        isActive: false,
      },
      { new: true }
    ).populate("user", "name email");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // A rejected (or previously approved, now rejected) provider must lose provider access too.
    if (provider.user) {
      await User.updateOne({ _id: provider.user._id, role: "provider" }, { role: "user" });
    }

    res.json({ message: "Provider rejected", provider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/services/:id/assign-provider — Assign a provider to a service
router.patch("/services/:id/assign-provider", protect, adminOnly, async (req, res) => {
  try {
    const { providerId } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (providerId) {
      const provider = await Provider.findById(providerId);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      service.provider = provider._id;
    } else {
      service.provider = undefined;
    }

    await service.save();
    const updated = await Service.findById(service._id).populate("provider");
    res.json({ message: "Provider assigned to service successfully", service: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/bookings/:id/assign — Assign provider to a booking
router.patch("/bookings/:id/assign", protect, adminOnly, async (req, res) => {
  try {
    const { providerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (providerId) {
      const provider = await Provider.findById(providerId);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      if (provider.approvalStatus !== "approved" || !provider.isActive) {
        return res.status(400).json({ message: "Only approved, active providers can be assigned to bookings" });
      }
      if (!["pending", "confirmed"].includes(booking.status)) {
        return res.status(409).json({ message: `A ${booking.status.replace("_", " ")} booking can't be reassigned` });
      }
      booking.provider = provider._id;
      if (booking.status === "pending") {
        booking.status = "confirmed";
      }
      await booking.save();

      // Notify only after the assignment is saved.
      Notification.create({
        recipient: provider.user,
        title: "New Job Assigned! 💼",
        message: `You have been assigned to booking ${booking.bookingId || ""} for ${booking.serviceName}.`,
        type: "booking",
      }).catch((e) => console.error("Failed to notify provider:", e));
      Notification.create({
        recipient: booking.user,
        title: "Provider Assigned 👨‍🔧",
        message: `Your booking for ${booking.serviceName} has been assigned to ${provider.businessName}.`,
        type: "booking",
      }).catch((e) => console.error("Failed to notify user:", e));
    } else {
      booking.provider = undefined;
      await booking.save();
    }



    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("service", "name thumbnail")
      .populate("provider", "businessName");

    res.json({ message: "Provider assigned successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/bookings/:id/status — Change a booking's status (same rules as the state machine)
router.patch("/bookings/:id/status", protect, adminOnly, adminUpdateBookingStatus);

// POST /api/admin/bookings/:id/cash-collected — Confirm cash received for a COD booking
router.post("/bookings/:id/cash-collected", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    markCashCollected(booking, { actorId: req.user._id, role: "admin" });
    await booking.save();
    res.json({ message: "Marked as paid", booking });
  } catch (error) {
    if (error instanceof BookingStateError) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
});



// ─── USERS ─────────────────────────────────────────────

// GET /api/admin/users — Paginated user list: ?page=1&limit=50&search=
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const filter = { deletedAt: { $exists: false } };
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const rx = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    const [users, total] = await Promise.all([
      User.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
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

    // Map "client" to "user" for DB schema enum compliance
    const finalRole = role === "client" ? "user" : role;

    if (user.role === "admin" && finalRole !== "admin") {
      if (String(user._id) === String(req.user._id)) {
        return res.status(400).json({ message: "You can't remove your own admin access" });
      }
      if ((await User.countDocuments({ role: "admin", isActive: true })) <= 1) {
        return res.status(400).json({ message: "You can't remove the last administrator" });
      }
    }
    if (finalRole === "admin" && !user.emailVerified) {
      return res.status(400).json({ message: "This user's email isn't verified. Ask them to sign in with Google first." });
    }

    // Promoting to provider only creates a PENDING application. The provider role is granted when the
    // application is approved in Providers (that is where KYC is reviewed).
    if (finalRole === "provider") {
      let providerProfile = await Provider.findOne({ user: user._id });
      if (!providerProfile) {
        const defaultCat = await Category.findOne({});
        providerProfile = new Provider({
          user: user._id,
          businessName: `${user.name} Services`,
          businessType: "Individual / Freelancer",
          description: "",
          category: defaultCat ? defaultCat._id : undefined,
          categoryName: defaultCat ? defaultCat.name : "Uncategorized",
          servicesOffered: [],
          phone: user.phone || "",
          email: user.email,
          approvalStatus: "pending",
        });
        await providerProfile.save();
      }
      return res.json({
        message: "A provider application was created. Review and approve it under Providers to grant provider access.",
        user,
      });
    }

    user.role = finalRole;
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
    if (user.role === "admin") {
      return res.status(400).json({ message: "Administrators can't be deleted. Change their role first." });
    }
    // Soft delete: keep the row (bookings and payments still point at it) but anonymise personal data and disable access.
    await User.updateOne(
      { _id: user._id },
      {
        $set: { isActive: false, deletedAt: new Date(), name: "Deleted user", email: `deleted+${user._id}@deleted.invalid`, avatar: "", role: "user" },
        $unset: { phone: "", firebaseUid: "", password: "", address: "", city: "", state: "", pincode: "" },
      }
    );
    await Provider.updateMany({ user: user._id }, { isActive: false });
    res.json({ message: "User deleted successfully" });
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
      folder: "TiptoBook",
    });
    res.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
});

// POST /api/admin/send-email — Send notifications to users via Email or In-Website
router.post("/send-email", protect, adminOnly, async (req, res) => {
  try {
    const { recipientType, email } = req.body;
    const body = typeof req.body.body === "string" ? req.body.body : "";
    const subject = typeof req.body.subject === "string" ? req.body.subject.replace(/[\r\n]+/g, " ").trim() : "";
    const channels = Array.isArray(req.body.channels) ? req.body.channels : ["email"];
    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and Body are required" });
    }

    let recipients = [];
    if (recipientType === "all") {
      const users = await User.find({}, "email");
      recipients = users.map(u => u.email);
    } else if (recipientType === "providers") {
      const providers = await Provider.find({ approvalStatus: "approved" }).populate("user", "email");
      recipients = providers.map(p => p.user?.email).filter(Boolean);
    } else if (recipientType === "users") {
      const users = await User.find({ role: "user" }, "email");
      recipients = users.map(u => u.email);
    } else if (recipientType === "individual") {
      // Only registered accounts can be messaged: this endpoint must not be a mail relay to arbitrary addresses.
      const target = typeof email === "string" ? await User.findOne({ email: email.trim().toLowerCase() }, "email") : null;
      if (!target) {
        return res.status(400).json({ message: "No registered user with that email address" });
      }
      recipients = [target.email];
    } else {
      return res.status(400).json({ message: "Invalid recipient type" });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: "No matching recipients found" });
    }

    let emailSent = false;
    let isMock = true;
    let webSent = false;
    let webCount = 0;
    let emailOk = 0;
    let emailFailed = 0;

    // --- Channel 1: Email ---
    if (channels.includes("email")) {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #334155; line-height: 1.6; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #f97316; margin-top: 0;">TiptoBook Platform Announcement</h2>
          <p style="white-space: pre-line; font-size: 15px; color: #1e293b;">${escapeHtml(body)}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">You received this notification from the TiptoBook Administrator.</p>
        </div>
      `;

      // Awaited, in small batches, so one broadcast can't open hundreds of mail connections at once.
      for (let i = 0; i < recipients.length; i += 10) {
        const results = await Promise.all(
          recipients.slice(i, i + 10).map((recipient) =>
            sendMail({ to: recipient, subject, text: body, html: emailHtml }).catch((err) => ({ success: false, error: err?.message }))
          )
        );
        for (const r of results) (r?.success ? (emailOk += 1) : (emailFailed += 1));
      }

      isMock = !process.env.BREVO_API_KEY && !process.env.SMTP_USER;
      emailSent = emailOk > 0;
    }

    // --- Channel 2: In-Website Alerts ---
    if (channels.includes("web")) {
      // Find matching users in database
      const matchedUsers = await User.find({ email: { $in: recipients } }, "_id");
      if (matchedUsers.length > 0) {
        const notificationDocs = matchedUsers.map(u => ({
          recipient: u._id,
          title: subject,
          message: body,
          type: recipientType === "providers" ? "system" : "info"
        }));
        await Notification.insertMany(notificationDocs);
        webCount = matchedUsers.length;
        webSent = true;
      }
    }

    res.json({
      success: true,
      message: `Notification broadcasted. Channels: ${channels.join(", ")}.`,
      count: recipients.length,
      emailSent,
      emailDelivered: emailOk,
      emailFailed,
      webSent,
      webCount,
      mock: isMock,
      // Individual sends echo the (admin-typed) address; bulk sends never return the user list.
      ...(recipientType === "individual" ? { recipients } : {}),
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ message: error.message || "Failed to broadcast notification" });
  }
});

// GET /api/admin/notifications — Live admin notifications feed
router.get("/notifications", protect, adminOnly, async (req, res) => {
  try {
    const [pendingProviders, recentBookings] = await Promise.all([
      Provider.find({ approvalStatus: "pending" }).populate("user", "name"),
      Booking.find().populate("user", "name").sort("-createdAt").limit(15)
    ]);

    const alerts = [];

    // Map pending providers
    pendingProviders.forEach((p) => {
      alerts.push({
        _id: `provider-${p._id}`,
        type: "provider",
        title: "Provider Request",
        color: "#8b5cf6",
        message: `${p.businessName || p.user?.name || "Partner"} submitted details`,
        createdAt: p.createdAt,
      });
    });

    // Map recent bookings
    recentBookings.forEach((b) => {
      alerts.push({
        _id: `booking-${b._id}`,
        type: "booking",
        title: "New Booking",
        color: "#10b981",
        message: `₹${(b.amount || 0).toLocaleString()} ${b.serviceName || "service"} logged`,
        createdAt: b.createdAt,
      });
    });

    // Sort by date descending
    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit to top 10 alerts
    res.json(alerts.slice(0, 10));
  } catch (error) {
    console.error("Admin notifications error:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve admin alerts" });
  }
});

// ─── PROVIDER SERVICE REQUESTS (APPROVAL WORKFLOW) ─────────────────────────

// GET /api/admin/service-requests — List all provider service submissions
router.get("/service-requests", protect, adminOnly, async (req, res) => {
  try {
    const services = await Service.find({ provider: { $exists: true, $ne: null } })
      .populate("provider", "businessName email phone location")
      .populate("category", "name")
      .sort("-createdAt");
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/service-requests/:id/approve — Approve a service listing
router.patch("/service-requests/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("provider", "businessName user");
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.approvalStatus = "approved";
    service.available = true;
    service.approvedBy = req.user._id;
    service.approvedAt = new Date();
    service.rejectionReason = "";
    await service.save();

    // Notify the provider
    if (service.provider?.user) {
      try {
        await Notification.create({
          recipient: service.provider.user,
          title: "🎉 Service Listing Approved!",
          message: `Your service "${service.name}" has been approved and is now live on TiptoBook!`,
          type: "system",
        });
      } catch (notifErr) {
        console.error("Notification create error:", notifErr);
      }
    }

    res.json({ message: "Service approved successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/service-requests/:id/reject — Reject a service listing
router.patch("/service-requests/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const service = await Service.findById(req.params.id).populate("provider", "businessName user");
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.approvalStatus = "rejected";
    service.available = false;
    service.rejectionReason = reason || "Did not meet listing standards";
    await service.save();

    // Notify the provider
    if (service.provider?.user) {
      try {
        await Notification.create({
          recipient: service.provider.user,
          title: "❌ Service Listing Rejected",
          message: `Your service "${service.name}" was not approved. Reason: ${service.rejectionReason}`,
          type: "system",
        });
      } catch (notifErr) {
        console.error("Notification create error:", notifErr);
      }
    }

    res.json({ message: "Service rejected", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN BOOKINGS & PROVIDERS ──────────────────────────

// GET /api/admin/bookings — List all bookings (for Admin Panel)
router.get("/bookings", protect, adminOnly, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("provider", "businessName user")
      .sort("-createdAt")
      .limit(parseInt(limit));
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/providers/approved — List all approved providers
router.get("/providers/approved", protect, adminOnly, async (req, res) => {
  try {
    const providers = await Provider.find({ approvalStatus: "approved", isActive: true })
      .populate("user", "name email phone role")
      .select("businessName businessType categoryName experience location rating isActive user");
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/test-email — Fast real-time test of email service
router.post("/test-email", protect, adminOnly, async (req, res) => {
  try {
    const { to } = req.body;
    const targetEmail = to || req.user.email;
    const result = await sendTestEmail({ to: targetEmail });
    res.json({
      success: result.success,
      recipient: targetEmail,
      provider: result.provider || (result.mock ? "mock" : "unknown"),
      durationMs: result.durationMs,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
