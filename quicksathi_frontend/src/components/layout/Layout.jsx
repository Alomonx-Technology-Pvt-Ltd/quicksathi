import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Outlet, Link, NavLink, useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLocation as useCityLocation } from "../../context/LocationContext";
import Footer from "../common/Footer";
import BottomNav from "./BottomNav";
import ChatBot from "../chatbot/ChatBot";
import api from "../../config/api";
import { Bell, Trash2, MapPin } from "lucide-react";
import BrandLogo from "../common/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";

/* ── Compact City Picker (used inside navbar) ── */
const CityPicker = ({ isFullBleed, isMobile }) => {
  const {
    fullLocation,
    street,
    road,
    locality,
    city,
    locationData,
    updateExactStreet,
    setLocationData,
    searchLocation,
    detecting,
    locationError,
    detectExactLocation,
  } = useCityLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customStreet, setCustomStreet] = useState("");
  const [editingStreet, setEditingStreet] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef(null);

  // Determine concise, high-precision label to show on the navbar button
  const displayLabel = useMemo(() => {
    if (street && street !== city && street !== locality) {
      return locality ? `${street}, ${locality}` : `${street}, ${city}`;
    }
    if (road && road !== city && road !== locality) {
      return locality ? `${road}, ${locality}` : `${road}, ${city}`;
    }
    if (locality && city && locality !== city) {
      return `${locality} • Select Road/Gully`;
    }
    return fullLocation || "Set your location";
  }, [street, road, locality, city, fullLocation]);

  // Concise label for mobile header button
  const mobileLabel = useMemo(() => {
    if (locality) return locality;
    if (city) return city;
    if (street) return street.split(",")[0];
    if (road) return road.split(",")[0];
    return "Location";
  }, [locality, city, street, road]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setResults([]);
        setEditingStreet(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Live search (debounced) — searches any street, road, gully, or area
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchLocation(search);
      setResults(r || []);
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [search, searchLocation]);

  const handleSelectResult = (r) => {
    setLocationData({
      fullLocation: r.label,
      street: r.street || r.road || r.label,
      road: r.road || "",
      locality: r.locality || "",
      city: r.city || r.label,
      lat: r.lat,
      lon: r.lon,
      version: 2,
      timestamp: Date.now(),
    });
    setOpen(false);
    setSearch("");
    setResults([]);
    setEditingStreet(false);
  };

  const handleDetectClick = async () => {
    if (detectExactLocation) {
      await detectExactLocation(true);
    }
    setOpen(false);
    setSearch("");
    setResults([]);
  };

  const handleSaveCustomStreet = (e) => {
    e?.preventDefault?.();
    if (!customStreet.trim()) return;
    updateExactStreet(customStreet.trim());
    setCustomStreet("");
    setEditingStreet(false);
    setOpen(false);
  };

  // Popular local streets & gullies for quick 1-click precision (e.g. Digha / Patna)
  const isDigha =
    (fullLocation && fullLocation.toLowerCase().includes("digha")) ||
    (locality && locality.toLowerCase().includes("digha"));

  const localShortcuts = isDigha
    ? [
        "Ashiana-Digha Road",
        "AIIMS - Digha Service Road",
        "Ashok Rajpath",
        "Patel Gali",
        "Tarumitra Road",
        "Ganga Nagar Lane",
        "Digha Ghat Road",
        "Priyadarshi Nagar",
        "Kurji Digha",
        "Makhdumpur Digha",
      ]
    : [
        "Boring Road",
        "Bailey Road",
        "Kankarbagh Main Rd",
        "Fraser Road",
        "Rajendra Nagar",
        "Ashiana Nagar",
      ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={fullLocation ? `Exact Location: ${fullLocation}` : "Select Location"}
        className="flex items-center gap-1.5 rounded-full border-0 cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95"
        style={{
          padding: isMobile ? "5px 10px" : "6px 12px",
          backgroundColor: isMobile
            ? "rgba(255, 107, 0, 0.08)"
            : isFullBleed
            ? "rgba(255,255,255,0.14)"
            : "rgba(0,0,0,0.05)",
          border: isMobile ? "1px solid rgba(255, 107, 0, 0.22)" : "none",
          backdropFilter: "blur(8px)",
          color: isMobile
            ? "#ea580c"
            : isFullBleed
            ? "rgba(255,255,255,0.95)"
            : "var(--color-text-dark)",
          fontFamily: "var(--font-body)",
          fontSize: isMobile ? "11.5px" : "12px",
          fontWeight: 600,
        }}
      >
        <MapPin
          size={isMobile ? 12 : 13}
          strokeWidth={2.4}
          style={{ color: "#ff6b00", flexShrink: 0 }}
        />
        {detecting ? (
          <span style={{ fontSize: isMobile ? "10px" : "11px", opacity: 0.8 }}>Locating…</span>
        ) : (
          <span
            style={{
              maxWidth: isMobile ? "85px" : "230px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {isMobile ? mobileLabel : displayLabel}
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Backdrop for mobile */}
      {open && isMobile && (
        <div
          className="fixed inset-0 z-[999] bg-black/25 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          className={
            isMobile
              ? "fixed left-3 right-3 top-[68px] max-w-[360px] mx-auto rounded-2xl overflow-hidden shadow-2xl z-[1000] border"
              : "absolute top-full mt-2 rounded-2xl overflow-hidden shadow-2xl z-[1000] border"
          }
          style={{
            right: isMobile ? undefined : 0,
            width: isMobile ? "auto" : "300px",
            backgroundColor: "var(--color-bg-white)",
            borderColor: "var(--color-border)",
            maxHeight: isMobile ? "75vh" : undefined,
            overflowY: isMobile ? "auto" : undefined,
          }}
        >
          {/* Current Location Header & Refinement */}
          <div
            style={{
              padding: "10px 12px",
              background: "linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(26,58,107,0.06) 100%)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                Current Pinpoint
              </span>
              <button
                type="button"
                onClick={() => setEditingStreet((v) => !v)}
                className="text-[11px] font-semibold text-blue-600 bg-transparent border-0 cursor-pointer p-0 underline"
              >
                {editingStreet ? "Cancel" : "✏️ Refine Gully / House"}
              </button>
            </div>

            <p className="text-xs font-semibold m-0 mt-1 text-gray-800 line-clamp-1">
              📍 {displayLabel}
            </p>

            {/* Inline Gully / House Number Editor */}
            {editingStreet && (
              <form onSubmit={handleSaveCustomStreet} className="mt-2 flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Gali No. 3, Ganga Nagar"
                  value={customStreet}
                  onChange={(e) => setCustomStreet(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border outline-none"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg-white)",
                  }}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white border-0 cursor-pointer"
                  style={{ backgroundColor: "#ff6b00" }}
                >
                  Save
                </button>
              </form>
            )}
          </div>

          {/* Search Input */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--color-border)" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specific road, gully, lane, colony…"
              className="w-full outline-none"
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "var(--color-text-dark)",
                fontSize: "12px",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>

          {/* Detect High Accuracy GPS */}
          <button
            type="button"
            onClick={handleDetectClick}
            disabled={detecting}
            className="w-full text-left border-0 cursor-pointer flex items-center gap-2 transition-all hover:bg-orange-50"
            style={{
              padding: "9px 12px",
              background: "rgba(255,107,0,0.06)",
              color: "#c2410c",
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontSize: "13px" }}>🎯</span>
            <span>{detecting ? "Locating exact GPS spot…" : "Detect Exact GPS Location"}</span>
          </button>

          {/* Location error (GPS denied / unavailable) */}
          {locationError && (
            <p
              className="m-0"
              style={{
                padding: "7px 12px",
                color: "#dc2626",
                fontSize: "11px",
                fontFamily: "var(--font-body)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              ⚠️ {locationError}
            </p>
          )}

          {/* Quick Road / Gully Suggestions */}
          {!search.trim() && (
            <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--color-border)" }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider m-0 mb-1.5">
                Exact Localities & Roads:
              </p>
              <div className="flex flex-wrap gap-1">
                {localShortcuts.map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => {
                      updateExactStreet(sc);
                      setOpen(false);
                    }}
                    className="px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-all hover:border-orange-400 hover:text-orange-600"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.02)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    📍 {sc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results */}
          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            {search.trim() && (
              <button
                type="button"
                onClick={() => {
                  updateExactStreet(search.trim());
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full text-left border-0 cursor-pointer flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold border-b border-orange-100"
              >
                <span>📍</span>
                <span className="truncate">
                  Set exact road/gully: <strong>"{search.trim()}"</strong>
                </span>
              </button>
            )}

            {searching && (
              <p
                className="text-center"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "12px",
                  padding: "12px",
                  fontFamily: "var(--font-body)",
                }}
              >
                Searching roads & gullies…
              </p>
            )}
            {!searching &&
              results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left border-0 cursor-pointer transition-all hover:bg-gray-50 flex items-start gap-2"
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    color: "var(--color-text-dark)",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <MapPin size={13} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold m-0 leading-tight truncate">{r.label}</p>
                    <p className="text-[10px] text-gray-400 m-0 mt-0.5 truncate">{r.displayName}</p>
                  </div>
                </button>
              ))}
            {!searching && search.trim() && results.length === 0 && (
              <p
                className="text-center"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "12px",
                  padding: "12px",
                  fontFamily: "var(--font-body)",
                }}
              >
                No matching roads or gullies found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-based shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll notifications every 20 seconds for real-time updates
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Click outside listener for notifications dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation(); // Avoid triggering parent click
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Close menu on route change
  useEffect(() => {
    Promise.resolve().then(() => {
      setMenuOpen(false);
      setProfileOpen(false);
      setNotifOpen(false);
    });
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Nav links: split by auth state
  const guestLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/about-us", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];
  const authLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/about-us", label: "About Us" },
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/contact", label: "Contact" },
  ];
  const navLinks = isAuthenticated ? authLinks : guestLinks;

  return (
    <>
      <nav
        className="sticky top-0 left-0 right-0 z-50 px-4 sm:px-10 flex items-center justify-between w-full max-w-full"
        style={{
          height: 64,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          className="py-2 no-underline flex items-center group flex-shrink-0"
          aria-label="TiptoBook Home"
        >
          <BrandLogo size={34} isDark={false} />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="text-sm font-medium no-underline transition-all duration-200 hover:opacity-75"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isActive ? "var(--color-primary)" : "#475569",
                fontWeight: isActive ? 600 : 500,
              })}
            >
              {label}
            </NavLink>
          ))}

          {/* City Picker */}
          <CityPicker isFullBleed={false} />

          {/* Auth area */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 relative">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer transition-all duration-200 hover:bg-slate-100"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.04)",
                    color: "#475569",
                  }}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ border: "1.5px solid #ffffff" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-3 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 text-left border bg-white"
                      style={{ 
                        borderColor: "var(--color-border)",
                        maxHeight: "360px",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      {/* Header */}
                      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--color-border)" }}>
                        <span className="text-xs font-bold" style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-body)" }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="bg-transparent border-0 text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer p-0"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notification list */}
                      <div className="overflow-y-auto flex-1 flex flex-col" style={{ maxHeight: "290px" }}>
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              onClick={() => !notif.read && handleMarkRead(notif._id)}
                              className="px-4 py-3 flex gap-2 items-start justify-between cursor-pointer border-b hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-all"
                              style={{ 
                                borderColor: "var(--color-border)",
                                backgroundColor: notif.read ? "transparent" : "rgba(59, 130, 246, 0.04)"
                              }}
                            >
                              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-2">
                                <span className="text-xs font-bold truncate" style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-body)" }}>{notif.title}</span>
                                <span className="text-[10px] leading-relaxed" style={{ color: "var(--color-text-mid)", fontFamily: "var(--font-body)", whiteSpace: "pre-line" }}>{notif.message}</span>
                                <span className="text-[8px] mt-1" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                                  {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                                <button 
                                  onClick={(e) => handleDeleteNotif(e, notif._id)}
                                  className="bg-transparent border-0 text-neutral-400 hover:text-red-500 cursor-pointer p-0.5"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-xs text-neutral-400" style={{ fontFamily: "var(--font-body)" }}>
                            You have no notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all duration-200 hover:bg-slate-100"
                  style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {user?.name?.[0] || "U"}
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body)", color: "#0f172a" }}
                  >
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    className="absolute top-full right-0 mt-3 w-52 rounded-2xl overflow-hidden shadow-2xl z-50 text-left border"
                    style={{ backgroundColor: "#ffffff", borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                      <p className="text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)", color: "#0f172a" }}>{user?.name}</p>
                      <p className="text-xs m-0 mt-0.5" style={{ fontFamily: "var(--font-body)", color: "#94a3b8" }}>{user?.email}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Link to="/admin" className="block px-4 py-2.5 text-sm no-underline hover:bg-slate-50 transition-colors" style={{ fontFamily: "var(--font-body)", color: "#0f172a" }}>📊 Admin Panel</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2.5 text-sm no-underline hover:bg-slate-50 transition-colors" style={{ fontFamily: "var(--font-body)", color: "#0f172a" }}>👤 My Profile</Link>
                    <Link to="/my-bookings" className="block px-4 py-2.5 text-sm no-underline hover:bg-slate-50 transition-colors" style={{ fontFamily: "var(--font-body)", color: "#0f172a" }}>📋 My Bookings</Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm border-0 cursor-pointer hover:bg-red-50 transition-colors"
                      style={{ fontFamily: "var(--font-body)", color: "#dc2626", backgroundColor: "transparent", borderTop: "1px solid rgba(0,0,0,0.07)" }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:bg-slate-100"
                style={{ fontFamily: "var(--font-body)", color: "#475569", backgroundColor: "transparent" }}
              >
                Sign In
              </button>
              <Link
                to="/provider/onboarding"
                className="px-4 py-2 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  color: "#ffffff",
                  boxShadow: "0 3px 12px rgba(255,107,0,0.3)",
                }}
              >
                Become a Partner
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header: Location + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <CityPicker isMobile={true} />
          <button
            className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg border-0 cursor-pointer"
            style={{ background: "transparent" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className="block w-6 h-0.5 transition-all duration-300"
              style={{ backgroundColor: "#1e293b", transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none" }}
            />
            <span className="block w-6 h-0.5 transition-all duration-300"
              style={{ backgroundColor: "#1e293b", opacity: menuOpen ? 0 : 1 }}
            />
            <span className="block w-6 h-0.5 transition-all duration-300"
              style={{ backgroundColor: "#1e293b", transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute top-0 right-0 h-full w-72 flex flex-col pt-6 px-6 pb-10 gap-5 overflow-y-auto shadow-2xl bg-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/70">
                <Link to="/" onClick={() => setMenuOpen(false)} className="no-underline">
                  <BrandLogo size={30} isDark={false} />
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200/50 border-0 bg-transparent cursor-pointer text-lg leading-none"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="text-base font-medium no-underline transition-all duration-200"
                  style={({ isActive }) => ({
                    fontFamily: "var(--font-body)",
                    color: isActive ? "var(--color-primary)" : "#1e293b",
                    fontWeight: isActive ? 600 : 500,
                  })}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}

              {/* City Picker in mobile drawer */}
              <CityPicker isFullBleed={false} />

              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/login"); }}
                    className="px-6 py-3 rounded-full text-sm font-semibold border-0 cursor-pointer text-center transition-all duration-200 hover:bg-slate-100"
                    style={{ fontFamily: "var(--font-body)", color: "#475569", backgroundColor: "rgba(0,0,0,0.04)" }}
                  >
                    Sign In / Sign Up
                  </button>
                  <Link
                    to="/provider/onboarding"
                    className="px-6 py-3 rounded-full text-sm font-semibold no-underline text-center transition-all duration-200 hover:opacity-90"
                    style={{
                      fontFamily: "var(--font-body)",
                      background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                      color: "#ffffff",
                      boxShadow: "0 3px 12px rgba(255,107,0,0.3)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Become a Partner
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link to="/admin" className="text-base font-medium no-underline" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }} onClick={() => setMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="px-6 py-3 rounded-full text-sm font-semibold border cursor-pointer text-center"
                  style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", color: "#dc2626", backgroundColor: "transparent" }}
                >
                  Sign Out
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const ContentLoader = () => (
  <div className="flex justify-center items-center py-24 min-h-[50vh]">
    <div
      className="w-9 h-9 rounded-full border-3 border-orange-200 border-t-[#FF6B00] animate-spin"
      style={{
        borderWidth: "3px",
        borderColor: "rgba(255, 107, 0, 0.18)",
        borderTopColor: "#FF6B00",
      }}
    />
  </div>
);

const Layout = () => {
  const location = useRouterLocation();

  return (
    <div
      className="min-h-screen flex flex-col relative pb-16 md:pb-0 bg-white w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      <Navbar />
      <main className="flex-grow w-full max-w-full min-w-0 overflow-x-hidden">
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      {/* TiptoBook AI Chatbot — floating bottom-right */}
      <ChatBot />
    </div>
  );
};

export default Layout;
