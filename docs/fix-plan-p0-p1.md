# TiptoBook — P0/P1 Fix Plan (handoff)

**Audience:** any engineer or coding model picking this up cold.
**Source of findings:** [`docs/code-review-2026-10-04.md`](./code-review-2026-10-04.md). IDs (`P0-1`, `P1-9`, …) refer to that doc.
**Acceptance suite:** `quicksathi_backend/test/` (run with `npm test` in `quicksathi_backend/`).

The suite encodes the *intended* behaviour, so it starts red. At commit time: **37 tests, 36 failing, 1 passing (falsely, see [Known test caveats](#known-test-caveats))**. A work package is done when its listed tests pass, nothing else regresses, and its manual checks are reported.

---

## 0. Rules of engagement (read first)

1. **Never point anything at the live database.** The local `quicksathi_backend/.env` currently uses the production Atlas cluster. Tests are hermetic: `test/helpers/stack.mjs` boots `server.js` against an in-memory MongoDB with `DOTENV_CONFIG_PATH=/dev/null`, so the real `.env` is never loaded. For manual runs, use a separate dev DB (WP-0) or the in-memory pattern from the harness.
2. **One work package per local branch**, in the order below. WP-1 through WP-4 are launch blockers. **Commit locally only. Never `git push`, never open PRs, never touch remotes.** The owner reviews and pushes. In reports, reference the local branch name and commit SHA instead of a PR link.
3. **Use the red→green loop** (skill: `tdd`). Run the WP's tests first and confirm they fail for the stated reason, then fix, re-run, and run the whole suite (`npm test`).
4. **Don't weaken a test to make it pass.** If a test's assumption conflicts with a better design, change it in the same PR and explain why in the report. New behaviour gets a new test in the same style (behaviour through the HTTP API, no mocks of internal modules).
5. **Frontend changes** must be checked in a real browser (skill: `playwright-cli`, or a manual click-through). Run `npm run lint` and `npm run build` in `quicksathi_frontend/`; don't add lint errors.
6. **Keep the docs current:** tick the matching checkbox in `docs/code-review-2026-10-04.md` and add an entry to [§4 Progress log](#4-progress-log).
7. **Ask before deciding** anything listed under "Owner decisions". Each one has a conservative default you may use if the owner is unavailable; record that you used it.

### Running things
```bash
# Backend acceptance suite (hermetic; downloads a MongoDB binary on first run)
cd quicksathi_backend && npm test
# One file / one test
node --test --test-reporter=spec test/p0-security.test.mjs
node --test --test-name-pattern="P0-8" test/p0-security.test.mjs

# Local dev (after WP-0 provides a dev DB). macOS AirPlay occupies :5000, so use 5050.
cd quicksathi_backend && PORT=5050 MONGODB_URI=<dev-db-uri> npm run dev
cd quicksathi_frontend && VITE_API_URL=http://localhost:5050/api npm run dev
```
The frontend runs without a `.env`: the API URL defaults to `localhost:5000/api` and Firebase is skipped (Google/phone login show "Firebase is not configured"; email/password login works). For Google/phone login, add the `VITE_FIREBASE_*` web config from the Firebase console.

### Skills to load
| Skill | When |
|---|---|
| `tdd` | Every backend WP (red→green with the acceptance suite) |
| `diagnose` | When a test fails for an unexpected reason |
| `playwright-cli` | Browser verification of payment, booking, admin and provider flows |
| `react-doctor` | After each frontend WP (`npx react-doctor@latest --verbose --diff`; the score must not drop) |
| `vercel-react-best-practices` | WP-10/WP-11 frontend refactors (data fetching, bundle) |
| `accessibility` | Only if a WP touches modals/forms (a11y work is P2) |
| `grill-with-docs`, `improve-codebase-architecture` | WP-13 (ADRs, ARCHITECTURE.md, glossary) |

---

## 1. Work packages (in order)

Each WP lists the findings it covers, the files to touch, a checklist, acceptance criteria, and owner decisions.

### WP-0 — Safety first (owner + engineer, same day, no code)
**Covers:** P0-0, "Immediate mitigation" of P0-7.
- [ ] Create a **separate dev/staging MongoDB** and point every local `.env` at it. Production credentials live only in Render.
- [ ] **Rotate `JWT_SECRET`** in Render to 64 random bytes (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`). The local value is a human-readable phrase, which is guessable offline from any captured JWT. Rotating logs everyone out, including any forged admin sessions.
- [ ] Rotate `ADMIN_PASSWORD` (it is removed entirely in WP-1).
- [ ] **Hotfix:** hide the "Pay online" option in `quicksathi_frontend/src/pages/PaymentPage.jsx` (default `paymentMethod` to `"cod"` and don't render the Razorpay choice) until WP-4 ships.
- [ ] Reconcile the 3 existing bookings marked `paid` with no `razorpayPaymentId` (found in the read-only check on 2026-10-05). Contact the customers or mark them `pending`.
- [ ] Enable Atlas backups/PITR on the production cluster.
- [ ] Check the Render boot log for `Firebase Admin SDK initialized`.

**Report:** confirm each item, without pasting secrets.

---

### WP-1 — Identity: no login without proof (P0-1, P0-2, P0-3)
**Tests:** `P0-1`, `P0-2a`, `P0-2b`, `P0-3` in `test/p0-security.test.mjs`.
**Files:** `quicksathi_backend/routes/auth.js`, `config/firebase.js`, `server.js`, `seed/seedData.js:1613-1622`, `quicksathi_frontend/src/context/AuthContext.jsx` (`:124-130`, `:180-183`, `:229-235`, `:280-286`), `pages/Login.jsx:136-158`.

- [ ] Add one helper, e.g. `verifyFirebaseIdentity(idToken)`, that returns `{ uid, email, emailVerified, phone, name, picture }` from `firebaseAuth.verifyIdToken(idToken)`. If `idToken` is missing return **400**; if `firebaseAuth` is null return **503**; if verification fails return **401**.
- [ ] `/google`, `/provider-google`, `/admin-google`: use **only** the helper's output. Ignore body `email`/`firebaseUid`/`name`/`avatar` for identity. Require `emailVerified === true`.
- [ ] `/phone`: require `phone` from the token (`decoded.phone_number`) and ignore the body. Look users up by `firebaseUid` first, then phone.
- [ ] **Admin role is never derived from email matching.** Remove `isAdminEmail` auto-promotion from `/register`, `/login`, `/google`, `/admin-login` and the seed. Admins are created by an explicit script, `scripts/grant-admin.mjs <email>`, that requires an existing user with a verified email and prints an audit line. `/admin-google` only allows users whose DB `role` is already `admin`.
- [ ] Remove the shared `ADMIN_PASSWORD` path from `/admin-login`. Admins log in with their own bcrypt password or Google.
- [ ] `/auth/profile`: stop allowing `email` and `phone` changes; return 400 with "verify via OTP/email link" (verification flows are P2).
- [ ] In production, fail at boot if Firebase can't initialise (`config/firebase.js`): log and `process.exit(1)` when `NODE_ENV === "production"`.
- [ ] Frontend: send only `{ idToken }` (name/avatar optional for display). Delete the 404 fallbacks in `AuthContext.jsx:250-310`. In `Login.jsx`, stop setting email in the "complete profile" step (or route it through verification).
- [ ] Add tests: `/google` with a token whose email isn't verified → 401 (stub `firebaseAuth` via a test-only seam *or* skip with a documented manual check in the Firebase emulator). `/admin-google` for a non-admin verified user → 403.

**Acceptance:** the 4 tests are green; Google login works in a browser against a dev Firebase project (manual); `scripts/grant-admin.mjs` promotes a verified user.
**Owner decision:** who the admins are, and whether to add 2FA (default: Google-only admin login, no 2FA yet).

---

### WP-2 — Provider authorization & KYC privacy (P0-4, P0-5, P0-6)
**Tests:** `P0-4`, `P0-5`, `P0-6`.
**Files:** `routes/bookings.js:280-338`, `routes/providers.js:165-188,358-372`, `models/Provider.js`.

- [ ] `PATCH /api/bookings/:id/status`: admin only (`adminOnly`). Providers already have the ownership-scoped `PATCH /api/providers/bookings/:id/status`.
- [ ] `PUT /api/providers/me`: allowlist `businessName, description, logo, location, phone, email, servicesOffered, experience, isActive`. Silently drop everything else (or 400 on unknown keys). Toggling `isActive` requires `approvalStatus === "approved"`.
- [ ] `GET /api/providers`: explicit public projection `businessName businessType description logo categoryName servicesOffered experience location.city rating totalBookings`.
- [ ] `models/Provider.js`: `documents: { select: false }` so KYC never leaks through other queries. Admin endpoints that show KYC use `.select("+documents")`.
- [ ] Follow-up inside this WP: upload KYC to Cloudinary with `type: "authenticated"` and serve it to admins via short-lived signed URLs from a new admin endpoint. Write a one-off migration to re-upload existing KYC files as private and delete the public copies.

**Acceptance:** 3 tests green. In the admin providers page, KYC images still open for admins (manual).
**Owner decision:** KYC retention period (default: keep until rejection or offboarding + 90 days).

---

### WP-3 — Server-authoritative pricing & coupons (P0-8, P0-9, P1-9, P1-10, P1-11)
**Tests:** `P0-8`, `P0-9`, `P1-9a`, `P1-9b`, `P1-9c`, `P1-10`, `P1-11`.
**Files:** `routes/bookings.js:47-171`, `routes/coupons.js`, `models/Coupon.js`, `models/Booking.js`; frontend `pages/ServiceDetail.jsx:128-134`, `components/serviceDetail/BookingCard.jsx:40-86`, `pages/BookingPage.jsx`, `pages/PaymentPage.jsx`.

- [ ] New module `services/pricing.js` exposing `quote({ service, packageIndex, couponCode, userId })` → `{ originalAmount, discountAmount, amount, coupon }`. The price comes from `service.packages[packageIndex].price` (fall back to `startingPrice` only when the service has no packages). Client `amount` is **ignored**.
- [ ] One `applyCoupon()` used by both `/coupons/validate` and booking creation: `isActive`, `validFrom <= now <= validUntil`, `usageLimit`, `minOrderAmount` on the *catalog* price, per-user one-time use.
- [ ] Atomic redemption: `Coupon.findOneAndUpdate({ _id, "usedBy.user": { $ne: uid }, $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] }, { $inc: { usedCount: 1 }, $push: { usedBy: … } })`. If it returns null, respond **400** and create no booking. (Later: a separate `CouponRedemption` collection with a unique `{coupon,user}` index, P2.)
- [ ] An invalid, expired or exhausted coupon at booking time → **400**, not silently dropped.
- [ ] `/coupons/validate` takes `serviceId` + `packageIndex` instead of `orderAmount`, and returns the same `quote`.
- [ ] Coupon schema validators: percentage `discountValue <= 100`, `maxDiscountAmount >= 0`, `usageLimit >= 1 | null`, `validUntil > validFrom`. Map `ValidationError` → 400. Expiry is stored as end of day in `Asia/Kolkata` (frontend `AdminCoupons.jsx:143,675`).
- [ ] Booking validation: `scheduledDate` (+ slot) must be in the future in `Asia/Kolkata`. Frontend `BookingPage.jsx:308`: compute `min` from the local date (`new Date().toLocaleDateString("en-CA")`).
- [ ] Frontend: remove `price`/`perKmRate` from URLs. Pass `serviceId` + `packageIndex` (+ rental route inputs) only, and display the server `quote`. `PaymentPage` shows the amount returned by the server.
- [ ] Rentals (`perKmRate`): compute the price server-side from the stored service rate and distance computed server-side.

**Acceptance:** 7 tests green. Manually: editing `?price=` in the URL changes nothing; a 20% coupon on ₹1000 shows ₹800 everywhere (UI, DB, admin).
**Owner decision:** rental pricing source (default: `Service.perKmRate`, distance from the server-side geocoder in WP-12).

---

### WP-4 — Real Razorpay payments (P0-7, P0-10)
**Tests:** `P0-7`, `P0-10a`, `P0-10b`, plus new webhook tests you add.
**Files:** `routes/payments.js`, `routes/bookings.js:138-139`, `models/Booking.js`, `server.js` (raw body for the webhook route), frontend `pages/PaymentPage.jsx`, `index.html` (or dynamic script load).
**Reference:** [Razorpay Standard Checkout](https://razorpay.com/docs/developer-tools/integrations/standard-checkout), [Webhook best practices](https://razorpay.com/docs/webhooks/best-practices). The sequence diagram is in the review doc under P0-7.

- [ ] Booking creation always stores `paymentStatus: "pending"`. Status is `pending` (cash) or `awaiting_payment` (online; add it to the enum).
- [ ] `POST /payments/create-order {bookingId}`: owner check; amount = `booking.amount * 100` (integer paise); store `razorpayOrderId`; idempotent (reuse the existing order if unpaid).
- [ ] `POST /payments/verify`: owner check; `razorpay_order_id === booking.razorpayOrderId`; HMAC compared with `crypto.timingSafeEqual`; idempotent (already paid → 200 no-op); set `paid` + `confirmed`.
- [ ] `POST /payments/webhook` (no auth, raw body): validate `X-Razorpay-Signature` with the webhook secret (new env `RAZORPAY_WEBHOOK_SECRET`); handle `payment.captured` / `payment.failed`; dedupe on `x-razorpay-event-id`. The webhook is the source of truth.
- [ ] `razorpayOrderId` / `razorpayPaymentId`: `unique: true, sparse: true`.
- [ ] `POST /payments/cod-confirm`: only from `pending`.
- [ ] Frontend: load `https://checkout.razorpay.com/v1/checkout.js`; open with `order_id`; `handler` → `/payments/verify` → success screen showing the server `bookingId` and `amount`; handle `modal.ondismiss` and `payment.failed` (booking stays `awaiting_payment` and can be retried from My Bookings). Then remove the WP-0 hotfix.
- [ ] Add a CSP allowance for Razorpay when WP-7 adds the CSP.

**Acceptance:** 3 tests + new webhook tests green. A manual end-to-end in **Razorpay test mode** with test cards: success, failure, dismiss, and webhook delivered (use the Razorpay dashboard "send test webhook" or the CLI). Report the screenshots and booking documents.
**Owner decision:** whether online payment is mandatory for some categories (default: both methods everywhere).

---

### WP-5 — Booking lifecycle (P1-7, P1-8, P1-16)
**Tests:** `P1-7a`, `P1-7b`, `P1-16`.
**Files:** new `services/bookingStatus.js`; `routes/bookings.js:219-277`, `routes/providers.js:316-355`, `routes/admin.js` (new route), `models/Booking.js`, frontend `admin/pages/AdminBookings.jsx:53`, `pages/MyBookings.jsx`.

- [ ] One transition map used by every route: `pending→confirmed|cancelled`, `awaiting_payment→confirmed|cancelled`, `confirmed→in_progress|cancelled`, `in_progress→completed`. Customer cancel only from `pending|awaiting_payment|confirmed`.
- [ ] `statusHistory[]` on Booking with `{ from, to, by, role, at }`.
- [ ] Remove "completed ⇒ paid". Add an explicit provider/admin action `POST …/cash-collected` for COD.
- [ ] Add `PATCH /api/admin/bookings/:id/status` (admin, same transition map) to match `AdminBookings.jsx:53`.
- [ ] Cancellation of a paid booking: set `paymentStatus: "refund_pending"` and notify the admin. Calling the Razorpay refund API is optional in this WP; if implemented, use refund + webhook.
- [ ] Frontend: show the cancellation/refund policy in the confirm dialog and send `reason`.

**Acceptance:** 3 tests green. Manual: change status from the admin panel; the provider dashboard shows only valid next states.
**Owner decision:** cancellation window and fee (default: free until 2 h before the slot, then not cancellable online).

---

### WP-6 — Seed & data safety (P0-11, P1-22, P1-23d/e, broken seed)
**Tests:** `P0-11`, `P1-23d/e`.
**Files:** `seed/*.js`, `scripts/*.js`, `routes/banners.js:330-359`, `routes/coupons.js:40-51`, `package.json`.

- [ ] Guard every seed/script: refuse when `NODE_ENV === "production"` or the DB name is not in an allowlist (`quicksathi_dev`, `quicksathi_test`, `qs_test`). Exit 1 with a clear message.
- [ ] The catalog seed never touches `bookings`, `users` or `providers`. Use fixture users `*@example.test` instead of the "first real user". Rename the script to `npm run seed:dev`.
- [ ] Fix the seed on an empty DB: the services reference category `"CCTV Security"`, which the seed no longer creates. Fold `migrateACAppliances.js` and `seedPanditService.js` into one idempotent dev seed, or adopt `migrate-mongo`.
- [ ] Delete `seed/testPromotion.js` (contains a real person's email) and `seed/manageProviders.js` (creates `password123`, rewrites `.env`). Make `seed/checkRoles.js` print counts only. Remove the `MOCK_PROVIDER_*` keys from local `.env`s.
- [ ] Move default banner/coupon creation out of route modules into the dev seed. Nothing writes to the DB at import time.
- [ ] Fix `scripts/generate_sitemap.js` (missing `path`/`fileURLToPath` imports; exits 0 on error) and use DB categories (see WP-12).

**Acceptance:** 2 tests green; `npm run seed:dev` against a fresh in-memory DB succeeds and leaves a browsable catalog (manual: run the stack and click through).
**Owner decision:** whether to purge the personal email from git history (default: no history rewrite; just delete the file).

---

### WP-7 — Platform hardening (P1-1, P1-2, P1-3, P1-4, P1-5, P1-6)
**Tests:** `P1-1a`, `P1-1b`, `P1-1c`, `P1-2`, `P1-6`.
**Files:** `server.js`, `routes/ai.js`, `routes/contact.js`, `routes/admin.js:670-779`, `services/emailService.js`, `quicksathi_frontend/src/components/chatbot/ChatBot.jsx`, `quicksathi_frontend/vercel.json`, both `package.json`s.

- [ ] `helmet()`, `app.disable("x-powered-by")`, `app.set("trust proxy", 1)`.
- [ ] `express-rate-limit`: auth 5/min/IP (with 429), contact 5/h, AI 20/h, `coupons/validate` 10/min.
- [ ] `express.json({ limit: "100kb" })` globally. Uploads move to multipart (multer) or Cloudinary signed direct upload with a type/size allowlist (≤ 5 MB images; PDFs via `resource_type: "auto"`).
- [ ] AI: build the system prompt server-side (from live catalog data, cached). Accept `{ message, history }`, roles limited to `user|assistant`, length-capped. Ignore client `systemPrompt`. Remove it from `ChatBot.jsx`.
- [ ] Email: an `escapeHtml()` helper around every interpolated value in `emailService.js`, `contact.js` and the admin broadcast. Remove `tls: { rejectUnauthorized: false }`. Mock mode only when `NODE_ENV !== "production"`; otherwise return `success:false` and log an error.
- [ ] Admin broadcast: return counts only; awaited, throttled sends with per-recipient results; `individual` mode limited to registered users; add an unsubscribe footer.
- [ ] `npm audit fix` in both apps (react-router-dom ≥ 7.18, vite ≥ 8.0.16, firebase-admin latest); then smoke-test login and booking.
- [ ] Frontend headers in `vercel.json`: HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(self), camera=(self)` (onboarding uses the camera), and a CSP in **Report-Only** first (self, Google Fonts, Firebase/Google auth, Razorpay, API origin).

**Acceptance:** 5 tests green, `npm audit --omit=dev` shows no high vulnerabilities, chatbot still answers (manual), CSP report-only shows no violations on the main flows.

---

### WP-8 — Admin & provider lifecycle (P1-17 to P1-21, P1-23c)
**Tests:** `P1-17`, `P1-18a`, `P1-18b`, `P1-19`, `P1-20`, `P1-21`, `P1-23c`.
**Files:** `routes/admin.js` (`:141-236`, `:475-494`, `:524-580`, `:587-667`), `routes/providers.js:22-127`, frontend `admin/pages/AdminUsers.jsx`, `AdminBookings.jsx`, `AdminServices.jsx`, `pages/ProviderOnboarding.jsx`.

- [ ] Pagination + server search for `/admin/users`, `/admin/bookings`, `/admin/services`, providers and contacts: `?page&limit&search` → `{ items, total, page, totalPages }`; clamp `limit` to 1–100. Update the admin pages to use `total` and a pager.
- [ ] Reject/demote a provider → `User.role = "user"`, `Provider.isActive = false`, in one transaction. Block self-demotion and removal of the last admin.
- [ ] Role → provider creates a **pending** profile (no fabricated city/category). Rejected profiles stay rejected.
- [ ] User delete becomes a soft delete: `isActive:false`, `deletedAt`, anonymised PII; bookings stay attributable; deactivate the Provider. Block deleting admins.
- [ ] Booking assignment requires an approved, active provider and a booking in `pending|confirmed`; save, then notify.
- [ ] Provider registration: accept only uploaded files (base64 `data:image/*` / `data:application/pdf` or multipart). Reject raw URLs with 400. Fail the request if a required upload fails. Validate type/size in the frontend too.
- [ ] One shared `pickServiceFields()` for admin service POST and PUT (adds `cities`, `perKmRate`; drops `rating`, `totalReviews`, `reviews`, `approvalStatus`). Delete the duplicate write routes in `routes/services.js:161-197` and `routes/categories.js:89-112` after grepping the frontend for callers.
- [ ] Fix `ProviderOnboarding.jsx:313-321`: on retry, skip `register` when already authenticated (or use a single backend endpoint).

**Acceptance:** 7 tests green (fix the P1-21 caveat first). Manual: in the admin panel, page through more than 100 users, reject a provider (they lose dashboard access), promote a user (profile is pending).

---

### WP-9 — Data model integrity (P1-14, P1-15, indexes)
**Tests:** `P1-14`.
**Files:** `models/User.js`, `models/Booking.js`, new `scripts/migrations/`.

- [ ] Normalise phone numbers to E.164 on write (shared util, used by register, profile, provider registration and onboarding).
- [ ] Migration: find duplicate `phone`/`firebaseUid` values and report them to the owner. **Do not auto-merge.** Then add `unique: true, sparse: true` to both fields.
- [ ] Money: store integer paise (`amountPaise`, `originalAmountPaise`, `discountPaise`) with `min: 0` and an integer validator; write a migration from the rupee floats. Alternatively keep rupees but add `min: 0` and `discountAmount <= originalAmount` (owner decision).
- [ ] Add indexes from the review (P2-2) while touching the models: Booking `{user,createdAt}`, `{provider,status,scheduledDate}`; Notification `{recipient,createdAt}`; Service `{approvalStatus,available,category}`.

**Acceptance:** `P1-14` green; migrations run against a dev copy and print a dry-run summary first.
**Owner decision:** paise migration now or later (default: add validators now, paise in P2).

---

### WP-10 — Public catalog correctness (P1-12, P1-13, P1-23a, P1-23b)
**Tests:** `P1-23a`, `P1-23b`.
**Files:** `routes/services.js:24-145`, `routes/categories.js:52-86`; frontend `data/mock*.js`, `pages/{Home,Services,Category,ServiceDetail,ACCategoryPage,HomeSalonCategoryPage}.jsx`, `components/HomeFeaturedServices.jsx`, `components/serviceDetail/BookingCard.jsx:42`, `components/modals/*`.

- [ ] `GET /services/:id` (id or slug): only `approvalStatus:"approved", available:true` for the public; no CDN caching of non-public docs.
- [ ] An `escapeRegex()` helper for every `new RegExp(userInput)`; better, use exact `slug` matches. Clamp `limit`.
- [ ] Remove `src/data/mockServices.js` / `mockCategories.js` from runtime: skeleton → API data → error/empty state ("Not yet available in <city>"). Links use only DB `_id`/slug. No default 5★: show "New".
- [ ] Remove the fabricated strike-through price (`BookingCard.jsx:42`) or render a real `mrp` field.
- [ ] AC/Salon pages and the 8 category modals: drive their content from `/categories/:slug` + `/services?category=`. (The full modal consolidation is P2-15; here, only make sure every link resolves to a real DB service.)

**Acceptance:** 2 tests green. Manual: block the API in devtools → error state, no fake prices; every modal link opens a real service; react-doctor score doesn't drop; bundle size reported (expect a drop once the mocks are gone).
**Owner decision:** is any mock content an intentional demo mode? (Default: no; delete it.)

---

### WP-11 — Frontend correctness (P1-23 frontend items, P1-11 UI)
**Tests:** none automated. Verify in a browser (`playwright-cli`).
**Files:** `main.jsx`/`App.jsx` (error boundary), `pages/ProviderDashboard.jsx:86-89,430-436`, `components/HomeFeaturedServices.jsx:448-474`, `components/CategoryBannersCarousel.jsx:392-420`, `config/api.js:62-67`, `App.jsx:89-101`.

- [ ] Top-level error boundary with a "reload" action that auto-reloads once on `Failed to fetch dynamically imported module`.
- [ ] Provider dashboard: null-safe `approvalStatus`; explicit error/empty state with a link to onboarding.
- [ ] `HomeFeaturedServices`: render from props only (delete its own `/services` fetch, which overwrites the city filter). While there, make sure Home fetches services/categories once (8–9 duplicate calls were measured on a dev load).
- [ ] Banner clicks: add a `banner.action` field (`"link" | "modal:<slug>"`) set in the admin, and remove the `link.includes("ac"|"car"|"help")` heuristics. Backend validates `link` as an internal path or allowlisted host.
- [ ] 401 handling: route `/admin*` to `/admin` login, preserve the redirect target, clear `qs_provider`, and skip the redirect for `/auth/*` calls.
- [ ] Wrap `booking/:serviceId`, `payment`, `profile`, `account` and `provider/onboarding` in `ProtectedRoute`.

**Acceptance:** for each item, a screenshot or short recording plus the steps; `npm run lint` error count not higher than before; react-doctor not lower.

---

### WP-12 — Ops basics (P1-24)
**Files:** `.github/workflows/ci.yml` (new), `server.js`, `config/db.js`, `services/emailService.js`, `context/LocationContext.jsx`, `components/common/LocationBanner.jsx`, `components/layout/Layout.jsx:84`, `scripts/generate_sitemap.js`, `App.jsx:110-114`, `render.yaml`, `.env.example`.

- [ ] CI on every PR: backend `npm ci && npm test && npm audit --omit=dev --audit-level=high`; frontend `npm ci && npm run lint && npm run build`.
- [ ] Env validation at boot: in production, exit if any required var is missing (`MONGODB_URI, JWT_SECRET, FIREBASE_*, RAZORPAY_*, CLIENT_URL`, mail provider). Document `BREVO_*` and `RAZORPAY_WEBHOOK_SECRET` in `.env.example` and `render.yaml`; remove `PORT`/`RENDER_EXTERNAL_URL` from `render.yaml`.
- [ ] `/api/health` returns 503 when `mongoose.connection.readyState !== 1`.
- [ ] Geolocation: no permission prompt on load (only on a "Use my location" click). Geocoding is proxied through the backend with caching and a rate limit, or uses a paid provider. Persist user-chosen locations without the 30-minute TTL.
- [ ] Sitemap: generate from the DB (fixed script) in a prebuild step or serve it dynamically. Add `<meta name="robots" content="noindex">` on the 404 view.
- [ ] Admin dashboard revenue: sum only verified payments; buckets use `timezone: "Asia/Kolkata"`.
- [ ] Change the default local backend port from 5000 to 5050 (macOS AirPlay conflict) in `server.js`, `config/api.js`, both `.env.example` files and the README.

**Acceptance:** CI runs green on the PR (except tests owned by unfinished WPs, which can be marked `todo` in CI until done); health returns 503 with the DB stopped (manual).
**Owner decision:** paid geocoder (default: backend proxy to Nominatim with a 1 req/s queue + cache for now).

---

### WP-13 — Architecture docs, ADRs, developer walkthrough
Do this after WP-1 to WP-6 so the docs describe the fixed system. Skills: `grill-with-docs` (ADR format: `docs/adr/NNNN-slug.md`, a short paragraph, optional status), `improve-codebase-architecture`.

- [ ] `ARCHITECTURE.md` (repo root), the internal readme. Cover: system diagram (Vercel SPA → Render API → Atlas; Firebase Auth; Razorpay; Cloudinary; Groq; Brevo/SMTP); request lifecycle (auth: Firebase ID token → backend JWT; `protect` reloads the user per request); module map (routes / models / services / middleware); booking + payment sequence; roles and permissions matrix; environments (dev/staging/prod DBs) and the env-var matrix; how to run locally, test, seed and deploy; known limitations.
- [ ] `CONTEXT.md` glossary (`grill-with-docs/CONTEXT-FORMAT.md`): Booking, Service, Package, Category, Provider, KYC, Coupon/Redemption, Quote, Admin, statuses. Flag the current ambiguities ("client" vs "user" role naming in `admin.js:600-609`, QuickSathi vs TiptoBook).
- [ ] ADRs (status `accepted` once implemented):
  - 0001 Firebase Auth for identity, backend-issued JWT for API sessions (and why not Firebase tokens end-to-end)
  - 0002 Server-authoritative pricing; client never sends amounts
  - 0003 Razorpay webhook as payment source of truth; `/verify` as a fast path
  - 0004 Admin role granted only by explicit script, never by email matching
  - 0005 Booking state machine in a single module with an audit trail
  - 0006 KYC documents private (Cloudinary authenticated delivery), admin-only signed URLs
  - 0007 Separate dev/staging/prod databases; seeds refuse to run in production
  - 0008 Hosting: Vercel (SPA) + Render (API) + MongoDB Atlas; CSR now, prerender later (record the SEO trade-off)
- [ ] `docs/developer-walkthrough.md`: a narrated tour for onboarding the developer. For each P0/P1 cluster: what was wrong (with the file:line before), why it mattered, what changed (PR link), how the test proves it. End with a "how to add a feature safely" checklist (tests, authz, pricing, migrations).
- [ ] Update the root `README.md`: link to ARCHITECTURE, CONTEXT, ADRs, the review and this plan; fix the env section (port, Brevo, webhook secret).

**Acceptance:** a developer who has never seen the repo can run it, find where to add an endpoint, and explain the payment flow from the docs alone (owner review).

---

## 2. Test ↔ WP map

| Test (file) | WP |
|---|---|
| P0-1, P0-2a, P0-2b, P0-3 (`p0-security`) | WP-1 |
| P0-4, P0-5, P0-6 (`p0-security`) | WP-2 |
| P0-8, P0-9 (`p0-security`); P1-9a/b/c, P1-10, P1-11 (`p1-business-rules`) | WP-3 |
| P0-7, P0-10a, P0-10b (`p0-security`) | WP-4 |
| P1-7a, P1-7b, P1-16 (`p1-business-rules`) | WP-5 |
| P0-11 (`p0-seed-guard`); P1-23d/e (`p1-boot-seeding`) | WP-6 |
| P1-1a/b/c, P1-2 (`p1-hardening`); P1-6 (`p1-business-rules`) | WP-7 |
| P1-17, P1-18a/b, P1-19, P1-20, P1-21, P1-23c (`p1-business-rules`) | WP-8 |
| P1-14 (`p1-business-rules`) | WP-9 |
| P1-23a, P1-23b (`p1-business-rules`) | WP-10 |

### Known test caveats
- **P1-21 passes falsely today.** The register request fails for an unrelated reason, so no provider is stored. Before WP-8, add a precondition: registering with a valid small `data:image/png;base64,…` must return 201 (stub Cloudinary or treat uploads as optional in test env), then assert the URL variant is rejected.
- **P1-23d/e** waits a fixed 4 s after restart because today's seeding runs after the server starts listening. Once WP-6 removes import-time seeding, the waits can be shortened.
- **P1-17** accepts either an array of all users or `{ total }`. Keep `total` in the paginated response shape.
- **P0-1/P0-3** run with Firebase unconfigured, the worst case (`firebaseAuth = null`). Verified-token behaviour needs the Firebase Auth emulator or a manual check (WP-1).
- Tests boot a fresh in-memory MongoDB per file. The first run downloads a mongod binary (~100 MB, cached in `~/.cache/mongodb-binaries`).

---

## 3. Report template (one per WP)

```md
## WP-<n> <title> — <date> — <branch/PR link>
**Status:** done | partial | blocked (reason)
**Tests:** `npm test` → <pass>/<total>. WP tests: <list with ✔/✖>. Newly added: <list>.
**Manual checks:** <steps + result; screenshots/recording paths>
**Changes:** <files touched, one line each>
**Owner decisions used:** <decision → chosen option (default or confirmed)>
**Deviations from plan / test changes:** <what + why>
**Follow-ups found:** <new issues, severity, file:line>
```

---

## 4. Progress log
_Add one row per WP as it lands._

| WP | Date | PR | Tests green | Notes |
|---|---|---|---|---|
| — | 2026-10-05 | — | 1/37 (P1-21 false pass) | Acceptance suite committed; all other tests red as expected |
