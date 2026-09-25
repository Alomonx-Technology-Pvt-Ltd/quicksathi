import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Only Real Working Platform Services in QuickSathi ─────────────────────────
const CATEGORY_BANNERS = [
  {
    id: "ac",
    badge: "Top Summer Pick",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Deep clean with foam-jet AC service",
    subtitle: "AC service, gas refill & doorstep repair",
    cta: "BOOK",
    link: "/services/ac",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#0284c7",
    buttonText: "#ffffff",
    image: "/images/ac/foam-jet.webp",
    imageAlt: "Foam jet AC service deep cleaning",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(8, 28, 48, 0.85) 0%, rgba(12, 38, 64, 0.70) 52%, rgba(12, 38, 64, 0.25) 82%, rgba(12, 38, 64, 0.05) 100%)",
    bgFallback: "#0d2b45",
  },
  {
    id: "repair",
    badge: "Home Essential",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Home repairs at affordable prices",
    subtitle: "Electricians, plumbers & carpentry help",
    cta: "BOOK",
    link: "/category/house-services",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#0066cc",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Electrician home repairs",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(2, 45, 102, 0.86) 0%, rgba(3, 62, 138, 0.70) 52%, rgba(3, 62, 138, 0.25) 82%, rgba(3, 62, 138, 0.05) 100%)",
    bgFallback: "#00488f",
  },
  {
    id: "salon",
    badge: "Salon at Home",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Glow at home with expert salon",
    subtitle: "Hair styling, facials, waxing & makeup",
    cta: "BOOK",
    link: "/category/home-salon",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#be185d",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Home salon and beauty grooming",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(76, 12, 48, 0.86) 0%, rgba(102, 18, 64, 0.70) 52%, rgba(102, 18, 64, 0.25) 82%, rgba(102, 18, 64, 0.05) 100%)",
    bgFallback: "#5c133a",
  },
  {
    id: "rental",
    badge: "Instant Booking",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Chauffeur & self-drive rentals",
    subtitle: "Sedans, SUVs & luxury wedding cars",
    cta: "BOOK",
    link: "/category/vehicle-rental",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#1d4ed8",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Car rental fleet",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(8, 20, 42, 0.88) 0%, rgba(12, 30, 62, 0.70) 52%, rgba(12, 30, 62, 0.25) 82%, rgba(12, 30, 62, 0.05) 100%)",
    bgFallback: "#091a38",
  },
  {
    id: "wedding",
    badge: "Grand Setup",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Plan Your Perfect Wedding",
    subtitle: "Venues, decor, photo & catering",
    cta: "BOOK",
    link: "/category/wedding",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#e11d48",
    buttonText: "#ffffff",
    image: "/banners/wedding_banner.webp",
    imageAlt: "Wedding mandap and stage setup",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(58, 12, 32, 0.88) 0%, rgba(78, 18, 44, 0.70) 52%, rgba(78, 18, 44, 0.25) 82%, rgba(78, 18, 44, 0.05) 100%)",
    bgFallback: "#320b1e",
  },
  {
    id: "help",
    badge: "Verified Staff",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Deep home cleaning & maids",
    subtitle: "Kitchen, bathroom & daily house help",
    cta: "BOOK",
    link: "/category/house-help",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#0f766e",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Professional house cleaning and maid",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(8, 56, 52, 0.88) 0%, rgba(12, 74, 68, 0.70) 52%, rgba(12, 74, 68, 0.25) 82%, rgba(12, 74, 68, 0.05) 100%)",
    bgFallback: "#09534c",
  },
  {
    id: "tuition",
    badge: "1st Class Free",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Find trusted home tutors",
    subtitle: "Maths, Science, English & Computer",
    cta: "BOOK",
    link: "/category/home-tuition",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#0284c7",
    buttonText: "#ffffff",
    image: "/banners/tuition_banner.webp",
    imageAlt: "Home tuition tutor and student",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(10, 32, 58, 0.88) 0%, rgba(14, 46, 82, 0.70) 52%, rgba(14, 46, 82, 0.25) 82%, rgba(14, 46, 82, 0.05) 100%)",
    bgFallback: "#0d2b45",
  },
  {
    id: "painting",
    badge: "Clean Finish",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "Professional home painting",
    subtitle: "Waterproof, dust-free wall makeover",
    cta: "BOOK",
    link: "/category/painting",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#4f46e5",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Home painting and wall makeover",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(32, 26, 80, 0.88) 0%, rgba(44, 36, 110, 0.70) 52%, rgba(44, 36, 110, 0.25) 82%, rgba(44, 36, 110, 0.05) 100%)",
    bgFallback: "#271f65",
  },
  {
    id: "cctv",
    badge: "Same-Day Setup",
    badgeBg: "rgba(255, 255, 255, 0.22)",
    badgeColor: "#ffffff",
    title: "24/7 Smart CCTV surveillance",
    subtitle: "HD cameras, smart locks & live feed",
    cta: "BOOK",
    link: "/services?q=cctv",
    textColor: "#ffffff",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    buttonBg: "#ea580c",
    buttonText: "#ffffff",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Smart CCTV camera",
    imagePosition: "center right",
    overlayGradient:
      "linear-gradient(90deg, rgba(16, 22, 36, 0.88) 0%, rgba(24, 32, 52, 0.70) 52%, rgba(24, 32, 52, 0.25) 82%, rgba(24, 32, 52, 0.05) 100%)",
    bgFallback: "#0f172a",
  },
];

