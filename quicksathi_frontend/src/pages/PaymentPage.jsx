import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../config/api";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceName = searchParams.get("name") || "Service";
  const packageTitle = searchParams.get("package") || "";
  const price = parseInt(searchParams.get("price") || "0");
  const date = searchParams.get("date") || "";
  
  const route = searchParams.get("route") || "";
  const distance = searchParams.get("distance") || "";
  
  // Extract all remaining data needed for booking
  const serviceId = searchParams.get("serviceId");
  const time = searchParams.get("time") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const pincode = searchParams.get("pincode") || "";
  const notes = searchParams.get("notes") || "";

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Common booking payload for both COD and online payment
      const bookingData = {
        serviceId,
        scheduledDate: date,
        scheduledTime: time,
        location: {
          address,
          city,
          pincode,
        },
        notes,
        paymentMethod,
        amount: price,
        // Optional: you could pass packageIndex if we passed it in URL, but backend will fallback to price/packageTitle
      };

      if (paymentMethod === "razorpay") {
        // Simulated Razorpay checkout (test mode), but we actually create the booking
        await new Promise(resolve => setTimeout(resolve, 1500));
        await api.post("/bookings", bookingData);
        setSuccess(true);
      } else {
        // COD - create booking directly
        await api.post("/bookings", bookingData);
        setSuccess(true);
      }
    } catch (err) {
      console.error("Booking creation failed:", err);
      alert(err.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-normal mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
            Booking Confirmed!
          </h2>
          <p className="text-sm mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            Your booking for <strong>{serviceName}</strong> has been confirmed.
          </p>
          <p className="text-sm mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            {paymentMethod === "cod" ? "Please keep cash ready for the service provider." : "Payment received successfully."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/my-bookings" className="px-6 py-3 rounded-full text-sm font-semibold no-underline"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
              View My Bookings
            </Link>
            <Link to="/" className="px-6 py-3 rounded-full text-sm font-semibold no-underline border"
              style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", color: "var(--color-text-dark)" }}>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ fontFamily: "var(--font-body)" }}>
          <Link to="/" className="no-underline" style={{ color: "var(--color-text-mid)" }}>Home</Link>
          <span style={{ color: "var(--color-accent)" }}>/</span>
          <span style={{ color: "var(--color-text-dark)" }}>Payment</span>
        </nav>

        <h1 className="text-2xl font-normal mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
          Choose Payment Method
        </h1>

        {/* Order Summary */}
        <div className="rounded-2xl p-6 mb-8 border" style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
            Order Summary
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <span style={{ color: "var(--color-text-mid)" }}>{serviceName}</span>
              <span style={{ color: "var(--color-text-dark)" }}>₹{price.toLocaleString()}</span>
            </div>
            {packageTitle && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Package</span>
                <span style={{ color: "var(--color-text-dark)" }}>{packageTitle}</span>
              </div>
            )}
            {route && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Route</span>
                <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{route}</span>
              </div>
            )}
            {distance && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Distance</span>
                <span className="font-bold" style={{ color: "#16a34a" }}>{distance}</span>
              </div>
            )}
            {date && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Date</span>
                <span style={{ color: "var(--color-text-dark)" }}>{date}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 mt-2" style={{ borderTop: "1px solid var(--color-border)", fontFamily: "var(--font-display)" }}>
              <span style={{ color: "var(--color-text-dark)" }}>Total</span>
              <span style={{ color: "var(--color-primary)" }}>₹{price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Razorpay */}
          <button
            onClick={() => setPaymentMethod("razorpay")}
            className="text-left p-5 rounded-2xl border cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: paymentMethod === "razorpay" ? "rgba(26,64,139,0.04)" : "var(--color-bg-white)",
              borderColor: paymentMethod === "razorpay" ? "#1a408b" : "var(--color-border)",
              boxShadow: paymentMethod === "razorpay" ? "0 0 0 2px rgba(26,64,139,0.15)" : "none",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1a408b" }}>
                <span className="text-white text-xl">💳</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                  Pay Online (Razorpay)
                </p>
                <p className="text-xs m-0 mt-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  UPI, Credit/Debit Card, Net Banking, Wallets
                </p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: paymentMethod === "razorpay" ? "#1a408b" : "var(--color-border)" }}>
                {paymentMethod === "razorpay" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#1a408b" }} />}
              </div>
            </div>
          </button>

          {/* COD */}
          <button
            onClick={() => setPaymentMethod("cod")}
            className="text-left p-5 rounded-2xl border cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: paymentMethod === "cod" ? "rgba(34,197,94,0.04)" : "var(--color-bg-white)",
              borderColor: paymentMethod === "cod" ? "#22c55e" : "var(--color-border)",
              boxShadow: paymentMethod === "cod" ? "0 0 0 2px rgba(34,197,94,0.15)" : "none",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#22c55e" }}>
                <span className="text-white text-xl">💵</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                  Cash on Delivery
                </p>
                <p className="text-xs m-0 mt-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Pay when the service is delivered
                </p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: paymentMethod === "cod" ? "#22c55e" : "var(--color-border)" }}>
                {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />}
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-4 rounded-2xl text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--color-primary)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing ? "Processing..." : paymentMethod === "razorpay" ? `Pay ₹${price.toLocaleString()}` : "Confirm COD Booking"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
