// Explicitly grant admin to an existing user with a verified email.
//   node scripts/grant-admin.mjs <email> --yes
// The only supported way to create an admin. Admin is never derived from ADMIN_EMAILS.
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = (process.argv[2] || "").trim().toLowerCase();
const confirmed = process.argv.includes("--yes");

if (!email || !confirmed) {
  console.error("Usage: node scripts/grant-admin.mjs <email> --yes");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const dbName = mongoose.connection.name;
  const user = await User.findOne({ email });
  if (!user) throw new Error(`No user with email ${email}. They must sign in once with Google first.`);
  if (!user.emailVerified) {
    throw new Error("This user's email is not verified. Ask them to sign in with Google (verified by Firebase) first.");
  }
  if (user.role === "admin") {
    console.log(`ℹ️  ${email} is already an admin (db: ${dbName}).`);
  } else {
    const before = user.role;
    user.role = "admin";
    await user.save();
    console.log(`✅ AUDIT ${new Date().toISOString()} db=${dbName} granted admin to ${email} (was ${before})`);
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
