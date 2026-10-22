// Identity, round 3 (docs/fix-plan-mvp.md Phase 2). Uses the test-only fake Firebase verifier
// (config/firebase.js, TEST_FAKE_FIREBASE=1) to exercise verified Google/phone sign-in.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { startStack, uid, JWT_SECRET } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack({ env: { TEST_FAKE_FIREBASE: "1" } }); });
after(async () => { await s?.stop(); });

const fakeToken = (claims) => `fake.${Buffer.from(JSON.stringify(claims)).toString("base64url")}`;
const google = (email, uidv = uid("g")) => fakeToken({ uid: uidv, email, email_verified: true, name: "Real Owner" });
const phoneToken = (phone, uidv = uid("p")) => fakeToken({ uid: uidv, phone_number: phone });
const localUser = async ({ email = `${uid("l")}@example.test`, password = "Attacker-pass-1", emailVerified = false, role = "user", phone } = {}) => {
  const doc = { name: "Local", email, role, isActive: true, authProvider: "local", emailVerified, password: await bcrypt.hash(password, 4), ...(phone ? { phone } : {}) };
  const { insertedId } = await s.db.collection("users").insertOne(doc);
  return { ...doc, _id: insertedId, password };
};

test("a pre-registered password stops working once the real owner signs in with Google", async () => {
  const squat = await localUser();
  assert.equal((await s.api("POST", "/auth/login", { body: { email: squat.email, password: squat.password } })).status, 200, "precondition");

  const owner = await s.api("POST", "/auth/google", { body: { idToken: google(squat.email) } });
  assert.equal(owner.status, 200, owner.text);
  assert.equal(String(owner.body.user._id), String(squat._id));

  const attacker = await s.api("POST", "/auth/login", { body: { email: squat.email, password: squat.password } });
  assert.equal(attacker.status, 401, "the squatter's password still works");
  const stored = await s.db.collection("users").findOne({ _id: squat._id });
  assert.equal(stored.password, undefined);
  assert.equal(stored.authProvider, "google");
});

test("a verified email account keeps its password when it also links Google", async () => {
  const real = await localUser({ emailVerified: true, password: "Own-pass-123" });
  assert.equal((await s.api("POST", "/auth/google", { body: { idToken: google(real.email) } })).status, 200);
  assert.equal((await s.api("POST", "/auth/login", { body: { email: real.email, password: "Own-pass-123" } })).status, 200);
});

test("grant-admin refuses an account that has a sign-up password", async () => {
  const squat = await localUser({ emailVerified: true });
  const run = await s.runScript("scripts/grant-admin.mjs", {}, 30_000, [squat.email, "--yes"]);
  assert.equal(run.code, 1, run.out);
  assert.match(run.out, /admin-account\.mjs/);
  assert.equal((await s.db.collection("users").findOne({ _id: squat._id })).role, "user");
});

test("a number typed into another account can't block its verified owner's phone sign-in", async () => {
  const phone = "+919812345678";
  const squat = await localUser({ phone });
  const res = await s.api("POST", "/auth/phone", { body: { idToken: phoneToken(phone) } });
  assert.equal(res.status, 200, res.text);
  assert.notEqual(String(res.body.user._id), String(squat._id), "logged into the squatter's account");
  assert.equal(res.body.user.phone, phone);
  assert.equal((await s.db.collection("users").findOne({ _id: squat._id })).phone, undefined);

  const again = await s.api("POST", "/auth/phone", { body: { idToken: phoneToken(phone) } });
  assert.equal(String(again.body.user._id), String(res.body.user._id), "the owner returns to the same account");
});

test("login doesn't reveal whether an email exists or how it signs in", async () => {
  const g = await s.api("POST", "/auth/google", { body: { idToken: google(`${uid("gg")}@example.test`) } });
  const viaGoogle = await s.api("POST", "/auth/login", { body: { email: g.body.user.email, password: "whatever-123" } });
  const unknown = await s.api("POST", "/auth/login", { body: { email: `${uid("nobody")}@example.test`, password: "whatever-123" } });
  assert.equal(viaGoogle.status, 401);
  assert.equal(viaGoogle.body.message, unknown.body.message);
});

test("tokens are HS256 only", async () => {
  const user = await s.createUser();
  const none = jwt.sign({ id: String(user._id) }, JWT_SECRET, { algorithm: "HS512" });
  assert.equal((await s.api("GET", "/auth/me", { token: none })).status, 401);
  assert.equal((await s.api("GET", "/auth/me", { token: s.tokenFor(user._id) })).status, 200);
});

// A token signed a minute ago: the cutoff compares whole seconds, so it must be clearly older.
const earlierToken = (id) =>
  jwt.sign({ id: String(id), iat: Math.floor(Date.now() / 1000) - 60 }, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

test("logins issued before the real owner takes the account back stop working", async () => {
  const squat = await localUser();
  const squatterToken = earlierToken(squat._id);
  assert.equal((await s.api("GET", "/auth/me", { token: squatterToken })).status, 200, "precondition");

  const owner = await s.api("POST", "/auth/google", { body: { idToken: google(squat.email) } });
  assert.equal(owner.status, 200, owner.text);
  assert.equal((await s.api("GET", "/auth/me", { token: squatterToken })).status, 401, "the squatter keeps access");
  assert.equal((await s.api("GET", "/auth/me", { token: owner.body.token })).status, 200, "the owner's new login must work");
});

test("an admin set up by admin-account.mjs keeps that password after a Google sign-in; earlier logins end", async () => {
  const email = `${uid("adm")}@example.test`;
  const signup = await localUser({ email });
  const earlier = earlierToken(signup._id);

  const run = await s.runScript("scripts/admin-account.mjs", { ADMIN_NEW_PASSWORD: "Correct-Horse-Battery-9" }, 30_000, [email, "--yes"]);
  assert.equal(run.code, 0, run.out);
  assert.equal((await s.api("GET", "/auth/me", { token: earlier })).status, 401, "a login from the old password became an admin login");

  assert.equal((await s.api("POST", "/auth/admin-google", { body: { idToken: google(email) } })).status, 200);
  const login = await s.api("POST", "/auth/admin-login", { body: { email, password: "Correct-Horse-Battery-9" } });
  assert.equal(login.status, 200, "Google sign-in deleted the emergency admin password");
});
