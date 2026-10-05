---
status: accepted (with a known SEO trade-off)
---
# Vercel (static SPA) + Render (API) + MongoDB Atlas; client-side rendering for now

The frontend is a Vite/React SPA served as static files from Vercel (with security headers in `vercel.json`), the API is a single Express service on Render, data is in MongoDB Atlas. This is cheap and quick to operate for a small team. The Netlify configuration files that used to sit in `public/` were dead and removed from consideration; Vercel is the host.

Trade-offs we accepted: (1) **SEO** — every URL serves the same `index.html` head, so link previews and non-JS crawlers see the homepage for every service; per-page tags only exist after JavaScript runs. Build-time prerendering of the sitemap URLs (or React Router framework mode) is the follow-up. (2) **Render's free tier sleeps** and cold-starts; the frontend pings `/api/health` early and the server self-pings in production, which is a workaround, not a fix — use a paid instance for launch. (3) The health endpoint returns 503 while the database is disconnected so the host can see a bad instance.
