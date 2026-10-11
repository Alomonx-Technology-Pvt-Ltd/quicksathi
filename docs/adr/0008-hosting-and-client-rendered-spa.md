---
status: accepted (with a known SEO trade-off)
---
# Static SPA + Express API + MongoDB Atlas, on any host; client-side rendering for now

The frontend is a Vite/React SPA served as static files, the API is a single Express service, data is in MongoDB Atlas. This is cheap and quick to operate for a small team.

**Hosting is vendor-independent** (updated 2026-10-12, Round 4). We expect to move hosts (frontend possibly to Netlify, Cloudflare Pages or Hostinger; API to Railway), so nothing host-specific lives in code:
- the frontend's security headers, caching and SPA fallback come from one policy, `quicksathi_frontend/hosting/policy.json`, generated into `public/_headers` (Netlify, Cloudflare Pages), `public/.htaccess` (Apache/Hostinger), `netlify.toml` and `vercel.json` by `npm run host-config` (CI fails if they drift);
- the API ships as a Docker image (`quicksathi_backend/Dockerfile`; Railway builds it automatically, CI builds it and checks `/api/health`) and reads every host difference from env vars (`TRUST_PROXY`, `CORS_ORIGINS`, `CORS_ORIGIN_PATTERNS`, `SELF_PING_URL`, `CLIENT_URL`);
- domains: `tiptobook.com` for the frontend and `api.tiptobook.com` for the API (same site, so login cookies work in every browser), with a `staging.` / `api-staging.` pair. Host preview URLs (`*.netlify.app`, `*.pages.dev`) are different sites and use the staging API.

Trade-offs we accepted: (1) **SEO** — every URL serves the same `index.html` head, so link previews and non-JS crawlers see the homepage for every service; per-page tags only exist after JavaScript runs. Build-time prerendering of the sitemap URLs (or React Router framework mode) is the follow-up. (2) **Render's free tier sleeps** and cold-starts; the frontend pings `/api/health` early and the server self-pings in production, which is a workaround, not a fix — use a paid instance for launch. (3) The health endpoint returns 503 while the database is disconnected so the host can see a bad instance.
