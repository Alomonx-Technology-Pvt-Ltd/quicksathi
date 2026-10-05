# Developer walkthrough: the security and reliability overhaul

Audience: the developer who will own this code next. Read it top to bottom once (about 30 minutes), then use it as a map. It explains **what was wrong, why it mattered, what we changed and why that way, and how to see it working**. Reference docs: [ARCHITECTURE.md](../ARCHITECTURE.md), [CONTEXT.md](../CONTEXT.md), [ADRs](./adr/), the original [code review](./code-review-2026-10-04.md) and the [fix plan](./fix-plan-p0-p1.md).

## 0. Ground rules we followed

1. **Tests first, through the HTTP API.** `quicksathi_backend/test/` boots the real server on an in-memory MongoDB with a sealed environment (it never reads `.env`). The first version of those tests *failed*, each for the reason described in the review; fixes turned them green. 102 tests pass now: `cd quicksathi_backend && npm test`.
2. **Local, reviewable commits.** Nothing here has been pushed. Each work package (WP) is one commit (or a few); all of them are merged, in order, into the local branch `aditya-fixes-and-improvement`. Use `git log --oneline main..aditya-fixes-and-improvement` to read them one by one.
3. **Don't break the data you can't see.** The production database was never touched. Anything that changes data shape ships with a dry-run migration.

## 1. Run it and prove it works (15 minutes)

```bash
cd quicksathi_backend && npm ci && npm test                 # 102 tests, hermetic
# optional: see the app
# 1) create a dev database (e.g. a free Atlas cluster, db name "quicksathi_dev") and put it in .env as MONGODB_URI
npm run seed:dev && npm run dev                              # API on :5050
cd ../quicksathi_frontend && npm ci && npm run dev           # app on :5173 (works without a .env)
```
Google/phone login need the `VITE_FIREBASE_*` values; email/password login works without them.

## 2. Authentication and admin access (WP-1, ADR 0001, 0004)

**What was wrong.** `/auth/google`, `/auth/provider-google` and `/auth/admin-google` verified the Firebase token *only if one was sent*; otherwise they used the `email` from the request body. `POST /api/auth/admin-google {"email":"<an admin>"}` returned an admin session. Separately, anyone could `register` with an address in `ADMIN_EMAILS` and be made admin, a single shared `ADMIN_PASSWORD` unlocked admin login, and a user could change their profile email to an admin address. `/auth/phone` fell back to the body `phone`. If Firebase failed to initialise the server just logged and kept serving, making all of the above the *normal* path.

**What changed.**
- `routes/auth.js`: one helper, `verifyFirebaseIdentity(idToken)`, is the only way identity enters. No token → 400, invalid → 401, Firebase unavailable → 503. Google flows require a **verified** email; phone login requires the token's own `phone_number`.
- Admin is granted only by `scripts/grant-admin.mjs` or by another admin (target needs a verified email). `ADMIN_PASSWORD` and email-based promotion are gone. `ADMIN_EMAILS` is now only the recipient list for contact-form emails.
- `/auth/profile` can't change email or phone; duplicate email/phone is a 409.
- Production exits at boot without Firebase Admin (`config/firebase.js`).
- Frontend sends only `{ idToken }` (`context/AuthContext.jsx`); legacy 404 fallbacks removed.

**Design note you'll be asked about:** phone login matches an existing account by phone *only if that account was created by phone sign-in*. A phone number typed into an email/Google account is unverified and must not grant access to whoever later proves they own that number.

**See it:** `test/p0-security.test.mjs` (P0-1/2/3), `test/p0-identity-extra.test.mjs`.

## 3. Prices, coupons and payments (WP-3, WP-4, ADR 0002, 0003)

**What was wrong.** The price travelled in the URL (`?price=`) and request body, and the server trusted it, so a ₹5,000 service could be booked for ₹1. The frontend sent the **already discounted** amount *and* the coupon, and the server discounted again (₹1000, 20% → UI ₹800, stored ₹640). "Pay online" waited 1.5 s, created a booking with `paymentStatus: paid`, and never called Razorpay. `/payments/verify` didn't check the caller owned the booking or that the signed order belonged to it. Coupon use wasn't atomic, ignored `validFrom` and `usageLimit` at booking time, and silently dropped invalid coupons.

