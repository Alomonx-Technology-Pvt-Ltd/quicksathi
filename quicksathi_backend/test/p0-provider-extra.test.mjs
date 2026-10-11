import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack({ env: { CLOUDINARY_CLOUD_NAME: "demo", CLOUDINARY_API_KEY: "123", CLOUDINARY_API_SECRET: "test-secret" } }); });
after(async () => { await s?.stop(); });

test("WP-2 / round 3: KYC files are never in provider lists; admins open them through short-lived signed links", async () => {
  const admin = await s.createUser({ role: "admin" });
  const { provider, user } = await s.createProvider({ approvalStatus: "pending" });
  const list = await s.api("GET", "/admin/providers?status=pending", { token: admin.token });
  assert.equal(list.status, 200);
  assert.ok(!list.text.includes(provider.documents.idProof), "the admin list carries KYC links");

  // Legacy public URLs (until migration 003 runs) come back as they are.
  const legacy = await s.api("GET", `/admin/providers/${provider._id}/documents`, { token: admin.token });
  assert.equal(legacy.status, 200, legacy.text);
  assert.equal(legacy.body.idProof, provider.documents.idProof);
  assert.equal(legacy.headers.get("cache-control"), "no-store");

  // Private assets: a signed, expiring download link, never a public delivery URL.
  await s.db.collection("providers").updateOne({ _id: provider._id }, { $set: { "documents.selfiePhoto": "cld-auth/jpg/TiptoBook/providers/selfies/abc123" } });
  const priv = await s.api("GET", `/admin/providers/${provider._id}/documents`, { token: admin.token });
  const url = new URL(priv.body.selfiePhoto);
  assert.match(url.hostname, /api\.cloudinary\.com/);
  assert.ok(url.searchParams.get("signature") && Number(url.searchParams.get("expires_at")) > Date.now() / 1000);
  assert.equal(url.searchParams.get("type"), "authenticated");

  assert.equal((await s.api("GET", `/admin/providers/${provider._id}/documents`, { token: user.token })).status, 403);
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
