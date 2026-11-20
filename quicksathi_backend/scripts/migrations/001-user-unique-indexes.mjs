// One-off migration: make User.phone and User.firebaseUid unique (ignoring empty values).
//   node scripts/migrations/001-user-unique-indexes.mjs            # dry run: reports duplicates only
//   node scripts/migrations/001-user-unique-indexes.mjs --apply    # drops legacy indexes, builds unique ones
// It never merges or deletes accounts. If duplicates exist it stops and prints them for a human to resolve.
import "dotenv/config";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");
console.log(`Database: ${mongoose.connection.name}  mode: ${apply ? "APPLY" : "dry run"}`);

let blocked = false;
for (const field of ["phone", "firebaseUid"]) {
  const dups = await users
    .aggregate([
      { $match: { [field]: { $type: "string", $gt: "" } } },
      { $group: { _id: `$${field}`, ids: { $push: "$_id" }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();
  console.log(`${field}: ${dups.length} duplicated value(s)`);
  for (const d of dups) console.log(`  ${d._id}  -> user ids ${d.ids.join(", ")}`);
  if (dups.length) blocked = true;
}

if (blocked) {
  console.log("\nResolve the duplicates above (merge or clear one of each pair), then re-run.");
  process.exitCode = 1;
} else if (apply) {
  for (const legacy of ["phone_1", "firebaseUid_1"]) {
    try { await users.dropIndex(legacy); console.log(`dropped ${legacy}`); } catch { /* not present */ }
  }
  await users.createIndex({ phone: 1 }, { unique: true, name: "phone_unique", partialFilterExpression: { phone: { $type: "string", $gt: "" } } });
  await users.createIndex({ firebaseUid: 1 }, { unique: true, name: "firebaseUid_unique", partialFilterExpression: { firebaseUid: { $type: "string", $gt: "" } } });
  console.log("✅ unique indexes created");
} else {
  console.log("\nNo duplicates. Re-run with --apply to create the unique indexes.");
}
await mongoose.disconnect();
