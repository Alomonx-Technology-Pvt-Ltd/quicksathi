import { Link } from "react-router-dom";
import Stars from "./Stars";
import { motion } from "framer-motion";

const HeroBanner = ({ service, allImages, activeImg, setActiveImg }) => {
  return (
    <div
      className="relative w-full overflow-hidden sm:min-h-[460px]"
      style={{ height: "65vh", minHeight: "380px" }}
    >
      <motion.img
        src={allImages[activeImg]}
        alt={service.name}
        className="w-full h-full object-cover"
        initial={{
          scale: 1.1,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 25%, rgba(0,0,0,0.10) 65%, transparent 100%)",
        }}
      />

      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-16 sm:top-20 left-4 sm:left-10 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs z-10 max-w-[60%]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Link
          to="/"
          className="no-underline hover:opacity-70 flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          Home
        </Link>

        <span style={{ color: "rgba(255,255,255,0.30)" }}>/</span>

        <Link
          to={`/category/${service.categoryId}`}
          className="no-underline hover:opacity-70 truncate hidden sm:inline"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          {service.categoryName}
        </Link>

        <span
          style={{ color: "rgba(255,255,255,0.30)" }}
          className="hidden sm:inline"
        >
          /
        </span>

        <span
          className="font-semibold truncate"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          {service.name}
        </span>
      </motion.nav>

      {/* Gallery */}
      {allImages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-16 sm:top-20 right-4 sm:right-10 z-10 flex gap-1.5 sm:gap-2 overflow-x-auto max-w-[35%] sm:max-w-none"
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className="rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0"
              style={{
                width: "40px",
                height: "30px",
                padding: 0,
                cursor: "pointer",
                borderColor:
                  i === activeImg
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.30)",
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Bottom Left — name, tags, meta */}
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="absolute bottom-24 sm:bottom-8 left-4 sm:left-10 right-4 sm:right-auto z-10"
      >
        <div className="flex gap-2 mb-2 sm:mb-3 flex-wrap">
          {service.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border border-white/25 backdrop-blur-sm"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "rgba(255,255,255,0.13)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h1
          className="text-white font-normal leading-tight mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 6vw, 64px)",
            letterSpacing: "-0.02em",
          }}
        >
          {service.name}
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Stars rating={service.rating} />

          <span
            className="text-white/60 text-xs sm:text-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {service.rating} · {service.totalReviews} reviews
          </span>

          <span className="text-white/40 hidden sm:inline">·</span>

          <span
            className="text-white/60 text-xs sm:text-sm hidden sm:inline"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {service.experience} experience
          </span>

          <span className="text-white/40 hidden sm:inline">·</span>

          <span
            className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: service.available
                ? "rgba(34,197,94,0.25)"
                : "rgba(239,68,68,0.25)",
              color: service.available ? "#4ade80" : "#f87171",
            }}
          >
            {service.available ? "Available Now" : "Unavailable"}
          </span>
        </div>
      </motion.div>

      {/* Price — moves below name block on mobile, side-by-side on desktop */}
      <motion.div
        initial={{
          opacity: 0,
          x: 40,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.7,
          delay: 0.5,
        }}
        className="absolute bottom-8 sm:bottom-8 right-4 sm:right-10 z-10 text-right"
      >
        <p
          className="text-white/50 text-[10px] sm:text-xs mb-0.5 sm:mb-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Starting from
        </p>

        <p
          className="text-white font-bold text-xl sm:text-3xl m-0"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ₹{service.startingPrice?.toLocaleString()}
        </p>

        <p
          className="text-white/50 text-[10px] sm:text-xs mt-0.5 sm:mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {service.priceUnit}
        </p>
      </motion.div>
    </div>
  );
};

export default HeroBanner;