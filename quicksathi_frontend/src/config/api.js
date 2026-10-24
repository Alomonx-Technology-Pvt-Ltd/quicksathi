import axios from "axios";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1");

// VITE_API_URL wins. Without it, a deployed site falls back to the Railway API (temporary: the
// Cloudflare build doesn't pass VITE_API_URL yet) and local development uses the local backend.
const DEFAULT_REMOTE_API = "https://tiptobook.up.railway.app/api";

let rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? "http://localhost:5050/api" : DEFAULT_REMOTE_API);

// If running on a deployed website, never call localhost
if (!isLocalhost && rawApiUrl.includes("localhost")) {
  rawApiUrl = DEFAULT_REMOTE_API;
}

if (rawApiUrl && !rawApiUrl.startsWith("http://") && !rawApiUrl.startsWith("https://")) {
  rawApiUrl = `https://${rawApiUrl}`;
}
if (rawApiUrl && !rawApiUrl.endsWith("/api")) {
  rawApiUrl = `${rawApiUrl.replace(/\/+$/, "")}/api`;
}
const API_BASE_URL = rawApiUrl;

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
    // Only treat a 401 as "your session expired" when we actually sent a session token and the call
    // wasn't a sign-in attempt itself (a wrong password is also a 401 and must show its own message).
    // Signed-in calls under /auth (/auth/me, /auth/profile) still end the session.
    const sentToken = Boolean(error.config?.headers?.Authorization);
    const isSignInCall = /^\/auth\/(login|google|phone|provider-login|provider-google|admin-login|admin-google)\/?$/.test(
      String(error.config?.url || "")
    );
    if (error.response?.status === 401 && sentToken && !isSignInCall) {
      localStorage.removeItem("qs_token");
      localStorage.removeItem("qs_user");
      localStorage.removeItem("qs_provider");
      const path = window.location.pathname;
      // Pages that need an account send you to sign in; public pages (home, services…) just reload as a
      // signed-out visitor instead of throwing you onto the login screen.
      const needsAccount = /^\/(my-bookings|booking|payment|profile|account|provider\/(dashboard|onboarding))/.test(path);
      if (path.startsWith("/admin")) {
        window.location.href = "/admin";
      } else if (needsAccount) {
        const mode = path.startsWith("/provider/") ? "mode=provider&" : "";
        window.location.href = `/login?${mode}redirect=${encodeURIComponent(path)}`;
      } else if (!path.includes("/login")) {
        window.location.reload();
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

