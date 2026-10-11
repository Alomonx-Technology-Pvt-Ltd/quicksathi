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
- [ ] Push `45c2718` to the PR branch (owner OK required) or keep it local; note which.
- [ ] Ask Nityanand to pause merges to `main` until Phase 0 lands; share this plan.
- [ ] `git fetch origin` and create a safety branch: `git branch backup/pre-main-merge`.
- [ ] `git merge origin/main` into `aditya-fixes-and-improvement` (**merge, not rebase**: the branch is pushed and has a PR).

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

- [ ] All 23 files resolved per the table; `grep -rn "<<<<<<<\|>>>>>>>" .` empty.
- [ ] `grep -rn "data/mock" quicksathi_frontend/src` empty.
- [ ] Backend suite green before starting 0.3 (expect only failures caused by main's OTP code, fixed next).

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
- [ ] Model fields + `select:false`; remove pre-save generation; generate in booking create.
- [ ] `otpLimiter` in `middleware/rateLimits.js`.
- [ ] `start` and `complete` routes in `routes/providers.js`; delete main's `/bookings/:id/verify-otp-start` and `/bookings/:id/complete-work`.
- [ ] Customer GET handlers select `+startOtp` for own confirmed bookings only.
- [ ] Frontend: `ProviderDashboard.jsx` and `LiveServiceTimerCard.jsx` call the new routes; provider view never renders an OTP.
- [ ] Migration script 002 (dry run prints counts).
- [ ] Docs: CONTEXT.md, ADR-0005.

Tests (new file `test/p2-doorstep-otp.test.mjs`):
- [ ] No provider-facing response (list, status change, cash collected, start, complete) contains `startOtp`.
- [ ] Wrong code 5× → 429 and the code changes; the old code no longer works.
- [ ] Provider not assigned to the booking → 404/403; unassigned booking can't be claimed.
- [ ] Pending (unconfirmed) booking can't be started.
- [ ] Start records `statusHistory`; complete leaves COD `paymentStatus: "pending"`.
- [ ] `durationMinutes` in the create body is ignored.
- [ ] Customer sees their own code; another customer gets 403.

**Acceptance (Phase 0):** PR #1 mergeable (no conflicts against `origin/main`), suite green, lint not worse, build OK. Browser smoke: Home, Services (new grid), Construction modal → real results, service detail → book (COD) → provider accepts → customer sees code → provider starts with code → timer runs → provider completes → cash collected.

---

## Phase 1 — Money correctness

### 1.1 Late payment on a cancelled booking (High)
`routes/payments.js:55-69` (`markPaid`), `:139-145` (`/verify`).
- [ ] `markPaid` becomes one conditional update: `findOneAndUpdate({_id, paymentStatus: {$in: ["pending","failed"]}}, …)`. Set `paymentStatus = status === "cancelled" ? "refund_pending" : "paid"`; always store `razorpayPaymentId`; confirm only if `pending`; push a `statusHistory` note.
- [ ] `/verify` on a cancelled booking calls the same path (records the payment, flags refund) and returns 409 with the refund message.
- [ ] Tests: webhook `payment.captured` after cancel → `refund_pending` + payment id stored; `/verify` after cancel → same; duplicate webhook → no second notification.

### 1.2 Unpaid online bookings can't be confirmed (High)
`services/bookingStatus.js:37-53`, `routes/admin.js` assign (~536-590), `ProviderDashboard.jsx`.
- [ ] In `changeStatus`: `pending → confirmed` is rejected when `paymentMethod === "razorpay" && paymentStatus !== "paid"` (payment itself confirms it via `markPaid`).
- [ ] Admin assign: assigning a provider no longer flips status for unpaid online bookings.
- [ ] Provider dashboard: unpaid online bookings show "Awaiting payment", no Accept button.
- [ ] Tests: provider accept and admin assign on an unpaid online booking → status stays `pending`; after payment it is `confirmed`.

### 1.3 Razorpay order race (Medium)
`routes/payments.js:92-103`, webhook `:194-198`.
- [ ] After creating the order, save with `findOneAndUpdate({_id, razorpayOrderId: {$exists: false}}, {$set: {razorpayOrderId}})`; if it lost, return the stored order id instead.
- [ ] Webhook: if no booking matches `order_id`, fall back to `payload.order.entity.notes.bookingId` (or the payment's `notes`), and only accept it if the amount matches.
- [ ] Test: two concurrent `create-order` calls return the same `orderId` (stub the Razorpay client through the existing test seam, or document a manual check if no seam exists).

### 1.4 Release coupon on cancel (Medium)
`routes/bookings.js:163-200`, admin/provider cancel paths, `services/pricing.js:128` (`releaseCoupon`).
- [ ] When a booking is cancelled and no money was collected (`paymentStatus` in `pending|failed`), call `releaseCoupon(booking.coupon, booking._id)`. Put this in one helper used by every cancel path.
- [ ] Test: apply WELCOME50 → cancel unpaid booking → same customer can use WELCOME50 again; `usedCount` back to previous value. Paid-then-cancelled keeps the redemption.

### 1.5 Payment page fallbacks (Low)
`routes/payments.js:155-172`, `PaymentPage.jsx:124-157`.
- [ ] `cod-confirm` accepts `paymentStatus` `pending|failed`, resets to `pending`. (Not for rentals after 1.6: they are COD from the start.)
- [ ] PaymentPage: once the booking exists, lock the coupon controls and show `booking.amount`.
- [ ] Test: failed payment → switch to COD succeeds.

### 1.6 Rentals: cash only, provider-confirmed fare (decision a)
`services/pricing.js:37-56`, `routes/bookings.js` create, `models/Booking.js`, `routes/providers.js`, `routes/admin.js`, frontend `BookingCard.jsx`, `BookingPage.jsx`, `PaymentPage.jsx`, `ProviderDashboard.jsx`, `admin/pages/AdminBookings.jsx`.
- [ ] Booking fields: `fareConfirmed: Boolean` (default `true` for non-rentals, `false` for rentals). `amount` holds the estimate until confirmed.
- [ ] Booking create for `serviceMode === "RENTAL"`: force `paymentMethod: "cod"` (400 if `razorpay`); reject coupons (400 "Coupons don't apply to rentals"); estimate must be > 0 (also fix the early return in `basePriceFor` so the shared `price > 0` check runs).
- [ ] `create-order` rejects rentals (400).
- [ ] `POST /api/providers/bookings/:id/fare` `{ amount }` (assigned, approved, active provider) and `PATCH /api/admin/bookings/:id/fare`: allowed when RENTAL, status `in_progress|completed`, `paymentStatus: "pending"`; integer `1 ≤ amount ≤ MAX_RENTAL_KM × perKmRate`; sets `amount`, `fareConfirmed: true`, `statusHistory` note with old/new; notifies the customer.
- [ ] `markCashCollected` requires `fareConfirmed`.
- [ ] Frontend: rental price labelled "Estimated fare: the driver confirms the final fare; pay in cash"; no online-pay option or coupon box for rentals; provider dashboard has a "Confirm fare" input; admin bookings shows estimate vs confirmed.
- [ ] Docs: CONTEXT.md (Rental service, Estimated fare, Confirmed fare); ADR-0002 note.
- [ ] Tests: rental with `paymentMethod: razorpay` → 400; rental with coupon → 400; `distanceKm: 0.01` → 400; cash collected before fare confirmed → 409; provider confirms fare → amount changes and history recorded; another provider → 404.

**Acceptance (Phase 1):** suite green. Browser smoke on hermetic stack: COD booking, rental booking with fare confirmation, coupon release after cancel. Razorpay paths verified by tests here and by Phase 4.1 for real.

---

## Phase 2 — Identity

### 2.1 Remove public email/password signup (decision b)
`routes/auth.js:104-130`, `context/AuthContext.jsx:95-99`, `pages/Login.jsx` (signup toggle, lines ~8, 69-76, 504-604), `pages/ProviderOnboarding.jsx:313-315`, "Sign In / Sign Up" labels (`BookingPage.jsx:301`, `MyBookings.jsx:62`, `Profile.jsx:205`, `Layout.jsx:863`).
- [ ] Delete `POST /api/auth/register` and `register()` in AuthContext.
- [ ] Login page: Google and phone OTP for customers; the email/password form stays only for existing accounts (labelled "Sign in with email") and for admins/providers who have one.
- [ ] Provider onboarding: step 1 is "Sign in with Google or phone"; remove the email/password fields; the form submits only `/providers/register`.
- [ ] Labels "Sign In / Sign Up" → "Sign in".
- [ ] Update the P0/P1 tests that call `/auth/register` to create users through the existing fixture helpers (record the test change in the log).
- [ ] Read-only count of existing `authProvider: "local"` users (owner runs against prod, or from a dev copy) to decide whether they need an email.
- [ ] Docs: ADR-0001 (signup only via Firebase), README.

### 2.2 Google linking can't keep an attacker's password (High)
`routes/auth.js:88-94` (`linkGoogleIdentity`).
- [ ] If `user.authProvider === "local" && !user.emailVerified`: unset `password`, set `authProvider: "google"` before marking `emailVerified`. Existing verified local accounts are unchanged.
- [ ] `scripts/grant-admin.mjs`: refuse users whose `authProvider` is `local` and who were never Google/phone verified (belt and braces).
- [ ] Test: local account (unverified) → Google sign-in for the same email (stubbed verifier seam, as in `p0-identity-extra`) → old password login returns 401.

### 2.3 Phone squatting (Medium)
`routes/auth.js:226-255`, `models/User.js:67`.
- [ ] With 2.1 no new unverified phones are created. For legacy rows: in `/phone`, if another account holds this phone and is not a phone-verified account, unset its `phone` and then create/link the verified user (log an audit line).
- [ ] Test: legacy local user with phone X → phone OTP login for X succeeds; the legacy account no longer has X.

### 2.4 Small auth hardening (Low)
- [ ] `localCredentialUser`: same "Invalid email or password" message for non-local accounts (`auth.js:140-142`).
- [ ] Password minimum 8 (`User.js:24` and `scripts/admin-account.mjs`).
- [ ] Pin JWT algorithm: `jwt.sign(..., {algorithm: "HS256"})` and `jwt.verify(..., {algorithms: ["HS256"]})`.
- [ ] Tests: enumeration message; short password rejected by `admin-account.mjs`.

**Acceptance (Phase 2):** suite green; browser smoke: login page shows Google/phone + email sign-in only; provider onboarding requires sign-in first. Real Firebase check in Phase 4.2.

---

## Phase 3 — Providers, admin, small hardening

### 3.1 Role changes (Medium)
`routes/admin.js:472`, `:646-688`.
- [ ] Approve: `User.updateOne({_id, role: "user"}, {role: "provider"})` (never touch admins). Also restore `isActive: true` and clear `rejectionReason` on (re-)approval.
- [ ] Role change away from `provider`: set the Provider `isActive: false` in the same request.
- [ ] Tests: approving an admin's provider profile keeps them admin; demoted provider disappears from `/admin/providers/approved` and can't be assigned.

### 3.2 Provider dashboard keeps customer details (Medium)
`ProviderDashboard.jsx:121-144`, `routes/providers.js` status + cash-collected responses.
- [ ] Backend: populate `user` (`name email phone`) and `service` (`name thumbnail`) in those responses (no `startOtp`).
- [ ] Frontend: merge keeps existing `user`/`service` if the response lacks them (main's pattern).
- [ ] Browser check: accept → start → complete; customer name/phone stay visible.

### 3.3 Private KYC documents (Medium)
`routes/providers.js:60-80` (upload), admin provider detail endpoint, `admin/pages/AdminProviders.jsx`.
- [ ] Upload KYC with `type: "authenticated"` into `TiptoBook/kyc/<providerId>`; store `public_id`, not a public URL.
- [ ] `GET /api/admin/providers/:id/documents` returns signed URLs valid ~5 minutes (`cloudinary.url(public_id, {type:"authenticated", sign_url:true, expires_at})`).
- [ ] Admin page opens documents through that endpoint.
- [ ] Script `scripts/migrations/003-private-kyc.mjs` (dry run default): re-upload existing KYC as authenticated, update docs, then delete the public copies.
- [ ] Docs: ADR-0006 status → accepted.
- [ ] Test: provider/public responses never include document URLs; admin endpoint returns URLs only for admins.

### 3.4 Admin and catalog hardening (Low)
- [ ] `Provider.user` `unique: true` (migration step reports duplicates first); duplicate key on register → 400 "profile already exists".
- [ ] `GET /categories/:id` filters `active: true` for the public.
- [ ] Admin list routes: string-only filters, `limit` clamped 1–100, paginate `/providers`, `/service-requests`, `/notifications`.
- [ ] Admin `PUT /services/:id`, `PUT /categories/:id`, `PUT /banners/:id`, `POST /categories`: one `pick*Fields()` allowlist per resource (shared by POST and PUT).
- [ ] Admin service approval: 409 unless the owning provider is approved and active.
- [ ] Admin stats: exclude soft-deleted users and inactive providers.
- [ ] Admin bookings page: "Refund pending" filter (backend `?paymentStatus=refund_pending`).
- [ ] Tests for each backend item (one assertion each, behaviour-level).

### 3.5 Edge and ops (Low)
- [ ] Geo proxy: cap the Nominatim queue (e.g. 30 waiting or 10 s max wait → 503); stricter per-IP limit on Nominatim routes; `Cache-Control` only on success.
- [ ] CORS: pin the Vercel preview regex to the team suffix (`-<team>.vercel.app`).
- [ ] Email: escape the fallback status title (`emailService.js:399,412`).
- [ ] Render: pin Node 22 (`NODE_VERSION` or `.node-version`); add `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` to `render.yaml`; drop the hard-coded `SMTP_HOST`.
- [ ] Log `req.ips` once at boot in production to confirm the `trust proxy` hop count.

**Acceptance (Phase 3):** suite green; browser smoke of admin providers (KYC opens via signed URL), admin bookings refund filter, provider dashboard.

---

## Phase 4 — Needs a person

### 4.1 Razorpay test mode end to end
- [ ] Re-issue test API keys; set `RAZORPAY_KEY_ID/SECRET` in dev.
- [ ] Create the webhook → `https://<api>/api/payments/webhook`, events `payment.captured`, `payment.failed`, `order.paid`; set `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Run: success (card + UPI), failure, dismiss then retry from My Bookings, switch to COD after failure, cancel then pay late (expect `refund_pending`). Record booking documents.

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

## 5. Deploy order (production)

1. Merge PR #1 (after Phases 0–3 and owner review).
2. Render env: `RAZORPAY_WEBHOOK_SECRET`, Firebase vars, new `JWT_SECRET`, Brevo vars, Node 22.
3. Run migrations, each dry run first, then `--apply`: `001-user-unique-indexes`, `002-booking-start-otp`, `003-private-kyc`, Provider.user unique-index step.
4. Give every admin a Google sign-in or a password via `scripts/admin-account.mjs` (the shared admin password is gone).
5. Deploy backend, then frontend. Check `/api/health`, then a ₹1 live payment and a refund by hand.

---

## 6. Test inventory to add

| File | Covers |
|---|---|
| `test/p2-doorstep-otp.test.mjs` | 0.3 |
| `test/p2-payments-extra.test.mjs` | 1.1, 1.2, 1.3, 1.5 |
| `test/p2-coupons-rentals.test.mjs` | 1.4, 1.6 |
| `test/p2-identity.test.mjs` | 2.1–2.4 |
| `test/p2-admin-providers.test.mjs` | 3.1, 3.3, 3.4 |

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
| plan | — | 108/108 | Plan written; decisions a–d recorded |
