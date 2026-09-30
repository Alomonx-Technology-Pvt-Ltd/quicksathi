import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowRight,
  Shield,
  Clock,
  Wrench,
  Check,
} from "lucide-react";
import api from "../config/api";
import { mockServices } from "../data/mockServices";
import AboutSection from "../components/serviceDetail/AboutSection";
import HeroBanner from "../components/serviceDetail/HeroBanner";
import PackagesSection from "../components/serviceDetail/PackagesSection";
import ProvidersSection from "../components/serviceDetail/ProvidersSection";
import ReviewsSection from "../components/serviceDetail/ReviewsSection";
import FAQSection from "../components/serviceDetail/FAQSection";
import BookingCard from "../components/serviceDetail/BookingCard";
import SEO from "../components/SEO";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const findInitialService = (targetId) => {
    if (!targetId) return null;
    const tid = String(targetId).toLowerCase();
    return (
      mockServices.find(
        (s) =>
          String(s.id) === tid ||
          String(s._id) === tid ||
          s.slug?.toLowerCase() === tid ||
          s.name?.toLowerCase() === tid ||
          s.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === tid
      ) || null
    );
  };

  const initialService = findInitialService(id);
  const [service, setService] = useState(initialService);
  const [loading, setLoading] = useState(!initialService);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [categoryComingSoon, setCategoryComingSoon] = useState(false);
  const [selectedPkgForModal, setSelectedPkgForModal] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState("packages");

  // Fetch real-time service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!service) setLoading(true);
        setError(null);

        const { data } = await api.get(`/services/${id}`);

        if (data) {
          setService(data);
        }

        setCategoryComingSoon(false);
        if (data?.category) {
          try {
            const { data: cat } = await api.get(`/categories/${data.category}`);
            setCategoryComingSoon(!!cat?.comingSoon);
          } catch {
            // non-fatal
          }
        }
      } catch (err) {
        console.warn("Backend failed, checking mock data");
        const match = findInitialService(id);
        if (match) {
          setService(match);
        } else if (!service) {
          setError(err.response?.data?.message || "Service not found");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Escape key & background scroll lock for detail modal
  useEffect(() => {
    if (!selectedPkgForModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedPkgForModal(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedPkgForModal]);

  const handleScrollTo = (elementId, tabKey) => {
    setActiveNavTab(tabKey);
    const el = document.getElementById(elementId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleBookNow = (targetPkg) => {
    const pkgToBook = targetPkg || service.packages?.[selectedPkg];
    const serviceId = service.slug || service._id || service.id || id;
    const price = pkgToBook?.price || service.startingPrice || 349;
    const params = new URLSearchParams({
      name: service.name,
      package: pkgToBook?.title ?? "",
      price: price.toString(),
    });
    navigate(`/booking/${serviceId}?${params.toString()}`);
  };

  if (loading)
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 min-h-screen bg-white"
      >
        <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">
          Loading service details…
        </span>
      </div>
    );

  if (error || !service)
    return (
      <div className="text-center py-40 text-xl font-bold px-4 bg-white text-slate-800 min-h-screen">
        {error || "Service not found"}
      </div>
    );

  // Coming Soon mode
  if (categoryComingSoon)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
        <span className="text-6xl mb-3">⏳</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 m-0 mb-3">
          Coming Soon
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md m-0 mb-8">
          {service.name} is launching soon on TiptoBook. Booking will open shortly!
        </p>
        <Link
          to="/"
          className="no-underline px-8 py-3 rounded-full text-sm font-bold bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    );

  const allImages = [
    service.bannerImage,
    service.thumbnail,
    ...(service.gallery ?? []),
  ].filter(Boolean);

  const pkg = service.packages?.[selectedPkg];
  const isRental = service.serviceMode === "RENTAL";
  const activePkgPrice = pkg?.price || service.startingPrice || 349;

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 sm:pb-28 overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <SEO
        title={`${service.name} in Patna & Bihar — Book Online | TiptoBook`}
        description={
          service.shortDescription ||
          service.description ||
          `Book verified ${service.name} professionals in India with TiptoBook. Upfront pricing, vetted experts, and instant booking.`
        }
        canonical={`https://www.tiptobook.com/service/${service.slug || service._id || service.id || id}`}
        keywords={`${service.name}, book ${service.name} online, ${service.name} in Patna, ${service.name} Bihar, local service providers, TiptoBook`}
      />

      {/* ── Modern Urban Company style Header & Media Showcase ── */}
      <HeroBanner
        service={service}
        allImages={allImages}
        activeImg={activeImg}
        setActiveImg={setActiveImg}
      />

      {/* ── Main Container ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 mt-6 sm:mt-8">
        {/* ── Sticky Section Navigation Bar matching AC Category Page ── */}
        <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md py-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar mb-8">
          <button
            type="button"
            onClick={() => handleScrollTo("packages-section", "packages")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeNavTab === "packages"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isRental ? "Vehicles & Rates" : "Packages & Pricing"}
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo("about-section", "about")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeNavTab === "about"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            About & Features
          </button>

          {!isRental && service.providers?.length > 0 && (
            <button
              type="button"
              onClick={() => handleScrollTo("providers-section", "providers")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeNavTab === "providers"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Verified Pros
            </button>
          )}

          {service.reviews?.length > 0 && (
            <button
              type="button"
              onClick={() => handleScrollTo("reviews-section", "reviews")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeNavTab === "reviews"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Reviews ({service.reviews.length})
            </button>
          )}

          {service.faqs?.length > 0 && (
            <button
              type="button"
              onClick={() => handleScrollTo("faq-section", "faqs")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeNavTab === "faqs"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              FAQs
            </button>
          )}
        </div>

        {/* ── Two Column Layout (Left: Content, Right: Modern Sticky Booking Card) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* ── Left Column: Packages, About, Assurance, Reviews, FAQs ── */}
          <div className="lg:col-span-2 flex flex-col gap-10 sm:gap-12">
            {/* Packages Section */}
            <PackagesSection
              packages={service.packages}
              selectedPkg={selectedPkg}
              setSelectedPkg={setSelectedPkg}
              isRental={isRental}
              service={service}
              onShowMore={(pkg) => setSelectedPkgForModal(pkg)}
            />

            {/* TiptoBook Assurance Banner */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-purple-50/80 border border-purple-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                <Sparkles size={16} className="text-purple-600" />
                <span>TiptoBook Doorstep Assurance</span>
              </div>
              <p className="text-xs sm:text-sm text-purple-800/90 leading-relaxed m-0">
                Background-verified service technicians • 30-day post-service warranty • Standardized pricing with zero surprise charges.
              </p>
            </div>

            {/* About Section */}
            <AboutSection service={service} />

            {/* Providers Section (if available & not rental) */}
            {!isRental && (
              <ProvidersSection providers={service.providers} />
            )}

            {/* Reviews Section */}
            <ReviewsSection
              reviews={service.reviews}
              totalReviews={service.totalReviews}
            />

            {/* FAQs Section */}
            <FAQSection
              faqs={service.faqs}
              openFaq={openFaq}
              setOpenFaq={setOpenFaq}
            />
          </div>

          {/* ── Right Column: Desktop Sticky Booking Card ── */}
          <div className="lg:col-span-1 hidden lg:block">
            <BookingCard service={service} pkg={pkg} />
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Booking Action Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            {pkg?.title || service.name}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-slate-900">
              ₹{activePkgPrice.toLocaleString("en-IN")}
            </span>
            {service.priceUnit && !isRental && (
              <span className="text-[10px] text-slate-500 font-normal">
                /{service.priceUnit}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleBookNow()}
          className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-0"
        >
          <span>Book Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ── Detail Drawer / Modal for "Show More >" matching AC Category Page ── */}
      <AnimatePresence>
        {selectedPkgForModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPkgForModal(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22 }}
              className="relative z-10 bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    {selectedPkgForModal.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">
                      {service.rating || 4.8}
                    </span>
                    <span>
                      ({(service.totalReviews || 2890).toLocaleString("en-IN")} reviews)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPkgForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 border-0 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700">
                {/* Image */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={
                      selectedPkgForModal.image ||
                      service.bannerImage ||
                      service.thumbnail
                    }
                    alt={selectedPkgForModal.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* About Service / Package */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                    About this package
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                    {service.fullDescription || service.shortDescription}
                  </p>
                </div>

                {/* Included Features */}
                {selectedPkgForModal.features && selectedPkgForModal.features.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                      What is included
                    </h4>
                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                      <ul className="m-0 p-0 list-none space-y-2 text-xs text-slate-700">
                        {selectedPkgForModal.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-medium">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Key Benefits / Assurance */}
                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 space-y-1 text-xs text-purple-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>TiptoBook Doorstep Guarantee</span>
                  </div>
                  <p className="m-0 leading-relaxed text-purple-800/90">
                    Verified professionals • 30-day post-service warranty • Standardized pricing with zero surprise charges.
                  </p>
                </div>

                {/* FAQs inside modal */}
                {service.faqs && service.faqs.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-2">
                      {service.faqs.slice(0, 2).map((faq, idx) => (
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

              {/* Modal Footer with BOOK button */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Package Price
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    ₹{(selectedPkgForModal.price || service.startingPrice || 349).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const chosen = selectedPkgForModal;
                    setSelectedPkgForModal(null);
                    handleBookNow(chosen);
                  }}
                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Book Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetail;