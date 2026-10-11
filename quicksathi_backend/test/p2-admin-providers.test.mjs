// Providers and admin, round 3 (docs/fix-plan-mvp.md Phase 3).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack, uid } from "./helpers/stack.mjs";

let s;
let admin;
before(async () => {
  s = await startStack();
  admin = await s.createUser({ role: "admin" });
});
after(async () => { await s?.stop(); });

const as = (token) => ({ token });
const providerRow = (id) => s.db.collection("providers").findOne({ _id: id });
const userRow = (id) => s.db.collection("users").findOne({ _id: id });

test("approving a provider profile owned by an admin doesn't demote the admin", async () => {
  const { provider, user } = await s.createProvider({ approvalStatus: "pending", userRole: "admin" });
  assert.equal((await s.api("PATCH", `/admin/providers/${provider._id}/approve`, as(admin.token))).status, 200);
  assert.equal((await userRow(user._id)).role, "admin");
});

test("re-approving a rejected provider restores the profile", async () => {
  const { provider, user } = await s.createProvider({ approvalStatus: "pending", userRole: "user" });
  await s.api("PATCH", `/admin/providers/${provider._id}/reject`, { ...as(admin.token), body: { reason: "blurry ID" } });
  assert.equal((await s.api("PATCH", `/admin/providers/${provider._id}/approve`, as(admin.token))).status, 200);
  const row = await providerRow(provider._id);
  assert.deepEqual([row.approvalStatus, row.isActive, row.rejectionReason], ["approved", true, ""]);
  assert.equal((await userRow(user._id)).role, "provider");
});

test("demoting a provider deactivates the profile: no longer listed or assignable", async () => {
  const { provider, user } = await s.createProvider();
  const res = await s.api("PATCH", `/admin/users/${user._id}/role`, { ...as(admin.token), body: { role: "client" } });
  assert.equal(res.status, 200, res.text);
  assert.equal((await providerRow(provider._id)).isActive, false);
  const approved = await s.api("GET", "/admin/providers/approved", as(admin.token));
  assert.ok(!approved.body.some((p) => p._id === String(provider._id)));
  const b = await s.createBooking({ user: await s.createUser(), service: await s.createService() });
  assert.equal((await s.api("PATCH", `/admin/bookings/${b._id}/assign`, { ...as(admin.token), body: { providerId: String(provider._id) } })).status, 400);
});

test("services can only be assigned to, and go live for, approved active providers", async () => {
  const { provider } = await s.createProvider({ approvalStatus: "rejected", isActive: false });
  const service = await s.createService({ approvalStatus: "pending", available: false });
  assert.equal((await s.api("PATCH", `/admin/services/${service._id}/assign-provider`, { ...as(admin.token), body: { providerId: String(provider._id) } })).status, 400);

  await s.db.collection("services").updateOne({ _id: service._id }, { $set: { provider: provider._id } });
  assert.equal((await s.api("PATCH", `/admin/service-requests/${service._id}/approve`, as(admin.token))).status, 409);
  const row = await s.db.collection("services").findOne({ _id: service._id });
  assert.deepEqual([row.approvalStatus, row.available], ["pending", false]);
});

test("one provider profile per account", async () => {
  const user = await s.createUser();
  await s.db.collection("providers").insertOne({ user: user._id, businessName: "A", approvalStatus: "pending" });
  await assert.rejects(s.db.collection("providers").insertOne({ user: user._id, businessName: "B", approvalStatus: "pending" }), /E11000/);
});

test("a disabled category isn't served publicly", async () => {
  const cat = await s.createCategory();
  assert.equal((await s.api("GET", `/categories/${cat._id}`)).status, 200);
  await s.db.collection("categories").updateOne({ _id: cat._id }, { $set: { active: false } });
  assert.equal((await s.api("GET", `/categories/${cat._id}`)).status, 404);
});

test("admin lists take only plain, bounded query values", async () => {
  const search = await s.api("GET", `/admin/services?search=${encodeURIComponent("(a+)+$[")}&limit=100000000`, as(admin.token));
  assert.equal(search.status, 200, search.text);
  const many = await s.api("GET", "/admin/services?limit=100000000", as(admin.token));
  assert.ok(many.body.services.length <= 200);
  assert.equal(Math.ceil(many.body.total / 200), many.body.totalPages);
  const op = await s.api("GET", "/admin/bookings?status[$ne]=x", as(admin.token));
  assert.equal(op.status, 200);
});

test("the refund queue: admin bookings filter by payment status", async () => {
  const customer = await s.createUser();
  const service = await s.createService();
  const due = await s.createBooking({ user: customer, service, status: "cancelled", paymentStatus: "refund_pending", paymentMethod: "razorpay" });
  await s.createBooking({ user: customer, service, status: "confirmed", paymentStatus: "paid", paymentMethod: "razorpay" });
  const res = await s.api("GET", "/admin/bookings?paymentStatus=refund_pending", as(admin.token));
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 1 && res.body.every((b) => b.paymentStatus === "refund_pending"));
  assert.ok(res.body.some((b) => b._id === String(due._id)));
});

test("dashboard counts leave out deleted users", async () => {
  const before = (await s.api("GET", "/admin/stats", as(admin.token))).body;
  const victim = await s.createUser({ email: `${uid("del")}@example.test` });
  assert.equal((await s.api("DELETE", `/admin/users/${victim._id}`, as(admin.token))).status, 200);
  const after = (await s.api("GET", "/admin/stats", as(admin.token))).body;
  const key = Object.keys(before).find((k) => /user/i.test(k) && typeof before[k] === "number");
  assert.equal(after[key], before[key], `${key} counted a deleted user`);
});

test("category updates take known fields only; a vertical outside the fixed list is a 400", async () => {
  const cat = await s.createCategory();
  await s.db.collection("categories").updateOne({ _id: cat._id }, { $set: { vertical: "PAINTING", type: "BOTH" } });
  const sneaky = await s.api("PUT", `/admin/categories/${cat._id}`, { ...as(admin.token), body: { description: "ok", $unset: { name: "" }, createdAt: "2000-01-01" } });
  assert.equal(sneaky.status, 200, sneaky.text);
  const row = await s.db.collection("categories").findOne({ _id: cat._id });
  assert.equal(row.description, "ok");
  assert.equal(row.name, cat.name);
  const bad = await s.api("PUT", `/admin/categories/${cat._id}`, { ...as(admin.token), body: { vertical: "SOLAR" } });
  assert.equal(bad.status, 400);
});

test("broadcasts never reach soft-deleted accounts", async () => {
  const gone = await s.createUser();
  await s.api("DELETE", `/admin/users/${gone._id}`, as(admin.token));
  const placeholder = (await userRow(gone._id)).email;
  const res = await s.api("POST", "/admin/send-email", { ...as(admin.token), body: { recipientType: "individual", email: placeholder, subject: "Hi", body: "Hello" } });
  assert.equal(res.status, 400, res.text);
});
