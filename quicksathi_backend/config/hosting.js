// Host-neutral server settings. Everything that differs between hosting providers (Render, Railway,
// a VPS, ...) and frontend hosts (Netlify, Cloudflare Pages, Hostinger, Vercel) comes from env vars.

const list = (value) => String(value || "").split(",").map((s) => s.trim()).filter(Boolean);

/**
 * TRUST_PROXY: how many reverse proxies sit in front of the app (default 1, e.g. Render or Railway's
 * edge). "false"/"0" disables it; any other non-numeric value is passed to Express as-is
 * (e.g. "loopback"). Wrong values make every user share one rate-limit bucket, so check the
 * one-time "trust-proxy check" log line after deploying to a new host.
 */
export function trustProxySetting(value = process.env.TRUST_PROXY) {
  if (value === undefined || value === "") return 1;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

/**
 * Origins allowed to call the API from a browser:
 * - CLIENT_URL (the production frontend) and CORS_ORIGINS (comma list of exact origins, e.g. staging);
 * - CORS_ORIGIN_PATTERNS: comma list of host suffixes for preview deployments, matched only when the
 *   rest of the host is a single label, e.g. "--tiptobook.netlify.app" (Netlify deploy previews),
 *   ".tiptobook.pages.dev" (Cloudflare Pages), "-myteam.vercel.app" (Vercel). Use your own
 *   project/team suffix: a bare ".netlify.app" would admit anyone's site;
 * - any localhost port, and everything outside production.
 */
export function makeOriginChecker(env = process.env) {
  const exact = new Set(["http://localhost:5173", "http://localhost:3000", ...list(env.CLIENT_URL), ...list(env.CORS_ORIGINS)]);
  const suffixes = list(env.CORS_ORIGIN_PATTERNS);
  const isProduction = env.NODE_ENV === "production";

  const allowed = (origin) => {
    if (!origin) return true; // curl, server-to-server, mobile apps
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
    if (exact.has(origin)) return true;
    for (const suffix of suffixes) {
      if (origin.startsWith("https://") && origin.endsWith(suffix)) {
        const label = origin.slice("https://".length, -suffix.length);
        if (/^[a-z0-9-]+$/i.test(label)) return true;
      }
    }
    return !isProduction;
  };
  allowed.describe = () => [...exact, ...suffixes.map((s) => `*${s}`)].join(", ");
  return allowed;
}
