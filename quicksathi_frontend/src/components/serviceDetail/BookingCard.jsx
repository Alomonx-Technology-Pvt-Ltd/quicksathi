import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Clock, Route, IndianRupee, CalendarDays, Search } from "lucide-react";
import LocationSearch from "../carRental/LocationSearch";
import RouteMap from "../carRental/RouteMap";

const BookingCard = ({ service, pkg }) => {
  const navigate = useNavigate();
  const isRental = service.serviceMode === "RENTAL";
  const perKmRate = service.perKmRate || 10; // admin-configured, default ₹10/km

  // ── Route state (only for RENTAL services) ──
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [dropoffName, setDropoffName] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Route callback
  const handleRouteCalculated = useCallback((info) => {
    setRouteInfo(info);
  }, []);

  // Calculate trip price based on distance
  const distanceKm = routeInfo?.distanceKm || 0;
  const distancePrice = Math.round(distanceKm * perKmRate);
  const basePkgPrice = pkg?.price ?? service.startingPrice;
  const tripTotal = isRental && distanceKm > 0 ? distancePrice : basePkgPrice;

  // Format duration
  const formatDuration = (min) => {
    if (!min) return "–";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Find vehicles / show map
  const handleSearch = () => {
    if (!pickup || !dropoff) return;
    setShowMap(true);
  };

  // Book handler
  const handleBook = () => {
    const serviceId = service.id || service._id;
    const params = new URLSearchParams({
      name: service.name,
      package: pkg?.title ?? "",
      price: tripTotal.toString(),
    });

    if (isRental && distanceKm > 0) {
      params.set("route", `${pickupName} → ${dropoffName}`);
      params.set("distance", `${distanceKm} km`);
      params.set("perKmRate", perKmRate.toString());
    }

    navigate(`/booking/${serviceId}?${params.toString()}`);
  };

  return (
    <div
      className="static lg:sticky lg:top-24 rounded-2xl sm:rounded-3xl border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5"
      style={{
        backgroundColor: "var(--color-bg-white)",
        borderColor: "var(--color-border)",
        boxShadow: "0 8px 40px rgba(44,24,16,0.08)",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          RENTAL: Route Search Section
      ═══════════════════════════════════════════════════════════════════ */}
      {isRental && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Route size={16} strokeWidth={2} style={{ color: "var(--color-primary)" }} />
            <p
              className="text-xs font-semibold uppercase tracking-widest m-0"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}
            >
              Plan Your Trip
            </p>
          </div>

          {/* Pickup input */}
          <LocationSearch
            placeholder="Pickup location"
            value={pickupName}
            icon={Navigation}
            accentColor="#16a34a"
            onSelect={(loc) => {
              setPickup(loc);
              setPickupName(loc.shortName || loc.name);
              setShowMap(false);
              setRouteInfo(null);
            }}
            onClear={() => {
              setPickup(null);
              setPickupName("");
              setShowMap(false);
              setRouteInfo(null);
            }}
          />

          {/* Destination input */}
          <LocationSearch
            placeholder="Destination"
            value={dropoffName}
            icon={MapPin}
            accentColor="#dc2626"
            onSelect={(loc) => {
              setDropoff(loc);
              setDropoffName(loc.shortName || loc.name);
              setShowMap(false);
              setRouteInfo(null);
            }}
            onClear={() => {
              setDropoff(null);
              setDropoffName("");
              setShowMap(false);
              setRouteInfo(null);
            }}
          />

          {/* Calculate Route button */}
          <button
            onClick={handleSearch}
            disabled={!pickup || !dropoff}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "#1a3a6b",
              color: "#fff",
            }}
          >
            <Search size={14} strokeWidth={2.2} />
            Calculate Route & Price
          </button>

          {/* ── Map ── */}
          {showMap && pickup && dropoff && (
            <div className="mt-1">
              <RouteMap
                pickup={pickup}
                dropoff={dropoff}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>
          )}

          {/* ── Trip Details (shown after route is calculated) ── */}
          {showMap && routeInfo && distanceKm > 0 && (
            <div
              className="rounded-xl p-3.5 flex flex-col gap-2.5"
              style={{ backgroundColor: "rgba(26,58,107,0.04)", border: "1px solid rgba(26,58,107,0.1)" }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  <Navigation size={13} strokeWidth={1.8} style={{ color: "#16a34a" }} />
                  Distance
                </span>
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  {distanceKm} km
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  <Clock size={13} strokeWidth={1.8} style={{ color: "#f59e0b" }} />
                  Est. Time
                </span>
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  {formatDuration(routeInfo.durationMin)}
                </span>
              </div>

              <div className="h-px" style={{ backgroundColor: "rgba(26,58,107,0.1)" }} />

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  <IndianRupee size={13} strokeWidth={1.8} style={{ color: "var(--color-primary)" }} />
                  Rate
                </span>
                <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  ₹{perKmRate}/km × {distanceKm} km
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                  Trip Total
                </span>
                <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                  ₹{distancePrice.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px -mx-4 sm:-mx-6" style={{ backgroundColor: "var(--color-border)" }} />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STANDARD: Selected Package + Price (shown for all services)
      ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}
        >
          {isRental && distanceKm > 0 ? "Trip Price" : "Selected Package"}
        </p>

        <h3
          className="text-base sm:text-lg font-normal m-0 mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
        >
          {isRental && distanceKm > 0
            ? `${pickupName} → ${dropoffName}`
            : (pkg?.title ?? service.name)}
        </h3>

        <p
          className="text-2xl sm:text-3xl font-bold m-0"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}
        >
          ₹{tripTotal.toLocaleString()}
        </p>

        <p
          className="text-xs mt-1 m-0"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
        >
          {isRental && distanceKm > 0
            ? `₹${perKmRate}/km × ${distanceKm} km`
            : service.priceUnit}
        </p>
      </div>

      {/* Features */}
      {pkg?.features && (
        <ul
          className="m-0 p-0 list-none flex flex-col gap-2 border-t border-b py-3 sm:py-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          {pkg.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-xs sm:text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Service Mode */}
      <div
        className="flex items-center gap-2 text-xs sm:text-sm"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        {service.serviceMode?.replace(/_/g, " ")}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBook}
        disabled={isRental && showMap && distanceKm === 0}
        className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "var(--color-primary)",
          color: "#fff",
          boxShadow: "0 6px 24px rgba(139,26,26,0.30)",
        }}
      >
        {isRental && distanceKm > 0 ? `Book for ₹${tripTotal.toLocaleString()}` : "Book Now"}
      </button>

      {/* Contact Button */}
      <button
        className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border cursor-pointer transition-all duration-200 hover:opacity-80"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "transparent",
          color: "var(--color-text-dark)",
          borderColor: "var(--color-border)",
        }}
      >
        Contact Provider
      </button>
    </div>
  );
};

export default BookingCard;