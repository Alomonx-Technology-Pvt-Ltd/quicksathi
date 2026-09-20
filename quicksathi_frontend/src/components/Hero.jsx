import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Navigation,
  MapPin,
  Car,
} from "lucide-react";
import { mockServices } from "../data/mockServices";

const INTERVAL_MS = 4500;

const Hero = ({ categories, services, onBookNow }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!categories?.length) return;
    // Don't auto advance slides while user is typing a route
    if (pickupLocation || dropoffLocation) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [categories, pickupLocation, dropoffLocation]);

  const active = categories?.[activeIndex];

  // Resolve matching service for the currently active category
  const activeService = useMemo(() => {
    if (!active) return null;
    const pool = services && services.length > 0 ? services : mockServices;

    const match = pool.find((s) => {
      const catIdMatch =
        s.categoryId &&
        String(s.categoryId) === String(active.id || active._id);
      const catNameMatch =
        s.categoryName &&
        (s.categoryName.toLowerCase() === active.name.toLowerCase() ||
          active.name.toLowerCase().includes(s.categoryName.toLowerCase()));
      const sNameMatch =
        s.name &&
        (active.name.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(active.name.toLowerCase()));
      return catIdMatch || catNameMatch || sNameMatch;
    });

    if (match) return match;

    const firstSub = active.subCategories?.[0];
    return {
      _id: firstSub?.id || active.id,
      id: firstSub?.id || active.id,
      name: firstSub?.name || active.name,
      shortDescription: firstSub?.description || active.description,
      startingPrice: 999,
      priceUnit: "service",
      rating: 4.9,
      totalReviews: 120,
      bannerImage: firstSub?.imageUrl || active.imageUrl,
      thumbnail: firstSub?.imageUrl || active.imageUrl,
    };
  }, [active, services]);

  const truncate = (text, limit = 100) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit).replace(/\s+\S*$/, "") + "…";
  };

  // Determine if active service is vehicle rental
  // Uses word-boundary regex to avoid false positives (e.g. "Care" matching "car")
  const RENTAL_KEYWORDS = /\b(vehicle|rental|car|cab|taxi|bike)\b/i;
  const isVehicleRental = useMemo(() => {
    if (!active) return false;
    const catName = active.name || "";
    const sName = activeService?.name || "";
    const vMode = activeService?.serviceMode || "";
    return vMode === "RENTAL" || RENTAL_KEYWORDS.test(catName) || RENTAL_KEYWORDS.test(sName);
  }, [active, activeService]);

  const handleVehicleSearch = (e) => {
    e?.stopPropagation?.();
    const params = new URLSearchParams();
    if (pickupLocation.trim()) params.set("pickup", pickupLocation.trim());
    if (dropoffLocation.trim()) params.set("dropoff", dropoffLocation.trim());
    navigate(`/services/car-rentals?${params.toString()}`);
  };

  const handleDirectBooking = (e) => {
    e.stopPropagation();
    if (!active) return;
    if (active.comingSoon) {
      navigate(`/category/${active.id || active._id}`);
      return;
    }

    if (isVehicleRental) {
      handleVehicleSearch(e);
      return;
    }

    if (onBookNow && activeService?.name) {
      onBookNow(
        activeService.name,
        activeService._id || activeService.id || active.id
      );
      return;
    }

    const serviceId =
      activeService?._id || activeService?.id || active.id || active._id;
    const serviceName = activeService?.name || active.name;
    const packageTitle =
      activeService?.packages?.[0]?.title || "Standard Package";
    const price =
      activeService?.packages?.[0]?.price ||
      activeService?.startingPrice ||
      999;

    const params = new URLSearchParams({
      name: serviceName,
      package: packageTitle,
      price: price.toString(),
    });
    navigate(`/booking/${serviceId}?${params.toString()}`);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!categories?.length) return;
    setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (!categories?.length) return;
    setActiveIndex((prev) => (prev + 1) % categories.length);
  };

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
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
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
        <div className="flex items-center gap-2 flex-wrap mb-3 sm:mb-5">
          <span
            className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white/80 border border-white/25 backdrop-blur-sm"
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
          {active?.comingSoon && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-body)",
                color: "#fbbf24",
                backgroundColor: "rgba(15,23,42,0.65)",
                border: "1px solid rgba(245,158,11,0.6)",
                backdropFilter: "blur(6px)",
              }}
            >
              ⏳ Coming Soon
            </span>
          )}
        </div>

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
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-base font-bold no-underline transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{
            fontFamily: "var(--font-body)",
            background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
            color: "#ffffff",
            boxShadow: "0 6px 28px rgba(255, 107, 0, 0.38)",
          }}
        >
          Explore {active?.name}
        </Link>
      </div>

      {/* ── Right: Floating Working Service Card (Direct Onboarding & Booking) ── */}
      <div className="absolute right-6 sm:right-10 lg:right-12 bottom-16 sm:bottom-20 z-20 hidden md:flex flex-col w-[320px] lg:w-[350px]">
        <div
          className="relative rounded-3xl overflow-hidden p-4 sm:p-5 flex flex-col gap-3.5 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(18, 24, 38, 0.88) 0%, rgba(10, 14, 26, 0.94) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Ambient Glow Accent */}
          <div
            className="absolute -top-16 -right-16 w-36 h-36 rounded-full pointer-events-none filter blur-[50px] opacity-35"
            style={{ backgroundColor: "var(--color-accent)" }}
          />

          {/* Top Status & Carousel Mini-Controls */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-emerald-300"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {active?.comingSoon ? "Coming Soon" : "Live Service"}
              </span>
            </div>

            {/* Slide switch controls */}
            <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors rounded-full px-2.5 py-0.5 border border-white/10 text-white/80 text-[11px] font-medium">
              <button
                type="button"
                onClick={handlePrev}
                className="border-0 bg-transparent text-white/70 hover:text-white cursor-pointer p-0.5 flex items-center justify-center transition-colors"
                aria-label="Previous service"
              >
                <ChevronLeft size={13} />
              </button>
              <span style={{ fontFamily: "var(--font-display)" }}>
                {String(activeIndex + 1).padStart(2, "0")} / {String(categories?.length || 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="border-0 bg-transparent text-white/70 hover:text-white cursor-pointer p-0.5 flex items-center justify-center transition-colors"
                aria-label="Next service"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Animated Service Card Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active?.id || activeIndex}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col gap-3 relative z-10"
            >
              {/* Service Thumbnail & Badges */}
              <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden group shadow-inner">
                <img
                  src={activeService?.bannerImage || activeService?.thumbnail || active?.imageUrl}
                  alt={activeService?.name || active?.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={active?.comingSoon ? { filter: "grayscale(0.5) brightness(0.85)" } : undefined}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(10, 14, 26, 0.92) 0%, rgba(10, 14, 26, 0.25) 60%, transparent 100%)",
                  }}
                />

                {/* Rating Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1 text-white text-[11px] font-bold">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span>{activeService?.rating || 4.9}</span>
                  <span className="text-white/60 font-normal text-[10px]">
                    ({activeService?.totalReviews || 120}+)
                  </span>
                </div>

                {/* Category Pill */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold tracking-wider uppercase">
                  {active?.name}
                </div>

                {/* Service Name Overlay */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3
                    className="text-white font-bold text-sm sm:text-base leading-tight truncate m-0 drop-shadow-sm"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                  >
                    {activeService?.name || active?.name}
                  </h3>
                </div>
              </div>

              {/* Conditional: Start & Destination Search for Vehicle Rental vs Value description for other services */}
              {isVehicleRental ? (
                <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-white/[0.07] border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-white/70 font-semibold px-0.5">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Navigation size={11} /> Start & Destination Search
                    </span>
                    <span className="text-[9px] text-white/40 font-normal">Direct Route</span>
                  </div>

                  {/* Start (Pickup) Input */}
                  <div className="relative">
                    <Navigation
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Start / Pickup location..."
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVehicleSearch(e);
                      }}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-black/45 border border-white/15 text-white placeholder-white/40 outline-none focus:border-emerald-400/80 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Destination (Dropoff) Input */}
                  <div className="relative">
                    <MapPin
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Destination / Dropoff..."
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVehicleSearch(e);
                      }}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-black/45 border border-white/15 text-white placeholder-white/40 outline-none focus:border-rose-400/80 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Quick Popular Routes */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[9px] text-white/40">Quick:</span>
                    {[
                      { from: "Patna", to: "Gaya" },
                      { from: "Patna Airport", to: "City Center" },
                      { from: "Patna", to: "Ranchi" },
                    ].map((route, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPickupLocation(route.from);
                          setDropoffLocation(route.to);
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white/85 border border-white/10 transition-colors cursor-pointer"
                      >
                        {route.from.split(" ")[0]} → {route.to.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                  /* Service Value Description */
                  <p
                    className="text-white/70 text-xs leading-relaxed line-clamp-2 m-0"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {activeService?.shortDescription || truncate(active?.description, 85)}
                  </p>
              )}

              {/* Pricing Row */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/50 block font-medium">
                    Starting from
                  </span>
                  <span className="text-base sm:text-lg font-bold text-white flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)" }}>
                    <span className="text-[#ff6b00]">₹</span>
                    {(activeService?.startingPrice || 999).toLocaleString("en-IN")}
                    <span className="text-[11px] font-normal text-white/55">
                      {activeService?.priceUnit ? `/${activeService.priceUnit}` : ""}
                    </span>
                  </span>
                </div>

                {active?.comingSoon && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Soon
                  </span>
                )}
              </div>

              {/* Direct Onboarding & Booking Action Buttons */}
              <div className="flex flex-col gap-2 mt-1">
                {/* 1. Customer Direct Booking / Vehicle Search Redirect Button */}
                {isVehicleRental ? (
                  <button
                    type="button"
                    onClick={handleVehicleSearch}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border-0 cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                    style={{
                      fontFamily: "var(--font-body)",
                      background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                      color: "#ffffff",
                      boxShadow: "0 4px 18px rgba(255, 107, 0, 0.38)",
                    }}
                  >
                    <Car size={15} />
                    <span>Find Vehicles & Book</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDirectBooking}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border-0 cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                    style={{
                      fontFamily: "var(--font-body)",
                      background: active?.comingSoon
                        ? "rgba(255, 255, 255, 0.15)"
                        : "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                      color: "#ffffff",
                      boxShadow: active?.comingSoon
                        ? "none"
                        : "0 4px 18px rgba(255, 107, 0, 0.38)",
                    }}
                  >
                    <CalendarDays size={14} />
                    <span>{active?.comingSoon ? "View Coming Soon Details" : "Book Service Now"}</span>
                    <ArrowRight size={14} />
                  </button>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
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