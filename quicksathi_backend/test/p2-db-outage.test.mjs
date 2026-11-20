// A database outage must not sign anyone out: signed-in calls get 503 (retry), never 401 ("session
// expired"), because the frontend clears the session on 401. Own stack: this file stops MongoDB.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop().catch(() => {}); });

test("a signed-in request during a database outage gets 503, not 401", async () => {
  const user = await s.createUser();
  assert.equal((await s.api("GET", "/auth/me", { token: user.token })).status, 200);

  await s.mongo.stop({ doCleanup: false });

  let res;
  for (let i = 0; i < 40; i++) {
    res = await s.api("GET", "/auth/me", { token: user.token });
    if (res.status === 503) break;
    assert.notEqual(res.status, 401, "a database outage signed the user out");
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.equal(res.status, 503, res.text);

  // A bad token is still a 401 during the outage.
  assert.equal((await s.api("GET", "/auth/me", { token: "not-a-token" })).status, 401);
});
