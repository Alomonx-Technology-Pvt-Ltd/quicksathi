import { Router } from "express";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { notifyAdmins } from "../services/adminAlerts.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const toPaise = (rupees) => Math.round(rupees * 100);

function hmacHex(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Constant-time comparison of two hex strings.
function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

const isId = (v) => typeof v === "string" && mongoose.Types.ObjectId.isValid(v);

async function loadOwnBooking(req, res) {
  const { bookingId } = req.body || {};
  if (!isId(bookingId)) {
    res.status(400).json({ message: "Invalid or missing booking ID" });
    return null;
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return null;
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: "Not authorized" });
    return null;
  }
  return booking;
}

const notify = (recipient, title, message) =>
  Notification.create({ recipient, title, message, type: "booking" }).catch((err) =>
    console.error("Payment notification error:", err?.message || err)
  );

/**
 * Record a captured payment. Idempotent and atomic. Used by /verify (browser) and the webhook
 * (Razorpay); whichever arrives first wins and the second is a no-op.
 * Returns "paid", "refund_pending" (money arrived after the booking was cancelled),
 * "extra" (the booking was already settled another way, e.g. cash collected: this money must be
 * refunded) or "noop" (this same payment was already recorded).
 */
async function recordPayment(bookingId, paymentId) {
  const open = { _id: bookingId, paymentStatus: { $in: ["pending", "failed"] } };
  const history = (from, to, note) => ({ from, to, role: "system", at: new Date(), note });

  const paid = await Booking.findOneAndUpdate(
    { ...open, status: { $ne: "cancelled" } },
    { $set: { paymentStatus: "paid", razorpayPaymentId: paymentId } },
    { new: true }
  );
  if (paid) {
    // An online booking is confirmed by its payment (providers can't accept it before; see bookingStatus.js).
    await Booking.updateOne(
      { _id: bookingId, status: "pending" },
      { $set: { status: "confirmed" }, $push: { statusHistory: history("pending", "confirmed", "online payment received") } }
    );
    notify(paid.user, "Payment received ✅", `We received your payment for booking ${paid.bookingId}.`);
    return "paid";
  }

  const late = await Booking.findOneAndUpdate(
    { ...open, status: "cancelled" },
    {
      $set: { paymentStatus: "refund_pending", razorpayPaymentId: paymentId },
      $push: { statusHistory: history("cancelled", "cancelled", "payment received after cancellation: refund due") },
    },
    { new: true }
  );
  if (late) {
    notify(late.user, "Refund on its way", `Your payment for cancelled booking ${late.bookingId} arrived after the cancellation. We will refund it.`);
    await notifyAdmins("Refund needed 💸", `Booking ${late.bookingId} was paid (${paymentId}) after it was cancelled. Refund ₹${late.amount} in the Razorpay dashboard.`);
    return "refund_pending";
  }

  // Already settled by something else: cash collected after the customer switched to cash, or another
  // Razorpay payment on the same order. Nothing else stores this money, so flag it once for a refund.
  const current = await Booking.findById(bookingId).select("status paymentStatus razorpayPaymentId bookingId");
  if (!current || current.razorpayPaymentId === paymentId) return "noop";
  const note = `extra online payment ${paymentId} received while the booking was already ${current.paymentStatus}: refund due`;
  const flagged = await Booking.updateOne(
    { _id: bookingId, "statusHistory.note": { $ne: note } },
    { $push: { statusHistory: history(current.status, current.status, note) } }
  );
  if (flagged.modifiedCount) {
    console.warn(`AUDIT ${new Date().toISOString()} booking ${current.bookingId}: ${note}`);
    await notifyAdmins("Refund needed 💸", `Booking ${current.bookingId}: ${note}. Refund it in the Razorpay dashboard.`);
  }
  return "extra";
}

