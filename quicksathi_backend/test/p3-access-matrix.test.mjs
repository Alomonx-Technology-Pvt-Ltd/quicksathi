// Route access matrix (Round 4, R4.4). Every API route must be listed below with who may call it.
// Adding a route without an entry, or changing a route's guard, fails this test, so access rules are
// a reviewed decision rather than something that's easy to forget.
//
// Levels:   public    anyone (no `protect`)
//           user      any signed-in account (`protect`); ownership is checked inside the handler
//           provider  `protect` + `providerOnly` (providers and admins)
//           admin     `protect` + `adminOnly`
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { startStack, BACKEND_DIR } from "./helpers/stack.mjs";

const MATRIX = `
POST   /api/auth/login                                public
POST   /api/auth/google                               public
POST   /api/auth/provider-google                      public
POST   /api/auth/admin-google                         public
POST   /api/auth/phone                                public
POST   /api/auth/provider-login                       public
POST   /api/auth/admin-login                          public
GET    /api/auth/me                                   user
PUT    /api/auth/profile                              user
GET    /api/categories/                               public
GET    /api/categories/:id                            public
POST   /api/categories/                               admin
PUT    /api/categories/:id                            admin
GET    /api/services/cities                           public
GET    /api/services/                                 public
GET    /api/services/:id                              public
GET    /api/services/slug/:slug                       public
POST   /api/services/                                 admin
PUT    /api/services/:id                              admin
DELETE /api/services/:id                              admin
POST   /api/bookings/quote                            user
POST   /api/bookings/                                 user
GET    /api/bookings/                                 user
GET    /api/bookings/:id                              user
PATCH  /api/bookings/:id/cancel                       user
PATCH  /api/bookings/:id/status                       admin
POST   /api/providers/register                        user
GET    /api/providers/me                              user
GET    /api/providers/status                          user
PUT    /api/providers/me                              provider
POST   /api/providers/services                        provider
GET    /api/providers/services                        provider
GET    /api/providers/bookings                        provider
PATCH  /api/providers/bookings/:id/status             provider
POST   /api/providers/bookings/:id/start              provider
POST   /api/providers/bookings/:id/complete           provider
POST   /api/providers/bookings/:id/cash-collected     provider
POST   /api/providers/bookings/:id/fare               provider
GET    /api/providers/                                public
GET    /api/admin/stats                               admin
GET    /api/admin/services                            admin
GET    /api/admin/services/:id                        admin
POST   /api/admin/services                            admin
PUT    /api/admin/services/:id                        admin
DELETE /api/admin/services/:id                        admin
PATCH  /api/admin/services/:id/toggle                 admin
GET    /api/admin/categories                          admin
GET    /api/admin/categories/:id                      admin
POST   /api/admin/categories                          admin
PUT    /api/admin/categories/:id                      admin
DELETE /api/admin/categories/:id                      admin
PATCH  /api/admin/categories/:id/toggle               admin
PATCH  /api/admin/categories/:id/coming-soon          admin
GET    /api/admin/providers                           admin
GET    /api/admin/providers/:id/documents             admin
PATCH  /api/admin/providers/:id/approve               admin
PATCH  /api/admin/providers/:id/reject                admin
PATCH  /api/admin/services/:id/assign-provider        admin
PATCH  /api/admin/bookings/:id/assign                 admin
PATCH  /api/admin/bookings/:id/status                 admin
POST   /api/admin/bookings/:id/cash-collected         admin
PATCH  /api/admin/bookings/:id/fare                   admin
GET    /api/admin/users                               admin
PATCH  /api/admin/users/:id/role                      admin
DELETE /api/admin/users/:id                           admin
POST   /api/admin/upload                              admin
POST   /api/admin/send-email                          admin
GET    /api/admin/notifications                       admin
GET    /api/admin/service-requests                    admin
PATCH  /api/admin/service-requests/:id/approve        admin
PATCH  /api/admin/service-requests/:id/reject         admin
GET    /api/admin/bookings                            admin
GET    /api/admin/providers/approved                  admin
POST   /api/admin/test-email                          admin
POST   /api/payments/create-order                     user
POST   /api/payments/verify                           user
POST   /api/payments/cod-confirm                      user
POST   /api/payments/webhook                          public
GET    /api/notifications/                            user
PUT    /api/notifications/read-all                    user
PUT    /api/notifications/:id/read                    user
DELETE /api/notifications/:id                         user
POST   /api/contact/                                  public
GET    /api/contact/admin-list                        admin
PATCH  /api/contact/admin-list/:id                    admin
DELETE /api/contact/admin-list/:id                    admin
POST   /api/ai/chat                                   public
GET    /api/banners/                                  public
GET    /api/banners/admin                             admin
POST   /api/banners/                                  admin
PUT    /api/banners/:id                               admin
PATCH  /api/banners/:id/toggle                        admin
DELETE /api/banners/:id                               admin
GET    /api/coupons/active                            public
POST   /api/coupons/validate                          user
GET    /api/coupons/admin                             admin
POST   /api/coupons/                                  admin
PUT    /api/coupons/:id                               admin
PATCH  /api/coupons/:id/toggle                        admin
DELETE /api/coupons/:id                               admin
GET    /api/geo/nominatim/search                      public
GET    /api/geo/nominatim/reverse                     public
GET    /api/geo/photon/search                         public
GET    /api/geo/photon/reverse                        public
`;

