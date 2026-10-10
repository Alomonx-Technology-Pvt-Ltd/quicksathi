/**
 * Google Maps SDK & Services Loader for QuickSathi
 *
 * Provides:
 * 1. Safe dynamic loading of Google Maps JavaScript API (Places & Geometry libraries)
 * 2. High-precision Reverse Geocoding via google.maps.Geocoder (zero hardcoded cities)
 * 3. High-precision Autocomplete Place Search with in-memory caching and throttle protection
 * 4. Automatic gm_authFailure detection to immediately fall back to OpenStreetMap / Photon
 */

let loadPromise = null;
let isAuthBlocked =
  typeof window !== "undefined" &&
  window.sessionStorage?.getItem("qs_gmaps_blocked") === "true";
const placeCache = new Map();

export const markGoogleMapsBlocked = () => {
  isAuthBlocked = true;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage?.setItem("qs_gmaps_blocked", "true");
    } catch {
      // ignore storage access errors
    }
  }
};

// Hook global auth failure callback so unauthorized or unactivated API keys trigger instant fallback
if (typeof window !== "undefined") {
  const previousAuthFailure = window.gm_authFailure;
  window.gm_authFailure = () => {
    markGoogleMapsBlocked();
    console.warn(
      "[QuickSathi GoogleMaps] Google Maps API key authentication/activation failed (ApiNotActivatedMapError or restricted key). Automatically failing over to OpenStreetMap + Photon."
    );
    if (typeof previousAuthFailure === "function") {
      previousAuthFailure();
    }
  };
}

export const getGoogleMapsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
};

export const isGoogleMapsAvailable = () => {
  if (typeof window === "undefined") return false;
  if (isAuthBlocked) return false;
  return Boolean(getGoogleMapsApiKey());
};

/**
 * Dynamically loads the Google Maps JavaScript API once.
 * Returns true if loaded successfully, false otherwise.
 */
export const loadGoogleMapsScript = async () => {
  if (typeof window === "undefined") return false;
  if (isAuthBlocked) return false;

  // Already fully loaded
  if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
    return true;
  }

  if (loadPromise) return loadPromise;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return false;
  }

  loadPromise = new Promise((resolve) => {
    let settled = false;

    const finalize = (success) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (!success) {
        loadPromise = null; // Allow retry on reconnection
      }
      resolve(success);
    };

    // Fast 2.5s timeout for Google Maps script before falling back to OpenStreetMap
    const timeoutId = setTimeout(() => {
      console.warn("[QuickSathi GoogleMaps] Script load timed out after 2.5s. Seamlessly falling back to OpenStreetMap.");
      finalize(false);
    }, 2500);

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
        finalize(true);
        return;
      }
      existingScript.addEventListener("load", () => {
        finalize(Boolean(window.google?.maps));
      });
      existingScript.addEventListener("error", () => {
        markGoogleMapsBlocked();
        finalize(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      finalize(Boolean(window.google?.maps));
    };

    script.onerror = (err) => {
      console.warn("[QuickSathi GoogleMaps] Script element failed to load:", err);
      markGoogleMapsBlocked();
      finalize(false);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Reverse geocodes coordinates (lat, lon) using Google Maps Geocoder.
 * Returns structured address object with doorstep, road, gully, building, locality, city, etc.
 * Zero hardcoded fallback cities (never forces "Patna" or "Bihar").
 */
export async function reverseGeocodeGoogle(lat, lon, accuracy = null) {
  if (!isGoogleMapsAvailable()) return null;

  try {
    const isLoaded = await loadGoogleMapsScript();
    if (!isLoaded || !window.google?.maps?.Geocoder) return null;

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          resolve(results);
        } else {
          if (status === "REQUEST_DENIED" || status === "ApiNotActivatedMapError") {
            markGoogleMapsBlocked();
          }
          resolve(null);
        }
      });
    });

    if (!response || response.length === 0) return null;

    const best = response[0];
    const components = best.address_components || [];

    const getComp = (type, useShort = false) => {
      const c = components.find((comp) => comp.types.includes(type));
      return c ? (useShort ? c.short_name : c.long_name) : "";
    };

    const houseNumber = getComp("street_number");
    const route = getComp("route"); // Road, Street, Marg, Gully
    const building =
      getComp("premise") ||
      getComp("subpremise") ||
      getComp("point_of_interest") ||
      getComp("establishment") ||
      "";

    const sublocality3 = getComp("sublocality_level_3");
    const sublocality2 = getComp("sublocality_level_2");
    const sublocality1 = getComp("sublocality_level_1");
    const neighborhood = getComp("neighborhood");

    const locality =
      sublocality3 ||
      sublocality2 ||
      sublocality1 ||
      neighborhood ||
      "";

    const city =
      getComp("locality") ||
      getComp("administrative_area_level_2") ||
      getComp("sublocality_level_1") ||
      "";

    const district = getComp("administrative_area_level_2");
    const state = getComp("administrative_area_level_1") || "";
    const pincode = getComp("postal_code");

    // Primary doorstep identifier (Building, House#, Road/Gully)
    const primaryParts = [];
    if (building) primaryParts.push(building);
    if (route) {
      if (houseNumber && !route.includes(houseNumber)) {
        primaryParts.push(`${route} #${houseNumber}`);
      } else {
        primaryParts.push(route);
      }
    } else if (houseNumber) {
      primaryParts.push(`House #${houseNumber}`);
    }

    // Full hierarchical location
    const parts = [...primaryParts];
    if (locality && !parts.includes(locality)) parts.push(locality);
    if (district && !parts.includes(district) && district !== city) parts.push(district);
    if (city && !parts.includes(city)) parts.push(city);
    if (state && !parts.includes(state)) parts.push(state);

    const fullLocation = parts.length > 0 ? parts.join(", ") : best.formatted_address;
    const street =
      primaryParts.join(", ") || (locality ? `Near ${locality}` : city || fullLocation);

    return {
      fullLocation,
      street,
      road: route || "",
      gully: route || "",
      locality,
      building,
      houseNumber,
      city: city || locality || district,
      state,
      pincode,
      lat,
      lon,
      accuracy: accuracy ? Math.round(accuracy) : null,
      isGpsAccurate: accuracy ? accuracy <= 35 : true,
      isBroadArea: !route && !building,
      source: "google",
      version: 2,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn("[QuickSathi GoogleMaps] Reverse geocode error:", err);
    return null;
  }
}

