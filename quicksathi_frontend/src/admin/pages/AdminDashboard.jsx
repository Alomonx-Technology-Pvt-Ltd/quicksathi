const STATS = [
  { label: "Total Users", value: "1,245", icon: "👥", change: "+12%", color: "#6366f1" },
  { label: "Active Providers", value: "48", icon: "🏢", change: "+5", color: "#22c55e" },
  { label: "Pending Approvals", value: "7", icon: "⏳", change: "New", color: "#f59e0b" },
  { label: "Total Bookings", value: "389", icon: "📋", change: "+23%", color: "#3b82f6" },
  { label: "Revenue", value: "₹12.4L", icon: "💰", change: "+18%", color: "#10b981" },
];

const RECENT_BOOKINGS = [
  { id: "QS-A1B2", user: "Rahul S.", service: "Photography", amount: "₹35,000", status: "confirmed", date: "Today" },
  { id: "QS-C3D4", user: "Priya V.", service: "Car Rental", amount: "₹2,499", status: "pending", date: "Yesterday" },
  { id: "QS-E5F6", user: "Amit K.", service: "Home Security", amount: "₹12,999", status: "completed", date: "2 days ago" },
];

const STATUS_COLORS = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Dashboard</h1>
      <p className="text-sm mb-8" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
        Welcome back, Admin. Here's your overview.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {STATS.map((stat, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-body)", backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white m-0 mb-1" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
            <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-base font-semibold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>Recent Bookings</h3>
          <span className="text-xs" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>Last 7 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr>
                {["Booking ID", "User", "Service", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_BOOKINGS.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-4 text-sm text-white/80">{b.id}</td>
                  <td className="px-6 py-4 text-sm text-white/80">{b.user}</td>
                  <td className="px-6 py-4 text-sm text-white/80">{b.service}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{b.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${STATUS_COLORS[b.status]}15`, color: STATUS_COLORS[b.status] }}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
