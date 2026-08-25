import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/api";
import LocationSearch from "../../components/carRental/LocationSearch";
import RouteMap from "../../components/carRental/RouteMap";
import Process from "../../components/carRental/Process";
import DocumentRequirement from "../../components/carRental/DocumentsRequirement";

import {
  Star,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Tag,
  CalendarDays,
  Search,
  Wrench,
  IndianRupee,
  Users,
  Fuel,
  ArrowRight,
  Navigation,
  Clock,
  Route,
  Car,
} from "lucide-react";

// ── Fallback car data (used when backend is offline) ─────────────────────────
const FALLBACK_VEHICLES = [
  {
    _id: "fallback-car-1",
    name: "Car Rental",
    shortDescription: "Self-drive & chauffeur-driven car rental service",
    thumbnail: "https://images.unsplash.com/photo-1549317661-bd32c8ce0f2e?q=80&w=600&auto=format&fit=crop",
    startingPrice: 2499,
    priceUnit: "per day",
    rating: 4.5,
    tags: ["Cars", "Self-Drive", "Wedding Car"],
    serviceMode: "RENTAL",
    packages: [
      { title: "Daily Rental", price: 2499, features: "24 Hour Usage, 100 KM Included" },
      { title: "Wedding Special", price: 7999, features: "Luxury Car, Décor, Driver" },
    ],
  },
  {
    _id: "fallback-bike-1",
    name: "Bike Rental",
    shortDescription: "Affordable bike and scooter rentals",
    thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop",
    startingPrice: 499,
    priceUnit: "per day",
    rating: 4.3,
    tags: ["Bike", "Scooter", "Commute"],
    serviceMode: "RENTAL",
    packages: [
      { title: "Half Day", price: 299, features: "4 Hours, 50 KM" },
      { title: "Full Day", price: 499, features: "12 Hours, 100 KM" },
    ],
  },
];

const FILTERS = ["All Vehicles", "Cars", "Bike", "Bus"];

