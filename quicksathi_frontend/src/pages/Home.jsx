
import { motion } from "framer-motion";
import { ShieldCheck, Gem, CreditCard } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";

import Hero from "../components/Hero";
import { Link, useNavigate } from "react-router-dom";


import { useLocation } from "../context/LocationContext";

import AllCategoriesSection from "../components/AllCategoriesSection";
import CategoryBannersCarousel from "../components/CategoryBannersCarousel";
import HomeFeaturedServices from "../components/HomeFeaturedServices";
import SpotlightPromoBanners from "../components/SpotlightPromoBanners";
import WhyChooseUs from "../components/WhyChooseUs";
import DownloadAppSection from "../components/DownloadAppSection";
import SEO from "../components/SEO";

const Home = () => {
  const navigate = useNavigate();
  const { city } = useLocation();

  // Single source of truth: the API (shared with Hero / featured sections, one request each).
  const { categories, services, loading, error, retry } = useCatalog({ city });


  const handleBookNow = (name, subId) => {
    const match = services?.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    const serviceId = match ? (match._id || match.id) : subId;
    const serviceName = match ? match.name : name;

    // Find first package details, or starting price, or default to 0
    let packageTitle = "Standard";
    let price = 0;
    if (match) {
      if (match.packages && match.packages.length > 0) {
        packageTitle = match.packages[0].title;
        price = match.packages[0].price;
      } else if (match.startingPrice) {
        price = match.startingPrice;
      }
    }

    const params = new URLSearchParams({
      name: serviceName,
      package: packageTitle,
      price: price.toString(),
    });
    navigate(`/booking/${serviceId}?${params.toString()}`);
  };


  return (
    <div className="bg-white min-h-screen w-full max-w-full overflow-x-hidden">
      <SEO
        title="TiptoBook – India's Trusted Online Service Booking Platform | Home, Wedding & Rentals"
        description="Book trusted on-demand home & event services across India on TiptoBook. AC repair, pandits for puja, wedding services, car rental, home salon, and home repairs."
        canonical="https://www.tiptobook.com/"
        keywords="online service booking platform, home services in India, book services online India, pandit for puja, wedding services, AC repair India, car rental India, home salon, electrician, TiptoBook"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TiptoBook",
          "url": "https://www.tiptobook.com/",
          "description": "Book trusted on-demand home, wedding, and car rental services across India on TiptoBook at transparent prices.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.tiptobook.com/services?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {error && categories.length === 0 && services.length === 0 && !loading && (
        <div role="alert" className="mx-4 sm:mx-8 lg:mx-16 mt-24 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-4">
          <span>{error} Please check your connection.</span>
          <button onClick={retry} className="px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold border-0 cursor-pointer">Retry</button>
        </div>
      )}
      <Hero
        categories={categories}
        services={services}
        onBookNow={handleBookNow}
        style={{ backgroundColor: "#ffffff" }}
      />
      <CategoryBannersCarousel />
      <AllCategoriesSection categories={categories} />
      <HomeFeaturedServices
        categories={categories}
        services={services}
        onBookNow={handleBookNow}
      />
      <SpotlightPromoBanners />

      {/* ── What We Do / Why Choose Us ── */}
      <WhyChooseUs />

      {/* ── Become a Partner / Join Us Section ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-14 bg-white overflow-hidden w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(7, 57, 168, 0.94) 100%), url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 25px 50px -12px rgba(11,79,216,0.3)",
            border: "1px solid rgba(255,107,0,0.2)"
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full filter blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: "var(--color-accent)" }} />

          <div className="flex-1 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-[#ff6b00] bg-white/10 border border-[#ff6b00]/30 uppercase mb-4">
              Partner Program
            </span>
            <h2 className="text-3xl sm:text-4xl text-white font-normal leading-tight mb-4" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
              Expand Your Service Horizons
            </h2>
            <p className="text-sm leading-relaxed mb-6 max-w-lg" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)" }}>
              Join the TiptoBook partner network to list your elite facilities, coordinate wedding decoration packages, manage vehicle rentals, or deploy CCTV security setups. Enjoy immediate payouts and high-value client matching.
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-white/70 mb-8" style={{ fontFamily: "var(--font-body)" }}>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#ff6b00]" /> Vetted Listings</span>
              <span className="flex items-center gap-1.5"><Gem size={14} className="text-[#ff6b00]" /> Premium Clients</span>
              <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#ff6b00]" /> Fast Automated Payments</span>
            </div>

            <Link to="/provider/onboarding" className="no-underline">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  color: "#ffffff",
                  boxShadow: "0 6px 24px rgba(255,107,0,0.35)",
                }}
              >
                Become a Partner
              </motion.button>
            </Link>
          </div>

          {/* Interactive visual metrics on the right */}
          <div className="w-full md:w-72 flex flex-col gap-4 relative z-10">
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl border"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider m-0" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>Zero Joining Fee</p>
              <p className="text-2xl font-bold text-white m-0 mt-1" style={{ fontFamily: "var(--font-display)" }}>₹0 <span className="text-xs font-normal text-white/50">get started free</span></p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl border"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider m-0" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>Partner Support</p>
              <p className="text-2xl font-bold text-white m-0 mt-1" style={{ fontFamily: "var(--font-display)" }}>24/7 <span className="text-xs font-normal text-white/50">VIP line access</span></p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Download Our App Section ── */}
      <DownloadAppSection />
    </div>
  );
};

export default Home;
