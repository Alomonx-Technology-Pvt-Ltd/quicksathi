import "dotenv/config";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import fs from "fs";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for sitemap generation...");

  const services = await Service.find({ available: true }).sort("slug");
  const categories = await Category.find({ active: true }).sort("displayOrder");

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Main Pages -->
  <url>
    <loc>https://www.tiptobook.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.tiptobook.com/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.tiptobook.com/services/ac</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.tiptobook.com/about-us</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.tiptobook.com/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.tiptobook.com/provider/onboarding</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>

  <!-- Main Category Pages -->
`;

  const categorySlugs = [
    { slug: "vehicle-rental", name: "Vehicle Rental" },
    { slug: "wedding", name: "Wedding & Party Services" },
    { slug: "house-help", name: "House Help" },
    { slug: "house-services", name: "House Services & Repair" },
    { slug: "home-salon", name: "Home Salon & Beauty" },
    { slug: "home-tuition", name: "Home Tuition" },
    { slug: "cctv-security", name: "CCTV Security" },
    { slug: "painting", name: "Painting" },
  ];

  for (const cs of categorySlugs) {
    xml += `  <url>
    <loc>https://www.tiptobook.com/category/${cs.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
`;
  }

  xml += `\n  <!-- Live Service Catalog (${services.length} services) -->\n`;

  const seenSlugs = new Set();
  for (const s of services) {
    const slug = s.slug || s._id;
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    xml += `  <url>
    <loc>https://www.tiptobook.com/service/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
`;
  }

  xml += `</urlset>\n`;

  const targetPath = "../quicksathi_frontend/public/sitemap.xml";
  fs.writeFileSync(targetPath, xml, "utf-8");
  console.log(`Generated sitemap with ${seenSlugs.size + categorySlugs.length + categories.length + 6} URLs written to ${targetPath}`);

  await mongoose.disconnect();
}

run().catch(console.error);
