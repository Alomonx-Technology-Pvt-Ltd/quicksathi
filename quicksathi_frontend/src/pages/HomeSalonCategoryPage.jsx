import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ChevronRight,
  X,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronDown,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import api from "../config/api";
import SEO from "../components/SEO";
import { useLocation } from "../context/LocationContext";
import CategorySpotlightBanner from "../components/CategorySpotlightBanner";

// ── Sub-category quick-selection tiles ──
const SUB_CATEGORIES = [
  {
    id: "hair-styling-care",
    name: "Hair Styling & Care",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300&auto=format&fit=crop",
    keywords: ["hair", "haircut", "blow dry", "keratin", "smoothening", "color"],
  },
  {
    id: "facial-cleanup",
    name: "Facial & Cleanup",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=300&auto=format&fit=crop",
    keywords: ["facial", "cleanup", "glow", "skin", "whitening", "de-tan"],
  },
  {
    id: "bridal-party-makeup",
    name: "Bridal & Party Makeup",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop",
    keywords: ["bridal", "makeup", "party", "airbrush", "hd makeup", "saree draping"],
  },
  {
    id: "manicure-pedicure",
    name: "Manicure & Pedicure",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300&auto=format&fit=crop",
    keywords: ["manicure", "pedicure", "nail", "spa", "gel polish"],
  },
  {
    id: "waxing-threading",
    name: "Waxing & Threading",
    image:
      "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=300&auto=format&fit=crop",
    keywords: ["waxing", "threading", "rica", "roll-on", "body care"],
  },
  {
    id: "mens-salon-spa",
    name: "Men's Salon & Spa",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=300&auto=format&fit=crop",
    keywords: ["men", "men's", "male", "beard", "grooming", "facial for men"],
  },
];

