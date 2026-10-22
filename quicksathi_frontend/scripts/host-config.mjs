// Generates every static host's config from hosting/policy.json so security headers, caching and the
// single-page-app fallback are identical wherever the frontend is deployed.
//   node scripts/host-config.mjs          write the files
//   node scripts/host-config.mjs --check  exit 1 if any file differs (CI)
//
// Outputs:
//   wrangler.jsonc       Cloudflare Workers (static assets): SPA fallback via not_found_handling.
//                        A "/* /index.html 200" rule in _redirects breaks Workers deploys (infinite loop).
//   public/_headers      Cloudflare Workers/Pages + Netlify headers (copied into dist/ by Vite)
//   public/.assetsignore files in dist/ that Cloudflare must not publish (.htaccess)
//   public/.htaccess     Apache / LiteSpeed (Hostinger): headers, caching, SPA fallback
//   vercel.json          Vercel: headers, caching, SPA fallback
// Cloudflare Pages needs no fallback file (it serves index.html for unknown paths when there is no
// 404.html). Netlify would need a "/* /index.html 200" rule added in its own settings; netlify.toml is
// not generated because a copy of it was blamed for breaking the Cloudflare deploy (main, 60e10bb).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(path.join(root, "hosting/policy.json"), "utf8"));
const headers = Object.entries(policy.securityHeaders);
const { immutable, html } = policy.cacheControl;
const banner = "Generated from hosting/policy.json by scripts/host-config.mjs. Do not edit by hand.";

const headersFile = [
  `# ${banner}`,
  "/*",
  ...headers.map(([k, v]) => `  ${k}: ${v}`),
  `${immutable.prefix}*`,
  `  Cache-Control: ${immutable.value}`,
  html.path,
  `  Cache-Control: ${html.value}`,
  "",
].join("\n");

// Cloudflare Workers Builds deploys with `npx wrangler deploy` from quicksathi_frontend/; the Worker's
// name must match the one connected in the Cloudflare dashboard.
const wranglerJsonc = [
  `// ${banner}`,
  JSON.stringify(
    {
      name: policy.cloudflare.workerName,
      compatibility_date: policy.cloudflare.compatibilityDate,
      assets: { directory: "./dist", not_found_handling: "single-page-application" },
    },
    null,
    2
  ),
  "",
].join("\n");

const assetsIgnore = [`# ${banner}`, ".htaccess", ""].join("\n");

const apacheQuote = (v) => `"${v.replace(/"/g, '\\"')}"`;
const htaccess = [
  `# ${banner}`,
  "<IfModule mod_headers.c>",
  ...headers.map(([k, v]) => `  Header always set ${k} ${apacheQuote(v)}`),
  "</IfModule>",
  "",
  "<IfModule mod_rewrite.c>",
  "  RewriteEngine On",
  "  RewriteBase /",
  `  # Fingerprinted build assets never change: cache them for a year.`,
  `  RewriteRule ^${immutable.prefix.replace(/^\//, "")} - [E=TT_IMMUTABLE:1]`,
  `  # Single-page app: unknown paths serve ${policy.spaFallback}; real files and folders are served as-is.`,
  "  RewriteRule ^index\\.html$ - [L]",
  "  RewriteCond %{REQUEST_FILENAME} !-f",
  "  RewriteCond %{REQUEST_FILENAME} !-d",
  `  RewriteRule . ${policy.spaFallback} [L]`,
  "</IfModule>",
  "",
  "<IfModule mod_headers.c>",
  `  Header set Cache-Control ${apacheQuote(immutable.value)} env=TT_IMMUTABLE`,
  `  Header set Cache-Control ${apacheQuote(immutable.value)} env=REDIRECT_TT_IMMUTABLE`,
  `  <FilesMatch "^index\\.html$">`,
  `    Header set Cache-Control ${apacheQuote(html.value)}`,
  "  </FilesMatch>",
  "</IfModule>",
  "",
].join("\n");

const vercelJson = JSON.stringify(
  {
    // vercel.json is schema-validated (no comment keys); the banner lives in this script and policy.json.
    rewrites: [{ source: "/(.*)", destination: policy.spaFallback }],
    headers: [
      { source: `${immutable.prefix}(.*)`, headers: [{ key: "Cache-Control", value: immutable.value }] },
      { source: html.path, headers: [{ key: "Cache-Control", value: html.value }] },
      { source: "/(.*)", headers: headers.map(([key, value]) => ({ key, value })) },
    ],
  },
  null,
  2
) + "\n";

const outputs = {
  "wrangler.jsonc": wranglerJsonc,
  "public/_headers": headersFile,
  "public/.assetsignore": assetsIgnore,
  "public/.htaccess": htaccess,
  "vercel.json": vercelJson,
};

const check = process.argv.includes("--check");
let stale = 0;
for (const [rel, content] of Object.entries(outputs)) {
  const file = path.join(root, rel);
  const current = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (current === content) continue;
  if (check) {
    console.error(`✖ ${rel} is out of date with hosting/policy.json (run: npm run host-config)`);
    stale++;
  } else {
    writeFileSync(file, content);
    console.log(`wrote ${rel}`);
  }
}
if (check && stale) process.exit(1);
if (check) console.log("host config files match hosting/policy.json");
