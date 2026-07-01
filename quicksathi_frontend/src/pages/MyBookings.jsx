import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Demo bookings data — will be replaced with API calls
const DEMO_BOOKINGS = [
  { id: 1, bookingId: "QS-A1B2C3", service: "Photography", package: "Premium Cinematic", date: "2026-07-15", status: "confirmed", amount: 35000, paymentMethod: "razorpay" },
  { id: 2, bookingId: "QS-D4E5F6", service: "Car Rental", package: "Daily Rental", date: "2026-07-20", status: "pending", amount: 2499, paymentMethod: "cod" },
  { id: 3, bookingId: "QS-G7H8I9", service: "Home Security", package: "Premium Home", date: "2026-06-10", status: "completed", amount: 12999, paymentMethod: "razorpay" },
];

const STATUS_STYLES = {
  pending: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04", label: "Pending" },
  confirmed: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", label: "Confirmed" },
  completed: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Completed" },
  cancelled: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", label: "Cancelled" },
  in_progress: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", label: "In Progress" },
};

const MyBookings = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-normal mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
            Please login to view bookings
          </h2>
          <Link to="/login" className="px-6 py-3 rounded-full text-sm font-semibold no-underline" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-normal mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
          My Bookings
        </h1>

        {DEMO_BOOKINGS.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>No bookings yet</p>
            <Link to="/services" className="px-6 py-3 rounded-full text-sm font-semibold no-underline"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {DEMO_BOOKINGS.map((booking) => {
              const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
              return (
                <div key={booking.id} className="rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                          {booking.service}
                        </h3>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ fontFamily: "var(--font-body)", backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                        <span>📋 {booking.bookingId}</span>
                        <span>📦 {booking.package}</span>
                        <span>📅 {booking.date}</span>
                        <span>{booking.paymentMethod === "razorpay" ? "💳" : "💵"} {booking.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                        ₹{booking.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
