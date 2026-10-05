---
status: accepted
---
# Admin rights are granted explicitly, never derived from an email address

The old model promoted anyone whose email appeared in `ADMIN_EMAILS` to admin on register, login or Google sign-in, and also accepted one shared `ADMIN_PASSWORD`. Because email was neither verified nor immutable (users could change it in their profile), registering or editing an email to an admin address granted admin.

Now `User.role = "admin"` changes only through (a) `node scripts/grant-admin.mjs <email> --yes`, which requires an existing account with a verified email and prints an audit line, or (b) another admin on the Users page (same verified-email requirement; self-demotion and removal of the last admin are blocked). Admins sign in with Google (verified by Firebase) or with their own password. `ADMIN_EMAILS` remains only as the list of recipients for contact-form notifications and grants nothing.

Trade-off: bootstrapping the first admin needs one command run by someone with database access. There is no password-reset or change-password flow yet, so Google sign-in is the recommended admin method.
