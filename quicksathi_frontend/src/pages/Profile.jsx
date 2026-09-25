import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import api from "../config/api";

const Profile = () => {
  const { user, updateProfile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch full profile from backend on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const u = data.user;
        setFormData({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
          city: u.city || "",
          state: u.state || "",
          pincode: u.pincode || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fallback to context user
        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            state: user.state || "",
            pincode: user.pincode || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile(formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    backgroundColor: "var(--color-bg-white)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-dark)",
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center pt-20"
        style={{ backgroundColor: "var(--color-bg)" }}
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
  }

  // ── GUEST / UNREGISTERED USER ACCOUNT VIEW ──
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen pt-20 sm:pt-24 pb-24 px-4 sm:px-6"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="max-w-md mx-auto">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm no-underline mb-6 transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Welcome Card */}
          <div
            className="rounded-3xl border p-6 sm:p-8 text-center mb-6 relative overflow-hidden"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{
                background: "linear-gradient(90deg, var(--color-primary), #ff6b00)",
              }}
            />

            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #ff6b00 100%)",
                boxShadow: "0 8px 24px rgba(255,107,0,0.25)",
              }}
            >
              <User size={36} strokeWidth={1.75} />
            </div>

            <h1
              className="text-xl sm:text-2xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-dark)",
              }}
            >
              Account & Profile
            </h1>
            <p
              className="text-xs sm:text-sm mb-6 leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              Sign in or create your account to track bookings, save your address for faster booking, and manage your services.
            </p>

            <Link
              to="/login?redirect=/account"
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-semibold no-underline flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
              style={{
                fontFamily: "var(--font-body)",
                background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                color: "#ffffff",
                boxShadow: "0 6px 20px rgba(255,107,0,0.3)",
              }}
            >
              Sign In / Sign Up
            </Link>
          </div>

          {/* Quick Options */}
          <div
            className="rounded-2xl border overflow-hidden mb-6"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
            }}
          >
            <Link
              to="/login?redirect=/my-bookings"
              className="flex items-center justify-between p-4 border-b no-underline transition-colors hover:bg-slate-50"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(11,79,216,0.08)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    My Bookings
                  </p>
                  <p
                    className="text-xs m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Sign in to view your bookings & history
                  </p>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
            </Link>

            <Link
              to="/contact"
              className="flex items-center justify-between p-4 border-b no-underline transition-colors hover:bg-slate-50"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.08)",
                    color: "#10b981",
                  }}
                >
                  <HelpCircle size={18} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    Help & Support
                  </p>
                  <p
                    className="text-xs m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Get instant assistance or contact our team
                  </p>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
            </Link>

            <Link
              to="/provider/onboarding"
              className="flex items-center justify-between p-4 border-b no-underline transition-colors hover:bg-slate-50"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,107,0,0.08)",
                    color: "#ff6b00",
                  }}
                >
                  <Briefcase size={18} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    Become a Partner
                  </p>
                  <p
                    className="text-xs m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    List your services and grow your business
                  </p>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
            </Link>

            <Link
              to="/about-us"
              className="flex items-center justify-between p-4 no-underline transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(100,116,139,0.08)",
                    color: "#64748b",
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    About TiptoBook
                  </p>
                  <p
                    className="text-xs m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Safe, verified, hassle-free services
                  </p>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED USER ACCOUNT & PROFILE VIEW ──
  return (
    <div
      className="min-h-screen pt-20 sm:pt-24 pb-24 px-4 sm:px-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm no-underline mb-6 transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Profile Header Card */}
        <div
          className="rounded-3xl border p-6 sm:p-8 mb-6 relative overflow-hidden"
          style={{
            backgroundColor: "var(--color-bg-white)",
            borderColor: "var(--color-border)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          }}
        >
          {/* Subtle gradient accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), #ff6b00)",
            }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, #ff6b00 100%)",
                  boxShadow: "0 6px 20px rgba(255,107,0,0.25)",
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  formData.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    className="text-xl sm:text-2xl font-semibold m-0"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    {formData.name || user?.name || "User"}
                  </h1>
                  {user?.role && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor:
                          user.role === "admin"
                            ? "rgba(220,38,38,0.1)"
                            : user.role === "provider"
                            ? "rgba(255,107,0,0.12)"
                            : "rgba(11,79,216,0.1)",
                        color:
                          user.role === "admin"
                            ? "#dc2626"
                            : user.role === "provider"
                            ? "#ff6b00"
                            : "var(--color-primary)",
                      }}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs m-0 mt-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {formData.email || user?.email || formData.phone || "No contact email"}
                </p>
                {user?.createdAt && (
                  <p
                    className="text-[10px] m-0 mt-1"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Logout Button in Header */}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-0 cursor-pointer self-start sm:self-center transition-all hover:bg-red-50 text-red-600 bg-red-50/50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Shortcuts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Link
            to="/my-bookings"
            className="flex items-center gap-3 p-3.5 rounded-2xl border no-underline transition-all hover:shadow-md hover:border-blue-200"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(11,79,216,0.08)",
                color: "var(--color-primary)",
              }}
            >
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <span
                className="text-xs font-bold block truncate"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dark)",
                }}
              >
                My Bookings
              </span>
              <span
                className="text-[10px] text-gray-500 block truncate"
                style={{ fontFamily: "var(--font-body)" }}
              >
                View status & history
              </span>
            </div>
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-3 p-3.5 rounded-2xl border no-underline transition-all hover:shadow-md hover:border-emerald-200"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(16,185,129,0.08)",
                color: "#10b981",
              }}
            >
              <HelpCircle size={18} />
            </div>
            <div className="min-w-0">
              <span
                className="text-xs font-bold block truncate"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dark)",
                }}
              >
                Help & Contact
              </span>
              <span
                className="text-[10px] text-gray-500 block truncate"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Support 24/7
              </span>
            </div>
          </Link>

          {user?.role === "provider" ? (
            <Link
              to="/provider/dashboard"
              className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3.5 rounded-2xl border no-underline transition-all hover:shadow-md hover:border-orange-200"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(255,107,0,0.08)",
                  color: "#ff6b00",
                }}
              >
                <Briefcase size={18} />
              </div>
              <div className="min-w-0">
                <span
                  className="text-xs font-bold block truncate"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  Provider Hub
                </span>
                <span
                  className="text-[10px] text-gray-500 block truncate"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Manage services
                </span>
              </div>
            </Link>
          ) : user?.role === "admin" ? (
            <Link
              to="/admin"
              className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3.5 rounded-2xl border no-underline transition-all hover:shadow-md hover:border-red-200"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(220,38,38,0.08)",
                  color: "#dc2626",
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <span
                  className="text-xs font-bold block truncate"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  Admin Panel
                </span>
                <span
                  className="text-[10px] text-gray-500 block truncate"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Manage all
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/provider/onboarding"
              className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3.5 rounded-2xl border no-underline transition-all hover:shadow-md hover:border-orange-200"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(255,107,0,0.08)",
                  color: "#ff6b00",
                }}
              >
                <Briefcase size={18} />
              </div>
              <div className="min-w-0">
                <span
                  className="text-xs font-bold block truncate"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  Partner With Us
                </span>
                <span
                  className="text-[10px] text-gray-500 block truncate"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Grow your business
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Success/Error messages */}
        {success && (
          <div
            className="px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2"
            style={{
              backgroundColor: "rgba(34,197,94,0.08)",
              color: "#16a34a",
              border: "1px solid rgba(34,197,94,0.2)",
              fontFamily: "var(--font-body)",
            }}
          >
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
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

        <form onSubmit={handleSubmit}>
          {/* Personal Details */}
          <div
            className="rounded-2xl border p-6 sm:p-8 mb-6"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <User size={18} style={{ color: "var(--color-primary)" }} />
              <h2
                className="text-sm font-bold uppercase tracking-wider m-0"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dark)",
                }}
              >
                Personal Details
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    <Mail
                      size={12}
                      className="inline mr-1"
                      style={{ verticalAlign: "middle" }}
                    />
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    <Phone
                      size={12}
                      className="inline mr-1"
                      style={{ verticalAlign: "middle" }}
                    />
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div
            className="rounded-2xl border p-6 sm:p-8 mb-6"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={18} style={{ color: "var(--color-primary)" }} />
              <h2
                className="text-sm font-bold uppercase tracking-wider m-0"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dark)",
                }}
              >
                Saved Address
              </h2>
            </div>
            <p
              className="text-xs mb-6"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
                marginLeft: "26px",
              }}
            >
              This address will be auto-filled when you book services
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  Street Address / House / Flat
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House no, Building, Street, Landmark"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    City
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Patna"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Bihar"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="800001"
                    maxLength={6}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.005] flex items-center justify-center gap-2 mb-4"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              boxShadow: "0 6px 20px rgba(11,79,216,0.25)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>

        {/* Sign Out Card */}
        <div
          className="rounded-2xl border p-4 flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-bg-white)",
            borderColor: "var(--color-border)",
          }}
        >
          <div>
            <span
              className="text-xs font-bold block"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-dark)",
              }}
            >
              Signing out?
            </span>
            <span
              className="text-[10px] text-gray-500 block"
              style={{ fontFamily: "var(--font-body)" }}
            >
              You can sign back in anytime
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 cursor-pointer transition-colors hover:bg-red-50 text-red-600 bg-transparent flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
