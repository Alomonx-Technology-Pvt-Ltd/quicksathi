// P0 acceptance tests. Each test asserts the SECURE behaviour described in
// docs/fix-plan-p0-p1.md. Before the fixes they fail; a fix is done when its test passes.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack, daysFromNow, uid, ADMIN_EMAILS } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const noTokenIssued = (res) => res.status >= 400 && !res.body?.token;

test("P0-1: Firebase login routes never issue a token without a verified idToken", async () => {
  const admin = await s.createUser({ role: "admin" });
  const victim = await s.createUser();
  const prov = await s.createProvider();
  const cases = [
    ["/auth/admin-google", admin.email],
    ["/auth/google", victim.email],
    ["/auth/provider-google", prov.user.email],
  ];
  for (const [route, email] of cases) {
    const res = await s.api("POST", route, { body: { email, name: "x" } });
    assert.ok(noTokenIssued(res), `${route} issued a session for ${email} with no idToken (status ${res.status})`);
  }
});

test("P0-2a: registering with an ADMIN_EMAILS address does not grant admin", async () => {
  const res = await s.api("POST", "/auth/register", { body: { name: "x", email: ADMIN_EMAILS[0], password: "Password123!" } });
  const user = await s.db.collection("users").findOne({ email: ADMIN_EMAILS[0] });
  assert.ok(!(res.body?.user?.role === "admin" || user?.role === "admin"), "self-registration produced an admin account");
});

test("P0-2b: changing profile email to an admin address and using /admin-login does not grant admin", async () => {
  const email = `${uid("p")}@example.test`;
  const reg = await s.api("POST", "/auth/register", { body: { name: "x", email, password: "Password123!" } });
  assert.equal(reg.status, 201, `precondition: register failed: ${reg.text}`);
  const token = reg.body.token ?? s.tokenFor((await s.db.collection("users").findOne({ email }))._id);
  await s.api("PUT", "/auth/profile", { token, body: { email: ADMIN_EMAILS[1] } });
  const login = await s.api("POST", "/auth/admin-login", { body: { email: ADMIN_EMAILS[1], password: "Password123!" } });
  const user = await s.db.collection("users").findOne({ email: ADMIN_EMAILS[1] });
  assert.ok(!(login.status === 200 && login.body?.user?.role === "admin"), "admin-login granted admin to an unverified email change");
  assert.notEqual(user?.role, "admin", "user was promoted to admin in the database");
});

test("P0-3: /auth/phone never logs in by a client-supplied phone number", async () => {
  const victim = await s.createUser({ phone: "+919000000077" });
  const res = await s.api("POST", "/auth/phone", { body: { idToken: "not-a-real-token", phone: victim.phone } });
  assert.ok(!(res.body?.token && String(res.body?.user?._id) === String(victim._id)), "logged in as the victim using only their phone number");
});

test("P0-4: a provider cannot change the status of a booking that is not assigned to them", async () => {
  const owner = await s.createProvider();
  const intruder = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: customer, service, provider: owner.provider });
  const res = await s.api("PATCH", `/bookings/${booking._id}/status`, { token: intruder.user.token, body: { status: "completed" } });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
  assert.equal(after.status, "pending");
  assert.equal(after.paymentStatus, "pending");
});

test("P0-5: a provider cannot change their own approval status or rating", async () => {
  const { provider, user } = await s.createProvider({ approvalStatus: "rejected" });
  await s.api("PUT", "/providers/me", { token: user.token, body: { approvalStatus: "approved", rating: 5, totalBookings: 999 } });
  const after = await s.db.collection("providers").findOne({ _id: provider._id });
  assert.equal(after.approvalStatus, "rejected");
  assert.equal(after.rating, 0);
  assert.equal(after.totalBookings, 0);
});

test("P0-6: the public provider list exposes no KYC documents or contact details", async () => {
  const { provider } = await s.createProvider();
  const res = await s.api("GET", "/providers");
  assert.equal(res.status, 200);
  for (const leaked of [provider.documents.idProof, provider.documents.selfiePhoto, provider.phone, provider.email]) {
    assert.ok(!res.text.includes(leaked), `public response contains ${leaked}`);
  }
});

test("P0-7: creating an online-payment booking does not mark it paid or confirmed", async () => {
  const user = await s.createUser();
  const service = await s.createService({ price: 1000 });
  const res = await s.api("POST", "/bookings", { token: user.token, body: { serviceId: service.slug, packageIndex: 0, scheduledDate: daysFromNow(3).toISOString(), scheduledTime: "10:00", paymentMethod: "razorpay" } });
  const booking = await s.db.collection("bookings").findOne({ user: user._id });
  if (res.status < 400) {
    assert.ok(booking, "booking not persisted");
    assert.notEqual(booking.paymentStatus, "paid", "booking marked paid before any payment");
    assert.notEqual(booking.status, "confirmed", "booking confirmed before any payment");
  }
});

test("P0-8: the booking price comes from the catalog, not the request", async () => {
  const user = await s.createUser();
  const service = await s.createService({ price: 5000 });
  await s.api("POST", "/bookings", { token: user.token, body: { serviceId: service.slug, packageIndex: 0, scheduledDate: daysFromNow(3).toISOString(), scheduledTime: "10:00", paymentMethod: "cod", amount: 1 } });
  const cheap = await s.db.collection("bookings").findOne({ user: user._id, amount: { $lt: 5000 } });
  assert.equal(cheap, null, `booking stored with client-chosen amount ${cheap?.amount}`);
});

test("P0-9: a coupon is applied exactly once to the catalog price", async () => {
  const user = await s.createUser();
  const service = await s.createService({ price: 1000 });
  const code = uid("PCT").toUpperCase();
  await s.createCoupon({ code, discountType: "percentage", discountValue: 20 });
  // Same shape PaymentPage.jsx sends today: already-discounted amount + couponCode.
  const res = await s.api("POST", "/bookings", { token: user.token, body: { serviceId: service.slug, packageIndex: 0, scheduledDate: daysFromNow(3).toISOString(), scheduledTime: "10:00", paymentMethod: "cod", amount: 800, couponCode: code } });
  assert.ok(res.status < 400, `booking failed: ${res.text}`);
  const b = await s.db.collection("bookings").findOne({ user: user._id });
  assert.equal(b.originalAmount, 1000);
  assert.equal(b.discountAmount, 200);
  assert.equal(b.amount, 800);
});

test("P0-10a: /payments/verify rejects a valid signature for a different order", async () => {
  const user = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user, service, paymentMethod: "razorpay", extra: { razorpayOrderId: "order_REAL" } });
  const sig = s.razorpaySignature("order_CHEAP", "pay_1");
  await s.api("POST", "/payments/verify", { token: user.token, body: { bookingId: String(booking._id), razorpay_order_id: "order_CHEAP", razorpay_payment_id: "pay_1", razorpay_signature: sig } });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.notEqual(after.paymentStatus, "paid");
});

test("P0-10b: /payments/verify cannot be used on another user's booking", async () => {
  const owner = await s.createUser();
  const other = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: owner, service, paymentMethod: "razorpay", extra: { razorpayOrderId: "order_OWNER" } });
  const sig = s.razorpaySignature("order_OWNER", "pay_2");
  const res = await s.api("POST", "/payments/verify", { token: other.token, body: { bookingId: String(booking._id), razorpay_order_id: "order_OWNER", razorpay_payment_id: "pay_2", razorpay_signature: sig } });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.ok(res.status >= 400, `expected 4xx, got ${res.status}`);
  assert.notEqual(after.paymentStatus, "paid");
});
