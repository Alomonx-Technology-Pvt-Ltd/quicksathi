import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Smartphone } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, sendOtp, verifyOtp, updateProfile, providerLogin, providerLoginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const loginMode = searchParams.get("mode"); // "provider" or null

  const isProviderMode = loginMode === "provider";

  // Phone OTP state
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Complete profile state (for new phone users)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email format
    if (!formData.email.trim()) {
      setError("Email address is required.");
      setLoading(false);
      return;
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      if (isProviderMode) {
        // Provider login
        await providerLogin(formData.email, formData.password);
        navigate("/provider/dashboard");
        return;
      }

      await login(formData.email, formData.password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      if (isProviderMode) {
        await providerLoginWithGoogle();
        navigate("/provider/dashboard");
      } else {
        await loginWithGoogle();
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP handlers ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number with country code (e.g. +91XXXXXXXXXX)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendOtp(phoneNumber);
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loggedInUser = await verifyOtp(otp);
      // Check if this is a new user (name equals phone number = newly created)
      if (loggedInUser && loggedInUser.name && loggedInUser.name.startsWith("+")) {
        setShowCompleteProfile(true);
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Email is identity and can't be set from the profile form (verify it by signing in with Google).
      await updateProfile({ name: profileData.name.trim() });
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (showCompleteProfile) return "Complete your profile";
    if (phoneMode) return otpSent ? "Enter verification code" : "Sign in with Phone";
    if (isProviderMode) return "Provider Sign In";
    if (redirectTo === "/admin") return "Admin Sign In";
    return "Welcome back";
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--color-text-dark)",
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex overflow-hidden" style={{ backgroundColor: "var(--color-bg, #f8fafc)" }}>
      {/* Left: decorative lifestyle hero panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-slate-950 select-none">
        {/* Crisp, high-clarity background image */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=85&w=2070&auto=format&fit=crop"
          alt="TiptoBook Lifestyle"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 transition-transform duration-700"
        />

        {/* Elegant subtle dark gradient overlay: allows full photo visibility in upper/mid while providing crisp text contrast at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.12) 35%, rgba(10,20,45,0.72) 70%, rgba(8,15,38,0.94) 100%)",
          }}
        />

        {/* Top brand bar */}
        <div className="relative z-10 p-8 xl:p-10 flex items-center justify-between">
          <Link to="/" className="no-underline flex items-center gap-2">
            <BrandLogo size={36} isDark={true} />
          </Link>
          <span className="text-xs font-medium tracking-wide text-white/85 drop-shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Verified Doorstep Services
          </span>
        </div>

        {/* Bottom hero content */}
        <div className="relative z-10 p-8 xl:p-10 pb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-2 drop-shadow-sm">
            {isProviderMode ? "Partner Network" : "All-in-One Booking Platform"}
          </p>

          <h2
            className="text-white font-bold leading-tight mb-2.5 drop-shadow-md"
            style={{ fontFamily: "var(--font-display, inherit)", fontSize: "clamp(24px, 2.3vw, 38px)" }}
          >
            {isProviderMode
              ? "Grow your business with TiptoBook"
              : "Your one-stop platform for every service need"}
          </h2>

          <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4 max-w-md drop-shadow">
            {isProviderMode
              ? "Sign in to manage services, track bookings, and reach thousands of customers in your city."
              : "From weddings and car rentals to AC repair and turnkey interior construction — certified specialists at transparent rates."}
          </p>

          {/* Clean trust highlights — pure typography, no pill/button styling */}
          <div className="flex flex-wrap items-center gap-3 xl:gap-5 pt-3.5 border-t border-white/20 text-xs text-white/90">
            <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
              <span className="text-emerald-400 font-bold">✓</span> 100% Background Checked
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:inline-block" />
            <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
              <span className="text-amber-300 font-bold">⚡</span> Upfront Transparent Pricing
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:inline-block" />
            <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
              <span className="text-yellow-400 font-bold">★</span> 4.8+ Rated Specialists
            </span>
          </div>
        </div>
      </div>

      {/* Right: form — compact & fits screen without scrolling */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto max-h-screen">
        <div className="w-full max-w-sm sm:max-w-md my-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="no-underline inline-flex items-center">
              <BrandLogo size={36} />
            </Link>
            {isProviderMode && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "var(--color-primary-soft, #eff6ff)",
                  color: "var(--color-primary, #2563eb)",
                  border: "1px solid rgba(37,99,235,0.2)",
                }}
              >
                🏢 Provider Portal
              </div>
            )}
          </div>

          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 m-0">
              {getTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 m-0">
              {isProviderMode
                ? "Access your provider console and live leads"
                : "Welcome back! Sign in to manage your bookings and profile"}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="px-3.5 py-2 rounded-xl text-xs mb-3 flex items-start gap-2"
              style={{
                backgroundColor: "rgba(220,38,38,0.08)",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <span className="shrink-0 font-bold">⚠️</span>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" />

          {/* ── COMPLETE PROFILE (after phone OTP for new users) ── */}
          {showCompleteProfile ? (
            <>
              <div className="rounded-xl p-3 mb-3 bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-700 m-0 font-medium">
                  ✓ Phone verified! Just add your name to get started.
                </p>
              </div>

              <form onSubmit={handleCompleteProfile} className="flex flex-col gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => { setProfileData((p) => ({ ...p, name: e.target.value })); setError(""); }}
                    placeholder="Enter your full name"
                    required
                    autoFocus
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold border-0 cursor-pointer transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.99] mt-1"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Saving..." : "Continue →"}
                </button>
              </form>
            </>
          ) : phoneMode && !isProviderMode ? (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setError(""); }}
                      placeholder="+91 98765 43210"
                      required
                      className={inputClass}
                      style={{ ...inputStyle, fontSize: "15px", letterSpacing: "0.5px" }}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 mb-0">
                      Enter with country code (e.g. +91 for India)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold border-0 cursor-pointer transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.99] mt-1"
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-2.5">
                  <div className="text-center mb-1">
                    <p className="text-xs text-gray-600 m-0">
                      We sent a 6-digit code to <strong className="text-gray-900">{phoneNumber}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1 text-center">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                      placeholder="• • • • • •"
                      required
                      autoFocus
                      className={inputClass}
                      style={{ ...inputStyle, fontSize: "20px", letterSpacing: "8px", textAlign: "center", fontWeight: 700 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold border-0 cursor-pointer transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.99] mt-1"
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    className="text-xs font-medium text-center bg-transparent border-0 cursor-pointer underline text-gray-500 hover:text-gray-800 mt-1"
                  >
                    Change phone number
                  </button>
                </form>
              )}

              {/* Back to email mode */}
              <div className="flex items-center gap-3 my-2.5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={() => { setPhoneMode(false); setOtpSent(false); setOtp(""); setError(""); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
              >
                ✉️ Continue with Email
              </button>
            </>
          ) : (
            /* ── STANDARD EMAIL/GOOGLE MODE ── */
            <>
              {/* Provider mode — show register as provider link */}
              {isProviderMode && (
                <Link
                  to="/provider/onboarding"
                  className="block w-full text-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold no-underline border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all mb-3"
                >
                  📝 Register as a New Provider
                </Link>
              )}

              {/* Google Sign-In */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm mb-2"
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Phone Sign-In */}
              {!isProviderMode && (
                <button
                  onClick={() => { setPhoneMode(true); setError(""); }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm mb-2"
                >
                  <Smartphone size={16} />
                  Continue with Phone
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-2.5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>



                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold border-0 cursor-pointer transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.99] mt-1"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Please wait..." : isProviderMode ? "Sign In as Provider" : "Sign In with Email"}
                </button>
              </form>

              {/* New accounts: Google or phone above (they prove you own the email/number). */}
              {!isProviderMode && (
                <p className="text-center text-xs sm:text-sm mt-3 text-gray-600 mb-0">
                  New to TiptoBook? Continue with Google or Phone above to create your account.
                </p>
              )}
            </>
          )}

          {/* Mode switcher */}
          <div className="text-center mt-3 pt-2.5 border-t border-gray-100 flex flex-col gap-1.5">
            <Link
              to={isProviderMode ? "/login" : "/login?mode=provider"}
              className="text-[11px] font-semibold no-underline uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => { setError(""); setPhoneMode(false); setOtpSent(false); }}
            >
              {isProviderMode ? "← Back to User Sign In" : "🏢 Sign In as Provider"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
