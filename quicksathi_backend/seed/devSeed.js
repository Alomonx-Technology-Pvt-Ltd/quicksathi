// One command for a complete DEVELOPMENT catalog:  npm run seed:dev
//
//   1. seedData.js            base categories + services + default banners/coupons (wipes the catalog)
//   2. migrateACAppliances.js adds "AC & Appliances" and moves CCTV services (additive)
//   3. seedPanditService.js   adds the pandit service (upsert by slug)
//
// Run in this order the result is the same catalog every time. The guard runs first, so none of the
// steps can touch production or an unlisted database. (migrateACAppliances.js and seedPanditService.js are
// additive and may still be run on their own, deliberately, against any database.)
import "dotenv/config";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertSafeToSeed } from "./_guard.js";

assertSafeToSeed("seed/devSeed.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const steps = ["seedData.js", "migrateACAppliances.js", "seedPanditService.js"];

for (const step of steps) {
  console.log(`\n━━ ${step} ━━`);
  try {
    execFileSync(process.execPath, [path.join(here, step)], { stdio: "inherit", env: process.env });
  } catch {
    console.error(`❌ ${step} failed; stopping.`);
    process.exit(1);
  }
}
console.log("\n✅ Development catalog ready.");
