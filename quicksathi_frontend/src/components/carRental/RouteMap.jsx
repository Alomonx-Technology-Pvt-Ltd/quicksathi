import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode } from "../../context/LocationContext";
import { isGoogleMapsAvailable, markGoogleMapsBlocked } from "../../utils/googleMapsLoader";
import { Crosshair } from "lucide-react";

// Fix Leaflet default marker icons (they break with bundlers)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const createIcon = (color) =>
  L.divIcon({
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; border: 3px solid #fff;
      transform: rotate(-45deg); box-shadow: 0 3px 10px rgba(0,0,0,0.35);
    "></div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

const pickupIcon = createIcon("#16a34a"); // green
const dropoffIcon = createIcon("#dc2626"); // red

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

/**
 * Auto-fit map bounds or center on single position at street-level (zoom 17).
 */
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (positions && positions.length === 1) {
      map.setView(positions[0], 17, { animate: true });
    }
  }, [map, positions]);
  return null;
};

/**
 * Quick button to re-center on exact pickup spot at street level.
 */
const RecenterControl = ({ target }) => {
  const map = useMap();
  if (!target || !target.lat || !target.lon) return null;

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "auto", margin: "10px" }}>
      <button
        type="button"
        onClick={() => map.setView([target.lat, target.lon], 17, { animate: true })}
        title="Zoom to exact street / gully pickup spot"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer shadow-md text-xs font-semibold"
        style={{
          backgroundColor: "#ffffff",
          color: "#16a34a",
          border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <Crosshair size={14} strokeWidth={2.5} />
        <span>Street View</span>
      </button>
    </div>
  );
};

/**
 * Toggle between Google Roadmap, Google Satellite / Hybrid, and OpenStreetMap.
 */
const MapTypeControl = ({ mapLayer, onToggle, isGoogleReady }) => {
  return (
    <div className="leaflet-top leaflet-left" style={{ pointerEvents: "auto", margin: "10px 10px 10px 60px" }}>
      <div
        className="flex items-center rounded-lg shadow-md overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.14)",
          fontFamily: "var(--font-body, system-ui, sans-serif)",
        }}
      >
        <button
          type="button"
          onClick={() => onToggle("osm")}
          className="px-2.5 py-1 text-xs font-semibold cursor-pointer border-0 transition-colors flex items-center gap-1"
          style={{
            backgroundColor: mapLayer === "osm" ? "#1a3a6b" : "#ffffff",
            color: mapLayer === "osm" ? "#ffffff" : "#475569",
          }}
        >
          <span>OpenStreet</span>
          {mapLayer === "osm" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onToggle("roadmap")}
          className="px-2.5 py-1 text-xs font-semibold cursor-pointer border-0 transition-colors"
          style={{
            backgroundColor: mapLayer === "roadmap" ? "#1a3a6b" : "#ffffff",
            color: mapLayer === "roadmap" ? "#ffffff" : "#475569",
          }}
          title={!isGoogleReady ? "Google Maps not activated — OpenStreet recommended" : "Google Roadmap"}
        >
          Google Map
        </button>
        <button
          type="button"
          onClick={() => onToggle("satellite")}
          className="px-2.5 py-1 text-xs font-semibold cursor-pointer border-0 transition-colors"
          style={{
            backgroundColor: mapLayer === "satellite" ? "#1a3a6b" : "#ffffff",
            color: mapLayer === "satellite" ? "#ffffff" : "#475569",
          }}
        >
          Satellite
        </button>
      </div>
    </div>
  );
};

/**
 * RouteMap — Displays an interactive Leaflet map with route between two points.
 *
 * Props:
 *   pickup            – { lat, lon, name, shortName, accuracy }
 *   dropoff           – { lat, lon, name, shortName }
 *   onRouteCalculated – callback: ({ distanceKm, durationMin, routeCoords }) => void
 *   onPickupChange    – optional callback when user drags the pickup pin to exact spot
 */
