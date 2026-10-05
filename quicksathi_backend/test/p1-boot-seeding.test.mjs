// Admin deletions must survive a server restart (no import-time re-seeding).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const settle = (ms) => new Promise((r) => setTimeout(r, ms));

test("P1-23d/e: banners and coupons deleted by an admin stay deleted after a restart", async () => {
  // Today's import-time seeding runs sequential queries after the server is already listening.
  for (let i = 0; i < 40 && (await s.db.collection("banners").countDocuments()) === 0; i++) await settle(250);
  await settle(2000);
  const banner = await s.db.collection("banners").findOne({});
  if (banner) await s.db.collection("banners").deleteOne({ _id: banner._id });
  await s.db.collection("coupons").deleteMany({});
  await s.restart();
  await settle(4000);
  if (banner) {
    const back = await s.db.collection("banners").countDocuments({ title: banner.title, section: banner.section });
    assert.equal(back, 0, `deleted banner "${banner.title}" was re-created on boot`);
  }
  const coupons = await s.db.collection("coupons").countDocuments();
  assert.equal(coupons, 0, `${coupons} default coupons re-created on boot`);
});
