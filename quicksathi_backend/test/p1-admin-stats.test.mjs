import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStack } from "./helpers/stack.mjs";

let s;
before(async () => { s = await startStack(); });
after(async () => { await s?.stop(); });

test("WP-12: dashboard revenue counts only money received, not unpaid, cancelled or refund-pending bookings", async () => {
  const admin = await s.createUser({ role: "admin" });
  const customer = await s.createUser();
  const service = await s.createService();
  await s.createBooking({ user: customer, service, amount: 1000, paymentStatus: "paid", status: "confirmed" });
  await s.createBooking({ user: customer, service, amount: 500, paymentStatus: "paid", status: "completed" });
  await s.createBooking({ user: customer, service, amount: 700, paymentStatus: "pending", status: "completed" }); // cash not collected
  await s.createBooking({ user: customer, service, amount: 900, paymentStatus: "refund_pending", status: "cancelled" });
  const res = await s.api("GET", "/admin/stats", { token: admin.token });
  assert.equal(res.status, 200, res.text);
  const total = res.body.totalRevenue ?? res.body.stats?.totalRevenue ?? res.body.revenue;
  assert.equal(total, 1500, JSON.stringify(res.body).slice(0, 300));
});

test("WP-12: a booking made at 00:30 IST lands in that IST day/month, not the previous UTC one", async () => {
  const admin = await s.createUser({ role: "admin" });
  const customer = await s.createUser();
  const service = await s.createService();
  const now = new Date();
  // First moment of this IST month + 30 minutes, expressed in UTC (which is still the previous month's last day).
  const istMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - 5.5 * 3600 * 1000);
  if (istMonthStart > now) return; // too early in the month for this assertion to be meaningful
  const lastMonth = async () => {
    const r = await s.api("GET", "/admin/stats", { token: admin.token });
    return r.body.monthlyRevenue[r.body.monthlyRevenue.length - 1].revenue;
  };
  const before = await lastMonth();
  await s.createBooking({ user: customer, service, amount: 250, paymentStatus: "paid", status: "confirmed", extra: { createdAt: new Date(istMonthStart.getTime() + 30 * 60 * 1000) } });
  assert.equal((await lastMonth()) - before, 250);
});
