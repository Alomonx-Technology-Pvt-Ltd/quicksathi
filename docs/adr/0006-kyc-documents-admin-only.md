---
status: partially implemented (private delivery pending)
---
# Provider KYC documents are private to admins

Provider ID proofs, selfies and business registrations are personal data (India's DPDP Act). In code they are `select: false` on `Provider`, so no query returns them unless it explicitly asks (only the admin provider list does); the public provider list returns an explicit allow-list of fields with no phone or email; provider self-edit can't touch `documents`; and registration accepts only real image uploads (PNG/JPG/WebP data URIs, ≤ ~5 MB) — an arbitrary URL is rejected, and a failed upload fails the application instead of silently creating one with no documents.

**Not done yet:** files are still uploaded with Cloudinary's default public delivery, so anyone who has a URL can open it. The intended end state is `type: "authenticated"` uploads plus short-lived signed URLs minted by an admin-only endpoint, and re-uploading existing files as private. This needs a migration and a change to the admin review screen, so it is tracked separately.
