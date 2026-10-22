# TiptoBook — MVP Hardening Plan (round 3)

**Audience:** whoever implements this (human or coding model), starting cold.
**Builds on:** [`fix-plan-p0-p1.md`](./fix-plan-p0-p1.md) (WP-1…WP-13, done on `aditya-fixes-and-improvement`, PR #1) and [`architecture-backlog.md`](./architecture-backlog.md) (not in scope here).
**Goal:** a robust MVP that can take real money, without over-engineering. Fix exploitable bugs and money/data-correctness bugs; leave refactors alone.

---

## 0. State at plan time (2026-10-11)

- PR #1 (`aditya-fixes-and-improvement` → `main`): backend suite **108/108 green**; frontend lint 100 errors (CI step is `continue-on-error`). GitHub reports the PR as **CONFLICTING**. No CI run is visible on the PR; the cause is unknown (no permission to read Actions settings).
- Local branch is 1 commit ahead of the PR (`45c2718`, architecture backlog doc).
- `origin/main` moved to `8d63f66`: 5 commits by Nityanand (Oct 5–10) written on the **pre-fix** code: Construction category, admin image uploads, notice marquee, Google Maps/OSM fallback, doorstep OTP + live service timer. **23 files** changed on both sides.

### Owner decisions (recorded)

| # | Question | Decision |
|---|---|---|
| a | Rental pricing | **Cash only; the provider confirms the final fare.** The booking price is an estimate until then. No server-side routing. |
| b | Email/password signup | **Remove public signup** (`POST /auth/register` and the UI). Existing email accounts and admin password login keep working. The Google-linking fix is still applied for existing unverified accounts. _Interpretation of "sure"; confirm before Phase 2._ |
| c | Doorstep OTP + live timer | **Keep**, rebuilt on the booking state machine with the security fixes below. |
| d | Category verticals | **Fixed list**, adding `CONSTRUCTION`. No free-text/custom verticals. |
| e | Sessions (Round 4) | **Server-side sessions** (opaque id in an `httpOnly` cookie, hashed in a `sessions` collection; `Authorization: Bearer <session id>` also accepted for tests and a future mobile app). No JWT, no refresh tokens. |
| f | Hosting layout (Round 4) | **Vendor-independent.** Frontend at `tiptobook.com` on any static host (Netlify / Cloudflare Pages / Hostinger / Vercel), API at `api.tiptobook.com` on any Node/Docker host (Railway planned), staging pair `staging.tiptobook.com` + `api-staging.tiptobook.com`. All host differences live in config/env, never in code. |
| g | Backend packaging (Round 4) | **Add a Dockerfile** (Railway builds it automatically); revisit only if it causes problems. |
| h | Admin passwords (Round 4) | **Middle ground:** admins sign in with Google by default; an admin password is an emergency fallback reset only by `scripts/admin-account.mjs`. The email reset flow is for customers/providers who still have a password. Admin 2FA later if admins rely on passwords. |
| i | Session lifetime (2026-10-12) | Customers/providers: 30 days idle, 90 days absolute. **Admins: 12 hours idle, 7 days absolute.** |
| j | Device list (2026-10-12) | API for the list now; Profile gets only "Log out of all devices". Full "your devices" screen later. |
| k | Session cap (2026-10-12) | At most **20 active sessions** per account, **confirmation-based**: when a sign-in would exceed the cap, the user is first shown the oldest/least-recently-used session (device, last used) and asked to sign it out before the new sign-in completes. |
| l | Host config files (2026-10-12, updated 2026-10-23) | Generate them all from one policy: `wrangler.jsonc` (Cloudflare Workers, the live host), `_headers`, Apache `.htaccess`, `vercel.json`. `netlify.toml` dropped: Netlify isn't used and a copy of it was blamed for breaking the Cloudflare deploy. |
| — | **On hold** (2026-10-12) | (1) **Cut-over from JWT to sessions** (hard switch vs. accepting both for a while): owner to check first. R4.1 waits for this. (2) **Email delivery for password reset** (Brevo + verified sender) isn't set up yet: R4.2 waits. (3) **Playwright now, or together with a TypeScript port and frontend unit tests later:** open. |

Out of scope (agreed): money in paise, automatic Razorpay refunds, enforced full CSP, architecture-backlog refactors, SSR/prerender.

---

## 1. Rules of engagement

1. **Never point anything at the production database.** Tests are hermetic (`test/helpers/stack.mjs`). Manual runs use a dev DB or the in-memory stack.
2. **Local commits only.** Push / merge on GitHub only after the owner says so.
3. **Red → green.** Every bug fix gets a failing test first in the existing style (HTTP through the hermetic stack, no mocks of internal modules). Don't weaken existing tests; if a test conflicts with a decision above, change it and say why in the progress log.
4. **After each phase:** `cd quicksathi_backend && npm test` all green; `cd quicksathi_frontend && npm run lint` error count not higher than before; `npm run build` succeeds; browser smoke of the touched flows on the hermetic stack.
5. **Keep docs current:** tick boxes here, add a row to [§8 Progress log](#8-progress-log), update `CONTEXT.md` / ADRs when a rule changes (listed per item).

---

## Phase 0 — Bring `main` into the branch (blocks everything)

**Why:** PR #1 can't merge, and main's new code re-opens bugs PR #1 fixed (completed ⇒ paid, 50 MB bodies, unguarded status changes) and adds new ones (OTP leak/brute force, booking claiming).

### 0.1 Prep
- [x] Architecture backlog doc (was local `45c2718`) is on the branch as `e0e5512`.
- [ ] Ask Nityanand to pause merges to `main` until Phase 0 lands; share this plan. (owner)
- [x] `git fetch origin` and create safety branches (`backup/pre-main-merge`, `backup/merge-version`).
- [x] Owner chose a **rebase** (2026-10-11): this branch's commits were replayed onto `origin/main` (where both sides changed a file, the branch's version was kept), then one integration commit re-expresses main's features on the hardened code (its tree is exactly the tested merge result), followed by Phases 1–3. History is linear; the PR branch was force-pushed with `--force-with-lease`.

### 0.2 Conflict resolution guide (23 files)

Rule of thumb: **PR #1 wins on security, money and data rules; main wins on new UI and catalog content**, re-expressed on PR #1's architecture.

| File | Resolution |
|---|---|
| `backend/models/Booking.js` | PR #1 base. Add main's fields: `durationMinutes`, `startedAt`, `expectedEndAt`, `completedAt`, `completionNotes` (`maxlength: 1000`). Add `startOtp` with **`select: false`** and `startOtpAttempts: Number`. **Drop** main's pre-save OTP generation (see 0.3). |
| `backend/routes/bookings.js` | PR #1 base (state machine, server pricing, admin-only `/:id/status`). Drop main's provider branch in `/:id/status` (route is admin-only). Drop main's GET-time OTP generation. `durationMinutes` comes from package/service only, never `req.body`. Move `verify-otp-start` / `complete-work` to providers (0.3). |
| `backend/routes/providers.js` | PR #1 base. Generic status route: reject `in_progress`/`completed` with "use Start/Complete" (main's messages). Responses populated, never include `startOtp`. |
| `backend/routes/admin.js` | PR #1 base. From main keep only: Cloudinary-configured check and 60 s timeout in `/upload`. `/upload` accepts **only** `data:image/(png|jpeg|webp);base64,…` ≤ 5 MB (no URLs, no SVG, no `resource_type:"auto"`). `PUT /services/:id`: use an allowlist (see 3.4), not main's "spread body minus 4 keys". |
| `backend/routes/banners.js` | PR #1 base (link/image validators). **Delete** main's duplicate `POST /banners/upload` and its `cloudinary.config` (frontend uses `/admin/upload` via `utils/imageUpload.js`; grep to confirm no caller). Banner `PUT`: allowlist fields. |
| `backend/routes/categories.js` | PR #1 base + main's legacy map entries (`40`, `construction`, `construction-interior` → `CONSTRUCTION`). |
| `backend/models/Category.js` | Decision (d): keep the `enum`, add `CONSTRUCTION`. Keep `required`. |
| `backend/seed/seedData.js` | PR #1's guarded seed + main's new categories (Painting & Waterproofing under House Services, Room-by-Room Painting, Construction & Interior Design + 5 subcategories). **Add real Service docs** for Construction so `/services?q=construction|renovation|interior|ceiling|planning` (ConstructionCategoryModal routes) return results. |
| `backend/server.js` | PR #1: `express.json({limit:"100kb"})` globally, 10 MB only on upload/KYC routes. **Drop** main's global 50 MB JSON + urlencoded. |
| `frontend/src/data/mockServices.js`, `mockCategories.js` | **Stay deleted** (ADR-0009). Main's additions move to the DB seed (row above). |
| `frontend/src/pages/Services.jsx` | Take main's new layout (4×2 grid etc.); re-apply PR #1's data source (`useCatalog`, API only, loading/error/empty states). Highest-effort file; verify in browser. |
| `Category.jsx`, `ACCategoryPage.jsx`, `HomeSalonCategoryPage.jsx`, `ServiceDetail.jsx`, `Hero.jsx`, `App.jsx` | Combine: main's UI additions on PR #1's API-only data. No mock imports anywhere (`grep -r "data/mock" src` must be empty). |
| `MyBookings.jsx` | PR #1 (Pay now, cancel with reason) + main's `LiveServiceTimerCard` (customer view shows OTP). |
| `ProviderDashboard.jsx` | PR #1 (state-machine actions, cash collected) + main's OTP/timer UI calling the new endpoints (0.3). Keep main's "preserve populated user/service on merge" pattern; it also fixes item 3.2. |
| `LocationContext.jsx`, `carRental/LocationSearch.jsx`, `carRental/RouteMap.jsx` | Geocoding/reverse-geocoding through PR #1's backend proxy (ADR-0010); **no direct browser calls to Nominatim/Photon**. Main's Google Maps loader stays optional (map display/autocomplete when `VITE_GOOGLE_MAPS_API_KEY` is set). OSRM route distance in the browser is fine: it is only an estimate now (Phase 1.6). |
| `admin/pages/AdminCategories.jsx` | Main's UI, but the vertical is a **dropdown of the fixed list**; remove the "CUSTOM" option and auto-detect-to-custom logic. |
| `vite.config.js` | Main's `manualChunks` + `import process` (fixes a lint error); PR #1's proxy port 5050. |
| `frontend/.env.example` | Both. Add a comment: restrict `VITE_GOOGLE_MAPS_API_KEY` by HTTP referrer and set a billing cap. |
| `.gitignore` | Main. |

- [x] All 23 files resolved per the table; `grep -rn "<<<<<<<\|>>>>>>>" .` empty.
- [x] `grep -rn "data/mock" quicksathi_frontend/src` empty.
- [x] Backend suite green before starting 0.3 (expect only failures caused by main's OTP code, fixed next).

### 0.3 Doorstep OTP, rebuilt safely

**Problems on main:** OTP returned to providers by `PATCH /providers/bookings/:id/status`; `Math.random()` 4-digit code with no attempt limit (brute-forceable); any provider can claim an unassigned booking via `verify-otp-start`; `complete-work` sets `paymentStatus="paid"`; start/complete bypass the state machine (no `statusHistory`, can start from `pending`); client-controlled `durationMinutes`; OTPs generated during GET requests.

**Design:**
- Generate at booking creation: `String(crypto.randomInt(0, 10000)).padStart(4, "0")`. Stored `select: false`.
- Customer sees it only via `GET /api/bookings` and `GET /api/bookings/:id` **for their own booking**, status `confirmed` (explicit `.select("+startOtp")` in those two handlers only).
- `POST /api/providers/bookings/:id/start` `{ otp }`, `protect, providerOnly`, rate-limited (new `otpLimiter`, e.g. 10/min/IP):
  - provider is `approved && isActive`; `booking.provider` equals this provider (**no claiming** unassigned bookings);
  - booking `status === "confirmed"` (so unpaid online bookings can't start; see 1.2);
  - wrong code → `startOtpAttempts += 1`; on the 5th failure, regenerate the code, reset attempts, notify the customer ("new start code"), respond 429;
  - right code → `changeStatus(booking, "in_progress", {role:"provider"})`, `startedAt = now`, `expectedEndAt = now + durationMinutes`, clear `startOtp`; respond populated, without OTP.
- `POST /api/providers/bookings/:id/complete` `{ notes }`: same ownership checks; `changeStatus(..., "completed")`; `completedAt`; `completionNotes` = string ≤ 1000; **payment untouched** (cash still needs Cash collected).
- Admin keeps `PATCH /api/admin/bookings/:id/status` (state machine, recorded as `role: admin`) as the override when a customer can't share the code.
- One-off script `scripts/migrations/002-booking-start-otp.mjs` (dry run by default, `--apply` to write): backfill codes for `pending|confirmed` bookings without one.
- Update `CONTEXT.md` (Start code, Live timer) and ADR-0005 (start requires the code).

Checklist:
- [x] Model fields + `select:false`; remove pre-save generation; generate in booking create.
- [x] `otpLimiter` in `middleware/rateLimits.js`.
- [x] `start` and `complete` routes in `routes/providers.js`; delete main's `/bookings/:id/verify-otp-start` and `/bookings/:id/complete-work`.
- [x] Customer GET handlers select `+startOtp` for own confirmed bookings only.
- [x] Frontend: `ProviderDashboard.jsx` and `LiveServiceTimerCard.jsx` call the new routes; provider view never renders an OTP.
- [x] Migration script 002 (dry run prints counts).
- [x] Docs: CONTEXT.md, ADR-0005.

Tests (new file `test/p2-doorstep-otp.test.mjs`):
- [x] No provider-facing response (list, status change, cash collected, start, complete) contains `startOtp`.
- [x] Wrong code 5× → 429 and the code changes; the old code no longer works.
- [x] Provider not assigned to the booking → 404/403; unassigned booking can't be claimed.
- [x] Pending (unconfirmed) booking can't be started.
- [x] Start records `statusHistory`; complete leaves COD `paymentStatus: "pending"`.
- [x] `durationMinutes` in the create body is ignored.
- [x] Customer sees their own code; another customer gets 403.

**Acceptance (Phase 0):** PR #1 mergeable (no conflicts against `origin/main`), suite green, lint not worse, build OK. Browser smoke: Home, Services (new grid), Construction modal → real results, service detail → book (COD) → provider accepts → customer sees code → provider starts with code → timer runs → provider completes → cash collected.

---

## Phase 1 — Money correctness

### 1.1 Late payment on a cancelled booking (High)
`routes/payments.js:55-69` (`markPaid`), `:139-145` (`/verify`).
- [x] `markPaid` becomes one conditional update: `findOneAndUpdate({_id, paymentStatus: {$in: ["pending","failed"]}}, …)`. Set `paymentStatus = status === "cancelled" ? "refund_pending" : "paid"`; always store `razorpayPaymentId`; confirm only if `pending`; push a `statusHistory` note.
- [x] `/verify` on a cancelled booking calls the same path (records the payment, flags refund) and returns 409 with the refund message.
- [x] Tests: webhook `payment.captured` after cancel → `refund_pending` + payment id stored; `/verify` after cancel → same; duplicate webhook → no second notification.

### 1.2 Unpaid online bookings can't be confirmed (High)
`services/bookingStatus.js:37-53`, `routes/admin.js` assign (~536-590), `ProviderDashboard.jsx`.
- [x] In `changeStatus`: `pending → confirmed` is rejected when `paymentMethod === "razorpay" && paymentStatus !== "paid"` (payment itself confirms it via `markPaid`).
- [x] Admin assign: assigning a provider no longer flips status for unpaid online bookings.
- [x] Provider dashboard: unpaid online bookings show "Awaiting payment", no Accept button.
- [x] Tests: provider accept and admin assign on an unpaid online booking → status stays `pending`; after payment it is `confirmed`.

### 1.3 Razorpay order race (Medium)
`routes/payments.js:92-103`, webhook `:194-198`.
- [x] After creating the order, save with `findOneAndUpdate({_id, razorpayOrderId: {$exists: false}}, {$set: {razorpayOrderId}})`; if it lost, return the stored order id instead.
- [x] Webhook: if no booking matches `order_id`, fall back to `payload.order.entity.notes.bookingId` (or the payment's `notes`), and only accept it if the amount matches.
- [x] Order race: no automated test (the Razorpay SDK has no host setting to point at a fake server). **Manual check** in Razorpay test mode: on the payment page, click "Pay" twice quickly (or send two `POST /api/payments/create-order` for the same booking at once); both responses must carry the same `orderId`, and the booking's `razorpayOrderId` must equal it.

### 1.4 Release coupon on cancel (Medium)
`routes/bookings.js:163-200`, admin/provider cancel paths, `services/pricing.js:128` (`releaseCoupon`).
- [x] When a booking is cancelled and no money was collected (`paymentStatus` in `pending|failed`), call `releaseCoupon(booking.coupon, booking._id)`. Put this in one helper used by every cancel path.
- [x] Test: apply WELCOME50 → cancel unpaid booking → same customer can use WELCOME50 again; `usedCount` back to previous value. Paid-then-cancelled keeps the redemption.

### 1.5 Payment page fallbacks (Low)
`routes/payments.js:155-172`, `PaymentPage.jsx:124-157`.
- [x] `cod-confirm` accepts `paymentStatus` `pending|failed`, resets to `pending`. (Not for rentals after 1.6: they are COD from the start.)
- [x] PaymentPage: once the booking exists, lock the coupon controls and show `booking.amount`.
- [x] Test: failed payment → switch to COD succeeds.

### 1.6 Rentals: cash only, provider-confirmed fare (decision a)
`services/pricing.js:37-56`, `routes/bookings.js` create, `models/Booking.js`, `routes/providers.js`, `routes/admin.js`, frontend `BookingCard.jsx`, `BookingPage.jsx`, `PaymentPage.jsx`, `ProviderDashboard.jsx`, `admin/pages/AdminBookings.jsx`.
- [x] Booking fields: `fareConfirmed: Boolean` (default `true` for non-rentals, `false` for rentals). `amount` holds the estimate until confirmed.
- [x] Booking create for `serviceMode === "RENTAL"`: force `paymentMethod: "cod"` (400 if `razorpay`); reject coupons (400 "Coupons don't apply to rentals"); estimate must be > 0 (also fix the early return in `basePriceFor` so the shared `price > 0` check runs).
- [x] `create-order` rejects rentals (400).
- [x] `POST /api/providers/bookings/:id/fare` `{ amount }` (assigned, approved, active provider) and `PATCH /api/admin/bookings/:id/fare`: allowed when RENTAL, status `in_progress|completed`, `paymentStatus: "pending"`; integer `1 ≤ amount ≤ MAX_RENTAL_KM × perKmRate`; sets `amount`, `fareConfirmed: true`, `statusHistory` note with old/new; notifies the customer.
- [x] `markCashCollected` requires `fareConfirmed`.
- [x] Frontend: rental price labelled "Estimated fare: the driver confirms the final fare; pay in cash"; no online-pay option or coupon box for rentals; provider dashboard has a "Confirm fare" input; admin bookings shows estimate vs confirmed.
- [x] Docs: CONTEXT.md (Rental service, Estimated fare, Confirmed fare); ADR-0002 note.
- [x] Tests: rental with `paymentMethod: razorpay` → 400; rental with coupon → 400; `distanceKm: 0.01` → 400; cash collected before fare confirmed → 409; provider confirms fare → amount changes and history recorded; another provider → 404.

**Acceptance (Phase 1):** suite green. Browser smoke on hermetic stack: COD booking, rental booking with fare confirmation, coupon release after cancel. Razorpay paths verified by tests here and by Phase 4.1 for real.

---

## Phase 2 — Identity

### 2.1 Remove public email/password signup (decision b)
`routes/auth.js:104-130`, `context/AuthContext.jsx:95-99`, `pages/Login.jsx` (signup toggle, lines ~8, 69-76, 504-604), `pages/ProviderOnboarding.jsx:313-315`, "Sign In / Sign Up" labels (`BookingPage.jsx:301`, `MyBookings.jsx:62`, `Profile.jsx:205`, `Layout.jsx:863`).
- [x] Delete `POST /api/auth/register` and `register()` in AuthContext.
- [x] Login page: Google and phone OTP for customers; the email/password form stays only for existing accounts (labelled "Sign in with email") and for admins/providers who have one.
- [x] Provider onboarding: step 1 is "Sign in with Google or phone"; remove the email/password fields; the form submits only `/providers/register`.
- [x] Labels "Sign In / Sign Up" → "Sign in".
- [x] Update the P0/P1 tests that call `/auth/register` to create users through the existing fixture helpers (record the test change in the log).
- [x] Read-only count of existing `authProvider: "local"` users (owner runs against prod, or from a dev copy) to decide whether they need an email.
- [x] Docs: ADR-0001 (signup only via Firebase), README.

### 2.2 Google linking can't keep an attacker's password (High)
`routes/auth.js:88-94` (`linkGoogleIdentity`).
- [x] If `user.authProvider === "local" && !user.emailVerified`: unset `password`, set `authProvider: "google"` before marking `emailVerified`. Existing verified local accounts are unchanged.
- [x] `scripts/grant-admin.mjs`: refuse users whose `authProvider` is `local` and who were never Google/phone verified (belt and braces).
- [x] Test: local account (unverified) → Google sign-in for the same email (stubbed verifier seam, as in `p0-identity-extra`) → old password login returns 401.

### 2.3 Phone squatting (Medium)
`routes/auth.js:226-255`, `models/User.js:67`.
- [x] With 2.1 no new unverified phones are created. For legacy rows: in `/phone`, if another account holds this phone and is not a phone-verified account, unset its `phone` and then create/link the verified user (log an audit line).
- [x] Test: legacy local user with phone X → phone OTP login for X succeeds; the legacy account no longer has X.

### 2.4 Small auth hardening (Low)
- [x] `localCredentialUser`: same "Invalid email or password" message for non-local accounts (`auth.js:140-142`).
- [x] Password minimum 8 (`User.js:24` and `scripts/admin-account.mjs`).
- [x] Pin JWT algorithm: `jwt.sign(..., {algorithm: "HS256"})` and `jwt.verify(..., {algorithms: ["HS256"]})`.
- [x] Tests: enumeration message; short password rejected by `admin-account.mjs`.

**Acceptance (Phase 2):** suite green; browser smoke: login page shows Google/phone + email sign-in only; provider onboarding requires sign-in first. Real Firebase check in Phase 4.2.

---

## Phase 3 — Providers, admin, small hardening

### 3.1 Role changes (Medium)
`routes/admin.js:472`, `:646-688`.
- [x] Approve: `User.updateOne({_id, role: "user"}, {role: "provider"})` (never touch admins). Also restore `isActive: true` and clear `rejectionReason` on (re-)approval.
- [x] Role change away from `provider`: set the Provider `isActive: false` in the same request.
- [x] Tests: approving an admin's provider profile keeps them admin; demoted provider disappears from `/admin/providers/approved` and can't be assigned.

### 3.2 Provider dashboard keeps customer details (Medium)
`ProviderDashboard.jsx:121-144`, `routes/providers.js` status + cash-collected responses.
- [x] Backend: populate `user` (`name email phone`) and `service` (`name thumbnail`) in those responses (no `startOtp`).
- [x] Frontend: merge keeps existing `user`/`service` if the response lacks them (main's pattern).
- [x] Browser check: accept → start → complete; customer name/phone stay visible.

### 3.3 Private KYC documents (Medium)
`routes/providers.js:60-80` (upload), admin provider detail endpoint, `admin/pages/AdminProviders.jsx`.
- [x] Upload KYC with `type: "authenticated"` into `TiptoBook/kyc/<providerId>`; store `public_id`, not a public URL.
- [x] `GET /api/admin/providers/:id/documents` returns signed URLs valid ~5 minutes (`cloudinary.url(public_id, {type:"authenticated", sign_url:true, expires_at})`).
- [x] Admin page opens documents through that endpoint.
- [x] Script `scripts/migrations/003-private-kyc.mjs` (dry run default): re-upload existing KYC as authenticated, update docs, then delete the public copies.
- [x] Docs: ADR-0006 status → accepted.
- [x] Test: provider/public responses never include document URLs; admin endpoint returns URLs only for admins.

### 3.4 Admin and catalog hardening (Low)
- [x] `Provider.user` `unique: true` (migration step reports duplicates first); duplicate key on register → 400 "profile already exists".
- [x] `GET /categories/:id` filters `active: true` for the public.
- [x] Admin list routes: string-only filters, `limit` clamped 1–100, paginate `/providers`, `/service-requests`, `/notifications`.
- [x] Admin `PUT /services/:id`, `PUT /categories/:id`, `PUT /banners/:id`, `POST /categories`: one `pick*Fields()` allowlist per resource (shared by POST and PUT).
- [x] Admin service approval: 409 unless the owning provider is approved and active.
- [x] Admin stats: exclude soft-deleted users and inactive providers.
- [x] Admin bookings page: "Refund pending" filter (backend `?paymentStatus=refund_pending`).
- [x] Tests for each backend item (one assertion each, behaviour-level).

### 3.5 Edge and ops (Low)
- [x] Geo proxy: cap the Nominatim queue (e.g. 30 waiting or 10 s max wait → 503); stricter per-IP limit on Nominatim routes; `Cache-Control` only on success.
- [x] CORS: pin the Vercel preview regex to the team suffix (`-<team>.vercel.app`).
- [x] Email: escape the fallback status title (`emailService.js:399,412`).
- [x] Render: pin Node 22 (`NODE_VERSION` or `.node-version`); add `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` to `render.yaml`; drop the hard-coded `SMTP_HOST`.
- [x] Log `req.ips` once at boot in production to confirm the `trust proxy` hop count.

**Acceptance (Phase 3):** suite green; browser smoke of admin providers (KYC opens via signed URL), admin bookings refund filter, provider dashboard.

---

## Phase 4 — Needs a person

### 4.1 Razorpay test mode end to end
- [ ] Re-issue test API keys; set `RAZORPAY_KEY_ID/SECRET` in dev.
- [ ] Create the webhook → `https://<api>/api/payments/webhook`, events `payment.captured`, `payment.failed`, `order.paid`; set `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Run: success (card + UPI), failure, dismiss then retry from My Bookings, switch to COD after failure, cancel then pay late (expect `refund_pending`). Record booking documents.

### 4.1b Private KYC
- [ ] Upload one KYC file through provider onboarding with real Cloudinary keys and open it from Admin → Providers → View KYC documents (the signed `private_download_url` link is only checked by shape in tests).

### 4.2 Firebase
- [ ] Google and phone login against the real project (customer, provider onboarding, admin Google).

### 4.3 WP-0 owner items (from the previous plan, still open)
- [ ] Separate dev DB; production credentials only on Render.
- [ ] Rotate `JWT_SECRET` (64 random bytes).
- [ ] Atlas backups/PITR on.
- [ ] Reconcile the 3 bookings marked paid without a payment id.

### 4.4 CI
- [ ] Find out why no CI run shows on PR #1 (Actions disabled for the repo/org, or workflow permissions). Make backend tests + audit and frontend build required checks.
- [ ] Turn the lint step into a gate once errors are 0 (separate task).

---

## Round 4 — Sessions, logout & password reset, vendor-independent hosting, API/E2E tests

**Why:** today's 7-day JWT sits in `localStorage` (readable by any injected script), logout only clears the browser, there is no password reset, a database blip logs users out, and some config is tied to Vercel/Render. Order: **R4.0 → R4.1 → R4.2 → R4.3 → R4.4**; R4.5 is a placeholder.

### R4.0 A database error must not log users out (bug, small) — done in PR #1 (`477c6aa`)
`middleware/auth.js` (`protect`), `quicksathi_frontend/src/config/api.js` (401 handler).
- [x] `protect`: only token/session problems return 401; when the database is disconnected or the lookup fails it returns **503** "Service temporarily unavailable".
- [x] Frontend: a 503 never clears the session (verified: only a 401 with a sent token clears it; pages show the server message).
- [x] Test `p2-db-outage`: MongoDB stopped mid-test, an authenticated call returns 503, not 401 (fails without the fix).

### R4.1 Server-side sessions (decision e)
Files: new `models/Session.js`, new `services/sessions.js`, `middleware/auth.js`, `routes/auth.js` (7 places that call `generateToken`), `server.js`, `test/helpers/stack.mjs`; frontend `config/api.js`, `context/AuthContext.jsx`.

**Design**
- `Session { tokenHash (sha256, unique), user, createdAt, lastUsedAt, expiresAt, absoluteExpiresAt, userAgent, ipPrefix }`. The raw id (32 random bytes, base64url) only lives in the cookie / header; the database holds its hash.
- Lifetime (decision i): customers/providers **sliding 30 days idle, 90 days absolute**; admins **12 hours idle, 7 days absolute** (env `SESSION_IDLE_DAYS`, `SESSION_MAX_DAYS`, `ADMIN_SESSION_IDLE_HOURS`, `ADMIN_SESSION_MAX_DAYS`). `lastUsedAt`/`expiresAt` are updated at most once per hour per session (every 10 minutes for admins). A TTL index on `absoluteExpiresAt` cleans up.
- Session cap (decision k): at most 20 active sessions per account. A sign-in that would be the 21st doesn't create a session; it answers `409 { code: "SESSION_LIMIT", oldest: { id, device, lastUsedAt, createdAt } }`. The frontend asks "Sign out of <device>, last used <date>, to continue?"; on yes it repeats the sign-in with `endSessionId`, the server ends that session and signs in. Firebase sign-ins re-send the same ID token (still valid for an hour); password sign-ins keep the typed credentials in memory only for that retry.
- Cookie `ts_session`: `HttpOnly; Secure; SameSite=Lax; Path=/`; `Domain` from env `COOKIE_DOMAIN` (unset = host-only on `api.tiptobook.com`, which is same-site with `tiptobook.com`, so browsers send it).
- `protect`: read the cookie, else `Authorization: Bearer <id>`; hash it, find the session, then load the user (still per request, as today, so role/deactivation changes apply immediately); reject inactive/deleted users.
- Cross-site request forgery (cookies are sent automatically): state-changing requests must carry a custom header (`X-Requested-With: tiptobook`, set by the axios instance) **and** an `Origin` from the CORS allowlist; the Razorpay webhook and `/api/health` are exempt. `SameSite=Lax` already blocks cross-site form posts.
- Logged-in responses default to `Cache-Control: private, no-store`, so no CDN in front can cache personal data.

**Checklist**
- [ ] `Session` model + `services/sessions.js` (`startSession(res, user, req)`, `endSession`, `endAllSessions(userId, { except })`, `touch`).
- [ ] The 7 logins in `routes/auth.js` call `startSession` and return `{ user }` (no token in the body).
- [ ] `POST /auth/logout` (this device), `POST /auth/logout-all` (every device), `GET /auth/sessions` + `DELETE /auth/sessions/:id` ("your devices").
- [ ] Sessions end automatically on password change/reset, admin role change, deactivation, soft delete (`admin.js`), and in the `grant-admin` / `admin-account` scripts.
- [ ] Remove `jsonwebtoken`, `JWT_SECRET`, `JWT_EXPIRES_IN` from code, env validation, `.env.example` and `render.yaml` (one-time effect: everyone signs in again).
- [ ] Frontend `api.js`: `withCredentials: true`; send `X-Requested-With`; **cache only an allowlist of public GET endpoints** (today it caches any GET without an `Authorization` header, which with cookies would cache personal data); 401 handling based on "was signed in" state, not on the header.
- [ ] Frontend `AuthContext`: no token in `localStorage`; on startup call `GET /auth/me` to learn who is signed in (keep a non-sensitive display copy of the user for first paint); logout calls the API.
- [ ] Test helper: `createUser()` creates a real session row and returns its id; `api()` keeps sending it as a Bearer header, so existing tests don't change.
- [ ] Tests: cookie set on login with `HttpOnly`/`Secure`/`SameSite`; logout ends only this device; logout-all ends all; reset, role change and deactivation end sessions; idle/expired sessions rejected; a stored hash can't be used as a session id; a state-changing request without the custom header or with a foreign `Origin` gets 403; personal responses carry `no-store`.
- [ ] Docs: ADR-0001 rewritten (sessions replace JWT; why no refresh tokens), ARCHITECTURE auth section, CONTEXT ("Session").

### R4.2 Password reset & change (decision h)
Files: new `models/PasswordReset.js`, `routes/auth.js`, `services/emailService.js`; frontend `pages/Login.jsx`, new `pages/ResetPassword.jsx`, `pages/Profile.jsx`.
- [ ] `POST /auth/password/forgot {email}`: always `200` "If that email has a password account, we've sent a link" (no enumeration); only for non-admin accounts that have a password; single-use token (32 random bytes, stored hashed), valid **30 minutes**, a newer request replaces older tokens; rate-limited per IP and per email; link is `${CLIENT_URL}/reset-password?token=…`.
- [ ] `POST /auth/password/reset {token, password}`: token valid, unused and unexpired; password at least 8 characters (same policy as the model); marks the token used; **ends all sessions**; emails "your password was changed".
- [ ] `POST /auth/password/change {current, new}` (signed in): verifies the current password; ends all other sessions.
- [ ] Admin accounts: forgot/reset refused (the response stays the generic 200 and no email is sent). README and walkthrough say admins use Google, and `scripts/admin-account.mjs` for an emergency reset.
- [ ] Frontend: "Forgot password?" on the email sign-in form, a `/reset-password` page, "Change password" in Profile (only when the account has a password).
- [ ] Tests: unknown and admin emails get the same 200 and no email; a token works once; expired tokens are rejected; reset ends sessions; change requires the current password; rate limit.

### R4.3 Vendor-independent hosting (decisions f, g, l)
- [x] **Env-only config**, no host names in code (`config/hosting.js`, unit-tested in `test/p3-hosting.test.mjs`):
  - `CORS_ORIGINS` (comma list) and `CORS_ORIGIN_PATTERNS` (preview-host suffixes, single label only) replace `VERCEL_PREVIEW_SUFFIX` and `ADDITIONAL_ORIGINS`;
  - `TRUST_PROXY` (proxy hops, default 1) replaces the hard-coded `app.set("trust proxy", 1)`;
  - `SELF_PING_URL` (optional; off unless set) replaces `RENDER_EXTERNAL_URL`;
  - `CLIENT_URL` (frontend origin for CORS and email links); `COOKIE_DOMAIN` comes with R4.1;
  - frontend: `VITE_API_URL` only.
- [x] **Dockerfile** in `quicksathi_backend/` (`node:22-slim`, `npm ci --omit=dev`, non-root `node` user, port from `PORT`, `HEALTHCHECK` on `/api/health`) plus `.dockerignore`. CI job "Backend Docker image" builds it and boots it against a MongoDB service until `/api/health` answers. Railway: service root `quicksathi_backend`; it builds the Dockerfile automatically. `render.yaml` updated to the new env names and stays until Render is retired. _Not built locally (Docker daemon not running); verified by CI._
- [x] **Frontend host files** generated by `npm run host-config` from `hosting/policy.json` (SPA fallback; HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy; immutable `/assets`, revalidated `index.html`):
  - Cloudflare Workers (live host): `wrangler.jsonc` with `not_found_handling: "single-page-application"` (checked locally with `wrangler dev`: deep links serve `index.html`, headers from `_headers`, `.htaccess` not published thanks to `public/.assetsignore`). Cloudflare Pages falls back to `index.html` by itself; no shared `_redirects` (it breaks Workers deploys). Netlify: headers via `_headers`, SPA rule would be added in Netlify itself;
  - Hostinger / Apache / LiteSpeed: `public/.htaccess` (checked locally with Apache 2.4: deep links serve `index.html`, assets get the year-long cache, security headers on every response);
  - Vercel: `vercel.json`;
  - CI runs `npm run host-config:check` and fails if any copy drifts.
- [ ] **Domains (owner):** `tiptobook.com` → frontend host; `api.tiptobook.com` → backend host; staging pair `staging.tiptobook.com` / `api-staging.tiptobook.com` with its own database. Host preview URLs (`*.netlify.app`, `*.pages.dev`) use the staging API with the Bearer-header session (cookies don't cross sites there).
- [ ] Razorpay webhook and Firebase authorised domains point at the new hosts; the Google Maps key is restricted to the new frontend domains.
- [x] Docs: ARCHITECTURE §8–9 and the diagram, ADR-0008, README deploy section are host-neutral.
- [ ] After the first deploy on the new hosts: the `trust-proxy check` log line shows the real client IP; the login cookie is sent from `tiptobook.com` in Safari and Chrome; a 5 MB image upload works.

### R4.4 API access matrix + end-to-end tests
- [x] **Route access matrix** (`test/p3-access-matrix.test.mjs`): reads every route from the routers mounted in `server.js` and the guard it actually has (`protect` / `providerOnly` / `adminOnly`), and compares with one table of 103 routes (public / user / provider / admin). It fails when a route has no entry, an entry has no route, or a guard differs (checked by mutating the table). Over HTTP, every guarded route answers 401 anonymously and 403 to the wrong role.
- [ ] **Playwright** (on hold, see decisions: now, or with a TypeScript port later) (`quicksathi_frontend/e2e/`, `@playwright/test`), run in CI against the in-memory backend + `seed:dev` + `vite preview`:
  1. customer books with cash → provider accepts → customer reads the code → provider starts, completes and records cash;
  2. rental: cash-only checkout, provider confirms the fare;
  3. coupon applied, booking cancelled, coupon usable again;
  4. admin assigns a provider and opens KYC links;
  5. sign in, logout, logout-all, password reset (email captured by the test mail mode);
  6. online payment in Razorpay test mode: **manual / nightly only** (needs real test keys), not on every PR.
- [ ] CI: a Playwright job (Chromium only) that uploads traces on failure.
- [ ] `docs/qa-checklist.md`: the manual run sheet before each production deploy (payments, Firebase logins, KYC, emails, mobile view).

### R4.5 Provider availability (placeholder — discuss first)
- [ ] Design session with the owner, starting from the slot design (Deferred section below) and developer checklist §2: working hours, days off, online/offline, duration + buffer, no double booking, updates on cancel/reschedule, alternative slots. Then write it here as checklists.

**Acceptance (Round 4):** R4.0–R4.4 checkboxes done; backend suite, access matrix and Playwright green in CI; the manual checks in R4.3 done on staging; docs updated.

---

## Deferred — Slot-based booking (to discuss, not in this scope)

Target UX (owner screenshot, 2026-10-11): one "Checkout & Booking" page: date → fixed time slot → address (house/street/landmark, pincode) → notes → coupons → pay. Today the customer types any time (`<input type="time">`, `BookingPage.jsx`) and the server stores free text in `scheduledTime`; `assertFutureSlot` (`services/pricing.js`) only rejects past times.

**Slots (IST):** `09-11`, `11-13`, `14-16`, `16-18`, `18-20` (1–2 PM is a break).

**Proposed design:**
- One slot definition in `services/slots.js`; `GET /api/bookings/slots?serviceId&date` returns each slot with `available` and a reason (`passed`, `too_soon`, `full`).
- Booking stores `scheduledDate` (IST date), `slot` (code), `slotStart`/`slotEnd` (instants); `scheduledTime` keeps a display label for emails/dashboards. `POST /bookings` requires a valid slot code; free text is rejected. Old bookings keep their free-text time (no migration).
- Optional capacity: `Service.slotCapacity` (admin-editable), reserved atomically on a `{service, date, slot}` counter (same pattern as coupon redemption) and released by the shared cancel helper.
- Unpaid online bookings auto-cancel after ~15 minutes, releasing the slot and coupon; a late payment becomes `refund_pending` (Phase 1.1).
- Doorstep start allowed only on the slot day from 30 minutes before `slotStart`. Optional cancellation cut-off (e.g. free until 2 h before the slot).
- Frontend: date picker + slot chips from the API (disabled "Full"/"Passed"); time inputs removed; slot label shown in My Bookings, provider dashboard and admin. Merging BookingPage + PaymentPage into one checkout page belongs to the design-system discussion.
- Tests: invalid code, passed/too-soon slot, beyond horizon, concurrent last-place booking (one 201, one 409), cancel frees the place, unpaid expiry frees place + coupon, start refused outside the slot day.

**Open questions:** capacity model (none / per-service limit (recommended) / per-provider calendar), lead time (default 60 min), booking horizon (default 14 days), closed days/holidays (default none), whether rentals use slots as pickup windows (default yes).

---

## Deferred — Automatic partner assignment & acceptance (developer checklist §1; needs a design pass)

Source: owner's developer checklist (2026-10-11), section 1. **On hold** until provider availability (checklist §2, to be discussed together with the slot design above) is settled, because assignment needs to know who is free when.

**Checklist items:** auto-assign bookings to eligible partners; prioritise by availability, distance, ratings and reviews; weigh acceptance rate and cancellation history; auto-reassign if a partner rejects or doesn't respond; prevent duplicate assignments and overlapping bookings; notify customers and partners of status changes.

**Where the code is today:** each service has one provider (`Service.provider`), copied onto the booking at creation; admins reassign by hand (`PATCH /admin/bookings/:id/assign`, atomic, approved+active providers only). Provider ratings exist as a field but there are no real reviews, no acceptance/decline records, no provider coordinates and no background job runner (Render free tier sleeps).

**Starting point discussed (not decided):** offer the job to all eligible partners (approved, online, offering the service, in the city, free in the slot); the first to accept wins through one conditional update (no double assignment); if nobody accepts in N minutes it lands in the admin queue. Ranking comes later, once there is data.

**Questions the design must answer:**
- Eligibility: providers per service (many-to-many), service area (city / pincodes / radius), availability source (slots, working hours, days off, online toggle).
- Offer flow: broadcast vs ranked one-at-a-time; response timeout; how many rounds before admin fallback; what the customer sees while waiting.
- **Late rejection / no-show:** a partner declines or cancels 30 minutes before the slot. Who is offered it, with what shorter timeout; when the customer is told and offered reschedule/cancel; whether a paid booking is refunded automatically if nobody takes it.
- **Reward / penalty system** feeding priority: acceptance rate, late cancellations, no-shows, lateness against the slot, completion rate, customer ratings (needs a real reviews feature). Penalties (lower priority, cool-down, suspension) and rewards (priority, badges, incentives); how scores decay; how disputes are handled.
- Notifications: channels (in-app exists; web push, SMS/WhatsApp via e.g. MSG91 cost money), templates per event, and who is told what (see architecture-backlog #3, one booking-event notifier).
- Infrastructure: something must run timers (offer expiry, reassignment): a paid always-on instance or a scheduled job.
- Tests: two partners accept at once (one wins), decline → re-offer, timeout → admin queue, late cancel → re-offer + customer notified, penalties applied once.

---

## 5. Deploy order (production)

1. Merge PR #1 (after Phases 0–3 and owner review).
2. Render env: `RAZORPAY_WEBHOOK_SECRET`, Firebase vars, new `JWT_SECRET`, Brevo vars (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`), Node 22 (in `render.yaml`), optional `VERCEL_PREVIEW_SUFFIX`.
3. Run migrations, each dry run first, then `--apply`: `001-user-unique-indexes`, `002-booking-start-otp`, `003-private-kyc` (needs Cloudinary env), `004-provider-user-unique`. Then run `005-phone-linked-accounts` (report only): it lists email/Google accounts that an old phone sign-in linked a phone identity into. Review each (a customer's own number, or someone else's?) and detach only the squatted ones with `--unlink=<id>`.
4. Give every admin a Google sign-in or a password via `scripts/admin-account.mjs` (the shared admin password is gone; `grant-admin.mjs` now refuses accounts with a sign-up password).
5. Deploy backend, then frontend. Check `/api/health` and the one-time `trust-proxy check` line in the Render log (`req.ip` must be the client's address). Then a ₹1 live payment and a refund by hand.
6. Tell existing email/password customers nothing changes for them; new customers sign up with Google or phone.
7. **Merging PR #2 (Round 4 hosting)** changes env names, so set the new ones first:
   - `ADDITIONAL_ORIGINS` → `CORS_ORIGINS` (exact origins, comma list). `VERCEL_PREVIEW_SUFFIX` is gone: list Vercel/Netlify previews in `CORS_ORIGINS`, or use `CORS_ORIGIN_PATTERNS` only for Cloudflare suffixes (`.tiptobook.pages.dev`, `.<account>.workers.dev`).
   - Keep-alive no longer reads `RENDER_EXTERNAL_URL`: on Render set `SELF_PING_URL` to the API's URL; on Railway leave it unset.
   - Railway builds `quicksathi_backend/Dockerfile` (Node 22, `NODE_ENV=production`): every variable `config/validateEnv.js` requires and the Firebase trio must be set before the first deploy, or it won't start.
   - Cloudflare Workers Builds: root directory `quicksathi_frontend`, so `wrangler.jsonc` (SPA fallback) is used. Never add a `_redirects` file.

---

## 6. Test inventory to add

| File | Covers |
|---|---|
| `test/p2-doorstep-otp.test.mjs` | 0.3 |
| `test/p2-money.test.mjs` | 1.1–1.6 |
| `test/p2-identity.test.mjs` | 2.1–2.4 (uses the test-only fake Firebase verifier, `TEST_FAKE_FIREBASE=1`) |
| `test/p2-admin-providers.test.mjs`, `test/p0-provider-extra.test.mjs` | 3.1, 3.3, 3.4 |

---

## 7. Effort (rough)

| Phase | Size |
|---|---|
| 0 Merge + OTP rebuild | L (Services.jsx and ProviderDashboard.jsx dominate) |
| 1 Money | M |
| 2 Identity | M (frontend login/onboarding changes) |
| 3 Providers/admin | M (KYC migration is the largest piece) |
| 4 Human checks | owner time |

---

## 8. Progress log

| Phase | Commit | Tests | Notes |
|---|---|---|---|
| plan | `0c095ec` | 108/108 | Plan written; decisions a–d recorded |
| 0 integrate main | `cf375dd`, `759157a` | 116/116 | Rebased onto `origin/main`; OTP rebuilt on the state machine; mock files stay deleted; Construction + CCTV seeded; uploads image-only. Browser: services search, COD booking → accept → code start → complete → cash; customer sees code, provider never does. |
| 1 money | `fac5562` | 125/125 | Late payments → refund_pending; unpaid online can't be confirmed; order race; coupon release; COD after failure; cash-only rentals with confirmed fare. Browser: rental checkout (cash only, estimate), provider confirms fare, coupon box locks after booking. |
| 2 identity | `b0f64eb` | 130/130 | Public sign-up removed (interpretation of decision b); takeover-proof Google linking; phone squatting; generic login errors; HS256. Test changes: tests that registered users now seed them; the legacy-admin test no longer pins the "use Google" wording. Browser: login page, onboarding sign-in gate. |
| 3 providers/admin | `2fd7a29` + docs commits | 141/141 | Role-safe approval, demotion deactivates, private KYC + signed links + migration 003, Provider.user unique + migration 004, bounded admin queries, refund queue, broadcasts skip deleted users, geo queue cap, CORS team suffix. Browser: admin KYC links, refund queue shows a late-paid cancelled booking. |
| review fixes | (2026-10-23) | 150/150 | Second full review of PR #1. Fixed: logins issued before an account takeover or an `admin-account.mjs` reset are rejected (`User.tokensValidAfter`); `admin-account.mjs` marks the email verified so a later Google sign-in keeps the emergency password; sign-in form no longer blocks existing 6–7 character passwords; status changes save only if status/payment are unchanged (a cancel can't hide a payment that just arrived); a packaged service must be booked as one of its packages; an online capture on a booking already paid (e.g. in cash) is flagged once to admins for refund; a late `payment.failed` can't mark a cash booking failed; rental fare cap falls back to 3× the estimate when the per-km rate is 0; bulk email broadcasts send in the background and report to the admin; admin alert feed shows the admin's own notifications; invented prices, ratings and review counts removed from Hero, AC, salon, category and service pages. Review script `005-phone-linked-accounts` for legacy phone squats. |
| minor fixes | `9e1377c` | 163/163 | Review minors. Sign-in: `/auth/me`/`/auth/profile` 401s end the session; phone profile step asks only for a name; onboarding asks to sign in first and keeps the query. Bookings: `changeStatus` owns the job timer and start-code clearing (admin path too); cancel dialog explains refunds and sends a reason; `refund_pending` alerts admins; admin fare confirmation notifies the customer; `estimatedAmount` kept; ₹0 online bookings refused; success screen shows booking id and server amount. Providers: reject/demote/delete takes services offline; approve refuses deleted accounts; role change reopens an existing application; bounded `/providers/approved`; migration 003 reports public copies it couldn't delete. Abuse: rate limits run before bodies, 10 MB bodies only after auth; start code capped at 3 reissues, tries count only on confirmed bookings; geocoding queue max 3 per client + shared in-flight lookups. Data: banner links reject backslashes; catalog seed keeps provider services; pandit seed guarded. Tests: AI prompt checked against a fake Groq server, IST-month test fixed, 413/headers/429, unverified Google email, non-admin Google admin login. Docs: `.env.example` (no `ADMIN_PASSWORD`; all variables the code reads), ARCHITECTURE, walkthrough. Removed unused `QuickServicesSection.jsx`. |

Intermediate commits replayed during the rebase (the WP-1…WP-13 series) were not each re-tested; the final tree is identical to the one tested above.

**Not done / deviations:** "Sign In / Sign Up" labels kept (Google/phone sign-in still creates accounts, so the label is accurate). Admin lists keep returning arrays (capped at 200–500) instead of `{items,total}` pagination, so the admin pages didn't need rewriting. `private_download_url` for authenticated KYC assets is verified only by URL shape in tests; check one real file in Phase 4. Frontend lint: 100 errors (same as before the merge).
