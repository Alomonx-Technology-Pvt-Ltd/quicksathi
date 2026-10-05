---
status: accepted
---
# Firebase proves identity; the backend issues its own JWT

Google and phone sign-in are done by Firebase Auth in the browser. The browser sends the Firebase **ID token** to our API, the API verifies it with the Admin SDK (`verifyIdToken`), and then issues its own short-lived JWT that the SPA sends as `Authorization: Bearer`. Email and phone are taken **only from the verified token**; request-body identity fields are ignored (a missing token is 400, an invalid one 401, Firebase not configured 503). Email+password accounts exist alongside.

We did this instead of using Firebase tokens for every API call because the API needs roles, deactivation and per-request user reload (`protect` loads the user from MongoDB each time), none of which live in Firebase. Trade-off: two token systems; the JWT lives in `localStorage`, so XSS can steal it (mitigations: strict output escaping, CSP work, short expiry). Production refuses to boot if Firebase Admin is not configured, because without it every federated login would be unverifiable.

The previous implementation fell back to trusting the body `email` when no token was sent, which allowed logging in as anyone, including an admin.
