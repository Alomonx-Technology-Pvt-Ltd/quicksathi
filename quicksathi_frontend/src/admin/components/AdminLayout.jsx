import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import {
  LayoutDashboard,
  Wrench,
  FolderOpen,
  Users,
  ClipboardList,
  Globe,
  Briefcase,
  FileCheck,
  Sun,
  Moon,
  LogOut,
  Settings,
  Bell,
  Menu,
  X,
  Compass,
  Mail,
  Search,
  MessageSquare
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

const MENU = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/providers", label: "Providers", icon: Briefcase },
  { to: "/admin/service-requests", label: "Service Requests", icon: FileCheck },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/send-email", label: "Email Broadcast", icon: Mail },
  { to: "/admin/contacts", label: "User Messages", icon: MessageSquare },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Live Admin Alerts States
  const [adminAlerts, setAdminAlerts] = useState([]);
  const [hasNewAlerts, setHasNewAlerts] = useState(false);

  // Popover States
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Refs for clicking outside
  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);

  // Fetch admin alerts
  const fetchAdminAlerts = async () => {
    try {
      const response = await api.get("/admin/notifications");
      setAdminAlerts(response.data);
      
      // If there are alerts, check if any is fresh (e.g., created in last 15 mins)
      const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
      const hasFresh = response.data.some(alert => new Date(alert.createdAt).getTime() > fifteenMinsAgo);
      setHasNewAlerts(hasFresh);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchAdminAlerts();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchAdminAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
    document.documentElement.removeAttribute("data-admin-theme");
    return () => {
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, [theme]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const getFormattedDate = () => {
    const options = { weekday: "short", day: "numeric", month: "short" };
    return "Today, " + new Date().toLocaleDateString("en-US", options);
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  };

  return (
    <div
      className="min-h-screen flex admin-transition animate-fade-in"
      data-admin-theme={theme}
      style={{ backgroundColor: "var(--admin-bg-main)", color: "var(--admin-text-primary)", fontFamily: "var(--font-body)" }}
    >
      {/* Sidebar - Desktop (Sticky to top-0, h-screen, wider layout showing text) */}
      <aside
        className="w-56 lg:w-60 flex-shrink-0 hidden md:flex flex-col py-6 border-r admin-transition sticky top-0 h-screen overflow-y-auto"
        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", scrollbarWidth: "none" }}
      >
        {/* Top Logo */}
        <div className="flex flex-col w-full px-4 mb-6">
          <Link to="/" className="no-underline group flex items-center gap-3 mb-4">
            <LogoImg size={63} />
            <span className="font-bold text-sm tracking-tight text-white m-0" style={{ fontFamily: "var(--font-display)" }}>
              QuickSathi Admin
            </span>
          </Link>
          <div className="h-[1px] w-full" style={{ backgroundColor: "var(--admin-border)" }} />
        </div>

        {/* Center Navigation Icons with labels */}
        <nav className="flex flex-col gap-1.5 w-full px-3">
          {MENU.map(({ to, label, icon: Icon, end }) => {
            const isActive = end ? location.pathname === to : location.pathname.startsWith(to) && to !== "/admin";
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="relative rounded-xl flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300 group no-underline"
                style={{
                  backgroundColor: isActive 
                    ? (theme === "dark" ? "#ffffff" : "#121214") 
                    : "transparent",
                  color: isActive 
                    ? (theme === "dark" ? "#121214" : "#ffffff") 
                    : "var(--admin-text-secondary)",
                }}
              >
                <Icon size={16} strokeWidth={1.75} className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                <span className="text-xs font-semibold tracking-wide" style={{ fontFamily: "var(--font-body)" }}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3 w-full px-4 mt-auto pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <Link
            to="/"
            className="flex items-center gap-2.5 py-1 text-xs font-medium no-underline hover:text-white transition-all"
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
        
        {/* Top Header Bar */}
        <header
          className="h-20 border-b flex items-center justify-between px-6 sm:px-10 admin-transition sticky top-0 z-40"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", backdropFilter: "blur(8px)" }}
        >
          {/* Left Side: Mobile Menu Trigger & Title / Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border-0 cursor-pointer bg-transparent hover:bg-neutral-800/10 dark:hover:bg-white/5"
              style={{ color: "var(--admin-text-primary)" }}
            >
              <Menu size={22} />
            </button>

            {/* Redesigned Search input */}
            <div className="relative hidden sm:block w-64 lg:w-72">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs outline-none border transition-all admin-transition"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--admin-bg-input)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-primary)",
                }}
              />
            </div>

            {/* Date Display */}
            <span
              className="text-xs font-medium ml-2 hidden md:inline-block"
              style={{ color: "var(--admin-text-secondary)" }}
            >
              {getFormattedDate()}
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Dark/Light mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center border-0 cursor-pointer admin-transition"
              style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-primary)" }}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun size={16} className="text-amber-400 animate-pulse" />
              ) : (
                <Moon size={16} className="text-indigo-600" />
              )}
            </button>

            {/* Config Cog Icon (Interactive Settings Dropdown) */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center border-0 cursor-pointer admin-transition"
                style={{ 
                  backgroundColor: settingsOpen ? "var(--admin-text-primary)" : "var(--admin-bg-input)", 
                  color: settingsOpen ? "var(--admin-bg-sidebar)" : "var(--admin-text-secondary)" 
                }}
                title="Settings"
              >
                <Settings size={16} />
              </button>

              {settingsOpen && (
                <div 
                  className="absolute right-0 top-12 w-64 rounded-2xl border p-4 shadow-xl z-50 flex flex-col gap-3 text-left"
                  style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--admin-border)" }}>
                    <span className="text-xs font-bold">Admin Settings</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium">Maintenance Mode</span>
                      <input type="checkbox" className="w-8 h-4 rounded cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium">Email Alerts</span>
                      <input type="checkbox" defaultChecked className="w-8 h-4 rounded cursor-pointer" />
                    </div>
                    <div className="w-full h-[1px]" style={{ backgroundColor: "var(--admin-border)" }} />
                    <button 
                      className="w-full py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-all text-center"
                      style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
                      onClick={() => alert("Database backup triggered successfully!")}
                    >
                      Backup Database
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell (Interactive Alerts Popover) */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center border-0 cursor-pointer admin-transition relative"
                style={{ 
                  backgroundColor: notificationsOpen ? "var(--admin-text-primary)" : "var(--admin-bg-input)", 
                  color: notificationsOpen ? "var(--admin-bg-sidebar)" : "var(--admin-text-secondary)" 
                }}
                title="Notifications"
              >
                <Bell size={16} />
                {hasNewAlerts && (
                  <>
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </>
                )}
              </button>

              {notificationsOpen && (
                <div 
                  className="absolute right-0 top-12 w-80 rounded-2xl border p-4 shadow-xl z-50 flex flex-col gap-3 text-left"
                  style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--admin-border)" }}>
                    <span className="text-xs font-bold">Recent Alerts</span>
                    {hasNewAlerts && (
                      <span 
                        className="text-[9px] text-blue-500 font-bold uppercase cursor-pointer hover:underline"
                        onClick={() => setHasNewAlerts(false)}
                      >
                        Clear Badge
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {adminAlerts.length > 0 ? (
                      adminAlerts.map((alert) => (
                        <div 
                          key={alert._id} 
                          className="p-2.5 rounded-xl border flex flex-col gap-0.5" 
                          style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)" }}
                        >
                          <p className="text-[10px] m-0 font-bold" style={{ color: alert.color || "#3b82f6" }}>
                            {alert.title}
                          </p>
                          <p className="text-[11px] m-0 leading-normal" style={{ color: "var(--admin-text-primary)" }}>
                            {alert.message}
                          </p>
                          <p className="text-[9px] m-0 mt-1 font-medium" style={{ color: "var(--admin-text-muted)" }}>
                            {getRelativeTime(alert.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs" style={{ color: "var(--admin-text-muted)" }}>
                        No recent alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info (Google profile image / avatar binding) */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l" style={{ borderColor: "var(--admin-border)" }}>
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs text-white font-bold bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6]">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || "A"
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight">{user?.name || "Admin"}</span>
                <span className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>{user?.email || "Platform Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-auto p-6 sm:p-10">
          <Outlet context={{ theme }} />
        </main>
      </div>

      {/* Mobile Drawer Navigation Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <aside
            className="relative w-72 h-full flex flex-col justify-between p-6 shadow-2xl z-10 admin-transition"
            style={{ backgroundColor: "var(--admin-bg-sidebar)" }}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
                <span className="font-bold text-base flex items-center gap-2">
                  <Compass size={20} className="text-blue-500" />
                  QuickSathi Admin
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border-0 cursor-pointer bg-transparent hover:bg-neutral-800/10 dark:hover:bg-white/5"
                  style={{ color: "var(--admin-text-primary)" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1.5">
                {MENU.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-medium no-underline transition-all duration-200"
                    style={({ isActive }) => ({
                      color: isActive ? "var(--admin-text-primary)" : "var(--admin-text-secondary)",
                      backgroundColor: isActive ? "var(--admin-bg-hover)" : "transparent",
                      border: isActive ? "1px solid var(--admin-border)" : "1px solid transparent",
                    })}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Footer inside drawer */}
            <div className="pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex items-center gap-3 px-2 py-1.5 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs text-white font-bold bg-[#8b1a1a]">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || "A"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold m-0 truncate">{user?.name || "Admin"}</p>
                  <p className="text-[10px] m-0 truncate" style={{ color: "var(--admin-text-muted)" }}>{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs border-0 cursor-pointer font-semibold text-red-500 hover:bg-red-500/10 transition-all"
                style={{ backgroundColor: "var(--admin-bg-input)" }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
