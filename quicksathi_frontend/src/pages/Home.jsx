import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Gem, CreditCard } from "lucide-react";
import api, { getCached } from "../config/api";
import Card from "../components/common/Card";
import Hero from "../components/Hero";
import { Link, useNavigate } from "react-router-dom";
import { mockCategories } from "../data/mockCategories";
import { mockServices } from "../data/mockServices";

import { useLocation } from "../context/LocationContext";

import QuickServicesSection from "../components/QuickServicesSection";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero
        categories={categories}
        style={{ backgroundColor: "var(--color-bg)" }}
      />
      <QuickServicesSection categories={categories} services={services} />


      <section className="px-4 sm:px-8 lg:px-16 py-12" style={{ backgroundColor: "var(--color-bg)" }}>
        {/* Section header — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-7">
          <h2
            className="text-lg sm:text-xl font-semibold uppercase tracking-[0.2em] flex-shrink-0"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-primary)",
            }}
          >
            Popular Services
          </h2>

          <div
            className="hidden sm:block h-px flex-1"
            style={{
              background: "linear-gradient(to right, rgba(11,79,216,0.35), transparent)",
            }}
          />

          <p
            className="text-xl sm:text-2xl lg:text-3xl font-normal italic flex-shrink-0"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-mid)",
              opacity: 0.95,
            }}
          >
            Discover our services and how we do it better.
          </p>
        </div>

        <motion.div
          className="flex flex-col gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          {categories?.map((parent) => {
            const featuredSub = parent.subCategories?.[0];
            if (!featuredSub) return null;

            return (
              <motion.div
                key={parent._id}
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-4">
                    <h3
                      className="text-xl font-semibold m-0"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {parent.name}
                    </h3>
                    <div
                      className="h-px w-20 sm:w-40 hidden sm:block"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), transparent)",
                      }}
                    />
                  </div>

                  <Link
                    to={`/category/${parent._id}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105 self-start sm:self-auto shadow-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-primary)",
                      color: "#fff",
                      boxShadow: "0 2px 12px rgba(11,79,216,0.25)",
                    }}
                  >
                    View All Services{" "}
                    <span style={{ fontSize: "12px" }}>→</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-6">
  {parent.subCategories?.slice(0, 1).map((service) => {
    return (
      <Card
        key={service._id || service.name}
        title={service.name}
        description={service.description}
        image={service.imageUrl}
        secondaryImage={service.secondaryImageUrl}
        primaryAction="View Details"
        secondaryAction="Book Now"
        variant="servicePreview"
        linkTo={getServiceLink(service.name, service._id || service.id)}
        onSecondaryAction={() =>
          handleBookNow(service.name, service._id || service.id)
        }
      />
    );
  })}
</div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Become a Partner / Join Us Section ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 mt-16 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div
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
              Join the QuickSathi partner network to list your elite facilities, coordinate wedding decoration packages, manage vehicle rentals, or deploy CCTV security setups. Enjoy immediate payouts and high-value client matching.
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-white/70 mb-8" style={{ fontFamily: "var(--font-body)" }}>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#ff6b00]" /> Vetted Listings</span>
              <span className="flex items-center gap-1.5"><Gem size={14} className="text-[#ff6b00]" /> Premium Clients</span>
              <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#ff6b00]" /> Fast Automated Payments</span>
            </div>

            <Link to="/provider/onboarding" className="no-underline">
              <button
                className="px-8 py-4 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  color: "#ffffff",
                  boxShadow: "0 6px 24px rgba(255,107,0,0.35)",
                }}
              >
                Become a Partner
              </button>
            </Link>
          </div>

          {/* Interactive visual metrics on the right */}
          <div className="w-full md:w-72 flex flex-col gap-4 relative z-10">
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-[10px] uppercase font-bold tracking-wider m-0" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>Average Commission</p>
              <p className="text-2xl font-bold text-white m-0 mt-1" style={{ fontFamily: "var(--font-display)" }}>8% <span className="text-xs font-normal text-white/50">per checkout</span></p>
            </div>
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-[10px] uppercase font-bold tracking-wider m-0" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>Partner Support</p>
              <p className="text-2xl font-bold text-white m-0 mt-1" style={{ fontFamily: "var(--font-display)" }}>24/7 <span className="text-xs font-normal text-white/50">VIP line access</span></p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
