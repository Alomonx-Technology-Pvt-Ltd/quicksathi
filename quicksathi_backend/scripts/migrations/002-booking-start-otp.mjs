// One-off migration: give every open booking (pending/confirmed) a fresh doorstep start code from a
// secure random source, and clear codes on bookings that can no longer be started.
//   node scripts/migrations/002-booking-start-otp.mjs            # dry run: prints counts only
//   node scripts/migrations/002-booking-start-otp.mjs --apply    # writes
// Codes created by the earlier Math.random() version are replaced too. Customers see the new code in My Bookings.
import "dotenv/config";
import crypto from "node:crypto";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
await mongoose.connect(process.env.MONGODB_URI);
const bookings = mongoose.connection.collection("bookings");
console.log(`Database: ${mongoose.connection.name}  mode: ${apply ? "APPLY" : "dry run"}`);

const open = await bookings.find({ status: { $in: ["pending", "confirmed"] } }, { projection: { _id: 1 } }).toArray();
const closedWithCode = await bookings.countDocuments({ status: { $nin: ["pending", "confirmed"] }, startOtp: { $exists: true } });
console.log(`open bookings to (re)issue a code: ${open.length}`);
console.log(`closed bookings with a leftover code to clear: ${closedWithCode}`);

if (apply) {
  for (const { _id } of open) {
    const code = String(crypto.randomInt(0, 10000)).padStart(4, "0");
    await bookings.updateOne({ _id }, { $set: { startOtp: code, startOtpAttempts: 0 } });
  }
  await bookings.updateMany({ status: { $nin: ["pending", "confirmed"] } }, { $unset: { startOtp: "", startOtpAttempts: "" } });
  console.log("✅ done");
} else {
  console.log("\nRe-run with --apply to write.");
}
await mongoose.disconnect();
