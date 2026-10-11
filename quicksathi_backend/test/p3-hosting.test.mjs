// Host-neutral config (Round 4, R4.3): proxy hops and CORS origins come only from env vars.
import { test } from "node:test";
import assert from "node:assert/strict";
import { trustProxySetting, makeOriginChecker } from "../config/hosting.js";

test("TRUST_PROXY: default one hop, numbers, false, and named values", () => {
  assert.equal(trustProxySetting(undefined), 1);
  assert.equal(trustProxySetting(""), 1);
  assert.equal(trustProxySetting("2"), 2);
  assert.equal(trustProxySetting("0"), 0);
  assert.equal(trustProxySetting("false"), false);
  assert.equal(trustProxySetting("loopback"), "loopback");
});

test("production CORS: exact origins and single-label preview suffixes only", () => {
  const allowed = makeOriginChecker({
    NODE_ENV: "production",
    CLIENT_URL: "https://tiptobook.com",
    CORS_ORIGINS: "https://staging.tiptobook.com, https://admin.tiptobook.com",
    CORS_ORIGIN_PATTERNS: "--tiptobook.netlify.app,.tiptobook.pages.dev",
  });
  for (const ok of [
    "https://tiptobook.com",
    "https://staging.tiptobook.com",
    "https://admin.tiptobook.com",
    "https://deploy-preview-12--tiptobook.netlify.app",
    "https://abc123.tiptobook.pages.dev",
    "http://localhost:5173",
    undefined,
  ]) assert.equal(allowed(ok), true, String(ok));
  for (const bad of [
    "https://evil.com",
    "http://tiptobook.com", // not https
    "https://tiptobook.com.evil.com",
    "https://a.b.tiptobook.pages.dev", // more than one label before the suffix
    "http://deploy-preview-12--tiptobook.netlify.app",
    "https://other.netlify.app",
  ]) assert.equal(allowed(bad), false, bad);
});

test("outside production any origin is allowed (local tools, previews of previews)", () => {
  assert.equal(makeOriginChecker({ NODE_ENV: "development" })("https://anything.example"), true);
});
