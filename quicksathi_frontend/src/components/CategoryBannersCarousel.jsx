import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import api from "../config/api";

// ── Only Real Working Platform Services in TiptoBook ─────────────────────────
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

const DEFAULT_CAROUSEL_GRADIENT =
  "linear-gradient(90deg, rgba(8, 20, 42, 0.90) 0%, rgba(12, 30, 62, 0.75) 50%, rgba(12, 30, 62, 0.25) 80%, rgba(12, 30, 62, 0.05) 100%)";

const normalizeCarouselBanner = (b) => ({
  id: b._id || b.id || b.category || b.title,
  _id: b._id || b.id,
  badge: b.badge || "Special Deal",
  badgeBg: b.badgeBg || "rgba(255, 255, 255, 0.22)",
  badgeColor: b.badgeColor || "#ffffff",
  title: b.title || "",
  subtitle: b.subtitle || "",
  cta: b.cta || "BOOK",
  link: b.link || "/services",
  textColor: b.textColor || "#ffffff",
  subtitleColor: b.subtitleColor || "rgba(255, 255, 255, 0.92)",
  buttonBg: b.buttonBg || "#0284c7",
  buttonText: b.buttonText || "#ffffff",
  image: b.image || "/images/ac/foam-jet.webp",
  imageAlt: b.imageAlt || b.title || "Featured service banner",
  imagePosition: b.imagePosition || "center right",
  overlayGradient:
    b.overlayGradient && b.overlayGradient.trim()
      ? b.overlayGradient
      : DEFAULT_CAROUSEL_GRADIENT,
  bgFallback: b.bgFallback || "#0d2b45",
});

export default function CategoryBannersCarousel() {
  const scrollRef = useRef(null);
  const [banners, setBanners] = useState(() => CATEGORY_BANNERS.map(normalizeCarouselBanner));
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimerRef = useRef(null);

  // Fetch real-time banners created from Admin Panel
  useEffect(() => {
    let active = true;
    api
      .get("/banners?section=carousel")
      .then(({ data }) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setBanners(data.map(normalizeCarouselBanner));
        }
      })
      .catch(() => {
        // Fallback to default platform banners if network/offline
      });
    return () => {
      active = false;
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  }, []);

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
  }, [updateScrollState]);

  const markUserInteracting = useCallback(() => {
    setIsInteracting(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 4500); // Resume auto-scroll after 4.5 seconds of inactivity
  }, []);

  const scrollByAmount = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector(".category-banner-card");
    const cardWidth = card ? card.offsetWidth + 16 : 396;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction === "right") {
      if (el.scrollLeft >= maxScroll - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 20) {
        el.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -cardWidth, behavior: "smooth" });
      }
    }
  }, []);

  // Smooth Auto-scroll effect: advances every 3.8s, pauses on hover or user touch/scroll
  useEffect(() => {
    if (isHovered || isInteracting || banners.length <= 1) return;
    const timer = setInterval(() => {
      scrollByAmount("right");
    }, 3800);
    return () => clearInterval(timer);
  }, [isHovered, isInteracting, banners.length, scrollByAmount]);

  return (
    <section className="relative w-full max-w-full overflow-hidden pt-5 pb-7 sm:pt-6 sm:pb-8 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* ── Section Header / Caption: Featured Services ── */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100/90 shadow-2xs">
              <Sparkles size={11} className="text-purple-600" />
              Special Deals
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 m-0"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            Featured Services
          </h2>
          <p
            className="text-xs sm:text-sm mt-1 sm:mt-1.5 m-0 leading-relaxed text-slate-500 max-w-xl"
            style={{ fontFamily: "var(--font-body, inherit)" }}
          >
            Explore top-rated verified services, seasonal specials, and instant doorstep booking.
          </p>
        </div>

        {/* ── Carousel Track & Arrows Relative Container ── */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => {
            setIsHovered(true);
            markUserInteracting();
          }}
          onTouchEnd={() => {
            setIsHovered(false);
            markUserInteracting();
          }}
          onWheel={() => markUserInteracting()}
        >
          {/* Navigation Arrow Left (Desktop) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => {
                markUserInteracting();
                scrollByAmount("left");
              }}
              aria-label="Previous banners"
              className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200/80 items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
          )}

          {/* Navigation Arrow Right (Desktop) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => {
                markUserInteracting();
                scrollByAmount("right");
              }}
              aria-label="Next banners"
              className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200/80 items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          )}

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-0.5 scroll-pl-1 sm:scroll-pl-0"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {banners.map((banner, index) => (
              <Link
                key={banner._id || banner.id || index}
                to={banner.link}
                onClick={(e) => {
                  const bId = (banner.id || "").toLowerCase();
                  const link = (banner.link || "").toLowerCase();

                  if (bId === "ac" || link === "/services/ac" || link.includes("ac")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-appliance-modal"));
                  } else if (bId === "salon" || link.includes("home-salon") || link.includes("salon")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-salon-modal"));
                  } else if (bId === "rental" || link.includes("rental") || link.includes("vehicle") || link.includes("car")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-rental-modal"));
                  } else if (bId === "weddings" || bId === "wedding" || link.includes("wedding")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-wedding-modal"));
                  } else if (bId === "help" || link.includes("house-help") || link.includes("help") || link.includes("maid")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-help-modal"));
                  } else if (bId === "repair" || link.includes("house-services") || link.includes("repair")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-repair-modal"));
                  } else if (bId === "tuition" || link.includes("tuition") || link.includes("tutor")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-tuition-modal"));
                  } else if (bId === "painting" || link.includes("painting")) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-painting-modal"));
                  }
                }}
                className="category-banner-card snap-start flex-shrink-0 no-underline block rounded-2xl sm:rounded-3xl overflow-hidden relative transition-shadow duration-300 hover:shadow-xl active:scale-[0.99] group"
                style={{
                  width: "clamp(315px, 84vw, 390px)",
                  height: "195px",
                  backgroundColor: banner.bgFallback || "#0d2b45",
                  color: banner.textColor || "#ffffff",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                  WebkitTransform: "translateZ(0)",
                  transform: "translateZ(0)",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  contain: "paint",
                }}
              >
                {/* ── Full Card Photographic Imagery (Rendered across full card) ── */}
                <div className="absolute inset-0 overflow-hidden bg-slate-900">
                  <img
                    src={banner.image}
                    alt={banner.imageAlt}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      objectPosition: banner.imagePosition || "center right",
                      WebkitTransform: "translateZ(0)",
                      transform: "translateZ(0)",
                    }}
                  />
                </div>

                {/* ── Soft Semi-Transparent Tint Behind Text (Rock-solid gradient without backdrop-filter repaint glitches) ── */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: banner.overlayGradient,
                    WebkitTransform: "translateZ(0)",
                    transform: "translateZ(0)",
                  }}
                />

                {/* ── Left Column: Clean Text & CTA ── */}
                <div
                  className="absolute inset-y-0 left-0 flex flex-col justify-between p-4 sm:p-5 z-10"
                  style={{
                    width: "65%",
                    WebkitTransform: "translateZ(0)",
                    transform: "translateZ(0)",
                  }}
                >
                  <div>
                    {/* Badge */}
                    {banner.badge ? (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2"
                        style={{
                          backgroundColor: banner.badgeBg,
                          color: banner.badgeColor,
                          fontFamily: "var(--font-body)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
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
                      className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-transform duration-200 group-hover:scale-105"
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
