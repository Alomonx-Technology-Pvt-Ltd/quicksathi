import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";

const Services = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and services from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, svcRes] = await Promise.all([
          api.get("/categories"),
          api.get("/services"),
        ]);
        setCategories(catRes.data);
        setServices(svcRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build a service link using the service's _id from the backend
  const getServiceLink = (name, mongoId) => {
    const isRental = name.toLowerCase().includes("rental") || name.toLowerCase().includes("car") || name.toLowerCase().includes("bike");
    const prefix = isRental ? "/product" : "/service";
    return mongoId ? `${prefix}/${mongoId}` : "#";
  };

  // Find a matched backend service for a sub-category (for price/rating enrichment)
  const findMatchedService = (subName) =>
    services.find((s) => s.name.toLowerCase() === subName.toLowerCase());

  // Flatten all sub-categories from all categories into one list
  const allSubCategories = categories.flatMap((cat) =>
    (cat.subCategories || []).map((sub) => {
      const matched = findMatchedService(sub.name);
      return {
        ...sub,
        parentName: cat.name,
        parentId: cat._id,
        vertical: cat.vertical,
        mongoServiceId: matched?._id ?? null,
        startingPrice: matched?.startingPrice ?? null,
        priceUnit: matched?.priceUnit ?? "per visit",
        rating: matched?.rating ?? null,
      };
    })
  );

  // Filter logic
  const filteredServices = allSubCategories.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "ALL") return matchesSearch;
    if (selectedFilter === "WEDDING") return item.vertical === "WEDDING" && matchesSearch;
    if (selectedFilter === "RENTAL") return item.vertical === "VEHICLE_RENTAL" && matchesSearch;
    if (selectedFilter === "SECURITY") return item.vertical === "CCTV_SECURITY" && matchesSearch;
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero Banner ── */}
      <section
        className="relative w-full overflow-hidden flex items-center justify-center text-center"
        style={{ minHeight: "55vh" }}
      >
        <img
          src="https://images.unsplash.com/photo-1528148343865-51218c4a13e6?q=80&w=2070&auto=format&fit=crop"
          alt="Services Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(26,10,46,0.92) 0%, rgba(10,15,26,0.88) 100%)" }}
        />

        <div className="relative z-10 px-6 py-28 max-w-4xl mx-auto flex flex-col items-center">
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-5 py-2 rounded-full text-xs font-semibold text-white/90 mb-6 border border-white/20 backdrop-blur-md uppercase tracking-widest"
            style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            Explore Services
          </motion.span>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white font-normal leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5.5vw, 64px)", letterSpacing: "-0.02em" }}
          >
            Everything You Need, <br />
            <span style={{ opacity: 0.5 }}>All in One Place.</span>
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-lg mt-4 relative"
          >
            <input
              type="text"
              placeholder="Search for photography, car rentals, smart locks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full text-sm outline-none transition-all duration-300 shadow-lg text-white"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
              }}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
          </motion.div>
        </div>
      </section>

      {/* ── Specialty Category Cards ── */}
      <section className="px-6 py-16 sm:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border uppercase tracking-widest"
            style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(139,26,26,0.06)", borderColor: "rgba(139,26,26,0.15)", color: "var(--color-primary)" }}
          >
            Specialty Facilities
          </span>
          <h2 className="font-normal m-0" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 42px)", color: "var(--color-text-dark)" }}>
            Explore Detailed Facility Sections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Wedding & Events",
              desc: "All-inclusive venues, luxury decorators, gourmet caterers, and cinematic photography facilities explained.",
              image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
              link: "/services/weddings",
              btn: "Explore Wedding Facility"
            },
            {
              title: "Premium Vehicle Rentals",
              desc: "Exotic sedans, luxury wedding cars, SUVs, and commuter motorcycles for self-drive or chauffeur trips.",
              image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
              link: "/services/car-rentals",
              btn: "Explore Rental Fleet"
            },
            {
              title: "AI Security Systems",
              desc: "Complete residential and commercial smart locks and CCTV monitoring package setups.",
              image: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=600&auto=format&fit=crop",
              link: "/services/cctv",
              btn: "Explore Security Plans"
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-3xl border overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 group"
              style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}
            >
              <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="m-0 mb-2 font-normal text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  {card.title}
                </h3>
                <p className="m-0 mb-6 text-xs leading-relaxed flex-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  {card.desc}
                </p>
                <Link
                  to={card.link}
                  className="w-full text-center py-3 rounded-full text-xs font-semibold no-underline transition-all duration-200 hover:opacity-90 block"
                  style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-text-dark)", color: "#fff" }}
                >
                  {card.btn}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <section className="px-6 py-8 border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-soft)" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {[
            { id: "ALL", label: "All Services" },
            { id: "WEDDING", label: "💍 Wedding & Event" },
            { id: "RENTAL", label: "🚗 Car & Bike Rentals" },
            { id: "SECURITY", label: "📹 Security Systems" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer border transition-all duration-300"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: selectedFilter === tab.id ? "var(--color-primary)" : "var(--color-bg-white)",
                color: selectedFilter === tab.id ? "#fff" : "var(--color-text-dark)",
                borderColor: selectedFilter === tab.id ? "var(--color-primary)" : "var(--color-border)",
                boxShadow: selectedFilter === tab.id ? "0 4px 12px rgba(139,26,26,0.2)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="px-6 py-16 sm:py-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
            />
            <span className="text-sm italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
              Loading services…
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <span className="text-4xl block mb-4">🔍</span>
                <p className="text-lg m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  No services found matching your query.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredServices.map((item) => (
                  <motion.div
                    key={item._id || item.id}
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                    }}
                    onMouseEnter={() => setHoveredId(item._id || item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full relative"
                    style={{
                      backgroundColor: "var(--color-bg-soft)",
                      borderColor: "var(--color-border)",
                      transform: hoveredId === (item._id || item.id) ? "translateY(-6px)" : "translateY(0)",
                    }}
                  >
                    {/* Category Pill Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                      >
                        {item.parentName}
                      </span>
                    </div>

                    {/* Thumbnail Image */}
                    <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{ transform: hoveredId === (item._id || item.id) ? "scale(1.05)" : "scale(1)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Body Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="m-0 mb-2 font-normal text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                        {item.name}
                      </h3>
                      <p className="m-0 mb-6 text-xs leading-relaxed flex-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                        {item.description}
                      </p>

                      {/* Footer Info Row */}
                      <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                        <div>
                          {item.startingPrice !== null ? (
                            <>
                              <span className="text-[10px] uppercase font-semibold tracking-wider block" style={{ color: "var(--color-text-mid)" }}>Starting at</span>
                              <span className="font-bold text-base" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}>
                                ₹{item.startingPrice?.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] ml-1" style={{ color: "var(--color-text-mid)" }}>/{item.priceUnit?.split(" ").slice(1).join(" ") || item.priceUnit}</span>
                            </>
                          ) : (
                            <span className="text-xs italic" style={{ color: "var(--color-text-mid)", fontFamily: "var(--font-body)" }}>Contact for pricing</span>
                          )}
                        </div>

                        <Link
                          to={getServiceLink(item.name, item.mongoServiceId)}
                          className="px-5 py-2.5 rounded-full text-xs font-semibold no-underline transition-all duration-200 hover:opacity-90"
                          style={{
                            fontFamily: "var(--font-body)",
                            backgroundColor: "var(--color-text-dark)",
                            color: "#fff",
                          }}
                        >
                          Explore →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>

      {/* ── How It Works Section ── */}
      <section className="px-6 py-20 sm:py-28 border-t border-b" style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border uppercase tracking-widest"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(139,26,26,0.06)", color: "var(--color-primary)", borderColor: "rgba(139,26,26,0.15)" }}
            >
              Simple Steps
            </span>
            <h2 className="font-normal m-0" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 42px)", color: "var(--color-text-dark)" }}>
              How QuickSathi Works
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative">
            {[
              { num: "01", title: "Browse & Select", desc: "Browse from weddings, security, or rental packages. Review prices upfront." },
              { num: "02", title: "Set Your Schedule", desc: "Input your dates, addresses, and special requirements. Instant reservation." },
              { num: "03", title: "Secure Checkout", desc: "Pay safely online via UPI/Cards through Razorpay, or select COD." },
              { num: "04", title: "Professional Service", desc: "A background-checked expert arrives on time to complete your service." }
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex-1 p-6 rounded-3xl border flex flex-col gap-3 transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
              >
                <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)", opacity: 0.3 }}>
                  {step.num}
                </span>
                <h4 className="m-0 font-semibold text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                  {step.title}
                </h4>
                <p className="m-0 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Support CTA */}
      <section className="text-center px-6 py-16 sm:py-24">
        <h2 className="font-normal mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 40px)", color: "var(--color-text-dark)" }}>
          Can't find what you're looking for?
        </h2>
        <p className="text-base mb-8 mx-auto" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", maxWidth: "440px" }}>
          We're constantly expanding our network. Reach out and we'll connect you with the right provider.
        </p>
        <Link
          to="/contact"
          className="inline-block px-8 py-4 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105 hover:opacity-90"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--color-primary)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
          }}
        >
          Contact Support
        </Link>
      </section>
    </motion.div>
  );
};

export default Services;
