import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Smartphone } from "lucide-react";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle, sendOtp, verifyOtp, updateProfile, providerLogin, providerLoginWithGoogle } = useAuth();
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
  const [profileData, setProfileData] = useState({ name: "", email: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isProviderMode) {
        // Provider login
        await providerLogin(formData.email, formData.password);
        navigate("/provider/dashboard");
        return;
      }

      if (isSignup) {
        if (!formData.name.trim()) throw new Error("Name is required");
        if (formData.password.length < 6) throw new Error("Password must be at least 6 characters");
        await register(formData.name, formData.email, formData.password, formData.phone);
      } else {
        await login(formData.email, formData.password);
      }
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
      await updateProfile({ name: profileData.name.trim(), email: profileData.email.trim() || undefined });
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
    if (isSignup) return "Create your account";
    if (redirectTo === "/admin") return "Admin Sign In";
    return "Welcome back";
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    backgroundColor: "var(--color-bg-white)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-dark)",
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Left: decorative panel — hidden on mobile */}
      <div
        className="hidden lg:flex flex-col justify-end w-1/2 relative overflow-hidden"
        style={{ backgroundColor: "#0739a8" }}
      >
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
          alt="QuickSathi"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,57,168,0.95) 20%, rgba(11,79,216,0.5) 100%)" }} />
        <div className="relative z-10 p-12 pb-16">
          <h2
            className="text-white font-normal leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 3.5vw, 52px)" }}
          >
            {isProviderMode
              ? "Grow your business with QuickSathi"
              : "Your one-stop platform for every service need"}
          </h2>
          <p className="text-white/80 text-lg" style={{ fontFamily: "var(--font-body)", maxWidth: "400px" }}>
            {isProviderMode
              ? "Login to manage your services, track bookings, and reach thousands of customers."
              : "From weddings to car rentals to security — QuickSathi brings everything together."}
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="w-full max-w-md">
          {/* Brand */}
          <Link to="/" className="no-underline flex items-center gap-2 mb-2">
            <h1
              className="text-3xl font-bold m-0"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}
            >
              QuickSathi
            </h1>
          </Link>

          {/* Provider mode badge */}
          {isProviderMode && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--color-primary-soft)",
                color: "var(--color-primary)",
                border: "1px solid rgba(11,79,216,0.2)",
              }}
            >
              🏢 Provider Portal
            </div>
          )}

          <p className="text-lg mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            {getTitle()}
          </p>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm mb-6"
              style={{
                backgroundColor: "rgba(220,38,38,0.08)",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.15)",
                fontFamily: "var(--font-body)",
              }}
            >
              {error}
            </div>
          )}

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" />

          {/* ── COMPLETE PROFILE (after phone OTP for new users) ── */}
          {showCompleteProfile ? (
            <>
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "#22c55e" }}>
                  ✓ Phone verified! Just add your name and email to get started.
                </p>
              </div>

              <form onSubmit={handleCompleteProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
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
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => { setProfileData((p) => ({ ...p, email: e.target.value })); setError(""); }}
                    placeholder="you@example.com"
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p className="text-[10px] mt-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                    We'll use this for booking confirmations & receipts
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01] mt-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Saving..." : "Continue →"}
                </button>
              </form>
            </>
          ) : phoneMode && !isProviderMode ? (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setError(""); }}
                      placeholder="+91 98765 43210"
                      required
                      className={inputClass}
                      style={{ ...inputStyle, fontSize: "16px", letterSpacing: "0.5px" }}
                    />
                    <p className="text-xs mt-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                      Enter with country code (e.g. +91 for India)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01] mt-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-primary)",
                      color: "#ffffff",
                      boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="text-center mb-2">
                    <p className="text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                      We sent a 6-digit code to <strong style={{ color: "var(--color-text-dark)" }}>{phoneNumber}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
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
                      style={{ ...inputStyle, fontSize: "24px", letterSpacing: "12px", textAlign: "center", fontWeight: 700 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01] mt-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-primary)",
                      color: "#ffffff",
                      boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    className="text-xs font-semibold text-center bg-transparent border-0 cursor-pointer underline"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
                  >
                    Change phone number
                  </button>
                </form>
              )}

              {/* Back to email mode */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
                <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
              </div>

              <button
                onClick={() => { setPhoneMode(false); setOtpSent(false); setOtp(""); setError(""); }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-bg-white)",
                  color: "var(--color-text-dark)",
                  borderColor: "var(--color-border)",
                }}
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
                  className="block w-full text-center px-6 py-3 rounded-2xl text-sm font-semibold no-underline border transition-all duration-200 hover:shadow-lg mb-6"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "transparent",
                    color: "var(--color-primary)",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  📝 Register as a New Provider
                </Link>
              )}

              {/* Google Sign-In */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg mb-3"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-bg-white)",
                  color: "var(--color-text-dark)",
                  borderColor: "var(--color-border)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
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
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg mb-6"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-bg-white)",
                    color: "var(--color-text-dark)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <Smartphone size={18} />
                  Continue with Phone
                </button>
              )}

              {isProviderMode && <div className="mb-3" />}

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
                <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {isSignup && !isProviderMode && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {isSignup && !isProviderMode && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01] mt-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Please wait..." : isProviderMode ? "Sign In as Provider" : isSignup ? "Create Account" : "Sign In"}
                </button>
              </form>

              {/* Toggle sign up / sign in (only for user mode) */}
              {!isProviderMode && (
                <p className="text-center text-sm mt-6" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => { setIsSignup(!isSignup); setError(""); }}
                    className="font-semibold border-0 bg-transparent cursor-pointer underline"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}
                  >
                    {isSignup ? "Sign In" : "Create Account"}
                  </button>
                </p>
              )}
            </>
          )}

          {/* Mode switcher */}
          <div className="text-center mt-6 pt-4 border-t flex flex-col gap-3" style={{ borderColor: "var(--color-border)" }}>
            <Link
              to={isProviderMode ? "/login" : "/login?mode=provider"}
              className="text-xs font-semibold no-underline uppercase tracking-wider transition-all duration-200 hover:opacity-75"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
              }}
              onClick={() => { setError(""); setPhoneMode(false); setOtpSent(false); }}
            >
              {isProviderMode ? "← Back to User Login" : "🏢 Login as Provider"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
