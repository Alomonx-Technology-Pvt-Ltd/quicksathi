import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { startStack, uid, ADMIN_EMAILS } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const makeLocalUser = async (role, password) => {
  const u = await s.createUser({ role });
  await s.db.collection("users").updateOne({ _id: u._id }, { $set: { password: await bcrypt.hash(password, 4) } });
  return u;
};

test("WP-1: production refuses to boot without Firebase Admin configured", async () => {
  // A fully valid production config except Firebase, so Firebase is the reason it exits.
  const validProd = { NODE_ENV: "production", PORT: "0", JWT_SECRET: "j".repeat(48), RAZORPAY_WEBHOOK_SECRET: "whsec_x" };
  const run = await s.runScript("server.js", validProd, 15_000);
  assert.equal(run.code, 1, `server should exit 1, got ${run.code}\n${run.out.slice(0, 300)}`);
  assert.match(run.out, /Firebase/);
  assert.doesNotMatch(run.out, /invalid production configuration/);
});

test("WP-1: an existing admin can sign in with their own password", async () => {
  const admin = await makeLocalUser("admin", "Admin-pass-123");
  const res = await s.api("POST", "/auth/admin-login", { body: { email: admin.email, password: "Admin-pass-123" } });
  assert.equal(res.status, 200, res.text);
  assert.equal(res.body.user.role, "admin");
});

test("WP-1: the shared ADMIN_PASSWORD env value no longer opens admin-login", async () => {
  const res = await s.api("POST", "/auth/admin-login", { body: { email: ADMIN_EMAILS[0], password: "test-only-admin-password" } });
  assert.ok(res.status >= 400 && !res.body?.token, `got ${res.status}`);
  assert.equal(await s.db.collection("users").countDocuments({ email: ADMIN_EMAILS[0] }), 0, "an admin account was auto-created");
});

test("WP-1: a non-admin with a correct password cannot use admin-login", async () => {
  const user = await makeLocalUser("user", "User-pass-123");
  const res = await s.api("POST", "/auth/admin-login", { body: { email: user.email, password: "User-pass-123" } });
  assert.equal(res.status, 403);
  assert.ok(!res.body?.token);
});

test("WP-1: ADMIN_EMAILS membership does not promote on normal login", async () => {
  const email = ADMIN_EMAILS[0];
  await s.db.collection("users").insertOne({ name: "Owner", email, role: "user", isActive: true, authProvider: "local", password: await bcrypt.hash("Owner-pass-123", 4) });
  const res = await s.api("POST", "/auth/login", { body: { email, password: "Owner-pass-123" } });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.role, "user");
});

test("WP-1: profile cannot change email or phone", async () => {
  const u = await s.createUser({ phone: "+919800000001" });
  const a = await s.api("PUT", "/auth/profile", { token: u.token, body: { email: `${uid("n")}@example.test` } });
  const b = await s.api("PUT", "/auth/profile", { token: u.token, body: { phone: "+919800000002" } });
  assert.equal(a.status, 400);
  assert.equal(b.status, 400);
  const c = await s.api("PUT", "/auth/profile", { token: u.token, body: { name: "New Name", city: "Patna" } });
  assert.equal(c.status, 200);
  assert.equal(c.body.user.name, "New Name");
});

test("WP-1: operator objects in credentials are rejected", async () => {
  const res = await s.api("POST", "/auth/login", { body: { email: { $ne: null }, password: { $ne: null } } });
  assert.ok(res.status >= 400 && !res.body?.token);
});
