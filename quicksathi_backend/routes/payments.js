import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Initialize Razorpay
const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payments/create-order — Create Razorpay order
router.post("/create-order", protect, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: booking.bookingId,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Save order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/verify — Verify Razorpay payment
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Payment verified successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/cod-confirm — Confirm COD booking
router.post("/cod-confirm", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.paymentMethod = "cod";
    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "COD booking confirmed", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
