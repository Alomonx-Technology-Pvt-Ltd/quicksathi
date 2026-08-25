import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── In-memory response cache ─────────────────────────────────────────────────
// Caches GET responses for CACHE_TTL_MS so repeat navigations are instant.
// Keyed by URL. Only caches public, unauthenticated GET requests.
const _cache = new Map(); // key → { data, expiresAt }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
}

export function setCache(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearCache(pattern) {
  if (!pattern) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (key.includes(pattern)) _cache.delete(key);
  }
}

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15s timeout — fall through to mock data on cold start rather than hanging
});

// ── Request interceptor — attach JWT + cache GET responses ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("qs_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — cache public GETs + handle auth errors ─────────────
api.interceptors.response.use(
  (response) => {
    // Cache only public GET requests (no Authorization header)
    if (
      response.config.method === "get" &&
      !response.config.headers?.Authorization
    ) {
      const cacheKey = response.config.url + (response.config.params
        ? "?" + new URLSearchParams(response.config.params).toString()
        : "");
      setCache(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("qs_token");
      localStorage.removeItem("qs_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Backend wake-up ping ──────────────────────────────────────────────────────
// On production, ping the health endpoint immediately when the app loads.
// This wakes up the Render free-tier backend before the user needs it,
// so by the time they scroll / interact, the server is already warm.
const isProduction = !API_BASE_URL.includes("localhost");
if (isProduction) {
  const healthUrl = API_BASE_URL.replace("/api", "") + "/api/health";
  fetch(healthUrl, { method: "GET" }).catch(() => {
    // Ignore errors — this is a best-effort pre-warm
  });
}

export default api;

