import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const INTERVAL_MS = 4000;

const AboutSection = ({ categories }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!categories?.length) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [categories]);

  const active = categories?.[activeIndex];
  const subs = active?.subCategories?.slice(0, 2) ?? [];

  return (
    <section
      className="px-4 sm:px-8 lg:px-16 py-10 sm:py-12"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Section label */}
      <p
        className="text-lg sm:text-xl font-semibold uppercase tracking-widest mb-0"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-accent)",
          letterSpacing: "0.14em",
        }}
      >
        What We Do
      </p>

      {/* Content — stacks on mobile, side-by-side on md+ */}
      <div
        className="flex flex-col md:flex-row gap-8 md:gap-20 items-center mt-6"
        style={{ minHeight: "auto" }}
      >
        {/* ── Left: image ── */}
        <div className="relative w-full md:w-[45%] flex-shrink-0">
          {/* Main image */}
          <div
            className="w-full overflow-hidden"
            style={{
              borderRadius: "16px",
              aspectRatio: "4/3",
              position: "relative",
            }}
          >
            {categories?.map((cat, i) => (
              <img
                key={cat.id}
                src={cat.secondaryImageUrl || cat.imageUrl}
                alt={cat.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: i === activeIndex ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                  borderRadius: "16px",
                }}
              />
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2 justify-center mt-4">
            {categories?.map((_, i) => (
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
                      : "rgba(44,24,16,0.2)",
                  padding: 0,
                }}
                aria-label={`View ${categories[i].name}`}
              />
            ))}
          </div>
        </div>

        {/* ── Right: details ── */}
        <div className="flex-1 min-w-0 w-full">
          {/* Category label */}
          <div className="flex items-center gap-1 mb-5">
            <div
              className="w-10 h-px"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-accent)",
                letterSpacing: "0.12em",
              }}
            >
              {active?.name}
            </span>
          </div>

          {/* Heading */}
          <h2
            className="font-normal leading-[1.1] mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3vw, 46px)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.02em",
              transition: "all 0.5s ease",
            }}
          >
            {active?.name} <br />
            <span style={{ opacity: 0.5 }}>done right.</span>
          </h2>

          {/* Description */}
          <p
            className="text-base leading-relaxed mb-6"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              maxWidth: "600px",
              transition: "all 0.5s ease",
            }}
          >
            {active?.description}{" "}
            <strong>
              We bring trusted professionals to your doorstep — fast, reliable,
              and always on time.
            </strong>
          </p>

          {/* 2 subcategory pills */}
          <div className="flex flex-col gap-4 mb-6">
            {subs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                  transition: "all 0.4s ease",
                }}
              >
                {/* Thumbnail */}
                <div
                  className="flex-shrink-0 overflow-hidden rounded-xl"
                  style={{ width: "60px", height: "52px" }}
                >
                  <img
                    src={sub.imageUrl}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p
                    className="font-semibold m-0 mb-0.5 text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    ✓ {sub.name}
                  </p>
                  <p
                    className="text-xs m-0 leading-snug"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    {sub.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/about"
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-text-dark)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(44,24,16,0.18)",
            }}
          >
            Know More About Us
            <span style={{ fontSize: "18px" }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
