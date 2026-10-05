import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

test("P0-11: the seed script refuses to run in production and never deletes bookings", async () => {
  const user = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user, service, paymentStatus: "paid", paymentMethod: "razorpay" });
  const run = await s.runScript("seed/seedData.js", { NODE_ENV: "production" });
  const after = await s.db.collection("bookings").findOne({ _id: booking._id });
  assert.ok(after, `seed deleted a real booking (exit ${run.code})\n${run.out.slice(0, 400)}`);
  assert.notEqual(run.code, 0, "seed should exit non-zero when refusing to run in production");
});
