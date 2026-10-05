// P1 acceptance tests for business rules, admin and provider lifecycle.
// Each test asserts the intended behaviour from docs/fix-plan-p0-p1.md.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startStack, daysFromNow, uid } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const bookingBody = (service, extra = {}) => ({
  serviceId: service.slug, packageIndex: 0, scheduledDate: daysFromNow(3).toISOString(),
  scheduledTime: "10:00", paymentMethod: "cod", ...extra,
});

test("P1-6: admin broadcast response does not leak recipient email addresses", async () => {
  const admin = await s.createUser({ role: "admin" });
  const bystander = await s.createUser();
  const res = await s.api("POST", "/admin/send-email", { token: admin.token, body: { recipientType: "all", subject: "Hello", body: "Test", channels: ["web"] } });
  assert.ok(res.status < 400, `broadcast failed: ${res.text}`);
  assert.ok(!res.text.includes(bystander.email), "response contains other users' email addresses");
});

test("P1-7a: a provider cannot move a completed booking back to pending", async () => {
  const { provider, user: provUser } = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: customer, service, provider, status: "completed", paymentStatus: "paid" });
  const res = await s.api("PATCH", `/providers/bookings/${booking._id}/status`, { token: provUser.token, body: { status: "pending" } });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
  assert.equal(after.status, "completed");
});

test("P1-7b: a customer cannot cancel a booking that is already in progress", async () => {
  const customer = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: customer, service, status: "in_progress" });
  const res = await s.api("PATCH", `/bookings/${booking._id}/cancel`, { token: customer.token, body: {} });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
  assert.equal(after.status, "in_progress");
});

test("P1-9a: booking with an exhausted coupon is rejected, not silently charged full price", async () => {
  const customer = await s.createUser();
  const service = await s.createService({ price: 1000 });
  const code = uid("LIM").toUpperCase();
  await s.createCoupon({ code, usageLimit: 1, usedCount: 1 });
  const res = await s.api("POST", "/bookings", { token: customer.token, body: bookingBody(service, { couponCode: code }) });
  const discounted = await s.db.collection("bookings").findOne({ user: customer._id, discountAmount: { $gt: 0 } });
  assert.equal(discounted, null, "exhausted coupon was still applied");
  assert.ok(res.status >= 400, `expected 4xx for an exhausted coupon, got ${res.status}`);
});

test("P1-9b: a coupon whose validFrom is in the future cannot be used yet", async () => {
  const customer = await s.createUser();
  const code = uid("FUT").toUpperCase();
  await s.createCoupon({ code, validFrom: daysFromNow(2) });
  const res = await s.api("POST", "/coupons/validate", { token: customer.token, body: { code, orderAmount: 1000 } });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
});

test("P1-9c: concurrent bookings cannot redeem a one-time coupon twice", async () => {
  const customer = await s.createUser();
  const service = await s.createService({ price: 1000 });
  const code = uid("ONE").toUpperCase();
  await s.createCoupon({ code });
  await Promise.all(Array.from({ length: 5 }, () => s.api("POST", "/bookings", { token: customer.token, body: bookingBody(service, { couponCode: code }) })));
  const n = await s.db.collection("bookings").countDocuments({ user: customer._id, discountAmount: { $gt: 0 } });
  assert.ok(n <= 1, `one-time coupon redeemed ${n} times`);
});

test("P1-10: admins cannot create a percentage coupon above 100%", async () => {
  const admin = await s.createUser({ role: "admin" });
  const res = await s.api("POST", "/coupons", { token: admin.token, body: { code: uid("BAD").toUpperCase(), title: "x", discountType: "percentage", discountValue: 150 } });
  assert.equal(res.status, 400, `expected 400, got ${res.status}`);
});

test("P1-11: bookings cannot be scheduled in the past", async () => {
  const customer = await s.createUser();
  const service = await s.createService();
  const res = await s.api("POST", "/bookings", { token: customer.token, body: bookingBody(service, { scheduledDate: daysFromNow(-1).toISOString() }) });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
});

test("P1-14: two accounts cannot share the same phone number", async () => {
  const phone = "+919876500001";
  const a = await s.api("POST", "/auth/register", { body: { name: "a", email: `${uid("a")}@example.test`, password: "Password123!", phone } });
  assert.equal(a.status, 201, `precondition failed: ${a.text}`);
  const b = await s.api("POST", "/auth/register", { body: { name: "b", email: `${uid("b")}@example.test`, password: "Password123!", phone } });
  assert.ok(b.status >= 400, `second account with same phone was created (status ${b.status})`);
});

