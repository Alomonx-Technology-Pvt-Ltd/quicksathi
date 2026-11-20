import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

test("WP-12: the sitemap generator works and lists only public, bookable pages", async () => {
  const visible = await s.createService();
  const draft = await s.createService({ approvalStatus: "pending", available: false });
  await s.db.collection("categories").insertOne({ name: "Vehicle Rental", vertical: "VEHICLE_RENTAL", active: true });
  await s.db.collection("categories").insertOne({ name: "Hidden", vertical: "HIDDEN_ONE", active: false });

  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-")), "sitemap.xml");
  const run = await s.runScript("scripts/generate_sitemap.js", { SITE_URL: "https://example.test" }, 30_000, ["--out", out]);
  assert.equal(run.code, 0, run.out);

  const xml = fs.readFileSync(out, "utf8");
  assert.ok(xml.includes(`https://example.test/service/${visible.slug}`));
  assert.ok(!xml.includes(draft.slug), "unapproved service is listed");
  assert.ok(xml.includes("https://example.test/category/vehicle-rental"));
  assert.ok(!xml.includes("hidden-one"), "inactive category is listed");
  assert.ok(xml.includes("https://example.test/privacy-policy"));
  assert.ok(!xml.includes("<changefreq>"));
});
