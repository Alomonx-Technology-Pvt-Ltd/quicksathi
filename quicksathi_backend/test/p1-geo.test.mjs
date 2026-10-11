import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { startStack } from "./helpers/stack.mjs";

let s;
let upstream;
const hits = [];

before(async () => {
  upstream = http.createServer((req, res) => {
    hits.push({ url: req.url, ua: req.headers["user-agent"] });
    res.setHeader("content-type", "application/json");
    res.end(req.url.startsWith("/api/") || req.url.startsWith("/reverse?lon") ? JSON.stringify({ features: [] }) : JSON.stringify([{ display_name: "Patna, Bihar", lat: "25.6", lon: "85.1", address: {} }]));
  });
  await new Promise((r) => upstream.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${upstream.address().port}`;
  s = await startStack({ env: { GEO_NOMINATIM_URL: base, GEO_PHOTON_URL: base, GEO_USER_AGENT: "TiptoBook-test/1.0" } });
});
after(async () => { await s?.stop(); await new Promise((r) => upstream.close(r)); });

test("WP-12: geo search proxies Nominatim with a real User-Agent and caches repeats", async () => {
  const a = await s.api("GET", "/geo/nominatim/search?q=patna");
  const b = await s.api("GET", "/geo/nominatim/search?q=patna");
  assert.equal(a.status, 200);
  assert.equal(a.body[0].display_name, "Patna, Bihar");
  assert.deepEqual(b.body, a.body);
  const calls = hits.filter((h) => h.url.startsWith("/search"));
  assert.equal(calls.length, 1, "second identical search should come from the cache");
  assert.equal(calls[0].ua, "TiptoBook-test/1.0");
  assert.match(calls[0].url, /countrycodes=in/);
});

test("WP-12: reverse lookups round coordinates (~11 m) before they leave our server", async () => {
  const res = await s.api("GET", "/geo/nominatim/reverse?lat=25.612345678&lon=85.123456789");
  assert.equal(res.status, 200);
  const call = hits.find((h) => h.url.startsWith("/reverse?lat="));
  assert.match(call.url, /lat=25\.6123&lon=85\.1235/);
});

test("WP-12: geo endpoints validate input", async () => {
  assert.equal((await s.api("GET", "/geo/nominatim/search?q=a")).status, 400);
  assert.equal((await s.api("GET", `/geo/photon/search?q=${"x".repeat(200)}`)).status, 400);
  assert.equal((await s.api("GET", "/geo/nominatim/reverse?lat=abc&lon=1")).status, 400);
  assert.equal((await s.api("GET", "/geo/photon/reverse?lat=200&lon=1")).status, 400);
});

test("WP-12: Nominatim calls are spaced at least a second apart", async () => {
  const t0 = Date.now();
  await Promise.all([s.api("GET", "/geo/nominatim/search?q=delhi"), s.api("GET", "/geo/nominatim/search?q=mumbai")]);
  assert.ok(Date.now() - t0 >= 1000, `two distinct searches finished in ${Date.now() - t0}ms`);
});