// ── Fallback services (shown instantly before API response) ──
const FALLBACK_SALON_SERVICES = [
  {
    _id: "hair-styling-care",
    slug: "hair-styling-care",
    name: "Hair Styling & Care",
    section: "Hair Styling & Care",
    rating: 4.9,
    totalReviews: 2100,
    startingPrice: 499,
    priceUnit: "service",
    thumbnail:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop",
    bullets: [
      "Expert haircut, blow dry & nourishing hair spa at home.",
      "Certified beauticians with single-use disposable kits.",
    ],
    fullDescription:
      "Transform your look with our certified hairstylists. Services include precision haircut, blow dry, deep conditioning hair spa, keratin, hair coloring, and smoothening treatments using premium salon products — all delivered at your doorstep.",
    packages: [
      {
        title: "Haircut & Blow Dry",
        price: 499,
        features: ["Styling consultation", "Precision haircut", "Blow dry styling"],
      },
      {
        title: "Nourishing Hair Spa & Cut",
        price: 1299,
        features: ["Scalp massage", "Deep moisture mask", "Steam treatment", "Haircut & blow dry"],
      },
    ],
    faqs: [
      {
        question: "Do salon professionals bring their own products?",
        answer: "Yes, our beauty professionals carry complete single-use disposable kits and branded products.",
      },
      {
        question: "Is hair coloring available at home?",
        answer: "Yes, we offer all coloring services including global color, highlights, balayage, and root touch-up.",
      },
    ],
  },
  {
    _id: "facial-cleanup",
    slug: "facial-cleanup",
    name: "Facial & Cleanup",
    section: "Facial & Cleanup",
    rating: 4.8,
    totalReviews: 1750,
    startingPrice: 799,
    priceUnit: "session",
    thumbnail:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
    bullets: [
      "Glow & rejuvenation facials by expert beauticians.",
      "O3+, Lotus Herbal & deep cleansing cleanups.",
    ],
    fullDescription:
      "Restore natural radiance with customized facials: O3+ Whitening, Lotus Herbal, Cheryl's Glow, and Deep Cleansing cleanups tailored for your skin type — performed by trained professionals at your home.",
    packages: [
      {
        title: "Fruit Cleanup & De-Tan",
        price: 799,
        features: ["Face scrub", "Steam & blackhead removal", "De-tan pack"],
      },
      {
        title: "O3+ Radiant Glow Facial",
        price: 1899,
        features: ["Skin analysis", "O3+ D-tan", "Micro-massage", "Vitamin C serum", "Glow mask"],
      },
    ],
    faqs: [
      {
        question: "How long does the facial session take?",
        answer: "A standard cleanup takes 45 mins while an advanced facial takes 75 mins.",
      },
    ],
  },
  {
    _id: "bridal-party-makeup",
    slug: "bridal-party-makeup",
    name: "Bridal & Party Makeup",
    section: "Bridal & Party Makeup",
    rating: 4.9,
    totalReviews: 1400,
    startingPrice: 2500,
    priceUnit: "event",
    thumbnail:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop",
    bullets: [
      "HD Airbrush bridal makeup and party glam at your doorstep.",
      "Trial sessions available for bridal packages.",
    ],
    fullDescription:
      "Look stunning on your special occasion with celebrity makeup artists. HD Bridal Makeup, Engagement Look, Party Glam, Saree Draping, and Hair Artistry — all delivered at home.",
    packages: [
      {
        title: "Party Glam Makeup",
        price: 2500,
        features: ["HD face makeup", "Hair styling", "Saree/dupatta draping", "Eyelashes"],
      },
      {
        title: "Royal Bridal Airbrush Package",
        price: 12000,
        features: ["Airbrush HD makeup", "Trial session", "Bridal hairstyle", "Jewelry & outfit draping", "Premium lashes"],
      },
    ],
    faqs: [
      {
        question: "Do you offer makeup trial sessions?",
        answer: "Yes, trial sessions are included in premium bridal packages.",
      },
    ],
  },
  {
    _id: "manicure-pedicure",
    slug: "manicure-pedicure",
    name: "Manicure & Pedicure",
    section: "Manicure & Pedicure",
    rating: 4.7,
    totalReviews: 1200,
    startingPrice: 699,
    priceUnit: "session",
    thumbnail:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop",
    bullets: [
      "Luxurious spa manicure & pedicure at home.",
      "Gel nail art, foot reflexology & hygiene pedicure.",
    ],
    fullDescription:
      "Pamper your hands and feet with relaxing spa manicure, foot reflexology massage, nail shaping, cuticle care, and gel polish — by trained beauticians at your home.",
    packages: [
      {
        title: "Classic Mani-Pedi Combo",
        price: 699,
        features: ["Soak & scrub", "Nail shaping", "Cuticle care", "Massage & polish"],
      },
      {
        title: "Ice Cream Spa Mani-Pedi",
        price: 1299,
        features: ["Aroma soak", "Exfoliating scrub", "Creme mask", "Deep reflexology massage", "Gel polish"],
      },
    ],
    faqs: [
      {
        question: "Is warm water required for Mani-Pedi?",
        answer: "Yes, the professional will use warm water from your home.",
      },
    ],
  },
  {
    _id: "waxing-threading",
    slug: "waxing-threading",
    name: "Waxing & Threading",
    section: "Waxing & Threading",
    rating: 4.8,
    totalReviews: 1900,
    startingPrice: 399,
    priceUnit: "session",
    thumbnail:
      "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=600&auto=format&fit=crop",
    bullets: [
      "Hygienic RICA & Roll-On waxing at home.",
      "Pain-free threading & body polishing.",
    ],
    fullDescription:
      "Gentle, pain-free waxing services using RICA and Liposoluble wax for full body, legs, arms, and underarms with threading — performed by certified beauticians at your doorstep.",
    packages: [
      {
        title: "Full Arms + Full Legs Waxing",
        price: 599,
        features: ["RICA peel-off wax", "Pre-wax oil", "Post-wax gel lotion"],
      },
      {
        title: "Full Body RICA Waxing Package",
        price: 1499,
        features: ["Full arms", "Full legs", "Underarms", "Full back & stomach", "Free threading"],
      },
    ],
    faqs: [
      {
        question: "Is RICA wax suitable for sensitive skin?",
        answer: "Yes, RICA colophony-free wax is specially recommended for sensitive skin.",
      },
    ],
  },
  {
    _id: "mens-salon-spa",
    slug: "mens-salon-spa",
    name: "Men's Salon & Spa",
    section: "Men's Salon & Spa",
    rating: 4.8,
    totalReviews: 980,
    startingPrice: 349,
    priceUnit: "service",
    thumbnail:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop",
    bullets: [
      "Professional grooming for men — haircut, beard styling & face care.",
      "Relaxing spa & de-stress services at your doorstep.",
    ],
    fullDescription:
      "Expert men's grooming at home — includes precision haircut, beard shaping, clean shave, de-tan facials, hair coloring, and body grooming by certified professionals.",
    packages: [
      {
        title: "Haircut & Beard Styling",
        price: 349,
        features: ["Precision haircut", "Beard line-up & shape", "Cool towel finish"],
      },
      {
        title: "Men's Grooming Combo",
        price: 799,
        features: ["Haircut", "Beard trimming", "De-tan cleanup", "Head & shoulder massage"],
      },
    ],
    faqs: [
      {
        question: "Do you bring your own salon tools?",
        answer: "Yes, professionals arrive with sanitized, individual-use clippers, scissors, and grooming products.",
      },
    ],
  },
];

