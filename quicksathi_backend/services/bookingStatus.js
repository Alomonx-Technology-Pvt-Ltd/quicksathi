// The one place that decides which booking status changes are legal.
// Every route that changes a booking's status goes through changeStatus().

export class BookingStateError extends Error {
  constructor(message, status = 409) {
    super(message);
    this.status = status;
  }
}

export const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

// Normal lifecycle (customer's own cancel is narrower, see below).
const TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

// Admins can additionally cancel a job that is already under way.
const ADMIN_EXTRA = { in_progress: ["cancelled"] };

// A customer can only cancel, and only before the job starts.
const CUSTOMER_CANCELLABLE = ["pending", "confirmed"];

export function allowedNext(from, role) {
  if (role === "customer") return CUSTOMER_CANCELLABLE.includes(from) ? ["cancelled"] : [];
  return [...(TRANSITIONS[from] || []), ...(role === "admin" ? ADMIN_EXTRA[from] || [] : [])];
}

/**
 * Apply a status change to a booking document (does not save).
 * role: "customer" | "provider" | "admin"
 */
export function changeStatus(booking, to, { actorId, role, reason = "" }) {
  if (!STATUSES.includes(to)) throw new BookingStateError("Invalid status", 400);
  if (!allowedNext(booking.status, role).includes(to)) {
    throw new BookingStateError(`A ${booking.status.replace("_", " ")} booking can't be changed to ${to.replace("_", " ")}`);
  }
  // An online booking is confirmed by its payment (routes/payments.js), never by a provider or admin
  // before the money arrives; otherwise it could be worked and completed with no way to pay.
  if (to === "confirmed" && booking.paymentMethod === "razorpay" && booking.paymentStatus !== "paid") {
    throw new BookingStateError("This online booking is awaiting payment; it is confirmed automatically once paid");
  }

  booking.statusHistory = booking.statusHistory || [];
  booking.statusHistory.push({ from: booking.status, to, by: actorId, role, at: new Date() });
  booking.status = to;

  if (to === "cancelled") {
    booking.cancelledBy = role === "customer" ? "user" : role;
    booking.cancelReason = String(reason || "").slice(0, 500);
    // Money already received must be refunded: flag it so it can't be forgotten.
    if (booking.paymentStatus === "paid") booking.paymentStatus = "refund_pending";
  }
  return booking;
}

/** Cash-on-delivery money is "paid" only when someone explicitly confirms the cash was collected. */
export function markCashCollected(booking, { actorId, role }) {
  if (booking.paymentMethod !== "cod") throw new BookingStateError("Only cash-on-delivery bookings can be marked cash collected");
  if (!["in_progress", "completed"].includes(booking.status)) {
    throw new BookingStateError("Cash can only be marked collected once the service has started");
  }
  if (booking.paymentStatus === "paid") return booking;
  if (booking.fareConfirmed === false) throw new BookingStateError("Confirm the final fare before marking cash collected");
  booking.paymentStatus = "paid";
  booking.statusHistory = booking.statusHistory || [];
  booking.statusHistory.push({ from: booking.status, to: booking.status, by: actorId, role, at: new Date(), note: "cash collected" });
  return booking;
}

/**
 * Rentals are booked at an estimate; the provider (or admin) records the final fare once the trip is under
 * way or done, before cash is collected. maxAmount caps typos (see maxRentalFare in pricing.js).
 */
export function confirmFare(booking, amount, { actorId, role, maxAmount }) {
  if (booking.fareConfirmed !== false) throw new BookingStateError("This booking's price is already final");
  if (!["in_progress", "completed"].includes(booking.status)) {
    throw new BookingStateError("The fare can be confirmed once the trip has started");
  }
  if (booking.paymentStatus !== "pending") throw new BookingStateError("This booking is already paid");
  const fare = Number(amount);
  if (!Number.isInteger(fare) || fare < 1 || (maxAmount && fare > maxAmount)) {
    throw new BookingStateError(`Enter the final fare in whole rupees${maxAmount ? ` (up to ₹${maxAmount})` : ""}`, 400);
  }
  const estimate = booking.amount;
  booking.amount = fare;
  booking.originalAmount = fare;
  booking.discountAmount = 0;
  booking.fareConfirmed = true;
  booking.statusHistory = booking.statusHistory || [];
  booking.statusHistory.push({ from: booking.status, to: booking.status, by: actorId, role, at: new Date(), note: `fare confirmed: ₹${estimate} estimate → ₹${fare}` });
  return booking;
}
