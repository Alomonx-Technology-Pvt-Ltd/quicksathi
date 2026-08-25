import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

/**
 * LocationSearch — Autocomplete address input using Nominatim (free OpenStreetMap geocoding).
 *
 * Props:
 *   placeholder  – input placeholder text
 *   value        – controlled display value
 *   onSelect     – callback: ({ name, lat, lon }) => void
 *   onClear      – callback when user clears the input
 *   icon         – optional lucide icon component (defaults to MapPin)
 *   accentColor  – optional accent colour string
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEBOUNCE_MS = 350;

const LocationSearch = ({
  placeholder = "Search location…",
  value = "",
  onSelect,
  onClear,
  icon: IconComp = MapPin,
  accentColor = "#1a3a6b",
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

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

  // Debounced Nominatim search
  const search = useCallback(
    (q) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q || q.length < 3) {
        setResults([]);
        setOpen(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            q,
            format: "json",
            addressdetails: "1",
            limit: "5",
            countrycodes: "in", // Prioritize India
          });
          const res = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: { "Accept-Language": "en" },
          });
          const data = await res.json();
          setResults(
            data.map((item) => ({
              name: item.display_name,
              shortName:
                [item.address?.city, item.address?.state]
                  .filter(Boolean)
                  .join(", ") || item.display_name.split(",").slice(0, 2).join(","),
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            }))
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
    search(v);
  };

  const handleSelect = (item) => {
    setQuery(item.shortName || item.name);
    setOpen(false);
    setResults([]);
    onSelect?.(item);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <IconComp
          size={16}
          strokeWidth={1.8}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: accentColor }}
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border outline-none transition-all duration-200"
          style={{
            fontFamily: "var(--font-body)",
            borderColor: open ? accentColor : "var(--color-border)",
            backgroundColor: "var(--color-bg-white)",
            color: "var(--color-text-dark)",
            boxShadow: open ? `0 0 0 2px ${accentColor}22` : "none",
          }}
        />
        {/* Loading / Clear */}
        {loading ? (
          <Loader2
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
            style={{ color: accentColor }}
          />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full border-0 cursor-pointer transition-all hover:bg-gray-100"
            style={{ background: "transparent", lineHeight: 0 }}
          >
            <X size={14} style={{ color: "#999" }} />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid var(--color-border)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {results.map((item, i) => (
            <button
              key={`${item.lat}-${item.lon}-${i}`}
              onClick={() => handleSelect(item)}
              className="w-full flex items-start gap-2.5 px-4 py-3 border-0 cursor-pointer text-left transition-colors duration-150 hover:bg-gray-50"
              style={{
                background: "transparent",
                borderBottom:
                  i < results.length - 1
                    ? "1px solid rgba(0,0,0,0.05)"
                    : "none",
              }}
            >
              <MapPin
                size={14}
                strokeWidth={1.5}
                className="mt-0.5 flex-shrink-0"
                style={{ color: accentColor }}
              />
              <div>
                <p
                  className="text-sm font-medium m-0 leading-snug"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  {item.shortName}
                </p>
                <p
                  className="text-[11px] m-0 mt-0.5 leading-snug line-clamp-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {item.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
