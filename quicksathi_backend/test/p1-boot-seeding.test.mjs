// The server must never write default data at boot (it used to resurrect banners/coupons
// that an admin had deleted). Default data comes from `npm run seed:dev` only.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

test("P1-23d/e: booting the server on an empty database creates no banners or coupons", async () => {
  await new Promise((r) => setTimeout(r, 1500));
  assert.equal(await s.db.collection("banners").countDocuments(), 0, "banners were created at boot");
  assert.equal(await s.db.collection("coupons").countDocuments(), 0, "coupons were created at boot");
});

test("P1-23d/e: banners and coupons deleted by an admin stay deleted after a restart", async () => {
  await s.db.collection("coupons").insertOne({ code: "KEEPGONE", title: "x", discountType: "fixed", discountValue: 10, isActive: true, usedBy: [], usedCount: 0 });
  await s.db.collection("coupons").deleteMany({});
  await s.restart();
  await new Promise((r) => setTimeout(r, 1500));
  assert.equal(await s.db.collection("coupons").countDocuments(), 0);
  assert.equal(await s.db.collection("banners").countDocuments(), 0);
});
