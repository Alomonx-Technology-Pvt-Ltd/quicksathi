import { useState, useRef, useEffect } from "react";
import { useLocation, CITY_OPTIONS } from "../../context/LocationContext";

/**
 * LocationBanner — a slim, elegant bar shown at the top of service pages.
 * Displays the detected/selected city, lets users change it via a dropdown.
 * Styled using QuickSathi brand colours (deep blue, orange accent).
 */
export default function LocationBanner() {
  const { city, setCity, detecting, showBanner } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchCity("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!showBanner) return null;

  const filtered = CITY_OPTIONS.filter((c) =>
    c.toLowerCase().includes(searchCity.toLowerCase())
  );

  const handleSelect = (c) => {
    setCity(c);
    setDropdownOpen(false);
    setSearchCity("");
  };

  const handleShowAll = () => {
    setCity(null);
    setDropdownOpen(false);
    setSearchCity("");
  };

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0e1e52 0%, #1a3a8b 50%, #0e1e52 100%)",
        borderBottom: "1px solid rgba(232,92,42,0.25)",
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
          color: "rgba(255,255,255,0.55)",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: "500",
          flexShrink: 0,
        }}
      >
        Showing services in:
      </span>

      {/* City display + change button */}
      <div ref={dropRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setDropdownOpen((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(232,92,42,0.18)",
            border: "1px solid rgba(232,92,42,0.45)",
            borderRadius: "20px",
            padding: "4px 13px",
            cursor: "pointer",
            color: "white",
            fontFamily: "Inter, sans-serif",
            fontSize: "12.5px",
            fontWeight: "600",
            transition: "all 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,92,42,0.3)";
            e.currentTarget.style.borderColor = "rgba(232,92,42,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(232,92,42,0.18)";
            e.currentTarget.style.borderColor = "rgba(232,92,42,0.45)";
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
                  borderTopColor: "#e85c2a",
                  animation: "locSpin 0.8s linear infinite",
                }}
              />
              Detecting…
            </>
          ) : (
            <>
              {city || "All Cities"}
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
                placeholder="Search city…"
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

            {/* All Cities option */}
            <button
              onClick={handleShowAll}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 14px",
                textAlign: "left",
                background: !city ? "rgba(232,92,42,0.15)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                color: !city ? "#e85c2a" : "rgba(255,255,255,0.7)",
                fontSize: "12.5px",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                fontWeight: !city ? "600" : "400",
              }}
            >
              🌐 All Cities
            </button>

            {/* City list */}
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {filtered.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelect(c)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 14px",
                    textAlign: "left",
                    background: city === c ? "rgba(232,92,42,0.15)" : "transparent",
                    border: "none",
                    color: city === c ? "#e85c2a" : "rgba(255,255,255,0.75)",
                    fontSize: "12.5px",
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    fontWeight: city === c ? "600" : "400",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (city !== c) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (city !== c) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {c}
                  {city === c && (
                    <span style={{ float: "right", fontSize: "11px" }}>✓</span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "12px",
                    textAlign: "center",
                    padding: "12px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  No cities found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info text */}
      {!city && !detecting && (
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "11.5px",
            fontFamily: "Inter, sans-serif",
            fontStyle: "italic",
          }}
        >
          Select your city for local services
        </span>
      )}

      {city && (
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