const expected = new Map(
  MATRIX.trim().split("\n").map((line) => {
    const [method, route, level] = line.trim().split(/\s+/);
    return [`${method} ${route}`, level];
  })
);

// Discover the real routes: mount points from server.js, routes and guards from each router.
async function discoverRoutes() {
  process.env.DOTENV_CONFIG_PATH = "/dev/null";
  const { protect } = await import("../middleware/auth.js");
  const { adminOnly, providerOnly } = await import("../middleware/admin.js");
  const server = fs.readFileSync(path.join(BACKEND_DIR, "server.js"), "utf8");
  const files = Object.fromEntries([...server.matchAll(/import (\w+) from "\.\/routes\/(\w+)\.js"/g)].map((m) => [m[1], m[2]]));
  const mounts = [...server.matchAll(/app\.use\("(\/api\/[\w-]+)", (\w+)\)/g)].filter((m) => files[m[2]]);
  assert.ok(mounts.length >= 10, "could not read route mounts from server.js");

  const found = new Map();
  for (const [, prefix, name] of mounts) {
    const router = (await import(`../routes/${files[name]}.js`)).default;
    for (const layer of router.stack) {
      if (!layer.route) continue;
      const fns = layer.route.stack.map((l) => l.handle);
      const level = fns.includes(adminOnly) ? "admin" : fns.includes(providerOnly) ? "provider" : fns.includes(protect) ? "user" : "public";
      for (const method of Object.keys(layer.route.methods)) found.set(`${method.toUpperCase()} ${prefix}${layer.route.path}`, level);
    }
  }
  return found;
}

test("every API route is in the access matrix with the guard it actually has", async () => {
  const found = await discoverRoutes();
  const missing = [...found.keys()].filter((k) => !expected.has(k));
  const stale = [...expected.keys()].filter((k) => !found.has(k));
  const wrong = [...found].filter(([k, level]) => expected.has(k) && expected.get(k) !== level).map(([k, level]) => `${k}: matrix says ${expected.get(k)}, route is ${level}`);
  assert.deepEqual(missing, [], `routes without a matrix entry (add them to MATRIX with the intended level):\n${missing.join("\n")}`);
  assert.deepEqual(stale, [], `matrix entries for routes that no longer exist:\n${stale.join("\n")}`);
  assert.deepEqual(wrong, [], `routes whose guard differs from the matrix:\n${wrong.join("\n")}`);
});

describeOverHttp();

function describeOverHttp() {
  let s;
  let customer;
  let provider;
  before(async () => {
    s = await startStack();
    customer = await s.createUser();
    provider = (await s.createProvider()).user;
  });
  after(async () => { await s?.stop(); });

  const ID = "507f1f77bcf86cd799439011";
  const call = (key, token) => {
    const [method, route] = key.split(" ");
    const url = route.replace(/^\/api/, "").replace(/:[A-Za-z]+/g, ID);
    return s.api(method, url, { token, body: method === "GET" || method === "DELETE" ? undefined : {} });
  };

  test("over HTTP: guarded routes refuse anonymous callers (401) and the wrong role (403)", async () => {
    const failures = [];
    for (const [key, level] of expected) {
      if (level === "public") continue;
      const anon = await call(key);
      if (anon.status !== 401) failures.push(`${key} anonymous → ${anon.status}`);
      if (level === "admin" || level === "provider") {
        const res = await call(key, customer.token);
        if (res.status !== 403) failures.push(`${key} as customer → ${res.status}`);
      }
      if (level === "admin") {
        const res = await call(key, provider.token);
        if (res.status !== 403) failures.push(`${key} as provider → ${res.status}`);
      }
    }
    assert.deepEqual(failures, []);
  });
}
