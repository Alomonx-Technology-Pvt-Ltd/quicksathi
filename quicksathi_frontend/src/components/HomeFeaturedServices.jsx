import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Wrench,
  Car,
  Sparkles,
} from "lucide-react";
import api, { getCached } from "../config/api";
import { mockServices } from "../data/mockServices";
import { mockCategories } from "../data/mockCategories";
import {
  structure,
  useCatalogueContent,
  applyContent,
  formatPrice,
  formatPriceUnit,
} from "../content/catalogue";
import ServiceImage from "./catalogue/ServiceImage";
import { serviceImage } from "../content/catalogue/images";

// ── Target 4 core categories ──────────────────────────────────────────────────
const SECTIONS_CONFIG = [
  {
    key: "ac-appliances",
    i18nKey: "ac",
    vertical: "AC_APPLIANCES",
    nameKeywords: ["ac", "appliance", "air conditioner", "refrigerator", "cooler"],
    fallbackIcon: Wrench,
    accentColor: "#0ea5e9", // Sky Blue
  },
  {
    key: "house-services",
    i18nKey: "house",
    vertical: "HOUSE_SERVICES",
    nameKeywords: ["house services", "home service", "repair", "cctv", "security", "electric", "plumb", "carpenter", "lock"],
    fallbackIcon: Wrench,
    accentColor: "#f97316", // Amber / Orange
  },
  {
    key: "cars",
    i18nKey: "cars",
    vertical: "VEHICLE_RENTAL",
    nameKeywords: ["vehicle", "car", "rental", "ride", "cab", "drive", "suv"],
    fallbackIcon: Car,
    accentColor: "#7c3aed", // Purple
  },
  {
    key: "wedding",
    i18nKey: "wedding",
    vertical: "WEDDING",
    nameKeywords: ["wedding", "party", "event", "photograph", "decor", "cater", "makeup"],
    fallbackIcon: Sparkles,
    accentColor: "#db2777", // Rose Pink
  },
];

