import { Router } from "express";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = Router();

// GET /api/services/cities — Get all distinct cities across services
router.get("/cities", async (req, res) => {
  try {
    const cities = await Service.distinct("cities", {
      available: true,
      approvalStatus: "approved",
      cities: { $ne: "" },
    });
    res.json(cities.filter(Boolean).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/services — Get all services (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { category, featured, search, city, limit = 50 } = req.query;
    const filter = { available: true, approvalStatus: "approved" };

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        // Caller passed a real ObjectId — filter directly on the ref field
        filter.category = category;
      } else {
        // Caller passed a name string (e.g. "Tuition") — resolve to ObjectId
        // and also match on the denormalised categoryName field as a fallback
        const Category = (await import("../models/Category.js")).default;
        const cat = await Category.findOne({
          name: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });

        if (cat) {
          filter.$or = [
            { category: cat._id },
            { categoryName: { $regex: new RegExp(category, "i") } },
          ];
        } else {
          // No matching category ObjectId found — fall back to categoryName string match
          filter.categoryName = { $regex: new RegExp(category, "i") };
        }
      }
    }

    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$text = { $search: search };
    }

    // City filter: match services that include this city OR have no city restrictions (empty array)
    if (city && city !== "all") {
      const cityFilter = [
        { cities: city },
        { cities: { $size: 0 } },
        { cities: { $exists: false } },
      ];
      // Merge with any existing $or (e.g. from category name lookup)
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: cityFilter },
        ];
        delete filter.$or;
      } else {
        filter.$or = cityFilter;
      }
    }

    const services = await Service.find(filter)
      .limit(parseInt(limit))
      .sort("-featured -rating");

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/services/:id — Get single service (by Service ObjectId, SubCategory/Category ObjectId, slug, or name)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let service = null;

    // 1. Try finding by Service ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id);
    }

    // 2. Try finding by slug or exact name
    if (!service) {
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      service = await Service.findOne({
        $or: [
          { slug: id.toLowerCase() },
          { name: { $regex: new RegExp(`^${escapedId}$`, "i") } },
        ],
      });
    }

    // 3. If ID is a SubCategory or Category ObjectId, find matching category/subCategory and retrieve its Service
    if (!service && mongoose.Types.ObjectId.isValid(id)) {
      const Category = (await import("../models/Category.js")).default;
      const cat = await Category.findOne({
        $or: [{ _id: id }, { "subCategories._id": id }],
      });

      if (cat) {
        const sub = cat.subCategories?.id(id);
        const searchName = sub ? sub.name : cat.name;
        const escapedSearchName = searchName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        service = await Service.findOne({
          $or: [
            { name: { $regex: new RegExp(escapedSearchName, "i") } },
            { categoryName: { $regex: new RegExp(escapedSearchName, "i") } },
            { category: cat._id },
          ],
        });
      }
    }

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/services/slug/:slug — Get service by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/services — Create service (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/services/:id — Update service (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/services/:id — Delete service (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
