import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const PROMO_BANNERS = [
  {
    id: "wedding",
    tag: "Wedding & Celebration",
    tagBg: "rgba(225, 29, 72, 0.1)",
    tagColor: "#e11d48",
    headline: "Plan Your Perfect Wedding.",
    subheadLabel: "Find trusted services for your special day:",
    subheadItems: "Venues • Decorators • Photographers • Makeup • Catering & More",
    bullets: [
      { icon: "💍", text: "Trusted Service Providers" },
      { icon: "✨", text: "Multiple Options" },
      { icon: "📅", text: "Easy Booking" },
    ],
    ctaText: "Book Wedding Services →",
    ctaLink: "/category/wedding",
    bgImage: "/banners/wedding_banner.webp",
    fallbackBg: "#fdf8f5",
    themeColor: "#be123c",
    buttonBg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
    buttonShadow: "0 6px 20px rgba(225, 29, 72, 0.35)",
  },
  {
    id: "tuition",
    tag: "Verified Expert Tutors",
    tagBg: "rgba(14, 165, 233, 0.12)",
    tagColor: "#0284c7",
    headline: "Find trusted home tutors for:",
    subheadLabel: null,
    subheadItems: "Maths • Science • English • Computer • Other Subjects",
    bullets: [
      { icon: "👨‍🏫", text: "Experienced Tutors" },
      { icon: "🏠", text: "One-to-One Learning" },
      { icon: "📚", text: "Personalized Classes" },
    ],
    ctaText: "Book a Tutor Today →",
    ctaLink: "/category/home-tuition",
    bgImage: "/banners/tuition_banner.webp",
    fallbackBg: "#f0f9ff",
    themeColor: "#0284c7",
    buttonBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    buttonShadow: "0 6px 20px rgba(2, 132, 199, 0.35)",
  },
];

export default function SpotlightPromoBanners() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = PROMO_BANNERS[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? PROMO_BANNERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  return (
    <section className="w-full bg-white py-8 sm:py-12 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header Tabs */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
              Featured Highlights
            </span>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight m-0"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Spotlight Services
            </h2>
          </div>

          {/* Tab Selector & Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden xs:flex items-center bg-gray-100 p-1 rounded-xl">
              {PROMO_BANNERS.map((banner, idx) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                    activeIndex === idx
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {banner.id === "wedding" ? "💍 Wedding" : "📚 Tuition"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous promo banner"
                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next promo banner"
                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Banner Display Container */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-[#fdfdfd]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[400px] flex items-center bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${current.bgImage})`,
                backgroundColor: current.fallbackBg,
                backgroundPosition: "center right",
              }}
            >
              {/* Soft overlay on mobile / tablet to guarantee 100% text readability */}
              <div
                className="absolute inset-0 pointer-events-none md:hidden"
                style={{
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.2) 100%)",
                }}
              />

              {/* Text & Content Column on Left */}
              <div className="relative z-10 w-full sm:w-[65%] md:w-[55%] lg:w-[50%] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                {/* Pill Tag */}
                <div className="mb-2.5 sm:mb-3">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide uppercase"
                    style={{
                      backgroundColor: current.tagBg,
                      color: current.tagColor,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {current.tag}
                  </span>
                </div>

                {/* Headline */}
                <h3
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2 sm:mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {current.headline}
                </h3>

                {/* Subhead Items */}
                <div className="mb-4 sm:mb-5">
                  {current.subheadLabel && (
                    <p className="text-xs sm:text-sm text-gray-600 font-medium m-0 mb-1">
                      {current.subheadLabel}
                    </p>
                  )}
                  <p
                    className="text-xs sm:text-[13.5px] font-semibold text-gray-800 m-0"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {current.subheadItems}
                  </p>
                </div>

                {/* Bullet Points with Emojis */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-6 sm:mb-7">
                  {current.bullets.map((b, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-sm text-xs sm:text-sm font-semibold text-gray-800"
                    >
                      <span className="text-base">{b.icon}</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div>
                  <Link
                    to={current.ctaLink}
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold text-white no-underline transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                    style={{
                      background: current.buttonBg,
                      boxShadow: current.buttonShadow,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <span>{current.ctaText}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Progress Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {PROMO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full border-0 cursor-pointer ${
                  activeIndex === idx
                    ? "w-7 h-2 bg-gray-900"
                    : "w-2 h-2 bg-gray-400 hover:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
