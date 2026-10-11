// Money correctness, round 3 (docs/fix-plan-mvp.md Phase 1): late payments, unpaid online bookings,
// order-race fallback, coupon release on cancel, COD after a failed attempt, cash-only rentals.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { startStack, daysFromNow } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack({ env: { RAZORPAY_WEBHOOK_SECRET: "whsec_test" } }); });
after(async () => { await s?.stop(); });

const reload = (id) => s.db.collection("bookings").findOne({ _id: new mongoose.Types.ObjectId(String(id)) });
const sign = (raw) => crypto.createHmac("sha256", "whsec_test").update(raw).digest("hex");
const webhook = (event, payload) => {
  const raw = JSON.stringify({ event, payload });
  return s.api("POST", "/payments/webhook", { raw, headers: { "x-razorpay-signature": sign(raw) } });
};
const verifyBody = (booking, paymentId) => ({
  bookingId: String(booking._id), razorpay_order_id: booking.razorpayOrderId, razorpay_payment_id: paymentId,
  razorpay_signature: s.razorpaySignature(booking.razorpayOrderId, paymentId),
});
const date = () => daysFromNow(3).toISOString().slice(0, 10);
const place = { address: "1 Test Rd", city: "Patna", pincode: "800001" };

async function onlineBooking({ amount = 1000, status = "pending", provider } = {}) {
  const user = await s.createUser();
  const service = await s.createService({ price: amount });
  const booking = await s.createBooking({ user, service, provider, status, paymentMethod: "razorpay", amount, extra: { razorpayOrderId: `order_${crypto.randomUUID()}` } });
  return { user, service, booking };
}

test("a payment captured after the customer cancelled is recorded and flagged for refund", async () => {
  const { user, booking } = await onlineBooking();
  assert.equal((await s.api("PATCH", `/bookings/${booking._id}/cancel`, { token: user.token, body: { reason: "changed plans" } })).status, 200);
  const res = await webhook("payment.captured", { payment: { entity: { id: "pay_late1", order_id: booking.razorpayOrderId, amount: 100000, currency: "INR" } } });
  assert.equal(res.status, 200);
  const after = await reload(booking._id);
  assert.deepEqual([after.status, after.paymentStatus, after.razorpayPaymentId], ["cancelled", "refund_pending", "pay_late1"]);

  const again = await onlineBooking();
  await s.api("PATCH", `/bookings/${again.booking._id}/cancel`, { token: again.user.token });
  const verified = await s.api("POST", "/payments/verify", { token: again.user.token, body: verifyBody(again.booking, "pay_late2") });
  assert.equal(verified.status, 409);
  const after2 = await reload(again.booking._id);
  assert.deepEqual([after2.paymentStatus, after2.razorpayPaymentId], ["refund_pending", "pay_late2"]);
});

test("a duplicate webhook doesn't notify the customer twice", async () => {
  const { user, booking } = await onlineBooking();
  const payload = { payment: { entity: { id: "pay_dupn", order_id: booking.razorpayOrderId, amount: 100000, currency: "INR" } } };
  await webhook("payment.captured", payload);
  await webhook("payment.captured", payload);
  await new Promise((r) => setTimeout(r, 200));
  const notes = await s.db.collection("notifications").countDocuments({ recipient: user._id, title: /Payment received/ });
  assert.equal(notes, 1);
});

test("an unpaid online booking can't be confirmed by its provider or by an admin assignment; payment confirms it", async () => {
  const { provider, user: providerUser } = await s.createProvider();
  const { booking } = await onlineBooking({ provider });
  const accept = await s.api("PATCH", `/providers/bookings/${booking._id}/status`, { token: providerUser.token, body: { status: "confirmed" } });
  assert.equal(accept.status, 409, accept.text);

  const admin = await s.createUser({ role: "admin" });
  const assign = await s.api("PATCH", `/admin/bookings/${booking._id}/assign`, { token: admin.token, body: { providerId: String(provider._id) } });
  assert.equal(assign.status, 200, assign.text);
  assert.equal((await reload(booking._id)).status, "pending");

  await webhook("payment.captured", { payment: { entity: { id: "pay_conf", order_id: booking.razorpayOrderId, amount: 100000, currency: "INR" } } });
  const paid = await reload(booking._id);
  assert.deepEqual([paid.status, paid.paymentStatus], ["confirmed", "paid"]);
  assert.ok(paid.statusHistory.some((h) => h.to === "confirmed" && /payment/.test(h.note)));
});

test("admin assignment never revives a cancelled booking", async () => {
  const { provider } = await s.createProvider();
  const customer = await s.createUser();
  const b = await s.createBooking({ user: customer, service: await s.createService(), status: "cancelled" });
  const admin = await s.createUser({ role: "admin" });
  assert.equal((await s.api("PATCH", `/admin/bookings/${b._id}/assign`, { token: admin.token, body: { providerId: String(provider._id) } })).status, 409);
  assert.equal((await s.api("PATCH", `/admin/bookings/${b._id}/assign`, { token: admin.token, body: { providerId: "" } })).status, 409);
  assert.equal((await reload(b._id)).status, "cancelled");
});

test("a webhook for an order whose id lost a race still finds its booking through the order notes", async () => {
  const { booking } = await onlineBooking();
  const res = await webhook("order.paid", {
    order: { entity: { id: "order_lost_race", amount_paid: 100000, currency: "INR", notes: { bookingId: String(booking._id) } } },
    payment: { entity: { id: "pay_race", order_id: "order_lost_race", amount: 100000, currency: "INR" } },
  });
  assert.equal(res.status, 200);
  assert.equal((await reload(booking._id)).paymentStatus, "paid");
});

