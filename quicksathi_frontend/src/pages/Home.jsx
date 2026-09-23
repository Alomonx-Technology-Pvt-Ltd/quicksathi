import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Gem, CreditCard } from "lucide-react";
import api, { getCached } from "../config/api";

import Hero from "../components/Hero";
import { Link, useNavigate } from "react-router-dom";
import { mockCategories } from "../data/mockCategories";
import { mockServices } from "../data/mockServices";

import { useLocation } from "../context/LocationContext";

import AllCategoriesSection from "../components/AllCategoriesSection";
import HomeFeaturedServices from "../components/HomeFeaturedServices";
import WhyChooseUs from "../components/WhyChooseUs";
import DownloadAppSection from "../components/DownloadAppSection";
import SEO from "../components/SEO";

const Home = () => {
  const navigate = useNavigate();
  const { city } = useLocation();

  // ── Instant render: start with mock data so the page is visible immediately.
  // API data silently hydrates the UI in the background once the server warms up.
  const [categories, setCategories] = useState(() =>
    mockCategories.map(cat => ({
      ...cat,
      id: cat.id || cat._id,
      _id: cat._id || cat.id,
      subCategories: cat.subCategories?.map(sub => ({
        ...sub,
        id: sub.id || sub._id,
        _id: sub._id || sub.id,
      })),
    }))
  );
  const [services, setServices] = useState(() =>
    mockServices.map(srv => ({ ...srv, id: srv.id || srv._id, _id: srv._id || srv.id }))
  );

  // Background fetch — no loading spinner, silently upgrades mock → real data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cached = getCached("/categories");
        if (cached && cached.length > 0) {
          setCategories(cached.map(cat => ({
            ...cat,
            id: cat.id || cat._id,
            _id: cat._id || cat.id,
            subCategories: cat.subCategories?.map(sub => ({
              ...sub,
              id: sub.id || sub._id,
              _id: sub._id || sub.id,
            })),
          })));
          return;
        }
        const { data } = await api.get("/categories");
        if (data && data.length > 0) {
          setCategories(data.map(cat => ({
            ...cat,
            id: cat.id || cat._id,
            _id: cat._id || cat.id,
            subCategories: cat.subCategories?.map(sub => ({
              ...sub,
              id: sub.id || sub._id,
              _id: sub._id || sub.id,
            })),
          })));
        }
      } catch (err) {
        // Keep mock data on error — already showing
        console.warn("Categories fetch failed, keeping mock data:", err?.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services — also non-blocking, already seeded with mock data above
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const cacheKey = `/services${city ? `?city=${encodeURIComponent(city)}` : ""}`;
        const cached = getCached(cacheKey);
        if (cached && cached.length > 0) {
          setServices(cached.map(srv => ({ ...srv, id: srv.id || srv._id, _id: srv._id || srv.id })));
          return;
        }
        const params = city ? `?city=${encodeURIComponent(city)}` : "";
        const { data } = await api.get(`/services${params}`);
        if (data && data.length > 0) {
          setServices(data.map(srv => ({ ...srv, id: srv.id || srv._id, _id: srv._id || srv.id })));
        }
      } catch (err) {
        console.warn("Services fetch failed, keeping mock data:", err?.message);
      }
    };
    fetchServices();
  }, [city]);

  const getServiceLink = (name, subId) => {
    const match = services?.find(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() ||
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (match) return `/service/${match.slug || match._id || match.id}`;
    return `/service/${subId}`;
  };

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
    <div className="bg-white min-h-screen">
      <SEO
        title="TiptoBook – Book Local Services Online"
        description="TiptoBook is an online service booking platform to find and book trusted local services including home services, wedding services, car rentals, tutors and more.."
        canonical="https://www.tiptobook.com/"
        keywords="online service booking platform, service booking platform in India, book services online, local service providers, local services in India, home services, wedding services, car rental services, tutors near me, house help services, service providers in Patna, services in Bihar, TiptoBook"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TiptoBook",
          "url": "https://www.tiptobook.com/",
          "description": "TiptoBook is an online service booking platform to find and book trusted local services including home services, wedding services, car rentals, tutors and more..",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.tiptobook.com/services?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Hero
        categories={categories}
        services={services}
        onBookNow={handleBookNow}
        style={{ backgroundColor: "#ffffff" }}
      />
      <AllCategoriesSection categories={categories} />
      <HomeFeaturedServices
        categories={categories}
        services={services}
        onBookNow={handleBookNow}
      />

      {/* ── What We Do / Why Choose Us ── */}
      <WhyChooseUs />

      {/* ── Become a Partner / Join Us Section ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-14 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
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
              <p className="text-[10px] uppercase font-bold tracking-wider m-0" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>Average Commission</p>
              <p className="text-2xl font-bold text-white m-0 mt-1" style={{ fontFamily: "var(--font-display)" }}>8% <span className="text-xs font-normal text-white/50">per checkout</span></p>
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
