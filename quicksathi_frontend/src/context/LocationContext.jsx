import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Supported Cities (kept for backward compatibility with admin/provider panels) ──
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

const STORAGE_KEY = "qs_location";
const LocationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};

// ── Reverse geocode coordinates → full address via OpenStreetMap (free) ───────
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Nominatim fetch failed");
    const data = await res.json();
    const addr = data?.address || {};

    const parts = [];
    if (addr.neighbourhood) parts.push(addr.neighbourhood);
    else if (addr.suburb) parts.push(addr.suburb);
    else if (addr.road) parts.push(addr.road);
    else if (addr.hamlet) parts.push(addr.hamlet);
    else if (addr.village) parts.push(addr.village);

    if (addr.city_district && !parts.includes(addr.city_district)) {
      parts.push(addr.city_district);
    }

    const cityName = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || "";
    if (cityName && !parts.includes(cityName)) {
      parts.push(cityName);
    }

    if (addr.state && !parts.includes(addr.state)) {
      parts.push(addr.state);
    }

    if (parts.length === 0) return null;

    const fullLocation = parts.join(", ");
    const city = cityName || parts[0];

    return { fullLocation, city, lat, lon };
  } catch {
    return null;
  }
}

// ── IP-based geolocation fallback (works 100% reliably without GPS hardware/prompts) ──
async function detectByIP() {
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (!res.ok) throw new Error("IP Geolocation failed");
    const data = await res.json();
    if (!data.success && data.message) throw new Error(data.message);

    const lat = data.latitude;
    const lon = data.longitude;
    const city = data.city || data.region || "Delhi";
    const region = data.region || "";

    // Try reverse geocoding the IP coordinates for sub-locality
    if (lat && lon) {
      const detailed = await reverseGeocode(lat, lon);
      if (detailed) return detailed;
    }

    const fullLocation = region && region !== city ? `${city}, ${region}` : city;
    return { fullLocation, city, lat, lon };
  } catch (err) {
    console.warn("IP Geolocation fallback failed:", err);
    return null;
  }
}

export const LocationProvider = ({ children }) => {
  const [locationData, setLocationDataRaw] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it's a valid detailed location and not plain "Patna", use it
        if (parsed?.fullLocation && parsed.fullLocation !== "Patna") {
          return parsed;
        }
      } catch {
        // invalid JSON
      }
    }
    return null;
  });

  const [detecting, setDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Persist location to localStorage
  const setLocationData = useCallback((newData) => {
    if (newData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLocationDataRaw(newData);
  }, []);

  // Backward-compatible setCity
  const setCity = useCallback((newCity) => {
    if (newCity) {
      setLocationData({ fullLocation: newCity, city: newCity });
    } else {
      setLocationData(null);
    }
  }, [setLocationData]);

  // Main detection function (GPS -> IP fallback)
  const detectExactLocation = useCallback(async (force = false) => {
    setDetecting(true);
    setPermissionDenied(false);

    const runIPFallback = async () => {
      const ipResult = await detectByIP();
      if (ipResult) {
        setLocationData(ipResult);
      }
      setDetecting(false);
      setShowBanner(true);
    };

    if (!navigator.geolocation) {
      await runIPFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const detected = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (detected) {
            setLocationData(detected);
          } else {
            await runIPFallback();
          }
        } catch {
          await runIPFallback();
        } finally {
          setDetecting(false);
          setShowBanner(true);
        }
      },
      async () => {
        // Geolocation denied, unavailable, or timed out -> use IP Geolocation
        setPermissionDenied(true);
        await runIPFallback();
      },
      { timeout: 6000, maximumAge: force ? 0 : 300000, enableHighAccuracy: true }
    );
  }, [setLocationData]);

  // Auto-detect on first load if no location or if stale "Patna"
  useEffect(() => {
    if (!locationData || locationData.fullLocation === "Patna" || !locationData.fullLocation?.includes(",")) {
      detectExactLocation();
    }
  }, [locationData, detectExactLocation]);

  return (
    <LocationContext.Provider
      value={{
        fullLocation: locationData?.fullLocation || null,
        city: locationData?.city || null,
        setCity,
        setLocationData,
        detectExactLocation,
        detecting,
        permissionDenied,
        showBanner,
        setShowBanner,
        cityOptions: CITY_OPTIONS,
        isFiltered: !!locationData?.city && locationData.city !== "all",
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
