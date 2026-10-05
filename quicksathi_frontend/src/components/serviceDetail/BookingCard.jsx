import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Clock,
  Route,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import LocationSearch from "../carRental/LocationSearch";
import RouteMap from "../carRental/RouteMap";

const BookingCard = ({ service, pkg }) => {
  const navigate = useNavigate();
  const isRental = service?.serviceMode === "RENTAL";

  const perKmRate = service?.perKmRate || 10;

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
  const basePkgPrice = pkg?.price ?? service?.startingPrice ?? 349;
  const tripTotal = isRental && distanceKm > 0 ? distancePrice : basePkgPrice;
  // (No struck-through "original price": we only show real prices.)

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
    const serviceId = service.slug || service.id || service._id;
    const params = new URLSearchParams({
      name: service.name,
      package: pkg?.title ?? "",
      price: tripTotal.toString(),
    });

    if (isRental) {
      params.set("perKmRate", perKmRate.toString());
      if (pickupName) params.set("pickup", pickupName);
      if (dropoffName) params.set("dropoff", dropoffName);
      if (pickup?.lat && pickup?.lon) {
        params.set("pickupLat", pickup.lat.toString());
        params.set("pickupLon", pickup.lon.toString());
      }
      if (dropoff?.lat && dropoff?.lon) {
        params.set("dropoffLat", dropoff.lat.toString());
        params.set("dropoffLon", dropoff.lon.toString());
      }
      if (distanceKm > 0) {
        params.set("route", `${pickupName} → ${dropoffName}`);
        params.set("distance", `${distanceKm} km`);
        params.set("distanceKm", distanceKm.toString());
      }
    }

    navigate(`/booking/${serviceId}?${params.toString()}`);
  };

  return (
    <div className="static lg:sticky lg:top-24 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xl flex flex-col gap-4 sm:gap-5 transition-all">
      {/* ═══════════════════════════════════════════════════════════════════
          RENTAL: Route Search Section
      ═══════════════════════════════════════════════════════════════════ */}
      {isRental && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Route size={16} strokeWidth={2} className="text-purple-600" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">
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

          {/* Search route button */}
          {pickup && dropoff && !showMap && (
            <button
              onClick={handleSearch}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer border-0"
            >
              Calculate Route & Price
            </button>
          )}

          {/* Live route map & breakdown */}
          {showMap && pickup && dropoff && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 mt-1">
              <RouteMap
                pickup={pickup}
                dropoff={dropoff}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>
          )}

          {/* Trip breakdown */}
          {routeInfo && (
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Distance:</span>
                <span className="font-bold text-slate-900">{distanceKm} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Est. Duration:</span>
                <span className="font-bold text-slate-900">{formatDuration(routeInfo.durationMin)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-purple-200/60">
                <span className="font-bold text-slate-900">Trip Total:</span>
                <span className="text-base font-extrabold text-purple-700">₹{distancePrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="h-px bg-slate-100 my-1" />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STANDARD: Selected Package Header & Pricing
      ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
            <Sparkles size={11} className="text-purple-600" />
            {isRental && distanceKm > 0 ? "Trip Estimate" : "Selected Package"}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Instant Booking
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 m-0 leading-snug">
          {isRental && distanceKm > 0
            ? `${pickupName} → ${dropoffName}`
            : (pkg?.title ?? service?.name)}
        </h3>

        {/* Price Row with strikethrough comparison */}
        <div className="flex items-baseline gap-2.5 mt-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ₹{tripTotal.toLocaleString("en-IN")}
          </span>
          {/* removed fabricated 1.25x strike-through price */}
          {service?.priceUnit && !isRental && (
            <span className="text-xs text-slate-500 font-normal">
              /{service.priceUnit}
            </span>
          )}
        </div>
      </div>

      {/* Doorstep location badge */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
        <MapPin size={14} className="text-purple-600 shrink-0" />
        <span>Doorstep service executed at your home</span>
      </div>

      {/* Package Features List */}
      {pkg?.features && pkg.features.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
            Package Inclusions:
          </span>
          <ul className="m-0 p-0 list-none space-y-1.5 text-xs text-slate-600">
            {pkg.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pay after service reassurance */}
      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Pay After Service</span>
        </div>
        <p className="m-0 text-emerald-700/90 leading-tight">
          No advance payment required. Inspect the work and pay safely via UPI or Cash.
        </p>
      </div>

      {/* Main Book Now Button */}
      <button
        type="button"
        onClick={handleBook}
        className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0"
      >
        <span>Book Now</span>
        <ArrowRight size={16} />
      </button>

      {/* Assurance footer */}
      <div className="text-center pt-1 border-t border-slate-100 text-[11px] text-slate-400">
        <span>Verified technicians • Standardized rates</span>
      </div>
    </div>
  );
};

export default BookingCard;