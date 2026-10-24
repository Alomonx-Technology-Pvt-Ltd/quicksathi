---
status: accepted
---
# Provider KYC documents are private to admins

Provider ID proofs, selfies and business registrations are personal data (India's DPDP Act). In code they are `select: false` on `Provider`, so no query returns them unless it explicitly asks; the public and admin provider lists return no documents; provider self-edit can't touch `documents`; and registration accepts only real image uploads (PNG/JPG/WebP data URIs, ≤ ~5 MB) — an arbitrary URL is rejected, and a failed upload fails the application instead of silently creating one with no documents.

Files are uploaded to Cloudinary as **`type: "authenticated"`** assets (no public URL). `Provider.documents.*` stores a reference (`cld-auth/<format>/<public_id>`, see `services/kyc.js`), and admins open files through `GET /api/admin/providers/:id/documents`, which returns 5-minute signed download links (`Cache-Control: no-store`). Files uploaded before this change are moved by `scripts/migrations/003-private-kyc.mjs` (dry run first), which also deletes the public copies; until it runs, legacy URLs are passed through unchanged.
