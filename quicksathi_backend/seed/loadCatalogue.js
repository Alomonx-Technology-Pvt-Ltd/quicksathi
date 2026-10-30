import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Service from "../models/Service.js";

/**
 * ADDITIVE CATALOGUE LOADER
 * ─────────────────────────
 * Loads seed/catalogue/services.json into the services collection.
 *   node seed/loadCatalogue.js                 → dry run (no writes)
 *   node seed/loadCatalogue.js --apply         → write changes
 *   --hide-unlisted                            → with --apply, set available:false on services in
 *                                                touched categories whose slug is not in the file
 *   --file <path> (or CATALOGUE_FILE env)      → alternate input file
 * Never creates categories, never deletes anything, never touches ids, availability of existing
 * services, approval, images, ratings, reviews, providers, featured or cities.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const HIDE_UNLISTED = args.includes("--hide-unlisted");
const fileArgIdx = args.indexOf("--file");
const FILE = path.resolve(
  fileArgIdx >= 0 ? args[fileArgIdx + 1] : process.env.CATALOGUE_FILE || path.join(__dirname, "catalogue/services.json")
);

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

function loadEntries() {
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (e) {
    fail(`Cannot read ${FILE}: ${e.message}`);
  }
  if (!Array.isArray(entries)) fail("Catalogue file must be a JSON array");
  const errors = [];
  const seen = new Set();
  entries.forEach((e, i) => {
    const where = `entry #${i}${e?.slug ? ` (${e.slug})` : ""}`;
    for (const f of ["slug", "vertical", "name"]) {
      if (typeof e?.[f] !== "string" || !e[f].trim()) errors.push(`${where}: missing ${f}`);
    }
    if (e?.slug) {
      if (seen.has(e.slug)) errors.push(`${where}: duplicate slug`);
      seen.add(e.slug);
    }
    if (!Array.isArray(e?.packages)) {
      errors.push(`${where}: packages must be an array`);
      return;
    }
    const titles = new Set();
    for (const p of e.packages) {
      if (typeof p?.title !== "string" || !p.title.trim()) errors.push(`${where}: package without title`);
      else if (titles.has(p.title)) errors.push(`${where}: duplicate package title "${p.title}"`);
      else titles.add(p.title);
      if (typeof p?.price !== "number" || !Number.isFinite(p.price)) {
        errors.push(`${where}: package "${p?.title}" has non-numeric price ${JSON.stringify(p?.price)}`);
      }
    }
  });
  if (errors.length) fail(`Invalid catalogue input:\n  ${errors.join("\n  ")}`);
  return entries;
}

// Add-on packages (`addOn: true` in the file) are extras, so they never set the "from" price.
const startingPriceOf = (packages) => {
  const positive = packages.filter((p) => !p.addOn).map((p) => p.price).filter((p) => p > 0);
  return positive.length ? Math.min(...positive) : 0;
};

const normPackages = (pkgs = []) =>
  pkgs.map((p) => ({ title: p.title, price: p.price, features: [...(p.features || [])], image: p.image || "" }));
const normFaqs = (faqs = []) => faqs.map((f) => ({ question: f.question, answer: f.answer }));

function desiredFields(entry, category, existing) {
  const oldByTitle = new Map((existing?.packages || []).map((p) => [p.title, p]));
  const packages = entry.packages.map((p) => ({
    title: p.title,
    price: p.price,
    features: [...(p.features || [])],
    image: oldByTitle.get(p.title)?.image || "",
  }));
  return {
    name: entry.name,
    shortDescription: entry.shortDescription || "",
    fullDescription: entry.fullDescription || "",
    priceUnit: entry.priceUnit || "per service",
    serviceMode: entry.serviceMode || "ON_SITE",
    tags: [...(entry.tags || [])],
    faqs: normFaqs(entry.faqs),
    category: category._id,
    categoryName: category.name,
    packages,
    startingPrice: startingPriceOf(entry.packages),
  };
}

const comparable = (field, v) => {
  if (field === "category") return v ? String(v) : null;
  if (field === "packages") return JSON.stringify(normPackages(v));
  if (field === "faqs") return JSON.stringify(normFaqs(v));
  if (field === "tags") return JSON.stringify(v || []);
  return v ?? null;
};

const fmtPkgs = (pkgs = []) => pkgs.map((p) => `${p.title}=${p.price}`).join(", ") || "(none)";

async function run() {
  const entries = loadEntries();
  if (!process.env.MONGODB_URI) fail("MONGODB_URI is not set");

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const { host, port, name: dbName } = mongoose.connection;
  console.log(`Target: host=${host}${port ? `:${port}` : ""} db=${dbName}`);
  console.log(`Mode: ${APPLY ? "APPLY (writes enabled)" : "DRY RUN (no writes; pass --apply to write)"}${HIDE_UNLISTED ? " +hide-unlisted" : ""}`);
  console.log(`File: ${FILE} (${entries.length} services)\n`);

  const totals = { CREATE: 0, UPDATE: 0, UNCHANGED: 0, SKIP: 0, HIDE: 0 };
  const categoryCache = new Map();
  const touchedCategories = new Map();

  for (const entry of entries) {
    if (!categoryCache.has(entry.vertical)) {
      const matches = await Category.find({ vertical: entry.vertical }).lean();
      const active = matches.filter((c) => c.active !== false);
      const pool = active.length ? active : matches;
      categoryCache.set(entry.vertical, pool.length === 1 ? { category: pool[0] } : { reason: pool.length ? `${pool.length} categories share vertical ${entry.vertical}` : `no category with vertical ${entry.vertical}` });
    }
    const { category, reason } = categoryCache.get(entry.vertical);
    if (!category) {
      totals.SKIP++;
      console.log(`SKIP      ${entry.slug} — ${reason}`);
      continue;
    }
    touchedCategories.set(String(category._id), category);

    const existing = await Service.findOne({ slug: entry.slug }).lean();
    const desired = desiredFields(entry, category, existing);

    if (!existing) {
      totals.CREATE++;
      console.log(`CREATE    ${entry.slug} [${category.name}] packages: ${fmtPkgs(desired.packages)}${entry.comingSoon ? " (unavailable: coming soon)" : ""}`);
      if (APPLY) {
        await Service.create({
          slug: entry.slug,
          ...desired,
          available: !entry.comingSoon,
          approvalStatus: "approved",
          cities: [],
        });
      }
      continue;
    }

    const changed = Object.keys(desired).filter(
      (f) => JSON.stringify(comparable(f, existing[f])) !== JSON.stringify(comparable(f, desired[f]))
    );
    if (!changed.length) {
      totals.UNCHANGED++;
      console.log(`UNCHANGED ${entry.slug}`);
      continue;
    }
    totals.UPDATE++;
    console.log(`UPDATE    ${entry.slug} — ${changed.join(", ")}`);
    if (changed.includes("packages")) {
      console.log(`            packages: ${fmtPkgs(existing.packages)}  ->  ${fmtPkgs(desired.packages)}`);
    }
    if (changed.includes("startingPrice")) {
      console.log(`            startingPrice: ${existing.startingPrice} -> ${desired.startingPrice}`);
    }
    if (APPLY) {
      const $set = Object.fromEntries(changed.map((f) => [f, desired[f]]));
      await Service.updateOne({ _id: existing._id }, { $set });
    }
  }

  // Services the --hide-unlisted flag would hide (always listed).
  const listedSlugs = entries.map((e) => e.slug);
  const unlisted = await Service.find({
    category: { $in: [...touchedCategories.values()].map((c) => c._id) },
    slug: { $nin: listedSlugs },
    available: { $ne: false },
  })
    .select("slug categoryName")
    .lean();
  if (unlisted.length) {
    console.log(`\n${HIDE_UNLISTED ? "HIDING" : "--hide-unlisted would hide"} ${unlisted.length} service(s) not in the file:`);
    for (const s of unlisted) console.log(`HIDE      ${s.slug} [${s.categoryName}]`);
    if (HIDE_UNLISTED) {
      totals.HIDE = unlisted.length;
      if (APPLY) await Service.updateMany({ _id: { $in: unlisted.map((s) => s._id) } }, { $set: { available: false } });
    }
  } else {
    console.log("\nNo available services outside the file in touched categories.");
  }

  console.log(
    `\nTotals: create=${totals.CREATE} update=${totals.UPDATE} unchanged=${totals.UNCHANGED} skip=${totals.SKIP}${HIDE_UNLISTED ? ` hide=${totals.HIDE}` : ""}`
  );
  if (!APPLY) console.log("Dry run complete — nothing was written.");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
