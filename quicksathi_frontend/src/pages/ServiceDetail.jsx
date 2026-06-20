import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { mockServices } from "../data/mockServices";

/* ── Star rating display ── */
const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#8b1a1a" : "none"} stroke="#8b1a1a" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const ServiceDetail = () => {
  const { id } = useParams();
  const { data: services, loading } = useFetch(mockServices);
  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(0);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-sm italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
          Loading service…
        </span>
      </div>
    );

  const service = services?.find((s) => s.id === parseInt(id));

  if (!service)
    return (
      <div className="text-center py-40 text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
        Service not found
      </div>
    );

  const allImages = [service.bannerImage, ...(service.gallery ?? [])];
  const pkg = service.packages?.[selectedPkg];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ── Hero banner ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "65vh", minHeight: "460px" }}>
        <img
          src={allImages[activeImg]}
          alt={service.name}
          className="w-full h-full object-cover object-center transition-all duration-700"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 25%, rgba(0,0,0,0.10) 65%, transparent 100%)" }} />

        {/* Breadcrumb */}
        <nav className="absolute top-20 left-10 flex items-center gap-2 text-xs z-10" style={{ fontFamily: "var(--font-body)" }}>
          <Link to="/" className="no-underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.50)" }}>Home</Link>
          <span style={{ color: "rgba(255,255,255,0.30)" }}>/</span>
          <Link to={`/category/${service.categoryId}`} className="no-underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.50)" }}>
            {service.categoryName}
          </Link>
          <span style={{ color: "rgba(255,255,255,0.30)" }}>/</span>
          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{service.name}</span>
        </nav>

        {/* Gallery thumbnails — top right */}
        {allImages.length > 1 && (
          <div className="absolute top-20 right-10 z-10 flex gap-2">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="rounded-xl overflow-hidden border-2 transition-all duration-200"
                style={{
                  width: "56px", height: "40px", padding: 0, cursor: "pointer",
                  borderColor: i === activeImg ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.30)",
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Bottom-left: name + meta */}
        <div className="absolute bottom-8 left-10 z-10" style={{ animation: "fadeUp 0.8s ease both" }}>
          {/* Tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {service.tags?.map((tag) => (
              <span key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-white/25 backdrop-blur-sm"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.85)" }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-white font-normal leading-tight mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 64px)", letterSpacing: "-0.02em", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            {service.name}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <Stars rating={service.rating} />
            <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {service.rating} · {service.totalReviews} reviews
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {service.experience} experience
            </span>
            <span className="text-white/40">·</span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: service.available ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)",
                color: service.available ? "#4ade80" : "#f87171",
              }}
            >
              {service.available ? "Available Now" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Bottom-right: starting price */}
        <div className="absolute bottom-8 right-10 z-10 text-right">
          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: "var(--font-body)" }}>Starting from</p>
          <p className="text-white font-bold text-3xl m-0" style={{ fontFamily: "var(--font-display)" }}>
            ₹{service.startingPrice?.toLocaleString()}
          </p>
          <p className="text-white/50 text-xs mt-1" style={{ fontFamily: "var(--font-body)" }}>{service.priceUnit}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-10 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-12">

            {/* About */}
            <div>
              <SectionHeader title="About this Service" />
              <p className="text-base leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                {service.fullDescription}
              </p>
            </div>

            {/* Packages */}
            {service.packages?.length > 0 && (
              <div>
                <SectionHeader title="Packages" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.packages.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPkg(i)}
                      className="text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: i === selectedPkg ? "var(--color-primary)" : "var(--color-bg-white)",
                        borderColor: i === selectedPkg ? "var(--color-primary)" : "var(--color-border)",
                        boxShadow: i === selectedPkg ? "0 8px 24px rgba(139,26,26,0.25)" : "0 2px 8px rgba(44,24,16,0.05)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold m-0" style={{ color: i === selectedPkg ? "#fff" : "var(--color-text-dark)" }}>
                          {p.title}
                        </h3>
                        <span className="text-lg font-bold ml-4 flex-shrink-0" style={{ fontFamily: "var(--font-display)", color: i === selectedPkg ? "#fff" : "var(--color-primary)" }}>
                          ₹{p.price?.toLocaleString()}
                        </span>
                      </div>
                      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                        {p.features?.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm" style={{ color: i === selectedPkg ? "rgba(255,255,255,0.80)" : "var(--color-text-mid)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={i === selectedPkg ? "rgba(255,255,255,0.8)" : "var(--color-primary)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Providers */}
            {service.providers?.length > 0 && (
              <div>
                <SectionHeader title="Service Providers" />
                <div className="flex flex-col gap-4">
                  {service.providers.map((p) => (
                    <div key={p.id}
                      className="flex items-center gap-5 p-5 rounded-2xl border"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 2px 8px rgba(44,24,16,0.05)" }}
                    >
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        style={{ border: "3px solid var(--color-border)" }} />
                      <div className="flex-1">
                        <p className="font-semibold m-0 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", fontSize: "16px" }}>
                          {p.name}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Stars rating={p.rating} />
                          <span className="text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{p.rating} rating</span>
                          <span style={{ color: "var(--color-accent)" }}>·</span>
                          <span className="text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{p.experience} exp</span>
                          <span style={{ color: "var(--color-accent)" }}>·</span>
                          <span className="text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{p.location}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>From</p>
                        <p className="font-bold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", fontSize: "18px" }}>
                          ₹{p.startingPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {service.reviews?.length > 0 && (
              <div>
                <SectionHeader title={`Reviews (${service.totalReviews})`} />
                <div className="flex flex-col gap-4">
                  {service.reviews.map((r) => (
                    <div key={r.id} className="p-5 rounded-2xl border"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                          {r.user[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{r.user}</p>
                          <Stars rating={r.rating} />
                        </div>
                      </div>
                      <p className="text-sm italic m-0 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                        "{r.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {service.faqs?.length > 0 && (
              <div>
                <SectionHeader title="Frequently Asked Questions" />
                <div className="flex flex-col gap-3">
                  {service.faqs.map((faq, i) => (
                    <div key={i} className="rounded-2xl border overflow-hidden"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full text-left flex items-center justify-between px-5 py-4 border-0 cursor-pointer"
                        style={{ backgroundColor: "transparent", fontFamily: "var(--font-body)" }}
                      >
                        <span className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>{faq.question}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ color: "var(--color-text-mid)", transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4">
                          <p className="text-sm leading-relaxed m-0 italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sticky booking card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border p-6 flex flex-col gap-5"
              style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 8px 40px rgba(44,24,16,0.08)" }}>

              {/* Selected package summary */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>
                  Selected Package
                </p>
                <h3 className="text-lg font-normal m-0 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  {pkg?.title ?? service.name}
                </h3>
                <p className="text-3xl font-bold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                  ₹{(pkg?.price ?? service.startingPrice)?.toLocaleString()}
                </p>
                <p className="text-xs mt-1 m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>{service.priceUnit}</p>
              </div>

              {/* Features list */}
              {pkg?.features && (
                <ul className="m-0 p-0 list-none flex flex-col gap-2 border-t border-b py-4" style={{ borderColor: "var(--color-border)" }}>
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Service mode */}
              <div className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                {service.serviceMode?.replace("_", " ")}
              </div>

              {/* Book button */}
              <button
                className="w-full py-4 rounded-2xl text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  boxShadow: "0 6px 24px rgba(139,26,26,0.30)",
                }}
              >
                Book Now
              </button>

              <button
                className="w-full py-3 rounded-2xl text-sm font-semibold border cursor-pointer transition-all duration-200 hover:opacity-80"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "transparent",
                  color: "var(--color-text-dark)",
                  borderColor: "var(--color-border)",
                }}
              >
                Contact Provider
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ── Reusable section header ── */
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-6">
    <h2 className="text-xl font-normal whitespace-nowrap m-0"
      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
      {title}
    </h2>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, var(--color-accent), transparent)" }} />
  </div>
);

export default ServiceDetail;