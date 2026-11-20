# TiptoBook — Domain Language

TiptoBook is a marketplace where **customers** book local **services** that approved **providers** perform. This file fixes the vocabulary used in code, tests and docs.

## People

**Customer**:
A person who books services. Stored as a `User` with `role: "user"`.
_Avoid_: client, buyer (the admin API still accepts `"client"` as an alias for `user`; see Flagged ambiguities)

**Provider**:
A business or individual who performs services. A `User` with `role: "provider"` **and** an approved `Provider` profile.
_Avoid_: vendor, partner (the marketing site says "Become a Partner"), professional

**Admin**:
A staff `User` with `role: "admin"`. Created only by an explicit grant (`scripts/grant-admin.mjs` or another admin), never from an email address.
_Avoid_: super admin, owner

## Catalog

**Category**:
A top-level grouping (vertical) such as Home Salon or Vehicle Rental, with optional sub-categories.

**Service**:
A bookable offering in a category (e.g. "Foam Jet AC Service"). Public only when `approvalStatus = approved` and `available = true`.
_Avoid_: product (the `/product/:id` route is a legacy redirect), listing

**Package**:
A priced option inside a service (e.g. Silver Menu). The booking price is the chosen package's price.

**Starting price**:
A service's "from" price, used only when no package is selected. Never a promise of the final price.

**Rental service**:
A service with `serviceMode = RENTAL`. Booked at an **estimated fare** (`perKmRate × distance` from the customer's route), paid in cash, no coupons.

**Estimated fare / confirmed fare**:
A rental's price is an estimate (`fareConfirmed: false`) until the provider or an admin records the final fare; cash can be marked collected only after that.

## Booking and money

**Booking**:
A customer's request for one service at a scheduled slot, identified by `bookingId` (`QS-…`).

**Quote**:
The server's price for a booking request: `{ originalAmount, discountAmount, amount }`. The only source of price; the client never supplies an amount.

**Slot**:
The scheduled date + time of a booking, interpreted in India Standard Time (Asia/Kolkata).

**Booking status**:
`pending → confirmed → in_progress → completed`, or `cancelled`. Legal moves are defined once in `services/bookingStatus.js`; every change is recorded in `statusHistory`.

**Payment status**:
`pending`, `paid`, `failed`, `refund_pending`, `refunded`. Independent of booking status: a `completed` cash job can still be `pending` until cash is recorded.

**Cash collected**:
The explicit action by which a provider or admin records that the customer paid cash for a COD booking.

**Doorstep start code**:
The 4-digit code the customer reads out to the provider on arrival; entering it starts the job (`in_progress`) and its **live timer** (`durationMinutes` from the catalog). Only the customer sees it; 5 wrong tries replace it.

**Refund queue**:
Bookings with `paymentStatus = refund_pending` (paid, then cancelled, or paid after cancelling). Refunded by hand in Razorpay, then set to `refunded`.

**Coupon**:
A discount code. Redeemed at most once per customer and within its global limit; redemption is atomic with booking creation.
_Avoid_: promo code, voucher, offer (the UI says "Offers"; the data is a Coupon)

**Webhook**:
Razorpay's server-to-server notification of a payment event; the source of truth for whether money arrived.

## Providers and trust

**Provider application**:
A `Provider` document with `approvalStatus = pending`, created at onboarding or when an admin promotes a user. Granting the provider role requires approving it.

**KYC documents**:
The ID proof, selfie and optional business registration a provider uploads. Private Cloudinary files; admins see them only through short-lived signed links.

**Approved / active provider**:
`approvalStatus = approved` and `isActive = true`. Only these can be assigned jobs or services. An approved provider who switches to unavailable (`isActive = false`) can still finish jobs already assigned.

**Vertical**:
A category's business module (`WEDDING`, `VEHICLE_RENTAL`, …, `CONSTRUCTION`). A fixed list in `models/Category.js`; adding one is a code change.

## Platform

**Dev seed**:
`npm run seed:dev`: rebuilds a development catalog. Refuses production and any database not on the allowlist.

**Hermetic test stack**:
`test/helpers/stack.mjs`: the real server on an in-memory MongoDB with a sealed environment.

## Relationships

- A **Customer** places many **Bookings**; a **Booking** is for one **Service** (and one **Package** of it) and may be assigned one **Provider**.
- A **Provider** has exactly one **Provider application/profile**, which is reviewed by an **Admin**.
- A **Coupon** is redeemed by a **Customer** at most once, and is tied to the **Booking** it discounted.

## Flagged ambiguities

- **"client" vs "user"**: the database role is `user`; `PATCH /api/admin/users/:id/role` accepts `"client"` for compatibility and maps it to `user`. Prefer **Customer** in prose and `user` in code.
- **QuickSathi vs TiptoBook**: the brand is **TiptoBook**. `quicksathi_*` directory names, the `QS-` booking prefix, the `qs_` localStorage keys and one legacy support email still use the old name; renaming them is a coordinated migration, not a drive-by edit.
- **"Confirmed"** means a provider/admin accepted the job (or an online payment succeeded). It does not mean paid for cash jobs.
- **"Complete"** (booking) and **"paid"** are separate facts (see Payment status).

## Example dialogue

> **Dev:** A customer says they paid but the booking still shows *pending*.
> **Support:** Online payment? Then the **webhook** or the browser's *verify* call hasn't marked it paid. Check `paymentStatus` and `razorpayPaymentId`; if Razorpay shows captured, replaying the webhook fixes it.
> **Dev:** And for a cash job the provider finished yesterday?
> **Support:** *Completed* doesn't make it paid. The provider has to press **Cash collected**; until then `paymentStatus` stays *pending*.
> **Dev:** The customer cancelled a paid booking.
> **Support:** It becomes **refund_pending**. Refunds are done by hand in Razorpay today, then set to *refunded*.
