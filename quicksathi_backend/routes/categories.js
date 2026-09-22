import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = Router();

// GET /api/categories — Get all active categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort("displayOrder");
    // Cache at CDN edge for 60s, serve stale for up to 5min while revalidating
    // This makes Vercel's Edge Network cache the response — instant for users
    res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/:id — Get single category (by ObjectId, slug, vertical, or name)
router.get("/:id", async (req, res) => {
  try {
    const rawId = req.params.id;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      category = await Category.findById(rawId);
    }

    if (!category) {
      const cleanName = rawId.replace(/-/g, " ");
      category = await Category.findOne({
        $or: [
          { name: new RegExp(`^${cleanName}$`, "i") },
          { vertical: rawId.toUpperCase().replace(/-/g, "_") },
        ],
      });
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories — Create category (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id — Update category (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