**What changed.**
- `services/pricing.js` — `quote()` is the only place a price is computed; `resolveService` only returns public (approved, available) services; `assertFutureSlot` validates in IST; `redeemCoupon` is a single guarded `findOneAndUpdate`.
- New `POST /api/bookings/quote`; `/coupons/validate` uses the same code. `PaymentPage` shows the server's quote, sends no amount, and reuses the booking when the customer retries (no duplicates).
- `routes/payments.js` rewritten: `create-order` (amount from the booking, idempotent), `verify` (owner + order binding + timing-safe HMAC + idempotent), `webhook` (raw body, HMAC, exact amount), `cod-confirm` (only for unpaid pending bookings). `razorpayOrderId`/`razorpayPaymentId` are unique.
- Frontend: `utils/razorpayCheckout.js` (Checkout), "Pay now" in My Bookings for unpaid online bookings.

**You must still do:** put working Razorpay **test** keys in, create the webhook (`/api/payments/webhook`; events `payment.captured`, `payment.failed`, `order.paid`), set `RAZORPAY_WEBHOOK_SECRET`, and pay with a test card end to end. The keys that were in the original local `.env` were rejected by Razorpay (401), so a real checkout has never been run.

**See it:** `test/p0-pricing-extra.test.mjs`, `test/p0-payments.test.mjs`, P0-7…P0-10 in `p0-security`.

## 4. Providers, KYC and admin operations (WP-2, WP-5, WP-8, WP-9, ADR 0005, 0006, 0011)

**What was wrong.**
- `PUT /providers/me` passed the whole request body to the database: a *rejected* provider could send `{"approvalStatus":"approved","rating":5}`. `GET /providers` (public) returned every provider's ID proof, selfie, phone and email. `PATCH /bookings/:id/status` let **any** provider change **any** booking, and "completed" marked it paid.
- Booking status could jump anywhere (cancelled → completed); customers could cancel jobs in progress; there was no audit trail; paid cancellations had no refund marker.
- Admin tools: rejecting a provider didn't remove their role; "role → provider" invented an *approved* profile (city "Patna", first category, no KYC); user delete left orphaned providers and bookings; `/admin/users` showed only the newest 100; the admin "change status" button called an endpoint that didn't exist; assigning a booking accepted rejected providers.
- KYC upload accepted any string as a "document URL" and swallowed upload failures.

**What changed.**
- Allow-listed provider self-edit; explicit public projection; `Provider.documents.*` are `select: false` (only the admin list opts in).
- `services/bookingStatus.js` is the single transition map + `statusHistory` + cash-collected rule (ADR 0005). Provider and admin routes use it; the provider dashboard shows only legal actions and a *Cash collected* button.
- Admin: rejection revokes the role; promotion creates a **pending** application; soft delete (anonymise, ADR 0011); last-admin guards; paginated, searchable user list; assignment needs an approved, active provider and a `pending|confirmed` booking; services keep `cities`/`perKmRate`.
- KYC accepts image uploads only and fails the application if the upload fails.
- `User.phone`/`firebaseUid` are unique (partial) and phones are normalised to E.164 (`services/phone.js`).

**Before deploying:** run `node scripts/migrations/001-user-unique-indexes.mjs` (dry run first; it stops and prints duplicates if there are any — it never merges accounts).

**See it:** `p0-provider-extra`, `p1-lifecycle-extra`, `p1-business-rules`.

## 5. Hardening (WP-7)

- `helmet`, `trust proxy`, per-route rate limits (`middleware/rateLimits.js`), 100 KB JSON limit (10 MB only where images are uploaded), correct 4xx for malformed/oversized bodies.
- **Emails**: every user-controlled value goes through `escapeHtml`; SMTP TLS verification is back on; in production a missing mail provider is a logged failure, not a fake success. The admin broadcast only reaches registered users, sends in awaited batches, and never returns the user list. The contact form is validated, escaped, rate limited and no longer echoes the stored document.
- **AI chat**: the prompt is server-side; the client can only send user/assistant text.
- Dependencies: `npm audit` is clean on the backend; the frontend has one remaining advisory (a gRPC package pulled in by Firebase that isn't reachable from a browser; npm's suggested "fix" is downgrading Firebase to v9, so we left it).
- `vercel.json` adds HSTS, Referrer-Policy, Permissions-Policy and a minimal CSP. A full script-src CSP is still to do (start it in report-only mode).

## 6. Seed scripts and data safety (WP-6, ADR 0007)

