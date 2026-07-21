import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";
import { Search, Shield, Car, PartyPopper, GraduationCap, Camera, ArrowRight, Star, BadgeCheck, Timer, Sparkles } from "lucide-react";
import weddingImgg from "../assets/weddingImgg.avif";
import carImg from "../assets/carImg.avif";
import CCTVImg from "../assets/CCTVImg.avif";
import serviceHeroImg from "../assets/serviceHeroImg.avif";
import LocationBanner from "../components/common/LocationBanner";
import { useLocation } from "../context/LocationContext";
import WorkProcess from "../components/servicePage/Workprocess";
import { mockServices } from "../data/mockServices";
import { mockCategories } from "../data/mockCategories";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [hoveredFacility, setHoveredFacility] = useState(null);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const filterSectionRef = useRef(null); 
    const resultsSectionRef = useRef(null); 
  const { city } = useLocation();

  // Fetch categories and services from backend — refetch when city changes
  const fetchData = async () => {
    try {
      setLoading(true);
      const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
      const [catRes, svcRes] = await Promise.all([
        api.get("/categories"),
        api.get(`/services${cityParam}`),
      ]);

      if (catRes.data?.length > 0) {
        setCategories(catRes.data);
      } else {
        throw new Error("No categories returned from backend");
      }

      setServices(svcRes.data?.length > 0 ? svcRes.data : mockServices);
    } catch (err) {
      console.warn(
        "Backend unreachable, falling back to local mock data:",
        err,
      );
      setCategories(mockCategories);
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [city]);

  // Build a service link using the service's _id from the backend
  const getServiceLink = (name, mongoId, subId) => {
    const isRental = name.toLowerCase().includes("rental") || name.toLowerCase().includes("car") || name.toLowerCase().includes("bike");
    const prefix = isRental ? "/product" : "/service";
    const id = mongoId || subId;
    return id ? `${prefix}/${id}` : "#";
  };

  const getCategoryIcon = (vertical) => {
    switch (vertical) {
      case "CCTV_SECURITY":
        return Shield;
      case "VEHICLE_RENTAL":
        return Car;
      case "WEDDING":
        return PartyPopper;
      case "HOME_TUITION":
        return GraduationCap;
      case "HOUSE_HELP":
        return Sparkles;
      default:
        return Camera;
    }
  };

  const findMatchedService = (subName) =>
    services.find((s) => s.name.toLowerCase() === subName.toLowerCase());

  const allSubCategories = categories.flatMap((cat) =>
    (cat.subCategories || []).map((sub) => {
      const matched = findMatchedService(sub.name);
      return {
        ...sub,
        parentName: cat.name,
        parentId: cat._id,
        vertical: cat.vertical,
        mongoServiceId: matched?._id ?? null,
        startingPrice: matched?.startingPrice ?? null,
        priceUnit: matched?.priceUnit ?? "per visit",
        rating: matched?.rating ?? null,
      };
    }),
  );

  const filteredServices = allSubCategories.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "ALL") return matchesSearch;
    if (selectedFilter === "WEDDING")
      return item.vertical === "WEDDING" && matchesSearch;
    if (selectedFilter === "RENTAL")
      return item.vertical === "VEHICLE_RENTAL" && matchesSearch;
    if (selectedFilter === "SECURITY")
      return item.vertical === "CCTV_SECURITY" && matchesSearch;
    if (selectedFilter === "HOME_TUITION")
      return item.vertical === "HOME_TUITION" && matchesSearch;
    if (selectedFilter === "HOUSE_HELP")
      return item.vertical === "HOUSE_HELP" && matchesSearch;

    return matchesSearch;
  });

  const scrollToResults = () => {
    filterSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearchQuery(searchInput);
      setSearchInput("");
      setIsMobileSearchOpen(false);
      scrollToResults();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchInput("");
    setSelectedFilter("ALL");
    setIsMobileSearchOpen(false);
    scrollToResults();
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSearchInput("");
    setIsMobileSearchOpen(false);
    scrollToResults();
  };

  const facilityCards = [
    {
      title: "Wedding & Events",
      desc: "All-inclusive venues, luxury decorators, gourmet caterers, and cinematic photography facilities explained.",
      image: weddingImgg,
      link: "/services/weddings",
      btn: "Explore Wedding Facility",
      icon: "💍",
    },
    {
      title: "Premium Vehicle Rentals",
      desc: "Exotic sedans, luxury wedding cars, SUVs, and commuter motorcycles for self-drive or chauffeur trips.",
      image: carImg,
      link: "/services/car-rentals",
      btn: "Explore Rental Fleet",
      icon: "🚗",
    },
    {
      title: "AI Security Systems",
      desc: "Complete residential and commercial smart locks and CCTV monitoring package setups.",
      image: CCTVImg,
      link: "/services/cctv",
      btn: "Explore Security Plans",
      icon: "📹",
    },
  ];

  const filterTabs = [
    { id: "ALL", label: "All Services" },
    { id: "WEDDING", label: "💍 Wedding" },
    { id: "RENTAL", label: "🚗 Rentals" },
    { id: "SECURITY", label: "📹 Security" },
    { id: "HOME_TUITION", label: "📚 Home Tuition" },
    { id: "HOUSE_HELP", label: "🧹 House Help" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-12 sm:pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ============ HERO ============ */}

      <section
        className="relative w-full overflow-hidden flex items-center justify-center text-center"
        style={{ minHeight: "62vh" }}
      >
        <img
          src={serviceHeroImg}
          alt="Services Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,10,46,0.92) 0%, rgba(10,15,26,0.88) 100%)",
          }}
        />

        <div className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 md:py-24 max-w-3xl mx-auto flex flex-col items-center">
          <motion.span
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-white/85 mb-5 sm:mb-7 border border-white/15 uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          >
            Trusted Service Marketplace
          </motion.span>

          <motion.h1
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className="text-white font-normal leading-tight mb-3 sm:mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 6vw, 58px)",
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need, <br />
            <span style={{ opacity: 0.55 }}>All in One Place.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="text-white/65 text-xs sm:text-sm mb-7 sm:mb-9 max-w-md px-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Book vetted, background-checked professionals for weddings, rentals,
            and home security — all in a few taps.
          </motion.p>

          {/* Desktop Search */}
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-lg mt-4 relative"
          >
            <input
              type="text"
              placeholder="Search for photography, car rentals, smart locks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-full text-sm outline-none transition-all duration-300 shadow-lg text-white"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
              }}
            />
            <Search size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50" />
          </motion.div>
        </div>
      </section>

      <LocationBanner />

      <section className="px-6 py-16 sm:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 border uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(139,26,26,0.06)",
              borderColor: "rgba(139,26,26,0.15)",
              color: "var(--color-primary)",
            }}
          >
            Specialty Facilities
          </span>
          <h2
            className="font-normal m-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 4vw, 42px)",
              color: "var(--color-text-dark)",
            }}
          >
            Explore Detailed Facility Sections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {facilityCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
              onMouseEnter={() => setHoveredFacility(idx)}
              onMouseLeave={() => setHoveredFacility(null)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col h-full
              transition-all duration-400 ease-out hover:-translate-y-1
              shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:shadow-[0_1px_2px_rgba(0,0,0,0.03)]
              hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.16)]"
              style={{
                backgroundColor: "var(--color-bg-soft)",
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{ height: "clamp(170px, 28vw, 240px)" }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
                  }}
                />

                <span
                  className="absolute top-4 left-4 flex items-center justify-center rounded-full text-base sm:text-lg"
                  style={{
                    width: "34px",
                    height: "34px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                  }}
                >
                  {card.icon}
                </span>

                <h3
                  className="absolute bottom-4 left-4 right-4 m-0 font-normal"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(16px, 2.2vw, 22px)",
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.title}
                </h3>
              </div>

              <div className="p-5 sm:p-6 md:p-7 flex flex-col flex-1 gap-4 sm:gap-5 md:gap-6">
                <p
                  className="m-0 text-[11px] sm:text-xs leading-relaxed flex-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {card.desc}
                </p>

                <Link
                  to={card.link}
                  className="relative w-full text-center py-3 rounded-full text-[10px] sm:text-xs font-semibold no-underline block
                  transition-colors duration-300 ease-out hover:opacity-90 active:scale-[0.98]"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-text-dark)",
                    color: "#fff",
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {card.btn}
                    <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ PREMIUM HEADER ============ */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-16 max-w-7xl mx-auto">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-5 sm:mb-6 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            <span
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-primary)",
                opacity: 0.8,
              }}
            >
              Premium Services
            </span>
          </div>

          <h2
            className="font-normal m-0 mb-3 sm:mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 52px)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.03em",
              lineHeight: "1.1",
            }}
          >
            Trusted Professionals, <br className="hidden sm:inline" />
            <span
              style={{
                color: "var(--color-primary)",
                opacity: 0.6,
                display: "inline-block",
              }}
            >
              Just a Click Away
            </span>
          </h2>

          <p
            className="text-sm sm:text-base max-w-lg mx-auto m-0 leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              opacity: 0.75,
            }}
          >
            Discover handpicked professionals for every need — from weddings to
            security, all verified and trusted.
          </p>
        </div>
      </section>

      {/* ============ FILTER BAR ============ */}
      <section
        ref={filterSectionRef}
        className="px-3 sm:px-6 py-4 sm:py-5 md:py-6 border-b  top-0 z-30"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg-soft)",
        }}
      >
        <motion.div
          className="max-w-6xl mx-auto flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setSelectedFilter(tab.id);
                setSearchQuery("");
                scrollToResults();
              }}
              variants={{
                hidden: { y: 10, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.35, ease: "easeOut" },
                },
              }}
              whileTap={{ scale: 0.95 }}
              className="relative px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full text-[10px] sm:text-[11px] md:text-xs font-semibold cursor-pointer overflow-hidden transition-colors duration-300 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-body)",
                border: `1px solid ${selectedFilter === tab.id ? "var(--color-primary)" : "var(--color-border)"}`,
                color:
                  selectedFilter === tab.id ? "#fff" : "var(--color-text-dark)",
                backgroundColor:
                  selectedFilter === tab.id
                    ? "transparent"
                    : "var(--color-bg-white)",
              }}
            >
              {selectedFilter === tab.id && (
                <motion.span
                  layoutId="activeFilterPill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* ============ SERVICE RESULTS ============ */}
      <section
        ref={resultsSectionRef}
        className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 max-w-7xl mx-auto scroll-mt-6"
      >
        {/* ============ LOADING STATE ============ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-[28px] overflow-hidden animate-pulse"
                style={{
                  backgroundColor: "var(--color-bg-soft)",
                  border: "1px solid rgba(0,0,0,0.02)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  className="h-[200px] sm:h-[220px] lg:h-[240px]"
                  style={{ backgroundColor: "rgba(139,26,26,0.04)" }}
                />
                <div className="p-6 sm:p-7 space-y-4">
                  <div
                    className="h-5 rounded w-3/4"
                    style={{ backgroundColor: "rgba(139,26,26,0.06)" }}
                  />
                  <div className="space-y-2">
                    <div
                      className="h-3.5 rounded w-full"
                      style={{ backgroundColor: "rgba(139,26,26,0.04)" }}
                    />
                    <div
                      className="h-3.5 rounded w-2/3"
                      style={{ backgroundColor: "rgba(139,26,26,0.04)" }}
                    />
                  </div>
                  <div
                    className="flex justify-between items-center pt-3 border-t"
                    style={{ borderColor: "rgba(139,26,26,0.04)" }}
                  >
                    <div className="space-y-1">
                      <div
                        className="h-3 rounded w-16"
                        style={{ backgroundColor: "rgba(139,26,26,0.04)" }}
                      />
                      <div
                        className="h-5 rounded w-20"
                        style={{ backgroundColor: "rgba(139,26,26,0.06)" }}
                      />
                    </div>
                    <div
                      className="h-9 rounded-full w-24"
                      style={{ backgroundColor: "rgba(139,26,26,0.06)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ============ ERROR STATE ============ */
          <div className="flex flex-col items-center justify-center gap-5 py-20 sm:py-24 md:py-28 text-center">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(139,26,26,0.04)",
                border: "1px solid rgba(139,26,26,0.06)",
              }}
            >
              <span className="text-4xl">⚠️</span>
            </div>
            <div>
              <h3
                className="m-0 mb-2 font-normal text-xl sm:text-2xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                }}
              >
                Something went wrong
              </h3>
              <p
                className="text-sm sm:text-base m-0 max-w-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                {error}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full text-xs font-semibold cursor-pointer border-0 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(139,26,26,0.25)",
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          /* ============ SERVICE GRID ============ */
          <AnimatePresence mode="wait">
            {filteredServices.length === 0 ? (
              /* ============ EMPTY STATE ============ */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Search size={36} className="mx-auto text-neutral-400 mb-4 opacity-50" />
                <p className="text-lg m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  No services found matching your query.
                </p>
              </motion.div>
            ) : (
              /* ============ SERVICE CARDS ============ */
              <motion.div
                key="grid"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8"
              >
                {filteredServices.map((item) => (
                  <motion.div
                    key={item._id || item.id}
                    variants={{
                      hidden: { y: 30, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: 0.7,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    whileHover={{ y: -8 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                    className="group/card relative flex flex-col h-full rounded-[28px] overflow-hidden
                      bg-[var(--color-bg-soft)]
                      transition-all duration-500 ease-out
                      hover:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)]"
                    style={{
                      border: "1px solid rgba(0,0,0,0.03)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* ============ CATEGORY BADGE (with icon) ============ */}
                    <span
                      className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.1em]
                        text-[var(--color-text-dark)] backdrop-blur-md"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                      }}
                    >
                      {(() => {
                        const CategoryIcon = getCategoryIcon(item.vertical);
                        return <CategoryIcon size={11} strokeWidth={2} />;
                      })()}
                      {item.parentName}
                    </span>

                    {/* ============ IMAGE ============ */}
                    <div className="relative overflow-hidden h-[200px] sm:h-[220px] lg:h-[240px]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                    </div>

                    {/* ============ CONTENT ============ */}
                    <div className="relative p-5 sm:p-6 lg:p-7 flex flex-col flex-1">
                      <h3
                        className="m-0 mb-2.5 font-normal text-base sm:text-lg md:text-xl tracking-tight text-[var(--color-text-dark)]"
                        style={{
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="m-0 mb-5 text-[10px] sm:text-xs leading-relaxed flex-1 text-[var(--color-text-mid)] line-clamp-2 sm:line-clamp-3"
                        style={{
                          fontFamily: "var(--font-body)",
                          opacity: 0.8,
                          lineHeight: "1.7",
                        }}
                      >
                        {item.description}
                      </p>

                      {/* ============ METADATA ROW ============ */}
                      <div
                        className="flex items-center gap-4 mb-4 text-[10px] sm:text-[11px]"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-mid)",
                          opacity: 0.75,
                        }}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Star
                            size={12}
                            strokeWidth={2}
                            style={{ color: "var(--color-primary)" }}
                          />
                          {item.rating ?? "4.9"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BadgeCheck
                            size={12}
                            strokeWidth={2}
                            style={{ color: "var(--color-primary)" }}
                          />
                          Verified
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Timer
                            size={12}
                            strokeWidth={2}
                            style={{ color: "var(--color-primary)" }}
                          />
                          Fast
                        </span>
                      </div>

                      {/* ============ FOOTER ============ */}
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t"
                        style={{ borderColor: "rgba(0,0,0,0.04)" }}
                      >
                        {item.startingPrice !== null ? (
                          <div className="leading-tight">
                            <span
                              className="text-[7px] sm:text-[8px] uppercase font-semibold tracking-[0.12em] block mb-0.5 text-[var(--color-text-mid)]"
                              style={{ opacity: 0.5 }}
                            >
                              Starting from
                            </span>
                            <span
                              className="font-bold text-base sm:text-lg md:text-xl text-[var(--color-primary)]"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              ₹{item.startingPrice?.toLocaleString("en-IN")}
                            </span>
                            <span
                              className="text-[9px] sm:text-[10px] ml-1 text-[var(--color-text-mid)]"
                              style={{ opacity: 0.6 }}
                            >
                              /
                              {item.priceUnit?.split(" ").slice(1).join(" ") ||
                                item.priceUnit}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="text-[10px] sm:text-xs italic text-[var(--color-text-mid)]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            Contact for pricing
                          </span>
                        )}

                        {/* ============ EXPLORE BUTTON ============ */}
                        <Link
                          to={getServiceLink(
                            item.name,
                            item.mongoServiceId,
                            item._id || item.id,
                          )}
                          aria-label={`Explore ${item.name}`}
                          className="group/btn relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-xs font-semibold no-underline
                            text-white
                            transition-all duration-300 ease-out
                            hover:opacity-90
                            hover:shadow-xl hover:shadow-[var(--color-primary)]/25
                            active:scale-[0.96]"
                          style={{
                            fontFamily: "var(--font-body)",
                            backgroundColor: "var(--color-primary)",
                            boxShadow: "0 4px 16px -4px rgba(139,26,26,0.35)",
                          }}
                        >
                          <span>Explore</span>
                          <ArrowRight
                            size={13}
                            strokeWidth={2}
                            className="transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5"
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <WorkProcess />

      {/* ============ CTA ============ */}
      <motion.section
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative overflow-hidden py-20 px-6 lg:px-8"
      >
        {/* Background Text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 0.035, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="font-black uppercase tracking-[0.15em]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(5rem,14vw,11rem)",
              color: "var(--color-primary)",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            QuickSathi
          </motion.h1>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-5"
            style={{
              background: "#F5F5F5",
              color: "var(--color-primary)",
            }}
          >
            Need Assistance?
          </span>

          {/* Heading */}
          <h2
            className="font-normal leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem,4vw,3rem)",
              color: "var(--color-text-dark)",
            }}
          >
            Can't Find What You're Looking For?
          </h2>

          {/* Description */}
          <p
            className="mt-5 mx-auto max-w-2xl leading-8"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
            }}
          >
            Not seeing the service you need? Share your requirements with us,
            and our team will connect you with the right verified professional.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
            <span>✓ Verified Professionals</span>
            <span>✓ Quick Response</span>
            <span>✓ Personalized Assistance</span>
          </div>

          {/* Button */}
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 mt-10 px-7 py-3 rounded-full text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            style={{
              background: "var(--color-primary)",
            }}
          >
            Contact Our Team →
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
  };

export default Services;