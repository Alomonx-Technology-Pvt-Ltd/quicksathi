# Architecture backlog (second pass)

Output of the `improve-codebase-architecture` review, run after the security/ops overhaul. **Nothing here is started.** Do it after the new developer has absorbed [the walkthrough](./developer-walkthrough.md), so each change lands on a codebase they understand. Vocabulary: [CONTEXT.md](../CONTEXT.md) (domain) and the skill's glossary (module, interface, depth, seam, locality, leverage). No candidate contradicts an ADR; #4 completes ADR-0005 and #6 strengthens ADR-0011.

Suggested order: **1 → 4 → 2** (they build on each other), then 3, 5–8; frontend 9 is the clearest standalone win. Implement each with the `tdd` skill: write the test at the new seam first.

## Quick fixes (do any time, independent of the candidates)

All five were fixed in round 3 (`docs/fix-plan-mvp.md` Phase 3, tests in `test/p2-admin-providers.test.mjs`):

| Fix | Where | Status |
|---|---|---|
| Admin service search puts the raw query into `$regex` (unescaped, untyped) | `routes/admin.js` services list | done: escaped, string-only, clamped |
| Re-approving a provider leaves `isActive: false`; approve doesn't clear `rejectionReason` | `routes/admin.js` approve/reject | done |
| `assign-provider` (service) accepts a rejected/inactive provider | `routes/admin.js` assign-provider | done |
| Admin broadcast and dashboard user count include soft-deleted users | `routes/admin.js` broadcast, stats | done |
| Provider-only routes check `approvalStatus` but not `isActive` | `routes/providers.js` | decided: `isActive` is the provider's availability toggle, so it must not block finishing jobs already accepted; rejection/demotion/deletion are enforced by `approvalStatus`, role and `protect` |

## Backend

1. **Error handling and input validation have no home.** ~100 per-route `catch → res.status(500).json({message: error.message})`; the global handler in `server.js` is never reached; `PricingError`, `BookingStateError`, `HttpError` are each mapped by hand at call sites; duplicate-key (11000) and Mongoose `ValidationError`/`CastError` mapped ad hoc; admin `PUT` and `Service.create(req.body)` accept whole bodies. *Direction:* one error-translation module (typed domain errors + Mongoose mapping + async wrapper) feeding the global handler, and per-resource input allow-lists (generalise `PROVIDER_EDITABLE_FIELDS`). Keep the `{ message }` response shape stable for the frontend. Size M.
2. **Provider lifecycle (application → approval → role → active → deletion) is scattered** across `admin.js`, `providers.js`, `auth.js`, with the drift listed above, a duplicated default-category fallback, three separate "approved" checks, and non-atomic Provider+User updates. *Direction:* one Provider-lifecycle module owning apply / approve / reject / deactivate and the single "eligible to act or be assigned" rule (`approved && isActive`), plus KYC upload validation. Size M. Confirm intended behaviour on re-approval.
3. **Booking notifications/emails exist as six hand-rolled variants** (`bookings.js` cancel + admin status, `providers.js`, `admin.js` assign, `payments.js`, create) with different recipients per route. *Direction:* one booking-event notifier (event → recipients/channels/templates) called after a successful save; a test adapter makes notifications assertable. Size S–M; product decision on who is told what.
4. **Payment/assign/COD transitions bypass the state machine.** `payments.js` `markPaid`, `cod-confirm`, the webhook `failed` branch and `admin.js` assign set `status`/`paymentStatus` directly, so `statusHistory` is incomplete (ADR-0005 isn't fully true); `markPaid` is read-modify-write. *Direction:* extend the booking lifecycle module to own every Booking + Payment transition (confirm by payment, confirm by COD, assign, cancel, cash collected, payment failed) with uniform history, and move paise helpers next to it. Keep `markPaid`/webhook idempotency (`p0-payments.test.mjs`). Size M.
5. **`admin.js` is a ~1,000-line router** that imports a route handler from `bookings.js`, with duplicate Service/Category write paths in `services.js` and `categories.js` (different slug/uniqueness/delete rules). *Direction:* split per domain, one admin write path per aggregate, stats (IST bucketing) and broadcast as their own modules; remove the legacy `/api/services` and `/api/categories` write routes after confirming no client uses them. Size M–L.
6. **Soft-delete rule (ADR-0011) leaks.** "Who is a live user" is decided per query; anonymisation recipe is inline in the DELETE route. *Direction:* one place that defines live-user selections and owns anonymise-and-deactivate. Size S.
7. **Helpers duplicated:** regex escape ×4, pagination ×4 styles, slug generation ×2 (one race-prone), service lookup by id/slug/name ×3, "category with first-category fallback" ×2, service-visibility predicate ×4 (including the sitemap script). *Direction:* a small catalog-query module. Size S–M.
8. **Tests only exist at the HTTP level** (spawned server per suite). `pricing.js` and `bookingStatus.js` have no direct tests; fixtures insert raw documents that hand-copy schema shape; default coupon/banner seed arrays live in route modules imported by the seed. *Direction:* keep the hermetic stack for end-to-end, add an in-process seam for the deepened modules with model-built fixtures; move seed arrays into `seed/`. Size S (seed move) / M.

## Frontend

9. **Category pop-ups:** 8 near-identical modals (1,713 lines), 69 references to `open-*-modal` window events, the same 8-way dispatch switch copied in `Hero.jsx` (twice) and `AllCategoriesSection.jsx` (the banner carousel already uses a map). *Direction:* one data-driven category picker behind a small open/close seam. Also fixes modal accessibility once.
10. **Booking flow state travels through URL query strings** across ServiceDetail → BookingPage → PaymentPage (17 `searchParams.get` reads). The server prices it (ADR-0002) but the page state is fragile. *Direction:* one booking-draft module that owns the in-progress booking.
11. **Admin pages each re-implement** load / error message / delete confirm / image upload (10 pages, 3 with their own file reader). *Direction:* one admin resource-page module.
12. **Location search lives in four places** (`LocationContext`, `LocationBanner`, `Layout`, `carRental/LocationSearch`). *Direction:* one location-search module.
13. **No frontend tests; 23 files call `api` directly.** Candidates 9–12 create the seams that make tests possible. Giant files (`ProviderOnboarding` 1,331 lines, `Services` 1,172, `Hero` 1,006, `AdminBanners` 1,004, `Profile` 990, `ProviderDashboard` 978, `BookingPage` 948, `Layout` 948) are symptoms.

## Not worth deepening

`services/pricing.js` (already deep: one `quote()` serves three endpoints), the transition map in `services/bookingStatus.js` (the issue is callers bypassing it, #4), `middleware/*`, `config/*`, `services/phone.js`.
