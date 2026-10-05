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
  booking.paymentStatus = "paid";
  booking.statusHistory = booking.statusHistory || [];
  booking.statusHistory.push({ from: booking.status, to: booking.status, by: actorId, role, at: new Date(), note: "cash collected" });
  return booking;
}
