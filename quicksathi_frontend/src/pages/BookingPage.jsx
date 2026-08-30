import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import LocationSearch from "../components/carRental/LocationSearch";
import RouteMap from "../components/carRental/RouteMap";
import {
  Navigation,
  MapPin,
  CalendarDays,
  Clock,
  Route,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Car,
} from "lucide-react";

const BookingPage = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const serviceName = searchParams.get("name") || "Service";
  const packageTitle = searchParams.get("package") || "";
  const initialPrice = parseInt(searchParams.get("price") || "0", 10);
  const initialRoute = searchParams.get("route") || "";
  const initialPickup = searchParams.get("pickup") || "";
  const initialDropoff = searchParams.get("dropoff") || "";
  const initialPerKmRate = parseInt(searchParams.get("perKmRate") || "10", 10);

  // Service details from backend if available
  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(false);

  // Rental identification
  const isRentalParam =
    searchParams.has("route") ||
    searchParams.has("distance") ||
    searchParams.has("perKmRate") ||
    serviceName.toLowerCase().includes("rental") ||
    serviceName.toLowerCase().includes("car") ||
    serviceName.toLowerCase().includes("bike");

  const [isRental, setIsRental] = useState(isRentalParam);

  // ── Standard form data (for non-rental services) ──
  const [formData, setFormData] = useState({
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    pincode: searchParams.get("pincode") || "",
    notes: searchParams.get("notes") || "",
  });

  // ── Auto-fill from user profile (saved address) ──
  useEffect(() => {
    if (!isAuthenticated) return;
    const autoFill = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const u = data.user;
        setFormData((prev) => ({
          ...prev,
          address: prev.address || u.address || "",
          city: prev.city || u.city || "",
          pincode: prev.pincode || u.pincode || "",
        }));
      } catch {
        // Profile fetch failed — no auto-fill, that's fine
      }
    };
    autoFill();
  }, [isAuthenticated]);

  // ── Route & Map state (for vehicle rental services) ──
  const [pickup, setPickup] = useState(
    searchParams.get("pickupLat") && searchParams.get("pickupLon")
      ? {
          lat: parseFloat(searchParams.get("pickupLat")),
          lon: parseFloat(searchParams.get("pickupLon")),
          name: initialPickup,
          shortName: initialPickup,
        }
      : null
  );
  const [dropoff, setDropoff] = useState(
    searchParams.get("dropoffLat") && searchParams.get("dropoffLon")
      ? {
          lat: parseFloat(searchParams.get("dropoffLat")),
          lon: parseFloat(searchParams.get("dropoffLon")),
          name: initialDropoff,
          shortName: initialDropoff,
        }
      : null
  );
  const [pickupName, setPickupName] = useState(initialPickup);
  const [dropoffName, setDropoffName] = useState(initialDropoff);
  const [routeInfo, setRouteInfo] = useState(
    searchParams.get("distanceKm")
      ? {
          distanceKm: parseInt(searchParams.get("distanceKm"), 10),
          durationMin: Math.round(
            (parseInt(searchParams.get("distanceKm"), 10) / 45) * 60
          ),
        }
      : null
  );

  const [perKmRate, setPerKmRate] = useState(initialPerKmRate || 10);
  const [error, setError] = useState("");

  // Fetch service from backend to confirm rental status & perKmRate
  useEffect(() => {
    if (!serviceId) return;
    const fetchServiceData = async () => {
      try {
        setLoadingService(true);
        const { data } = await api.get(`/services/${serviceId}`);
        if (data) {
          setService(data);
          const rentalDetected = data.serviceMode === "RENTAL";

          if (rentalDetected) {
            setIsRental(true);
            if (data.perKmRate) setPerKmRate(data.perKmRate);
          }
        }
      } catch {
        // Fallback: rely on query params and serviceName heuristics
      } finally {
        setLoadingService(false);
      }
    };
    fetchServiceData();
  }, [serviceId]);

  // Route calculation callback from RouteMap
  const handleRouteCalculated = useCallback((info) => {
    setRouteInfo(info);
  }, []);

  // Compute live price for rentals
  const distanceKm = routeInfo?.distanceKm || 0;
  const calculatedRentalPrice =
    distanceKm > 0
      ? Math.round(distanceKm * perKmRate)
      : initialPrice || service?.startingPrice || 1499;

  const finalAmount = isRental ? calculatedRentalPrice : initialPrice || service?.startingPrice || 0;

  // Format duration
  const formatDuration = (min) => {
    if (!min) return "–";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isRental) {
      if (!pickupName || !dropoffName) {
        setError("Please enter both Pickup Location and Destination.");
        return;
      }
      if (!formData.date) {
        setError("Please select a trip date.");
        return;
      }

      const params = new URLSearchParams({
        serviceId: serviceId || "",
        name: serviceName,
        package: packageTitle || "Vehicle Rental Trip",
        price: finalAmount.toString(),
        date: formData.date,
        time: formData.time || "09:00",
        address: `${pickupName} to ${dropoffName}`,
        city: pickupName.split(",")[0] || "Patna",
        pincode: formData.pincode || "",
        notes: [
          `Route: ${pickupName} → ${dropoffName}`,
          distanceKm > 0 ? `Distance: ${distanceKm} km` : null,
          `Rate: ₹${perKmRate}/km`,
          formData.notes ? `Notes: ${formData.notes}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
        route: `${pickupName} → ${dropoffName}`,
        distance: `${distanceKm} km`,
      });

      navigate(`/payment?${params.toString()}`);
    } else {
      // Standard Non-Rental booking
      if (!formData.date || !formData.address || !formData.city) {
        setError("Please fill in date, address and city");
        return;
      }

      const params = new URLSearchParams({
        serviceId: serviceId || "",
        name: serviceName,
        package: packageTitle,
        price: finalAmount.toString(),
        date: formData.date,
        time: formData.time,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        notes: formData.notes,
      });

      navigate(`/payment?${params.toString()}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 pt-20"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <h2
            className="text-2xl font-normal mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-dark)",
            }}
          >
            Please login to book
          </h2>
          <Link
            to="/login"
            className="px-6 py-3 rounded-full text-sm font-semibold no-underline"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-primary)",
              color: "#fff",
            }}
          >
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-8"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-xs mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Link
            to="/"
            className="no-underline"
            style={{ color: "var(--color-text-mid)" }}
          >
            Home
          </Link>
          <span style={{ color: "var(--color-accent)" }}>/</span>
          <Link
            to={isRental ? "/services/car-rentals" : "/services"}
            className="no-underline"
            style={{ color: "var(--color-text-mid)" }}
          >
            {isRental ? "Car Rentals" : "Services"}
          </Link>
          <span style={{ color: "var(--color-accent)" }}>/</span>
          <span style={{ color: "var(--color-text-dark)" }}>Checkout & Booking</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ═══════════════════════════════════════════════════════════════════
              LEFT COLUMN: BOOKING FORM
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              {isRental ? (
                <Car size={26} strokeWidth={2} style={{ color: "#1a3a6b" }} />
              ) : null}
              <h1
                className="text-2xl sm:text-3xl font-semibold m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                }}
              >
                {isRental ? "Trip Route & Checkout" : "Schedule Your Booking"}
              </h1>
            </div>

            <p
              className="text-sm mb-6 m-0"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              {isRental
                ? "Enter your pickup and destination to view live route, distance, and real-time calculated pricing."
                : "Fill in your appointment details and complete your booking."}
            </p>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm mb-6"
                style={{
                  backgroundColor: "rgba(220,38,38,0.08)",
                  color: "#dc2626",
                  border: "1px solid rgba(220,38,38,0.15)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* ── RENTAL-SPECIFIC FORM: Route & Destination Search ── */}
              {isRental ? (
                <div
                  className="rounded-2xl p-5 border flex flex-col gap-4"
                  style={{
                    backgroundColor: "var(--color-bg-white)",
                    borderColor: "var(--color-border)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider m-0 flex items-center gap-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "#1a3a6b",
                    }}
                  >
                    <Route size={16} /> Select Route Points
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pickup */}
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Pickup Location *
                      </label>
                      <LocationSearch
                        placeholder="e.g. Patna, Airport, Station"
                        value={pickupName}
                        icon={Navigation}
                        accentColor="#16a34a"
                        onSelect={(loc) => {
                          setPickup(loc);
                          setPickupName(loc.shortName || loc.name);
                        }}
                        onClear={() => {
                          setPickup(null);
                          setPickupName("");
                          setRouteInfo(null);
                        }}
                      />
                    </div>

                    {/* Destination */}
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Destination *
                      </label>
                      <LocationSearch
                        placeholder="e.g. Ranchi, Gaya, Muzaffarpur"
                        value={dropoffName}
                        icon={MapPin}
                        accentColor="#dc2626"
                        onSelect={(loc) => {
                          setDropoff(loc);
                          setDropoffName(loc.shortName || loc.name);
                        }}
                        onClear={() => {
                          setDropoff(null);
                          setDropoffName("");
                          setRouteInfo(null);
                        }}
                      />
                    </div>
                  </div>

                  {/* Real-time Map inside Checkout */}
                  <div className="mt-2">
                    <RouteMap
                      pickup={pickup}
                      dropoff={dropoff}
                      onRouteCalculated={handleRouteCalculated}
                    />
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Trip Date *
                      </label>
                      <div className="relative">
                        <CalendarDays
                          size={16}
                          strokeWidth={1.8}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "#1a3a6b" }}
                        />
                        <input
                          type="date"
                          name="date"
                          min={today}
                          value={formData.date}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
                          style={{
                            fontFamily: "var(--font-body)",
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-bg-white)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Pickup Time
                      </label>
                      <div className="relative">
                        <Clock
                          size={16}
                          strokeWidth={1.8}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "#1a3a6b" }}
                        />
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
                          style={{
                            fontFamily: "var(--font-body)",
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-bg-white)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-mid)",
                      }}
                    >
                      Trip Notes / Special Instructions
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. Flight/train timing, luggage count, landmark..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-y"
                      style={{
                        fontFamily: "var(--font-body)",
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-bg-white)",
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* ── STANDARD FORM FOR ALL OTHER SERVICES (UNTOUCHED) ── */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                        style={{
                          fontFamily: "var(--font-body)",
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-bg-white)",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                        style={{
                          fontFamily: "var(--font-body)",
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-bg-white)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-mid)",
                      }}
                    >
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your address"
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                      style={{
                        fontFamily: "var(--font-body)",
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-bg-white)",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                        style={{
                          fontFamily: "var(--font-body)",
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-bg-white)",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                        }}
                      >
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                        style={{
                          fontFamily: "var(--font-body)",
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-bg-white)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-mid)",
                      }}
                    >
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special requirements..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-y"
                      style={{
                        fontFamily: "var(--font-body)",
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-bg-white)",
                      }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 mt-2 shadow-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: isRental ? "#1a3a6b" : "var(--color-primary)",
                  color: "#fff",
                }}
              >
                {isRental
                  ? `Proceed to Payment (₹${finalAmount.toLocaleString()})`
                  : "Proceed to Payment"}
              </button>
            </form>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: REAL-TIME SUMMARY CARD
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-2xl p-6 border flex flex-col gap-4"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h3
                className="text-base font-semibold m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                }}
              >
                Booking Summary
              </h3>

              <div
                className="flex flex-col gap-3 pb-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div
                  className="flex justify-between text-sm"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span style={{ color: "var(--color-text-mid)" }}>Service</span>
                  <span
                    className="font-semibold text-right"
                    style={{ color: "var(--color-text-dark)" }}
                  >
                    {serviceName}
                  </span>
                </div>

                {packageTitle && !isRental && (
                  <div
                    className="flex justify-between text-sm"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <span style={{ color: "var(--color-text-mid)" }}>Package</span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-text-dark)" }}
                    >
                      {packageTitle}
                    </span>
                  </div>
                )}

                {/* Rental Details in Summary */}
                {isRental && (
                  <>
                    {pickupName && dropoffName && (
                      <div
                        className="flex flex-col gap-1 text-xs pt-1"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span
                          className="font-semibold uppercase tracking-wider"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Route
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-dark)" }}
                        >
                          {pickupName} → {dropoffName}
                        </span>
                      </div>
                    )}

                    <div
                      className="flex justify-between text-xs pt-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <span style={{ color: "var(--color-text-mid)" }}>Rate</span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-dark)" }}
                      >
                        ₹{perKmRate} / km
                      </span>
                    </div>

                    <div
                      className="flex justify-between text-xs"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <span style={{ color: "var(--color-text-mid)" }}>
                        Calculated Distance
                      </span>
                      <span
                        className="font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        {distanceKm > 0 ? `${distanceKm} km` : "Calculating..."}
                      </span>
                    </div>

                    {routeInfo?.durationMin ? (
                      <div
                        className="flex justify-between text-xs"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span style={{ color: "var(--color-text-mid)" }}>
                          Est. Duration
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-dark)" }}
                        >
                          {formatDuration(routeInfo.durationMin)}
                        </span>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {/* Total Calculation */}
              <div
                className="flex items-center justify-between text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span style={{ color: "var(--color-text-dark)" }}>Total</span>
                <span
                  className="text-xl"
                  style={{
                    color: isRental ? "#1a3a6b" : "var(--color-primary)",
                  }}
                >
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>

              {isRental && distanceKm > 0 && (
                <p
                  className="text-[11px] m-0"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  * Price computed in real-time as ₹{perKmRate} × {distanceKm} km.
                </p>
              )}

              {/* Safety Badge */}
              <div
                className="mt-2 flex items-center gap-2 p-3 rounded-xl"
                style={{
                  backgroundColor: "rgba(26,58,107,0.04)",
                  border: "1px solid rgba(26,58,107,0.08)",
                }}
              >
                <ShieldCheck size={16} style={{ color: "#1a3a6b" }} />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "#1a3a6b",
                  }}
                >
                  100% Verified Fleet & Transparent Billing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
