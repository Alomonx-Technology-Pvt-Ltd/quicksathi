import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { User, MapPin, Phone, Mail, Save, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../config/api";

const Profile = () => {
  const { user, updateProfile } = useAuth();
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

  // Fetch full profile from backend on mount
  useEffect(() => {
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
  }, [user]);

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

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    backgroundColor: "var(--color-bg-white)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-dark)",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm no-underline mb-6 transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Profile Header Card */}
        <div className="rounded-2xl border p-6 sm:p-8 mb-6 relative overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, var(--color-primary), #e85c2a)" }} />

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "var(--color-primary)", boxShadow: "0 4px 15px rgba(139,26,26,0.25)" }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                formData.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold m-0 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                {formData.name || "User"}
              </h1>
              <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                {formData.email || formData.phone || "No contact info"}
              </p>
              {user?.createdAt && (
                <p className="text-[10px] m-0 mt-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                  Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "var(--font-body)" }}>
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm mb-6"
            style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "var(--font-body)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Details */}
          <div className="rounded-2xl border p-6 sm:p-8 mb-6"
            style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-2 mb-6">
              <User size={18} style={{ color: "var(--color-primary)" }} />
              <h2 className="text-sm font-bold uppercase tracking-wider m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                Personal Details
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Full Name *
                </label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required
                  className={inputClass} style={inputStyle} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    <Mail size={12} className="inline mr-1" style={{ verticalAlign: "middle" }} />
                    Email
                  </label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    <Phone size={12} className="inline mr-1" style={{ verticalAlign: "middle" }} />
                    Phone
                  </label>
                  <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210"
                    className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border p-6 sm:p-8 mb-6"
            style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={18} style={{ color: "var(--color-primary)" }} />
              <h2 className="text-sm font-bold uppercase tracking-wider m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                Saved Address
              </h2>
            </div>
            <p className="text-xs mb-6" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", marginLeft: "26px" }}>
              This address will be auto-filled when you book services
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Street Address
                </label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="House no, Building, Street"
                  className={inputClass} style={inputStyle} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    City
                  </label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="Patna"
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    State
                  </label>
                  <input name="state" value={formData.state} onChange={handleChange} placeholder="Bihar"
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    Pincode
                  </label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="800001" maxLength={6}
                    className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.005] flex items-center justify-center gap-2"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              boxShadow: "0 6px 20px rgba(139,26,26,0.25)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
