---
status: accepted
---
# Separate databases per environment; destructive scripts are guarded

`npm run seed` used to delete every service, category **and booking** and then attach fake paid bookings to the first real user it found, and a developer's local `.env` pointed at the production cluster. Now: development uses its own database; `seed/_guard.js` makes seed scripts exit unless `NODE_ENV` is not `production` **and** the database name is on an allow-list (`quicksathi_dev`, `quicksathi_test`, `quicksathi_local`, `qs_test`, or `SEED_DB_ALLOWLIST`); the seed only rebuilds the catalog (never bookings, users or providers); and `npm run seed:dev` runs the complete, idempotent dev seed in one command. Scripts that created a known-password provider or contained a real person's email were deleted. The server no longer writes default banners or coupons at import/boot (admins' deletions used to be undone on every restart).

Tests never read `.env`: `test/helpers/stack.mjs` boots the real server against an in-memory MongoDB with a sealed environment. Additive migrations (`migrateACAppliances.js`, `seedPanditService.js`, `scripts/migrations/*`) may still be run deliberately against any database. Atlas backups should be on regardless.
