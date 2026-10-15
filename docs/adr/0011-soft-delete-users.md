---
status: accepted
---
# Deleting a user anonymises them instead of removing the row

`DELETE /api/admin/users/:id` used to remove the document, leaving paid bookings pointing at nothing and the user's approved provider profile still assignable. Now the user is disabled (`isActive: false`, `deletedAt`), personal data is removed (name replaced, email replaced by `deleted+<id>@deleted.invalid`, phone/Firebase uid/password/address unset), their provider profile is deactivated, and their old token stops working (`protect` rejects inactive users). Bookings, payments and coupon redemptions keep their reference, so accounting and disputes still work. Admins cannot be deleted (demote first), and the last admin can never be removed or demoted.

This satisfies deletion requests for personal data without destroying financial records. If a legal retention policy later requires purging bookings too, that is a separate, deliberate job.
