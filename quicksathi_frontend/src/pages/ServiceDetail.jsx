import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";
import { mockServices } from "../data/mockServices";
import AboutSection from "../components/serviceDetail/AboutSection";
import HeroBanner from "../components/serviceDetail/HeroBanner";
import PackagesSection from "../components/serviceDetail/PackagesSection";
import ProvidersSection from "../components/serviceDetail/ProvidersSection";
import ReviewsSection from "../components/serviceDetail/ReviewsSection";
import FAQSection from "../components/serviceDetail/FAQSection";
import BookingCard from "../components/serviceDetail/BookingCard";
import AnimatedSection from "../components/common/AnimatedSection";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [categoryComingSoon, setCategoryComingSoon] = useState(false);

  const isNumericId = !isNaN(id) && !isNaN(parseInt(id));

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get(`/services/${id}`);

        setService(data);

        // Check if the service's category is in "Coming Soon" mode —
        // if so, booking is blocked on this page.
        setCategoryComingSoon(false);
        if (data?.category) {
          try {
            const { data: cat } = await api.get(`/categories/${data.category}`);
            setCategoryComingSoon(!!cat?.comingSoon);
          } catch {
            // category lookup failure shouldn't break the page
          }
        }

      } catch (err) {
        console.warn("Backend failed, checking mock data");

        const match = mockServices.find(
          (s) =>
            String(s.id) === String(id) ||
            s.slug === String(id) ||
            s.name?.toLowerCase() === String(id).toLowerCase()
        );

        if (match) {
          setService(match);
        } else {
          setError(
            err.response?.data?.message ||
            "Service not found"
          );
        }

      } finally {
        setLoading(false);
      }
    };

    fetchService();

  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-sm italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
          Loading service…
        </span>
      </div>
    );

  if (error || !service)
    return (
      <div className="text-center py-40 text-2xl px-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        {error || "Service not found"}
      </div>
    );

  // ── Coming Soon mode: category is toggled off from booking ──
  if (categoryComingSoon)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <span style={{ fontSize: "56px", marginBottom: "12px" }}>⏳</span>
        <h1
          className="m-0 mb-3 font-normal"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 4vw, 44px)",
            color: "var(--color-text-dark)",
          }}
        >
          Coming Soon
        </h1>
        <p
          className="m-0 mb-8 text-sm sm:text-base max-w-md"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
        >
          {service.name} is launching soon on QuickSathi. Booking will open
          shortly — check back soon!
        </p>
        <Link
          to="/"
          className="no-underline px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--color-primary)",
            color: "#fff",
            boxShadow: "0 2px 12px rgba(11,79,216,0.25)",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    );

  const allImages = [service.bannerImage, ...(service.gallery ?? [])].filter(Boolean);
  const pkg = service.packages?.[selectedPkg];
  const isRental = service.serviceMode === "RENTAL";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-16 sm:pb-24"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero banner ── */}
      <HeroBanner
        service={service}
        allImages={allImages}
        activeImg={activeImg}
        setActiveImg={setActiveImg}
      />

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-8 sm:gap-10 lg:gap-12">
            {/* About */}
            <AnimatedSection>
              <AboutSection service={service} />
            </AnimatedSection>

            {/* Packages / Car Variations */}
            <AnimatedSection delay={0.1}>
              <PackagesSection
                packages={service.packages}
                selectedPkg={selectedPkg}
                setSelectedPkg={setSelectedPkg}
                isRental={isRental}
              />
            </AnimatedSection>

            {/* Providers — hidden for rental services (cars are randomly
                assigned from the fleet, so individual providers aren't shown) */}
            {!isRental && (
              <AnimatedSection delay={0.2}>
                <ProvidersSection providers={service.providers} />
              </AnimatedSection>
            )}

            {/* Reviews */}
            <AnimatedSection delay={0.3}>
              <ReviewsSection
                reviews={service.reviews}
                totalReviews={service.totalReviews}
              />
            </AnimatedSection>

            {/* FAQs */}
            <AnimatedSection delay={0.4}>
              <FAQSection
                faqs={service.faqs}
                openFaq={openFaq}
                setOpenFaq={setOpenFaq}
              />
            </AnimatedSection>
          </div>

          {/* ── Right: sticky booking card (static on mobile, sticky on desktop) ── */}
          <div className="lg:col-span-1">
            <BookingCard service={service} pkg={pkg} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceDetail;