import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const INTERVAL_MS = 4000;

const Hero = ({ categories }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!categories?.length) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [categories]);

  const active = categories?.[activeIndex];

  const getPreview = (offset) =>
    categories?.[(activeIndex + offset) % categories.length];

  const truncate = (text, limit = 100) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit).replace(/\s+\S*$/, "") + "…";
  };

  const preview1 = getPreview(1);
  const preview2 = getPreview(2);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: "480px" }}
    >
      {/* ── Full-bleed background crossfade ── */}
      <div className="absolute inset-0 z-0">
        {categories?.map((cat, i) => (
          <img
            key={cat.id}
            src={cat.imageUrl}
            alt={cat.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}
        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.78) 35%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.62) 100%)",
          }}
        />
      </div>

      {/* ── Active slide number (top-right) — hidden on mobile ── */}
      <div
        className="absolute top-20 sm:top-24 right-6 sm:right-12 z-20 text-white font-bold hidden sm:block"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 6vw, 90px)",
          opacity: 0.9,
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {String(activeIndex + 1).padStart(2, "0")}
      </div>

      {/* ── Bottom-left: badge + heading + description + CTA ── */}
      <div
        className="absolute z-20 max-w-xl"
        style={{
          animation: "fadeUp 0.9s ease both",
          bottom: "clamp(90px, 14vh, 110px)",
          left: "clamp(16px, 5vw, 64px)",
          right: "clamp(16px, 5vw, 64px)",
        }}
      >
        {/* Badge */}
        <span
          className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white/80 mb-3 sm:mb-5 border border-white/25 backdrop-blur-sm"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "rgba(255,255,255,0.12)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.5s ease",
          }}
        >
          {active?.name}
        </span>

        <h1
          className="text-white font-normal leading-[1.05] mb-2 sm:mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 8vw, 80px)",
            letterSpacing: "-0.02em",
            textShadow: "0 2px 24px rgba(0,0,0,0.3)",
            transition: "all 0.5s ease",
          }}
        >
          {active?.name}.
        </h1>

        <p
          className="text-white/80 text-sm sm:text-lg mb-5 sm:mb-8 leading-relaxed"
          style={{
            fontFamily: "var(--font-body)",
            maxWidth: "420px",
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
            transition: "all 0.5s ease",
          }}
        >
          {truncate(active?.description, window.innerWidth < 640 ? 70 : 100)}
        </p>

        <Link
          to={`/category/${active?.id}`}
          className="inline-block px-5 sm:px-8 py-2.5 sm:py-4 rounded-full text-xs sm:text-base font-semibold no-underline transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "rgba(255,255,255,0.95)",
            color: "var(--color-text-dark)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          Explore {active?.name}
        </Link>
      </div>

      {/* ── Right: stacked preview cards — hidden below desktop ── */}
      <div className="absolute right-12 bottom-20 z-20 flex-col gap-4 w-72 hidden lg:flex">
        {[preview1, preview2].map((cat, idx) => {
          const slideNum = (activeIndex + idx + 1) % categories.length;
          return (
            <button
              key={cat?.id}
              onClick={() =>
                setActiveIndex((activeIndex + idx + 1) % categories.length)
              }
              className="w-full text-left rounded-2xl overflow-hidden border-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                padding: 0,
              }}
            >
              <div className="flex items-center gap-0 relative">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-22 h-20 overflow-hidden rounded-l-2xl">
                  <img
                    src={cat?.imageUrl}
                    alt={cat?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="flex-1 px-4 py-3">
                  <p
                    className="text-sm font-semibold text-white m-0 mb-0.5 leading-tight"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cat?.name}
                  </p>
                  <p
                    className="text-xs text-white/55 m-0 leading-snug line-clamp-1"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cat?.description}
                  </p>
                </div>

                {/* Slide number */}
                <span
                  className="absolute top-2 right-3 text-white/60 font-bold text-sm"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(slideNum + 1).padStart(2, "0")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Slide indicators (bottom-center) ── */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-3 px-4 max-w-[90vw]">
        <span
          className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-white/60 text-center truncate max-w-full"
          style={{ fontFamily: "var(--font-body)", letterSpacing: "0.12em" }}
        >
          {categories?.map((cat, i) => (
            <span
              key={cat.id}
              style={{
                opacity: i === activeIndex ? 1 : 0,
                position: i === activeIndex ? "relative" : "absolute",
                transition: "opacity 0.4s ease",
              }}
            >
              {cat.name}
            </span>
          ))}
        </span>

        <div className="flex gap-1.5 sm:gap-2">
          {categories?.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="rounded-full border-0 cursor-pointer transition-all duration-300"
              style={{
                width: i === activeIndex ? "20px" : "6px",
                height: "6px",
                backgroundColor:
                  i === activeIndex
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.35)",
                padding: 0,
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;