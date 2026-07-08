import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import weddingImgg from "../assets/weddingImgg.avif";
import carImg from "../assets/carImg.avif";
import CCTVImg from "../assets/CCTVImg.avif";
import serviceHeroImg from "../assets/serviceHeroImg.avif";
const CATEGORIES = [
  {
    id: "weddings",
    name: "Wedding & Party",
    tagline: "Exquisite Moments",
    description: "Photography, décor, catering & styling.",
    image: weddingImgg,
    link: "/services/weddings",
    color: "#440101",
    icon: "💍",
    stats: { providers: "50+", rating: "4.8" },
  },
  {
    id: "car-rentals",
    name: "Car Rentals",
    tagline: "Premium Rides",
    description: "Luxury sedans to rugged SUVs.",
    image: carImg,
    link: "/services/car-rentals",
    color: "#0c193b",
    icon: "🚗",
    stats: { providers: "30+", rating: "4.6" },
  },
  {
    id: "cctv",
    name: "CCTV Security",
    tagline: "Smart Vigilance",
    description: "Enterprise-grade CCTV & monitoring.",
    image: CCTVImg,
    link: "/services/cctv",
    color: "#1b2c4d",
    icon: "📹",
    stats: { providers: "20+", rating: "4.7" },
  },
];

const Services = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Hero with background image */}
      <section
        className="relative w-full overflow-hidden flex items-center justify-center text-center"
        style={{ minHeight: "50vh" }}
      >
        <img
          src={serviceHeroImg}
          alt="Services Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 to-slate-950/80" />

        <div
          className="relative z-10 px-6 py-32"
          style={{
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <span
            className="inline-block px-5 py-2 rounded-full text-xs font-semibold text-white/90 mb-6 border border-white/20 backdrop-blur-md uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            Our Services
          </span>
          <h1
            className="text-white font-normal leading-tight mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 72px)",
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need,
            <br />
            All in One Place
          </h1>
          <p
            className="text-white/70 text-lg sm:text-xl mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              maxWidth: "600px",
              lineHeight: "1.6",
            }}
          >
            Discover premium services across three categories — from
            celebrations to commutes to security.
          </p>
        </div>
      </section>

      {/* Category Cards (Row Layout) */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-20 sm:py-28"
        style={{ backgroundColor: "var(--color-bg-soft)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {CATEGORIES.map((cat, index) => (
            <Link
              to={cat.link}
              key={cat.id}
              className="group no-underline block"
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "translateY(0)" : "translateY(40px)",
                transition: `all 0.7s ease ${index * 0.15}s`,
              }}
            >
              <div
                className="relative overflow-hidden rounded-[2rem] transition-all duration-500 flex flex-col h-full"
                style={{
                  minHeight: "450px",
                  boxShadow:
                    hoveredId === cat.id
                      ? "0 30px 60px rgba(0,0,0,0.15)"
                      : "0 10px 40px rgba(0,0,0,0.08)",
                  transform:
                    hoveredId === cat.id
                      ? "translateY(-12px)"
                      : "translateY(0)",
                }}
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  style={{
                    transform:
                      hoveredId === cat.id ? "scale(1.08)" : "scale(1)",
                  }}
                />
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom, ${cat.color}77 0%, ${cat.color}ee 75%, rgba(0,0,0,0.95) 100%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-10 flex flex-col justify-end h-full">
                  <div className="mb-auto">
                    <span
                      className="text-5xl block mb-6"
                      style={{
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                      }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <div>
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/30 uppercase tracking-widest mb-4"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {cat.name}
                    </span>
                    <h2
                      className="text-white font-normal leading-tight mb-3"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(26px, 2.8vw, 36px)",
                      }}
                    >
                      {cat.tagline}
                    </h2>
                    <p
                      className="text-white/85 text-base mb-8 leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {cat.description}
                    </p>

                    <div
                      className="flex items-center justify-between"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.2)",
                        paddingTop: "1.5rem",
                      }}
                    >
                      <div className="flex gap-6">
                        {Object.entries(cat.stats).map(([key, val]) => (
                          <div key={key}>
                            <p
                              className="text-white font-bold text-xl m-0 leading-none mb-1"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {val}
                            </p>
                            <p
                              className="text-white/60 text-[11px] font-semibold uppercase tracking-widest m-0"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {key}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                        style={{
                          backgroundColor:
                            hoveredId === cat.id
                              ? "rgba(255,255,255,0.3)"
                              : "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(12px)",
                          transform:
                            hoveredId === cat.id
                              ? "scale(1.1) translateX(4px)"
                              : "scale(1) translateX(0)",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center px-6 py-16 sm:py-24">
        <h2
          className="font-normal mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3vw, 40px)",
            color: "var(--color-text-dark)",
          }}
        >
          Can't find what you're looking for?
        </h2>
        <p
          className="text-base mb-8 mx-auto"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
            maxWidth: "440px",
          }}
        >
          We're constantly expanding our network. Reach out and we'll connect
          you with the right provider.
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
    </div>
  );
};

export default Services;
