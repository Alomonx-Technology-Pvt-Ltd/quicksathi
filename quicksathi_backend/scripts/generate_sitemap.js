// Generates quicksathi_frontend/public/sitemap.xml from the live catalog.
//   node scripts/generate_sitemap.js [--out path/to/sitemap.xml]
// Env: MONGODB_URI (required), SITE_URL (default https://www.tiptobook.com)
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import Category from "../models/Category.js";

const SITE_URL = (process.env.SITE_URL || "https://www.tiptobook.com").replace(/\/+$/, "");
const here = path.dirname(fileURLToPath(import.meta.url));
const outArg = process.argv.indexOf("--out");
const outPath = outArg > -1 ? path.resolve(process.argv[outArg + 1]) : path.resolve(here, "../../quicksathi_frontend/public/sitemap.xml");

// Pages that exist in quicksathi_frontend/src/App.jsx and should be indexed.
const STATIC_PAGES = [
  "/", "/services", "/services/ac", "/about-us", "/contact", "/provider/onboarding",
  "/privacy-policy", "/terms-and-conditions", "/provider/rules-and-policies", "/provider/terms-and-conditions",
];

const xmlEscape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const day = (d) => new Date(d || Date.now()).toISOString().split("T")[0];
const entry = (loc, lastmod) => `  <url>\n    <loc>${xmlEscape(SITE_URL + loc)}</loc>\n    <lastmod>${day(lastmod)}</lastmod>\n  </url>\n`;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const services = await Service.find({ available: true, approvalStatus: "approved" }).select("slug updatedAt").sort("slug").lean();
  const categories = await Category.find({ active: true, comingSoon: { $ne: true } }).select("vertical updatedAt").lean();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const p of STATIC_PAGES) xml += entry(p);

  // AC & Appliances is served at /services/ac (already listed above).
  const seen = new Set();
  for (const c of categories) {
    if (!c.vertical || c.vertical === "AC_APPLIANCES") continue;
    const slug = c.vertical.toLowerCase().replace(/_/g, "-");
    if (seen.has(slug)) continue;
    seen.add(slug);
    xml += entry(`/category/${slug}`, c.updatedAt);
  }

  let serviceCount = 0;
  for (const s of services) {
    if (!s.slug) continue; // never emit ObjectId URLs
    xml += entry(`/service/${s.slug}`, s.updatedAt);
    serviceCount += 1;
  }
  xml += `</urlset>\n`;

  fs.writeFileSync(outPath, xml, "utf-8");
  console.log(`Sitemap written to ${outPath}: ${STATIC_PAGES.length} pages, ${seen.size} categories, ${serviceCount} services`);
}

run()
  .catch((err) => {
    console.error("Sitemap generation failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