const CarRentals = () => {
  const navigate = useNavigate();

  // Route search state
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [dropoffName, setDropoffName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [serviceType, setServiceType] = useState("self-drive");

  // Route result state
  const [routeInfo, setRouteInfo] = useState(null); // { distanceKm, durationMin }
  const [showResults, setShowResults] = useState(false);

  // Vehicle state
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Vehicles");

  // Price calculator
  const [calcDays, setCalcDays] = useState(3);
  const dailyRate = 2499;
  const discount = calcDays >= 3 ? Math.round(dailyRate * calcDays * 0.05) : 0;
  const calcTotal = dailyRate * calcDays - discount;

  // Fetch vehicles from backend
  const fetchVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    try {
      const { data } = await api.get("/services?category=Vehicle Rental");
      if (data && data.length > 0) {
        setVehicles(data);
      } else {
        setVehicles(FALLBACK_VEHICLES);
      }
    } catch {
      setVehicles(FALLBACK_VEHICLES);
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Route calculation callback
  const handleRouteCalculated = useCallback((info) => {
    setRouteInfo(info);
  }, []);

  // Find vehicles button
  const handleSearch = () => {
    if (!pickup || !dropoff) return;
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      document.getElementById("route-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  // Calculate trip price based on distance using admin-configured perKmRate
  const getTripPrice = (vehicle) => {
    if (!routeInfo?.distanceKm) return vehicle.startingPrice;
    const rate = vehicle.perKmRate || 10; // admin-configured, default ₹10/km
    const distancePrice = Math.round(rate * routeInfo.distanceKm);
    const driverFee = serviceType === "with-driver" ? 500 : 0;
    return Math.max(distancePrice + driverFee, vehicle.startingPrice);
  };

  // Format duration
  const formatDuration = (min) => {
    if (!min) return "–";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Filter vehicles by tag
  const filteredVehicles =
    activeFilter === "All Vehicles"
      ? vehicles
      : vehicles.filter((v) =>
          v.tags?.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase())) ||
          v.name?.toLowerCase().includes(activeFilter.toLowerCase())
        );

  // Book handler
  const handleBook = (vehicle) => {
    const serviceId = vehicle._id || vehicle.id;
    const price = getTripPrice(vehicle);
    const query = new URLSearchParams({
      name: vehicle.name,
      package: vehicle.packages?.[0]?.title || "Standard",
      price: price.toString(),
      ...(routeInfo?.distanceKm ? { route: `${pickupName} → ${dropoffName}`, distance: `${routeInfo.distanceKm} km` } : {}),
    });
    navigate(`/booking/${serviceId}?${query.toString()}`);
  };

  // Min date for date picker = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Route Search
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden flex items-end"
        style={{
          minHeight: "60vh",
          background: "linear-gradient(135deg, #0a1628 0%, #122447 50%, #1a3a6b 100%)",
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06), transparent 55%)" }}
        />

        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 pb-12 pt-28">
          <h1
            className="text-white font-bold leading-tight mb-3"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 56px)" }}
          >
            Book Your Ride,
            <br />
            Anywhere to Anywhere
          </h1>
          <p
            className="text-white/55 text-sm sm:text-base mb-5"
            style={{ fontFamily: "var(--font-body)", maxWidth: "520px" }}
          >
            Enter your pickup and destination — we'll show you the route, distance, and available vehicles with real-time pricing.
          </p>

          {/* Trust line */}
          <div className="flex items-center gap-5 mb-8 text-white/70 text-xs sm:text-sm" style={{ fontFamily: "var(--font-body)" }}>
            <span className="flex items-center gap-1.5">
              <Star size={14} strokeWidth={0} fill="#facc15" />
              <span className="font-semibold text-white">4.8</span> rating
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} strokeWidth={2} />
              50,000+ trips completed
            </span>
          </div>

          {/* ── Route Search Card ── */}
          <div
            className="rounded-2xl p-4 sm:p-5 max-w-4xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.97)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            {/* Service Type Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl mb-4 w-fit" style={{ backgroundColor: "var(--color-bg)" }}>
              {["self-drive", "with-driver"].map((type) => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: serviceType === type ? "#1a3a6b" : "transparent",
                    color: serviceType === type ? "#fff" : "var(--color-text-mid)",
                  }}
                >
                  {type === "self-drive" ? "🚗 Self Drive" : "👨‍✈️ With Driver"}
                </button>
              ))}
            </div>

            {/* Route Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              {/* Pickup */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Pickup Location
                </label>
                <LocationSearch
                  placeholder="e.g. Patna"
                  value={pickupName}
                  icon={Navigation}
                  accentColor="#16a34a"
                  onSelect={(loc) => { setPickup(loc); setPickupName(loc.shortName || loc.name); }}
                  onClear={() => { setPickup(null); setPickupName(""); setRouteInfo(null); setShowResults(false); }}
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Destination
                </label>
                <LocationSearch
                  placeholder="e.g. Ranchi"
                  value={dropoffName}
                  icon={MapPin}
                  accentColor="#dc2626"
                  onSelect={(loc) => { setDropoff(loc); setDropoffName(loc.shortName || loc.name); }}
                  onClear={() => { setDropoff(null); setDropoffName(""); setRouteInfo(null); setShowResults(false); }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Trip Date
                </label>
                <div className="relative">
                  <CalendarDays size={16} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#1a3a6b" }} />
                  <input
                    type="date"
                    value={tripDate}
                    min={today}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)" }}
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={!pickup || !dropoff}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a3a6b", color: "#fff", height: "46px" }}
              >
                <Search size={16} strokeWidth={2.2} />
                Find Vehicles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 lg:px-16 py-10 sm:py-12" style={{ backgroundColor: "#1a3a6b" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { Icon: ShieldCheck, title: "Verified Vehicles", desc: "Every car undergoes a 120-point safety inspection." },
            { Icon: Wrench, title: "24/7 Roadside", desc: "Instant support anywhere, anytime, for any issue." },
            { Icon: IndianRupee, title: "Price Guarantee", desc: "No hidden charges. What you see is what you pay." },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-center shrink-0 rounded-xl" style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.1)" }}>
                <badge.Icon size={20} strokeWidth={1.8} color="#ffffff" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)" }}>{badge.title}</p>
                <p className="text-white/55 text-xs m-0 mt-1 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROUTE RESULTS — Map + Trip Summary + Vehicle Grid
      ═══════════════════════════════════════════════════════════════════════ */}
      {showResults && pickup && dropoff && (
        <section id="route-results" className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="mb-8">
              <h2
                className="font-normal mb-2"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", color: "var(--color-text-dark)" }}
              >
                Your Route
              </h2>
              <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                {pickupName} → {dropoffName}
              </p>
            </div>

            {/* Map + Trip Summary side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Map — 2/3 width */}
              <div className="lg:col-span-2">
                <RouteMap
                  pickup={pickup}
                  dropoff={dropoff}
                  onRouteCalculated={handleRouteCalculated}
                />
              </div>

              {/* Trip Summary Card — 1/3 width */}
              <div
                className="rounded-2xl p-6 flex flex-col gap-5 h-fit"
                style={{
                  backgroundColor: "var(--color-bg-white)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="text-lg font-semibold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Trip Summary
                </h3>

                <div className="flex flex-col gap-4">
                  {/* Route */}
                  <div className="flex items-start gap-3">
                    <Route size={18} strokeWidth={1.8} className="mt-0.5 flex-shrink-0" style={{ color: "#1a3a6b" }} />
                    <div>
                      <p className="text-xs font-semibold m-0 uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Route</p>
                      <p className="text-sm font-medium m-0 mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                        {pickupName} → {dropoffName}
                      </p>
                    </div>
                  </div>

                  {/* Distance */}
                  <div className="flex items-start gap-3">
                    <Navigation size={18} strokeWidth={1.8} className="mt-0.5 flex-shrink-0" style={{ color: "#16a34a" }} />
                    <div>
                      <p className="text-xs font-semibold m-0 uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Distance</p>
                      <p className="text-xl font-bold m-0 mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                        {routeInfo?.distanceKm ? `${routeInfo.distanceKm} km` : "Calculating…"}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <Clock size={18} strokeWidth={1.8} className="mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                    <div>
                      <p className="text-xs font-semibold m-0 uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Est. Travel Time</p>
                      <p className="text-xl font-bold m-0 mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                        {routeInfo?.durationMin ? formatDuration(routeInfo.durationMin) : "Calculating…"}
                      </p>
                    </div>
                  </div>

                  {/* Service type */}
                  <div className="flex items-start gap-3">
                    <Car size={18} strokeWidth={1.8} className="mt-0.5 flex-shrink-0" style={{ color: "#8b5cf6" }} />
                    <div>
                      <p className="text-xs font-semibold m-0 uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Service Type</p>
                      <p className="text-sm font-medium m-0 mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                        {serviceType === "self-drive" ? "🚗 Self Drive" : "👨‍✈️ With Driver"}
                      </p>
                    </div>
                  </div>

                  {/* Trip Date */}
                  {tripDate && (
                    <div className="flex items-start gap-3">
                      <CalendarDays size={18} strokeWidth={1.8} className="mt-0.5 flex-shrink-0" style={{ color: "#1a3a6b" }} />
                      <div>
                        <p className="text-xs font-semibold m-0 uppercase tracking-wider" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Trip Date</p>
                        <p className="text-sm font-medium m-0 mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                          {new Date(tripDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Available Vehicles ── */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="font-normal mb-1"
                    style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 32px)", color: "var(--color-text-dark)" }}
                  >
                    Available Vehicles
                  </h2>
                  <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    {routeInfo?.distanceKm
                      ? `Prices calculated for ${routeInfo.distanceKm} km trip${serviceType === "with-driver" ? " + ₹500 driver fee" : ""}`
                      : "Select a vehicle for your trip"}
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-1 p-1.5 rounded-2xl w-fit" style={{ backgroundColor: "rgba(26, 58, 107, 0.05)", border: "1px solid var(--color-border)" }}>
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all duration-300 whitespace-nowrap"
                      style={{
                        fontFamily: "var(--font-body)",
                        background: activeFilter === f ? "linear-gradient(135deg, #1a3a6b 0%, #234a85 100%)" : "transparent",
                        color: activeFilter === f ? "#fff" : "var(--color-text-mid)",
                        boxShadow: activeFilter === f ? "0 4px 12px rgba(26, 58, 107, 0.25)" : "none",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Cards Grid */}
              {vehiclesLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} />
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>No vehicles found in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => {
                    const tripPrice = getTripPrice(vehicle);
                    return (
                      <div
                        key={vehicle._id || vehicle.id}
                        className="rounded-2xl overflow-hidden group"
                        style={{
                          backgroundColor: "var(--color-bg-white)",
                          border: "1px solid var(--color-border)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                          transition: "transform 0.28s ease, box-shadow 0.28s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.13)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={vehicle.thumbnail || vehicle.bannerImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0f2e?q=80&w=600&auto=format&fit=crop"}
                            alt={vehicle.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)" }} />

                          {/* Tags */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {vehicle.tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-2 py-1 rounded text-[9px] font-semibold text-white" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", fontFamily: "var(--font-body)" }}>
                                {tag.toUpperCase()}
                              </span>
                            ))}
                          </div>

                          {/* Rating */}
                          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "var(--color-text-dark)" }}>
                            <Star size={11} strokeWidth={0} fill="#facc15" />
                            {vehicle.rating || 4.5}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                            {vehicle.name}
                          </h3>
                          <p className="text-xs m-0 mb-4 line-clamp-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                            {vehicle.shortDescription || "Premium vehicle rental service"}
                          </p>

                          {/* Packages preview */}
                          {vehicle.packages?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {vehicle.packages.slice(0, 2).map((pkg, pi) => (
                                <span key={pi} className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(26,58,107,0.06)", color: "#1a3a6b", fontFamily: "var(--font-body)" }}>
                                  {pkg.title} — ₹{pkg.price.toLocaleString()}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Price + Book row */}
                          <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                            <div>
                              {routeInfo?.distanceKm ? (
                                <>
                                  <span className="text-[9px] uppercase font-semibold tracking-wider block" style={{ color: "#999" }}>Trip price</span>
                                  <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a6b" }}>
                                    ₹{tripPrice.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[9px] uppercase font-semibold tracking-wider block" style={{ color: "#999" }}>Starting from</span>
                                  <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a6b" }}>
                                    ₹{vehicle.startingPrice?.toLocaleString() || "999"}
                                    <span className="text-[10px] font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>/{vehicle.priceUnit || "day"}</span>
                                  </span>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => handleBook(vehicle)}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
                              style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a3a6b", color: "#fff" }}
                            >
                              Book Now
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          EXPLORE FLEET (shown when no route search yet)
      ═══════════════════════════════════════════════════════════════════════ */}
      {!showResults && (
        <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
              <div>
                <h2 className="font-normal mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", color: "var(--color-text-dark)" }}>
                  Explore Our Fleet
                </h2>
                <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Browse all available vehicles — or search a route above for trip-based pricing.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 p-1.5 rounded-2xl w-fit" style={{ backgroundColor: "rgba(26, 58, 107, 0.05)", border: "1px solid var(--color-border)" }}>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all duration-300 whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-body)",
                      background: activeFilter === f ? "linear-gradient(135deg, #1a3a6b 0%, #234a85 100%)" : "transparent",
                      color: activeFilter === f ? "#fff" : "var(--color-text-mid)",
                      boxShadow: activeFilter === f ? "0 4px 12px rgba(26, 58, 107, 0.25)" : "none",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Grid */}
            {vehiclesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id || vehicle.id}
                    className="rounded-2xl overflow-hidden group"
                    style={{
                      backgroundColor: "var(--color-bg-white)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "transform 0.28s ease, box-shadow 0.28s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.13)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={vehicle.thumbnail || vehicle.bannerImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0f2e?q=80&w=600&auto=format&fit=crop"}
                        alt={vehicle.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)" }} />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {vehicle.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded text-[9px] font-semibold text-white" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", fontFamily: "var(--font-body)" }}>
                            {tag.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "var(--color-text-dark)" }}>
                        <Star size={11} strokeWidth={0} fill="#facc15" />
                        {vehicle.rating || 4.5}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>{vehicle.name}</h3>
                      <p className="text-xs m-0 mb-4 line-clamp-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                        {vehicle.shortDescription || "Premium vehicle rental service"}
                      </p>
                      {vehicle.packages?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {vehicle.packages.slice(0, 2).map((pkg, pi) => (
                            <span key={pi} className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(26,58,107,0.06)", color: "#1a3a6b", fontFamily: "var(--font-body)" }}>
                              {pkg.title} — ₹{pkg.price.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                        <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a6b" }}>
                          ₹{vehicle.startingPrice?.toLocaleString() || "999"}
                          <span className="text-[10px] font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>/{vehicle.priceUnit || "day"}</span>
                        </span>
                        <Link
                          to={`/service/${vehicle._id || vehicle.id}`}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold no-underline transition-all duration-200 hover:opacity-90"
                          style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a3a6b", color: "#fff" }}
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          EXISTING SECTIONS — Documents, Process, Why Choose + Calculator
      ═══════════════════════════════════════════════════════════════════════ */}
      <DocumentRequirement />
      <Process />

      {/* Why Choose + Price Calculator */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20" style={{ backgroundColor: "var(--color-bg-soft)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Why Choose */}
          <div>
            <h2 className="font-normal mb-8" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", color: "var(--color-text-dark)" }}>
              Why choose QuickSathi?
            </h2>
            {[
              { Icon: CheckCircle2, title: "No Hidden Fees", desc: "Mandatory insurance and taxes are always included in the initial quote." },
              { Icon: RefreshCw, title: "Flexible Cancellation", desc: "Free cancellation up to 24 hours before your trip starts." },
              { Icon: Sparkles, title: "Premium Support", desc: "Dedicated concierge for luxury bookings and long-term rentals." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="flex items-center justify-center shrink-0 rounded-xl" style={{ width: 40, height: 40, backgroundColor: "rgba(26,58,107,0.08)" }}>
                  <item.Icon size={18} strokeWidth={1.8} color="#1a3a6b" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{item.title}</p>
                  <p className="text-sm m-0 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Calculator */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h3 className="text-lg font-normal mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
              Quick Price Calculator
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                Select Duration
              </label>
              <div className="flex gap-2">
                {[1, 3, 5, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setCalcDays(d)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold border cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: calcDays === d ? "#1a3a6b" : "transparent",
                      color: calcDays === d ? "#fff" : "var(--color-text-mid)",
                      borderColor: calcDays === d ? "#1a3a6b" : "var(--color-border)",
                    }}
                  >
                    {d} {d === 1 ? "Day" : "Days"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Economy Daily Rate</span>
                <span style={{ color: "var(--color-text-dark)" }}>₹{dailyRate.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  <span className="flex items-center gap-1.5" style={{ color: "var(--color-text-mid)" }}>
                    <Tag size={13} strokeWidth={1.8} /> Duration Discount (5%)
                  </span>
                  <span style={{ color: "#16a34a" }}>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3" style={{ borderTop: "1px solid var(--color-border)", fontFamily: "var(--font-display)" }}>
                <span style={{ color: "var(--color-text-dark)" }}>Estimated Total</span>
                <span style={{ color: "#1a3a6b" }}>₹{calcTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a3a6b", color: "#fff" }}
            >
              Proceed to Book
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarRentals;
