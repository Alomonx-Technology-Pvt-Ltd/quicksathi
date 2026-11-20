// One-off migration: one Provider profile per user (unique index on providers.user).
//   node scripts/migrations/004-provider-user-unique.mjs            # dry run: reports duplicates only
//   node scripts/migrations/004-provider-user-unique.mjs --apply    # builds the unique index
// It never deletes profiles. If a user has several, it stops and lists them for a human to resolve
// (keep the reviewed one, delete the others in the admin tools or the shell).
import "dotenv/config";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
await mongoose.connect(process.env.MONGODB_URI);
const providers = mongoose.connection.collection("providers");
console.log(`Database: ${mongoose.connection.name}  mode: ${apply ? "APPLY" : "dry run"}`);

const dups = await providers
  .aggregate([
    { $group: { _id: "$user", ids: { $push: { id: "$_id", status: "$approvalStatus", at: "$createdAt" } }, n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
  ])
  .toArray();
console.log(`users with more than one provider profile: ${dups.length}`);
for (const d of dups) console.log(`  user ${d._id}: ${d.ids.map((p) => `${p.id} (${p.status})`).join(", ")}`);

if (dups.length) {
  console.log("\nResolve the duplicates above, then re-run.");
  process.exitCode = 1;
} else if (apply) {
  try { await providers.dropIndex("user_1"); } catch { /* not present */ }
  await providers.createIndex({ user: 1 }, { unique: true, name: "user_1" });
  console.log("✅ unique index on providers.user created");
} else {
  console.log("\nNo duplicates. Re-run with --apply to create the unique index.");
}
await mongoose.disconnect();
