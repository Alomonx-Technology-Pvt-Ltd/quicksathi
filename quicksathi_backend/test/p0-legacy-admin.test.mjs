// What happens to an admin who used to sign in with the shared ADMIN_EMAILS / ADMIN_PASSWORD pair.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const OLD_PASSWORD = "legacy-shared-password-1"; // stands in for the value that used to be ADMIN_PASSWORD
const login = (email, password) => s.api("POST", "/auth/admin-login", { body: { email, password } });

test("legacy: an admin account the old flow had already created (local, password synced) still signs in", async () => {
  // The old code saved ADMIN_PASSWORD onto the user (hashed) and set authProvider=local on first login.
  await s.db.collection("users").insertOne({ name: "Client Admin", email: "client-admin@example.test", role: "admin", isActive: true, authProvider: "local", password: await bcrypt.hash(OLD_PASSWORD, 4) });
  const res = await login("client-admin@example.test", OLD_PASSWORD);
  assert.equal(res.status, 200, res.text);
  assert.equal(res.body.user.role, "admin");
});

test("legacy: an email that was only ever in ADMIN_EMAILS (no account yet) can no longer sign in with the shared password", async () => {
  const res = await login("never-logged-in@example.test", OLD_PASSWORD);
  assert.equal(res.status, 401);
  assert.equal(await s.db.collection("users").countDocuments({ email: "never-logged-in@example.test" }), 0);
});

test("legacy: a Google-created admin with no password can't use email+password and is told to use Google", async () => {
  await s.db.collection("users").insertOne({ name: "G Admin", email: "g-admin@example.test", role: "admin", isActive: true, authProvider: "google", emailVerified: true });
  const res = await login("g-admin@example.test", OLD_PASSWORD);
  assert.equal(res.status, 401);
  assert.match(res.body.message, /google/i);
});

test("recovery: admin-account.mjs creates a missing admin who can then sign in", async () => {
  const run = await s.runScript("scripts/admin-account.mjs", { ADMIN_NEW_PASSWORD: "Correct-Horse-Battery-9" }, 30_000, ["fresh-admin@example.test", "--yes"]);
  assert.equal(run.code, 0, run.out);
  const res = await login("fresh-admin@example.test", "Correct-Horse-Battery-9");
  assert.equal(res.status, 200, res.text);
  assert.equal(res.body.user.role, "admin");
});

test("recovery: admin-account.mjs resets the password of an existing admin (old one stops working)", async () => {
  const run = await s.runScript("scripts/admin-account.mjs", { ADMIN_NEW_PASSWORD: "Another-Strong-Pass-42!" }, 30_000, ["client-admin@example.test", "--yes"]);
  assert.equal(run.code, 0, run.out);
  assert.equal((await login("client-admin@example.test", OLD_PASSWORD)).status, 401);
  assert.equal((await login("client-admin@example.test", "Another-Strong-Pass-42!")).status, 200);
});

test("recovery: weak or previously shared passwords are refused", async () => {
  for (const pw of ["short", "alllowercaseletters", "quicksathi@admin09", "Quicksathi-Strong-1234"]) {
    const run = await s.runScript("scripts/admin-account.mjs", { ADMIN_NEW_PASSWORD: pw }, 30_000, ["weak@example.test", "--yes"]);
    assert.equal(run.code, 1, `${pw} should be refused\n${run.out}`);
  }
  assert.equal(await s.db.collection("users").countDocuments({ email: "weak@example.test" }), 0);
});