const RouteMap = ({ pickup, dropoff, onRouteCalculated, onPickupChange }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  // If Google Maps is not implemented or blocked, seamlessly start with OpenStreetMap
  const [mapLayer, setMapLayer] = useState(() => (isGoogleMapsAvailable() ? "roadmap" : "osm"));
  const prevRouteRef = useRef("");
  const tileErrorCountRef = useRef(0);

  // Default center: India
  const defaultCenter = useMemo(() => [25.61, 85.14], []); // Patna default
  const hasPickup = pickup?.lat && pickup?.lon;
  const hasDropoff = dropoff?.lat && dropoff?.lon;
  const hasBothPoints = hasPickup && hasDropoff;

  const center = hasPickup
    ? [pickup.lat, pickup.lon]
    : hasDropoff
    ? [dropoff.lat, dropoff.lon]
    : defaultCenter;

  // Dragging pickup pin to refine exact spot
  const handlePickupDragEnd = async (e) => {
    const marker = e.target;
    const latLng = marker.getLatLng();
    if (onPickupChange) {
      try {
        const res = await reverseGeocode(latLng.lat, latLng.lng);
        if (res) {
          onPickupChange({
            lat: latLng.lat,
            lon: latLng.lng,
            name: res.fullLocation,
            shortName: res.street || res.fullLocation,
            road: res.road,
            gully: res.gully,
            locality: res.locality,
            city: res.city,
            isGps: true,
          });
        }
      } catch {
        onPickupChange({
          lat: latLng.lat,
          lon: latLng.lng,
          name: `Adjusted Pin (${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)})`,
          shortName: `Adjusted Spot`,
        });
      }
    }
  };

  // Fetch route from OSRM when both points are set
  useEffect(() => {
    if (!hasBothPoints) {
      setRouteCoords([]);
      return;
    }

    const routeKey = `${pickup.lat},${pickup.lon}-${dropoff.lat},${dropoff.lon}`;
    if (prevRouteRef.current === routeKey) return;
    prevRouteRef.current = routeKey;

    const fetchRoute = async () => {
      setLoading(true);
      try {
        const url = `${OSRM_URL}/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson&steps=false`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(coords);

          const distanceKm = Math.round(route.distance / 1000);
          const durationMin = Math.round(route.duration / 60);

          onRouteCalculated?.({
            distanceKm,
            durationMin,
            routeCoords: coords,
          });
        } else {
          console.warn("OSRM route not found:", data);
          setRouteCoords([]);
          onRouteCalculated?.({ distanceKm: 0, durationMin: 0, routeCoords: [] });
        }
      } catch (err) {
        console.warn("OSRM fetch error:", err);
        setRouteCoords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [hasBothPoints, pickup?.lat, pickup?.lon, dropoff?.lat, dropoff?.lon, onRouteCalculated]);

  const positions = [];
  if (hasPickup) positions.push([pickup.lat, pickup.lon]);
  if (hasDropoff) positions.push([dropoff.lat, dropoff.lon]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "clamp(280px, 35vw, 420px)" }}>
      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg text-sm font-medium" style={{ fontFamily: "var(--font-body)", color: "#1a3a6b" }}>
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#1a3a6b", borderTopColor: "transparent" }} />
            Calculating route…
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={hasPickup ? 17 : 6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        zoomControl={true}
      >
        {/* Google Maps Roadmap or Satellite / Hybrid Tiles with automatic OSM fallback on failure */}
        <TileLayer
          key={mapLayer}
          url={
            mapLayer === "satellite"
              ? "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              : mapLayer === "osm"
              ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              : "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          }
          subdomains={mapLayer === "osm" ? ["a", "b", "c"] : ["0", "1", "2", "3"]}
          maxZoom={mapLayer === "osm" ? 19 : 20}
          attribution={
            mapLayer === "osm"
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              : '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>'
          }
          eventHandlers={{
            tileerror: () => {
              if (mapLayer !== "osm") {
                tileErrorCountRef.current += 1;
                if (tileErrorCountRef.current >= 2) {
                  console.warn(
                    "[QuickSathi RouteMap] Google map tiles unavailable or blocked. Automatically switching to OpenStreetMap."
                  );
                  markGoogleMapsBlocked();
                  setMapLayer("osm");
                }
              }
            },
          }}
        />

        {/* Map Type Switcher (OpenStreet vs Google Map vs Satellite) */}
        <MapTypeControl
          mapLayer={mapLayer}
          onToggle={setMapLayer}
          isGoogleReady={isGoogleMapsAvailable()}
        />

        {/* Street-view recenter button */}
        {hasPickup && <RecenterControl target={pickup} />}

        {/* GPS Accuracy Circle */}
        {hasPickup && (
          <Circle
            center={[pickup.lat, pickup.lon]}
            radius={pickup.accuracy ? Math.min(Math.max(pickup.accuracy, 8), 60) : 15}
            pathOptions={{
              color: "#16a34a",
              fillColor: "#16a34a",
              fillOpacity: 0.16,
              weight: 1.5,
              dashArray: "3, 6",
            }}
          />
        )}

        {hasPickup && (
          <Marker
            position={[pickup.lat, pickup.lon]}
            icon={pickupIcon}
            draggable={!!onPickupChange}
            eventHandlers={{
              dragend: handlePickupDragEnd,
            }}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", fontSize: "12px", minWidth: "160px" }}>
                <strong style={{ color: "#16a34a" }}>📍 Exact Pickup Spot</strong>
                <p style={{ margin: "4px 0 2px", color: "#333", fontWeight: 600 }}>
                  {pickup.shortName || pickup.name}
                </p>
                {onPickupChange && (
                  <span style={{ fontSize: "10px", color: "#888", display: "block" }}>
                    💡 Drag pin to adjust exact spot
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {hasDropoff && (
          <Marker position={[dropoff.lat, dropoff.lon]} icon={dropoffIcon}>
            <Popup>
              <div style={{ fontFamily: "sans-serif", fontSize: "12px" }}>
                <strong style={{ color: "#dc2626" }}>🏁 Destination</strong>
                <p style={{ margin: "4px 0 0", color: "#333" }}>{dropoff.shortName || dropoff.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#1a3a6b",
              weight: 4,
              opacity: 0.85,
              dashArray: null,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {positions.length > 0 && <FitBounds positions={positions} />}
      </MapContainer>

      {/* Empty state */}
      {!hasPickup && !hasDropoff && (
        <div
          className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
        >
          <p
            className="text-sm font-medium px-5 py-3 rounded-xl"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              backgroundColor: "rgba(255,255,255,0.9)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            Enter pickup & destination to see the route
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
