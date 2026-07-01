import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Category from "./pages/Category";
import Contact from "./pages/Contact";
import ServiceDetail from "./pages/ServiceDetail";
import About from "./pages/About";
import Login from "./pages/Login";
import Services from "./pages/Services";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import MyBookings from "./pages/MyBookings";
import ProviderOnboarding from "./pages/ProviderOnboarding";

// Service Category Pages
import WeddingServices from "./pages/services/WeddingServices";
import CarRentals from "./pages/services/CarRentals";
import CCTVServices from "./pages/services/CCTVServices";

// Admin (separate folder — easy to extract later)
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProviders from "./admin/pages/AdminProviders";
import AdminBookings from "./admin/pages/AdminBookings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:id" element={<Category />} />
            <Route path="/about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
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
            <Route
              path="provider/onboarding"
              element={
                <ProtectedRoute>
                  <ProviderOnboarding />
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
            <Route path="providers" element={<AdminProviders />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
