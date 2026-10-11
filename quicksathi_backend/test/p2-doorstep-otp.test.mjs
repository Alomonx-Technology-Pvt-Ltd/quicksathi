// Doorstep start code: only the customer sees it, guesses are limited, only the assigned
// provider can start, and finishing a job never marks it paid. (docs/fix-plan-mvp.md Phase 0.3)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

const reload = (id) => s.db.collection("bookings").findOne({ _id: id });

async function setup({ status = "confirmed", otp = "4821" } = {}) {
  const { provider, user: providerUser } = await s.createProvider();
  const customer = await s.createUser();
  const service = await s.createService();
  const booking = await s.createBooking({ user: customer, service, provider, status, extra: { startOtp: otp, startOtpAttempts: 0 } });
  return { provider, providerUser, customer, service, booking };
}

const start = (b, token, otp) => s.api("POST", `/providers/bookings/${b._id}/start`, { token, body: { otp } });

test("a new booking gets a 4-digit start code that only the customer can read, once confirmed", async () => {
  const customer = await s.createUser();
  const service = await s.createService();
  const created = await s.api("POST", "/bookings", {
    token: customer.token,
    body: { serviceId: String(service._id), packageTitle: "Standard", paymentMethod: "cod", scheduledDate: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10), scheduledTime: "10:00", location: { address: "1 Test Rd", city: "Patna", pincode: "800001" } },
  });
  assert.equal(created.status, 201, created.text);
  assert.equal(created.body.startOtp, undefined, "a pending booking does not show the code yet");
  const stored = await reload(new mongoose.Types.ObjectId(created.body._id));
  assert.match(stored.startOtp, /^\d{4}$/);

  await s.db.collection("bookings").updateOne({ _id: stored._id }, { $set: { status: "confirmed" } });
  const mine = await s.api("GET", `/bookings/${stored._id}`, { token: customer.token });
  assert.equal(mine.body.startOtp, stored.startOtp);
  const list = await s.api("GET", "/bookings", { token: customer.token });
  assert.equal(list.body.find((b) => b._id === String(stored._id)).startOtp, stored.startOtp);

  const other = await s.createUser();
  assert.equal((await s.api("GET", `/bookings/${stored._id}`, { token: other.token })).status, 403);
  const admin = await s.createUser({ role: "admin" });
  const adminView = await s.api("GET", `/bookings/${stored._id}`, { token: admin.token });
  assert.equal(adminView.status, 200);
  assert.equal(adminView.body.startOtp, undefined, "admins don't need the customer's code");
});

test("no provider-facing response contains the start code", async () => {
  const { providerUser, booking } = await setup({ status: "pending" });
  const list = await s.api("GET", "/providers/bookings", { token: providerUser.token });
  assert.ok(!list.text.includes("4821"), "list leaks the code");
  const accepted = await s.api("PATCH", `/providers/bookings/${booking._id}/status`, { token: providerUser.token, body: { status: "confirmed" } });
  assert.equal(accepted.status, 200, accepted.text);
  assert.ok(!accepted.text.includes("4821"), "accept response leaks the code");
  assert.equal(accepted.body.booking.user.email !== undefined, true, "accept response keeps the customer's details");
});

test("five wrong codes lock the old code and issue a new one", async () => {
  const { providerUser, booking } = await setup();
  for (let i = 1; i <= 4; i++) {
    const r = await start(booking, providerUser.token, "0000");
    assert.equal(r.status, 400, r.text);
  }
  const fifth = await start(booking, providerUser.token, "0000");
  assert.equal(fifth.status, 429, fifth.text);
  const after5 = await reload(booking._id);
  assert.match(after5.startOtp, /^\d{4}$/);
  assert.equal(after5.startOtpAttempts, 0, "the new code gets a fresh set of attempts");
  assert.equal(after5.status, "confirmed");
  // 1-in-10,000 chance the new random code equals the old one; only assert when they differ.
  if (after5.startOtp !== "4821") assert.equal((await start(booking, providerUser.token, "4821")).status, 400);
});

test("only the assigned, approved provider can start; unassigned bookings can't be claimed", async () => {
  const { booking } = await setup();
  const { user: stranger } = await s.createProvider();
  assert.equal((await start(booking, stranger.token, "4821")).status, 404);

  const customer = await s.createUser();
  const service = await s.createService();
  const unassigned = await s.createBooking({ user: customer, service, status: "confirmed", extra: { startOtp: "1111" } });
  assert.equal((await start(unassigned, stranger.token, "1111")).status, 404);
  assert.equal((await reload(unassigned._id)).provider ?? null, null, "the booking was not claimed");

  const { provider: pendingProvider, user: pendingUser } = await s.createProvider({ approvalStatus: "pending" });
  const theirs = await s.createBooking({ user: customer, service, provider: pendingProvider, status: "confirmed", extra: { startOtp: "2222" } });
  assert.equal((await start(theirs, pendingUser.token, "2222")).status, 403);
});

test("a booking that isn't confirmed can't be started", async () => {
  const { providerUser, booking } = await setup({ status: "pending" });
  assert.equal((await start(booking, providerUser.token, "4821")).status, 409);
});

test("starting records history and the timer; completing leaves a cash job unpaid", async () => {
  const { providerUser, booking } = await setup();
  const ok = await start(booking, providerUser.token, "4821");
  assert.equal(ok.status, 200, ok.text);
  assert.ok(!ok.text.includes("4821"));
  const started = await reload(booking._id);
  assert.equal(started.status, "in_progress");
  assert.ok(started.startedAt && started.expectedEndAt > started.startedAt);
  assert.equal(started.startOtp, undefined, "the code is cleared once used");

  const done = await s.api("POST", `/providers/bookings/${booking._id}/complete`, { token: providerUser.token, body: { notes: "x".repeat(2000) } });
  assert.equal(done.status, 200, done.text);
  const finished = await reload(booking._id);
  assert.equal(finished.status, "completed");
  assert.equal(finished.paymentStatus, "pending");
  assert.equal(finished.completionNotes.length, 1000);
  assert.deepEqual(finished.statusHistory.map((h) => h.to), ["in_progress", "completed"]);
});

test("the timer length comes from the catalog, not the request", async () => {
  const customer = await s.createUser();
  const service = await s.createService();
  await s.db.collection("services").updateOne({ _id: service._id }, { $set: { durationMinutes: 90 } });
  const created = await s.api("POST", "/bookings", {
    token: customer.token,
    body: { serviceId: String(service._id), packageTitle: "Standard", paymentMethod: "cod", durationMinutes: 5, scheduledDate: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10), scheduledTime: "10:00", location: { address: "1 Test Rd", city: "Patna", pincode: "800001" } },
  });
  assert.equal(created.status, 201, created.text);
  assert.equal(created.body.durationMinutes, 90);
});

test("the old unguarded start/complete routes are gone", async () => {
  const { providerUser, booking } = await setup();
  assert.equal((await s.api("POST", `/bookings/${booking._id}/verify-otp-start`, { token: providerUser.token, body: { otp: "4821" } })).status, 404);
  assert.equal((await s.api("POST", `/bookings/${booking._id}/complete-work`, { token: providerUser.token })).status, 404);
});
