import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";
import { validateEnv } from "../config/validateEnv.js";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const good = {
  MONGODB_URI: "mongodb://x/y", JWT_SECRET: "a".repeat(48), CLIENT_URL: "https://www.example.com",
  RAZORPAY_KEY_ID: "rzp_test_1", RAZORPAY_KEY_SECRET: "s", RAZORPAY_WEBHOOK_SECRET: "w",
};

test("WP-12: a complete production config passes validation", () => {
  assert.deepEqual(validateEnv(good).problems, []);
});

test("WP-12: missing or placeholder secrets are reported", () => {
  const { problems } = validateEnv({ ...good, JWT_SECRET: "change_this_to_a_strong_random_secret_in_production", RAZORPAY_WEBHOOK_SECRET: "" });
  assert.ok(problems.some((p) => p.startsWith("JWT_SECRET")), problems.join("|"));
  assert.ok(problems.some((p) => p.startsWith("RAZORPAY_WEBHOOK_SECRET")), problems.join("|"));
  assert.ok(validateEnv({ ...good, JWT_SECRET: "short" }).problems.some((p) => p.startsWith("JWT_SECRET")));
});

test("WP-12: production refuses to start with an unsafe config and says why", async () => {
  const run = await s.runScript("server.js", { NODE_ENV: "production", JWT_SECRET: "short", PORT: "0" }, 15_000);
  assert.equal(run.code, 1);
  assert.match(run.out, /JWT_SECRET/);
  assert.match(run.out, /RAZORPAY_WEBHOOK_SECRET/);
});

test("WP-12: health reports the database state", async () => {
  const res = await s.api("GET", "/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.db, "connected");
});
