import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Wrench,
  Scissors,
  GraduationCap,
  Hammer,
  Car,
  X,
  Tag,
  Snowflake,
} from "lucide-react";
import { mockServices } from "../data/mockServices";

// ── Service categories for the auto-scrolling right panel ──
const HERO_CATEGORIES = [
  {
    id: "rental",
    title: "Vehicle Rental",
    icon: Car,
    iconColor: "#7E22CE",
    bgColor: "#F3E8FF",
    route: "/services?q=rental",
    services: [
      {
        name: "Standard Car Rental",
        desc: "AC car for city rides, outstation & airport transfers.",
        price: 2499,
        rating: 4.5,
        badge: "5/7 Seater",
        img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0f2e?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Wedding Car Rental",
        desc: "Decorated cars for special occasions with driver.",
        price: 7999,
        rating: 4.8,
        badge: "Wedding",
        img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "weddings",
    title: "Wedding & Events",
    icon: Sparkles,
    iconColor: "#B45309",
    bgColor: "#FEF3C7",
    route: "/services?q=wedding",
    services: [
      {
        name: "Wedding Photography",
        desc: "Candid, cinematic films, drone shoots & albums.",
        price: 15000,
        rating: 4.9,
        badge: "Cinematic",
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Stage & Venue Decoration",
        desc: "Floral stage setup, entryway decor & LED lighting.",
        price: 25000,
        rating: 4.8,
        badge: "Themes",
        img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "help",
    title: "House Help",
    icon: Wrench,
    iconColor: "#0369A1",
    bgColor: "#E0F2FE",
    route: "/category/20",
    services: [
      {
        name: "Maid & Deep Cleaning",
        desc: "Daily or monthly home cleaning with verified maids.",
        price: 1499,
        rating: 4.8,
        badge: "Verified",
        img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Home Cook Service",
        desc: "Experienced home cooks offering multi-cuisine meals.",
        price: 2999,
        rating: 4.9,
        badge: "Healthy",
        img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "house-services",
    title: "House Services & Repair",
    icon: Hammer,
    iconColor: "#C2410C",
    bgColor: "#FFF7ED",
    route: "/category/30",
    services: [
      {
        name: "Plumbing",
        desc: "Expert plumbing for leaks, fittings & drainage.",
        price: 199,
        rating: 4.6,
        badge: "Quick Fix",
        img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Electrician",
        desc: "Certified wiring, fan install, switchboard repair.",
        price: 149,
        rating: 4.7,
        badge: "Certified",
        img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "salon",
    title: "Home Salon & Beauty",
    icon: Scissors,
    iconColor: "#BE123C",
    bgColor: "#FFE4E6",
    route: "/category/25",
    services: [
      {
        name: "Hair Styling & Care",
        desc: "Professional haircuts, coloring, keratin & scalp care.",
        price: 799,
        rating: 4.9,
        badge: "Best Seller",
        img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Facial & Skin Cleanup",
        desc: "Rejuvenating facials, organic cleanups & anti-aging.",
        price: 999,
        rating: 4.8,
        badge: "Glow Care",
        img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "tuition",
    title: "Home Tuition",
    icon: GraduationCap,
    iconColor: "#3730A3",
    bgColor: "#E0E7FF",
    route: "/category/15",
    services: [
      {
        name: "School Academics",
        desc: "Maths, Science & English home tuition by verified tutors.",
        price: 2500,
        rating: 4.9,
        badge: "Class 1-10",
        img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: "Competitive Exam Prep",
        desc: "Expert coaching for JEE, NEET & Olympiads.",
        price: 4500,
        rating: 4.9,
        badge: "Exam Prep",
        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ac-appliances",
    title: "AC & Appliances",
    icon: Snowflake,
    iconColor: "#0284C7",
    bgColor: "#E0F2FE",
    route: "/services/ac",
    services: [
      {
        name: "AC Repair & Service",
        desc: "Foam jet deep clean, inspection & cooling fix.",
        price: 449,
        rating: 4.8,
        badge: "Popular",
        img: "/images/ac/foam-jet.webp",
      },
      {
        name: "AC Gas Refill",
        desc: "Leak detection & complete gas refill for instant cooling.",
        price: 2499,
        rating: 4.9,
        badge: "Top Rated",
        img: "/images/ac/gas-refill.webp",
      },
    ],
  },
];

const FONT_HERO = "var(--font-sans, 'Plus Jakarta Sans', 'Inter', sans-serif)";

// ── Single service card for the right panel ──
const ServiceCard = ({ cat, onNavigate }) => {
  const Icon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="w-full"
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 4px 28px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ backgroundColor: cat.bgColor, borderBottom: "1px solid rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
          >
            <Icon size={17} style={{ color: cat.iconColor }} />
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ fontFamily: FONT_HERO, color: "#1c1c1c" }}
          >
            {cat.title}
          </span>
        </div>
        <button
          onClick={() => onNavigate(cat.route)}
          className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer border-none bg-transparent hover:opacity-80 transition-opacity"
          style={{ color: cat.iconColor, fontFamily: FONT_HERO }}
        >
          View All <ChevronRight size={13} />
        </button>
      </div>

      {/* Services list */}
      {cat.services.map((svc, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group"
          style={{ borderBottom: idx < cat.services.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
          onClick={() => onNavigate(cat.route)}
        >
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{ width: 56, height: 56, borderRadius: 14 }}
          >
            <img
              src={svc.img}
              alt={svc.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop";
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className="text-sm font-semibold m-0 leading-tight truncate"
                style={{ fontFamily: FONT_HERO, color: "#1a1a1a" }}
              >
                {svc.name}
              </p>
              <span
                className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "#1a1a1a",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  fontFamily: FONT_HERO,
                }}
              >
                <Star size={9} className="fill-amber-400 text-amber-400" />
                {svc.rating}
              </span>
            </div>
            <p
              className="text-xs mt-0.5 mb-0 line-clamp-1"
              style={{ color: "#64748b", fontFamily: FONT_HERO }}
            >
              {svc.desc}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span
                className="text-xs font-bold"
                style={{ color: "var(--color-primary)", fontFamily: FONT_HERO }}
              >
                &#8377;{svc.price.toLocaleString("en-IN")}
                <span className="font-normal text-slate-400 text-[10px]"> onwards</span>
              </span>
              {svc.badge && (
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: cat.bgColor, color: cat.iconColor, fontFamily: FONT_HERO }}
                >
                  {svc.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// ── Main Hero Component ──
const Hero = ({ categories, services, onBookNow }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const searchContainerRef = useRef(null);

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveCardIdx((prev) => (prev + 1) % HERO_CATEGORIES.length);
    }, 3500);
  };

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, []);

  // Listen for clicks outside search bar to close live dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Real-time suggestions computation
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { services: [], categories: [] };

    // 1. Gather all unique services
    const servicePool = [];
    const seenNames = new Set();

    const addSvc = (s) => {
      const key = s.name?.toLowerCase().trim();
      if (key && !seenNames.has(key)) {
        seenNames.add(key);
        servicePool.push(s);
      }
    };

    // Add services passed via props (from API / mock)
    (services || []).forEach(addSvc);
    // Add mockServices
    (mockServices || []).forEach(addSvc);
    // Add services in HERO_CATEGORIES
    HERO_CATEGORIES.forEach((cat) => {
      (cat.services || []).forEach((s) => {
        addSvc({
          name: s.name,
          shortDescription: s.desc,
          startingPrice: s.price,
          rating: s.rating,
          thumbnail: s.img,
          categoryName: cat.title,
          route: cat.route,
        });
      });
    });

    // Filter services matching query
    const matchedServices = servicePool
      .filter((s) => {
        const nameMatch = (s.name || "").toLowerCase().includes(q);
        const descMatch = (s.shortDescription || s.fullDescription || s.desc || "")
          .toLowerCase()
          .includes(q);
        const catMatch = (s.categoryName || "").toLowerCase().includes(q);
        const tagMatch =
          Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase().includes(q));
        return nameMatch || descMatch || catMatch || tagMatch;
      })
      .slice(0, 6);

    // 2. Filter matching categories
    const catPool = [
      ...HERO_CATEGORIES.map((c) => ({
        title: c.title,
        route: c.route,
        icon: c.icon,
        bgColor: c.bgColor,
        iconColor: c.iconColor,
      })),
      ...(categories || []).map((c) => ({
        title: c.name,
        route: `/category/${c.id || c._id}`,
        icon: null,
        bgColor: "#F1F5F9",
        iconColor: "#475569",
      })),
    ];

    const seenCats = new Set();
    const matchedCategories = catPool
      .filter((c) => {
        const titleLower = (c.title || "").toLowerCase().trim();
        if (!titleLower || seenCats.has(titleLower)) return false;
        seenCats.add(titleLower);
        return titleLower.includes(q);
      })
      .slice(0, 4);

    return {
      services: matchedServices,
      categories: matchedCategories,
    };
  }, [searchQuery, services, categories]);

  const activeCat = HERO_CATEGORIES[activeCardIdx];

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    setIsFocused(false);
    navigate(q ? `/services?q=${encodeURIComponent(q)}` : "/services");
  };

  return (
    <section
      className="w-full overflow-hidden"
      style={{
        background: "#ffffff",
        minHeight: "clamp(480px, 80vh, 760px)",
        paddingTop: "clamp(48px, 6vh, 72px)",
        paddingBottom: "clamp(40px, 5vh, 72px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-0 h-full">

        {/* ══ LEFT SIDE — reference-image style interface ══ */}
        <div className="flex-1 flex flex-col justify-center pr-0 lg:pr-14 w-full">

          {/* Trust badge — matching user's exact reference */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-5 self-start"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-xs"
              style={{
                background: "#FFF4EC",
                border: "1px solid #FFE2CF",
                fontFamily: FONT_HERO,
              }}
            >
              {/* Orange shield with white checkmark */}
              <span className="flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
                  <path
                    d="M12 2L4 5.5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5.5L12 2z"
                    fill="#FF6B00"
                  />
                  <path
                    d="M9.5 12l2 2 4.5-4.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span
                className="text-xs sm:text-[12.5px] font-semibold text-slate-700 tracking-tight flex items-center flex-wrap gap-y-0.5"
                style={{ fontFamily: FONT_HERO }}
              >
                <span>Trusted Service Providers</span>
                <span className="mx-2 text-[#FF6B00] font-black text-xs">•</span>
                <span>Safe</span>
                <span className="mx-2 text-[#FF6B00] font-black text-xs">•</span>
                <span>Hassle-Free</span>
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="m-0 leading-[1.07] mb-3"
            style={{
              fontFamily: FONT_HERO,
              fontSize: "clamp(36px, 5.8vw, 74px)",
              color: "#0f172a",
              letterSpacing: "-0.035em",
              fontWeight: 800,
            }}
          >
            One Tap.
            <br />
            <span style={{ color: "var(--color-accent)" }}>Everything Sorted.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mb-7 leading-relaxed m-0"
            style={{
              fontFamily: FONT_HERO,
              fontSize: "clamp(14px, 1.4vw, 16.5px)",
              color: "#475569",
              maxWidth: 520,
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            From finding a tutor to planning a wedding, booking a car or getting help at home — discover the services you need, compare your options and book them in one place.
          </motion.p>

          {/* Search bar wrapper with real-time dropdown */}
          <div ref={searchContainerRef} className="relative w-full mb-7" style={{ maxWidth: 520 }}>
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="flex items-center w-full transition-all duration-200"
              style={{
                background: "#ffffff",
                borderRadius: 50,
                border: isFocused ? "1.5px solid var(--color-accent)" : "1.5px solid #e2e8f0",
                boxShadow: isFocused
                  ? "0 8px 30px rgba(255,107,0,0.12), 0 0 0 3px rgba(255,107,0,0.08)"
                  : "0 4px 24px rgba(0,0,0,0.07)",
                padding: "5px 5px 5px 18px",
              }}
            >
              <Search
                size={18}
                style={{
                  color: isFocused ? "var(--color-accent)" : "#94a3b8",
                  flexShrink: 0,
                  transition: "color 0.2s",
                }}
              />
              <input
                type="text"
                placeholder="What do you need today? (e.g. Wedding, Car, Tutor)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                className="hero-search-input flex-1 min-w-0 bg-transparent text-sm sm:text-[15px] px-3 py-1.5 text-slate-800 placeholder:text-slate-400"
                style={{
                  fontFamily: FONT_HERO,
                  color: "#0f172a",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                }}
                autoComplete="off"
                spellCheck={false}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent mr-1"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm border-none cursor-pointer transition-colors duration-200 hover:brightness-110 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  color: "#fff",
                  fontFamily: FONT_HERO,
                  boxShadow: "0 4px 14px rgba(255,107,0,0.35)",
                }}
              >
                <span>Search</span>
                <ArrowRight size={15} />
              </motion.button>
            </motion.form>

            {/* Real-time Search Dropdown */}
            <AnimatePresence>
              {isFocused && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.99 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden bg-white shadow-2xl"
                  style={{
                    borderRadius: 20,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 20px 48px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Category Chips if matched */}
                  {searchResults.categories.length > 0 && (
                    <div className="p-3 bg-slate-50/80 border-b border-slate-100">
                      <p
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5"
                        style={{ fontFamily: FONT_HERO }}
                      >
                        Matched Categories
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {searchResults.categories.map((cat, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setIsFocused(false);
                              navigate(cat.route);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border border-slate-200 bg-white hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                            style={{ fontFamily: FONT_HERO }}
                          >
                            {cat.icon && <cat.icon size={13} style={{ color: cat.iconColor }} />}
                            <span>{cat.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Services List */}
                  {searchResults.services.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      <div className="px-4 py-2 bg-slate-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white">
                        Matched Services ({searchResults.services.length})
                      </div>
                      {searchResults.services.map((svc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setIsFocused(false);
                            if (svc.route) {
                              navigate(svc.route);
                            } else if (svc.slug || svc.id || svc._id) {
                              navigate(`/service/${svc.slug || svc._id || svc.id}`);
                            } else {
                              navigate(`/services?q=${encodeURIComponent(svc.name)}`);
                            }
                          }}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                              {svc.thumbnail ? (
                                <img
                                  src={svc.thumbnail}
                                  alt={svc.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-orange-600 bg-orange-50 font-bold text-xs">
                                  {svc.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate m-0 group-hover:text-orange-600 transition-colors">
                                {svc.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {svc.categoryName && (
                                  <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                    {svc.categoryName}
                                  </span>
                                )}
                                {svc.rating && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                                    <Star size={10} className="fill-amber-400 text-amber-400" />
                                    {svc.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 pl-3">
                            {svc.startingPrice ? (
                              <div className="text-right">
                                <span className="text-xs font-bold text-slate-900 block">
                                  &#8377;{Number(svc.startingPrice).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[9px] text-slate-400 font-normal">onwards</span>
                              </div>
                            ) : null}
                            <ChevronRight size={15} className="text-slate-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults.categories.length === 0 ? (
                    <div className="p-5 text-center">
                      <p className="text-sm font-semibold text-slate-800 m-0">
                        No direct matches found for "{searchQuery}"
                      </p>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Try one of our popular services:
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {["Wedding", "Car Rental", "Plumbing", "Maid", "Electrician", "Tuition"].map(
                          (term, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSearchQuery(term);
                              }}
                              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 cursor-pointer border-none transition-colors"
                            >
                              {term}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Bottom View All Results */}
                  <div
                    onClick={handleSearch}
                    className="p-3 bg-slate-50 hover:bg-orange-50 border-t border-slate-100 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-600"
                  >
                    <span>View all search results for "{searchQuery}"</span>
                    <ArrowRight size={13} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-6 mt-6 sm:mt-7 flex-wrap"
          >
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "50+", label: "Expert Partners" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span
                  className="text-xl font-bold leading-none"
                  style={{ fontFamily: FONT_HERO, color: "var(--color-primary)" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs mt-0.5"
                  style={{ fontFamily: FONT_HERO, color: "#94a3b8" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ══ RIGHT SIDE — scrolling service cards ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 relative overflow-hidden lg:overflow-visible"
        >
          {/* Soft background glows */}
          <div
            className="absolute -top-12 -right-10 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(11,79,216,0.07) 0%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />

          {/* Category indicator icons */}
          <div className="flex items-center gap-1.5 mb-4 justify-end pr-1">
            {HERO_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCardIdx(i);
                    startInterval();
                  }}
                  className="transition-all duration-300 cursor-pointer border-none flex items-center justify-center"
                  style={{
                    width: i === activeCardIdx ? 32 : 28,
                    height: i === activeCardIdx ? 32 : 28,
                    borderRadius: "50%",
                    background: i === activeCardIdx ? cat.bgColor : "#f1f5f9",
                    border: i === activeCardIdx ? `2px solid ${cat.iconColor}` : "2px solid transparent",
                    boxShadow: i === activeCardIdx ? `0 2px 10px ${cat.iconColor}33` : "none",
                    padding: 0,
                  }}
                  title={cat.title}
                >
                  <Icon
                    size={i === activeCardIdx ? 15 : 13}
                    style={{ color: i === activeCardIdx ? cat.iconColor : "#94a3b8" }}
                  />
                </button>
              );
            })}
          </div>

          {/* Animated service card */}
          <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
            <AnimatePresence mode="wait">
              <ServiceCard
                key={activeCat.id}
                cat={activeCat}
                onNavigate={navigate}
              />
            </AnimatePresence>
          </div>

          {/* Footer: count + title + book now */}
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold"
                style={{ color: "#94a3b8", fontFamily: FONT_HERO }}
              >
                {activeCardIdx + 1} / {HERO_CATEGORIES.length}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: activeCat.iconColor, fontFamily: FONT_HERO }}
              >
                {activeCat.title}
              </span>
            </div>
            <button
              onClick={() => navigate(activeCat.route)}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-none bg-transparent transition-all duration-200 hover:gap-2"
              style={{ color: "var(--color-primary)", fontFamily: FONT_HERO }}
            >
              Book Now <ArrowRight size={13} />
            </button>
          </div>

          {/* Progress bar */}
          <div
            className="mt-3 w-full rounded-full overflow-hidden"
            style={{ height: 3, background: "#f1f5f9" }}
          >
            <motion.div
              key={activeCardIdx}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.5, ease: "linear" }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${activeCat.iconColor}, var(--color-accent))`,
                borderRadius: 9999,
              }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
