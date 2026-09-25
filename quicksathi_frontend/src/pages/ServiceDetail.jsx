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
import SEO from "../components/SEO";

const ServiceDetail = () => {
  const { id } = useParams();
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

  const isNumericId = !isNaN(id) && !isNaN(parseInt(id));

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!service) setLoading(true);
        setError(null);

        const { data } = await api.get(`/services/${id}`);

        if (data) {
          setService(data);
        }

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

        const match = findInitialService(id);

        if (match) {
          setService(match);
        } else if (!service) {
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
          {service.name} is launching soon on TiptoBook. Booking will open
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
    <div
      className="min-h-screen pb-16 sm:pb-24"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <SEO
        title={`${service.name} — Book Online | TiptoBook`}
        description={service.shortDescription || service.description || `Book verified ${service.name} professionals in India with TiptoBook. Upfront pricing, vetted experts, and instant booking.`}
        canonical={`https://www.tiptobook.com/service/${service.slug || service._id || service.id || id}`}
        keywords={`${service.name}, book ${service.name} online, ${service.name} in Patna, ${service.name} Bihar, local service providers, TiptoBook`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": service.name,
          "serviceType": service.name,
          "description": service.shortDescription || service.description,
          "provider": {
            "@type": "Organization",
            "name": "TiptoBook",
            "url": "https://www.tiptobook.com"
          },
          "areaServed": [
            { "@type": "City", "name": "Patna" },
            { "@type": "AdministrativeArea", "name": "Bihar" },
            { "@type": "Country", "name": "India" }
          ]
        }}
      />
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
    </div>
  );
};

export default ServiceDetail;