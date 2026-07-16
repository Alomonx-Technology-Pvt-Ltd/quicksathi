import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Supported Cities ──────────────────────────────────────────────────────────
export const CITY_OPTIONS = [
  "Patna",
  "Delhi",
  "Mumbai",
  "Kolkata",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Bhopal",
  "Indore",
  "Nagpur",
  "Surat",
  "Varanasi",
  "Agra",
];

const STORAGE_KEY = "qs_city";
const LocationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};

// ── Reverse geocode coordinates → city name via OpenStreetMap (free) ──────────
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const addr = data?.address || {};
    // Try city → town → county → state_district in priority order
    const raw =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      "";
    if (!raw) return null;

    // Normalize to match our CITY_OPTIONS (case-insensitive prefix match)
    const normalized = CITY_OPTIONS.find(
      (c) =>
        c.toLowerCase() === raw.toLowerCase() ||
        raw.toLowerCase().startsWith(c.toLowerCase()) ||
        c.toLowerCase().startsWith(raw.toLowerCase())
    );
    return normalized || raw;
  } catch {
    return null;
  }
}

export const LocationProvider = ({ children }) => {
  const [city, setCityRaw] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });
  const [detecting, setDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Persist city to localStorage whenever it changes
  const setCity = useCallback((newCity) => {
    if (newCity) {
      localStorage.setItem(STORAGE_KEY, newCity);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCityRaw(newCity);
  }, []);

  // Auto-detect on first visit (when no city is saved)
  useEffect(() => {
    if (city) return; // already have a city

    if (!navigator.geolocation) {
      setShowBanner(true);
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const detected = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (detected) {
          setCity(detected);
        }
        setDetecting(false);
        setShowBanner(true);
      },
      () => {
        // Permission denied or error
        setPermissionDenied(true);
        setDetecting(false);
        setShowBanner(true);
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show banner on first visit if no city
  useEffect(() => {
    if (!city && !detecting) {
      setShowBanner(true);
    }
  }, [city, detecting]);

  return (
    <LocationContext.Provider
      value={{
        city,
        setCity,
        detecting,
        permissionDenied,
        showBanner,
        setShowBanner,
        cityOptions: CITY_OPTIONS,
        isFiltered: !!city && city !== "all",
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
