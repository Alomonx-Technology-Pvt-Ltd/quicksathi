import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startStack, uid } from "./helpers/stack.mjs";

let s, tmp;
before(async () => {
  s = await startStack();
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qs-catalogue-"));
});
after(async () => {
  await s?.stop();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

const writeFixture = (entries) => {
  const file = path.join(tmp, `${uid("cat")}.json`);
  fs.writeFileSync(file, JSON.stringify(entries));
  return file;
};
const load = (file, ...flags) => s.runScript(["seed/loadCatalogue.js", "--file", file, ...flags]);

const entry = (slug, vertical, packages, extra = {}) => ({
  slug, vertical, name: `Name ${slug}`, shortDescription: "short", fullDescription: "full",
  priceUnit: "per visit", serviceMode: "AT_HOME", comingSoon: false, tags: ["t"],
  faqs: [{ question: "Q?", answer: "A." }], packages, ...extra,
});

async function setup() {
  const V = uid("V_").toUpperCase();
  const { insertedId: catId } = await s.db.collection("categories").insertOne({ name: `Cat ${V}`, slug: V.toLowerCase(), vertical: V, isActive: true });
  const existingSlug = uid("svc-existing-");
  const otherSlug = uid("svc-other-");
  const now = new Date();
  const base = {
    category: catId, categoryName: `Cat ${V}`, approvalStatus: "approved", cities: ["Patna"],
    createdAt: now, updatedAt: now,
  };
  const { insertedId: existingId } = await s.db.collection("services").insertOne({
    ...base, slug: existingSlug, name: "Old name", startingPrice: 999, available: false, rating: 4.5, totalReviews: 7,
    thumbnail: "https://img/thumb.jpg", bannerImage: "https://img/banner.jpg", gallery: ["https://img/g1.jpg"], featured: true,
    packages: [
      { title: "Basic", price: 999, features: ["old"], image: "https://img/basic.jpg" },
      { title: "Dropped", price: 50, features: [], image: "https://img/dropped.jpg" },
    ],
  });
  const { insertedId: otherId } = await s.db.collection("services").insertOne({
    ...base, slug: otherSlug, name: "Unlisted", startingPrice: 1, available: true, packages: [{ title: "X", price: 1, features: [] }],
  });
  // Unlisted service in a different category: must never be hidden.
  const outsider = await s.createService();

  const newSlug = uid("svc-new-");
  const soonSlug = uid("svc-soon-");
  const skipSlug = uid("svc-skip-");
  const file = writeFixture([
    entry(existingSlug, V, [{ title: "Basic", price: 0, features: ["new"] }, { title: "Premium", price: 3.5, features: [] }]),
    entry(newSlug, V, [{ title: "Visit & Fix", price: 299, features: ["a"] }, { title: "Free check", price: 0, features: [] }, { title: "Add-on: extra part", price: 49, features: [], addOn: true }]),
    entry(soonSlug, V, [{ title: "Free", price: 0, features: [] }], { comingSoon: true }),
    entry(skipSlug, uid("NOPE_").toUpperCase(), [{ title: "A", price: 1, features: [] }]),
  ]);
  return { V, catId, existingSlug, existingId, otherSlug, otherId, outsider, newSlug, soonSlug, skipSlug, file };
}

const snapshot = async () => JSON.stringify(await s.db.collection("services").find().sort({ _id: 1 }).toArray());

test("catalogue loader: dry run writes nothing and lists what it would do", async () => {
  const f = await setup();
  const before = await snapshot();
  const r = await load(f.file);
  assert.equal(r.code, 0, r.out);
  assert.equal(await snapshot(), before, "dry run must not write");
  assert.match(r.out, /DRY RUN/);
  assert.match(r.out, new RegExp(`CREATE\\s+${f.newSlug}`));
  assert.match(r.out, new RegExp(`UPDATE\\s+${f.existingSlug}`));
  assert.match(r.out, /Basic=999, Dropped=50\s+->\s+Basic=0, Premium=3.5/);
  assert.match(r.out, new RegExp(`SKIP\\s+${f.skipSlug}`));
  assert.match(r.out, new RegExp(`HIDE\\s+${f.otherSlug}`));
  assert.doesNotMatch(r.out, new RegExp(f.outsider.slug));
  assert.doesNotMatch(r.out, /mongodb:\/\//, "never print the URI");
});

test("catalogue loader: --apply creates, updates in place, is idempotent, never deletes; --hide-unlisted scoped", async () => {
  const f = await setup();
  const countBefore = await s.db.collection("services").countDocuments();

  const r1 = await load(f.file, "--apply");
  assert.equal(r1.code, 0, r1.out);
  assert.match(r1.out, /create=2 update=1 unchanged=0 skip=1/);

  const svc = s.db.collection("services");
  const upd = await svc.findOne({ slug: f.existingSlug });
  assert.equal(String(upd._id), String(f.existingId));
  assert.equal(upd.available, false);
  assert.equal(upd.rating, 4.5);
  assert.equal(upd.totalReviews, 7);
  assert.equal(upd.featured, true);
  assert.deepEqual(upd.cities, ["Patna"]);
  assert.equal(upd.thumbnail, "https://img/thumb.jpg");
  assert.equal(upd.bannerImage, "https://img/banner.jpg");
  assert.deepEqual(upd.gallery, ["https://img/g1.jpg"]);
  assert.equal(upd.name, `Name ${f.existingSlug}`);
  assert.deepEqual(upd.packages.map((p) => [p.title, p.price, p.image]), [["Basic", 0, "https://img/basic.jpg"], ["Premium", 3.5, ""]]);
  assert.equal(upd.startingPrice, 3.5);
  assert.equal(upd.serviceMode, "AT_HOME");

  const created = await svc.findOne({ slug: f.newSlug });
  assert.equal(created.startingPrice, 299);
  assert.equal(created.available, true);
  assert.equal((await svc.findOne({ slug: f.soonSlug })).available, false);
  assert.equal(await svc.findOne({ slug: f.skipSlug }), null);

  const list = await s.api("GET", "/services");
  assert.equal(list.status, 200);
  const slugs = list.body.map((x) => x.slug);
  assert.ok(slugs.includes(f.newSlug), "new service visible via GET /api/services");
  assert.ok(!slugs.includes(f.soonSlug), "coming-soon service is hidden");

  const r2 = await load(f.file, "--apply");
  assert.equal(r2.code, 0, r2.out);
  assert.match(r2.out, /create=0 update=0 unchanged=3 skip=1/);
  assert.equal(await svc.countDocuments(), countBefore + 2, "nothing deleted");

  const r3 = await load(f.file, "--apply", "--hide-unlisted");
  assert.equal(r3.code, 0, r3.out);
  assert.equal((await svc.findOne({ _id: f.otherId })).available, false);
  assert.equal((await svc.findOne({ _id: f.outsider._id })).available, true, "other categories untouched");
  assert.equal((await svc.findOne({ slug: f.newSlug })).available, true);
  assert.equal(await svc.countDocuments(), countBefore + 2, "nothing deleted");
});

test("catalogue loader: rejects invalid input with non-zero exit and no writes", async () => {
  const V = "VEHICLE_RENTAL";
  const cases = [
    [{ vertical: V, name: "n", packages: [] }],
    [entry("a", V, []), entry("a", V, [])],
    [entry("b", V, [{ title: "T", price: 1 }, { title: "T", price: 2 }])],
    [entry("c", V, [{ title: "T", price: "100" }])],
    [{ slug: "d", vertical: V, packages: [] }],
  ];
  for (const c of cases) {
    const before = await snapshot();
    const r = await load(writeFixture(c), "--apply");
    assert.notEqual(r.code, 0, r.out);
    assert.match(r.out, /Invalid catalogue input/);
    assert.equal(await snapshot(), before);
  }
});
