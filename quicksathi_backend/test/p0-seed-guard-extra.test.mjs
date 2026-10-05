import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

test("WP-6: the seed refuses a database that is not on the dev allowlist", async () => {
  const run = await s.runScript("seed/seedData.js", { MONGODB_URI: "mongodb://127.0.0.1:9/quicksathi" });
  assert.equal(run.code, 1);
  assert.match(run.out, /allowlist/);
});

test("WP-6: on an allowed dev database the seed builds a catalog and leaves bookings/users alone", async () => {
  const user = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user, service, paymentStatus: "paid", paymentMethod: "razorpay" });
  const run = await s.runScript("seed/seedData.js");
  assert.equal(run.code, 0, run.out.slice(-600));
  assert.ok(await s.db.collection("bookings").findOne({ _id: booking._id }), "booking was deleted");
  assert.ok(await s.db.collection("users").findOne({ _id: user._id }), "user was deleted");
  assert.ok((await s.db.collection("services").countDocuments({ approvalStatus: { $ne: "pending" } })) > 10, "catalog was not seeded");
  assert.equal(await s.db.collection("bookings").countDocuments({ bookingId: /^QS-(PHOTO|DECOR|CAR|PLUMB)-/ }), 0, "fake sample bookings were created");
});
