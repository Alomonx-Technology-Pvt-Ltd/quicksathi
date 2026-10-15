// Prints role COUNTS only (no names or emails). Read-only.
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

await connectDB();
const counts = await User.aggregate([{ $group: { _id: "$role", users: { $sum: 1 } } }]);
console.table(counts.map((c) => ({ role: c._id, users: c.users })));
await mongoose.disconnect();
