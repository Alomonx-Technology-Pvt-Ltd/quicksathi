// In-app alerts for every active admin; they show in the admin panel's alert feed (GET /api/admin/notifications).
// Never throws: an alert that fails to save must not fail the request that triggered it.
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function notifyAdmins(title, message) {
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id");
    if (admins.length) {
      await Notification.insertMany(admins.map((a) => ({ recipient: a._id, title, message, type: "system" })));
    }
  } catch (err) {
    console.error("Admin alert error:", err?.message || err);
  }
}
