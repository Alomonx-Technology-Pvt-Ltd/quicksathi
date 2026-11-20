import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack, daysFromNow, uid } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const slot = (service, extra = {}) => ({
  serviceId: service.slug, packageIndex: 0, scheduledDate: daysFromNow(3).toISOString(), scheduledTime: "10:00", paymentMethod: "cod", ...extra,
});

test("WP-3: /bookings/quote returns exactly what booking creation stores", async () => {
  const user = await s.createUser();
  const service = await s.createService({ price: 2000 });
  const code = uid("Q").toUpperCase();
  await s.createCoupon({ code, discountType: "percentage", discountValue: 10, maxDiscountAmount: 150 });
  const q = await s.api("POST", "/bookings/quote", { token: user.token, body: { serviceId: service.slug, packageIndex: 0, couponCode: code } });
  assert.equal(q.status, 200, q.text);
  assert.deepEqual([q.body.originalAmount, q.body.discountAmount, q.body.amount], [2000, 150, 1850]);
  await s.api("POST", "/bookings", { token: user.token, body: slot(service, { couponCode: code, amount: 1 }) });
  const b = await s.db.collection("bookings").findOne({ user: user._id });
  assert.deepEqual([b.originalAmount, b.discountAmount, b.amount], [2000, 150, 1850]);
});

test("WP-3: the package is chosen by index or title, price is the catalog price", async () => {
  const user = await s.createUser();
  const service = await s.createService({ price: 500 });
  await s.db.collection("services").updateOne({ _id: service._id }, { $set: { packages: [{ title: "Basic", price: 500 }, { title: "Premium", price: 1500 }] } });
  const byTitle = await s.api("POST", "/bookings/quote", { token: user.token, body: { serviceId: service.slug, packageTitle: "Premium" } });
  const byIndex = await s.api("POST", "/bookings/quote", { token: user.token, body: { serviceId: service.slug, packageIndex: 0 } });
  assert.equal(byTitle.body.amount, 1500);
  assert.equal(byIndex.body.amount, 500);
});

test("WP-3: rental price uses the stored per-km rate, not a client rate", async () => {
  const user = await s.createUser();
  const service = await s.createService({ price: 100 });
  await s.db.collection("services").updateOne({ _id: service._id }, { $set: { serviceMode: "RENTAL", perKmRate: 20 } });
  const q = await s.api("POST", "/bookings/quote", { token: user.token, body: { serviceId: service.slug, distanceKm: 10, perKmRate: 1 } });
  assert.equal(q.body.amount, 200);
});

test("WP-3: an unapproved or disabled service cannot be booked", async () => {
  const user = await s.createUser();
  const draft = await s.createService({ approvalStatus: "pending", available: false });
  const res = await s.api("POST", "/bookings", { token: user.token, body: slot(draft) });
  assert.equal(res.status, 404);
});

test("WP-3: an invalid coupon fails the booking instead of being ignored", async () => {
  const user = await s.createUser();
  const service = await s.createService();
  const res = await s.api("POST", "/bookings", { token: user.token, body: slot(service, { couponCode: "NOPE-NOT-REAL" }) });
  assert.equal(res.status, 400);
  assert.equal(await s.db.collection("bookings").countDocuments({ user: user._id }), 0);
});

test("WP-3: a failed booking does not burn the coupon", async () => {
  const user = await s.createUser();
  const service = await s.createService();
  const code = uid("KEEP").toUpperCase();
  const coupon = await s.createCoupon({ code });
  const res = await s.api("POST", "/bookings", { token: user.token, body: slot(service, { couponCode: code, paymentMethod: "bitcoin" }) });
  assert.equal(res.status, 400);
  const after = await s.db.collection("coupons").findOne({ _id: coupon._id });
  assert.equal(after.usedCount, 0);
});

test("WP-3: a date-only coupon expiry lasts until the end of that day in IST", async () => {
  const admin = await s.createUser({ role: "admin" });
  const day = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const res = await s.api("POST", "/coupons", { token: admin.token, body: { code: uid("EOD").toUpperCase(), title: "x", discountValue: 50, validUntil: day } });
  assert.equal(res.status, 201, res.text);
  assert.equal(new Date(res.body.validUntil).toISOString(), new Date(`${day}T23:59:59.999+05:30`).toISOString());
});

test("WP-3: bad coupon values from the admin are 400, not 500", async () => {
  const admin = await s.createUser({ role: "admin" });
  for (const body of [
    { code: uid("A").toUpperCase(), title: "x", discountValue: 10, usageLimit: -5 },
    { code: uid("B").toUpperCase(), title: "x", discountValue: 10, validUntil: "garbage" },
    { code: uid("C").toUpperCase(), title: "x", discountValue: 10, discountType: "bogus" },
  ]) {
    const res = await s.api("POST", "/coupons", { token: admin.token, body });
    assert.equal(res.status, 400, `${JSON.stringify(body)} -> ${res.status}`);
  }
});