test("P1-16: admins can change a booking's status from the admin panel endpoint", async () => {
  const admin = await s.createUser({ role: "admin" });
  const customer = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: customer, service });
  const res = await s.api("PATCH", `/admin/bookings/${booking._id}/status`, { token: admin.token, body: { status: "confirmed" } });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.equal(res.status, 200, `got ${res.status}: ${res.text.slice(0, 120)}`);
  assert.equal(after.status, "confirmed");
});

test("P1-17: admins can reach every user, not just the newest 100", async () => {
  const admin = await s.createUser({ role: "admin" });
  const oldest = await s.createUser({ name: "Oldest" });
  await s.db.collection("users").updateOne({ _id: oldest._id }, { $set: { createdAt: new Date("2020-01-01") } });
  await s.db.collection("users").insertMany(Array.from({ length: 110 }, (_, i) => ({ name: `Bulk ${i}`, email: `${uid("bulk")}@example.test`, role: "user", isActive: true, createdAt: new Date() })));
  const first = await s.api("GET", "/admin/users", { token: admin.token });
  const total = Array.isArray(first.body) ? first.body.length : first.body?.total;
  assert.ok(total >= 112, `admin can only see ${total} users`);
});

test("P1-18a: rejecting a provider revokes their provider role", async () => {
  const admin = await s.createUser({ role: "admin" });
  const { provider, user } = await s.createProvider();
  await s.api("PATCH", `/admin/providers/${provider._id}/reject`, { token: admin.token, body: { reason: "test" } });
  const after = await s.db.collection("users").findOne({ _id: user._id });
  assert.notEqual(after.role, "provider");
});

test("P1-18b: promoting a user to provider does not auto-approve a provider profile", async () => {
  const admin = await s.createUser({ role: "admin" });
  const user = await s.createUser();
  await s.api("PATCH", `/admin/users/${user._id}/role`, { token: admin.token, body: { role: "provider" } });
  const prov = await s.db.collection("providers").findOne({ user: user._id });
  assert.notEqual(prov?.approvalStatus, "approved", "provider profile auto-approved without KYC");
});

test("P1-19: deleting a user keeps their booking history attributable", async () => {
  const admin = await s.createUser({ role: "admin" });
  const customer = await s.createUser();
  const service = await s.createService();
  await s.createBooking({ user: customer, service, paymentStatus: "paid" });
  await s.api("DELETE", `/admin/users/${customer._id}`, { token: admin.token });
  const still = await s.db.collection("users").findOne({ _id: customer._id });
  assert.ok(still, "user document hard-deleted; their paid bookings now reference nothing");
});

test("P1-20: bookings cannot be assigned to a rejected provider", async () => {
  const admin = await s.createUser({ role: "admin" });
  const { provider } = await s.createProvider({ approvalStatus: "rejected" });
  const customer = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: customer, service });
  const res = await s.api("PATCH", `/admin/bookings/${booking._id}/assign`, { token: admin.token, body: { providerId: String(provider._id) } });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
  assert.equal(after.provider, undefined);
});

test("P1-21: provider registration rejects arbitrary URLs as KYC documents", async () => {
  const user = await s.createUser();
  const cat = await s.createCategory();
  const evil = "https://evil.example/not-my-id.jpg";
  await s.api("POST", "/providers/register", { token: user.token, body: { businessName: "Biz", category: String(cat._id), idProof: evil, selfiePhoto: evil, location: { city: "Patna" } } });
  const stored = await s.db.collection("providers").findOne({ "documents.idProof": evil });
  assert.equal(stored, null, "arbitrary URL stored as an ID proof");
});

test("P1-23a: unapproved services are not publicly readable by id or slug", async () => {
  const draft = await s.createService({ approvalStatus: "pending", available: false });
  const bySlug = await s.api("GET", `/services/${draft.slug}`);
  const byId = await s.api("GET", `/services/${draft._id}`);
  assert.equal(bySlug.status, 404, `slug lookup returned ${bySlug.status}`);
  assert.equal(byId.status, 404, `id lookup returned ${byId.status}`);
});

test("P1-23b: malformed search input never causes a 500", async () => {
  for (const q of ["/services?category=(", "/services?category=%5B", "/categories/((("]) {
    const res = await s.api("GET", q);
    assert.ok(res.status < 500, `${q} returned ${res.status}: ${res.text.slice(0, 100)}`);
  }
});

test("P1-23c: admin-created services keep their city restrictions", async () => {
  const admin = await s.createUser({ role: "admin" });
  const cat = await s.createCategory();
  const res = await s.api("POST", "/admin/services", { token: admin.token, body: { name: uid("City Svc "), category: String(cat._id), categoryName: cat.name, startingPrice: 500, cities: ["Patna"] } });
  assert.ok(res.status < 400, `create failed: ${res.text}`);
  const svc = await s.db.collection("services").findOne({ _id: new mongoose.Types.ObjectId(String(res.body._id)) });
  assert.deepEqual(svc?.cities, ["Patna"]);
});
