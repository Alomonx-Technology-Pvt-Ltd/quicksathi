import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
let admin;
before(async () => { s = await startStack(); admin = await s.createUser({ role: "admin" }); });
after(async () => { await s?.stop(); });

const base = { title: "Test banner", image: "https://res.cloudinary.com/demo/x.jpg", link: "/services" };

test("WP-11: banners accept site paths and https links", async () => {
  for (const link of ["/services", "/category/painting", "https://partner.example.com/offer"]) {
    const res = await s.api("POST", "/banners", { token: admin.token, body: { ...base, link } });
    assert.equal(res.status, 201, `${link}: ${res.text}`);
  }
});

test("WP-11: banners reject javascript:, data:, protocol-relative and plain-http links", async () => {
  for (const link of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "http://insecure.example", "mailto:a@b.c"]) {
    const res = await s.api("POST", "/banners", { token: admin.token, body: { ...base, link } });
    assert.equal(res.status, 400, `${link} -> ${res.status}`);
  }
});

test("WP-11: editing a banner cannot introduce an unsafe link or image", async () => {
  const created = await s.api("POST", "/banners", { token: admin.token, body: base });
  assert.equal(created.status, 201, created.text);
  const id = created.body._id;
  assert.equal((await s.api("PUT", `/banners/${id}`, { token: admin.token, body: { link: "javascript:alert(1)" } })).status, 400);
  assert.equal((await s.api("PUT", `/banners/${id}`, { token: admin.token, body: { image: "javascript:alert(1)" } })).status, 400);
  assert.equal((await s.api("PUT", `/banners/${id}`, { token: admin.token, body: { ctaLink: "//evil.example" } })).status, 400);
});
