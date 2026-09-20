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

// ── Reverse geocode coordinates → precise road/gully/alley/building address via OpenStreetMap + Photon ─────
// zoom=18 gives building/road-level address details; Photon identifies named gullies & POIs.
export async function reverseGeocode(lat, lon, accuracy = null) {
  try {
    const [nomRes, phoRes] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
        { headers: { "Accept-Language": "en", "User-Agent": "TiptoBook/2.0" } }
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(
        `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}&limit=6`,
        { headers: { "Accept-Language": "en", "User-Agent": "TiptoBook/2.0" } }
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    const addr = nomRes?.address || {};
    const phoFeatures = phoRes?.features || [];

    // Find nearby named street or highway from Photon
    const phoStreetFeature = phoFeatures.find(
      (f) =>
        f.properties?.osm_key === "highway" &&
        f.properties?.name &&
        !["Flyover", "Bridge", "Overpass"].includes(f.properties.name)
    );
    const phoStreet = phoStreetFeature?.properties?.name || "";

    // Find nearby landmark, shop, or amenity POI from Photon
    const phoPOIFeature = phoFeatures.find(
      (f) =>
        f.properties?.name &&
        !["district", "city", "country", "state", "county"].includes(f.properties?.type) &&
        !["Flyover", "Bridge", "Overpass"].includes(f.properties.name) &&
        f.properties?.name !== phoStreet
    );
    const phoPOI = phoPOIFeature?.properties?.name || "";

    // 1. Building / Landmark / Complex / Shop / House
    let buildingOrPOI =
      addr.building ||
      addr.amenity ||
      addr.shop ||
      addr.office ||
      addr.house_name ||
      addr.commercial ||
      phoPOI ||
      "";

    // Only treat addr.place as a POI if it's a real name and not just a numeric ward number
    if (!buildingOrPOI && addr.place && !/^\d+$/.test(addr.place.trim())) {
      buildingOrPOI = addr.place;
    }
    if (buildingOrPOI && /^\d+$/.test(buildingOrPOI.trim())) {
      buildingOrPOI = "";
    }

    // 2. Road / Street / Gully / Alley / Lane / Residential
    let roadOrGully =
      addr.road ||
      addr.street ||
      addr.residential ||
      addr.lane ||
      addr.alley ||
      addr.pedestrian ||
      addr.footway ||
      addr.path ||
      addr.service ||
      phoStreet ||
      "";

    // 3. House / Plot number
    const houseNumber = addr.house_number || "";

    // 4. Locality / Mohalla / Colony / Suburb / Sector / Quarter
    const locality =
      addr.neighbourhood ||
      addr.suburb ||
      addr.colony ||
      addr.mohalla ||
      addr.quarter ||
      addr.hamlet ||
      addr.village ||
      phoFeatures[0]?.properties?.district ||
      "";

    // 5. District / Zone
    const district = addr.city_district || addr.subdistrict || addr.zone || "";

    // 6. City / Town
    const cityName =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      phoFeatures[0]?.properties?.city ||
      "Patna";

    // 7. State & Pincode
    const state = addr.state || phoFeatures[0]?.properties?.state || "Bihar";
    const postcode = addr.postcode || phoFeatures[0]?.properties?.postcode || "";

    // If still no named road, but we know it's a residential gully or near a landmark:
    if (!roadOrGully) {
      if (buildingOrPOI) {
        roadOrGully = `Near ${buildingOrPOI}`;
      } else if (
        nomRes?.class === "highway" ||
        nomRes?.type === "residential" ||
        nomRes?.type === "living_street" ||
        nomRes?.addresstype === "road"
      ) {
        roadOrGully = "Residential Lane / Gully";
      }
    }

    // Construct primary address line (Road / Gully / Building)
    const primaryParts = [];
    if (buildingOrPOI && !roadOrGully.includes(buildingOrPOI)) {
      primaryParts.push(buildingOrPOI);
    }
    if (roadOrGully) {
      if (houseNumber && !roadOrGully.includes(houseNumber)) {
        primaryParts.push(`${roadOrGully} #${houseNumber}`);
      } else {
        primaryParts.push(roadOrGully);
      }
    } else if (houseNumber) {
      primaryParts.push(`House #${houseNumber}`);
    }

    // Fallback: If OSM didn't label the road explicitly, extract the first segment of display_name
    if (primaryParts.length === 0 && nomRes?.display_name) {
      const displayParts = nomRes.display_name.split(",").map((s) => s.trim());
      if (
        displayParts.length > 0 &&
        displayParts[0] !== cityName &&
        displayParts[0] !== state &&
        displayParts[0] !== locality
      ) {
        primaryParts.push(displayParts[0]);
      }
    }

    // Build hierarchical full location string
    const parts = [...primaryParts];
    if (locality && !parts.includes(locality)) parts.push(locality);
    if (district && !parts.includes(district) && district !== cityName) parts.push(district);
    if (cityName && !parts.includes(cityName)) parts.push(cityName);
    if (state && !parts.includes(state)) parts.push(state);

    if (parts.length === 0) return null;

    const fullLocation = parts.join(", ");
    const street = primaryParts.join(", ") || (locality ? `Near ${locality}` : cityName);
    const isBroad = !roadOrGully && !buildingOrPOI;

    return {
      fullLocation,
      street,
      road: roadOrGully || "",
      gully: roadOrGully || "",
      locality,
      building: buildingOrPOI,
      houseNumber,
      city: cityName,
      state,
      pincode: postcode,
      lat,
      lon,
      accuracy: accuracy ? Math.round(accuracy) : null,
      isGpsAccurate: accuracy ? accuracy <= 35 : false,
      isBroadArea: isBroad,
      version: 2,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn("Reverse geocoding error:", err);
    return null;
  }
}

// ── Live city/area/street search via OpenStreetMap + Photon (gullies & lanes) ──
export async function searchLocation(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  try {
    const [nomData, photonData] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          q
        )}&format=json&addressdetails=1&limit=8&countrycodes=in`,
        { headers: { "Accept-Language": "en" } }
      )
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          q
        )}&limit=8`,
        { headers: { "Accept-Language": "en" } }
      )
        .then((r) => (r.ok ? r.json() : { features: [] }))
        .catch(() => ({ features: [] })),
    ]);

    const results = [];
    const seen = new Set();

    // 1. Process Nominatim results
    for (const item of nomData || []) {
      const addr = item.address || {};
      const roadOrGully =
        addr.road ||
        addr.street ||
        addr.lane ||
        addr.alley ||
        addr.residential ||
        addr.pedestrian ||
        addr.building ||
        "";
      const locality =
        addr.neighbourhood || addr.suburb || addr.colony || addr.mohalla || addr.quarter || "";
      const cityName =
        addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district || "";
      const state = addr.state || "";

      const roadHierarchy = [roadOrGully, locality, cityName].filter(Boolean);
      const label = roadHierarchy.length > 0 ? roadHierarchy.join(", ") : item.display_name;
      const key = `${parseFloat(item.lat).toFixed(4)},${parseFloat(item.lon).toFixed(4)}`;

      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: `nom-${item.place_id}`,
          label,
          road: roadOrGully,
          locality,
          street: roadOrGully || locality || cityName,
          displayName: item.display_name,
          city: cityName,
          state,
          pincode: addr.postcode || "",
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        });
      }
    }

    // 2. Process Photon results (often contains specific gullies & roads)
    for (const f of photonData?.features || []) {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [];
      if (coords.length < 2) continue;
      const lon = coords[0];
      const lat = coords[1];
      const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;

      if (!seen.has(key)) {
        seen.add(key);
        const road = p.street || (p.type === "street" ? p.name : "");
        const locality = p.district || (p.type === "district" ? p.name : "");
        const name = p.name || "";
        const city = p.city || p.county || "";
        const state = p.state || "";

        const parts = [];
        if (name && !parts.includes(name)) parts.push(name);
        if (road && !parts.includes(road)) parts.push(road);
        if (locality && !parts.includes(locality)) parts.push(locality);
        if (city && !parts.includes(city)) parts.push(city);

        const label = parts.join(", ");
        results.push({
          id: `pho-${p.osm_id || Math.random()}`,
          label,
          road: road || name,
          locality: locality || city,
          street: name || road || locality || city,
          displayName: label,
          city: city || locality,
          state,
          pincode: p.postcode || "",
          lat,
          lon,
        });
      }
    }

    return results;
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
        // Require version 2 and precise street/road to avoid stale broad "Digha, Patna, Bihar"
        const hasSpecificStreet =
          parsed?.street &&
          parsed.street !== parsed?.city &&
          parsed.street !== parsed?.locality &&
          !["Digha, Patna, Bihar", "Patna", "Patna, Bihar"].includes(parsed.fullLocation);

        if (
          parsed?.version === 2 &&
          hasSpecificStreet &&
          parsed?.timestamp &&
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

  // Main detection — High-Accuracy GPS with satellite refinement
  // Streams fixes via watchPosition to lock onto true satellite accuracy (<= 25m)
  const detectExactLocation = useCallback(
    async (force = false) => {
      setDetecting(true);
      setLocationError(null);
      setPermissionDenied(false);

      if (!navigator.geolocation) {
        setDetecting(false);
        setLocationError("Geolocation is not supported by this browser. Search your city instead.");
        return null;
      }

      return new Promise((resolve) => {
        let bestPosition = null;
        let watchId = null;
        let finished = false;

        const completeWithPosition = async (pos) => {
          if (finished) return;
          finished = true;
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }

          try {
            const detected = await reverseGeocode(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.accuracy
            );
            if (detected) {
              setLocationData(detected);
              setShowBanner(true);
              setDetecting(false);
              resolve(detected);
              return;
            }
          } catch {
            // fallback
          }

          setLocationError("Couldn't read your street address. Search your location instead.");
          setDetecting(false);
          setShowBanner(true);
          resolve(null);
        };

        // Safety timeout after 10s: finish with best position seen so far
        const timer = setTimeout(() => {
          if (bestPosition) {
            completeWithPosition(bestPosition);
          } else {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            setDetecting(false);
            setLocationError("GPS timeout. Please check your signal or search your location.");
            resolve(null);
          }
        }, 10000);

        // Use watchPosition to stream fixes as satellite accuracy refines
        try {
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              const acc = pos.coords.accuracy;
              if (!bestPosition || acc < bestPosition.coords.accuracy) {
                bestPosition = pos;
              }
              // If accuracy is high enough (<= 25 meters, street/gully level), finish immediately!
              if (acc <= 25) {
                clearTimeout(timer);
                completeWithPosition(pos);
              }
            },
            (err) => {
              // If error and we have no fix yet
              if (!bestPosition) {
                clearTimeout(timer);
                if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                setDetecting(false);
                if (err.code === err.PERMISSION_DENIED) {
                  setPermissionDenied(true);
                  setLocationError("Location permission denied. Please allow location access in your browser.");
                } else {
                  setLocationError("Couldn't get your exact GPS location. Search your location instead.");
                }
                resolve(null);
              }
            },
            {
              enableHighAccuracy: true,
              maximumAge: force ? 0 : 5000,
              timeout: 10000,
            }
          );
        } catch {
          // Fallback to getCurrentPosition if watchPosition throws
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timer);
              completeWithPosition(pos);
            },
            (err) => {
              clearTimeout(timer);
              setDetecting(false);
              if (err.code === err.PERMISSION_DENIED) {
                setPermissionDenied(true);
                setLocationError("Location permission denied. Search your location instead.");
              } else {
                setLocationError("Couldn't get your exact location. Search your location instead.");
              }
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              maximumAge: force ? 0 : 5000,
              timeout: 10000,
            }
          );
        }
      });
    },
    [setLocationData]
  );

  // Allows user to directly set or refine their exact street, gully, house no., or landmark
  const updateExactStreet = useCallback((newStreet) => {
    if (!newStreet || !newStreet.trim()) return;
    const clean = newStreet.trim();
    setLocationDataRaw((prev) => {
      const area = prev?.locality || prev?.city || "Patna";
      const full = clean.toLowerCase().includes(area.toLowerCase())
        ? clean
        : `${clean}, ${area}`;
      const updated = {
        ...(prev || {}),
        street: clean,
        road: clean,
        gully: clean,
        fullLocation: full,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

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
        street: locationData?.street || null,
        road: locationData?.road || null,
        gully: locationData?.gully || null,
        locality: locationData?.locality || null,
        city: locationData?.city || null,
        state: locationData?.state || null,
        pincode: locationData?.pincode || null,
        lat: locationData?.lat || null,
        lon: locationData?.lon || null,
        accuracy: locationData?.accuracy || null,
        isGpsAccurate: locationData?.isGpsAccurate || false,
        isBroadArea: locationData?.isBroadArea || false,
        locationData,
        setCity,
        setLocationData,
        updateExactStreet,
        searchLocation,
        detectExactLocation,
        reverseGeocode,
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
