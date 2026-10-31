// Parity between the DB catalogue (seed/catalogue/services.json) and the frontend content files.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BACKEND_DIR } from "./helpers/stack.mjs";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const CONTENT_DIR = path.resolve(BACKEND_DIR, "../quicksathi_frontend/src/content/catalogue");
const services = readJson(path.join(BACKEND_DIR, "seed/catalogue/services.json"));

// Shared contract with the frontend (see catalogue content).
const packageKey = (title) =>
  title.toLowerCase().replace(/&/g, " and ").replace(/\+/g, " plus ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

for (const locale of ["en", "hi-Latn"]) {
  test(`catalogue parity: ${locale}.json matches services.json`, () => {
    const content = readJson(path.join(CONTENT_DIR, `${locale}.json`));
    const problems = [];
    for (const svc of services) {
      const c = content.services?.[svc.slug];
      if (!c) { problems.push(`${svc.slug}: missing`); continue; }
      const dbKeys = svc.packages.map((p) => packageKey(p.title)).sort();
      const contentKeys = Object.keys(c.packages || {}).sort();
      if (JSON.stringify(dbKeys) !== JSON.stringify(contentKeys)) {
        problems.push(`${svc.slug}: package keys ${JSON.stringify(contentKeys)} != ${JSON.stringify(dbKeys)}`);
        continue;
      }
      for (const p of svc.packages) {
        const label = c.packages[packageKey(p.title)].priceLabel ?? "";
        if (label.includes("{price}") !== p.price > 0) {
          problems.push(`${svc.slug}/${packageKey(p.title)}: priceLabel "${label}" vs price ${p.price}`);
        }
      }
    }
    assert.deepEqual(problems, []);
  });
}

test("catalogue parity: structure.json lists every slug exactly once", () => {
  const structure = readJson(path.join(CONTENT_DIR, "structure.json"));
  const listed = Object.values(structure.verticals).flatMap((v) => v.groups.flatMap((g) => g.slugs));
  const counts = listed.reduce((m, s) => m.set(s, (m.get(s) || 0) + 1), new Map());
  const problems = [];
  for (const svc of services) {
    if (counts.get(svc.slug) !== 1) problems.push(`${svc.slug}: listed ${counts.get(svc.slug) || 0}x`);
    if (structure.services?.[svc.slug]?.vertical !== svc.vertical) problems.push(`${svc.slug}: vertical mismatch`);
  }
  assert.deepEqual(problems, []);
});
