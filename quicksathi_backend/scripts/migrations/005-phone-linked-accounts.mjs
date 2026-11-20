// One-off review: email/Google accounts that an OLD phone sign-in attached a phone identity to.
//   node scripts/migrations/005-phone-linked-accounts.mjs                    # report only (default)
//   node scripts/migrations/005-phone-linked-accounts.mjs --unlink=<id>,<id> # detach the phone identity
//
// Why: before WP-1, anyone could sign up with any phone number typed in, and a later phone (OTP)
// sign-in by that number's real owner was matched by phone and linked into that account
// (firebaseUid set). Today's sign-in matches by firebaseUid, so if the typed number was not the
// account owner's, the phone owner still lands in someone else's account.
// The data can't tell that apart from a customer who typed their OWN number and later used OTP,
// so nothing is changed automatically: review the list (contact the customer if unsure), then
// unlink only the accounts that are squats. Unlinking removes phone + firebaseUid and ends every
// existing login on that account; the phone owner's next OTP sign-in creates their own account.
import "dotenv/config";
import mongoose from "mongoose";

const unlinkArg = process.argv.find((a) => a.startsWith("--unlink="));
const unlinkIds = unlinkArg ? unlinkArg.slice("--unlink=".length).split(",").map((s) => s.trim()).filter(Boolean) : [];

// Optional: ask Firebase which sign-in method the stored uid belongs to (phone vs Google).
let firebaseAuth = null;
try {
  ({ firebaseAuth } = await import("../../config/firebase.js"));
} catch { /* report without the Firebase column */ }

await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");
const bookings = mongoose.connection.collection("bookings");
console.log(`Database: ${mongoose.connection.name}  mode: ${unlinkIds.length ? "UNLINK" : "report"}`);

const candidates = await users
  .find(
    { authProvider: { $ne: "phone" }, firebaseUid: { $type: "string", $gt: "" }, phone: { $type: "string", $gt: "" } },
    { projection: { email: 1, emailVerified: 1, authProvider: 1, phone: 1, firebaseUid: 1, role: 1, createdAt: 1 } }
  )
  .toArray();

console.log(`accounts (not created by phone sign-in) holding a phone number and a Firebase identity: ${candidates.length}`);
for (const u of candidates) {
  let firebase = "firebase: not checked";
  if (firebaseAuth?.getUser) {
    try {
      const fb = await firebaseAuth.getUser(u.firebaseUid);
      const methods = fb.providerData.map((p) => p.providerId).join("+") || "none";
      const samePhone = fb.phoneNumber && fb.phoneNumber === u.phone;
      firebase = `firebase: ${methods}${samePhone ? ", uid is this phone number's OTP identity  <-- review" : ""}`;
    } catch (err) {
      firebase = `firebase: lookup failed (${err.code || err.message})`;
    }
  }
  const n = await bookings.countDocuments({ user: u._id });
  console.log(`  ${u._id}  ${u.email || "(no email)"}  ${u.authProvider}${u.emailVerified ? " verified" : " UNVERIFIED"}  role=${u.role}  phone=${u.phone}  bookings=${n}  created=${u.createdAt?.toISOString?.() || "?"}  ${firebase}`);
}

for (const id of unlinkIds) {
  if (!mongoose.isValidObjectId(id) || !candidates.some((u) => String(u._id) === id)) {
    console.error(`❌ ${id} is not in the list above; skipped`);
    process.exitCode = 1;
    continue;
  }
  await users.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $unset: { firebaseUid: "", phone: "" }, $set: { tokensValidAfter: new Date() } }
  );
  console.log(`✅ AUDIT ${new Date().toISOString()} db=${mongoose.connection.name} unlinked phone identity from ${id}; its existing logins ended`);
}

if (!unlinkIds.length && candidates.length) {
  console.log("\nReview the list. Unlink squatted accounts with --unlink=<id>,<id>.");
}
await mongoose.disconnect();
