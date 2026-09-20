import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2, Crosshair, Navigation } from "lucide-react";
import { useLocation } from "../../context/LocationContext";

/**
 * LocationSearch — Autocomplete address input using OpenStreetMap Nominatim with
 * high-precision street/road/gully detection and 1-click GPS auto-pinpointing.
 *
 * Props:
 *   placeholder  – input placeholder text
 *   value        – controlled display value
 *   onSelect     – callback: ({ name, shortName, road, locality, city, lat, lon, isGps, accuracy }) => void
 *   onClear      – callback when user clears the input
 *   icon         – optional lucide icon component (defaults to MapPin)
 *   accentColor  – optional accent colour string
 *   showGpsBtn   – boolean to show 1-click GPS target button (default true)
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEBOUNCE_MS = 350;

const LocationSearch = ({
  placeholder = "Search street, road, gully, or area…",
  value = "",
  onSelect,
  onClear,
  icon: IconComp = MapPin,
  accentColor = "#1a3a6b",
  showGpsBtn = true,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isGpsSelected, setIsGpsSelected] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Hook into LocationContext for high-accuracy GPS
  const { detectExactLocation, detecting } = useLocation();

  // Sync controlled value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Nominatim search — preserves specific roads, gullies, lanes, buildings
  const search = useCallback(
    (q) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            q,
            format: "json",
            addressdetails: "1",
            limit: "7",
            countrycodes: "in", // Prioritize India
          });
          const res = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: { "Accept-Language": "en" },
          });
          const data = await res.json();
          setResults(
            (data || []).map((item) => {
              const addr = item.address || {};
              const road =
                addr.road ||
                addr.street ||
                addr.residential ||
                addr.lane ||
                addr.alley ||
                addr.pedestrian ||
                addr.footway ||
                addr.building ||
                "";
              const locality =
                addr.neighbourhood ||
                addr.suburb ||
                addr.colony ||
                addr.mohalla ||
                addr.quarter ||
                "";
              const city =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                addr.county ||
                "";
              const state = addr.state || "";

              // Retain road / gully at the front of shortName
              const roadHierarchy = [road, locality, city].filter(Boolean);
              const shortName =
                roadHierarchy.length > 0
                  ? roadHierarchy.join(", ")
                  : item.display_name.split(",").slice(0, 3).join(", ");

              return {
                name: item.display_name,
                shortName,
                road,
                locality,
                city,
                state,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
              };
            })
          );
          setOpen(true);
        } catch (err) {
          console.warn("Nominatim search error:", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setIsGpsSelected(false);
    search(v);
  };

  const handleSelect = (item) => {
    setQuery(item.shortName || item.name);
    setIsGpsSelected(!!item.isGps);
    setOpen(false);
    setResults([]);
    onSelect?.(item);
  };

  const handleClear = () => {
    setQuery("");
    setIsGpsSelected(false);
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  // 1-Click Exact GPS Detection
  const handleDetectCurrentLocation = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (detecting) return;

    const detected = await detectExactLocation(true);
    if (detected) {
      const selected = {
        name: detected.fullLocation,
        shortName: detected.street || detected.fullLocation,
        road: detected.road,
        gully: detected.gully,
        locality: detected.locality,
        city: detected.city,
        state: detected.state,
        pincode: detected.pincode,
        lat: detected.lat,
        lon: detected.lon,
        accuracy: detected.accuracy,
        isGps: true,
      };
      handleSelect(selected);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <IconComp
          size={16}
          strokeWidth={1.8}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: isGpsSelected ? "#16a34a" : accentColor }}
        />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 rounded-xl text-sm border outline-none transition-all duration-200"
          style={{
            fontFamily: "var(--font-body)",
            borderColor: open ? accentColor : isGpsSelected ? "#16a34a" : "var(--color-border)",
            backgroundColor: isGpsSelected ? "rgba(22, 163, 74, 0.03)" : "var(--color-bg-white)",
            color: "var(--color-text-dark)",
            boxShadow: open ? `0 0 0 2px ${accentColor}22` : "none",
          }}
        />

        {/* Action icons on right: GPS Target + Clear / Loading */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showGpsBtn && (
            <button
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={detecting}
              title="Detect exact GPS location (street & gully level)"
              className="p-1.5 rounded-lg border-0 cursor-pointer transition-all duration-150 hover:bg-orange-50 disabled:opacity-50"
              style={{
                backgroundColor: isGpsSelected ? "#16a34a15" : "rgba(255,107,0,0.12)",
                color: isGpsSelected ? "#16a34a" : "#ff6b00",
                lineHeight: 0,
              }}
            >
              {detecting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Crosshair size={15} strokeWidth={2.2} />
              )}
            </button>
          )}

          {loading ? (
            <Loader2
              size={15}
              className="animate-spin ml-0.5"
              style={{ color: accentColor }}
            />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full border-0 cursor-pointer transition-all hover:bg-gray-100"
              style={{ background: "transparent", lineHeight: 0 }}
            >
              <X size={14} style={{ color: "#999" }} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden shadow-2xl border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "var(--color-border)",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          {/* Top GPS Quick-Action Button */}
          {showGpsBtn && (
            <button
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={detecting}
              className="w-full flex items-center gap-2.5 px-4 py-3 border-0 cursor-pointer text-left transition-colors duration-150 hover:bg-orange-50/80"
              style={{
                background: "rgba(255,107,0,0.06)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#ff6b0018", color: "#ff6b00" }}
              >
                {detecting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Navigation size={15} strokeWidth={2.2} />
                )}
              </div>
              <div className="flex-1">
                <p
                  className="text-xs font-semibold m-0 leading-tight flex items-center gap-1.5"
                  style={{ color: "#c2410c", fontFamily: "var(--font-body)" }}
                >
                  {detecting ? "Locating high-precision GPS…" : "Use My Exact Current Location"}
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 font-bold uppercase tracking-wider">
                    GPS Fix
                  </span>
                </p>
                <p
                  className="text-[11px] m-0 mt-0.5 leading-snug text-gray-500 line-clamp-1"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Pinpoint down to your exact road, gully, and lane
                </p>
              </div>
            </button>
          )}

          {/* Search Results */}
          {results.map((item, i) => (
            <button
              type="button"
              key={`${item.lat}-${item.lon}-${i}`}
              onClick={() => handleSelect(item)}
              className="w-full flex items-start gap-2.5 px-4 py-3 border-0 cursor-pointer text-left transition-colors duration-150 hover:bg-gray-50"
              style={{
                background: "transparent",
                borderBottom:
                  i < results.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}
            >
              <MapPin
                size={15}
                strokeWidth={1.8}
                className="mt-0.5 flex-shrink-0"
                style={{ color: accentColor }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold m-0 leading-snug truncate"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  {item.shortName}
                </p>
                <p
                  className="text-[11px] m-0 mt-0.5 leading-snug line-clamp-1 text-gray-400"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.name}
                </p>
              </div>
            </button>
          ))}

          {/* Empty hint when open with no query */}
          {results.length === 0 && !loading && (
            <div className="px-4 py-3 text-center text-xs text-gray-400">
              {query && query.length >= 2
                ? "No exact street or area matches found"
                : "Type street name, road, gully, or landmark to search"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