const HomeSalonCategoryPage = ({ category: propCategory }) => {
  const navigate = useNavigate();
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
  const [liveServices, setLiveServices] = useState(FALLBACK_SALON_SERVICES);
  const sectionRefs = useRef({});

  // Escape key & background scroll lock for detail modal
  useEffect(() => {
    if (!selectedServiceForModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedServiceForModal(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedServiceForModal]);

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

  // Fetch live services from backend and merge with fallback
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/services");
        if (data && data.length > 0) {
          const salonSvcs = data.filter((s) => {
            const catName = (s.categoryName || "").toLowerCase();
            const vert = (s.vertical || "").toLowerCase();
            return (
              s.categoryId === 25 ||
              catName.includes("salon") ||
              catName.includes("beauty") ||
              vert === "home_salon"
            );
          });

          if (salonSvcs.length > 0) {
            const merged = FALLBACK_SALON_SERVICES.map((fb) => {
              const matchedLive = salonSvcs.find(
                (ls) =>
                  ls.slug === fb.slug ||
                  ls.name.toLowerCase() === fb.name.toLowerCase()
              );
              if (matchedLive) {
                return {
                  ...fb,
                  _id: matchedLive._id || fb._id,
                  startingPrice: matchedLive.startingPrice || fb.startingPrice,
                  rating: matchedLive.rating || fb.rating,
                  totalReviews: matchedLive.totalReviews || fb.totalReviews,
                  packages: matchedLive.packages?.length > 0 ? matchedLive.packages : fb.packages,
                  faqs: matchedLive.faqs?.length > 0 ? matchedLive.faqs : fb.faqs,
                };
              }
              return fb;
            });
            setLiveServices(merged);
          }
        }
      } catch {
        // Keep fallback data silently
      }
    };
    fetchServices();
  }, []);

  // Group services by section
  const groupedServices = useMemo(() => {
    const groups = {};
    SUB_CATEGORIES.forEach((sub) => {
      groups[sub.name] = [];
    });
    liveServices.forEach((svc) => {
      const sectionName = svc.section || "Hair Styling & Care";
      if (!groups[sectionName]) groups[sectionName] = [];
      groups[sectionName].push(svc);
    });
    return groups;
  }, [liveServices]);

  const handleScrollToSection = (sectionName) => {
    setActiveSection(sectionName);
    const element = sectionRefs.current[sectionName];
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
        title="Home Salon & Beauty Services in Patna & Bihar — TiptoBook"
        description="Book top-rated home salon services in Patna & Bihar — haircut, facial, bridal makeup, manicure, pedicure, waxing & men's grooming at your doorstep. Verified beauticians on TiptoBook."
        canonical="https://www.tiptobook.com/category/home-salon"
        keywords="home salon Patna, beauty services at home Bihar, bridal makeup home, facial at home, manicure pedicure home, waxing at home, men grooming Patna, TiptoBook"
      />

      {/* ── Main Container ── */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* ── Top City / Real-Time Location Header ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-purple-50/70 border border-purple-100/90 px-2.5 py-1 rounded-full shadow-2xs">
              <MapPin size={13} className="text-purple-600 shrink-0" />
              <span>
                {detecting ? "Locating in real-time..." : realTimeLocation || "Current Location"}
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
                <span>{city ? `City: ${city}` : "Select city"}</span>
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
                      Select City
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
            Home Salon & Beauty services near you
          </h1>

          {/* Trust Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 mt-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Users size={12} className="text-purple-600" />
              <span>500+ Happy Customers</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>80+ Partners</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>4.9 Rating</span>
            </div>
          </div>
        </div>

        {/* ── Spotlight Banner ── */}
        <CategorySpotlightBanner
          category={propCategory || { vertical: "HOME_SALON", name: "Home Salon & Beauty" }}
          id="home-salon"
        />

        {/* ── "What service do you need?" Grid ── */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 tracking-tight m-0">
            What service do you need ?
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4">
            {SUB_CATEGORIES.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleScrollToSection(sub.name)}
                className="group flex flex-col items-center text-center bg-transparent border-0 cursor-pointer p-0 outline-none transition-transform duration-200 active:scale-95"
              >
                <div className="relative w-full aspect-square max-w-[105px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-xs group-hover:border-purple-300 group-hover:shadow-md transition-all">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300&auto=format&fit=crop";
                    }}
                  />
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors line-clamp-2 max-w-[100px]">
                  {sub.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Sticky Category Navigation Bar ── */}
        <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md py-3.5 mt-8 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SUB_CATEGORIES.map((sub) => {
            const isSelected = activeSection === sub.name;
            return (
              <button
                key={sub.id}
                onClick={() => handleScrollToSection(sub.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>

        {/* ── Service Sections ── */}
        <div className="mt-6 flex flex-col gap-10">
          {SUB_CATEGORIES.map((sub) => {
            const servicesInSection = groupedServices[sub.name] || [];
            if (servicesInSection.length === 0) return null;

            return (
              <section
                key={sub.id}
                ref={(el) => (sectionRefs.current[sub.name] = el)}
                className="scroll-mt-28"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-200 m-0">
                  {sub.name}
                </h3>

                <div className="divide-y divide-slate-100">
                  {servicesInSection.map((service) => (
                    <article
                      key={service._id || service.slug}
                      className="py-6 sm:py-7 flex items-start justify-between gap-4 sm:gap-6 group"
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4
                          onClick={() => setSelectedServiceForModal(service)}
                          className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0 cursor-pointer hover:text-purple-600 transition-colors"
                        >
                          {service.name}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-800">{service.rating || 4.8}</span>
                          <span className="text-slate-500">
                            ({(service.totalReviews || 1000).toLocaleString("en-IN")} reviews)
                          </span>
                        </div>

                        <div className="w-full border-b border-dashed border-slate-200 my-2.5 max-w-md" />

                        <ul className="m-0 p-0 list-none space-y-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-md">
                          {(service.bullets || []).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-slate-400 mt-1 select-none">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => setSelectedServiceForModal(service)}
                          className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-700 hover:text-purple-900 mt-2 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          <span>Show more</span>
                          <ChevronRight size={13} />
                        </button>

                        <div className="flex items-center justify-between mt-4 max-w-md pt-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              &#8377;{(service.startingPrice || 499).toLocaleString("en-IN")}
                            </span>
                            {service.priceUnit && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                /{service.priceUnit}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleBookService(service)}
                            className="px-5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95 font-bold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                          >
                            BOOK
                          </button>
                        </div>
                      </div>

                      {/* Right: Image */}
                      <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                        <img
                          src={service.thumbnail}
                          alt={service.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300&auto=format&fit=crop";
                          }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Bottom Support CTA ── */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
          <h3 className="text-xl font-bold text-slate-900 m-0 mb-2">
            Need a custom beauty package?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto m-0 mb-6">
            Speak directly with our support team for group bookings, bridal packages, and custom beauty sessions.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wider uppercase hover:bg-purple-600 transition-colors no-underline shadow-sm"
          >
            <span>Contact Support</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Detail Modal / Popup Dialog ── */}
      <AnimatePresence>
        {selectedServiceForModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedServiceForModal(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22 }}
              className="relative z-10 bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    {selectedServiceForModal.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">
                      {selectedServiceForModal.rating || 4.8}
                    </span>
                    <span>
                      ({(selectedServiceForModal.totalReviews || 1000).toLocaleString("en-IN")} reviews)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedServiceForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 border-0 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700">
                {/* Banner */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={selectedServiceForModal.thumbnail}
                    alt={selectedServiceForModal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                    About this service
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                    {selectedServiceForModal.fullDescription ||
                      selectedServiceForModal.bullets?.join(" ")}
                  </p>
                </div>

                {/* Packages */}
                {selectedServiceForModal.packages?.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                      Included Options & Packages
                    </h4>
                    <div className="space-y-2.5">
                      {selectedServiceForModal.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs sm:text-sm text-slate-800">
                              {pkg.title}
                            </span>
                            <span className="font-bold text-sm text-purple-700">
                              &#8377;{pkg.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          {pkg.features && (
                            <ul className="m-0 p-0 list-none space-y-1 text-xs text-slate-500">
                              {pkg.features.map((feat, fidx) => (
                                <li key={fidx} className="flex items-center gap-1.5">
                                  <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TiptoBook Assurance */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs text-purple-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>TiptoBook Beauty Assurance</span>
                  </div>
                  <p className="m-0 leading-relaxed text-purple-800/90">
                    Background-verified beauticians • Single-use disposable kits • 100% hygienic products • Post-service satisfaction guarantee.
                  </p>
                </div>

                {/* FAQs */}
                {selectedServiceForModal.faqs?.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-2">
                      {selectedServiceForModal.faqs.map((faq, idx) => (
                        <details
                          key={idx}
                          className="p-3 rounded-xl border border-slate-200 text-xs bg-white cursor-pointer group"
                        >
                          <summary className="font-semibold text-slate-800 list-none flex items-center justify-between">
                            <span>{faq.question}</span>
                            <ChevronDown
                              size={14}
                              className="text-slate-400 group-open:rotate-180 transition-transform"
                            />
                          </summary>
                          <p className="mt-2 text-slate-600 leading-relaxed m-0 pt-2 border-t border-slate-100">
                            {faq.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                  <span className="text-lg font-bold text-slate-900">
                    &#8377;{(selectedServiceForModal.startingPrice || 499).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const svc = selectedServiceForModal;
                    setSelectedServiceForModal(null);
                    handleBookService(svc);
                  }}
                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  BOOK NOW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeSalonCategoryPage;
