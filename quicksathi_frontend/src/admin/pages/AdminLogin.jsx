import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  ArrowLeft,
  KeyRound,
  UserX,
  LogOut,
} from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { adminLogin, adminLoginWithGoogle, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Admin Theme handling
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "dark");

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
    document.documentElement.setAttribute("data-admin-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Check URL error query param if redirected
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error") === "unauthorized") {
      setError("Access denied. The current account does not have administrator privileges.");
    }
  }, [location.search]);

  // If already authenticated as admin, navigate to /admin
  useEffect(() => {
    if (isAdmin) {
      const from = location.state?.from?.pathname || "/admin";
      // Prevent loop if from was /admin/login
      const target = from === "/admin/login" ? "/admin" : from;
      navigate(target, { replace: true });
    }
  }, [isAdmin, navigate, location]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loggedUser = await adminLogin(email.trim(), password);
      if (loggedUser?.role === "admin") {
        const from = location.state?.from?.pathname || "/admin";
        navigate(from === "/admin/login" ? "/admin" : from, { replace: true });
      } else {
        setError("Access denied. This account does not have administrator privileges.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid administrator credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const loggedUser = await adminLoginWithGoogle();
      if (loggedUser?.role === "admin") {
        const from = location.state?.from?.pathname || "/admin";
        navigate(from === "/admin/login" ? "/admin" : from, { replace: true });
      } else {
        setError("Access denied. The Google account is not authorized as an administrator.");
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        // User voluntarily dismissed popup
        setGoogleLoading(false);
        return;
      }
      setError(err.response?.data?.message || err.message || "Google administrator sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignOutNonAdmin = async () => {
    try {
      await logout();
      setError("");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between admin-transition relative overflow-hidden"
      data-admin-theme={theme}
      style={{
        backgroundColor: "var(--admin-bg-main)",
        color: "var(--admin-text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Background Decorative Ambient Glows */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-25"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: "var(--color-accent)" }}
      />

      {/* Top Bar Navigation */}
      <header className="w-full px-6 py-6 sm:px-12 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div
            className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border"
            style={{ borderColor: "var(--admin-border)" }}
          >
            <img src="/logo.png" alt="QuickSathi" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span
              className="text-base font-bold tracking-tight block leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--admin-text-primary)" }}
            >
              QuickSathi
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-500 block">
              Admin Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl flex items-center justify-center border cursor-pointer admin-transition"
            style={{
              backgroundColor: "var(--admin-bg-card)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle admin theme"
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-indigo-600" />
            )}
          </button>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold no-underline border transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--admin-bg-card)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-secondary)",
            }}
          >
            <ArrowLeft size={14} />
            <span>QuickSathi Home</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div
          className="w-full max-w-md rounded-3xl p-8 sm:p-10 border shadow-2xl backdrop-blur-xl relative admin-transition"
          style={{
            backgroundColor: theme === "dark" ? "rgba(19, 19, 22, 0.85)" : "rgba(255, 255, 255, 0.92)",
            borderColor: "var(--admin-border)",
          }}
        >
          {/* Header Badge & Title */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                backgroundColor: "rgba(11, 79, 216, 0.12)",
                color: "var(--color-primary-light)",
                border: "1px solid rgba(11, 79, 216, 0.25)",
              }}
            >
              <Shield size={13} />
              <span>Restricted Access • Administrator Authentication</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--admin-text-primary)" }}
            >
              Admin Sign In
            </h1>
            <p className="text-xs sm:text-sm m-0" style={{ color: "var(--admin-text-muted)" }}>
              Authenticate with your administrative account to access the dashboard.
            </p>
          </div>

          {/* Current Non-Admin User Alert */}
          {user && !isAdmin && (
            <div
              className="p-4 rounded-2xl mb-6 border flex flex-col gap-2.5"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                borderColor: "rgba(245, 158, 11, 0.25)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <UserX size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-500 m-0">Non-Admin Account Detected</p>
                  <p className="text-xs m-0 mt-0.5 text-neutral-300 leading-snug break-all">
                    Currently signed in as <strong className="text-white">{user.email}</strong>. This account does not have administrator privileges.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOutNonAdmin}
                className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer hover:bg-amber-500/20 transition-all text-amber-400 bg-transparent"
                style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
              >
                <LogOut size={13} />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              className="p-4 rounded-2xl mb-6 border flex items-start gap-3 animate-fade-in"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderColor: "rgba(239, 68, 68, 0.25)",
                color: "#f87171",
              }}
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm m-0 leading-relaxed font-medium">{error}</p>
            </div>
          )}

          {/* ── 1. DIRECT GOOGLE SIGN-IN ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] mb-5 disabled:opacity-50"
            style={{
              backgroundColor: "var(--admin-bg-card)",
              color: "var(--admin-text-primary)",
              borderColor: "var(--admin-border)",
            }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin border-blue-500" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--admin-border)" }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--admin-text-muted)" }}
            >
              or with email & password
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--admin-border)" }} />
          </div>

          {/* ── 2. EMAIL & PASSWORD LOGIN ── */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            {/* Email Field */}
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--admin-text-secondary)" }}
              >
                Admin Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--admin-text-muted)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@quicksathi.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none admin-transition transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    backgroundColor: "var(--admin-bg-input)",
                    borderColor: "var(--admin-border)",
                    color: "var(--admin-text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--admin-text-secondary)" }}
              >
                Admin Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--admin-text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl text-xs sm:text-sm border outline-none admin-transition transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    backgroundColor: "var(--admin-bg-input)",
                    borderColor: "var(--admin-border)",
                    color: "var(--admin-text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer p-0"
                  style={{ color: "var(--admin-text-muted)" }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                boxShadow: "0 4px 20px rgba(11, 79, 216, 0.35)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin border-white" />
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Sign In as Administrator</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-[11px] m-0" style={{ color: "var(--admin-text-muted)" }}>
              🔒 Protected by 256-bit encrypted authentication. All sign-in attempts are logged for security.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs z-10" style={{ color: "var(--admin-text-muted)" }}>
        <p className="m-0">
          &copy; {new Date().getFullYear()} QuickSathi Management Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminLogin;
