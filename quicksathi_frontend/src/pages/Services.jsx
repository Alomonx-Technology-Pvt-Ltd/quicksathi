import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";
import SEO from "../components/SEO";
import {
  Search,
  ShieldCheck,
  Car,
  PartyPopper,
  GraduationCap,
  Camera,
  ArrowRight,
  Star,
  BadgeCheck,
  Timer,
  Sparkles,
  Scissors,
  Wrench,
  Hammer,
  LayoutGrid,
  AlertTriangle,
} from "lucide-react";
import serviceHeroImg from "../assets/serviceHeroImg.avif";

import { useLocation } from "../context/LocationContext";
import WorkProcess from "../components/servicePage/Workprocess";
import { mockServices } from "../data/mockServices";
import { mockCategories } from "../data/mockCategories";

const Services = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") || "");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const { city } = useLocation();

  // Sync with URL query parameter when navigating from Hero or other pages
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
      setSearchInput(q);
      if (q.trim()) {
        setTimeout(() => {
          filterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [searchParams]);

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
    const isRental =
      name.toLowerCase().includes("rental") ||
      name.toLowerCase().includes("car") ||
      name.toLowerCase().includes("bike");
    const prefix = isRental ? "/product" : "/service";
    const id = mongoId || subId;
    return id ? `${prefix}/${id}` : "#";
  };

  const getCategoryIcon = (vertical) => {
    switch (vertical) {
      case "CCTV_SECURITY":
        return ShieldCheck;
      case "VEHICLE_RENTAL":
        return Car;
      case "WEDDING":
        return Sparkles;
      case "HOME_TUITION":
        return GraduationCap;
      case "HOUSE_HELP":
        return Wrench;
      case "HOUSE_SERVICES":
      case "HOUSE_REPAIR":
        return Hammer;
      case "HOME_SALON":
        return Scissors;
      default:
        return Sparkles;
    }
  };

  const findMatchedService = (subName) =>
    services.find(
      (s) =>
        s.name.toLowerCase() === subName.toLowerCase() ||
        s.name.toLowerCase().includes(subName.toLowerCase()) ||
        subName.toLowerCase().includes(s.name.toLowerCase()),
    );

  const allSubCategories = [
    ...categories.flatMap((cat) =>
      (cat.subCategories || []).map((sub) => {
        const matched = findMatchedService(sub.name);
        return {
          ...sub,
          imageUrl:
            sub.imageUrl ||
            matched?.thumbnail ||
            matched?.bannerImage ||
            cat.imageUrl ||
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
          parentName: cat.name,
          parentId: cat._id,
          vertical: cat.vertical,
          comingSoon: !!cat.comingSoon,
          mongoServiceId: matched?.slug ?? matched?._id ?? null,
          startingPrice: matched?.startingPrice ?? null,
          priceUnit: matched?.priceUnit ?? "per visit",
          rating: matched?.rating ?? null,
        };
      })
    ),
    ...services
      .filter((s) => {
        // Only include services that haven't been matched to an existing subcategory
        return !categories.some((cat) =>
          (cat.subCategories || []).some(
            (sub) =>
              s.name.toLowerCase() === sub.name.toLowerCase() ||
              s.name.toLowerCase().includes(sub.name.toLowerCase()) ||
              sub.name.toLowerCase().includes(s.name.toLowerCase())
          )
        );
      })
      .map((s) => {
        // Find parent category to inherit styles/verticals
        const parentCat =
          categories.find((c) => c._id === s.category || c.id === s.category) || {};
        return {
          _id: s._id,
          name: s.name,
          description: s.shortDescription || s.fullDescription || "Professional Service",
          imageUrl:
            s.thumbnail ||
            s.bannerImage ||
            (Array.isArray(s.gallery) && s.gallery[0]) ||
            parentCat.imageUrl ||
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
          parentName: parentCat.name || s.categoryName || "General",
          parentId: parentCat._id || s.category || null,
          vertical: parentCat.vertical || "OTHER",
          comingSoon: !!parentCat.comingSoon,
          mongoServiceId: s.slug || s._id,
          startingPrice: s.startingPrice || 0,
          priceUnit: s.priceUnit || "per service",
          rating: s.rating || 5.0,
        };
      })
  ];

  const filteredServices = allSubCategories.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const nameMatch = (item.name || "").toLowerCase().includes(q);
    const descMatch = (item.description || "").toLowerCase().includes(q);
    const parentMatch = (item.parentName || "").toLowerCase().includes(q);
    const verticalMatch = (item.vertical || "").toLowerCase().replace(/_/g, " ").includes(q);
    const matchesSearch = !q || nameMatch || descMatch || parentMatch || verticalMatch;

    if (selectedFilter === "ALL") return matchesSearch;
    if (selectedFilter === "RENTAL")
      return item.vertical === "VEHICLE_RENTAL" && matchesSearch;
    if (selectedFilter === "WEDDING")
      return item.vertical === "WEDDING" && matchesSearch;
    if (selectedFilter === "SECURITY")
      return item.vertical === "CCTV_SECURITY" && matchesSearch;
    if (selectedFilter === "HOME_TUITION")
      return item.vertical === "HOME_TUITION" && matchesSearch;
    if (selectedFilter === "HOUSE_HELP")
      return (item.vertical === "HOUSE_HELP" || (item.parentName || "").toLowerCase().includes("house help")) && matchesSearch;
    if (selectedFilter === "HOUSE_SERVICES")
      return (
        item.vertical === "HOUSE_SERVICES" ||
        item.vertical === "HOUSE_REPAIR" ||
        (item.parentName || "").toLowerCase().includes("repair") ||
        (item.parentName || "").toLowerCase().includes("house services")
      ) && matchesSearch;
    if (selectedFilter === "HOME_SALON")
      return item.vertical === "HOME_SALON" && matchesSearch;

    return matchesSearch;
  });

  const scrollToResults = () => {
    filterSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput.trim());
    scrollToResults();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchInput("");
    setSelectedFilter("ALL");
  };

  const handleQuickTagClick = (tag) => {
    setSearchInput(tag);
    setSearchQuery(tag);
    scrollToResults();
  };

  const filterTabs = [
    { id: "ALL", title: "All Services", icon: LayoutGrid },
    { id: "RENTAL", title: "Vehicle Rental", icon: Car },
    { id: "WEDDING", title: "Wedding & Events", icon: Sparkles },
    { id: "HOUSE_HELP", title: "House Help", icon: Wrench },
    { id: "HOUSE_SERVICES", title: "House Services & Repair", icon: Hammer },
    { id: "HOME_SALON", title: "Home Salon & Beauty", icon: Scissors, comingSoon: true },
    { id: "HOME_TUITION", title: "Home Tuition", icon: GraduationCap, comingSoon: true },
    { id: "SECURITY", title: "CCTV Security", icon: ShieldCheck },
  ];

  return (
    <div
      className="min-h-screen pb-12 sm:pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <SEO
        title="Local Services in Patna & Bihar — AC, Car Rental, Wedding & Repairs | TiptoBook"
        description="Browse 40+ verified local services in Patna & Bihar on TiptoBook. Book AC repair, wedding photography & catering, car rental, home salon, electrician, plumbing & tutors."
        canonical="https://www.tiptobook.com/services"
        keywords="local services in Patna, home services Patna, car rental Patna, wedding vendors Bihar, AC service Patna, electrician Patna, plumbing Patna, TiptoBook catalog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Local Services in Patna & Bihar — TiptoBook",
          "url": "https://www.tiptobook.com/services",
          "description": "Browse 40+ verified local services in Patna & Bihar on TiptoBook — AC repairs, cleaning, weddings, car rentals, CCTV installation, and more."
        }}
      />
      {/* ============ HERO SECTION ============ */}
      <section className="relative w-full overflow-hidden text-center">
        {/* Background Layer with Dark Scrim & Ambient Glows */}
        <div className="absolute inset-0 z-0">
          <img
            src={serviceHeroImg}
            alt="TiptoBook Services"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.1]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 15%, rgba(11, 79, 216, 0.45) 0%, rgba(10, 15, 30, 0.90) 55%, rgba(7, 10, 22, 0.98) 100%)",
            }}
          />
          {/* Ambient Lighting Orbs */}
          <div
            className="absolute -top-20 left-1/4 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{ background: "#0b4fd8" }}
          />
          <div
            className="absolute top-1/3 right-10 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "#ff6b00" }}
          />
          {/* Subtle Grid Texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-20 max-w-5xl mx-auto flex flex-col items-center">
          {/* Trust Eyebrow Badge */}
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/90 mb-5 sm:mb-6 border border-white/20 shadow-lg backdrop-blur-md"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-white/80 font-normal">
              {city ? `Verified Pros Active in ${city}` : "Trusted Service Marketplace"}
            </span>
            <span className="text-amber-300 font-semibold flex items-center gap-1 ml-1 pl-2 border-l border-white/20">
              <Sparkles size={12} /> Top Rated
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className="text-white font-normal leading-[1.1] mb-3 sm:mb-4 max-w-3xl"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px, 5.2vw, 60px)",
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need, <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-200 to-amber-200 font-medium">
              All in One Place.
            </span>
          </motion.h1>

          {/* Subtitle Description */}
          <motion.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="text-white/75 text-xs sm:text-sm md:text-base mb-8 max-w-xl px-2 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Discover and book verified experts for luxury weddings, premium car rentals, advanced CCTV systems, and home services — on demand.
          </motion.p>

          {/* Hero Search Box Card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.22 }}
            className="w-full max-w-2xl"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center p-1.5 sm:p-2 rounded-2xl sm:rounded-full transition-all duration-300 shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="flex items-center pl-3 sm:pl-4 text-blue-400 pointer-events-none">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search photography, car rentals, CCTV, salon, repair..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none text-white placeholder:text-white/50"
                style={{ fontFamily: "var(--font-body)" }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="mr-2 text-white/60 hover:text-white border-0 bg-white/10 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all text-xs"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-300 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 border-0"
                style={{
                  background: "linear-gradient(135deg, #0b4fd8 0%, #2563eb 100%)",
                  boxShadow: "0 4px 16px rgba(11, 79, 216, 0.4)",
                }}
              >
                <span>Search</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Quick Trending / Popular Keyword Chips */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs text-white/70">
              <span className="text-white/40 flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold">
                Popular:
              </span>
              {[
                { label: "Wedding Decor", query: "wedding" },
                { label: "Car Rental", query: "car" },
                { label: "CCTV Security", query: "cctv" },
                { label: "Photography", query: "photography" },
                { label: "House Repair", query: "repair" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickTagClick(chip.query)}
                  className="px-3 py-1 rounded-full text-[11px] font-medium text-white/80 hover:text-white border border-white/15 hover:border-white/40 bg-white/5 hover:bg-white/15 transition-all cursor-pointer backdrop-blur-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Trust Highlights Badges Ribbon */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mt-10 sm:mt-12 pt-8 border-t border-white/10"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm text-left hover:bg-white/[0.07] transition-all">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className="text-white text-xs sm:text-sm font-semibold m-0 leading-tight">500+ Pros</p>
                <p className="text-white/50 text-[10px] sm:text-[11px] m-0">Vetted & Verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm text-left hover:bg-white/[0.07] transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Star size={18} fill="#f59e0b" color="#f59e0b" />
              </div>
              <div>
                <p className="text-white text-xs sm:text-sm font-semibold m-0 leading-tight">4.9 / 5 Rating</p>
                <p className="text-white/50 text-[10px] sm:text-[11px] m-0">15,000+ Reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm text-left hover:bg-white/[0.07] transition-all">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Timer size={18} />
              </div>
              <div>
                <p className="text-white text-xs sm:text-sm font-semibold m-0 leading-tight">Instant Booking</p>
                <p className="text-white/50 text-[10px] sm:text-[11px] m-0">Confirmed Fast</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm text-left hover:bg-white/[0.07] transition-all">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-white text-xs sm:text-sm font-semibold m-0 leading-tight">Safe & Secure</p>
                <p className="text-white/50 text-[10px] sm:text-[11px] m-0">100% Guaranteed</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Soft bottom edge transition to main content */}
        <div
          className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--color-bg), transparent)",
          }}
        />
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

      {/* ============ FILTER BAR & IN-PAGE SEARCH ============ */}
      <section
        ref={filterSectionRef}
        className="px-3 sm:px-6 py-3 sm:py-4 border-b sticky top-0 z-30 backdrop-blur-md"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "rgba(248, 250, 252, 0.95)",
        }}
      >
        {/* Compact in-bar search & counter */}
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 mb-2.5 px-2">
          <div className="relative flex-1 max-w-sm sm:max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search services, packages, cameras, cars..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-full text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all text-gray-800 dark:text-gray-100 shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-0 bg-transparent cursor-pointer text-xs"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {searchQuery ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  <strong>{filteredServices.length}</strong> {filteredServices.length === 1 ? "result" : "results"}
                </span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs text-blue-600 font-semibold hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Reset
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400 hidden sm:inline-block">
                {allSubCategories.length} services available
              </span>
            )}
          </div>
        </div>

        <div
          className="max-w-6xl mx-auto flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar justify-start md:justify-center py-1.5 px-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedFilter === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedFilter(tab.id);
                  setSearchQuery("");
                  scrollToResults();
                }}
                className="flex-shrink-0 flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full cursor-pointer transition-all duration-200 outline-none whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? "var(--color-primary)" : "var(--color-bg-white)",
                  border: isActive ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                  boxShadow: isActive ? "0 4px 16px rgba(11, 79, 216, 0.28)" : "0 1px 3px rgba(0,0,0,0.04)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? "#ffffff" : "var(--color-text-mid)" }}
                  strokeWidth={1.8}
                />
                <span
                  className="text-xs sm:text-sm font-semibold whitespace-nowrap"
                  style={{ color: isActive ? "#ffffff" : "var(--color-text-dark)" }}
                >
                  {tab.title}
                </span>
                {tab.comingSoon && (
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: isActive ? "#fde68a" : "#b45309" }}
                    title="Coming Soon"
                  >
                    ⏳
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ============ SERVICE RESULTS ============ */}
      <section
        ref={resultsSectionRef}
        className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 max-w-7xl mx-auto scroll-mt-6"
      >
        {/* ============ LOADING STATE ============ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                  className="h-[160px] sm:h-[180px] lg:h-[190px]"
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
              <AlertTriangle size={38} className="text-amber-500" />
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
          <div>
            {searchQuery && filteredServices.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                  <Search size={15} className="text-blue-500 shrink-0" />
                  <span>
                    Found <strong>{filteredServices.length}</strong> {filteredServices.length === 1 ? "service" : "services"} matching <strong>"{searchQuery}"</strong>
                  </span>
                  {selectedFilter !== "ALL" && (
                    <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                      in {filterTabs.find((t) => t.id === selectedFilter)?.title}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Clear search ✕
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {filteredServices.length === 0 ? (
                /* ============ EMPTY STATE ============ */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 px-4 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-800 my-4"
                >
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-blue-600"
                    style={{ backgroundColor: "var(--color-primary-soft)" }}
                  >
                    <Search size={28} />
                  </div>
                  <h3
                    className="text-xl font-normal mb-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                  >
                    No services found
                  </h3>
                  <p
                    className="text-sm max-w-md mx-auto mb-6"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
                  >
                    {searchQuery ? (
                      <>
                        We couldn't find any services matching <strong>"{searchQuery}"</strong>
                        {selectedFilter !== "ALL" ? ` in ${filterTabs.find((t) => t.id === selectedFilter)?.title}` : ""}.
                      </>
                    ) : (
                      "No services currently available in this category."
                    )}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {selectedFilter !== "ALL" && (
                      <button
                        type="button"
                        onClick={() => setSelectedFilter("ALL")}
                        className="px-5 py-2.5 rounded-full text-xs font-semibold text-white border-0 cursor-pointer transition hover:opacity-90"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        Search Across All Categories
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    >
                      Clear Filters & Show All
                    </button>
                  </div>
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
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
                    whileTap={{ scale: 0.98 }}
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
                    <div className="relative overflow-hidden h-[160px] sm:h-[180px] lg:h-[190px]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop";
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                        style={item.comingSoon ? { filter: "grayscale(0.65) brightness(0.8)" } : undefined}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                      {item.comingSoon && (
                        <span
                          className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em]"
                          style={{
                            color: "#fbbf24",
                            backgroundColor: "rgba(15,23,42,0.78)",
                            border: "1px solid rgba(245,158,11,0.6)",
                            backdropFilter: "blur(6px)",
                          }}
                        >
                          ⏳ Coming Soon
                        </span>
                      )}
                    </div>

                    {/* ============ CONTENT ============ */}
                    <div className="relative p-4 sm:p-5 flex flex-col flex-1">
                      <h3
                        className="m-0 mb-3 font-normal text-base sm:text-lg tracking-tight text-[var(--color-text-dark)] line-clamp-1"
                        style={{
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.name}
                      </h3>

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
                        {item.comingSoon ? (
                          <span
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-xs font-semibold"
                            style={{
                              fontFamily: "var(--font-body)",
                              backgroundColor: "rgba(0,0,0,0.05)",
                              color: "var(--color-text-mid)",
                              border: "1px solid rgba(0,0,0,0.08)",
                              cursor: "not-allowed",
                              opacity: 0.75,
                            }}
                          >
                            ⏳ Coming Soon
                          </span>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        )}
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <WorkProcess />

      {/* ============ CTA ============ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
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
            TiptoBook
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
    </div>
  );
};

export default Services;
