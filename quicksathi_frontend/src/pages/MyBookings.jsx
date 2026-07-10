import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const STATUS_STYLES = {
  pending: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04", label: "Pending" },
  confirmed: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", label: "Confirmed" },
  completed: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Completed" },
  cancelled: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", label: "Cancelled" },
  in_progress: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", label: "In Progress" },
};

const MyBookings = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/bookings");
        setBookings(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setCancelling(bookingId);
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
          />
          <span className="text-sm italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            Loading your bookings…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <p className="text-base mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full text-sm font-semibold border-0 cursor-pointer"
            style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}
          >
            Retry
          </button>
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

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>No bookings yet</p>
            <Link
              to="/services"
              className="px-6 py-3 rounded-full text-sm font-semibold no-underline"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => {
              const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
              const canCancel = ["pending", "confirmed"].includes(booking.status);
              const scheduledDate = booking.scheduledDate
                ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—";
              return (
                <div
                  key={booking._id}
                  className="rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                          {booking.serviceName}
                        </h3>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ fontFamily: "var(--font-body)", backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                        <span>📋 {booking.bookingId}</span>
                        {booking.packageTitle && <span>📦 {booking.packageTitle}</span>}
                        <span>📅 {scheduledDate}</span>
                        {booking.scheduledTime && <span>🕐 {booking.scheduledTime}</span>}
                        <span>{booking.paymentMethod === "razorpay" ? "💳" : "💵"} {booking.paymentMethod?.toUpperCase()}</span>
                      </div>
                      {booking.location?.city && (
                        <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                          📍 {[booking.location.address, booking.location.city, booking.location.pincode].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <p className="text-xl font-bold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                        ₹{booking.amount?.toLocaleString("en-IN")}
                      </p>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                          style={{
                            fontFamily: "var(--font-body)",
                            backgroundColor: "transparent",
                            color: "#dc2626",
                            borderColor: "#dc262640",
                          }}
                        >
                          {cancelling === booking._id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
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