test("cancelling an unpaid booking gives the coupon back; a paid one keeps it", async () => {
  const customer = await s.createUser();
  const service = await s.createService({ price: 1000 });
  await s.createCoupon({ code: "BACKAGAIN", discountValue: 100, usageLimit: 1 });
  const book = () => s.api("POST", "/bookings", { token: customer.token, body: { serviceId: String(service._id), packageTitle: "Standard", paymentMethod: "cod", couponCode: "BACKAGAIN", scheduledDate: date(), scheduledTime: "10:00", location: place } });

  const first = await book();
  assert.equal(first.status, 201, first.text);
  assert.equal((await book()).status, 400, "the coupon is used up while the first booking is live");
  assert.equal((await s.api("PATCH", `/bookings/${first.body._id}/cancel`, { token: customer.token })).status, 200);
  const coupon = await s.db.collection("coupons").findOne({ code: "BACKAGAIN" });
  assert.equal(coupon.usedCount, 0);
  const second = await book();
  assert.equal(second.status, 201, second.text);
  assert.equal(second.body.discountAmount, 100);

  // Paid then cancelled: the discount was used, so the coupon stays redeemed.
  await s.db.collection("bookings").updateOne({ _id: new mongoose.Types.ObjectId(second.body._id) }, { $set: { paymentStatus: "paid", status: "confirmed" } });
  await s.api("PATCH", `/bookings/${second.body._id}/cancel`, { token: customer.token });
  assert.equal((await s.db.collection("coupons").findOne({ code: "BACKAGAIN" })).usedCount, 1);
});

test("after a failed online attempt the customer can switch to cash; the booking waits for the provider", async () => {
  const { user, booking } = await onlineBooking();
  await webhook("payment.failed", { payment: { entity: { id: "pay_f1", order_id: booking.razorpayOrderId, amount: 100000, currency: "INR" } } });
  assert.equal((await reload(booking._id)).paymentStatus, "failed");
  const res = await s.api("POST", "/payments/cod-confirm", { token: user.token, body: { bookingId: String(booking._id) } });
  assert.equal(res.status, 200, res.text);
  const after = await reload(booking._id);
  assert.deepEqual([after.paymentMethod, after.paymentStatus, after.status], ["cod", "pending", "pending"]);
});

async function rentalSetup() {
  const { provider, user: providerUser } = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService({ price: 1500 });
  await s.db.collection("services").updateOne({ _id: service._id }, { $set: { serviceMode: "RENTAL", perKmRate: 12, provider: provider._id } });
  return { provider, providerUser, customer, service };
}
const rentalBody = (service, extra = {}) => ({ serviceId: String(service._id), paymentMethod: "cod", distanceKm: 50, scheduledDate: date(), scheduledTime: "10:00", location: place, ...extra });

test("rentals are cash only, take no coupons and need a positive estimate", async () => {
  const { customer, service } = await rentalSetup();
  await s.createCoupon({ code: "RIDE10", discountValue: 10 });
  assert.equal((await s.api("POST", "/bookings", { token: customer.token, body: rentalBody(service, { paymentMethod: "razorpay" }) })).status, 400);
  assert.equal((await s.api("POST", "/bookings", { token: customer.token, body: rentalBody(service, { couponCode: "RIDE10" }) })).status, 400);
  assert.equal((await s.api("POST", "/bookings", { token: customer.token, body: rentalBody(service, { distanceKm: 0.01 }) })).status, 400);
  const ok = await s.api("POST", "/bookings", { token: customer.token, body: rentalBody(service) });
  assert.equal(ok.status, 201, ok.text);
  assert.equal(ok.body.amount, 600);
  assert.equal(ok.body.fareConfirmed, false);
});

test("the provider confirms the final rental fare before cash is collected", async () => {
  const { provider, providerUser, customer, service } = await rentalSetup();
  const created = await s.api("POST", "/bookings", { token: customer.token, body: rentalBody(service) });
  const id = created.body._id;
  await s.db.collection("bookings").updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { status: "in_progress", provider: provider._id } });

  assert.equal((await s.api("POST", `/providers/bookings/${id}/cash-collected`, { token: providerUser.token })).status, 409);
  const { user: stranger } = await s.createProvider();
  assert.equal((await s.api("POST", `/providers/bookings/${id}/fare`, { token: stranger.token, body: { amount: 700 } })).status, 404);
  assert.equal((await s.api("POST", `/providers/bookings/${id}/fare`, { token: providerUser.token, body: { amount: 12 * 3000 + 1 } })).status, 400);
  assert.equal((await s.api("POST", `/providers/bookings/${id}/fare`, { token: providerUser.token, body: { amount: 12.5 } })).status, 400);

  const fare = await s.api("POST", `/providers/bookings/${id}/fare`, { token: providerUser.token, body: { amount: 720 } });
  assert.equal(fare.status, 200, fare.text);
  assert.equal((await s.api("POST", `/providers/bookings/${id}/fare`, { token: providerUser.token, body: { amount: 800 } })).status, 409, "the fare is final once confirmed");
  assert.equal((await s.api("POST", `/providers/bookings/${id}/cash-collected`, { token: providerUser.token })).status, 200);
  const after = await reload(id);
  assert.deepEqual([after.amount, after.fareConfirmed, after.paymentStatus], [720, true, "paid"]);
  assert.ok(after.statusHistory.some((h) => /600 estimate → ₹720/.test(h.note)));
});
