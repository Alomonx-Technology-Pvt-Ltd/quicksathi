import { Helmet } from "react-helmet-async";

/**
 * SEO component — sets unique <title>, <meta description>, <canonical>,
 * and Open Graph tags per page. Uses react-helmet-async to manage <head>.
 */
function SEO({ title, description, canonical }) {
  const siteName = "TiptoBook";
  const fullTitle = title.includes(siteName) ? title : `${title} — ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
    </Helmet>
  );
}

export default SEO;
