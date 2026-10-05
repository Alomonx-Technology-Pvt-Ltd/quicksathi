import { Router } from "express";

// Server-side proxy for address search / reverse geocoding.
// Why: OpenStreetMap's Nominatim policy forbids browser-side autocomplete, requires a real
// User-Agent (browsers can't set one), and allows ~1 request/second per application. Funnelling
// every user through here lets us cache, throttle, and keep users' IPs away from the third party.
const router = Router();

const NOMINATIM = (process.env.GEO_NOMINATIM_URL || "https://nominatim.openstreetmap.org").replace(/\/+$/, "");
const PHOTON = (process.env.GEO_PHOTON_URL || "https://photon.komoot.io").replace(/\/+$/, "");
const USER_AGENT = process.env.GEO_USER_AGENT || "TiptoBook/1.0 (+https://www.tiptobook.com; support@tiptobook.com)";

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 500;
const cache = new Map(); // url -> { expires, body }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Nominatim: strictly one request at a time, at least 1.1s apart.
let nominatimGate = Promise.resolve();
let lastNominatimCall = 0;
function nominatimTurn() {
  const turn = nominatimGate.then(async () => {
    const wait = lastNominatimCall + 1100 - Date.now();
    if (wait > 0) await sleep(wait);
    lastNominatimCall = Date.now();
  });
  nominatimGate = turn.catch(() => {});
  return turn;
}

async function fetchJson(url, { throttled }) {
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit.body;

  if (throttled) await nominatimTurn();
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en", Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const body = await res.json();

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(url, { expires: Date.now() + CACHE_TTL_MS, body });
  return body;
}

const parseQuery = (value) => {
  const q = typeof value === "string" ? value.trim() : "";
  return q.length >= 2 && q.length <= 120 ? q : null;
};
const parseLimit = (value, fallback = 8) => Math.min(Math.max(parseInt(value, 10) || fallback, 1), 10);
// ~11 m precision: plenty for an address lookup, better for cache hits and privacy.
const parseCoord = (value, max) => {
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= max ? Math.round(n * 1e4) / 1e4 : null;
};

const bad = (res, message) => res.status(400).json({ message });
const upstreamFailed = (res) => res.status(502).json({ message: "Location service is unavailable right now." });

router.use((req, res, next) => {
  res.set("Cache-Control", "public, max-age=300");
  next();
});

// GET /api/geo/nominatim/search?q=patna&limit=8
router.get("/nominatim/search", async (req, res) => {
  const q = parseQuery(req.query.q);
  if (!q) return bad(res, "q must be 2-120 characters");
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=${parseLimit(req.query.limit)}&countrycodes=in`;
  try {
    res.json(await fetchJson(url, { throttled: true }));
  } catch {
    upstreamFailed(res);
  }
});

// GET /api/geo/nominatim/reverse?lat=..&lon=..
router.get("/nominatim/reverse", async (req, res) => {
  const lat = parseCoord(req.query.lat, 90);
  const lon = parseCoord(req.query.lon, 180);
  if (lat === null || lon === null) return bad(res, "lat and lon are required");
  const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`;
  try {
    res.json(await fetchJson(url, { throttled: true }));
  } catch {
    upstreamFailed(res);
  }
});

// GET /api/geo/photon/search?q=..&limit=8
router.get("/photon/search", async (req, res) => {
  const q = parseQuery(req.query.q);
  if (!q) return bad(res, "q must be 2-120 characters");
  const url = `${PHOTON}/api/?q=${encodeURIComponent(q)}&limit=${parseLimit(req.query.limit)}`;
  try {
    res.json(await fetchJson(url, { throttled: false }));
  } catch {
    upstreamFailed(res);
  }
});

// GET /api/geo/photon/reverse?lat=..&lon=..
router.get("/photon/reverse", async (req, res) => {
  const lat = parseCoord(req.query.lat, 90);
  const lon = parseCoord(req.query.lon, 180);
  if (lat === null || lon === null) return bad(res, "lat and lon are required");
  const url = `${PHOTON}/reverse?lon=${lon}&lat=${lat}&limit=${parseLimit(req.query.limit, 6)}`;
  try {
    res.json(await fetchJson(url, { throttled: false }));
  } catch {
    upstreamFailed(res);
  }
});

export default router;