/**
 * Searches places & addresses using Google Places AutocompleteService.
 * Returns array of { id, label, road, locality, street, city, state, lat, lon }
 * Includes caching and throttled resolution to prevent OVER_QUERY_LIMIT.
 */
export async function searchGooglePlaces(query) {
  if (!query || !query.trim() || !isGoogleMapsAvailable()) return [];
  const q = query.trim().toLowerCase();

  if (placeCache.has(q)) {
    return placeCache.get(q);
  }

  try {
    const isLoaded = await loadGoogleMapsScript();
    if (!isLoaded || !window.google?.maps?.places?.AutocompleteService) return [];

    const autoService = new window.google.maps.places.AutocompleteService();
    const geocoder = new window.google.maps.Geocoder();

    const predictions = await new Promise((resolve) => {
      autoService.getPlacePredictions(
        {
          input: query.trim(),
          componentRestrictions: { country: "in" }, // Focus on India
        },
        (res, status) => {
          if (
            (status === "OK" || status === window.google?.maps?.places?.PlacesServiceStatus?.OK) &&
            res &&
            res.length > 0
          ) {
            resolve(res);
          } else {
            if (
              status === "REQUEST_DENIED" ||
              status === "ApiNotActivatedMapError" ||
              status === "INVALID_REQUEST"
            ) {
              markGoogleMapsBlocked();
            }
            resolve([]);
          }
        }
      );
    });

    if (!predictions || predictions.length === 0) return [];

    // Limit to top 3 predictions to save quota and prevent client throttling
    const limited = predictions.slice(0, 3);
    const geocodePromises = limited.map((pred) => {
      const placeId = pred.place_id;
      if (placeCache.has(placeId)) {
        return Promise.resolve(placeCache.get(placeId));
      }

      return new Promise((resolve) => {
        // Individual geocode timeout (1.5s max)
        const itemTimeout = setTimeout(() => resolve(null), 1500);

        geocoder.geocode({ placeId }, (results, status) => {
          clearTimeout(itemTimeout);
          if (status === "OK" && results?.[0]) {
            const r = results[0];
            const loc = r.geometry.location;
            const components = r.address_components || [];
            const getComp = (type) =>
              components.find((c) => c.types.includes(type))?.long_name || "";

            const road = getComp("route") || pred.structured_formatting?.main_text || "";
            const locality =
              getComp("sublocality_level_1") ||
              getComp("sublocality_level_2") ||
              getComp("neighborhood") ||
              "";
            const city =
              getComp("locality") ||
              getComp("administrative_area_level_2") ||
              "";
            const state = getComp("administrative_area_level_1") || "";
            const pincode = getComp("postal_code") || "";

            const item = {
              id: `gmap-${placeId}`,
              placeId,
              label: pred.description,
              road,
              locality,
              street: pred.structured_formatting?.main_text || road || locality || city,
              displayName: pred.description,
              city: city || locality,
              state,
              pincode,
              lat: loc.lat(),
              lon: loc.lng(),
              source: "google",
            };
            placeCache.set(placeId, item);
            resolve(item);
          } else {
            resolve(null);
          }
        });
      });
    });

    const settled = await Promise.all(geocodePromises);
    const validResults = settled.filter(Boolean);

    if (validResults.length > 0) {
      placeCache.set(q, validResults);
    }
    return validResults;
  } catch (err) {
    console.warn("[QuickSathi GoogleMaps] Autocomplete error:", err);
    return [];
  }
}
