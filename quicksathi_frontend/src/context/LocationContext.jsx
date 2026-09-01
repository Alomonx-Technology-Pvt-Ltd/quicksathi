import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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
const CACHE_TTL = 30 * 60 * 1000; // cached location is considered stale after 30 minutes
const LocationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};

// ── Reverse geocode coordinates → precise address via OpenStreetMap (free) ─────
// zoom=18 gives the most precise (building/road-level) address details.
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Nominatim fetch failed");
    const data = await res.json();
    const addr = data?.address || {};

    const parts = [];
    if (addr.house_number && addr.road) parts.push(`${addr.road} ${addr.house_number}`);
    else if (addr.road) parts.push(addr.road);

    const locality =
      addr.neighbourhood || addr.suburb || addr.quarter || addr.hamlet || addr.village;
    if (locality && !parts.includes(locality)) parts.push(locality);

    if (addr.city_district && !parts.includes(addr.city_district)) {
      parts.push(addr.city_district);
    }

    const cityName =
      addr.city || addr.town || addr.municipality || addr.county || addr.state_district || "";
    if (cityName && !parts.includes(cityName)) {
      parts.push(cityName);
    }

    if (addr.state && !parts.includes(addr.state)) {
      parts.push(addr.state);
    }

    if (parts.length === 0) return null;

    const fullLocation = parts.join(", ");
    const city = cityName || parts[0];

    return { fullLocation, city, lat, lon, timestamp: Date.now() };
  } catch {
    return null;
  }
}

// ── Live city/area search via OpenStreetMap (used by the search bar) ───────────
async function searchLocation(query) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query.trim()
      )}&format=json&addressdetails=1&limit=6`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Nominatim search failed");
    const data = await res.json();
    return (data || []).map((item) => {
      const addr = item.address || {};
      const cityName =
        addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
      const label =
        [
          addr.neighbourhood || addr.suburb || addr.road,
          cityName,
          addr.state,
        ]
          .filter(Boolean)
          .join(", ") || item.display_name;
      return {
        id: item.place_id,
        label,
        displayName: item.display_name,
        city: cityName,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });
  } catch {
    return [];
  }
}

export const LocationProvider = ({ children }) => {
  const [locationData, setLocationDataRaw] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use cached location only if it's detailed and still fresh (< 30 min old)
        if (
          parsed?.fullLocation &&
          parsed.fullLocation !== "Patna" &&
          parsed.timestamp &&
          Date.now() - parsed.timestamp < CACHE_TTL
        ) {
          return parsed;
        }
      } catch {
        // invalid JSON
      }
    }
    return null;
  });

  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const autoDetectRan = useRef(false);

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
      setLocationData({ fullLocation: newCity, city: newCity, timestamp: Date.now() });
    } else {
      setLocationData(null);
    }
  }, [setLocationData]);

  // Main detection — GPS only. No IP fallback: IP lookups return the ISP's
  // network location, which is usually the WRONG city. If GPS fails, the user
  // is shown an error and can search for their city manually instead.
  const detectExactLocation = useCallback(
    async (force = false) => {
      setDetecting(true);
      setLocationError(null);
      setPermissionDenied(false);

      if (!navigator.geolocation) {
        setDetecting(false);
        setLocationError("Geolocation is not supported by this browser. Search your city instead.");
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
              setLocationError("Couldn't read your address. Search your city instead.");
            }
          } catch {
            setLocationError("Couldn't read your address. Search your city instead.");
          } finally {
            setDetecting(false);
            setShowBanner(true);
          }
        },
        (err) => {
          setDetecting(false);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setLocationError("Location permission denied. Search your city instead.");
          } else {
            setLocationError("Couldn't get your exact location. Search your city instead.");
          }
        },
        {
          timeout: 15000,
          maximumAge: force ? 0 : 60000, // force => never use cached GPS fix
          enableHighAccuracy: true,
        }
      );
    },
    [setLocationData]
  );

  // Auto-detect once on load — only if there is no fresh cached location.
  useEffect(() => {
    if (autoDetectRan.current) return;
    autoDetectRan.current = true;
    if (!locationData) {
      detectExactLocation();
    }
  }, [locationData, detectExactLocation]);

  return (
    <LocationContext.Provider
      value={{
        fullLocation: locationData?.fullLocation || null,
        city: locationData?.city || null,
        lat: locationData?.lat || null,
        lon: locationData?.lon || null,
        setCity,
        setLocationData,
        searchLocation,
        detectExactLocation,
        detecting,
        locationError,
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