// One service in a home-page row. `service` is the raw API record (booking, images);
// `content` supplies the display text in the active language.
const ServiceCard = ({ service, content }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const display = applyContent(service, content);
  const groupKey = structure.services[service.slug]?.group;
  const groupLabel = groupKey ? content?.groups?.[groupKey] : null;

  // Check saved wishlist state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tiptobook_wishlist") || "[]");
      const serviceId = service._id || service.id;
      setIsWishlisted(saved.includes(serviceId));
    } catch {
      // ignore storage errors
    }
  }, [service._id, service.id]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    try {
      const serviceId = service._id || service.id;
      const saved = JSON.parse(localStorage.getItem("tiptobook_wishlist") || "[]");
      let next;
      if (saved.includes(serviceId)) {
        next = saved.filter((id) => id !== serviceId);
        setIsWishlisted(false);
      } else {
        next = [...saved, serviceId];
        setIsWishlisted(true);
      }
      localStorage.setItem("tiptobook_wishlist", JSON.stringify(next));
    } catch {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleCardClick = () => {
    const slugOrId = service.slug || service._id || service.id;
    navigate(`/service/${slugOrId}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    const serviceId = service._id || service.id;
    let packageTitle = "Standard";
    let price = service.startingPrice || 0;
    if (service.packages && service.packages.length > 0) {
      packageTitle = service.packages[0].title;
      price = service.packages[0].price || price;
    }
    const params = new URLSearchParams({
      name: service.name,
      package: packageTitle,
      price: price.toString(),
    });
    navigate(`/booking/${serviceId}?${params.toString()}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="group relative flex-shrink-0 w-[200px] xs:w-[215px] sm:w-[235px] md:w-[250px] bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer snap-start"
    >
      {/* ── Image, group chip & wishlist ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <ServiceImage
          src={serviceImage(service)}
          alt={display.name}
          className="w-full h-full"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        {groupLabel && (
          <span className="absolute top-2.5 left-2.5 z-10 max-w-[70%] truncate rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-white">
            {groupLabel}
          </span>
        )}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? t("common.removeFromWishlist") : t("common.addToWishlist")}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-transform active:scale-90 border-0 cursor-pointer"
        >
          <Heart
            size={15}
            className={`transition-colors duration-200 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-white/90 group-hover:text-white"
            }`}
          />
        </button>
      </div>

      {/* ── Card content ── */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 gap-2">
        <h4
          title={display.name}
          className="text-[13.5px] sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5em] m-0 group-hover:text-purple-700 transition-colors"
        >
          {display.name}
        </h4>

        <p className="text-[11.5px] sm:text-xs text-gray-500 leading-snug line-clamp-2 min-h-[2.75em] m-0">
          {display.shortDescription}
        </p>

        <div className="flex items-center gap-1.5 mt-auto pt-0.5">
          {service.rating > 0 ? (
            <>
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{Number(service.rating).toFixed(1)}</span>
              {service.totalReviews > 0 && (
                <span className="text-[11px] text-gray-400 font-normal">
                  {t("common.reviewsCount", { count: service.totalReviews.toLocaleString("en-IN") })}
                </span>
              )}
            </>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
              {t("common.newService")}
            </span>
          )}
        </div>

        {/* ── Price & BOOK ── */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-gray-100">
          {service.startingPrice > 0 ? (
            <div className="min-w-0">
              <span className="block text-[10px] text-gray-400 font-medium leading-none mb-1">
                {t("common.startingFrom")}
              </span>
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  {formatPrice(service.startingPrice)}
                </span>
                {display.priceUnit && (
                  <span className="text-[10.5px] text-gray-500 font-normal truncate">
                    {formatPriceUnit(display.priceUnit)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleAddClick}
            aria-label={`${t("common.book")} ${display.name}`}
            className="flex-shrink-0 border border-purple-200 bg-purple-50/80 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95 font-bold text-[11px] sm:text-xs tracking-wider uppercase px-3.5 sm:px-4 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {t("common.book")}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Placeholder Card for loading state
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[180px] xs:w-[195px] sm:w-[220px] md:w-[235px] bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-0 overflow-hidden flex flex-col justify-between animate-pulse snap-start">
    <div className="aspect-[4/3] w-full bg-slate-200" />
    <div className="p-3.5 flex flex-col gap-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-slate-200 rounded w-16" />
        <div className="h-7 bg-slate-200 rounded-xl w-14" />
      </div>
    </div>
  </div>
);

// Single Category Row with Horizontal Scroll
const CategorySectionRow = ({
  config,
  category,
  services = [],
  loading = false,
  content,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(services.length > 3);

  // Check scroll position to show/hide arrow buttons
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [services, loading]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -350 : 350;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Build target destination route for "See all"
  const seeAllRoute = config.key === "ac-appliances"
    ? "/services/ac"
    : category?._id
    ? `/category/${category._id}`
    : `/services?q=${encodeURIComponent(config.nameKeywords[0])}`;

  // If not loading and no services exist, do not render an empty section
  if (!loading && services.length === 0) {
    return null;
  }

  return (
    <section className="mb-10 sm:mb-12">
      {/* ── Section Header ── */}
      <div className="flex items-end justify-between gap-3 mb-3.5 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h3
            className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight m-0 truncate sm:overflow-visible sm:whitespace-normal"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            {t(`homeSections.${config.i18nKey}.title`)}
          </h3>
          <p className="text-[11.5px] sm:text-xs md:text-sm text-gray-500 m-0 mt-0.5 line-clamp-1 sm:line-clamp-none">
            {t(`homeSections.${config.i18nKey}.subtitle`)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop Left/Right Navigation Chevrons */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label={t("common.scrollLeft")}
              className={`w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? "text-gray-700 hover:bg-gray-100 hover:border-gray-300 shadow-sm"
                  : "text-gray-300 opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label={t("common.scrollRight")}
              className={`w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? "text-gray-700 hover:bg-gray-100 hover:border-gray-300 shadow-sm"
                  : "text-gray-300 opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* "See all" link matching user reference */}
          <Link
            to={seeAllRoute}
            className="text-xs sm:text-sm font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-0.5 transition-colors no-underline whitespace-nowrap"
          >
            {t("common.seeAll")}
            <ArrowRight size={14} className="ml-0.5" />
          </Link>
        </div>
      </div>

      {/* ── Horizontal Scrolling Container ── */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 sm:gap-4.5 overflow-x-auto pb-4 pt-1 px-0.5 scroll-smooth snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading && services.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : services.map((service) => (
              <ServiceCard
                key={service._id || service.id}
                service={service}
                content={content}
              />
            ))}
      </div>
    </section>
  );
};

// ── Precise section matchers to avoid false positive substring matches ────────
const SECTION_MATCHERS = {
  "ac-appliances": (s) => {
    const name = (s.name || "").toLowerCase();
    const catName = (s.categoryName || s.category?.name || "").toLowerCase();
    const tags = Array.isArray(s.tags) ? s.tags.join(" ").toLowerCase() : "";
    const vertical = s.vertical || s.category?.vertical || "";

    if (vertical === "AC_APPLIANCES") return true;
    if (catName.includes("ac & appliance") || catName.includes("ac repair") || catName.includes("air conditioner")) return true;
    if (/\bac\b/i.test(name) || /\bair conditioner\b/i.test(name) || /\bfoam jet\b/i.test(name)) return true;
    if (/\bac\b/i.test(tags)) return true;
    return false;
  },
  "house-services": (s) => {
    const name = (s.name || "").toLowerCase();
    const catName = (s.categoryName || s.category?.name || "").toLowerCase();
    const tags = Array.isArray(s.tags) ? s.tags.join(" ").toLowerCase() : "";
    const vertical = s.vertical || s.category?.vertical || "";

    // Exclude AC services from general house services
    if (SECTION_MATCHERS["ac-appliances"](s)) return false;

    if (vertical === "HOUSE_SERVICES") return true;
    if (catName.includes("house service") || catName.includes("home repair") || catName.includes("plumb") || catName.includes("electric") || catName.includes("carpenter")) return true;
    if (/\b(electric|plumb|carpenter|cctv|smart lock|appliance repair|switch|wiring|fan repair)\b/i.test(name)) return true;
    if (/\b(electric|plumb|carpenter|cctv)\b/i.test(tags)) return true;
    return false;
  },
  "cars": (s) => {
    const name = (s.name || "").toLowerCase();
    const catName = (s.categoryName || s.category?.name || "").toLowerCase();
    const catGroup = (s.categoryGroup || "").toLowerCase();
    const tags = Array.isArray(s.tags) ? s.tags.join(" ").toLowerCase() : "";
    const vertical = s.vertical || s.category?.vertical || "";

    if (vertical === "VEHICLE_RENTAL") return true;
    if (catName.includes("vehicle") || catName.includes("rental") || catName.includes("car")) return true;
    if (catGroup.includes("vehicle") || catGroup.includes("rental") || catGroup.includes("car")) return true;
    if (/\b(car rental|vehicle|cab|chauffeur|sedan|suv|self-drive|outstation|airport cab)\b/i.test(name)) return true;
    if (/\b(car|cab|rental|outstation|airport)\b/i.test(tags)) return true;
    return false;
  },
  "wedding": (s) => {
    const name = (s.name || "").toLowerCase();
    const catName = (s.categoryName || s.category?.name || "").toLowerCase();
    const vertical = s.vertical || s.category?.vertical || "";

    if (vertical === "WEDDING") return true;
    if (catName.includes("wedding") || catName.includes("event") || catName.includes("party")) return true;
    if (/\b(wedding|photography|cinematic|candid|stage decor|bridal makeup|catering|caterer)\b/i.test(name)) return true;
    return false;
  },
};

// Main Export Component
const HomeFeaturedServices = ({
  categories: propCategories = [],
  services: propServices = [],
}) => {
  // ── Instant 0ms Render: seed immediately from props or cache or mock data ──
  const [realServices, setRealServices] = useState(() => {
    if (Array.isArray(propServices) && propServices.length > 0) return propServices;
    const cached = getCached("/services");
    if (cached && cached.length > 0) return cached;
    return mockServices;
  });

  const [realCategories, setRealCategories] = useState(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) return propCategories;
    const cached = getCached("/categories");
    if (cached && cached.length > 0) return cached;
    return mockCategories;
  });

  // Never block the user with full-section skeletons if services are already present
  const [loading, setLoading] = useState(false);

  // Sync state if parent props update (e.g., when Home.jsx finishes background fetch or city change)
  useEffect(() => {
    if (Array.isArray(propServices) && propServices.length > 0) {
      setRealServices(propServices);
    }
  }, [propServices]);

  useEffect(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) {
      setRealCategories(propCategories);
    }
  }, [propCategories]);

  // Silent background fetch to refresh real database data without blocking UI
  useEffect(() => {
    let isMounted = true;
    const fetchFreshData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          api.get("/services").catch(() => null),
          api.get("/categories").catch(() => null),
        ]);

        if (isMounted) {
          if (servicesRes?.data && Array.isArray(servicesRes.data) && servicesRes.data.length > 0) {
            setRealServices(servicesRes.data);
          }
          if (categoriesRes?.data && Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
            setRealCategories(categoriesRes.data);
          }
        }
      } catch (err) {
        // Silently keep current data on failure
      }
    };

    fetchFreshData();
    return () => {
      isMounted = false;
    };
  }, []);

  const content = useCatalogueContent();

  // Each service goes to the row of its real vertical (catalogue structure, then its DB
  // category); name/tag guessing is only for services with neither (e.g. offline mock data).
  const groupedData = useMemo(() => {
    const categoryVertical = new Map(
      realCategories.filter((c) => c._id && c.vertical).map((c) => [String(c._id), c.vertical])
    );
    const verticalOf = (s) =>
      structure.services[s.slug]?.vertical ||
      categoryVertical.get(String(s.category?._id ?? s.category)) ||
      null;

    return SECTIONS_CONFIG.map((config) => {
      const matcher = SECTION_MATCHERS[config.key] || (() => false);

      const matchedCategory = realCategories.find((cat) => {
        if (cat.vertical && cat.vertical === config.vertical) return true;
        const catName = (cat.name || "").toLowerCase();
        return config.nameKeywords.some((kw) => catName.includes(kw));
      });

      // Catalogue order first (group by group), then anything else in API order.
      const order = new Map(
        (structure.verticals[config.vertical]?.groups ?? [])
          .flatMap((g) => g.slugs)
          .map((slug, i) => [slug, i])
      );
      const rank = (s) => order.get(s.slug) ?? Number.MAX_SAFE_INTEGER;
      const categoryServices = realServices
        .filter((s) => {
          const vertical = verticalOf(s);
          return vertical ? vertical === config.vertical : matcher(s);
        })
        .sort((a, b) => rank(a) - rank(b));

      return {
        config,
        category: matchedCategory,
        services: categoryServices,
      };
    });
  }, [realCategories, realServices]);

  return (
    <div className="w-full bg-[#fcfcfd] py-8 sm:py-12 border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {groupedData.map(({ config, category, services }) => (
          <CategorySectionRow
            key={config.key}
            config={config}
            category={category}
            services={services}
            loading={loading && realServices.length === 0}
            content={content}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeFeaturedServices;
