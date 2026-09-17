import { Helmet } from "react-helmet-async";

/**
 * SEO component — sets unique <title>, <meta description>, <canonical>,
 * Open Graph, Twitter Card, and optional JSON-LD structured data per page.
 * Uses react-helmet-async to manage <head>.
 */
function SEO({ title, description, canonical, keywords, jsonLd }) {
  const siteName = "TiptoBook";
  const siteUrl = "https://www.tiptobook.com";
  const defaultImage = `${siteUrl}/logo-full.png`;
  const fullTitle = title.includes(siteName) ? title : `${title} — ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="TiptoBook" />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
