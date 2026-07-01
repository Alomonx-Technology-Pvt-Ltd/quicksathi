import { useState } from "react";

const DEMO_BOOKINGS = [
  { id: "QS-A1B2C3", user: "Rahul Sharma", email: "rahul@mail.com", service: "Photography", package: "Premium Cinematic", amount: 35000, status: "confirmed", payment: "razorpay", date: "2026-07-15" },
  { id: "QS-D4E5F6", user: "Priya Verma", email: "priya@mail.com", service: "Car Rental", package: "Daily Rental", amount: 2499, status: "pending", payment: "cod", date: "2026-07-20" },
  { id: "QS-G7H8I9", user: "Amit Kumar", email: "amit@mail.com", service: "Home Security", package: "Premium Home", amount: 12999, status: "completed", payment: "razorpay", date: "2026-06-10" },
  { id: "QS-J1K2L3", user: "Sneha Kumari", email: "sneha@mail.com", service: "Decoration", package: "Premium Décor", amount: 75000, status: "in_progress", payment: "razorpay", date: "2026-07-05" },
  { id: "QS-M4N5O6", user: "Vikram Singh", email: "vikram@mail.com", service: "Bike Rental", package: "Full Day", amount: 499, status: "cancelled", payment: "cod", date: "2026-06-28" },
];

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  in_progress: "#3b82f6",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const AdminBookings = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? DEMO_BOOKINGS : DEMO_BOOKINGS.filter((b) => b.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white m-0 mb-1" style={{ fontFamily: "var(--font-display)" }}>Booking Management</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            View and manage all platform bookings.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer capitalize transition-all"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: filter === f ? "rgba(139,26,26,0.3)" : "rgba(255,255,255,0.05)",
                color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
              }}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr>
                {["Booking ID", "User", "Service", "Package", "Amount", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="transition-all" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-4 text-sm text-white/80 font-mono">{b.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-white m-0">{b.user}</p>
                    <p className="text-xs m-0" style={{ color: "rgba(255,255,255,0.25)" }}>{b.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/80">{b.service}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{b.package}</td>
                  <td className="px-5 py-4 text-sm text-white font-semibold">₹{b.amount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold uppercase" style={{ color: b.payment === "razorpay" ? "#3b82f6" : "#22c55e" }}>
                      {b.payment === "razorpay" ? "💳 Online" : "💵 COD"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: `${STATUS_COLORS[b.status]}15`, color: STATUS_COLORS[b.status] }}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>No bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
