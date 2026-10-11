import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const snapshot = async () => ({
  categories: await s.db.collection("categories").countDocuments({ active: true }),
  services: await s.db.collection("services").countDocuments(),
  acServices: await s.db.collection("services").countDocuments({ slug: { $in: ["ac-checkup", "foam-jet-ac-service", "ac-gas-refill"] } }),
  pandit: await s.db.collection("services").countDocuments({ slug: "pandit-service" }),
  ac: await s.db.collection("categories").countDocuments({ vertical: "AC_APPLIANCES" }),
});

test("WP-6: seed:dev builds the complete catalog in one command, and re-running gives the same result", async () => {
  const first = await s.runScript("seed/devSeed.js", {}, 90_000);
  assert.equal(first.code, 0, first.out.slice(-800));
  const a = await snapshot();
  assert.equal(a.ac, 1, "AC & Appliances category missing");
  assert.equal(a.acServices, 3, "AC services missing");
  assert.equal(a.pandit, 1, "pandit service missing");
  // Every seeded service points at a category that exists (the old seed failed on this).
  const orphans = await s.db.collection("services").aggregate([
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "c" } },
    { $match: { c: { $size: 0 } } },
  ]).toArray();
  assert.equal(orphans.length, 0, `services without a category: ${orphans.map((o) => o.slug)}`);

  const second = await s.runScript("seed/devSeed.js", {}, 90_000);
  assert.equal(second.code, 0, second.out.slice(-800));
  assert.deepEqual(await snapshot(), a);
});

test("WP-6: seed:dev refuses production", async () => {
  const run = await s.runScript("seed/devSeed.js", { NODE_ENV: "production" });
  assert.equal(run.code, 1);
  assert.match(run.out, /refused to run/);
});
