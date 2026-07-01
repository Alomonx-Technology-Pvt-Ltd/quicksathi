import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        if (!formData.name.trim()) throw new Error("Name is required");
        if (formData.password.length < 6) throw new Error("Password must be at least 6 characters");
        await register(formData.name, formData.email, formData.password, formData.phone);
      } else {
        await login(formData.email, formData.password);
      }
      navigate("/");
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
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Left: decorative panel — hidden on mobile */}
      <div
        className="hidden lg:flex flex-col justify-end w-1/2 relative overflow-hidden"
        style={{ backgroundColor: "#1a1040" }}
      >
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
          alt="QuickSathi"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,16,64,0.95) 20%, rgba(26,16,64,0.4) 100%)" }} />
        <div className="relative z-10 p-12 pb-16">
          <h2
            className="text-white font-normal leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 3.5vw, 52px)" }}
          >
            Your one-stop platform for every service need
          </h2>
          <p className="text-white/60 text-lg" style={{ fontFamily: "var(--font-body)", maxWidth: "400px" }}>
            From weddings to car rentals to security — QuickSathi brings everything together.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="w-full max-w-md">
          {/* Brand */}
          <Link to="/" className="no-underline">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              QuickSathi
            </h1>
          </Link>
          <p className="text-lg mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            {isSignup ? "Create your account" : "Welcome back"}
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

          {/* Google Sign-In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg mb-6"
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
            {isSignup && (
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
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-bg-white)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-dark)",
                  }}
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
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-bg-white)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-dark)",
                }}
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
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-bg-white)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-dark)",
                }}
              />
            </div>

            {isSignup && (
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
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-bg-white)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-dark)",
                  }}
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
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle */}
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
        </div>
      </div>
    </div>
  );
};

export default Login;
