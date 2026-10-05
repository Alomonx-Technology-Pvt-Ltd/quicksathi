---
status: accepted
---
# Payments: the webhook is the source of truth, `/verify` is a fast path

A booking is created `paymentStatus: pending`, never `paid`. The order is created from the **booking's** amount (`create-order` ignores any amount in the request) and bound to that booking (`razorpayOrderId`, unique). When Checkout succeeds the browser calls `POST /payments/verify` (owner check, order must equal the booking's order, timing-safe HMAC compare) so the customer sees confirmation immediately. Razorpay's `payment.captured` webhook (HMAC over the raw body, `RAZORPAY_WEBHOOK_SECRET`) independently marks the booking paid and also handles customers who close the tab after paying. Both paths go through the same idempotent `markPaid`, and the webhook only accepts the exact expected amount and currency. `payment.failed` can mark a pending booking failed but can never override `paid`.

We did not rely on `/verify` alone because a closed tab or flaky network would leave paid customers unconfirmed; we did not rely on the webhook alone because a delayed webhook would make the success screen lie. Consequences: the webhook endpoint must be configured in the Razorpay dashboard and its secret set (production refuses to boot without it); `razorpayPaymentId` is unique so one payment can't be attached to two bookings.

Refunds are not automated yet: cancelling a paid booking sets `refund_pending` for a human to action.
