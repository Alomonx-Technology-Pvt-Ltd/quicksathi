import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const localFiles = [
  { key: "ac-checkup", file: "../quicksathi_frontend/public/images/ac/ac-checkup.jpg" },
  { key: "ac-lite-service", file: "../quicksathi_frontend/public/images/ac/ac-lite-service.jpg" },
  { key: "foam-jet-ac-service", file: "../quicksathi_frontend/public/images/ac/foam-jet-ac-service.jpg" },
  { key: "ac-gas-refill", file: "../quicksathi_frontend/public/images/ac/ac-gas-refill.jpg" },
  { key: "ac-installation", file: "../quicksathi_frontend/public/images/ac/ac-installation.jpg" },
  { key: "ac-uninstallation", file: "../quicksathi_frontend/public/images/ac/ac-uninstallation.jpg" },
  { key: "ac-annual-maintenance", file: "../quicksathi_frontend/public/images/ac/ac-annual-maintenance.jpg" },
  { key: "ac-service-repair", file: "../quicksathi_frontend/public/images/ac/ac-service-repair.jpg" },
  { key: "cctv-main", file: "../quicksathi_frontend/public/images/cctv-main.png" },
];

async function run() {
  console.log("Uploading local assets to Cloudinary...");
  const uploaded = {};
  for (const item of localFiles) {
    if (fs.existsSync(item.file)) {
      console.log(`Uploading ${item.key}...`);
      const res = await cloudinary.uploader.upload(item.file, {
        folder: "TiptoBook/services",
        public_id: item.key,
        overwrite: true,
      });
      uploaded[item.key] = res.secure_url;
      console.log(`Uploaded ${item.key}: ${res.secure_url}`);
    } else {
      console.warn(`File not found: ${item.file}`);
    }
  }

  // Upload working images for the 2 broken Unsplash URLs
  console.log("Uploading replacement images for broken Unsplash services...");
  const outstationCabImg = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1200&auto=format&fit=crop";
  const securityMaintImg = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop";

  const cabRes = await cloudinary.uploader.upload(outstationCabImg, {
    folder: "TiptoBook/services",
    public_id: "outstation-airport-cab",
    overwrite: true,
  });
  uploaded["outstation-cab"] = cabRes.secure_url;
  console.log(`Uploaded outstation cab: ${cabRes.secure_url}`);

  const secRes = await cloudinary.uploader.upload(securityMaintImg, {
    folder: "TiptoBook/services",
    public_id: "security-maintenance",
    overwrite: true,
  });
  uploaded["security-maintenance"] = secRes.secure_url;
  console.log(`Uploaded security maintenance: ${secRes.secure_url}`);

  fs.writeFileSync("./scripts/uploaded_cloudinary_map.json", JSON.stringify(uploaded, null, 2));
  console.log("Finished uploading all images to Cloudinary!");
}

run().catch(console.error);
