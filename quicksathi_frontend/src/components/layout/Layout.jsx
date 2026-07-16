import { useState, useEffect, useRef } from "react";
import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Footer from "../common/Footer";
import BottomNav from "./BottomNav";
import ChatBot from "../chatbot/ChatBot";
import api from "../../config/api";
import { Bell, Trash2, Check, X, ShieldAlert } from "lucide-react";

const LogoImg = ({ size = 28, style = {} }) => (
  <svg
    viewBox="0 0 200 230"
    width={size}
    height={size}
    style={{ display: "block", ...style }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 10 C60 10 28 42 28 82 C28 130 100 220 100 220 C100 220 172 130 172 82 C172 42 140 10 100 10Z"
      fill="#1a3a8b"
    />
    <circle cx="100" cy="82" r="50" fill="white" />
    <path
      d="M58 78 C65 70 76 70 82 78 L90 86 L98 78 C104 70 115 70 122 78 L122 94 C115 102 104 102 98 94 L90 86 L82 94 C76 102 65 102 58 94Z"
      fill="#1a3a8b"
      opacity="0.9"
    />
    <text
      x="106"
      y="76"
      fontFamily="Arial Black, Impact, sans-serif"
      fontWeight="900"
      fontSize="44"
      fill="#e85c2a"
      dominantBaseline="auto"
    >
      S
    </text>
  </svg>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isFullBleed = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

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

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/services", label: "Services" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className="absolute top-0 left-0 right-0 z-50 px-5 sm:px-10 h-16 sm:h-18 flex items-center justify-between"
        style={
          isFullBleed
            ? { background: "transparent" }
            : {
                backgroundColor: "var(--color-bg-soft)",
                borderBottom: "1px solid var(--color-border)",
              }
        }
      >
        {/* Brand with logo */}
        <Link
          to="/"
          className="px-2 sm:px-6 py-2 text-xl sm:text-2xl font-bold tracking-tight no-underline flex items-center gap-2.5"
          style={{
            fontFamily: "var(--font-display)",
            color: isFullBleed ? "#ffffff" : "var(--color-text-dark)",
          }}
        >
          <LogoImg size={28} />
          <span>QuickSathi</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="text-sm font-medium no-underline transition-opacity duration-200 hover:opacity-70"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isFullBleed
                  ? isActive
                    ? "#ffffff"
                    : "rgba(255,255,255,0.75)"
                  : isActive
                    ? "var(--color-primary)"
                    : "var(--color-text-mid)",
              })}
            >
              {label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              className="text-sm font-medium no-underline transition-opacity duration-200 hover:opacity-70"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isFullBleed
                  ? isActive ? "#ffffff" : "rgba(255,255,255,0.75)"
                  : isActive ? "var(--color-primary)" : "var(--color-text-mid)",
              })}
            >
              Bookings
            </NavLink>
          )}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 relative">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: isFullBleed ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
                    color: isFullBleed ? "#fff" : "var(--color-text-dark)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ border: "1.5px solid var(--color-bg-white)" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 text-left border"
                    style={{ 
                      backgroundColor: "var(--color-bg-white)", 
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
                  </div>
                )}
              </div>

              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border-0 cursor-pointer transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: isFullBleed ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}>
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="text-sm font-medium" style={{
                    fontFamily: "var(--font-body)",
                    color: isFullBleed ? "#fff" : "var(--color-text-dark)",
                  }}>
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-3 w-48 rounded-xl overflow-hidden shadow-2xl z-50 text-left border"
                    style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                      <p className="text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{user?.name}</p>
                      <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>{user?.email}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Link to="/admin" className="block px-4 py-2.5 text-sm no-underline hover:bg-neutral-50 dark:hover:bg-white/[0.02]" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                        📊 Admin Panel
                      </Link>
                    )}
                    <Link to="/my-bookings" className="block px-4 py-2.5 text-sm no-underline hover:bg-neutral-50 dark:hover:bg-white/[0.02]" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                      📋 My Bookings
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm border-0 cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
                      style={{ fontFamily: "var(--font-body)", color: "#dc2626", backgroundColor: "transparent", borderTop: "1px solid var(--color-border)", borderColor: "var(--color-border)" }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: isFullBleed
                  ? "rgba(255,255,255,0.95)"
                  : "var(--color-primary)",
                color: isFullBleed ? "var(--color-text-dark)" : "#ffffff",
              }}
            >
              Log in
            </button>
          )}
        </div>

        {/* Hamburger Button (mobile) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg border-0 cursor-pointer"
          style={{ background: "transparent" }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: isFullBleed ? "#fff" : "var(--color-text-dark)",
              transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: isFullBleed ? "#fff" : "var(--color-text-dark)",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: isFullBleed ? "#fff" : "var(--color-text-dark)",
              transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          pointerEvents: menuOpen ? "all" : "none",
          opacity: menuOpen ? 1 : 0,
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className="absolute top-0 right-0 h-full w-72 flex flex-col pt-20 px-8 pb-10 gap-6"
          style={{
            backgroundColor: "var(--color-bg-soft)",
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease",
          }}
        >
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="text-lg font-medium no-underline transition-opacity duration-200"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-dark)",
              })}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              className="text-lg font-medium no-underline transition-opacity duration-200"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isActive ? "var(--color-primary)" : "var(--color-text-dark)",
              })}
              onClick={() => setMenuOpen(false)}
            >
              My Bookings
            </NavLink>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/login");
              }}
              className="mt-4 px-6 py-3 rounded-full text-sm font-semibold border-0 cursor-pointer text-center transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
              }}
            >
              Log in
            </button>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link to="/admin" className="text-lg font-medium no-underline" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }} onClick={() => setMenuOpen(false)}>
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
        </div>
      </div>
    </>
  );
};

const Layout = () => (
  <div
    className="min-h-screen flex flex-col relative pb-16 md:pb-0"
    style={{ backgroundColor: "var(--color-bg)" }}
  >
    <Navbar />
    <main className="flex-grow w-full">
      <Outlet />
    </main>
    <div className="hidden md:block">
      <Footer />
    </div>
    <BottomNav />
    {/* QuickSathi AI Chatbot — floating bottom-right */}
    <ChatBot />
  </div>
);

export default Layout;