export default function CategoryBannersCarousel() {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".category-banner-card")?.offsetWidth || 380;
    const scrollOffset = direction === "left" ? -(cardWidth + 16) : cardWidth + 16;
    el.scrollBy({ left: scrollOffset, behavior: "smooth" });
  };

  return (
    <section className="relative w-full max-w-full overflow-hidden pt-3 pb-6 sm:py-6 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Navigation Arrow Left (Desktop) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label="Previous banners"
            className="hidden md:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 text-gray-800 shadow-xl border border-gray-200/80 items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* Navigation Arrow Right (Desktop) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Next banners"
            className="hidden md:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 text-gray-800 shadow-xl border border-gray-200/80 items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {CATEGORY_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="category-banner-card snap-start flex-shrink-0 no-underline block rounded-2xl sm:rounded-3xl overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] group"
              style={{
                width: "clamp(310px, 82vw, 385px)",
                height: "195px",
                backgroundColor: banner.bgFallback,
                color: banner.textColor,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              {/* ── Full Card Photographic Imagery (Rendered across full card) ── */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.imageAlt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{
                    objectPosition: banner.imagePosition || "center right",
                  }}
                />
              </div>

              {/* ── Soft Semi-Transparent Tint Behind Text (allows image to subtly shine through) ── */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: banner.overlayGradient,
                  backdropFilter: "blur(0.5px)",
                }}
              />

              {/* ── Left Column: Clean Text & CTA ── */}
              <div
                className="absolute inset-y-0 left-0 flex flex-col justify-between p-4 sm:p-5 z-10"
                style={{ width: "65%" }}
              >
                <div>
                  {/* Badge */}
                  {banner.badge ? (
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm"
                      style={{
                        backgroundColor: banner.badgeBg,
                        color: banner.badgeColor,
                        fontFamily: "var(--font-body)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      }}
                    >
                      {banner.badge}
                    </span>
                  ) : (
                    <div className="h-2" />
                  )}

                  {/* Title */}
                  <h3
                    className="text-[15px] sm:text-base font-extrabold leading-[1.25] line-clamp-2 m-0 drop-shadow-sm"
                    style={{
                      fontFamily: "var(--font-display)",
                      letterSpacing: "-0.01em",
                      color: banner.textColor,
                    }}
                  >
                    {banner.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="text-[11.5px] sm:text-xs leading-snug mt-1.5 m-0 line-clamp-2 drop-shadow-xs"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: banner.subtitleColor,
                    }}
                  >
                    {banner.subtitle}
                  </p>
                </div>

                {/* Unified CTA Button: always "BOOK" */}
                <div className="pt-2">
                  <span
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 group-hover:scale-105"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: banner.buttonBg,
                      color: banner.buttonText,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    }}
                  >
                    BOOK
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Minimalist Slider Indicator (matches reference image: active dark dash + inactive gray dash) */}
        <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
          <div className="relative w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gray-800 rounded-full transition-all duration-150"
              style={{
                width: "40%",
                left: `${scrollProgress * 60}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
