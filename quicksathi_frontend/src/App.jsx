import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// ── Core Public Pages (eagerly imported for instant zero-lag navigation) ──
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Category from "./pages/Category";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./pages/Login";

// ── Lazy-loaded Secondary & Admin Pages ──
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ProviderOnboarding = lazy(() => import("./pages/ProviderOnboarding"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const Profile = lazy(() => import("./pages/Profile"));

// Service Category Pages
const WeddingServices = lazy(() => import("./pages/services/WeddingServices"));
const CarRentals = lazy(() => import("./pages/services/CarRentals"));
const CCTVServices = lazy(() => import("./pages/services/CCTVServices"));

import AdminLogin from "./admin/pages/AdminLogin";

// Admin (separate chunk — only loaded for admin users)
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminProviders = lazy(() => import("./admin/pages/AdminProviders"));
const AdminBookings = lazy(() => import("./admin/pages/AdminBookings"));
const AdminServices = lazy(() => import("./admin/pages/AdminServices"));
const AdminCategories = lazy(() => import("./admin/pages/AdminCategories"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminServiceRequests = lazy(() => import("./admin/pages/AdminServiceRequests"));
const AdminNotifications = lazy(() => import("./admin/pages/AdminNotifications"));
const AdminContacts = lazy(() => import("./admin/pages/AdminContacts"));

// ── Loading fallback ──
const PageLoader = () => (
  <div
    className="flex justify-center items-center"
    style={{ minHeight: "80vh" }}
  >
    <div
      className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
      style={{
        borderColor: "var(--color-border)",
        borderTopColor: "var(--color-primary)",
      }}
    />
  </div>
);

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
      <ScrollToTop/>

        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:id" element={<Category />} />
            <Route path="/about" element={<About />} />
            <Route path="/about-us" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="services" element={<Services />} />
            <Route path="services/weddings" element={<WeddingServices />} />
            <Route path="services/car-rentals" element={<CarRentals />} />
            <Route path="services/cctv" element={<CCTVServices />} />
            <Route path="booking/:serviceId" element={<BookingPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route
              path="my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route path="provider/onboarding" element={<ProviderOnboarding />} />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="text-center p-20 text-2xl font-bold">
                  404 - Page Not Found
                </div>
              }
            />
          </Route>

          {/* Login (no layout) */}
          <Route path="/login" element={<Login />} />

          {/* Provider Dashboard (no main layout — has its own header) */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes (separate layout — easy to extract) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="service-requests" element={<AdminServiceRequests />} />
            <Route path="send-email" element={<AdminNotifications />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

