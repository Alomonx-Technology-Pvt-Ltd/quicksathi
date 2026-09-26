import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Shield,
  Award,
  ChevronRight,
  X,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import api from "../config/api";
import SEO from "../components/SEO";
import { useLocation } from "../context/LocationContext";
import { mockServices } from "../data/mockServices";

// ── Sub-category quick selection tiles matching reference ──
const SUB_CATEGORIES = [
  {
    id: "repair-services",
    name: "Repair & Services",
    image: "/images/ac/ac-checkup.webp",
    keywords: ["check-up", "checkup", "lite", "foam", "jet", "repair", "service"],
  },
  {
    id: "gas-refill",
    name: "Gas Refill",
    image: "/images/ac/gas-refill.webp",
    keywords: ["gas", "refill", "leak"],
  },
  {
    id: "install-uninstall",
    name: "Install & Uninstall",
    image: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg",
    keywords: ["installation", "uninstallation", "install", "uninstall"],
  },
];

// Fallback 7 AC services strictly matching user reference
const FALLBACK_AC_SERVICES = [
  {
    _id: "ac-checkup",
    slug: "ac-checkup",
    name: "AC Check-up",
    section: "Repair & Services",
    rating: 4.7,
    totalReviews: 8831,
    startingPrice: 299,
    priceUnit: "visit",
    thumbnail: "/images/ac/ac-checkup.webp",
    bullets: [
      "Accurate AC issue diagnosis before any repair.",
      "Visitation fee will be adjusted in the final repair quote.",
    ],
    fullDescription:
      "Get a thorough AC health check-up by certified technicians. Includes compressor testing, gas pressure check, thermostat calibration, electrical connection audit, and a detailed report with repair recommendations. Visitation fee will be adjusted in the final repair quote.",
    packages: [
      { title: "Split AC Check-up", price: 299, features: ["Compressor & gas pressure test", "Thermostat calibration", "Electrical check", "Diagnosis report"] },
      { title: "Window AC Check-up", price: 249, features: ["Full unit inspection", "Cooling efficiency test", "Filter & coil check"] },
    ],
    faqs: [
      { question: "Will the check-up fee be adjusted if I proceed with repair?", answer: "Yes, the visitation fee is fully adjusted against the final repair bill." },
      { question: "How long does the check-up take?", answer: "A standard AC check-up takes about 20-30 minutes." },
    ],
  },
  {
    _id: "foam-jet-ac-service",
    slug: "foam-jet-ac-service",
    name: "Foam Jet AC Service",
    section: "Repair & Services",
    rating: 4.6,
    totalReviews: 8853,
    startingPrice: 699,
    priceUnit: "AC",
    thumbnail: "/images/ac/foam-jet.webp",
    bullets: [
      "Restores cooling with deep foam and jet cleaning.",
      "Best for ACs with dust buildup or weak airflow.",
    ],
    fullDescription:
      "Our flagship deep cleaning service. Uses specialized foam spray to melt stubborn dirt and high-pressure jet wash to flush out deep-seated grime from the indoor cooling coil and outdoor condenser.",
    packages: [
      { title: "1 Split AC Foam Jet Service", price: 699, features: ["2X deeper foam cleaning", "High-pressure jet flush", "Indoor jacket protection", "Outdoor unit wash"] },
      { title: "2 ACs Foam Jet Combo", price: 1299, features: ["2 Split ACs deep cleaning", "Condenser coil descaling", "Drain pipe flush"] },
    ],
    faqs: [
      { question: "Will water spill inside the room?", answer: "No! Technicians install a waterproof catch jacket around the indoor unit." },
    ],
  },
  {
    _id: "ac-gas-refill",
    slug: "ac-gas-refill",
    name: "Gas Refill & Check-up",
    section: "Gas Refill",
    rating: 4.7,
    totalReviews: 9069,
    startingPrice: 2499,
    priceUnit: "refill",
    thumbnail: "/images/ac/gas-refill.webp",
    bullets: [
      "AC gas refill for instant cooling",
      "Fix leaks. Refill gas. Cool better.",
    ],
    fullDescription:
      "Complete AC gas replenishment solution. Includes electronic leak detection, brazing/repair of copper pipe leaks, vacuum flushing of lines, and precision gas recharge (R32 / R410A / R22) with warranty.",
    packages: [
      { title: "Complete Gas Refill (R32/R410A)", price: 2499, features: ["Nitrogen leak test", "Minor leak fixing & vacuuming", "100% genuine refrigerant", "60-day cooling warranty"] },
      { title: "Gas Top-up & Leak Check", price: 1499, features: ["Gas pressure check", "Up to 30% top-up recharge", "Leak testing report"] },
    ],
    faqs: [
      { question: "Is there any warranty on gas refill?", answer: "Yes, we provide a 60-day cooling and leak-free warranty on complete gas refills." },
    ],
  },
  {
    _id: "ac-installation",
    slug: "ac-installation",
    name: "AC Installation",
    section: "Install & Uninstall",
    rating: 4.7,
    totalReviews: 8935,
    startingPrice: 1199,
    priceUnit: "AC",
    thumbnail: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg",
    bullets: [
      "Quick, safe AC installation for optimal cooling.",
      "Secure setup with final performance check.",
    ],
    fullDescription:
      "Professional AC installation by certified technicians. Includes indoor unit mounting, outdoor bracket fixing, copper pipe connection, electrical wiring, drain pipe routing, vacuum test, and performance verification.",
    packages: [
      { title: "Split AC Standard Installation", price: 1199, features: ["Indoor bracket & unit mounting", "Outdoor unit placement & fixing", "Core drilling (standard brick wall)", "Copper piping & wiring connection", "Vacuum testing & demo"] },
      { title: "Window AC Installation", price: 699, features: ["Window frame bracket setup", "Unit leveling & sealing", "Power connection & testing"] },
    ],
    faqs: [
      { question: "Are copper pipes and stand included?", answer: "Standard brackets and piping provided with the new AC are used. Extra copper pipes or stands are billed at standardized rates." },
    ],
  },
  {
    _id: "ac-uninstallation",
    slug: "ac-uninstallation",
    name: "AC Uninstallation",
    section: "Install & Uninstall",
    rating: 4.7,
    totalReviews: 8829,
    startingPrice: 499,
    priceUnit: "AC",
    thumbnail: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315767/TiptoBook/services/ac-uninstallation.jpg",
    bullets: [
      "Careful dismantling of AC indoor & outdoor units.",
      "Pipe sealing and safe packing.",
    ],
    fullDescription:
      "Damage-free AC uninstallation with complete gas recovery/pump down. Certified technicians safely dismount indoor & outdoor units, seal copper tubes to prevent moisture, and wrap units for transit or renovation.",
    packages: [
      { title: "Split AC Uninstallation", price: 499, features: ["Gas pump down (zero gas loss)", "Indoor & outdoor unit dismount", "Copper pipe coil & tube sealing", "Bracket removal"] },
      { title: "Window AC Uninstallation", price: 349, features: ["Unit dismantling from window", "Frame removal & clean-up"] },
    ],
    faqs: [
      { question: "Will gas be lost during uninstallation?", answer: "No! Technicians perform a pump down to trap all refrigerant inside the compressor." },
    ],
  },
];

