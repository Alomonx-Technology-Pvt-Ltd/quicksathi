import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";
import { mockServices } from "../data/mockServices";

/* ── Luxury Star rating display ── */
const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#C4A882" : "none"} stroke="#C4A882" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(0);

  const isNumericId = !isNaN(id) && !isNaN(parseInt(id));

  useEffect(() => {
    if (isNumericId) {
      Promise.resolve().then(() => {
        const match = mockServices.find((s) => s.id === parseInt(id));
        if (match) {
          setService(match);
          setError(null);
        } else {
          setError("Service not found");
        }
        setLoading(false);
      });
    } else {
      const fetchService = async () => {
        try {
          setLoading(true);
          setError(null);
          const { data } = await api.get(`/services/${id}`);
          setService(data);
        } catch (err) {
          setError(err.response?.data?.message || err.message || "Failed to fetch service");
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [id, isNumericId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-sm italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
          Loading service…
        </span>
      </div>
    );

  if (error || !service)
    return (
      <div className="text-center py-40 text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", backgroundColor: "var(--color-bg)" }}>
        {error || "Service not found"}
      </div>
    );

  const allImages = [service.bannerImage, ...(service.gallery ?? [])].filter(Boolean);
  const pkg = service.packages?.[selectedPkg];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Luxury Hero banner ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh", minHeight: "440px" }}>
        {allImages.length > 0 && (
          <img
            src={allImages[activeImg]}
            alt={service.name}
            className="w-full h-full object-cover object-center transition-all duration-700"
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9) 15%, rgba(10,10,10,0.3) 60%, transparent 100%)" }} />

        {/* Breadcrumb */}
        <nav className="absolute top-20 left-6 sm:left-12 flex items-center gap-2 text-xs z-10" style={{ fontFamily: "var(--font-body)" }}>
          <Link to="/" className="no-underline hover:text-white" style={{ color: "rgba(255,255,255,0.50)" }}>Home</Link>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
          <Link to={`/category/${service.categoryId || service.category}`} className="no-underline hover:text-white" style={{ color: "rgba(255,255,255,0.50)" }}>
            {service.categoryName || "Category"}
          </Link>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
          <span className="font-semibold text-white/90">{service.name}</span>
        </nav>

        {/* Gallery thumbnails */}
        {allImages.length > 1 && (
          <div className="absolute top-20 right-6 sm:right-12 z-10 flex gap-2">
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

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-8 left-6 sm:left-12 z-10">
          <div className="flex gap-2 mb-3">
            {service.tags?.map((tag) => (
              <span key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-white/20 backdrop-blur-sm text-white/80"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.08)" }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-white font-normal leading-tight mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 56px)", letterSpacing: "-0.01em" }}>
            {service.name}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <Stars rating={service.rating} />
            <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {service.rating} · {service.totalReviews} reviews
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {service.experience} Experience
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left Column: Main Info Sections ── */}
          <motion.div 
            className="lg:col-span-2 flex flex-col gap-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
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
                <SectionHeader title="Select Package" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {service.packages.map((p, i) => {
                    const isSelected = i === selectedPkg;
                    return (
                      <button
                        key={p.id || p._id || i}
                        onClick={() => setSelectedPkg(i)}
                        className="text-left p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between"
                        style={{
                          fontFamily: "var(--font-body)",
                          backgroundColor: isSelected ? "#1E1B1A" : "var(--color-bg-white)",
                          borderColor: isSelected ? "#C4A882" : "var(--color-border)",
                          boxShadow: isSelected ? "0 10px 30px rgba(196,168,130,0.15)" : "none",
                        }}
                      >
                        <div className="w-full flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-semibold m-0" style={{ color: isSelected ? "#C4A882" : "var(--color-text-dark)" }}>
                              {p.title}
                            </h3>
                            {isSelected && (
                              <span className="inline-block mt-1 text-[8px] font-bold tracking-widest text-[#C4A882] uppercase">
                                Selected Option
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-bold ml-4 flex-shrink-0" style={{ fontFamily: "var(--font-display)", color: isSelected ? "#C4A882" : "var(--color-primary)" }}>
                            ₹{p.price?.toLocaleString()}
                          </span>
                        </div>
                        <ul className="m-0 p-0 list-none flex flex-col gap-2.5 w-full border-t pt-4" style={{ borderColor: isSelected ? "rgba(255,255,255,0.1)" : "var(--color-border)" }}>
                          {p.features?.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-xs" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--color-text-mid)" }}>
                              <span style={{ color: isSelected ? "#C4A882" : "var(--color-primary)" }}>✓</span>
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Providers */}
            {service.providers?.length > 0 && (
              <div>
                <SectionHeader title="Verified Partners" />
                <div className="flex flex-col gap-4">
                  {service.providers.map((p, idx) => (
                    <div key={p.id || p._id || idx}
                      className="flex items-center gap-5 p-5 rounded-3xl border transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}
                    >
                      <div className="relative flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-14 h-14 rounded-full object-cover"
                          style={{ border: "2px solid var(--color-border)" }} />
                        <span className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[8px] text-white">✓</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", fontSize: "15px" }}>
                            {p.name}
                          </p>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gold/10 text-primary" style={{ backgroundColor: "rgba(196,168,130,0.12)", color: "var(--color-primary)" }}>
                            Vetted Pro
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap mt-1 text-[11px]" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                          <Stars rating={p.rating} />
                          <span>({p.rating})</span>
                          <span>·</span>
                          <span>{p.experience} Exp</span>
                          <span>·</span>
                          <span>{p.location}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] mb-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Starting at</p>
                        <p className="font-bold m-0 text-base" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
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
                <SectionHeader title={`Client Testimonials (${service.totalReviews})`} />
                <div className="flex flex-col gap-5">
                  {service.reviews.map((r, idx) => (
                    <div key={r.id || r._id || idx} className="p-6 rounded-3xl border relative"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                      <span className="absolute top-4 right-6 text-4xl opacity-10" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>”</span>
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}>
                          {r.userName ? r.userName[0] : (r.user ? r.user[0] : "?")}
                        </div>
                        <div>
                          <p className="font-semibold text-xs m-0 mb-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{r.userName || r.user || "User"}</p>
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
                <SectionHeader title="Support FAQs" />
                <div className="flex flex-col gap-3">
                  {service.faqs.map((faq, i) => (
                    <div key={faq.id || faq._id || i} className="rounded-2xl border overflow-hidden transition-all duration-300"
                      style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full text-left flex items-center justify-between px-5 py-4 border-0 cursor-pointer"
                        style={{ backgroundColor: "transparent", fontFamily: "var(--font-body)" }}
                      >
                        <span className="font-semibold text-xs" style={{ color: "var(--color-text-dark)" }}>{faq.question}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ color: "var(--color-text-mid)", transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                              <p className="text-xs leading-relaxed m-0 italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Right Column: Premium Checkout Card ── */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="sticky top-24 rounded-3xl border p-6 flex flex-col gap-6"
              style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>

              {/* Selected package summary */}
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[8px] font-bold tracking-widest text-[#C4A882] bg-[#1E1B1A] uppercase mb-3">
                  Selected Package
                </span>
                <h3 className="text-base font-normal m-0 mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  {pkg?.title ?? service.name}
                </h3>
                <p className="text-3xl font-bold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                  ₹{(pkg?.price ?? service.startingPrice)?.toLocaleString()}
                </p>
                <p className="text-[10px] mt-1 m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{service.priceUnit}</p>
              </div>

              {/* Features list */}
              {pkg?.features && (
                <ul className="m-0 p-0 list-none flex flex-col gap-2.5 border-t border-b py-4.5 w-full" style={{ borderColor: "var(--color-border)" }}>
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                      <span className="text-[#C4A882] font-semibold">✓</span>
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Service mode */}
              <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                {service.serviceMode?.replace("_", " ")}
              </div>

              {/* Book button */}
              <Link
                to={`/booking/${service.id || service._id}?name=${encodeURIComponent(service.name)}&package=${encodeURIComponent(pkg?.title || "")}&price=${pkg?.price || service.startingPrice}`}
                className="w-full text-center block no-underline"
              >
                <button
                  className="w-full py-4 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    boxShadow: "0 6px 24px rgba(139,26,26,0.25)",
                  }}
                >
                  Book Now
                </button>
              </Link>

              <Link
                to="/contact"
                className="w-full text-center block no-underline"
              >
                <button
                  className="w-full py-3.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:bg-white/50"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-dark)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  Contact Support
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

/* ── Reusable premium section header ── */
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-6">
    <h2 className="text-base font-normal whitespace-nowrap m-0"
      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", letterSpacing: "-0.01em" }}>
      {title}
    </h2>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, var(--color-accent), transparent)" }} />
  </div>
);

export default ServiceDetail;