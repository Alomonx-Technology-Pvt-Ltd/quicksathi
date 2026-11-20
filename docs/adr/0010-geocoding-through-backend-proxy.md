---
status: accepted
---
# Address search and reverse geocoding go through our backend

The browser used to call Nominatim and Photon directly, including type-ahead search with a `User-Agent` header browsers silently drop. Nominatim's usage policy forbids client-side autocomplete, requires an identifying User-Agent and allows about one request per second per application, so growth would get the site's Referer/IP blocked and silently break location filtering; it also sent every visitor's precise coordinates and IP to a third party.

`routes/geo.js` now proxies four read-only endpoints with: a 10-minute cache, Nominatim calls serialised ≥ 1.1 s apart, a real `GEO_USER_AGENT`, input validation, coordinates rounded to ~11 m, and a 60/min/IP limit. Upstream URLs are configurable (`GEO_NOMINATIM_URL`, `GEO_PHOTON_URL`) so a paid geocoder or self-hosted instance can replace them without frontend changes. Related behaviour: the location prompt is no longer shown on page load, and a location the visitor typed or picked is remembered until they change it.

The public OSRM demo server used for rental route drawing is still called from the browser; it should be proxied or replaced before heavy use.
