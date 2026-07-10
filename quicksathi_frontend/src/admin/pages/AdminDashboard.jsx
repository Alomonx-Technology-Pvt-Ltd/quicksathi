import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../config/api";
import { Users, Briefcase, Clock, ClipboardList, Wrench, FolderOpen, TrendingUp } from "lucide-react";

const STATUS_COLORS = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  completed: "#8b5cf6",
  cancelled: "#ef4444",
  in_progress: "#3b82f6",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/bookings?limit=5"),
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--color-primary)" }} />
      </div>
    );
  }

  const STATS = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "#3b82f6" },
    { label: "Active Providers", value: stats?.totalProviders?.toLocaleString() || "0", icon: Briefcase, color: "#22c55e" },
    { label: "Pending Approvals", value: stats?.pendingProviders?.toLocaleString() || "0", icon: Clock, color: "#f59e0b" },
    { label: "Total Bookings", value: stats?.totalBookings?.toLocaleString() || "0", icon: ClipboardList, color: "#ec4899" },
    { label: "Total Services", value: stats?.totalServices?.toLocaleString() || "0", icon: Wrench, color: "#8b5cf6" },
    { label: "Categories", value: stats?.totalCategories?.toLocaleString() || "0", icon: FolderOpen, color: "#a855f7" },
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "#C4A882" },
  ];

  // ── Calculate dynamic points for the Revenue SVG line chart ──
  const monthlyRevenue = stats?.monthlyRevenue || [];
  const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.revenue), 1000);
  
  const linePoints = monthlyRevenue.map((r, i) => {
    const x = 30 + i * 60;
    // Scale y coordinate from 20 (max revenue) to 140 (zero revenue)
    const y = 140 - (r.revenue / maxRevenue) * 115;
    return { x, y, value: r.revenue, label: r.label };
  });

  const polylinePoints = linePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPolygonPoints = linePoints.length > 0
    ? `30,150 ${polylinePoints} ${linePoints[linePoints.length - 1].x},150`
    : "";

  // ── Calculate dynamic heights for the Bookings SVG bar chart ──
  const weeklyBookings = stats?.weeklyBookings || [];
  const maxBookingsCount = Math.max(...weeklyBookings.map((b) => b.count), 5);

  const formattedWeekly = weeklyBookings.map((b) => {
    const barHeight = Math.max((b.count / maxBookingsCount) * 135, 6);
    return { ...b, barHeight };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Dashboard Overview</h1>
      <p className="text-sm mb-8" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
        Real-time portal statistics, revenue distributions, and client actions.
      </p>

      {/* Stats Cards Grid with Radial Texture Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.06)",
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.035) 1.2px, transparent 1.2px)",
              backgroundSize: "10px 10px",
            }}
          >
            {/* Subtle glow border line on the left side of the card */}
            <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-lg" style={{ backgroundColor: stat.color }} />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={18} strokeWidth={1.5} style={{ color: stat.color }} />
              </div>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.color }} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>{stat.label}</p>
              <p className="text-2xl font-normal text-white m-0" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Analytical Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Real-Data Revenue Trend Line Chart */}
        <div className="lg:col-span-2 rounded-3xl border p-6 flex flex-col gap-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <h3 className="text-sm font-semibold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>Revenue Analytics</h3>
            <p className="text-[10px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Real payouts overview for the last 6 months</p>
          </div>
          
          <div className="w-full relative h-[180px] mt-4 flex items-end">
            {monthlyRevenue.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 360 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4A882" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#C4A882" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="30" x2="360" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="110" x2="360" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="150" x2="360" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* dynamic area path */}
                <polygon points={areaPolygonPoints} fill="url(#chartGradient)" />
                {/* dynamic line path */}
                <polyline points={polylinePoints} fill="none" stroke="#C4A882" strokeWidth="2.5" strokeLinecap="round" />

                {/* Dynamic Data points */}
                {linePoints.map((pt, idx) => (
                  <g key={idx} className="group">
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#C4A882" stroke="#16161d" strokeWidth="2" />
                    <title>{`${pt.label}: ₹${pt.value}`}</title>
                  </g>
                ))}
              </svg>
            ) : (
              <p className="w-full text-center text-xs text-white/30 pb-16">No monthly payout records yet</p>
            )}
          </div>
          
          <div className="flex justify-between text-[9px] font-semibold uppercase tracking-wider px-4" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.25)" }}>
            {monthlyRevenue.map((r, i) => (
              <span key={i}>{r.label}</span>
            ))}
          </div>
        </div>

        {/* Real-Data Weekly Bookings Bar Chart */}
        <div className="rounded-3xl border p-6 flex flex-col gap-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <h3 className="text-sm font-semibold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>Weekly Volume</h3>
            <p className="text-[10px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Total bookings logged in the last 7 days</p>
          </div>

          <div className="flex items-end justify-between h-[180px] px-1 mt-4">
            {formattedWeekly.length > 0 ? (
              formattedWeekly.map((b, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <span className="text-[9px] text-white opacity-0 group-hover:opacity-100 transition-all font-semibold mb-1">
                    {b.count}
                  </span>
                  <div className="w-7 rounded-t-lg transition-all duration-500 hover:opacity-90"
                    style={{
                      height: `${b.barHeight}px`,
                      backgroundColor: b.count > 0 ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
                      boxShadow: b.count > 0 ? "0 4px 12px rgba(139,26,26,0.2)" : "none"
                    }}
                  />
                  <span className="text-[9px] font-semibold uppercase tracking-wide mt-1" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.25)" }}>
                    {b.day}
                  </span>
                </div>
              ))
            ) : (
              <p className="w-full text-center text-xs text-white/30 pb-16">No booking logs this week</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-semibold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>Recent Bookings</h3>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C4A882] bg-white/[0.03] px-3 py-1 rounded-full border border-white/5" style={{ fontFamily: "var(--font-body)" }}>
            Latest 5 Logs
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Booking ID", "Customer", "Service Requested", "Billing Amount", "State", "Logged Date"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? bookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.01] transition-all" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-6 py-4 text-sm text-white/80 font-mono">{b.bookingId || b._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-white/80">{b.user?.name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-white/80">{b.serviceName || b.service?.name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">₹{b.amount?.toLocaleString() || "0"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${STATUS_COLORS[b.status] || "#888"}15`,
                        color: STATUS_COLORS[b.status] || "#888",
                        border: `1px solid ${STATUS_COLORS[b.status] || "#888"}30`
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No recent booking logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
