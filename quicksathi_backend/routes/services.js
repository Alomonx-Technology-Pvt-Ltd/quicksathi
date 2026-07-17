import { Router } from "express";
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

    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$text = { $search: search };
    }

    // City filter: match services that include this city OR have no city restrictions (empty array)
    if (city && city !== "all") {
      filter.$or = [
        { cities: city },
        { cities: { $size: 0 } },
        { cities: { $exists: false } },
      ];
    }

    const services = await Service.find(filter)
      .limit(parseInt(limit))
      .sort("-featured -rating");

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/services/:id — Get single service
router.get("/:id", async (req, res) => {
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
