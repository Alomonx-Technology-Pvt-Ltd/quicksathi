# QuickSathi — Premium Local Service Booking Platform

QuickSathi is a premium, high-end platform for exploring and booking local services including **Wedding Services & Planning, Luxury Car Rentals, and Smart CCTV Security Monitoring**. It is designed with a modern dark-mode aesthetic, dynamic Framer Motion animations, interactive location-aware elements, an integrated chatbot assistant, and a full-featured admin and provider ecosystem.

This project is organized as a **monorepo** containing both the React frontend and Node.js backend.

---

## 📁 Repository Structure

```text
QuickSathi/
├── quicksathi_frontend/     # React + Vite Client (Vercel / Netlify)
│   ├── public/              # Static assets and logo
│   └── src/
│       ├── admin/           # Administrative layout, dashboards, and management pages
│       ├── components/      # Chatbot, Layout, and common UI components (e.g. LocationBanner)
│       ├── context/         # Location and application state contexts
│       └── pages/           # Customer pages (Home, Services, About, Contact, etc.)
└── quicksathi_backend/      # Express + MongoDB + Firebase Admin Server (Render)
    ├── models/              # Mongoose database schemas (Service, Booking, Contact, Notification, etc.)
    ├── routes/              # Express API routers (admin, services, bookings, contact, notifications)
    ├── seed/                # Database seeding and helper scripts
    └── server.js            # Express application entrypoint
```

---

## ✨ Features

- 🌟 **Premium User Interface**: Modern dark/cream premium aesthetic, fluid hover micro-animations, and smooth page transitions using Framer Motion.
- 📍 **Location-Aware Experience**: Integrated `LocationBanner` and `LocationContext` that allows users to select, save, and dynamically view services available in their area.
- 💬 **Interactive AI Assistant**: An on-demand chatbot component providing immediate guidance, helping users find services, answering FAQs, and assisting in navigation.
- 📬 **Inquiry & Feedback Loop**: Dedicated contact backend models, API routes, and a corresponding Admin Contact panel to manage and respond to customer queries.
- 🔔 **Notification Engine**: System-wide notifications system utilizing MongoDB models (`Notification.js`) and administrative control interface (`AdminNotifications.jsx`) to push and manage notifications.
- 🛍️ **Multi-Vertical Services**:
  - **Wedding Services**: Custom packages for venues, photography, makeup, catering, and floral arrangements.
  - **Car Rentals**: Hourly/daily rates for premium cars (Tesla, Range Rover, Audi, etc.) with custom checkout routes.
  - **CCTV Security**: Commercial and residential surveillance package matching and setups.
- 📅 **Dynamic Checkout & Booking**: Multi-step calendar schedule, package pickers, and live pricing calculations.
- 💳 **Razorpay Payment Integration**: Secure local checkout handling (Test mode).
- 🔐 **Firebase Auth Integration**: Secure client-side email login, state persistence, and backend JWT access validation.
- 🛠️ **Admin & Provider Management**:
  * **Super Admin Panel**: Manage services, view bookings, control user roles, process service provider requests, publish system announcements/notifications, and view contact submissions.
  * **Provider Dashboard**: For service experts to onboard, manage incoming bookings, and track service analytics.

---

## 🚀 Local Quickstart

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed and running locally (or a MongoDB Atlas connection string).

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd quicksathi_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `quicksathi_backend/` folder based on `.env.example` (see [Environment Variables Config](#-environment-variables-config)).
4. **Seed the database** with initial categories and services:
   ```bash
   npm run seed
   ```
5. **Manage roles and test promotions (Optional)**:
   * Validate user roles: `node seed/checkRoles.js`
   * Onboard/verify providers: `node seed/manageProviders.js`
   * Verify promotional features: `node seed/testPromotion.js`
6. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../quicksathi_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `quicksathi_frontend/` folder based on `.env.example` (see [Environment Variables Config](#-environment-variables-config)).
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client will open on `http://localhost:5173`.*

---

## 🔑 Environment Variables Config

### Backend (`quicksathi_backend/.env`)
Create a `.env` file inside the `quicksathi_backend` directory with the following contents:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_phrase
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAILS=admin@quicksathi.com

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key_string"

# Cloudinary Integration (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Config (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend (`quicksathi_frontend/.env`)
Create a `.env` file inside the `quicksathi_frontend` directory with the following contents:
```env
VITE_API_URL=http://localhost:5000/api

# Firebase Web Client Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## ☁️ Deployment

### Frontend (Netlify / Vercel)
- **Settings**: Build command `npm run build`, publish directory `dist`.
- **Environment Variables**: Add `VITE_API_URL` pointing to your deployed backend (e.g., `https://api.quicksathi.com/api`).
- **Routing**: Redirect configs (`netlify.toml` and `_redirects`) are pre-configured in `public/` to support React client-side routing.

### Backend (Render / Railway / Heroku)
- **Settings**: Build command `npm install`, start command `npm start`.
- **Environment Variables**: Set `CLIENT_URL` to your production frontend domain (e.g. `https://quicksathi.vercel.app`), set `NODE_ENV` to `production`, and configure all backend API keys.