import { Router } from "express";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
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

/**
 * Mark a booking paid. Idempotent. Used by /verify (browser) and the webhook (Razorpay);
 * whichever arrives first wins and the second is a no-op.
 */
async function markPaid(booking, paymentId) {
  if (booking.paymentStatus === "paid") return booking;
  booking.paymentStatus = "paid";
  booking.razorpayPaymentId = paymentId;
  if (booking.status === "pending") booking.status = "confirmed";
  await booking.save();

  Notification.create({
    recipient: booking.user,
    title: "Payment received ✅",
    message: `We received your payment for booking ${booking.bookingId}.`,
    type: "booking",
  }).catch((err) => console.error("Payment notification error:", err?.message || err));
  return booking;
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
      orderId = order.id;
      booking.razorpayOrderId = orderId;
      await booking.save();
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

    if (booking.paymentStatus === "paid") {
      return res.json({ message: "Payment already recorded", booking });
    }
    if (booking.status === "cancelled") {
      return res.status(409).json({ message: "This booking was cancelled; contact support for a refund." });
    }

    await markPaid(booking, razorpay_payment_id);
    res.json({ message: "Payment verified successfully", booking });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "This payment is already linked to another booking" });
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/cod-confirm — Confirm a cash-on-delivery booking (only while nothing has been paid).
router.post("/cod-confirm", protect, async (req, res) => {
  try {
    const booking = await loadOwnBooking(req, res);
    if (!booking) return;

    if (booking.status !== "pending" || booking.paymentStatus !== "pending") {
      return res.status(409).json({ message: "This booking can't be switched to cash on delivery" });
    }

    booking.paymentMethod = "cod";
    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "COD booking confirmed", booking });
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
    if (!payment?.order_id) return res.json({ received: true });

    const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
    if (!booking) return res.json({ received: true }); // not one of ours / unknown order

    if (event.event === "payment.captured" || event.event === "order.paid") {
      // Only accept the exact amount we asked for.
      if (payment.amount === toPaise(booking.amount) && payment.currency === "INR") {
        await markPaid(booking, payment.id);
      } else {
        console.error(`Webhook amount mismatch for ${booking.bookingId}: got ${payment.amount} ${payment.currency}`);
      }
    } else if (event.event === "payment.failed" && booking.paymentStatus === "pending") {
      booking.paymentStatus = "failed";
      await booking.save();
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    // Non-2xx makes Razorpay retry, which is what we want for transient errors.
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

export default router;
