import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { mockServices } from "../data/mockServices";
import AboutSection from "../components/serviceDetail/AboutSection";
import SectionHeader from "../components/serviceDetail/SectionHeader";
import HeroBanner from "../components/serviceDetail/HeroBanner";
import PackagesSection from "../components/serviceDetail/PackagesSection";
import ProvidersSection from "../components/serviceDetail/ProvidersSection";
import ReviewsSection from "../components/serviceDetail/ReviewsSection";
import FAQSection from "../components/serviceDetail/FAQSection";
import BookingCard from "../components/serviceDetail/BookingCard";

import AnimatedSection from "../components/common/AnimatedSection";

const ServiceDetail = () => {
  const { id } = useParams();
  const { data: services, loading } = useFetch(mockServices);
  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(0);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />
        <span
          className="text-sm italic"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
          }}
        >
          Loading service…
        </span>
      </div>
    );

  const service = services?.find((s) => s.id === parseInt(id));

  if (!service)
    return (
      <div
        className="text-center py-40 text-2xl px-4"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-dark)",
        }}
      >
        Service not found
      </div>
    );

  const allImages = [service.bannerImage, ...(service.gallery ?? [])];
  const pkg = service.packages?.[selectedPkg];

  return (
    <div
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

            {/* Packages */}
            <AnimatedSection delay={0.1}>
              <PackagesSection
                packages={service.packages}
                selectedPkg={selectedPkg}
                setSelectedPkg={setSelectedPkg}
              />
            </AnimatedSection>

            {/* Providers */}
            <AnimatedSection delay={0.2}>
              <ProvidersSection providers={service.providers} />
            </AnimatedSection>

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

/* ── Reusable section header ── */
<SectionHeader />;

export default ServiceDetail;