// POST /api/payments/create-order — Create (or reuse) a Razorpay order for one of MY bookings.
// The amount always comes from the booking, never from the request.
router.post("/create-order", protect, async (req, res) => {
  try {
    const booking = await loadOwnBooking(req, res);
    if (!booking) return;

    if (booking.paymentMethod !== "razorpay") {
      return res.status(400).json({ message: "This booking is not an online-payment booking" });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(409).json({ message: "This booking is already paid" });
    }
    if (booking.status !== "pending") {
      return res.status(409).json({ message: `A ${booking.status} booking can't be paid` });
    }
    const amount = toPaise(booking.amount);
    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({ message: "Booking amount is not payable online" });
    }

    let orderId = booking.razorpayOrderId;
    if (!orderId) {
      const order = await getRazorpay().orders.create({
        amount,
        currency: "INR",
        receipt: booking.bookingId,
        notes: { bookingId: booking._id.toString(), userId: req.user._id.toString() },
      });
      // Save only if no other request stored an order meanwhile (double click, retry on a cold start).
      // If one did, use that order so the customer can never pay an order we don't track.
      const saved = await Booking.findOneAndUpdate(
        { _id: booking._id, razorpayOrderId: null },
        { $set: { razorpayOrderId: order.id } },
        { new: true }
      );
      orderId = saved ? order.id : (await Booking.findById(booking._id)).razorpayOrderId;
    }

    res.json({
      orderId,
      amount,
      currency: "INR",
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("create-order error:", error?.error || error);
    res.status(502).json({ message: "Could not start the payment. Please try again." });
  }
});

// POST /api/payments/verify — Browser-side confirmation after Razorpay Checkout succeeds.
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((v) => typeof v === "string" && v)) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const booking = await loadOwnBooking(req, res);
    if (!booking) return;

    // The signed order must be the order WE created for THIS booking.
    if (!booking.razorpayOrderId || booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const expected = hmacHex(process.env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (!safeEqualHex(expected, razorpay_signature)) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const outcome = await recordPayment(booking._id, razorpay_payment_id);
    if (outcome === "refund_pending" || (outcome === "noop" && booking.status === "cancelled")) {
      return res.status(409).json({ message: "This booking was cancelled; your payment will be refunded." });
    }
    if (outcome === "extra") {
      return res.status(409).json({ message: "This booking was already paid; this payment will be refunded." });
    }
    const fresh = await Booking.findById(booking._id);
    res.json({ message: outcome === "paid" ? "Payment verified successfully" : "Payment already recorded", booking: fresh });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "This payment is already linked to another booking" });
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/cod-confirm — Switch an online booking to cash on delivery (nothing paid yet;
// a failed online attempt is fine). The booking stays pending until the provider accepts it.
router.post("/cod-confirm", protect, async (req, res) => {
  try {
    const booking = await loadOwnBooking(req, res);
    if (!booking) return;

    const updated = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "pending", paymentStatus: { $in: ["pending", "failed"] } },
      {
        $set: { paymentMethod: "cod", paymentStatus: "pending" },
        $push: { statusHistory: { from: "pending", to: "pending", by: req.user._id, role: "customer", at: new Date(), note: "switched to cash on delivery" } },
      },
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ message: "This booking can't be switched to cash on delivery" });
    }
    res.json({ message: "Switched to cash on delivery", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/webhook — Razorpay → us. Source of truth for payment state.
// Mounted with express.raw() in server.js so the signature is computed over the exact bytes.
router.post("/webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(503).json({ message: "Webhook not configured" });

    const raw = Buffer.isBuffer(req.body) ? req.body : null;
    const signature = req.get("x-razorpay-signature");
    if (!raw || !safeEqualHex(hmacHex(secret, raw), signature)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    let event;
    try {
      event = JSON.parse(raw.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const payment = event?.payload?.payment?.entity;
    const order = event?.payload?.order?.entity;
    const orderId = payment?.order_id || order?.id;
    if (!orderId) return res.json({ received: true });

    let booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (!booking) {
      // An order we created but whose id lost a race (see create-order): find the booking from the order notes.
      const notedId = order?.notes?.bookingId || payment?.notes?.bookingId;
      if (isId(notedId)) booking = await Booking.findById(notedId);
    }
    if (!booking) return res.json({ received: true }); // not one of ours / unknown order

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const amount = payment?.amount ?? order?.amount_paid;
      const currency = payment?.currency ?? order?.currency;
      // Only accept the exact amount we asked for.
      if (amount === toPaise(booking.amount) && currency === "INR" && payment?.id) {
        await recordPayment(booking._id, payment.id);
      } else {
        console.error(`Webhook amount mismatch for ${booking.bookingId}: got ${amount} ${currency}`);
      }
    } else if (event.event === "payment.failed") {
      // Only an online booking can fail online: a customer who switched to cash owes cash, not "failed".
      await Booking.updateOne({ _id: booking._id, paymentMethod: "razorpay", paymentStatus: "pending" }, { $set: { paymentStatus: "failed" } });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    // Non-2xx makes Razorpay retry, which is what we want for transient errors.
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

export default router;
