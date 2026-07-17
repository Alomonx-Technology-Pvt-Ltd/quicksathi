import { Router } from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications — Retrieve notifications for current logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort("-createdAt")
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to retrieve notifications" });
  }
});

// PUT /api/notifications/read-all — Mark all notifications as read
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to mark notifications as read" });
  }
});

// PUT /api/notifications/:id/read — Mark a single notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to mark notification as read" });
  }
});

// DELETE /api/notifications/:id — Delete a notification
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete notification" });
  }
});

export default router;
