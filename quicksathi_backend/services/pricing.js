// Server-authoritative pricing. The client never sends an amount; everything here is derived
// from the catalog (Service) and the coupon store.
import mongoose from "mongoose";
import Service from "../models/Service.js";
import Coupon from "../models/Coupon.js";

export class PricingError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MAX_RENTAL_KM = 3000;

/** Resolve a serviceId given as ObjectId, slug or exact name. Public-visible services only. */
export async function resolveService(serviceId) {
  if (!serviceId || typeof serviceId !== "string") return null;
  const visible = { available: true, approvalStatus: "approved" };

  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    const byId = await Service.findOne({ _id: serviceId, ...visible });
    if (byId) return byId;
  }
  return Service.findOne({
    ...visible,
    $or: [
      { slug: serviceId.toLowerCase() },
      { name: { $regex: new RegExp(`^${escapeRegex(serviceId)}$`, "i") } },
    ],
  });
}

/** Catalog price for the chosen package (or per-km trip price for rentals). */
export function basePriceFor(service, { packageIndex, packageTitle, distanceKm } = {}) {
  const packages = service.packages || [];
  let pkg = null;

  const idx = Number.isInteger(Number(packageIndex)) && packageIndex !== "" && packageIndex != null ? Number(packageIndex) : null;
  if (idx !== null && packages[idx]) pkg = packages[idx];
  else if (typeof packageTitle === "string" && packageTitle) pkg = packages.find((p) => p.title === packageTitle) || null;

  const km = Number(distanceKm);
  if (service.serviceMode === "RENTAL" && service.perKmRate > 0 && km > 0) {
    // NOTE: distance is still reported by the client until server-side routing exists (see fix plan WP-12).
    return { price: Math.round(Math.min(km, MAX_RENTAL_KM) * service.perKmRate), pkg };
  }

  const price = pkg ? pkg.price : service.startingPrice;
  if (!Number.isFinite(price) || price <= 0) {
    throw new PricingError(400, "This service has no bookable price");
  }
  return { price, pkg };
}

export function discountFor(coupon, basePrice) {
  let discount;
  if (coupon.discountType === "percentage") {
    discount = Math.round((basePrice * Math.min(coupon.discountValue, 100)) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) discount = coupon.maxDiscountAmount;
  } else {
    discount = Math.min(coupon.discountValue, basePrice);
  }
  return Math.max(0, Math.min(discount, basePrice));
}

/** Returns an error message if the coupon can't be used by this user on this price, else null. */
export function couponProblem(coupon, { userId, basePrice, now = new Date() }) {
  if (!coupon.isActive) return "This coupon is currently inactive or disabled.";
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return "This coupon is not valid yet.";
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return "This coupon has expired.";
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return "This coupon has reached its maximum usage limit.";
  }
  if (coupon.usedBy?.some((e) => e.user && String(e.user) === String(userId))) {
    return "You have already used this coupon code. Each coupon can only be applied once per user.";
  }
  if (coupon.minOrderAmount && basePrice < coupon.minOrderAmount) {
    return `Minimum booking amount of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required to use this coupon.`;
  }
  return null;
}

/**
 * Price a booking request. Throws PricingError (4xx) for unknown service / bad coupon.
 * Pure read: nothing is redeemed here.
 */
export async function quote({ serviceId, packageIndex, packageTitle, distanceKm, couponCode, userId }) {
  const service = await resolveService(serviceId);
  if (!service) throw new PricingError(404, "Service not found");

  const { price: originalAmount, pkg } = basePriceFor(service, { packageIndex, packageTitle, distanceKm });

  let coupon = null;
  let discountAmount = 0;
  const code = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
  if (code) {
    coupon = await Coupon.findOne({ code });
    if (!coupon) throw new PricingError(400, "Invalid coupon code.");
    const problem = couponProblem(coupon, { userId, basePrice: originalAmount });
    if (problem) throw new PricingError(400, problem, { alreadyUsed: /already used/.test(problem) });
    discountAmount = discountFor(coupon, originalAmount);
  }

  return { service, pkg, coupon, originalAmount, discountAmount, amount: originalAmount - discountAmount };
}

/**
 * Atomically redeem a coupon for a user. Returns true on success, false if it was used up /
 * already redeemed by this user in the meantime (concurrent request).
 */
export async function redeemCoupon(coupon, { userId, bookingId, discountApplied }) {
  const updated = await Coupon.findOneAndUpdate(
    {
      _id: coupon._id,
      isActive: true,
      "usedBy.user": { $ne: userId },
      $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
    },
    { $inc: { usedCount: 1 }, $push: { usedBy: { user: userId, bookingId, discountApplied, usedAt: new Date() } } },
    { new: true }
  );
  return Boolean(updated);
}

export async function releaseCoupon(couponId, bookingId) {
  await Coupon.updateOne({ _id: couponId, "usedBy.bookingId": bookingId }, { $inc: { usedCount: -1 }, $pull: { usedBy: { bookingId } } });
}

// ── Scheduling (Asia/Kolkata) ──────────────────────────────────────────────

const ist = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function istParts(date) {
  const p = Object.fromEntries(ist.formatToParts(date).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/** Throws PricingError(400) unless the slot is today-or-later (and not already past, when today). */
export function assertFutureSlot(scheduledDate, scheduledTime, now = new Date()) {
  const date = new Date(scheduledDate);
  if (!scheduledDate || Number.isNaN(date.getTime())) {
    throw new PricingError(400, "A valid scheduled date is required (e.g. 2025-12-31)");
  }
  const today = istParts(now);
  const wanted = istParts(date);
  if (wanted.day < today.day) throw new PricingError(400, "The scheduled date is in the past");

  if (wanted.day === today.day && typeof scheduledTime === "string") {
    const m = scheduledTime.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (m) {
      let h = Number(m[1]);
      if (m[3]) h = (h % 12) + (m[3].toLowerCase() === "pm" ? 12 : 0);
      if (h * 60 + Number(m[2]) <= today.minutes) throw new PricingError(400, "The scheduled time has already passed");
    }
  }
  return date;
}
