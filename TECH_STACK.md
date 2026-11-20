# 🛠️ QuickSathi / TiptoBook — Full Technology Stack

A comprehensive directory of all languages, frameworks, libraries, cloud services, and developer tooling used across the **QuickSathi / TiptoBook** ecosystem.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Frontend Stack (`quicksathi_frontend`)](#-frontend-stack-quicksathi_frontend)
3. [Backend Stack (`quicksathi_backend`)](#-backend-stack-quicksathi_backend)
4. [Database & Storage](#-database--storage)
5. [Authentication & Security](#-authentication--security)
6. [Payment Gateway & External APIs](#-payment-gateway--external-apis)
7. [Artificial Intelligence & Chatbot](#-artificial-intelligence--chatbot)
8. [Marketing Automation & Media Production (`quicksathi_motion_ad`)](#-marketing-automation--media-production-quicksathi_motion_ad)
9. [Testing & Quality Assurance](#-testing--quality-assurance)
10. [DevOps, Cloud Hosting & Deployment](#-devops-cloud-hosting--deployment)
11. [Package & Version Summary](#-package--version-summary)

---

## 🏛️ Architecture Overview

QuickSathi is organized as a **modular Monorepo** containing decoupled frontend, backend, deployment configurations, and automated media production tools:

```text
QuickSathi/
├── quicksathi_frontend/    # Client SPA (React 19 + Vite + Tailwind CSS v4)
├── quicksathi_backend/     # REST API Server (Node.js 20+ / Express 5 / MongoDB)
├── quicksathi_motion_ad/   # Motion ad & video generation tool (Puppeteer Core)
├── quicksathi_deploy/      # Static deployment configuration (Netlify / Cloudflare / Vercel)
├── docs/                   # Engineering documentation, security audits & P0/P1 fix plans
├── wrangler.json           # Cloudflare Pages / Workers deployment configuration
└── TECH_STACK.md           # This document
```

---

## 🖥️ Frontend Stack (`quicksathi_frontend`)

| Technology | Version / Tool | Purpose & Details |
| :--- | :--- | :--- |
| **Core Framework** | **React 19** (`v19.2.5`) | Component-based UI library with modern Concurrent Mode and hooks. |
| **DOM Renderer** | **React DOM** (`v19.2.5`) | Web rendering engine for React. |
| **Build Tool & Bundler** | **Vite 8** (`v8.0.10`) | Ultra-fast ESM-native development server, HMR, and Rollup-based production bundler. |
| **Styling Engine** | **Tailwind CSS v4** (`v4.3.0`) + `@tailwindcss/vite` | Modern utility-first CSS framework with native CSS engine integration and fast compile times. |
| **Client Routing** | **React Router DOM v7** (`v7.15.0`) | Declarative client-side routing, protected auth routes, admin layouts, and dynamic URL params. |
| **Animation & Transitions** | **Framer Motion** (`v12.42.2`) | Smooth component transitions, hover effects, modal animations, and entrance stagger effects. |
| **High-Performance Motion** | **GSAP** (`v3.15.0`) | GreenSock Animation Platform for high-precision timeline animations and banner transitions. |
| **Iconography** | **Lucide React** (`v1.24.0`) | Modern, lightweight, customizable SVG icon set for UI/UX elements. |
| **Maps & Geolocation** | **Leaflet** (`v1.9.4`) & **React-Leaflet** (`v5.0.0`) | Interactive maps for location selection, service boundary visualization, and provider locations. |
| **External Maps API** | **Google Maps JavaScript API** | Location auto-complete, reverse geocoding, and precision address resolution. |
| **HTTP Client** | **Axios** (`v1.18.1`) | Promise-based HTTP client customized with in-memory TTL caching (5-minute GET cache) and auth token interceptors. |
| **SEO & Document Head** | **React Helmet Async** (`v3.0.0`) | Dynamic OpenGraph tags, title, meta descriptions, and canonical URL management per route. |
| **State Management** | **React Context API** | Global application states (`AuthContext`, `LocationContext`) paired with custom hooks (e.g., `useFetch`). |
| **Bundle Optimization** | **Rollup Manual Chunks** | Splits vendor dependencies into separate cached bundles (`vendor-react`, `vendor-firebase`, `vendor-framer-motion`, `vendor-leaflet`, `vendor-gsap`, `vendor-icons`). |

---

## ⚙️ Backend Stack (`quicksathi_backend`)

| Technology | Version / Tool | Purpose & Details |
| :--- | :--- | :--- |
| **Runtime Environment** | **Node.js 20+** | Modern JavaScript runtime using native ES Modules (`"type": "module"`). |
| **Web Server Framework** | **Express.js 5** (`v5.1.0`) | Next-generation Express web framework handling REST endpoints, middleware pipelines, and named routing wildcards. |
| **Database ODM** | **Mongoose** (`v8.15.1`) | Elegant MongoDB object modeling, schema validation, indexing, and population hooks. |
| **Compression** | **compression** (`v1.8.2`) | Gzip and Brotli compression middleware to minimize response payloads and latency. |
| **Cross-Origin Security** | **CORS** (`v2.8.5`) | Robust origin whitelisting supporting localhost, production domains, Vercel preview URLs, Cloudflare Workers/Pages, and Railway. |
| **Configuration** | **dotenv** (`v16.5.0`) | Loads environment variables securely from `.env` files into `process.env`. |
| **Security Headers** | Custom Middleware | HTTP security hardening (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and `x-powered-by` suppression). |

---

## 🗄️ Database & Storage

| Component | Technology | Usage |
| :--- | :--- | :--- |
| **Primary Database** | **MongoDB** (Atlas Cloud / Local) | Document-oriented NoSQL database storing users, service catalogs, categories, bookings, coupons, banners, notifications, and contact requests. |
| **Media Cloud Storage** | **Cloudinary** (`cloudinary: ^2.10.0`) | Cloud asset storage, image upload pipeline, automatic format optimization (WebP/AVIF), and transformation delivery. |
| **In-Memory Testing DB** | **mongodb-memory-server** (`v10.4.3`) | Ephemeral, zero-dependency in-memory MongoDB instance for fast, isolated integration test execution. |

---

## 🔒 Authentication & Security

| Technology | Package | Details |
| :--- | :--- | :--- |
| **Client Authentication** | **Firebase Auth Web SDK** (`v12.15.0`) | Handles user identity, Google OAuth sign-in, and ID token lifecycle on the client. |
| **Backend Auth Validation** | **Firebase Admin SDK** (`v14.1.0`) | Cryptographically verifies Firebase ID tokens server-side before minting application sessions. |
| **Token Authentication** | **JSON Web Tokens** (`jsonwebtoken: ^9.0.2`) | Issues signed JWT bearer tokens for authorized session management across API routes. |
| **Password Security** | **bcryptjs** (`v3.0.2`) | Strong salted password hashing for native credentials and admin accounts. |
| **Role-Based Access Control** | Custom RBAC Middleware | Multi-tiered authorization protecting routes for: **Customer (`user`)**, **Service Provider (`provider`)**, and **Super Admin (`admin`)**. |

---

## 💳 Payment Gateway & External APIs

| Service | Package / Integration | Details |
| :--- | :--- | :--- |
| **Payment Gateway** | **Razorpay** (`razorpay: ^2.9.6`) | Secure payment processing in INR (₹) supporting UPI, Cards, Netbanking, and Wallets. Handles order creation and cryptographic HMAC SHA256 payment signature verification. |
| **Email Delivery** | **Nodemailer** (`nodemailer: ^9.0.3`) | SMTP email dispatch for transactional notifications, booking receipts, and contact inquiries. |
| **Location Services** | **Google Maps Geocoding API** | Geocoding and reverse-geocoding for pin-code and city-level service localization. |

---

## 🤖 Artificial Intelligence & Chatbot

| Component | Technology / Service | Details |
| :--- | :--- | :--- |
| **LLM Inference Provider** | **Groq Cloud API** | Ultra-low latency LLM inference powering the QuickSathi / TiptoBook on-site AI assistant. |
| **LLM Models** | • `openai/gpt-oss-120b`<br>• `openai/gpt-oss-20b`<br>• `groq/compound-mini`<br>• `qwen/qwen3.8-27b` | Multi-model fallback hierarchy for robust, real-time responses to customer inquiries. |
| **Fallback Knowledge Engine**| `aiFallbackEngine.js` | Built-in offline keyword and heuristic response engine guaranteeing 100% chatbot uptime even during external API downtime. |
| **Prompt Engineering** | System Persona Configuration | Multi-lingual support (English, Hindi, Hinglish), structured catalog queries, and price estimations across 6 service verticals. |

---

## 🎬 Marketing Automation & Media Production (`quicksathi_motion_ad`)

| Technology | Package | Purpose |
| :--- | :--- | :--- |
| **Headless Browser** | **Puppeteer Core** (`puppeteer-core: ^25.12.0`) | Programmatic browser automation for capturing high-resolution DOM snapshots, screenshots, and motion advertising frames. |
| **Ad Render Pipeline** | Custom Node.js scripts | Automates generation of promotional banners and animated marketing videos for QuickSathi services. |

---

## 🧪 Testing & Quality Assurance

| Tool | Type | Usage |
| :--- | :--- | :--- |
| **Node.js Test Runner** | `node:test` + `node:assert/strict` | Built-in fast test runner executing security (P0) and business logic (P1) regression test suites. |
| **MongoDB Memory Server** | Integration Testing | Spins up ephemeral database instances during CI/test runs without touching production data. |
| **ESLint 10** | Static Code Analysis | Linting rules for React hooks (`eslint-plugin-react-hooks`), Vite refresh (`eslint-plugin-react-refresh`), and modern ES standards. |

---

## ☁️ DevOps, Cloud Hosting & Deployment

| Environment | Platform / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Hosting** | **Cloudflare Pages & Workers** (`wrangler.json`) | Global edge CDN delivery with single-page application (SPA) routing fallbacks. |
| **Alternative Frontend** | **Vercel** / **Netlify** (`quicksathi_deploy`, `_redirects`) | Continuous deployment via Git commits with automated build preview environments. |
| **Backend Hosting** | **Railway** (`tiptobook.up.railway.app`) / **Render** | Managed container hosting for Express API server with automatic SSL and environment variable injection. |
| **Database Cloud** | **MongoDB Atlas** | High-availability cloud-hosted database clusters with automated backups and replica sets. |
| **Static Asset CDN** | **Cloudinary CDN** & **Cloudflare Edge** | Fast global caching and delivery of service imagery, icons, and hero banners. |

---

## 📦 Package & Version Summary

### Frontend (`quicksathi_frontend/package.json`)
```json
{
  "dependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "axios": "^1.18.1",
    "firebase": "^12.15.0",
    "framer-motion": "^12.42.2",
    "gsap": "^3.15.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.24.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-helmet-async": "^3.0.0",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^7.15.0",
    "tailwindcss": "^4.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "vite": "^8.0.10"
  }
}
```

### Backend (`quicksathi_backend/package.json`)
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cloudinary": "^2.10.0",
    "compression": "^1.8.2",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "firebase-admin": "^14.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.15.1",
    "nodemailer": "^9.0.3",
    "razorpay": "^2.9.6"
  },
  "devDependencies": {
    "mongodb-memory-server": "^10.4.3"
  }
}
```

### Motion Automation (`quicksathi_motion_ad/package.json`)
```json
{
  "dependencies": {
    "puppeteer-core": "^25.12.0"
  }
}
```

