---
status: accepted
---
# The server decides every price; the client never sends an amount

`services/pricing.js → quote()` computes `{ originalAmount, discountAmount, amount }` from the catalog (the chosen package, or `startingPrice`; rentals use the stored `perKmRate` × distance, capped) and the coupon store. `POST /bookings`, `POST /bookings/quote` and `POST /coupons/validate` all call it, so what the customer sees is what is charged. A client-supplied `amount` is ignored, and the checkout page displays the amount returned by `/bookings/quote` (the `?price=` URL parameter is only a display fallback).

Before this, the price travelled in the URL and the request body, so any customer could book for ₹1, and the UI and server each applied the coupon (a 20% coupon was discounted twice).

Consequences: services need a valid price (a service with none can't be booked); rental distance is still reported by the browser (bounded by a cap) until the server computes routes; the catalog is the single source of truth, which is why mock prices were removed from the frontend (ADR 0009).
