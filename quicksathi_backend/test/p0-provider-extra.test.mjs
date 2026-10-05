import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

test("WP-2: admins still see provider KYC documents in the admin list", async () => {
  const admin = await s.createUser({ role: "admin" });
  const { provider } = await s.createProvider({ approvalStatus: "pending" });
  const res = await s.api("GET", "/admin/providers?status=pending", { token: admin.token });
  assert.equal(res.status, 200);
  const found = res.body.find((p) => p._id === String(provider._id));
  assert.equal(found?.documents?.idProof, provider.documents.idProof);
  assert.equal(found?.documents?.selfiePhoto, provider.documents.selfiePhoto);
});

test("WP-2: an approved provider can still edit their profile and toggle availability", async () => {
  const { provider, user } = await s.createProvider();
  const res = await s.api("PUT", "/providers/me", { token: user.token, body: { description: "Fast and neat", isActive: false } });
  assert.equal(res.status, 200, res.text);
  const after = await s.db.collection("providers").findOne({ _id: provider._id });
  assert.equal(after.description, "Fast and neat");
  assert.equal(after.isActive, false);
});

test("WP-2: a pending provider cannot toggle availability", async () => {
  const { user } = await s.createProvider({ approvalStatus: "pending" });
  const res = await s.api("PUT", "/providers/me", { token: user.token, body: { isActive: true } });
  assert.equal(res.status, 403);
});

test("WP-2: providers cannot reach the admin-wide booking status route", async () => {
  const { user } = await s.createProvider();
  const res = await s.api("PATCH", "/bookings/507f1f77bcf86cd799439011/status", { token: user.token, body: { status: "completed" } });
  assert.equal(res.status, 403);
});
