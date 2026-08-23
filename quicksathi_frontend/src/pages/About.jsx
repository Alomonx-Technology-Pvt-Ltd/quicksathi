import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, CreditCard, Handshake } from "lucide-react";
import AboutSection from "./AboutSection";

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

const team = [
  {
    name: "Roushan Kumar",
    role: "Co-Founder & CEO",
    bio: "Driving tech innovation to digitize and elevate Patna's local service standards.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Anjali Sharma",
    role: "Co-Founder & COO",
    bio: "Ensuring top-tier service delivery and managing our network of trusted providers.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Vikram Aditya",
    role: "Lead Systems Architect",
    bio: "Crafting the secure, user-friendly, and blazing fast platform you experience.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
  },
];

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero section ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "360px",
          backgroundColor: "var(--color-text-dark)",
        }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521791136368-1a8b27503462?q=80&w=2070&auto=format&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 px-4 sm:px-10 lg:px-16 py-24 sm:py-28 max-w-5xl">
          <nav
            className="flex items-center gap-2 text-xs mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link
              to="/"
              className="no-underline text-white opacity-60 hover:opacity-100"
            >
              Home
            </Link>
            <span className="text-white opacity-40">/</span>
            <span className="text-white font-semibold">About Us</span>
          </nav>
          
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border uppercase tracking-widest text-white/80"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.15)",
              letterSpacing: "0.08em",
            }}
          >
            Our Mission
          </span>

          <h1
            className="font-normal text-white leading-[1.05] m-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 64px)",
              letterSpacing: "-0.02em",
            }}
          >
            Redefining Local Services. <br />
            <span style={{ opacity: 0.5 }}>Restoring Absolute Trust.</span>
          </h1>
          <p
            className="text-white mt-4 max-w-xl text-base"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.7,
              lineHeight: 1.7,
            }}
          >
            QuickSathi is on a mission to simplify local services for Patna and beyond. By combining technology with a rigorous screening process, we deliver elite security, logistics, and celebration services directly to your doorstep.
          </p>
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
                QuickSathi was founded with a clear realization: finding trustworthy local service providers in Patna is far too complicated. Sourcing a high-quality CCTV installer, hiring a reliable car rental, or finding event coordinators often leads to inconsistent service quality, opaque pricing, and delays.
              </p>
              <p>
                We built a platform that puts the client first. We established direct partnerships with vetted professionals, automated the scheduling process, and mandated upfront, flat pricing quotes. The result is a premium marketplace where you can book top-tier professionals in minutes with complete confidence.
              </p>
            </div>
          </div>

          {/* Right Images Collage */}
          <div className="w-full lg:w-[45%] flex gap-4 h-[380px] flex-shrink-0">
            <div className="flex-1 rounded-3xl overflow-hidden shadow-lg h-full">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                alt="QuickSathi Team Collaboration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 h-full">
              <div className="flex-1 rounded-3xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
                  alt="QuickSathi Corporate Office"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 rounded-3xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop"
                  alt="QuickSathi Event Vibe"
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

      {/* ── Our Team ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 sm:py-28 max-w-7xl mx-auto">
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
            Leadership
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
            The Minds Behind QuickSathi
          </h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          {team.map((t, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { scale: 0.95, opacity: 0 },
                visible: { scale: 1, opacity: 1, transition: { duration: 0.6 } }
              }}
              className="rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full"
              style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
            >
              <div style={{ height: "260px", overflow: "hidden" }}>
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h4
                  className="m-0 mb-1 font-semibold text-lg"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}
                >
                  {t.name}
                </h4>
                <p
                  className="m-0 mb-4 text-xs font-medium uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
                >
                  {t.role}
                </p>
                <p
                  className="m-0 text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
                >
                  {t.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