`npm run seed:dev` is the only seed command. It refuses `NODE_ENV=production` and any database not on the allow-list, only rebuilds the catalog, never touches bookings/users/providers, and now runs the whole dev seed (base data → AC migration → pandit service) idempotently. Default banners/coupons are created by the dev seed, not at server boot. Two scripts that contained personal data or a known password were deleted. The pandit seed no longer rewrites every service's provider location.

## 7. Catalog correctness and the mock data removal (WP-10, ADR 0009)

The site used to render hardcoded prices/ratings first and keep them whenever the API was slow or empty. `src/data/mock*.js` is deleted. `hooks/useCatalog.js` loads categories/services once (de-duplicated) and exposes `error` + `retry`. Public service lookups only return approved, available services; user input is escaped before it becomes a regex; `limit` is clamped. The AC and Salon pages list only services that exist in the database; unrated services show "New"; the invented 1.25× "original price" is gone; appliance modal tiles search the live catalog instead of linking to slugs that may not exist.

## 8. Frontend behaviour fixes (WP-11)

Error boundary with automatic one-time reload on stale chunks after a deploy; a 401 only logs you out when a token was actually sent (a wrong password stays a normal error); admin sessions go back to `/admin`; null-safe provider dashboard; banners open a category modal only on **exact** known links/ids (they used to match substrings like "ac" or "car"); banner `link`/`image` must be a site path or `https://` (validated in the model, rejected with 400); the featured-services grid no longer overwrites the city-filtered list.

## 9. Operations (WP-12, ADR 0008, 0010)

- `config/validateEnv.js` exits in production on missing/unsafe config (weak `JWT_SECRET`, no webhook secret, etc.). `/api/health` returns 503 when the database is down. Local default port is 5050 (macOS uses 5000).
- CI (`.github/workflows/ci.yml`): backend tests + `npm audit`, frontend build.
- `scripts/generate_sitemap.js` works again and lists only approved services and active categories (run it before releases; it writes `quicksathi_frontend/public/sitemap.xml`). The 404 page is `noindex`.
- Admin revenue counts only money received (paid, not cancelled) and buckets by IST.
- Geocoding goes through `/api/geo/*` (cache, throttle, rounded coordinates); the browser no longer prompts for location on page load.

## 10. Deploy checklist

1. Atlas: backups on; a separate **dev** database for developers.
2. Render env: `JWT_SECRET` (new, ≥ 32 random chars — this logs everyone out), Firebase trio, Razorpay key/secret/**webhook secret**, `CLIENT_URL`, mail provider, Cloudinary. The server will not start without the required ones.
3. Run the unique-index migration (dry run → apply).
4. Give each existing admin a way in: sign in with Google once (then they keep the role), or keep using their own password. The shared `ADMIN_PASSWORD` no longer works.
5. Razorpay: create the webhook, then run one real test-mode payment (success, failure, closed window, webhook delivered).
6. Reconcile any old bookings marked `paid` without a `razorpayPaymentId`.
7. Run `scripts/generate_sitemap.js` against production data and commit the result.

## 11. How to change things safely from here

- **Touching price, coupon or payment code?** Change `services/pricing.js` / `routes/payments.js` and add a test in `test/` that goes through the HTTP API. Never add an `amount` field the client controls.
- **New endpoint?** Decide who may call it (`protect`, `adminOnly`, `providerOnly`, ownership check) *before* writing the handler; allow-list the fields you accept; validate ObjectIds and enums; return 4xx for bad input.
- **New booking status or transition?** Edit the map in `services/bookingStatus.js` and the tests, not individual routes.
- **Changing a schema or index?** Write a dry-run migration in `scripts/migrations/`.
- **New environment variable?** Add it to `.env.example`, `render.yaml`, `config/validateEnv.js` (if required) and the table in ARCHITECTURE.md.
- **Anything user-supplied that ends up in HTML (emails, admin broadcasts)?** Use `escapeHtml`.

## 12. What is still open (in priority order)

1. Real Razorpay test-mode run, then automated refunds.
2. Private KYC files with signed URLs for admins (ADR 0006).
3. Password change/reset for email accounts; session handling (JWT in `localStorage`).
4. Integer-paise money, central error handler, remove the remaining per-route `error.message` 500s.
5. Server-side rental route/distance.
6. Prerendering for SEO; a full CSP.
7. Quality: ~120 pre-existing lint errors, giant components (`Services.jsx`, `Hero.jsx`, `Layout.jsx`, `ProviderOnboarding.jsx`), eight near-identical category modals, 52 MB of unused images in `public/images/ac/`, accessibility (labels, focus management, reduced motion).
