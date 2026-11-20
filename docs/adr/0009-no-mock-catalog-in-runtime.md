---
status: accepted
---
# The API is the only source of catalog data in the browser; there is no mock fallback

`src/data/mockServices.js` and `mockCategories.js` used to seed every page with hardcoded prices, ratings and review counts, and silently replaced real data when the API was slow, empty for a city, or failing. Customers saw fabricated prices and "4.8★ (124 reviews)", links led to slugs that didn't exist in the database, and a city with no services looked like it had the whole catalog.

Pages now load through one hook, `useCatalog`, and show explicit loading, empty ("not available yet") and error (with retry) states. Unrated services show "New" instead of a default rating. The AC and Salon pages list only services that exist in the database (the built-in lists supply presentation extras for services that match, never prices or entries). The cost is a visible loading/error state on cold starts instead of instant fake content; this is deliberate — a wrong price is worse than a spinner, and the server charges the catalog price regardless (ADR 0002).
