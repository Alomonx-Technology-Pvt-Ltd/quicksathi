import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import { Search, User, Package, IndianRupee, Calendar, UserCheck } from "lucide-react";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  in_progress: "#3b82f6",
  completed: "#8b5cf6",
  cancelled: "#ef4444",
};

const AdminBookings = () => {
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/bookings?limit=100");
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data } = await api.get("/admin/providers/approved");
      setProviders(data);
    } catch (err) {
      console.error("Failed to fetch approved providers:", err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchBookings();
      fetchProviders();
    });
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    setActioningId(bookingId);
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Failed to update booking status:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setActioningId(null);
    }
  };

  const handleAssignProvider = async (bookingId, providerId) => {
    setActioningId(bookingId);
    try {
      const { data } = await api.patch(`/admin/bookings/${bookingId}/assign`, { providerId });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, provider: data.booking.provider, status: data.booking.status } : b))
      );
    } catch (err) {
      console.error("Failed to assign provider:", err);
      alert(err.response?.data?.message || "Failed to assign provider");
    } finally {
      setActioningId(null);
    }
  };

  // Search & Filter Logic
  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return b.status === filter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--admin-border)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Loading bookings log...</span>
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
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--admin-text-primary)" }}>Booking Operations</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "var(--admin-text-muted)" }}>
            View client logs, edit schedule statuses, and monitor payment types.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2.5 rounded-2xl border flex flex-col items-center shadow-sm" style={{ backgroundColor: "var(--admin-bg-card)", borderColor: "var(--admin-border)" }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: "var(--admin-text-muted)", fontFamily: "var(--font-body)" }}>Total Bookings</span>
            <span className="text-lg font-bold mt-0.5" style={{ color: "var(--admin-text-primary)" }}>{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Utilities Control Panel */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch lg:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by ID, customer name or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-10 rounded-2xl border outline-none text-sm shadow-sm"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--admin-bg-card)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
          />
          <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: "var(--admin-text-muted)" }} />
        </div>

        <div className="flex gap-2 overflow-x-auto max-w-full">
          {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer capitalize transition-all border whitespace-nowrap"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: filter === f ? "var(--color-primary)" : "var(--admin-bg-card)",
                color: filter === f ? "#ffffff" : "var(--admin-text-secondary)",
                borderColor: filter === f ? "var(--color-primary)" : "var(--admin-border)",
              }}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Cards */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((b) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border overflow-hidden shadow-sm"
                style={{ backgroundColor: "var(--admin-bg-card)", borderColor: "var(--admin-border)" }}
              >
                {/* Card Top — Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5">
                  {/* Booking ID */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>Booking ID</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: "var(--admin-text-primary)" }}>{b.bookingId || b._id?.slice(-8).toUpperCase()}</span>
                  </div>

                  {/* Customer */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                      <User size={10} className="inline mr-1" style={{ verticalAlign: "middle" }} />Customer
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--admin-text-primary)" }}>{b.user?.name || "—"}</span>
                    <span className="text-[10px]" style={{ color: "var(--admin-text-secondary)" }}>{b.user?.email || "No email"}</span>
                  </div>

                  {/* Service */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                      <Package size={10} className="inline mr-1" style={{ verticalAlign: "middle" }} />Service
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--admin-text-primary)" }}>{b.serviceName || b.service?.name || "—"}</span>
                    {b.packageTitle && <span className="text-[10px]" style={{ color: "var(--admin-text-secondary)" }}>{b.packageTitle}</span>}
                  </div>

                  {/* Amount & Payment */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                      <IndianRupee size={10} className="inline mr-1" style={{ verticalAlign: "middle" }} />Billing
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>₹{b.amount?.toLocaleString()}</span>
                    <span className="text-[10px] font-bold uppercase" style={{ color: b.paymentMethod === "razorpay" ? "#3b82f6" : "#22c55e" }}>
                      {b.paymentMethod === "razorpay" ? "💳 Online" : "💵 COD"}
                    </span>
                  </div>

                  {/* Status + Date */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                      <Calendar size={10} className="inline mr-1" style={{ verticalAlign: "middle" }} />Status & Date
                    </span>
                    <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${STATUS_COLORS[b.status] || "#888"}15`,
                        color: STATUS_COLORS[b.status] || "#888",
                        border: `1px solid ${STATUS_COLORS[b.status] || "#888"}30`,
                      }}
                    >
                      {b.status?.replace("_", " ")}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </div>

                  {/* Assigned Provider */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                      <UserCheck size={10} className="inline mr-1" style={{ verticalAlign: "middle" }} />Provider
                    </span>
                    <select
                      disabled={actioningId === b._id}
                      value={b.provider?._id || b.provider || ""}
                      onChange={(e) => handleAssignProvider(b._id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-[10px] border outline-none font-medium transition w-full"
                      style={{
                        backgroundColor: "var(--admin-bg-input)",
                        borderColor: "var(--admin-border)",
                        color: "var(--admin-text-primary)",
                      }}
                    >
                      <option value="">Unassigned</option>
                      {providers.map((p) => {
                        const userName = p.user?.name || "Partner";
                        const biz = p.businessName || p.categoryName || "Provider";
                        const role = p.businessType || "Provider";
                        return (
                          <option key={p._id} value={p._id}>
                            {userName} — {biz} ({role})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Card Bottom — Centered Action Buttons */}
                <div className="flex items-center justify-center gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-hover)" }}>
                  {b.status === "pending" && (
                    <button
                      disabled={actioningId === b._id}
                      onClick={() => handleStatusChange(b._id, "confirmed")}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border hover:bg-green-500/10 transition-all text-green-600 dark:text-green-500 border-green-500/30 bg-transparent"
                    >
                      ✓ Confirm
                    </button>
                  )}
                  {["pending", "confirmed"].includes(b.status) && (
                    <button
                      disabled={actioningId === b._id}
                      onClick={() => handleStatusChange(b._id, "in_progress")}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border hover:bg-blue-500/10 transition-all text-blue-600 dark:text-blue-400 border-blue-500/30 bg-transparent"
                    >
                      ▶ Start
                    </button>
                  )}
                  {b.status === "in_progress" && (
                    <button
                      disabled={actioningId === b._id}
                      onClick={() => handleStatusChange(b._id, "completed")}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border hover:bg-purple-500/10 transition-all text-purple-600 dark:text-purple-400 border-purple-500/30 bg-transparent"
                    >
                      ★ Complete
                    </button>
                  )}
                  {b.status !== "completed" && b.status !== "cancelled" && (
                    <button
                      disabled={actioningId === b._id}
                      onClick={() => handleStatusChange(b._id, "cancelled")}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border hover:bg-red-500/10 transition-all text-red-600 dark:text-red-500 border-red-500/30 bg-transparent"
                    >
                      ✕ Cancel
                    </button>
                  )}
                  {(b.status === "completed" || b.status === "cancelled") && (
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                      No actions available
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border px-6 py-12 text-center text-sm" style={{ color: "var(--admin-text-muted)", backgroundColor: "var(--admin-bg-card)", borderColor: "var(--admin-border)" }}>
              No matching booking logs found.
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminBookings;