const ACCategoryPage = ({ category: propCategory }) => {
  const navigate = useNavigate();
  const { currentCity } = useLocation();

  const [activeSection, setActiveSection] = useState("all");
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);
  const [liveServices, setLiveServices] = useState(FALLBACK_AC_SERVICES);
  const sectionRefs = useRef({});

  // Fetch live services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/services");
        if (data && data.length > 0) {
          // Filter for AC services
          const acSvcs = data.filter((s) => {
            const name = (s.name || "").toLowerCase();
            const catName = (s.categoryName || "").toLowerCase();
            const tags = (s.tags || []).map((t) => t.toLowerCase());
            return (
              name.includes("ac") ||
              name.includes("air conditioner") ||
              catName.includes("ac") ||
              catName.includes("appliance") ||
              tags.includes("ac")
            );
          });

          if (acSvcs.length > 0) {
            // Map live services to our structure, filling in any display fields from fallback
            const merged = FALLBACK_AC_SERVICES.map((fb) => {
              const matchedLive = acSvcs.find(
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
      } catch (err) {
        // Keep fallback data
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
      const sectionName = svc.section || "Repair & Services";
      if (!groups[sectionName]) {
        groups[sectionName] = [];
      }
      groups[sectionName].push(svc);
    });

    return groups;
  }, [liveServices]);

  // Scroll to section handler
  const handleScrollToSection = (sectionName) => {
    setActiveSection(sectionName);
    const element = sectionRefs.current[sectionName];
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleBookService = (service) => {
    navigate(`/booking/${service.slug || service._id}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <SEO
        title="AC Services & Repair in Patna & Bihar — TiptoBook"
        description="Book top-rated AC repair, foam jet deep service, gas refill, and installation in Patna & Bihar. Verified technicians, upfront pricing & 30-day warranty on TiptoBook."
        canonical="https://www.tiptobook.com/services/ac"
        keywords="AC repair Patna, AC service Patna, AC gas refill Bihar, Split AC installation Patna, Window AC repair, TiptoBook"
      />

      {/* ── Main Container: max-w-4xl for clean centered Urban Company feel ── */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* ── Top City / Location Selector Header ── */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <MapPin size={13} className="text-purple-600" />
            <span>Select city</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight m-0">
            AC Services services near you
          </h1>

          {/* Trust Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 mt-3 flex-wrap">
            {/* 5k+ Experts badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Shield size={12} className="text-purple-600" />
              <span>5k+ Experts</span>
            </div>

            {/* 400K+ ★★★★★ badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>400K+ ★★★★★</span>
            </div>
          </div>
        </div>

        {/* ── "What service do you need ?" (4 Visual Grid Cards) ── */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 tracking-tight m-0">
            What service do you need ?
          </h2>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
            {SUB_CATEGORIES.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleScrollToSection(sub.name)}
                className="group flex flex-col items-center text-center bg-transparent border-0 cursor-pointer p-0 outline-none transition-transform duration-200 active:scale-95"
              >
                {/* Visual Thumbnail Card */}
                <div className="relative w-full aspect-square max-w-[105px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-xs group-hover:border-purple-300 group-hover:shadow-md transition-all">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=300&auto=format&fit=crop";
                    }}
                  />
                </div>

                {/* Sub-category Label */}
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

        {/* ── Service Sections (Grouped matching reference screenshot) ── */}
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
                {/* Section Header */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-200 m-0">
                  {sub.name}
                </h3>

                {/* Service Cards in this Section */}
                <div className="divide-y divide-slate-100">
                  {servicesInSection.map((service) => (
                    <article
                      key={service._id || service.slug}
                      className="py-6 sm:py-7 flex items-start justify-between gap-4 sm:gap-6 group"
                    >
                      {/* Left: Info, Ratings, Bullets, Show More, Price & BOOK Button */}
                      <div className="flex-1 min-w-0 pr-2">
                        {/* Title */}
                        <h4
                          onClick={() => setSelectedServiceForModal(service)}
                          className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0 cursor-pointer hover:text-purple-600 transition-colors"
                        >
                          {service.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-800">
                            {service.rating || 4.7}
                          </span>
                          <span className="text-slate-500">
                            ({(service.totalReviews || 8800).toLocaleString("en-IN")} reviews)
                          </span>
                        </div>

                        {/* Dashed Separator */}
                        <div className="w-full border-b border-dashed border-slate-200 my-2.5 max-w-md" />

                        {/* Bullets matching reference */}
                        <ul className="m-0 p-0 list-none space-y-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-md">
                          {(service.bullets || []).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-slate-400 mt-1 select-none">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Show more > link */}
                        <button
                          type="button"
                          onClick={() => setSelectedServiceForModal(service)}
                          className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-700 hover:text-purple-900 mt-2 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          <span>Show more</span>
                          <ChevronRight size={13} />
                        </button>

                        {/* Price & BOOK Button Row */}
                        <div className="flex items-center justify-between mt-4 max-w-md pt-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              ₹{(service.startingPrice || 299).toLocaleString("en-IN")}
                            </span>
                            {service.priceUnit && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                /{service.priceUnit}
                              </span>
                            )}
                          </div>

                          {/* BOOK Button */}
                          <button
                            type="button"
                            onClick={() => handleBookService(service)}
                            className="px-5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95 font-bold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                          >
                            BOOK
                          </button>
                        </div>
                      </div>

                      {/* Right: Clean Service Image */}
                      <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                        <img
                          src={service.thumbnail}
                          alt={service.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/ac/ac-checkup.webp";
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
      </div>

      {/* ── Detail Drawer / Modal for "Show More >" ── */}
      <AnimatePresence>
        {selectedServiceForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
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
                      {selectedServiceForModal.rating}
                    </span>
                    <span>
                      ({(selectedServiceForModal.totalReviews || 8800).toLocaleString("en-IN")} reviews)
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
                {/* Banner / Thumbnail */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={selectedServiceForModal.thumbnail}
                    alt={selectedServiceForModal.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                    About this service
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                    {selectedServiceForModal.fullDescription || selectedServiceForModal.bullets?.join(" ")}
                  </p>
                </div>

                {/* Packages available */}
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
                              ₹{pkg.price.toLocaleString("en-IN")}
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

                {/* Key Benefits */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs text-purple-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>TiptoBook AC Assurance</span>
                  </div>
                  <p className="m-0 leading-relaxed text-purple-800/90">
                    Background-verified technicians • 30-day post-service warranty • Standardized pricing with zero hidden charges.
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
                            <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform" />
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

              {/* Modal Footer with BOOK button */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{(selectedServiceForModal.startingPrice || 299).toLocaleString("en-IN")}
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

export default ACCategoryPage;
