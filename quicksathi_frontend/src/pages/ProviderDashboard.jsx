import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CITY_OPTIONS } from "../context/LocationContext";
import api from "../config/api";
import {
  Compass,
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Globe,
  LogOut,
  TrendingUp,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Sun,
  Moon
} from "lucide-react";

const LogoImg = ({ size = 28, style = {} }) => {
  const pad = -Math.round(size * 0.25);
  return (
    <img
      src="/logo.png"
      alt="QuickSathi Logo"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        objectFit: "contain",
        transform: "scale(1.5)",
        marginLeft: `${pad}px`,
        marginRight: `${pad}px`,
        marginTop: `${pad}px`,
        marginBottom: `${pad}px`,
        ...style
      }}
    />
  );
};

const STATUS_STYLES = {
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "⏳ Pending Review" },
  approved: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "✅ Approved" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "❌ Rejected" },
};

const BOOKING_STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  in_progress: "#3b82f6",
  completed: "#8b5cf6",
  cancelled: "#ef4444",
};

const ProviderDashboard = () => {
  const { user, providerProfile, logout } = useAuth();
  const [provider, setProvider] = useState(providerProfile);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "bookings", "listings"
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  
  // Theme Switcher matching Admin Panel theme
  const [theme, setTheme] = useState(() => localStorage.getItem("provider-theme") || "dark");

  const inputStyle = {
    backgroundColor: "var(--admin-bg-input)",
    borderColor: "var(--admin-border)",
    color: "var(--admin-text-primary)",
  };

  const [formData, setFormData] = useState({
    name: "", category: "", shortDescription: "", fullDescription: "",
    startingPrice: "", priceUnit: "per service", serviceMode: "ON_SITE",
    tags: "",
  });

  useEffect(() => {
    localStorage.setItem("provider-theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providerRes, servicesRes, bookingsRes, categoriesRes] = await Promise.all([
          api.get("/providers/me"),
          api.get("/providers/services").catch(() => ({ data: [] })),
          api.get("/providers/bookings").catch(() => ({ data: [] })),
          api.get("/categories").catch(() => ({ data: [] })),
        ]);
        setProvider(providerRes.data);
        setServices(servicesRes.data);
        setBookings(bookingsRes.data);
        setCategories(categoriesRes.data);
        if (providerRes.data?.category?._id || providerRes.data?.category) {
          const catId = providerRes.data.category._id || providerRes.data.category;
          setFormData((prev) => ({ ...prev, category: catId }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggleAvailability = async () => {
    try {
      const nextActive = !provider.isActive;
      const { data } = await api.put("/providers/me", { isActive: nextActive });
      setProvider(data);

      // Refresh services list to reflect updated availability
      try {
        const servicesRes = await api.get("/providers/services");
        setServices(servicesRes.data);
      } catch (e) {
        console.warn("Failed to refresh services after toggle:", e);
      }

      setMessage(`Availability updated: You are now ${nextActive ? "Active & Open for bookings" : "Inactive & Unavailable"}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update availability");
    }
  };

  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const { data } = await api.patch(`/providers/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      setMessage(`Booking status updated to ${newStatus.replace("_", " ")}!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update booking status");
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    console.log("handleSubmitService triggered", formData);
    
    if (!formData.name?.trim()) {
      setMessage("Service Name is required");
      return;
    }
    if (!formData.shortDescription?.trim()) {
      setMessage("Short Description is required");
      return;
    }
    if (!formData.startingPrice) {
      setMessage("Starting Price is required");
      return;
    }
    
    setSubmitting(true);
    setMessage("");
    try {
      const { data } = await api.post("/providers/services", {
        ...formData,
        category: formData.category || provider?.category?._id || provider?.category,
        startingPrice: Number(formData.startingPrice) || 0,
        tags: typeof formData.tags === "string" ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : formData.tags,
        cities: selectedCities,
      });
      setServices((prev) => [data, ...prev]);
      setShowForm(false);
      setFormData({
        name: "",
        category: provider?.category?._id || provider?.category || "",
        shortDescription: "",
        fullDescription: "",
        startingPrice: "",
        priceUnit: "per service",
        serviceMode: "ON_SITE",
        tags: "",
      });
      setSelectedCities([]);
      setMessage("Service listing submitted for admin approval!");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to submit service");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#0c0c0e" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(255,255,255,0.06)", borderTopColor: "var(--color-primary)" }} />
      </div>
    );
  }

  const status = STATUS_STYLES[provider?.approvalStatus] || STATUS_STYLES.pending;

  // Real-time Provider Stats Calculations
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const totalEarnings = bookings
    .filter((b) => b.status === "completed" || b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <div
      className="min-h-screen flex admin-transition"
      data-admin-theme={theme}
      style={{
        backgroundColor: "var(--admin-bg-main)",
        color: "var(--admin-text-primary)",
        fontFamily: "var(--font-body)"
      }}
    >
      {/* Sidebar - Desktop (Matching Admin Sidebar Design with theme vars) */}
      <aside
        className="w-56 lg:w-60 flex-shrink-0 hidden md:flex flex-col py-6 border-r sticky top-0 h-screen overflow-y-auto admin-transition"
        style={{
          backgroundColor: "var(--admin-bg-sidebar)",
          borderColor: "var(--admin-border)",
          scrollbarWidth: "none"
        }}
      >
        {/* Top Logo */}
        <div className="flex flex-col w-full px-4 mb-6">
          <Link to="/" className="no-underline group flex items-center gap-3 mb-4">
            <LogoImg size={63} />
            <span className="font-bold text-sm tracking-tight m-0" style={{ fontFamily: "var(--font-display)", color: "var(--admin-text-primary)" }}>
              QuickSathi Partner
            </span>
          </Link>
          <div className="h-[1px] w-full" style={{ backgroundColor: "var(--admin-border)" }} />
        </div>

        {/* Center Navigation Icons with labels */}
        <nav className="flex flex-col gap-1.5 w-full px-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="relative rounded-xl flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300 border-0 cursor-pointer text-left w-full"
            style={{
              color: activeTab === "dashboard" 
                ? (theme === "dark" ? "#121214" : "#ffffff") 
                : "var(--admin-text-secondary)",
              backgroundColor: activeTab === "dashboard" 
                ? (theme === "dark" ? "#ffffff" : "#121214") 
                : "transparent",
            }}
          >
            <LayoutDashboard size={16} strokeWidth={1.75} />
            <span className="text-xs font-semibold tracking-wide">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className="relative rounded-xl flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300 border-0 cursor-pointer text-left w-full"
            style={{
              color: activeTab === "bookings" 
                ? (theme === "dark" ? "#121214" : "#ffffff") 
                : "var(--admin-text-secondary)",
              backgroundColor: activeTab === "bookings" 
                ? (theme === "dark" ? "#ffffff" : "#121214") 
                : "transparent",
            }}
          >
            <ClipboardList size={16} strokeWidth={1.75} />
            <span className="text-xs font-semibold tracking-wide">Orders & Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            className="relative rounded-xl flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300 border-0 cursor-pointer text-left w-full"
            style={{
              color: activeTab === "listings" 
                ? (theme === "dark" ? "#121214" : "#ffffff") 
                : "var(--admin-text-secondary)",
              backgroundColor: activeTab === "listings" 
                ? (theme === "dark" ? "#ffffff" : "#121214") 
                : "transparent",
            }}
          >
            <Wrench size={16} strokeWidth={1.75} />
            <span className="text-xs font-semibold tracking-wide">My Services</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3 w-full px-4 mt-auto pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <Link
            to="/"
            className="flex items-center gap-2.5 py-1 text-xs font-medium no-underline hover:text-[#e85c2a] transition-all"
            style={{ color: "var(--admin-text-muted)" }}
          >
            <Globe size={15} strokeWidth={1.5} />
            <span>Go to Live Site</span>
          </Link>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer text-red-500 hover:bg-red-500/10"
            style={{ backgroundColor: "var(--admin-bg-input)", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600" }}
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar (With Theme Switcher) */}
        <header
          className="h-16 flex items-center justify-between px-6 sm:px-8 border-b flex-shrink-0 admin-transition sticky top-0 z-40"
          style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-sidebar)" }}
        >
          <div className="md:hidden flex items-center gap-2">
            <LogoImg size={24} />
            <span className="font-bold text-xs">QuickSathi Partner</span>
          </div>

          <div className="hidden md:block">
            <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              Welcome back, <strong>{user?.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all"
              style={{
                backgroundColor: "var(--admin-bg-input)",
                color: "var(--admin-text-secondary)",
              }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile Tab triggers */}
            <div className="flex md:hidden gap-1.5 bg-black/10 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-2.5 py-1.5 rounded-lg border-0 text-[10px] font-bold cursor-pointer transition"
                style={{
                  backgroundColor: activeTab === "dashboard" ? "var(--admin-bg-input)" : "transparent",
                  color: "var(--admin-text-primary)",
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className="px-2.5 py-1.5 rounded-lg border-0 text-[10px] font-bold cursor-pointer transition"
                style={{
                  backgroundColor: activeTab === "bookings" ? "var(--admin-bg-input)" : "transparent",
                  color: "var(--admin-text-primary)",
                }}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("listings")}
                className="px-2.5 py-1.5 rounded-lg border-0 text-[10px] font-bold cursor-pointer transition"
                style={{
                  backgroundColor: activeTab === "listings" ? "var(--admin-bg-input)" : "transparent",
                  color: "var(--admin-text-primary)",
                }}
              >
                Services
              </button>
            </div>

            <button
              onClick={logout}
              className="md:hidden px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 text-xs font-semibold bg-transparent cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 px-6 sm:px-8 py-8 pb-32">
          {/* Header Title */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-normal m-0" style={{ fontFamily: "var(--font-display)" }}>
                {activeTab === "dashboard" && "Performance Overview"}
                {activeTab === "bookings" && "Customer Bookings"}
                {activeTab === "listings" && "Listed Services"}
              </h1>
              <p className="text-xs m-0 mt-1.5 text-muted" style={{ color: "var(--admin-text-muted)" }}>
                Manage your services, availability, and client request logistics.
              </p>
            </div>

            {/* Provider Status Tag & Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              {provider?.approvalStatus === "approved" && (
                <button
                  onClick={handleToggleAvailability}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-0 transition"
                  style={{
                    backgroundColor: provider.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: provider.isActive ? "#22c55e" : "#ef4444",
                  }}
                >
                  {provider.isActive ? "● Online" : "○ Offline"}
                </button>
              )}
            </div>
          </div>

          {/* Alert messages */}
          {message && (
            <div
              className="px-4 py-3 rounded-xl text-sm mb-6 border"
              style={{
                backgroundColor: (message.includes("Failed") || message.includes("required")) ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)",
                borderColor: (message.includes("Failed") || message.includes("required")) ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                color: (message.includes("Failed") || message.includes("required")) ? "#ef4444" : "#22c55e",
              }}
            >
              {message}
            </div>
          )}

          {/* Redirection Notice if pending/rejected */}
          {provider?.approvalStatus !== "approved" && (
            <div
              className="rounded-2xl p-6 border text-center"
              style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
            >
              <AlertCircle size={40} className="mx-auto text-amber-500 mb-4 animate-pulse" />
              <h2 className="text-lg font-bold mb-2">Account Status: {provider?.approvalStatus.toUpperCase()}</h2>
              {provider?.approvalStatus === "rejected" && provider?.rejectionReason ? (
                <p className="text-sm text-red-400">Rejection Reason: {provider.rejectionReason}</p>
              ) : (
                <p className="text-sm" style={{ color: "var(--admin-text-secondary)" }}>
                  Your profile registration request is under review. You will be granted full access once verified.
                </p>
              )}
            </div>
          )}

          {/* Full Dashboard for Approved Providers */}
          {provider?.approvalStatus === "approved" && (
            <>
              {/* REAL-TIME METRICS GRID (Admin Style cards) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Gross Volume */}
                <div
                  className="rounded-2xl p-5 border flex flex-col justify-between"
                  style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>Gross Volume</span>
                    <h3 className="text-xl sm:text-2xl font-bold m-0 mt-1" style={{ color: "var(--admin-text-primary)" }}>₹{totalEarnings.toLocaleString()}</h3>
                  </div>
                  <TrendingUp size={16} className="text-[#3b82f6] mt-4 self-end" />
                </div>

                {/* Total Bookings */}
                <div
                  className="rounded-2xl p-5 border flex flex-col justify-between"
                  style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>Total Orders</span>
                    <h3 className="text-xl sm:text-2xl font-bold m-0 mt-1" style={{ color: "var(--admin-text-primary)" }}>{totalBookings}</h3>
                  </div>
                  <Briefcase size={16} className="text-[#8b5cf6] mt-4 self-end" />
                </div>

                {/* Completed Bookings */}
                <div
                  className="rounded-2xl p-5 border flex flex-col justify-between"
                  style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>Completed</span>
                    <h3 className="text-xl sm:text-2xl font-bold m-0 mt-1" style={{ color: "var(--admin-text-primary)" }}>{completedBookings}</h3>
                  </div>
                  <CheckCircle size={16} className="text-[#22c55e] mt-4 self-end" />
                </div>

                {/* Pending Bookings */}
                <div
                  className="rounded-2xl p-5 border flex flex-col justify-between"
                  style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>Pending Action</span>
                    <h3 className="text-xl sm:text-2xl font-bold m-0 mt-1" style={{ color: "var(--admin-text-primary)" }}>{pendingBookings}</h3>
                  </div>
                  <Clock size={16} className="text-[#f59e0b] mt-4 self-end" />
                </div>
              </div>

              {/* OVERVIEW / DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Recent Bookings */}
                  <div
                    className="lg:col-span-2 rounded-2xl border p-5"
                    style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm uppercase font-bold m-0" style={{ color: "var(--admin-text-muted)" }}>Recent Assignments</h3>
                      <button onClick={() => setActiveTab("bookings")} className="border-0 bg-transparent text-xs text-[#3b82f6] cursor-pointer font-bold">View all</button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {bookings.slice(0, 3).map((b) => (
                        <div
                          key={b._id}
                          className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                          style={{ backgroundColor: "rgba(255,255,255,0.01)", borderColor: "var(--admin-border)" }}
                        >
                          <div>
                            <p className="text-sm font-semibold m-0" style={{ color: "var(--admin-text-primary)" }}>{b.serviceName}</p>
                            <p className="text-xs m-0 mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
                              {b.user?.name} · {new Date(b.scheduledDate).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${BOOKING_STATUS_COLORS[b.status] || "#888"}15`,
                              color: BOOKING_STATUS_COLORS[b.status] || "#888",
                            }}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                      {bookings.length === 0 && (
                        <p className="text-xs text-center py-6" style={{ color: "var(--admin-text-muted)" }}>No booking requests found.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Profile & Info */}
                  <div
                    className="rounded-2xl border p-5 flex flex-col justify-between"
                    style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                  >
                    <div>
                      <h3 className="text-sm uppercase font-bold mb-4" style={{ color: "var(--admin-text-muted)" }}>My Provider Details</h3>
                      <div className="flex flex-col gap-3 text-xs">
                        <div>
                          <span className="block font-bold mb-0.5" style={{ color: "var(--admin-text-muted)" }}>Business Name</span>
                          <span className="text-sm" style={{ color: "var(--admin-text-primary)" }}>{provider.businessName}</span>
                        </div>
                        <div>
                          <span className="block font-bold mb-0.5" style={{ color: "var(--admin-text-muted)" }}>Primary Category</span>
                          <span style={{ color: "var(--admin-text-primary)" }}>{provider.categoryName}</span>
                        </div>
                        <div>
                          <span className="block font-bold mb-0.5" style={{ color: "var(--admin-text-muted)" }}>Contact Phone</span>
                          <span style={{ color: "var(--admin-text-primary)" }}>{provider.phone}</span>
                        </div>
                        <div>
                          <span className="block font-bold mb-0.5" style={{ color: "var(--admin-text-muted)" }}>Operating Area</span>
                          <span style={{ color: "var(--admin-text-primary)" }}>{provider.location?.city || "Not set"}, {provider.location?.state}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("listings")}
                      className="w-full mt-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition"
                      style={{
                        backgroundColor: "var(--admin-bg-input)",
                        borderColor: "var(--admin-border)",
                        color: "var(--admin-text-primary)"
                      }}
                    >
                      Manage Offerings
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKINGS / ORDERS TAB */}
              {activeTab === "bookings" && (
                <div className="flex flex-col gap-4">
                  {bookings.map((b) => (
                    <div
                      key={b._id}
                      className="rounded-2xl p-5 border flex flex-col gap-4"
                      style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
                        <div>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-primary)" }}>
                            {b.bookingId || b._id?.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-xs ml-3" style={{ color: "var(--admin-text-muted)" }}>
                            Booked: {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${BOOKING_STATUS_COLORS[b.status] || "#888"}15`,
                            color: BOOKING_STATUS_COLORS[b.status] || "#888",
                            border: `1px solid ${BOOKING_STATUS_COLORS[b.status] || "#888"}30`
                          }}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs uppercase font-bold m-0 mb-1" style={{ color: "var(--admin-text-muted)" }}>Job Details</h4>
                          <p className="text-sm font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>{b.serviceName}</p>
                          {b.packageTitle && <p className="text-xs m-0 mt-0.5" style={{ color: "var(--admin-text-secondary)" }}>Package: {b.packageTitle}</p>}
                          <p className="text-xs m-0 mt-1.5 font-semibold text-[#3b82f6]">
                            Schedule: {new Date(b.scheduledDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {b.scheduledTime || "Anytime"}
                          </p>
                          <p className="text-xs font-bold m-0 mt-2" style={{ color: "var(--admin-text-primary)" }}>Amount: ₹{b.amount?.toLocaleString()}</p>
                        </div>

                        <div>
                          <h4 className="text-xs uppercase font-bold m-0 mb-1" style={{ color: "var(--admin-text-muted)" }}>Customer Contact</h4>
                          <p className="text-sm font-semibold m-0" style={{ color: "var(--admin-text-primary)" }}>{b.user?.name || "Customer"}</p>
                          <p className="text-xs m-0" style={{ color: "var(--admin-text-secondary)" }}>📞 {b.user?.phone || "No phone"}</p>
                          <p className="text-xs m-0" style={{ color: "var(--admin-text-secondary)" }}>✉ {b.user?.email || "No email"}</p>
                          <p className="text-xs m-0 mt-2" style={{ color: "var(--admin-text-secondary)" }}>
                            📍 {b.location?.address}, {b.location?.city} - {b.location?.pincode}
                          </p>
                        </div>
                      </div>

                      {b.notes && (
                        <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-secondary)" }}>
                          <strong>Notes:</strong> {b.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
                        {b.status === "pending" && (
                          <button
                            onClick={() => handleBookingStatus(b._id, "confirmed")}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer border-0 bg-green-500 hover:bg-green-600 text-white transition"
                          >
                            Accept Booking
                          </button>
                        )}
                        {["pending", "confirmed"].includes(b.status) && (
                          <button
                            onClick={() => handleBookingStatus(b._id, "in_progress")}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer border-0 bg-blue-500 hover:bg-blue-600 text-white transition"
                          >
                            Start Work
                          </button>
                        )}
                        {b.status === "in_progress" && (
                          <button
                            onClick={() => handleBookingStatus(b._id, "completed")}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer border-0 bg-purple-500 hover:bg-purple-600 text-white transition"
                          >
                            Complete Work
                          </button>
                        )}
                        {b.status !== "completed" && b.status !== "cancelled" && (
                          <button
                            onClick={() => handleBookingStatus(b._id, "cancelled")}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer border-0 bg-red-500 hover:bg-red-600 text-white transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div
                      className="text-center py-12 rounded-2xl border"
                      style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                    >
                      <ClipboardList size={30} className="text-white/20 mx-auto mb-3" />
                      <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>No jobs assigned yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* LISTINGS / SERVICES TAB */}
              {activeTab === "listings" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-normal m-0" style={{ fontFamily: "var(--font-display)" }}>
                      Your Listed Offerings
                    </h2>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all hover:opacity-90 animate-fade-in"
                      style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
                    >
                      {showForm ? "Cancel" : "+ Request New Listing"}
                    </button>
                  </div>

                  {showForm && (
                    <form
                      onSubmit={handleSubmitService}
                      className="rounded-2xl p-6 border mb-8 flex flex-col gap-4"
                      style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                    >
                      <h3 className="text-base font-semibold m-0" style={{ fontFamily: "var(--font-display)" }}>
                        Request Service Listing
                      </h3>
                      <p className="text-xs m-0 text-white/50">
                        Your listing will be reviewed by admin before it goes live on the website.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Service Name *</label>
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Premium Wedding Photography"
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Category *</label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none font-sans"
                            style={inputStyle}
                          >
                            <option value="">Select Category...</option>
                            {categories.map((cat) => (
                              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Short Description *</label>
                        <input
                          name="shortDescription"
                          value={formData.shortDescription}
                          onChange={handleChange}
                          placeholder="Brief description"
                          className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Full Description</label>
                        <textarea
                          name="fullDescription"
                          value={formData.fullDescription}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Detailed description..."
                          className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-y"
                          style={inputStyle}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Starting Price (₹) *</label>
                          <input
                            name="startingPrice"
                            type="number"
                            value={formData.startingPrice}
                            onChange={handleChange}
                            placeholder="e.g. 5000"
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Price Unit</label>
                          <select
                            name="priceUnit"
                            value={formData.priceUnit}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none font-sans"
                            style={inputStyle}
                          >
                            <option>per service</option>
                            <option>per event</option>
                            <option>per day</option>
                            <option>per session</option>
                            <option>per visit</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Service Mode</label>
                          <select
                            name="serviceMode"
                            value={formData.serviceMode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none font-sans"
                            style={inputStyle}
                          >
                            <option value="ON_SITE">On Site</option>
                            <option value="AT_HOME">At Home</option>
                            <option value="RENTAL">Rental</option>
                            <option value="REMOTE">Remote</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>Tags (comma separated)</label>
                          <input
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g. Wedding, Photo, HD"
                            className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Cities checkboxes for Location feature */}
                      <div className="mb-6">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 font-bold" style={{ color: "var(--admin-text-secondary)" }}>
                          📍 Operating Location Cities (leave empty for all cities)
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                            gap: "6px",
                            background: "var(--admin-bg-input)",
                            border: "1px solid var(--admin-border)",
                            borderRadius: "12px",
                            padding: "10px",
                          }}
                        >
                          {CITY_OPTIONS.map((city) => {
                            const checked = selectedCities.includes(city);
                            return (
                              <label
                                key={city}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontFamily: "var(--font-body)",
                                  color: checked ? "var(--color-primary)" : "var(--admin-text-secondary)",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setSelectedCities((prev) =>
                                      checked ? prev.filter((c) => c !== city) : [...prev, city]
                                    );
                                  }}
                                  style={{ accentColor: "var(--color-primary)" }}
                                />
                                {city}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl text-sm font-bold border-0 cursor-pointer transition-all mt-4"
                        style={{
                          backgroundColor: "#ff0000",
                          color: "#ffffff",
                          display: "block",
                          minHeight: "50px",
                          boxShadow: "0 0 10px rgba(255,0,0,0.5)"
                        }}
                      >
                        {submitting ? "Submitting..." : "SUBMIT THIS SERVICE (CLICK HERE)"}
                      </button>
                    </form>
                  )}

                  {/* Listings list */}
                  <div className="flex flex-col gap-4">
                    {services.map((service) => {
                      const sStatus = STATUS_STYLES[service.approvalStatus] || STATUS_STYLES.pending;
                      return (
                        <div
                          key={service._id}
                          className="rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                        >
                          <div>
                            <h3 className="text-base font-semibold m-0 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--admin-text-primary)" }}>
                              {service.name}
                            </h3>
                            <p className="text-xs m-0" style={{ color: "var(--admin-text-secondary)" }}>{service.shortDescription}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                                ₹{service.startingPrice?.toLocaleString()} / {service.priceUnit}
                              </span>
                              {service.cities && service.cities.length > 0 && (
                                <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>| 📍 {service.cities.join(", ")}</span>
                              )}
                            </div>
                            {service.rejectionReason && service.approvalStatus === "rejected" && (
                              <p className="text-xs mt-1.5 m-0 text-red-500">Reason: {service.rejectionReason}</p>
                            )}
                          </div>
                          <span
                            className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: sStatus.bg, color: sStatus.color }}
                          >
                            {sStatus.label}
                          </span>
                        </div>
                      );
                    })}
                    {services.length === 0 && (
                      <div
                        className="text-center py-12 rounded-2xl border"
                        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
                      >
                        <Wrench size={30} className="mx-auto mb-3" style={{ color: "var(--admin-text-muted)" }} />
                        <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>No services registered yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
