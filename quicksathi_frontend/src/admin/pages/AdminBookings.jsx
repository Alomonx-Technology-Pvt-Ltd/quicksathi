import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import { Search } from "lucide-react";

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
          style={{ borderColor: "rgba(255,255,255,0.06)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-xs text-muted" style={{ color: "rgba(255,255,255,0.3)" }}>Loading bookings log...</span>
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
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Booking Operations</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            View client logs, edit schedule statuses, and monitor payment types.
          </p>
        </div>

        {/* Stats Summary badge */}
        <div className="flex gap-4">
          <div className="px-5 py-2.5 rounded-2xl border flex flex-col items-center" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Total Bookings</span>
            <span className="text-lg font-bold text-white mt-0.5">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Utilities Control Panel */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by ID, customer name or service..."
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
        <div className="flex gap-2 overflow-x-auto max-w-full">
          {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer capitalize transition-all border whitespace-nowrap"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: filter === f ? "var(--color-primary)" : "rgba(255,255,255,0.02)",
                color: filter === f ? "#fff" : "rgba(255,255,255,0.45)",
                borderColor: filter === f ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
              }}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings table */}
      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Booking ID", "Customer details", "Service Details", "Assigned Provider", "Billing Amount", "Status Stage", "Log Date", "Status Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  filtered.map((b) => (
                    <motion.tr
                      key={b._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.01] transition-all"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {/* Booking ID */}
                      <td className="px-6 py-4 text-sm font-mono text-white/80 whitespace-nowrap">
                        {b.bookingId || b._id?.slice(-6).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white m-0 leading-snug">{b.user?.name || "—"}</p>
                        <p className="text-[10px] m-0 leading-snug" style={{ color: "rgba(255,255,255,0.3)" }}>{b.user?.email || "No email"}</p>
                      </td>

                      {/* Service & Package */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/80 m-0 leading-snug">{b.serviceName || b.service?.name || "—"}</p>
                        {b.packageTitle && (
                          <p className="text-[10px] m-0 leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>{b.packageTitle}</p>
                        )}
                      </td>

                      {/* Assigned Provider */}
                      <td className="px-6 py-4">
                        <select
                          disabled={actioningId === b._id}
                          value={b.provider?._id || b.provider || ""}
                          onChange={(e) => handleAssignProvider(b._id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl text-xs border outline-none font-medium text-white/80 transition"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.04)",
                            borderColor: "rgba(255,255,255,0.08)",
                          }}
                        >
                          <option value="">Unassigned</option>
                          {providers.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.businessName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Amount & Payment */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-white font-semibold m-0 leading-snug">₹{b.amount?.toLocaleString()}</p>
                        <p className="text-[10px] m-0 leading-snug font-bold uppercase" style={{ color: b.paymentMethod === "razorpay" ? "#3b82f6" : "#22c55e" }}>
                          {b.paymentMethod === "razorpay" ? "💳 Online" : "💵 COD"}
                        </p>
                      </td>

                      {/* Status Tag */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${STATUS_COLORS[b.status] || "#888"}15`,
                            color: STATUS_COLORS[b.status] || "#888",
                            border: `1px solid ${STATUS_COLORS[b.status] || "#888"}30`
                          }}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Log Date */}
                      <td className="px-6 py-4 text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>

                      {/* Quick State Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {b.status === "pending" && (
                            <button
                              disabled={actioningId === b._id}
                              onClick={() => handleStatusChange(b._id, "confirmed")}
                              className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase cursor-pointer border hover:bg-green-500/10 transition-all text-green-500 border-green-500/20"
                            >
                              Confirm
                            </button>
                          )}
                          {["pending", "confirmed"].includes(b.status) && (
                            <button
                              disabled={actioningId === b._id}
                              onClick={() => handleStatusChange(b._id, "in_progress")}
                              className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase cursor-pointer border hover:bg-blue-500/10 transition-all text-blue-400 border-blue-500/20"
                            >
                              Start
                            </button>
                          )}
                          {b.status === "in_progress" && (
                            <button
                              disabled={actioningId === b._id}
                              onClick={() => handleStatusChange(b._id, "completed")}
                              className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase cursor-pointer border hover:bg-purple-500/10 transition-all text-purple-400 border-purple-500/20"
                            >
                              Complete
                            </button>
                          )}
                          {b.status !== "completed" && b.status !== "cancelled" && (
                            <button
                              disabled={actioningId === b._id}
                              onClick={() => handleStatusChange(b._id, "cancelled")}
                              className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase cursor-pointer border hover:bg-red-500/10 transition-all text-red-500 border-red-500/20"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                      No matching booking logs found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminBookings;
