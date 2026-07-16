import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import { Search } from "lucide-react";

const STATUS_STYLES = {
  pending: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pending Review" },
  approved: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Approved Partner" },
  rejected: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Rejected Listing" },
};

const AdminProviders = () => {
  const [filter, setFilter] = useState("all");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/providers");
      setProviders(data);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchProviders();
    });
  }, []);

  const handleAction = async (id, action) => {
    let reason = "";
    if (action === "reject") {
      reason = window.prompt("Enter rejection reason (optional):") || "";
      if (reason === null) return; // cancel clicked
    }

    setActioningId(id);
    try {
      if (action === "approve") {
        await api.patch(`/admin/providers/${id}/approve`);
        setProviders((prev) =>
          prev.map((p) => (p._id === id ? { ...p, approvalStatus: "approved" } : p))
        );
      } else {
        await api.patch(`/admin/providers/${id}/reject`, { reason });
        setProviders((prev) =>
          prev.map((p) => (p._id === id ? { ...p, approvalStatus: "rejected", rejectionReason: reason } : p))
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} provider:`, err);
      alert(err.response?.data?.message || `Failed to ${action} provider`);
    } finally {
      setActioningId(null);
    }
  };

  // Search and status filter
  const filtered = providers.filter((p) => {
    const matchesSearch =
      p.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return p.approvalStatus === filter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(255,255,255,0.06)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-xs text-muted" style={{ color: "rgba(255,255,255,0.3)" }}>Loading providers database...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Provider Approvals</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            Review business credentials, contact detail logs, and manage partner applications.
          </p>
        </div>

        {/* Stats Summary badge */}
        <div className="flex gap-4">
          <div className="px-5 py-2.5 rounded-2xl border flex flex-col items-center" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Pending Applications</span>
            <span className="text-lg font-bold text-amber-500 mt-0.5">
              {providers.filter((p) => p.approvalStatus === "pending").length}
            </span>
          </div>
        </div>
      </div>

      {/* Utilities Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by business, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-10 rounded-2xl border outline-none text-white text-sm"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          />
          <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30" />
        </div>

        {/* Filters pills */}
        <div className="flex gap-2 self-start sm:self-auto overflow-x-auto max-w-full">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer capitalize transition-all border"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: filter === f ? "var(--color-primary)" : "rgba(255,255,255,0.02)",
                color: filter === f ? "#fff" : "rgba(255,255,255,0.45)",
                borderColor: filter === f ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Stack List */}
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((provider) => {
            const style = STATUS_STYLES[provider.approvalStatus] || STATUS_STYLES.pending;
            return (
              <motion.div
                key={provider._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl p-6 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                      style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                      {provider.businessName ? provider.businessName[0].toUpperCase() : "P"}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>{provider.businessName}</h3>
                      <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>
                        Owned by {provider.user?.name || "Unnamed User"} · {provider.businessType || provider.categoryName || "Provider"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ml-1"
                      style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                      {style.label}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-xs mt-4 pt-3.5 border-t" style={{ borderColor: "rgba(255,255,255,0.04)", fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.4)" }}>
                    <span className="flex items-center gap-1.5">📧 {provider.email || provider.user?.email || "—"}</span>
                    <span className="flex items-center gap-1.5">📞 {provider.phone || provider.user?.phone || "—"}</span>
                    <span className="flex items-center gap-1.5">📍 {provider.location?.city || "Unknown City"}</span>
                    <span className="flex items-center gap-1.5">⏱️ {provider.experience || "N/A"} Experience</span>
                    <span className="flex items-center gap-1.5">📅 {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>

                  {/* Documents & Rejection reason */}
                  {provider.approvalStatus === "rejected" && provider.rejectionReason && (
                    <div className="mt-3.5 p-3 rounded-xl text-xs text-red-400 border border-red-500/10" style={{ backgroundColor: "rgba(239,68,68,0.03)" }}>
                      <strong>Reason for Rejection:</strong> {provider.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Verification CTA Buttons */}
                {provider.approvalStatus === "pending" && (
                  <div className="flex gap-2 sm:self-center flex-shrink-0">
                    <button
                      disabled={actioningId === provider._id}
                      onClick={() => handleAction(provider._id, "approve")}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1"
                      style={{ fontFamily: "var(--font-body)", backgroundColor: "#22c55e", color: "#fff", boxShadow: "0 4px 12px rgba(34,197,94,0.15)" }}
                    >
                      ✓ Approve Partner
                    </button>
                    <button
                      disabled={actioningId === provider._id}
                      onClick={() => handleAction(provider._id, "reject")}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ fontFamily: "var(--font-body)", backgroundColor: "transparent", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
                    >
                      ✕ Reject Application
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 rounded-3xl border" style={{ backgroundColor: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
            <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>
              No provider registrations found in this category.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminProviders;
