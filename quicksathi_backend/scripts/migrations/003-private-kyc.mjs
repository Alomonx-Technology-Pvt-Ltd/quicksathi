// One-off migration: move provider KYC files from public Cloudinary URLs to private (authenticated)
// assets, then delete the public copies (ADR-0006, services/kyc.js).
//   node scripts/migrations/003-private-kyc.mjs            # dry run: counts files to move
//   node scripts/migrations/003-private-kyc.mjs --apply    # copies, updates the provider, deletes the public copy
// Safe to re-run: rows already holding a private reference are skipped. A file that fails to copy is
// left untouched (and reported) so nothing is lost.
import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { isPrivateKycRef, uploadPrivateKyc } from "../../services/kyc.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const apply = process.argv.includes("--apply");
const FIELDS = ["idProof", "businessRegistration", "selfiePhoto"];
const FOLDER = { selfiePhoto: "TiptoBook/providers/selfies" };

// https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg -> folder/name
const publicIdFromUrl = (url) => {
  const m = /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i.exec(url);
  return m ? m[1] : null;
};

await mongoose.connect(process.env.MONGODB_URI);
const providers = mongoose.connection.collection("providers");
console.log(`Database: ${mongoose.connection.name}  mode: ${apply ? "APPLY" : "dry run"}`);

const rows = await providers.find({}, { projection: { documents: 1, businessName: 1 } }).toArray();
let pending = 0, moved = 0, failed = 0, notDeleted = 0;
for (const row of rows) {
  for (const field of FIELDS) {
    const value = row.documents?.[field];
    if (!value || isPrivateKycRef(value)) continue;
    pending++;
    if (!apply) continue;
    try {
      const ref = await uploadPrivateKyc(value, FOLDER[field] || "TiptoBook/providers/documents");
      await providers.updateOne({ _id: row._id }, { $set: { [`documents.${field}`]: ref } });
      // The private copy is saved; now remove the public one. If that fails, the row already looks
      // migrated and a re-run would skip it, so log the public URL for manual deletion.
      const oldId = publicIdFromUrl(value);
      if (oldId && value.includes("res.cloudinary.com")) {
        try {
          await cloudinary.uploader.destroy(oldId, { invalidate: true });
        } catch (err) {
          notDeleted++;
          console.error(`  ⚠ ${row._id} ${field}: private copy saved, but the PUBLIC copy was NOT deleted (${err?.message || err}). Delete it by hand: ${value}`);
        }
      }
      moved++;
    } catch (err) {
      failed++;
      console.error(`  ✖ ${row._id} ${field}: ${err?.message || err}`);
    }
  }
}
console.log(`public KYC files: ${pending}${apply ? `, moved: ${moved}, failed: ${failed}, public copies still to delete by hand: ${notDeleted}` : ""}`);
if (!apply) console.log("\nRe-run with --apply to move them.");
if (failed || notDeleted) process.exitCode = 1;
await mongoose.disconnect();
