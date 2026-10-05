import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack({ env: { RAZORPAY_WEBHOOK_SECRET: "whsec_test" } }); });
after(async () => { await s?.stop(); });

const verifyBody = (booking, orderId, paymentId, sig) => ({
  bookingId: String(booking._id), razorpay_order_id: orderId, razorpay_payment_id: paymentId,
  razorpay_signature: sig ?? s.razorpaySignature(orderId, paymentId),
});

const webhook = (event, payment, { secret = "whsec_test", sign = true } = {}) => {
  const raw = JSON.stringify({ event, payload: { payment: { entity: payment } } });
  const signature = sign ? crypto.createHmac("sha256", secret).update(raw).digest("hex") : "deadbeef";
  return s.api("POST", "/payments/webhook", { raw, headers: { "x-razorpay-signature": signature } });
};

async function onlineBooking(amount = 1000, order = "order_X") {
  const user = await s.createUser();
  const service = await s.createService({ price: amount });
  const booking = await s.createBooking({ user, service, paymentMethod: "razorpay", amount, extra: { razorpayOrderId: `${order}_${Math.random().toString(36).slice(2)}` } });
  return { user, booking };
}

test("WP-4: verify marks the owner's booking paid and confirmed with a correct signature", async () => {
  const { user, booking } = await onlineBooking();
  const res = await s.api("POST", "/payments/verify", { token: user.token, body: verifyBody(booking, booking.razorpayOrderId, "pay_ok1") });
  assert.equal(res.status, 200, res.text);
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.deepEqual([after.paymentStatus, after.status, after.razorpayPaymentId], ["paid", "confirmed", "pay_ok1"]);
});

test("WP-4: verify rejects a tampered signature", async () => {
  const { user, booking } = await onlineBooking();
  const res = await s.api("POST", "/payments/verify", { token: user.token, body: verifyBody(booking, booking.razorpayOrderId, "pay_bad", "0".repeat(64)) });
  assert.equal(res.status, 400);
  assert.equal((await s.db.collection("bookings").findOne({ _id: booking._id })).paymentStatus, "pending");
});

test("WP-4: the same payment id cannot be attached to two bookings", async () => {
  const a = await onlineBooking();
  const b = await onlineBooking();
  assert.equal((await s.api("POST", "/payments/verify", { token: a.user.token, body: verifyBody(a.booking, a.booking.razorpayOrderId, "pay_dup") })).status, 200);
  const second = await s.api("POST", "/payments/verify", { token: b.user.token, body: verifyBody(b.booking, b.booking.razorpayOrderId, "pay_dup") });
  assert.ok(second.status >= 400, `got ${second.status}`);
  assert.equal((await s.db.collection("bookings").findOne({ _id: b.booking._id })).paymentStatus, "pending");
});

test("WP-4: a cancelled booking cannot be marked paid by verify", async () => {
  const { user, booking } = await onlineBooking();
  await s.db.collection("bookings").updateOne({ _id: booking._id }, { $set: { status: "cancelled" } });
  const res = await s.api("POST", "/payments/verify", { token: user.token, body: verifyBody(booking, booking.razorpayOrderId, "pay_c") });
  assert.equal(res.status, 409);
});

test("WP-4: create-order refuses someone else's booking, COD bookings and paid bookings", async () => {
  const { user, booking } = await onlineBooking();
  const stranger = await s.createUser();
  assert.equal((await s.api("POST", "/payments/create-order", { token: stranger.token, body: { bookingId: String(booking._id) } })).status, 403);
  const cod = await s.createBooking({ user, service: await s.createService(), paymentMethod: "cod" });
  assert.equal((await s.api("POST", "/payments/create-order", { token: user.token, body: { bookingId: String(cod._id) } })).status, 400);
  await s.db.collection("bookings").updateOne({ _id: booking._id }, { $set: { paymentStatus: "paid" } });
  assert.equal((await s.api("POST", "/payments/create-order", { token: user.token, body: { bookingId: String(booking._id) } })).status, 409);
});

test("WP-4: webhook rejects an invalid signature", async () => {
  const { booking } = await onlineBooking();
  const res = await webhook("payment.captured", { id: "pay_w0", order_id: booking.razorpayOrderId, amount: 100000, currency: "INR" }, { sign: false });
  assert.equal(res.status, 400);
  assert.equal((await s.db.collection("bookings").findOne({ _id: booking._id })).paymentStatus, "pending");
});

test("WP-4: a signed payment.captured webhook confirms the booking, and is idempotent", async () => {
  const { booking } = await onlineBooking(1000);
  const payment = { id: "pay_w1", order_id: booking.razorpayOrderId, amount: 100000, currency: "INR" };
  assert.equal((await webhook("payment.captured", payment)).status, 200);
  assert.equal((await webhook("payment.captured", payment)).status, 200);
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.deepEqual([after.paymentStatus, after.status, after.razorpayPaymentId], ["paid", "confirmed", "pay_w1"]);
});

test("WP-4: a webhook for the wrong amount does not mark the booking paid", async () => {
  const { booking } = await onlineBooking(1000);
  await webhook("payment.captured", { id: "pay_w2", order_id: booking.razorpayOrderId, amount: 100, currency: "INR" });
  assert.equal((await s.db.collection("bookings").findOne({ _id: booking._id })).paymentStatus, "pending");
});

test("WP-4: payment.failed marks a pending booking failed but never overrides paid", async () => {
  const f = await onlineBooking();
  await webhook("payment.failed", { id: "pay_f", order_id: f.booking.razorpayOrderId, amount: 100000, currency: "INR" });
  assert.equal((await s.db.collection("bookings").findOne({ _id: f.booking._id })).paymentStatus, "failed");
  const p = await onlineBooking();
  await s.db.collection("bookings").updateOne({ _id: p.booking._id }, { $set: { paymentStatus: "paid" } });
  await webhook("payment.failed", { id: "pay_f2", order_id: p.booking.razorpayOrderId, amount: 100000, currency: "INR" });
  assert.equal((await s.db.collection("bookings").findOne({ _id: p.booking._id })).paymentStatus, "paid");
});

test("WP-4: cod-confirm works only for unpaid pending bookings", async () => {
  const { user, booking } = await onlineBooking();
  assert.equal((await s.api("POST", "/payments/cod-confirm", { token: user.token, body: { bookingId: String(booking._id) } })).status, 200);
  const { user: u2, booking: b2 } = await onlineBooking();
  await s.db.collection("bookings").updateOne({ _id: b2._id }, { $set: { paymentStatus: "paid", status: "confirmed" } });
  assert.equal((await s.api("POST", "/payments/cod-confirm", { token: u2.token, body: { bookingId: String(b2._id) } })).status, 409);
});
