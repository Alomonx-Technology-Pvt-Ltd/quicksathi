import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

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
      transform: rotate(-45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
 * Auto-fit map bounds when positions change.
 */
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [map, positions]);
  return null;
};

/**
 * RouteMap — Displays an interactive Leaflet map with route between two points.
 *
 * Props:
 *   pickup      – { lat, lon, name }
 *   dropoff     – { lat, lon, name }
 *   onRouteCalculated – callback: ({ distanceKm, durationMin, routeCoords }) => void
 */
const RouteMap = ({ pickup, dropoff, onRouteCalculated }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevRouteRef = useRef("");

  // Default center: India
  const defaultCenter = [22.5, 82.0];
  const hasPickup = pickup?.lat && pickup?.lon;
  const hasDropoff = dropoff?.lat && dropoff?.lon;
  const hasBothPoints = hasPickup && hasDropoff;

  const center = hasPickup
    ? [pickup.lat, pickup.lon]
    : hasDropoff
    ? [dropoff.lat, dropoff.lon]
    : defaultCenter;

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
        zoom={hasPickup ? 10 : 5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {hasPickup && (
          <Marker position={[pickup.lat, pickup.lon]} icon={pickupIcon} />
        )}

        {hasDropoff && (
          <Marker position={[dropoff.lat, dropoff.lon]} icon={dropoffIcon} />
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

        {positions.length >= 2 && <FitBounds positions={positions} />}
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
