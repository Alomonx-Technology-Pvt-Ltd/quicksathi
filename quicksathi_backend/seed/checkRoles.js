import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const run = async () => {
  await connectDB();
  const users = await User.find({});
  const roles = new Set(users.map(u => u.role));
  console.log("Existing user roles in database:", Array.from(roles));
  console.log("Sample users:");
  users.slice(0, 10).forEach(u => {
    console.log(`- ${u.name} (${u.email}): role=${u.role}`);
  });
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
