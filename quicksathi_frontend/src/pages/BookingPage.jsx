import { useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BookingPage = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const serviceName = searchParams.get("name") || "Service";
  const packageTitle = searchParams.get("package") || "";
  const price = parseInt(searchParams.get("price") || "0");

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-normal mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
            Please login to book
          </h2>
          <Link to="/login" className="px-6 py-3 rounded-full text-sm font-semibold no-underline" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.address || !formData.city) {
      setError("Please fill in date, address and city");
      return;
    }
    // Navigate to payment with booking info
    const params = new URLSearchParams({
      serviceId,
      name: serviceName,
      package: packageTitle,
      price: price.toString(),
      date: formData.date,
      time: formData.time,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      notes: formData.notes,
    });
    navigate(`/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ fontFamily: "var(--font-body)" }}>
          <Link to="/" className="no-underline" style={{ color: "var(--color-text-mid)" }}>Home</Link>
          <span style={{ color: "var(--color-accent)" }}>/</span>
          <Link to="/services" className="no-underline" style={{ color: "var(--color-text-mid)" }}>Services</Link>
          <span style={{ color: "var(--color-accent)" }}>/</span>
          <span style={{ color: "var(--color-text-dark)" }}>Book</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-normal mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
              Schedule Your Booking
            </h1>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm mb-6" style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "var(--font-body)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Enter your address"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City"
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode"
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any special requirements..." rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-y"
                  style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }} />
              </div>

              <button type="submit"
                className="w-full py-4 rounded-2xl text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 mt-2"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff", boxShadow: "0 4px 20px rgba(139,26,26,0.25)" }}>
                Proceed to Payment
              </button>
            </form>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl p-6 border" style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <h3 className="text-base font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Booking Summary</h3>
              <div className="flex flex-col gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  <span style={{ color: "var(--color-text-mid)" }}>Service</span>
                  <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>{serviceName}</span>
                </div>
                {packageTitle && (
                  <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    <span style={{ color: "var(--color-text-mid)" }}>Package</span>
                    <span style={{ color: "var(--color-text-dark)" }}>{packageTitle}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                <span style={{ color: "var(--color-text-dark)" }}>Total</span>
                <span style={{ color: "var(--color-primary)" }}>₹{price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
