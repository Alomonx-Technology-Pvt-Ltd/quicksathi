import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const STATUS_STYLES = {
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "⏳ Pending Review" },
  approved: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "✅ Approved" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "❌ Rejected" },
};

const ProviderDashboard = () => {
  const { user, providerProfile, logout } = useAuth();
  const [provider, setProvider] = useState(providerProfile);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "", shortDescription: "", fullDescription: "",
    startingPrice: "", priceUnit: "per service", serviceMode: "ON_SITE",
    tags: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providerRes, servicesRes] = await Promise.all([
          api.get("/providers/me"),
          api.get("/providers/services").catch(() => ({ data: [] })),
        ]);
        setProvider(providerRes.data);
        setServices(servicesRes.data);
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

  const handleSubmitService = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const { data } = await api.post("/providers/services", {
        ...formData,
        startingPrice: Number(formData.startingPrice) || 0,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setServices((prev) => [data, ...prev]);
      setShowForm(false);
      setFormData({ name: "", shortDescription: "", fullDescription: "", startingPrice: "", priceUnit: "per service", serviceMode: "ON_SITE", tags: "" });
      setMessage("Service listing submitted for admin approval!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit service");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
      </div>
    );
  }

  const status = STATUS_STYLES[provider?.approvalStatus] || STATUS_STYLES.pending;
  const inputStyle = {
    fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)", color: "var(--color-text-dark)",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Header */}
      <header className="px-6 sm:px-10 h-16 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Link to="/" className="text-xl font-bold no-underline" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
          QuickSathi
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            {user?.name}
          </span>
          <button onClick={logout} className="px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all hover:opacity-80"
            style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", color: "#dc2626", backgroundColor: "transparent" }}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <h1 className="text-2xl font-normal mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
          Provider Dashboard
        </h1>
        <p className="text-sm mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
          Manage your profile and service listings.
        </p>

        {/* Provider Status Card */}
        <div className="rounded-2xl p-6 border mb-8" style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                {provider?.businessName}
              </h2>
              <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                {provider?.categoryName} · {provider?.businessType}
              </p>
            </div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{ backgroundColor: status.bg, color: status.color, fontFamily: "var(--font-body)" }}>
              {status.label}
            </span>
          </div>

          {provider?.approvalStatus === "rejected" && provider?.rejectionReason && (
            <div className="mt-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.06)", color: "#dc2626", fontFamily: "var(--font-body)" }}>
              <strong>Rejection reason:</strong> {provider.rejectionReason}
            </div>
          )}

          {provider?.approvalStatus === "pending" && (
            <p className="mt-4 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
              Your application is under review by our admin team. You'll be able to list services once approved.
            </p>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="px-4 py-3 rounded-xl text-sm mb-6" style={{
            backgroundColor: message.includes("Failed") ? "rgba(220,38,38,0.08)" : "rgba(34,197,94,0.08)",
            color: message.includes("Failed") ? "#dc2626" : "#22c55e",
            fontFamily: "var(--font-body)",
          }}>
            {message}
          </div>
        )}

        {/* Service Listings — only for approved providers */}
        {provider?.approvalStatus === "approved" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-normal m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                Your Service Listings
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all hover:opacity-90"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}
              >
                {showForm ? "Cancel" : "+ Request New Listing"}
              </button>
            </div>

            {/* New Service Form */}
            {showForm && (
              <form onSubmit={handleSubmitService} className="rounded-2xl p-6 border mb-8 flex flex-col gap-4"
                style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                <h3 className="text-base font-semibold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Request Service Listing
                </h3>
                <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                  Your listing will be reviewed by admin before it goes live on the website.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Service Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Premium Wedding Photography"
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Short Description *</label>
                  <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} required placeholder="Brief description"
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Full Description</label>
                  <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} rows={3} placeholder="Detailed description..."
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-y" style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Starting Price (₹) *</label>
                    <input name="startingPrice" type="number" value={formData.startingPrice} onChange={handleChange} required placeholder="e.g. 5000"
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Price Unit</label>
                    <select name="priceUnit" value={formData.priceUnit} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle}>
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
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Service Mode</label>
                    <select name="serviceMode" value={formData.serviceMode} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle}>
                      <option value="ON_SITE">On Site</option>
                      <option value="AT_HOME">At Home</option>
                      <option value="RENTAL">Rental</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Tags (comma separated)</label>
                    <input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. Wedding, Photo, HD"
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all hover:opacity-90 mt-2"
                  style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Submitting..." : "Submit for Admin Approval"}
                </button>
              </form>
            )}

            {/* Services list */}
            <div className="flex flex-col gap-4">
              {services.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border" style={{ borderColor: "var(--color-border)" }}>
                  <p className="text-3xl mb-3">📋</p>
                  <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    No service listings yet. Click "Request New Listing" to get started.
                  </p>
                </div>
              ) : (
                services.map((service) => {
                  const sStatus = STATUS_STYLES[service.approvalStatus] || STATUS_STYLES.pending;
                  return (
                    <div key={service._id} className="rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                      <div>
                        <h3 className="text-base font-semibold m-0 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                          {service.name}
                        </h3>
                        <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                          {service.shortDescription}
                        </p>
                        <p className="text-sm font-bold m-0 mt-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                          ₹{service.startingPrice?.toLocaleString()} / {service.priceUnit}
                        </p>
                        {service.rejectionReason && service.approvalStatus === "rejected" && (
                          <p className="text-xs mt-1 m-0" style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}>
                            Reason: {service.rejectionReason}
                          </p>
                        )}
                      </div>
                      <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: sStatus.bg, color: sStatus.color, fontFamily: "var(--font-body)" }}>
                        {sStatus.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
