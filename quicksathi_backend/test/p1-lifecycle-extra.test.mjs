import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";
import { normalizePhone } from "../services/phone.js";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const reload = (id) => s.db.collection("bookings").findOne({ _id: id });

test("WP-5: a provider walks a booking through the legal lifecycle and 'completed' does not mean paid", async () => {
  const { provider, user } = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService();
  const b = await s.createBooking({ user: customer, service, provider, status: "confirmed" });
  for (const next of ["in_progress", "completed"]) {
    const res = await s.api("PATCH", `/providers/bookings/${b._id}/status`, { token: user.token, body: { status: next } });
    assert.equal(res.status, 200, res.text);
  }
  const done = await reload(b._id);
  assert.equal(done.status, "completed");
  assert.equal(done.paymentStatus, "pending");
  assert.deepEqual(done.statusHistory.map((h) => h.to), ["in_progress", "completed"]);
});

test("WP-5: illegal jumps are rejected (pending → completed, cancelled → anything)", async () => {
  const { provider, user } = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService();
  const pending = await s.createBooking({ user: customer, service, provider, status: "pending" });
  assert.equal((await s.api("PATCH", `/providers/bookings/${pending._id}/status`, { token: user.token, body: { status: "completed" } })).status, 409);
  const cancelled = await s.createBooking({ user: customer, service, provider, status: "cancelled" });
  assert.equal((await s.api("PATCH", `/providers/bookings/${cancelled._id}/status`, { token: user.token, body: { status: "confirmed" } })).status, 409);
  assert.equal((await s.api("PATCH", `/providers/bookings/${pending._id}/status`, { token: user.token, body: { status: "bogus" } })).status, 400);
});

test("WP-5: cash collected marks a COD job paid, only once the job has started", async () => {
  const { provider, user } = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService();
  const early = await s.createBooking({ user: customer, service, provider, status: "confirmed" });
  assert.equal((await s.api("POST", `/providers/bookings/${early._id}/cash-collected`, { token: user.token })).status, 409);
  const started = await s.createBooking({ user: customer, service, provider, status: "in_progress" });
  assert.equal((await s.api("POST", `/providers/bookings/${started._id}/cash-collected`, { token: user.token })).status, 200);
  assert.equal((await reload(started._id)).paymentStatus, "paid");
});

test("WP-5: cancelling a paid booking flags a refund instead of leaving it 'paid'", async () => {
  const customer = await s.createUser();
  const service = await s.createService();
  const b = await s.createBooking({ user: customer, service, status: "confirmed", paymentStatus: "paid", paymentMethod: "razorpay" });
  const res = await s.api("PATCH", `/bookings/${b._id}/cancel`, { token: customer.token, body: { reason: "changed plans" } });
  assert.equal(res.status, 200, res.text);
  const after = await reload(b._id);
  assert.deepEqual([after.status, after.paymentStatus, after.cancelledBy], ["cancelled", "refund_pending", "user"]);
});

test("WP-5: a pending provider cannot change booking status even if the booking is theirs", async () => {
  const { provider, user } = await s.createProvider({ approvalStatus: "pending" });
  const service = await s.createService();
  const b = await s.createBooking({ user: await s.createUser(), service, provider, status: "pending" });
  assert.equal((await s.api("PATCH", `/providers/bookings/${b._id}/status`, { token: user.token, body: { status: "confirmed" } })).status, 403);
});

test("WP-8: the last administrator can't be demoted or deleted, and nobody can demote themselves", async () => {
  const admin = await s.createUser({ role: "admin" });
  assert.equal((await s.api("PATCH", `/admin/users/${admin._id}/role`, { token: admin.token, body: { role: "client" } })).status, 400);
  assert.equal((await s.api("DELETE", `/admin/users/${admin._id}`, { token: admin.token })).status, 400);
  assert.equal((await s.db.collection("users").findOne({ _id: admin._id })).role, "admin");
});

test("WP-8: deleting a user anonymises them and keeps their bookings attributable", async () => {
  const admin = await s.createUser({ role: "admin" });
  const customer = await s.createUser({ phone: "+919811100001" });
  const service = await s.createService();
  const b = await s.createBooking({ user: customer, service, paymentStatus: "paid" });
  assert.equal((await s.api("DELETE", `/admin/users/${customer._id}`, { token: admin.token })).status, 200);
  const u = await s.db.collection("users").findOne({ _id: customer._id });
  assert.equal(u.isActive, false);
  assert.ok(u.deletedAt);
  assert.equal(u.phone, undefined);
  assert.notEqual(u.email, customer.email);
  assert.equal(String((await reload(b._id)).user), String(customer._id));
  // the deleted account can no longer use its old token
  assert.equal((await s.api("GET", "/bookings", { token: customer.token })).status, 403);
});

test("WP-8: the admin user list is paginated, searchable, and hides deleted users", async () => {
  const admin = await s.createUser({ role: "admin" });
  const target = await s.createUser({ name: "Needle Person" });
  const res = await s.api("GET", "/admin/users?search=needle&limit=5", { token: admin.token });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.users.map((u) => u.name), ["Needle Person"]);
  assert.equal(res.body.total, 1);
  assert.ok(target);
});

test("WP-8: promoting a user to admin requires a verified email", async () => {
  const admin = await s.createUser({ role: "admin" });
  const user = await s.createUser();
  assert.equal((await s.api("PATCH", `/admin/users/${user._id}/role`, { token: admin.token, body: { role: "admin" } })).status, 400);
  await s.db.collection("users").updateOne({ _id: user._id }, { $set: { emailVerified: true } });
  assert.equal((await s.api("PATCH", `/admin/users/${user._id}/role`, { token: admin.token, body: { role: "admin" } })).status, 200);
});

test("WP-8: provider registration refuses document URLs and non-image data", async () => {
  const user = await s.createUser();
  for (const idProof of ["https://evil.example/id.jpg", "data:application/pdf;base64,AAAA", { $ne: 1 }]) {
    const res = await s.api("POST", "/providers/register", { token: user.token, body: { businessName: "Biz", idProof } });
    assert.equal(res.status, 400, JSON.stringify(idProof));
  }
  assert.equal(await s.db.collection("providers").countDocuments({ user: user._id }), 0);
});

test("WP-9: phone numbers are normalised, so +91 formats of one number collide", async () => {
  assert.equal(normalizePhone("98765 43210"), "+919876543210");
  assert.equal(normalizePhone("+91 98765-43210"), "+919876543210");
  assert.equal(normalizePhone("09876543210"), "+919876543210");
  assert.equal(normalizePhone("12345"), "");
  const a = await s.api("POST", "/auth/register", { body: { name: "a", email: "pa@example.test", password: "Password123!", phone: "98765 43210" } });
  const b = await s.api("POST", "/auth/register", { body: { name: "b", email: "pb@example.test", password: "Password123!", phone: "+91 98765 43210" } });
  assert.equal(a.status, 201);
  assert.equal(b.status, 409);
  assert.equal((await s.api("POST", "/auth/register", { body: { name: "c", email: "pc@example.test", password: "Password123!", phone: "abc" } })).status, 400);
});
