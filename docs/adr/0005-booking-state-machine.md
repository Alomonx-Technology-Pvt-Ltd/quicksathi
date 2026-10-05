---
status: accepted
---
# One booking state machine, with an audit trail, and "completed" is not "paid"

All status changes go through `services/bookingStatus.js → changeStatus()`. Legal moves: `pending → confirmed|cancelled`, `confirmed → in_progress|cancelled`, `in_progress → completed` (admins may also cancel `in_progress`); customers may only cancel from `pending|confirmed`. Each change appends `{from, to, by, role, at}` to `statusHistory`. Providers act only on bookings assigned to them and only once their profile is approved.

We separated the **job** lifecycle from the **money** lifecycle: finishing a job no longer marks it paid (it used to, so a provider could mark any unpaid job "paid" and inflate revenue). Cash is recorded by an explicit *cash collected* action, allowed only once the job has started. Cancelling a booking that is already paid moves it to `paymentStatus: refund_pending` so the refund can't be forgotten.

The previous routes accepted any status for any booking from any provider.
