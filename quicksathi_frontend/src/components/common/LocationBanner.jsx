import { useState, useRef, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";

/**
 * LocationBanner — a slim, elegant bar shown at the top of service pages.
 * Displays the detected/selected location, lets users change it via a dropdown.
 * Dropdown contains only: search bar (live search) + "Use Current / Exact Location".
 * Styled using QuickSathi brand colours (deep blue, orange accent).
 */
export default function LocationBanner() {
  const {
    fullLocation,
    setLocationData,
    searchLocation,
    detecting,
    locationError,
    detectExactLocation,
  } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchCity("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Live search (debounced) — searches any city/area via OpenStreetMap
  useEffect(() => {
    if (!searchCity.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchLocation(searchCity);
      setResults(r || []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [searchCity, searchLocation]);

  if (!showBanner) return null;

  const handleSelectResult = (r) => {
    setLocationData({
      fullLocation: r.label,
      city: r.city || r.label,
      lat: r.lat,
      lon: r.lon,
      timestamp: Date.now(),
    });
    setDropdownOpen(false);
    setSearchCity("");
    setResults([]);
  };

  const handleDetectClick = () => {
    if (detectExactLocation) {
      detectExactLocation(true);
    }
    setDropdownOpen(false);
    setSearchCity("");
    setResults([]);
  };

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0739a8 0%, #0b4fd8 50%, #0739a8 100%)",
        borderBottom: "1px solid rgba(255,107,0,0.3)",
        padding: "9px 20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 40,
      }}
    >
      {/* Pin icon */}
      <span style={{ fontSize: "15px", flexShrink: 0 }}>📍</span>

      {/* Label */}
      <span
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "12.5px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Showing services for:
      </span>

      {/* Current City Pill + Dropdown trigger */}
      <div style={{ position: "relative" }} ref={dropRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            background: "rgba(255,107,0,0.18)",
            border: "1px solid rgba(255,107,0,0.45)",
            color: "#ffffff",
            padding: "3px 10px 3px 12px",
            borderRadius: "20px",
            fontSize: "12.5px",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.18s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,107,0,0.30)";
            e.currentTarget.style.borderColor = "rgba(255,107,0,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,107,0,0.18)";
            e.currentTarget.style.borderColor = "rgba(255,107,0,0.45)";
          }}
        >
          {detecting ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#ff6b00",
                  animation: "locSpin 0.8s linear infinite",
                }}
              />
              Detecting…
            </>
          ) : (
            <>
              {fullLocation || "Set your location"}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  opacity: 0.7,
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: "200px",
              background: "linear-gradient(170deg, #0e1e52 0%, #091232 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              overflow: "hidden",
              zIndex: 1000,
              animation: "locFadeIn 0.18s ease-out",
            }}
          >
            {/* Search input */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <input
                autoFocus
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search any city or area…"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  color: "white",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                }}
              />
            </div>

            {/* Detect Current Location Button */}
            <button
              onClick={handleDetectClick}
              disabled={detecting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                width: "100%",
                padding: "8px 14px",
                textAlign: "left",
                background: "rgba(255,107,0,0.18)",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#ff6b00",
                fontSize: "12px",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              <span>🎯</span>
              <span>{detecting ? "Detecting location..." : "Use Current / Exact Location"}</span>
            </button>

            {/* Location error (GPS denied / unavailable) */}
            {locationError && (
              <p
                style={{
                  margin: 0,
                  padding: "7px 14px",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "11px",
                  fontFamily: "Inter, sans-serif",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                ⚠️ {locationError}
              </p>
            )}

            {/* Live search results */}
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {searching && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "12px",
                    textAlign: "center",
                    padding: "12px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Searching…
                </p>
              )}
              {!searching &&
                results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectResult(r)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 14px",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "12.5px",
                      fontFamily: "Inter, sans-serif",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    📍 {r.label}
                  </button>
                ))}
              {!searching && searchCity.trim() && results.length === 0 && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "12px",
                    textAlign: "center",
                    padding: "12px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  No matches found
                </p>
              )}
              {!searching && !searchCity.trim() && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "12px",
                    textAlign: "center",
                    padding: "12px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Type to search your city or area
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info text */}
      {!fullLocation && !detecting && (
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "11.5px",
            fontFamily: "Inter, sans-serif",
            fontStyle: "italic",
          }}
        >
          Set your location for local services
        </span>
      )}

      {fullLocation && (
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "11px",
            fontFamily: "Inter, sans-serif",
            marginLeft: "auto",
          }}
        >
          Showing nearby + universal services
        </span>
      )}

      <style>{`
        @keyframes locSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes locFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
