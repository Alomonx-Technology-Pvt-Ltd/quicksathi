import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import {
  Star,
  ChevronRight,
  MapPin,
  ChevronDown,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import api from "../config/api";
import SEO from "../components/SEO";
import { useLocation } from "../context/LocationContext";
import CategorySpotlightBanner from "../components/CategorySpotlightBanner";
import CatalogueServiceItem from "../components/catalogue/CatalogueServiceItem";
import CatalogueServiceModal from "../components/catalogue/CatalogueServiceModal";
import {
  useCatalogueContent,
  applyContent,
  servicesForVertical,
  groupByStructure,
  groupTitle,
} from "../content/catalogue";

const VERTICAL = "HOME_SALON";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300&auto=format&fit=crop";
const serviceImage = (service) => service?.thumbnail || service?.bannerImage;

const HomeSalonCategoryPage = ({ category: propCategory }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const content = useCatalogueContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const genderParam = searchParams.get("gender"); // "women" | "men" | null
  const {
    city,
    locality,
    street,
    road,
    fullLocation,
    detecting,
    setCity,
    cityOptions = [],
  } = useLocation();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);
  // null while the first request is in flight
  const [apiServices, setApiServices] = useState(null);
  const sectionRefs = useRef({});

  const handleGenderSwitch = (gender) => {
    if (gender === genderParam) {
      // Clicking same tab = show all
      searchParams.delete("gender");
    } else {
      searchParams.set("gender", gender);
    }
    setSearchParams(searchParams);
  };

  // Real-time location formatting
  const realTimeLocation = useMemo(() => {
    if (street && locality && street !== locality) return `${street}, ${locality}`;
    if (road && locality && road !== locality) return `${road}, ${locality}`;
    if (locality && city && locality !== city) return `${locality}, ${city}`;
    if (locality) return locality;
    if (street) return street;
    if (road) return road;
    if (city) return city;
    if (fullLocation) {
      const parts = fullLocation.split(",").map((p) => p.trim()).filter(Boolean);
      return parts.slice(0, 2).join(", ");
    }
    return null;
  }, [street, road, locality, city, fullLocation]);

  // Fetch live services from backend
  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => setApiServices(Array.isArray(data) ? data : []))
      .catch(() => setApiServices([]));
  }, []);

  // Group API services by the catalogue structure, filtered by gender tab
  const groups = useMemo(() => {
    const categoryServices = servicesForVertical(apiServices, VERTICAL, propCategory?._id);
    const gender = genderParam === "women" || genderParam === "men" ? genderParam : undefined;
    return groupByStructure(categoryServices, VERTICAL, { gender }) ?? [];
  }, [apiServices, propCategory?._id, genderParam]);

  const handleScrollToSection = (sectionKey) => {
    setActiveSection(sectionKey);
    const element = sectionRefs.current[sectionKey];
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleBookService = (service) => {
    navigate(`/booking/${service.slug || service._id}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <SEO
        title="Home Salon & Beauty Services Across India — TiptoBook"
        description="Book top-rated home salon services across India — haircut, facial, bridal makeup, manicure, pedicure, waxing & grooming at your doorstep with verified beauticians on TiptoBook."
        canonical="https://www.tiptobook.com/category/home-salon"
        keywords="home salon India, beauty services at home, bridal makeup home, facial at home, manicure pedicure home, waxing at home, grooming, TiptoBook"
      />

      {/* ── Main Container ── */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* ── Top City / Real-Time Location Header ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-purple-50/70 border border-purple-100/90 px-2.5 py-1 rounded-full shadow-2xs">
              <MapPin size={13} className="text-purple-600 shrink-0" />
              <span>
                {detecting ? t("location.locating") : realTimeLocation || t("location.current")}
              </span>
              {detecting && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping inline-block ml-0.5" />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-purple-700 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer text-xs"
              >
                <span>{city ? t("location.city", { city }) : t("location.selectCity")}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${isCityDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCityDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCityDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-50 w-48 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 no-scrollbar">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t("location.selectCity")}
                    </div>
                    {cityOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setCity(c); setIsCityDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 hover:text-purple-700 border-0 bg-transparent cursor-pointer flex items-center justify-between transition-colors ${
                          city === c ? "font-bold text-purple-700 bg-purple-50/50" : "text-slate-700"
                        }`}
                      >
                        <span>{c}</span>
                        {city === c && <Check size={12} className="text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight m-0">
            {genderParam === "women"
              ? t("salon.titleWomen")
              : genderParam === "men"
              ? t("salon.titleMen")
              : t("salon.titleAll")}
          </h1>

          {/* Gender Toggle Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              aria-pressed={genderParam === "women"}
              onClick={() => handleGenderSwitch("women")}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                genderParam === "women"
                  ? "bg-pink-600 text-white border-pink-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700"
              }`}
            >
              {t("salon.women")}
            </button>
            <button
              type="button"
              aria-pressed={genderParam === "men"}
              onClick={() => handleGenderSwitch("men")}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                genderParam === "men"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {t("salon.men")}
            </button>
            {genderParam && (
              <button
                type="button"
                onClick={() => {
                  searchParams.delete("gender");
                  setSearchParams(searchParams);
                }}
                className="px-3 py-2 rounded-full text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border-0 cursor-pointer transition-colors"
              >
                {t("salon.showAll")}
              </button>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 mt-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Users size={12} className="text-purple-600" />
              <span>{t("common.happyCustomers", { count: 500 })}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>{t("common.partners", { count: 80 })}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{t("common.ratingBadge", { rating: 4.9 })}</span>
            </div>
          </div>
        </div>

        {/* ── Spotlight Banner ── */}
        <CategorySpotlightBanner
          category={propCategory || { vertical: VERTICAL, name: "Home Salon & Beauty" }}
          id="home-salon"
        />

        {apiServices === null && (
          <p className="mt-8 text-sm text-slate-500">{t("catalogue.loadingServices")}</p>
        )}
        {apiServices !== null && groups.length === 0 && (
          <p className="mt-8 text-sm text-slate-500">{t("catalogue.noServices")}</p>
        )}

        {groups.length > 0 && (
          <>
            {/* ── "What service do you need?" Grid ── */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 tracking-tight m-0">
                {t("catalogue.whatServiceNeed")}
              </h2>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4">
                {groups.map((group) => {
                  const title = groupTitle(group.key, content, t);
                  return (
                    <button
                      key={group.key}
                      onClick={() => handleScrollToSection(group.key)}
                      className="group flex flex-col items-center text-center bg-transparent border-0 cursor-pointer p-0 outline-none transition-transform duration-200 active:scale-95"
                    >
                      <div className="relative w-full aspect-square max-w-[105px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-xs group-hover:border-purple-300 group-hover:shadow-md transition-all">
                        <img
                          src={serviceImage(group.services[0]) || FALLBACK_IMAGE}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="eager"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors line-clamp-2 max-w-[100px]">
                        {title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Sticky Category Navigation Bar ── */}
            <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md py-3.5 mt-8 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {groups.map((group) => {
                const isSelected = activeSection === group.key;
                return (
                  <button
                    key={group.key}
                    onClick={() => handleScrollToSection(group.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {groupTitle(group.key, content, t)}
                  </button>
                );
              })}
            </div>

            {/* ── Service Sections ── */}
            <div className="mt-6 flex flex-col gap-10">
              {groups.map((group) => (
                <section
                  key={group.key}
                  ref={(el) => (sectionRefs.current[group.key] = el)}
                  className="scroll-mt-28"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-200 m-0">
                    {groupTitle(group.key, content, t)}
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {group.services.map((service) => (
                      <CatalogueServiceItem
                        key={service._id || service.slug}
                        service={applyContent(service, content)}
                        image={serviceImage(service)}
                        fallbackImage={FALLBACK_IMAGE}
                        onOpen={() => setSelectedServiceForModal(service)}
                        onBook={() => handleBookService(service)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        {/* ── Bottom Support CTA ── */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
          <h3 className="text-xl font-bold text-slate-900 m-0 mb-2">
            {t("salon.customTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto m-0 mb-6">
            {t("salon.customText")}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wider uppercase hover:bg-purple-600 transition-colors no-underline shadow-sm"
          >
            <span>{t("common.contactSupport")}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Detail Modal / Popup Dialog ── */}
      <AnimatePresence>
        {selectedServiceForModal && (
          <CatalogueServiceModal
            service={applyContent(selectedServiceForModal, content)}
            image={serviceImage(selectedServiceForModal)}
            fallbackImage={FALLBACK_IMAGE}
            assuranceTitle={t("salon.assuranceTitle")}
            assuranceText={t("salon.assuranceText")}
            onClose={() => setSelectedServiceForModal(null)}
            onBook={() => {
              const svc = selectedServiceForModal;
              setSelectedServiceForModal(null);
              handleBookService(svc);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeSalonCategoryPage;
