import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../config/api";
import { Ticket, Check, X, Tag, Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Coupon / Offer States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [showOffersList, setShowOffersList] = useState(false);

  const serviceName = searchParams.get("name") || "Service";
  const packageTitle = searchParams.get("package") || "";
  const urlPrice = parseInt(searchParams.get("price") || "0", 10); // display fallback only; the server prices the booking
  const distanceKm = parseFloat(searchParams.get("distance") || "") || undefined;
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
  const latParam = searchParams.get("lat") || searchParams.get("pickupLat");
  const lonParam = searchParams.get("lon") || searchParams.get("pickupLon");
  const road = searchParams.get("road") || "";
  const accuracyParam = searchParams.get("accuracy");

  // Fetch active public coupons
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get("/coupons/active");
        if (Array.isArray(data)) setAvailableOffers(data);
      } catch {
        // Silently skip if unavailable
      }
    };
    fetchOffers();
  }, []);

  // The server is the only source of price. Re-quote when the coupon changes.
  const [quoted, setQuoted] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api
      .post("/bookings/quote", { serviceId, packageTitle, distanceKm, couponCode: appliedCoupon?.code || "" })
      .then(({ data }) => { if (!cancelled) setQuoted(data); })
      .catch(() => { if (!cancelled) setQuoted(null); });
    return () => { cancelled = true; };
  }, [serviceId, packageTitle, distanceKm, appliedCoupon]);

  const handleApplyCoupon = async (codeToApply) => {
    const targetCode = (codeToApply || couponInput).trim();
    if (!targetCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const { data } = await api.post("/coupons/validate", {
        code: targetCode,
        serviceId,
        packageTitle,
        distanceKm,
      });

      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount || 0);
        setCouponSuccess(data.savingsMessage || `Coupon '${data.coupon.code}' applied successfully!`);
        setCouponInput(data.coupon.code);
        setShowOffersList(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to apply coupon.";
      setCouponError(msg);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  const price = quoted ? quoted.originalAmount : urlPrice;
  const finalAmount = Math.max(0, price - discountAmount);

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
          ...(latParam ? { lat: parseFloat(latParam) } : {}),
          ...(lonParam ? { lon: parseFloat(lonParam) } : {}),
          ...(road ? { road } : {}),
          ...(accuracyParam ? { accuracy: parseFloat(accuracyParam) } : {}),
        },
        notes,
        paymentMethod,
        packageTitle,
        distanceKm,
        couponCode: appliedCoupon ? appliedCoupon.code : "",
      };

      if (paymentMethod === "razorpay") {
        // Simulated Razorpay checkout (test mode), then create the booking
        await new Promise((resolve) => setTimeout(resolve, 1500));
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
      <div
        className="min-h-screen flex items-center justify-center px-6 pt-20"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            className="text-2xl font-normal mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
          >
            Booking Confirmed!
          </h2>
          <p
            className="text-sm mb-2"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            Your booking for <strong>{serviceName}</strong> has been confirmed.
          </p>
          {appliedCoupon && (
            <p className="text-xs font-semibold text-emerald-600 mb-2">
              🎉 Coupon {appliedCoupon.code} applied: You saved ₹{discountAmount.toLocaleString()}!
            </p>
          )}
          <p
            className="text-sm mb-8"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            {paymentMethod === "cod"
              ? `Please keep ₹${finalAmount.toLocaleString()} cash ready for the service provider.`
              : "Payment received successfully."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/my-bookings"
              className="px-6 py-3 rounded-full text-sm font-semibold no-underline"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
              }}
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-full text-sm font-semibold no-underline border"
              style={{
                fontFamily: "var(--font-body)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-dark)",
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-8"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <nav
          className="flex items-center gap-2 text-xs mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Link to="/" className="no-underline" style={{ color: "var(--color-text-mid)" }}>
            Home
          </Link>
          <span style={{ color: "var(--color-accent)" }}>/</span>
          <span style={{ color: "var(--color-text-dark)" }}>Payment</span>
        </nav>

        <h1
          className="text-2xl font-normal mb-8"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
        >
          Choose Payment Method
        </h1>

        {/* ── Order Summary ── */}
        <div
          className="rounded-2xl p-6 mb-6 border"
          style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
          >
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
                <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>
                  {route}
                </span>
              </div>
            )}
            {distance && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Distance</span>
                <span className="font-bold" style={{ color: "#16a34a" }}>
                  {distance}
                </span>
              </div>
            )}
            {date && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Date</span>
                <span style={{ color: "var(--color-text-dark)" }}>{date}</span>
              </div>
            )}

            {/* Discount line if applied */}
            {appliedCoupon && discountAmount > 0 && (
              <div
                className="flex justify-between text-sm font-medium pt-2 text-emerald-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="flex items-center gap-1">
                  <Tag size={13} />
                  <span>Coupon ({appliedCoupon.code})</span>
                </span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div
              className="flex justify-between text-lg font-bold pt-3 mt-2"
              style={{ borderTop: "1px solid var(--color-border)", fontFamily: "var(--font-display)" }}
            >
              <span style={{ color: "var(--color-text-dark)" }}>Total</span>
              <div className="text-right">
                {appliedCoupon && discountAmount > 0 && (
                  <span className="text-xs line-through text-slate-400 mr-2">
                    ₹{price.toLocaleString()}
                  </span>
                )}
                <span style={{ color: "var(--color-primary)" }}>₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Offers & Promo Code Box ── */}
        <div
          className="rounded-2xl p-5 mb-8 border transition-all"
          style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Ticket size={18} className="text-blue-600" />
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                Coupons & Offers
              </span>
            </div>
            {availableOffers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOffersList(!showOffersList)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1"
              >
                <span>{showOffersList ? "Hide Offers" : "View Offers"}</span>
                {showOffersList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {appliedCoupon ? (
            /* Applied Coupon Chip */
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-800 m-0">
                    {appliedCoupon.code} Applied!
                  </p>
                  <p className="text-[11px] text-emerald-600 m-0">
                    You saved ₹{discountAmount.toLocaleString()} on this order
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-transparent border-0 cursor-pointer flex items-center gap-1"
              >
                <X size={14} />
                <span>Remove</span>
              </button>
            </div>
          ) : (
            /* Coupon Input Field */
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter promo / coupon code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm uppercase font-mono tracking-wider outline-none border transition-all"
                  style={{
                    borderColor: couponError ? "#ef4444" : "var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-dark)",
                  }}
                />
              </div>

              <button
                type="button"
                disabled={couponLoading || !couponInput.trim()}
                onClick={() => handleApplyCoupon()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 border-0 cursor-pointer disabled:opacity-50 transition-transform active:scale-95"
              >
                {couponLoading ? "Checking..." : "Apply"}
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {couponError && (
            <div className="flex items-start gap-1.5 mt-2.5 text-xs text-red-600 font-medium">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{couponError}</span>
            </div>
          )}
          {couponSuccess && !appliedCoupon && (
            <p className="text-xs text-emerald-600 font-medium mt-2 m-0">{couponSuccess}</p>
          )}

          {/* Available Offers List Collapsible */}
          {showOffersList && availableOffers.length > 0 && (
            <div className="mt-4 pt-3 border-t space-y-2.5" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-xs font-semibold text-slate-500 m-0">Available Coupons:</p>
              {availableOffers.map((offer) => (
                <div
                  key={offer._id || offer.code}
                  className="p-3 rounded-xl border flex items-center justify-between gap-3 bg-slate-50/60"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-100 text-blue-700">
                        {offer.code}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 mb-0 line-clamp-1">{offer.title}</p>
                    {offer.minOrderAmount > 0 && (
                      <p className="text-[10.5px] text-slate-400 mt-0.5 mb-0">
                        Min. order ₹{offer.minOrderAmount.toLocaleString()} • 1 use per user
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(offer.code)}
                    disabled={couponLoading || (appliedCoupon && appliedCoupon.code === offer.code)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
                  >
                    {appliedCoupon && appliedCoupon.code === offer.code ? "Applied" : "Apply"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Payment Methods ── */}
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
                <p
                  className="text-sm font-semibold m-0"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}
                >
                  Pay Online (Razorpay)
                </p>
                <p
                  className="text-xs m-0 mt-1"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
                >
                  UPI, Credit/Debit Card, Net Banking, Wallets
                </p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: paymentMethod === "razorpay" ? "#1a408b" : "var(--color-border)" }}
              >
                {paymentMethod === "razorpay" && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#1a408b" }} />
                )}
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
                <p
                  className="text-sm font-semibold m-0"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}
                >
                  Cash on Delivery
                </p>
                <p
                  className="text-xs m-0 mt-1"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
                >
                  Pay when the service is delivered
                </p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: paymentMethod === "cod" ? "#22c55e" : "var(--color-border)" }}
              >
                {paymentMethod === "cod" && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                )}
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
            boxShadow: "0 4px 20px rgba(11,79,216,0.25)",
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing
            ? "Processing..."
            : paymentMethod === "razorpay"
            ? `Pay ₹${finalAmount.toLocaleString()}`
            : `Confirm COD Booking (₹${finalAmount.toLocaleString()})`}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
