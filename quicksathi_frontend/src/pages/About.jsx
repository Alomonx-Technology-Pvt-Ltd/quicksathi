import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  CreditCard,
  Handshake,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Award,
} from "lucide-react";
import AboutSection from "./AboutSection";
import SEO from "../components/SEO";
import aboutHeroBg from "../assets/aboutHeroBg.jpg";

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rating" },
  { value: "25K+", label: "Services Completed" },
  { value: "120+", label: "Vetted Professionals" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "100% Vetted Professionals",
    desc: "Every provider is thoroughly verified, background-checked, and monitored for quality assurance.",
  },
  {
    icon: Clock,
    title: "Instant Live Booking",
    desc: "Schedule services instantly with transparent availability and real-time confirmations.",
  },
  {
    icon: CreditCard,
    title: "Upfront & Fair Quotes",
    desc: "Clear itemized pricing packages. What you see is exactly what you pay, with no surprise surcharges.",
  },
  {
    icon: Handshake,
    title: "Locally Vetted & Vested",
    desc: "We are proudly Bihar-grown. Every booking supports local businesses and highly skilled professionals.",
  },
];


const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <SEO
        title="TiptoBook – Online Service Booking Platform in India"
        description="Find and book trusted local services with TiptoBook. Explore home services, wedding services, car rentals, tutors, house help and more in one place."
        canonical="https://www.tiptobook.com/about-us"
        keywords="online service booking platform, service booking platform in India, book services online, local service providers, local services in India, home services, wedding services, car rental services, tutors near me, house help services, service providers in Patna, services in Bihar"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About TiptoBook – Online Service Booking Platform",
          "url": "https://www.tiptobook.com/about-us",
          "description": "Find and book trusted local services with TiptoBook. Explore home services, wedding services, car rentals, tutors, house help and more in one place.",
          "mainEntity": {
            "@type": "Organization",
            "name": "TiptoBook",
            "url": "https://www.tiptobook.com",
            "sameAs": [
              "https://www.facebook.com/share/19PhRio3So/?mibextid=wwXIfr",
              "https://www.linkedin.com/company/tiptobook/",
              "https://www.instagram.com/tiptobook?stkn=MWxmYmwzc21qZ2w1Yg=="
            ]
          }
        }}
      />
      {/* ── Redesigned Hero section with custom high-res background image ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "clamp(520px, 68vh, 720px)",
          backgroundColor: "#080e1e",
        }}
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 z-0 scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url(${aboutHeroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
            filter: "brightness(0.92)",
          }}
        />

        {/* Multi-layered cinematic gradient overlays for high contrast and modern aesthetics */}
        <div
          className="absolute inset-0 z-1"
          style={{
            background:
              "linear-gradient(90deg, rgba(8, 14, 30, 0.96) 0%, rgba(8, 14, 30, 0.86) 48%, rgba(8, 14, 30, 0.45) 80%, rgba(8, 14, 30, 0.65) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-1 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8, 14, 30, 0.95) 0%, transparent 40%, rgba(8, 14, 30, 0.45) 100%)",
          }}
        />
        <div
          className="absolute -left-20 top-1/4 w-96 h-96 rounded-full pointer-events-none z-1"
          style={{
            background: "radial-gradient(circle, rgba(255, 107, 0, 0.22) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[520px]">
          
          {/* Left Hero Text Column */}
          <div className="max-w-2xl">
            <nav
              className="flex items-center gap-2 text-xs mb-5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Link
                to="/"
                className="no-underline text-white/70 hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-orange-400 font-semibold">About Us</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 backdrop-blur-md"
              style={{
                background: "rgba(255, 107, 0, 0.15)",
                border: "1px solid rgba(255, 107, 0, 0.35)",
                color: "#FF8533",
                letterSpacing: "0.06em",
              }}
            >
              <Sparkles size={13} className="text-orange-400" />
              <span>EMPOWERING HOMES & SERVICES ACROSS BIHAR</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-bold text-white leading-[1.08] m-0 mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(34px, 5.2vw, 66px)",
                letterSpacing: "-0.025em",
              }}
            >
              About TiptoBook –
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #FF944D 0%, #FF6B00 55%, #FFB703 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Online Service Booking Platform
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-200 text-base sm:text-lg leading-relaxed m-0 mb-8 max-w-xl"
              style={{ fontFamily: "var(--font-body)", opacity: 0.92 }}
            >
              Find and book trusted local services with TiptoBook. We connect customers across Patna, Bihar, and all over India with verified local service providers for home services, wedding services, car rental services, tutors near me, and house help services.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white no-underline transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  boxShadow: "0 8px 24px rgba(255,107,0,0.38)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span>Explore Services</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/provider/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white no-underline backdrop-blur-md transition-all duration-200 hover:bg-white/15 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span>Become a Partner</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Floating Trust Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="w-full lg:w-auto flex flex-col gap-3.5 max-w-sm"
          >
            {/* Trust Pill 1 */}
            <div
              className="p-4 rounded-2xl backdrop-blur-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)" }}
                >
                  <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold m-0" style={{ fontFamily: "var(--font-display)" }}>
                    100% Verified Experts
                  </h4>
                  <p className="text-slate-300 text-xs m-0 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                    Multi-step ID verification & background checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Pill 2 */}
            <div
              className="p-4 rounded-2xl backdrop-blur-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.35)" }}
                >
                  <Star size={20} className="fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold m-0" style={{ fontFamily: "var(--font-display)" }}>
                    4.9 / 5.0 Average Rating
                  </h4>
                  <p className="text-slate-300 text-xs m-0 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                    Rated across 10,000+ local customers in Bihar.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Pill 3 */}
            <div
              className="p-4 rounded-2xl backdrop-blur-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.35)" }}
                >
                  <CheckCircle2 size={20} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold m-0" style={{ fontFamily: "var(--font-display)" }}>
                    Upfront Transparent Pricing
                  </h4>
                  <p className="text-slate-300 text-xs m-0 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                    Guaranteed clear quotes. Zero hidden fees.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-0"
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-soft)",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="py-10 px-6 text-center"
            style={{
              borderRight: i < 3 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <p
              className="text-4xl font-normal m-0 mb-1"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-primary)",
              }}
            >
              {s.value}
            </p>
            <p
              className="text-sm m-0 font-medium"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <AboutSection style={{ backgroundColor: "var(--color-bg-soft)" }} />

      {/* ── Our Story ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 sm:py-28 max-w-7xl mx-auto">
        <motion.div 
          className="flex flex-col lg:flex-row gap-16 items-center"
          initial={{ y: 25, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Left Text */}
          <div className="flex-1">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "rgba(139,26,26,0.06)",
                color: "var(--color-primary)",
                borderColor: "rgba(139,26,26,0.15)",
                letterSpacing: "0.1em",
              }}
            >
              Our Story
            </span>
            <h2
              className="font-normal leading-[1.1] mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 3.5vw, 42px)",
                color: "var(--color-text-dark)",
                letterSpacing: "-0.02em",
              }}
            >
              From a simple problem, <br />
              <span style={{ opacity: 0.5 }}>to Bihar's premier portal.</span>
            </h2>
            <div
              className="text-sm sm:text-base leading-relaxed flex flex-col gap-4"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
            >
              <p>
                TiptoBook was founded with a clear realization: finding trustworthy local service providers in India is far too complicated. Whether you are searching for dependable home services, reliable car rental services, wedding services, tutors near me, or house help services, customers in Patna and across Bihar often faced inconsistent service quality, opaque pricing, and delays.
              </p>
              <p>
                As a modern online service booking platform, we built TiptoBook to put trust and transparency first. We established direct partnerships with vetted service providers in Patna and across Bihar, automated the scheduling process, and mandated upfront, itemized quotes. The result is a seamless destination to book services online with complete confidence.
              </p>
            </div>
          </div>

          {/* Right Images Collage */}
          <div className="w-full lg:w-[45%] flex gap-4 h-[380px] flex-shrink-0">
            <div className="flex-1 rounded-3xl overflow-hidden shadow-lg h-full">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                alt="TiptoBook Team Collaboration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 h-full">
              <div className="flex-1 rounded-3xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
                  alt="TiptoBook Corporate Office"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 rounded-3xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop"
                  alt="TiptoBook Event Vibe"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Our Values ── */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-20 sm:py-28"
        style={{ backgroundColor: "var(--color-bg-soft)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "rgba(139,26,26,0.06)",
                color: "var(--color-primary)",
                borderColor: "rgba(139,26,26,0.15)",
                letterSpacing: "0.1em",
              }}
            >
              Why Choose Us
            </span>
            <h2
              className="font-normal m-0"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 3.5vw, 42px)",
                color: "var(--color-text-dark)",
                letterSpacing: "-0.02em",
              }}
            >
              Our Core Principles
            </h2>
          </div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {values.map((v, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
                className="p-8 rounded-3xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                  style={{ backgroundColor: "rgba(139,26,26,0.06)", border: "1px solid rgba(139,26,26,0.10)", color: "var(--color-primary)" }}
                >
                  <v.icon size={22} strokeWidth={1.5} />
                </div>
                <h3
                  className="font-semibold text-base m-0 mb-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-xs leading-relaxed m-0"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ── Browse Categories CTA ── */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-20 sm:py-24 text-center border-t"
        style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}
      >
        <h2
          className="font-normal mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 3.5vw, 42px)",
            color: "var(--color-text-dark)",
            letterSpacing: "-0.02em",
          }}
        >
          Need a Professional Service?
        </h2>
        <p
          className="mb-8 text-base mx-auto"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
            maxWidth: "500px",
          }}
        >
          Check out our available packages, book vetted specialists in seconds, and track your bookings in real-time.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--color-text-dark)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(44,24,16,0.2)",
          }}
        >
          Explore All Services →
        </Link>
      </section>
    </motion.div>
  );
};

export default About;
