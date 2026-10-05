# TiptoBook (QuickSathi)

A marketplace for local services in India: home repair and AC, salon, weddings, car rental, tuition, pandit and more. Customers book and pay online (Razorpay) or in cash; verified providers do the job; admins run the catalog and approve providers.

Monorepo:

| Folder | What | Stack | Hosted on |
|---|---|---|---|
| `quicksathi_frontend/` | customer app, provider dashboard, admin panel | React 19, Vite, Tailwind 4, React Router 7 | Vercel |
| `quicksathi_backend/` | REST API, payments, auth | Node ≥ 20, Express 5, Mongoose 8 | Render |
| MongoDB Atlas, Firebase Auth, Razorpay, Cloudinary, Groq, Brevo | managed services | | |

## Documentation

| Read this | For |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | how the system works: request flow, auth, booking and payment, data model, env vars, known limits |
| [CONTEXT.md](./CONTEXT.md) | the project's vocabulary (booking, quote, provider application, …) |
| [docs/adr/](./docs/adr/) | why the important decisions were made |
| [docs/developer-walkthrough.md](./docs/developer-walkthrough.md) | the security/reliability overhaul, area by area, with a deploy checklist |
| [docs/code-review-2026-10-04.md](./docs/code-review-2026-10-04.md), [docs/fix-plan-p0-p1.md](./docs/fix-plan-p0-p1.md) | original findings and the plan that fixed them |

## Quickstart

Prerequisites: Node 20+ and a MongoDB database. **Use a dedicated development database (name it `quicksathi_dev`); never point a local `.env` at production.**

```bash
# Backend
cd quicksathi_backend
npm ci
cp .env.example .env        # fill MONGODB_URI (dev database), JWT_SECRET, Firebase, etc.
npm run seed:dev            # builds the dev catalog; refuses production and non-dev databases
npm run dev                 # http://localhost:5050

# Frontend (works without a .env; Google/phone login need the VITE_FIREBASE_* values)
cd ../quicksathi_frontend
npm ci
npm run dev                 # http://localhost:5173
```

### Tests

```bash
cd quicksathi_backend && npm test
```
Runs the real server against an in-memory MongoDB and ignores `.env` (nothing external is contacted). The first run downloads a `mongod` binary. CI (`.github/workflows/ci.yml`) runs the same suite plus `npm audit`.

### Admins and roles

Admin is never derived from an email address. A person signs in once with Google, then:

```bash
cd quicksathi_backend
node scripts/grant-admin.mjs person@example.com --yes
node scripts/admin-account.mjs person@example.com --yes   # create an admin / reset an admin's password (prompts for a new password)
node seed/checkRoles.js        # role counts only
```
Providers become providers when an admin approves their application in the admin panel.

## Configuration

Backend variables are documented in [`quicksathi_backend/.env.example`](./quicksathi_backend/.env.example) and summarised in [ARCHITECTURE.md §9](./ARCHITECTURE.md#9-environments-and-configuration). In production the server **refuses to start** if `MONGODB_URI`, `JWT_SECRET` (32+ random characters), `CLIENT_URL`, the Razorpay key/secret/**webhook secret**, or Firebase Admin credentials are missing.

Frontend (`quicksathi_frontend/.env`):

```env
VITE_API_URL=http://localhost:5050/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Deployment

- **Frontend → Vercel**: build `npm run build`, output `dist`. Set `VITE_API_URL` and the `VITE_FIREBASE_*` values. Security headers and SPA rewrites are in `vercel.json`.
- **Backend → Render** (`render.yaml`): build `npm ci`, start `npm start`. Set every variable marked `sync: false`. `PORT` is injected by Render. Configure the Razorpay webhook to `POST https://<api-host>/api/payments/webhook` (events `payment.captured`, `payment.failed`, `order.paid`) and put its secret in `RAZORPAY_WEBHOOK_SECRET`.
- First deploy of the unique-phone change: `node scripts/migrations/001-user-unique-indexes.mjs` (dry run), then `--apply`.
- Full checklist: [developer walkthrough §10](./docs/developer-walkthrough.md#10-deploy-checklist).

## Project status

The platform has been through a security and reliability overhaul (auth, pricing, payments, provider/KYC privacy, booking lifecycle, hardening, ops). See the walkthrough for what changed and [ARCHITECTURE.md §11](./ARCHITECTURE.md#11-known-limitations-honest-list) for what is still open.
