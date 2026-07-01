import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { mockCategories } from "../data/mockCategories";

const INTERVAL_MS = 4000;

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rating" },
  { value: "20K+", label: "Services Completed" },
  { value: "50+", label: "Expert Professionals" },
];

const values = [
  {
    icon: "✦",
    title: "Locally Owned & Operated",
    desc: "We're part of your community — every booking supports local professionals.",
  },
  {
    icon: "◎",
    title: "Always Here 24/7",
    desc: "Round-the-clock support so you're never stuck when something goes wrong.",
  },
  {
    icon: "◈",
    title: "Certified Professionals",
    desc: "Every professional on our platform is vetted, verified, and rated.",
  },
  {
    icon: "◇",
    title: "Problem Solvers at Heart",
    desc: "We don't just fix things — we make sure they stay fixed.",
  },
];

const About = () => {
  const { data: categories } = useFetch(mockCategories);
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
    <div
      className="min-h-screen pb-16 sm:pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero banner ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "280px",
          backgroundColor: "var(--color-text-dark)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${categories?.[0]?.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(40%)",
          }}
        />
        <div className="relative z-10 px-4 sm:px-10 lg:px-16 py-20 sm:py-24">
          <nav
            className="flex items-center gap-2 text-xs mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link
              to="/"
              className="no-underline text-white opacity-60 hover:opacity-100"
            >
              Home
            </Link>
            <span className="text-white opacity-40">/</span>
            <span className="text-white font-semibold">About Us</span>
          </nav>
          <h1
            className="font-normal text-white leading-[1.05]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 72px)",
              letterSpacing: "-0.02em",
            }}
          >
            Meet the Team <br />
            <span style={{ opacity: 0.5 }}>Behind the Service.</span>
          </h1>
          <p
            className="text-white mt-4 max-w-md"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.65,
              fontSize: "1rem",
              lineHeight: 1.7,
            }}
          >
            We're more than just a platform — we're a team of dedicated problem
            solvers committed to connecting you with the best local
            professionals.
          </p>
        </div>
      </div>

      {/* ── Stats row — 2 cols on mobile, 4 on desktop ── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="py-8 sm:py-10 px-4 sm:px-8 text-center"
            style={{
              borderRight:
                i % 2 === 0
                  ? "1px solid var(--color-border)"
                  : i < 3
                    ? "1px solid var(--color-border)"
                    : "none",
              borderBottom:
                i < 2 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <p
              className="text-3xl sm:text-4xl font-normal m-0 mb-1"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-dark)",
              }}
            >
              {s.value}
            </p>
            <p
              className="text-sm m-0"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── What We Do ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-20">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-accent)",
            letterSpacing: "0.14em",
          }}
        >
          What We Do
        </p>

        <div
          className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mt-8 sm:mt-10"
          style={{ minHeight: "auto" }}
        >
          {/* Left image */}
          <div className="relative w-full md:w-[42%] flex-shrink-0">
            <div
              className="absolute top-5 left-5 z-10 px-4 py-3 rounded-2xl"
              style={{
                backgroundColor: "var(--color-accent)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              <p
                className="text-2xl font-bold m-0 leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                }}
              >
                10+
              </p>
              <p
                className="text-xs m-0 mt-0.5 leading-tight"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dark)",
                  opacity: 0.75,
                }}
              >
                Years Of
                <br />
                Experience
              </p>
            </div>
            <div
              className="w-full overflow-hidden relative"
              style={{ borderRadius: "24px", aspectRatio: "4/4.2" }}
            >
              {categories?.map((cat, i) => (
                <img
                  key={cat.id}
                  src={cat.imageUrl}
                  alt={cat.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: i === activeIndex ? 1 : 0,
                    transition: "opacity 1s ease-in-out",
                  }}
                />
              ))}
            </div>
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
                  aria-label={`View ${categories?.[i]?.name}`}
                />
              ))}
            </div>
          </div>

          {/* Right detail */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-px"
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
            <h2
              className="font-normal leading-[1.1] mb-4"
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
            <p
              className="text-base leading-relaxed mb-8"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
                maxWidth: "400px",
                transition: "all 0.5s ease",
              }}
            >
              {active?.description} We bring trusted professionals to your
              doorstep — fast, reliable, and always on time.
            </p>
            <div className="flex flex-col gap-4 mb-0">
              {subs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{
                    backgroundColor: "var(--color-bg-soft)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    className="flex-shrink-0 overflow-hidden rounded-xl"
                    style={{ width: "52px", height: "52px" }}
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
          </div>
        </div>
      </section>

      {/* ── Our Values — 1 col on mobile, 2 on md+ ── */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16"
        style={{ backgroundColor: "var(--color-bg-soft)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-accent)",
            letterSpacing: "0.14em",
          }}
        >
          Why Choose Us
        </p>
        <h2
          className="font-normal mb-8 sm:mb-12"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(22px, 3vw, 42px)",
            color: "var(--color-text-dark)",
            letterSpacing: "-0.02em",
          }}
        >
          Built on trust,
          <br />
          <span style={{ opacity: 0.45 }}>driven by results.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="text-2xl m-0 mb-3">{v.icon}</p>
              <p
                className="font-semibold m-0 mb-2 text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dark)",
                }}
              >
                {v.title}
              </p>
              <p
                className="text-sm m-0 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse Categories CTA ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16 text-center">
        <h2
          className="font-normal mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(22px, 3vw, 42px)",
            color: "var(--color-text-dark)",
            letterSpacing: "-0.02em",
          }}
        >
          Ready to get started?
        </h2>
        <p
          className="mb-8 text-base"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
          }}
        >
          Browse our services and book a professional in minutes.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--color-text-dark)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(44,24,16,0.2)",
          }}
        >
          Explore All Services →
        </Link>
      </section>
    </div>
  );
};

export default About;
