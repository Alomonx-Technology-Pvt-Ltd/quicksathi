import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../config/api";
import Card from "../components/common/Card";
import { mockCategories } from "../data/mockCategories";
import { mockServices } from "../data/mockServices";

const INTERVAL_MS = 4000;
const MotionLink = motion(Link);

const CategoryBanner = ({
  category,
  activeSub,
  activeIndex,
  subs,
  setActiveIndex,
}) => (
  <div
    className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
    style={{
      backgroundColor: "#EDE9F4",
      minHeight: "240px",
      margin: "72px 16px 0",
      width: "calc(100% - 32px)",
    }}
  >
    {/* Left: text */}
    <div className="relative z-10 p-6 sm:p-10 max-w-lg">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs mb-4"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Link
          to="/"
          className="no-underline hover:opacity-70"
          style={{ color: "var(--color-text-mid)" }}
        >
          Home
        </Link>
        <span style={{ color: "var(--color-accent)" }}>/</span>
        <span
          className="font-semibold"
          style={{ color: "var(--color-text-dark)" }}
        >
          {category.name}
        </span>
      </nav>

      {/* Badge */}
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "rgba(255,255,255,0.55)",
          borderColor: "rgba(0,0,0,0.08)",
          color: "var(--color-text-mid)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {activeSub?.name ?? category.name}
      </span>

      {/* Heading */}
      <h1
        className="font-normal leading-[1.08] mb-4"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3.5vw, 52px)",
          color: "var(--color-text-dark)",
          letterSpacing: "-0.02em",
          transition: "all 0.5s ease",
        }}
      >
        {activeSub?.name ?? category.name}
      </h1>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-6"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-mid)",
          maxWidth: "380px",
          transition: "all 0.5s ease",
        }}
      >
        {activeSub?.description ?? category.description}
      </p>

      {/* CTA */}
      <a
        href="#services"
        className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-105"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "var(--color-text-dark)",
          color: "#ffffff",
          boxShadow: "0 4px 16px rgba(44,24,16,0.18)",
        }}
      >
        Explore {activeSub?.name ?? category.name}
      </a>
    </div>

    {/* Right: rotating subcategory image — hidden on mobile, visible sm+ */}
    <div className="absolute top-0 right-0 bottom-0 w-1/2 z-0 overflow-hidden rounded-r-3xl hidden sm:block">
      {subs.length > 0 ? (
        subs.map((sub, i) => (
          <img
            key={sub._id || sub.id}
            src={sub.imageUrl}
            alt={sub.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))
      ) : (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, #EDE9F4 0%, transparent 30%)",
        }}
      />
    </div>

    {/* Dots */}
    {subs.length > 1 && (
      <div className="absolute bottom-5 right-6 z-10 flex items-center gap-2">
        {subs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="rounded-full border-0 cursor-pointer transition-all duration-300"
            style={{
              width: i === activeIndex ? "20px" : "7px",
              height: "7px",
              backgroundColor:
                i === activeIndex
                  ? "var(--color-text-dark)"
                  : "rgba(44,24,16,0.25)",
              padding: 0,
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    )}
  </div>
);

const Category = () => {
  const { id } = useParams();

  // ── Instant render: find mock category for this id immediately
  const findMock = (catId) =>
    mockCategories.find((c) => (c.id || c._id)?.toString() === catId?.toString()) ?? null;

  const [category, setCategory] = useState(() => findMock(id));
  const [services, setServices] = useState(() => mockServices);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [filterType, setFilterType] = useState("ALL");

  // Background fetch — no blocking spinner, silently upgrades mock → real data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await api.get(`/categories/${id}`);
        if (data) { setCategory(data); return; }
      } catch {
        // fallback: try full list
      }
      try {
        const { data } = await api.get("/categories");
        const found = data?.find((cat) => (cat._id || cat.id)?.toString() === id?.toString());
        if (found) setCategory(found);
        // If not found, keep mock data already displayed
      } catch {
        // Keep mock already displayed
      }
    };
    fetchCategory();
  }, [id]);

  const subs = category?.subCategories ?? [];

  useEffect(() => {
    if (subs.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % subs.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [subs.length]);

  // Fetch services — background, mock already loaded
  useEffect(() => {
    api.get("/services").then(({ data }) => {
      if (data && data.length > 0) setServices(data);
    }).catch(() => {/* keep mock */});
  }, []);

  const activeSub = subs[activeIndex] ?? null;

  const getServiceLink = (name, subId) => {
    const match = services?.find(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() ||
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (match) return `/service/${match.slug || match._id || match.id}`;
    return `/service/${subId}`;
  };

  // Enrich each subCategory with its matched service (for price/rating),
  // then filter by type and sort — all derived from existing state,
  // no new fetches.
  const enrichedSubs = (category?.subCategories ?? []).map((sub) => {
    const matched = services?.find(
      (s) => s.name.toLowerCase() === sub.name.toLowerCase()
    );
    return { ...sub, matched };
  });

  const filteredSubs = enrichedSubs.filter((sub) => {
    if (filterType === "ALL") return true;
    if (filterType === "SERVICE") return sub.type === "SERVICE_ONLY" || sub.type === "BOTH";
    if (filterType === "RENTAL") return sub.type === "PRODUCT_ONLY" || sub.type === "BOTH";
    return true;
  });

  const sortedSubs = [...filteredSubs].sort((a, b) => {
    if (sortBy === "price-low" || sortBy === "price-high") {
      const priceA = a.matched?.startingPrice ?? Infinity;
      const priceB = b.matched?.startingPrice ?? Infinity;
      return sortBy === "price-low" ? priceA - priceB : priceB - priceA;
    }
    if (sortBy === "rating") {
      const ratingA = a.matched?.rating ?? -1;
      const ratingB = b.matched?.rating ?? -1;
      return ratingB - ratingA;
    }
    // "popular" — keep original displayOrder if present, else original array order
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });

  const hasRentalOrService = enrichedSubs.some(
    (s) => s.type === "PRODUCT_ONLY" || s.type === "SERVICE_ONLY" || s.type === "BOTH"
  );



  if (!category) {
    return (
      <div
        className="text-center py-20 text-2xl"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-dark)",
        }}
      >
        Category not found
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-16 sm:pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Light banner ── */}
      <CategoryBanner
        category={category}
        activeSub={activeSub}
        activeIndex={activeIndex}
        subs={subs}
        setActiveIndex={setActiveIndex}
      />

      {/* ── Coming Soon notice ── */}
      {category?.comingSoon && (
        <div
          className="px-4 sm:px-8 lg:px-10 mt-6"
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4 border"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              borderColor: "rgba(245,158,11,0.45)",
            }}
          >
            <span style={{ fontSize: "20px" }}>⏳</span>
            <div>
              <p
                className="m-0 text-sm font-semibold"
                style={{ fontFamily: "var(--font-body)", color: "#b45309" }}
              >
                {category.name} is coming soon!
              </p>
              <p
                className="m-0 text-xs"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
              >
                We're preparing these services for launch. Booking will open shortly — check back soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Services grid ── */}
      <div id="services" className="px-4 sm:px-8 lg:px-10 mt-10 sm:mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-5 flex-1">
            <h2
              className="text-xl sm:text-2xl font-normal whitespace-nowrap m-0"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-dark)",
              }}
            >
              {category?.comingSoon ? "Upcoming Services" : "Available Services"}
            </h2>
            <div
              className="flex-1 h-px hidden sm:block"
              style={{
                background:
                  "linear-gradient(to right, var(--color-accent), transparent)",
              }}
            />
          </div>
        </div>

      
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
        >
          {sortedSubs.length === 0 ? (
            <p
              className="col-span-full text-center py-12 text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
            >
              No services match this filter.
            </p>
          ) : (
            sortedSubs.map((service) => {
              const matched = service.matched;

              return (
                <motion.div
                  key={service._id || service.id}
                  className="relative"
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                  }}
                >
                  {matched?.rating && (
                    <span
                      className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(4px)",
                        color: "#fff",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      ★ {matched.rating}
                    </span>
                  )}

                  <Card
                    title={service.name}
                    description={service.description}
                    image={service.imageUrl}
                    primaryAction="Book Service"
                    variant="overlay"
                    linkTo={getServiceLink(service.name, service._id)}
                    comingSoon={!!category?.comingSoon}
                  />

                  {matched?.startingPrice != null && (
                    <p
                      className="mt-2 text-sm font-semibold"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
                    >
                      Starting at ₹{matched.startingPrice.toLocaleString("en-IN")}
                      {matched.priceUnit && (
                        <span
                          className="text-xs font-normal ml-1"
                          style={{ color: "var(--color-text-mid)" }}
                        >
                          /{matched.priceUnit}
                        </span>
                      )}
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* ── Bottom CTA — category-specific, animated ── */}
      <motion.section
        className="relative px-4 sm:px-8 lg:px-16 py-20 sm:py-24 mt-16 sm:mt-20 text-center border-t overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {/* Ambient glow — subtle, continuous pulse, purely decorative */}
        <motion.div
          className="absolute left-1/2 top-1/2 pointer-events-none"
          style={{
            width: "480px",
            height: "480px",
            marginLeft: "-240px",
            marginTop: "-240px",
            borderRadius: "9999px",
            background: "var(--color-primary)",
            filter: "blur(120px)",
          }}
          animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.h2
          className="relative font-normal mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 3.5vw, 42px)",
            color: "var(--color-text-dark)",
            letterSpacing: "-0.02em",
          }}
          variants={{
            hidden: { y: 24, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
          }}
        >
          Need Help With {category.name}?
        </motion.h2>

        <motion.p
          className="relative mb-8 text-base mx-auto"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
            maxWidth: "500px",
          }}
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
          }}
        >
          Get matched with verified {category.name.toLowerCase()} specialists near you. Compare packages, check reviews, and book with confidence.
        </motion.p>

        <motion.div
          variants={{
            hidden: { y: 16, opacity: 0, scale: 0.96 },
            visible: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: { duration: 0.5, ease: "easeOut" },
            },
          }}
        >
          <MotionLink
            to="/contact"
            className="relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold no-underline"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-text-dark)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(44,24,16,0.2)",
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 28px rgba(44,24,16,0.3)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Contact Support
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </MotionLink>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default Category;