import { motion } from "framer-motion";
import {
  BadgeCheck,
  IndianRupee,
  ShieldCheck,
  Zap,
  MapPin,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified Professionals",
    desc: "Every provider passes strict identity, skill, and background checks before going live on QuickSathi.",
    color: "#0284c7",
    bg: "rgba(2,132,199,0.08)",
  },
  {
    icon: IndianRupee,
    title: "Transparent Pricing",
    desc: "See the exact price before you book — no hidden charges, no last-minute surprises, ever.",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.08)",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Pay safely via UPI, cards, or cash with instant confirmation and fully protected checkout.",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
  },
  {
    icon: Zap,
    title: "Fast Booking",
    desc: "Book any service in under a minute — pick a package, choose your date & time, done.",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
  },
  {
    icon: MapPin,
    title: "Doorstep Service",
    desc: "Professionals come to you — home, office, or event venue — anywhere in your city.",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.08)",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Real humans on chat and call — before and after every booking, whenever you need help.",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.08)",
  },
];

const STATS = [
  { value: "7+", label: "Service Categories" },
  { value: "100%", label: "Verified Providers" },
  { value: "24/7", label: "Customer Support" },
  { value: "4.8★", label: "Average Rating" },
];

/**
 * WhyChooseUs — home-page section explaining what QuickSathi does,
 * and the key reasons users should choose the platform.
 */
const WhyChooseUs = () => {
  return (
    <section
      className="relative px-4 sm:px-8 lg:px-16 py-16 sm:py-20 overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-soft)" }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full filter blur-[130px] opacity-15 pointer-events-none"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Header ── */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-primary)",
              backgroundColor: "rgba(11,79,216,0.08)",
              border: "1px solid rgba(11,79,216,0.2)",
            }}
          >
            What We Do
          </span>

          <h2
            className="font-normal leading-tight m-0 mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(26px, 4vw, 42px)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.02em",
            }}
          >
            Discover What We Offer &{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-primary)" }}>
              Why Users Choose Us
            </span>
          </h2>

          <p
            className="text-sm sm:text-base leading-relaxed m-0"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            QuickSathi is your one platform for everything local — wedding
            services, car rentals, CCTV security, home tuition, house help,
            salon at home, and repairs. We vet every professional, show honest
            prices upfront, and deliver trusted services right to your doorstep.
          </p>
        </motion.div>

        {/* ── Feature cards ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <motion.div
              key={title}
              className="flex flex-col gap-3 p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
              variants={{
                hidden: { y: 28, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.boxShadow = `0 12px 32px ${bg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bg }}
              >
                <Icon size={22} strokeWidth={1.9} style={{ color }} />
              </div>

              <h3
                className="text-base sm:text-lg font-semibold m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                }}
              >
                {title}
              </h3>

              <p
                className="text-xs sm:text-sm leading-relaxed m-0"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mt-10 sm:mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="text-center px-3 py-5 rounded-2xl border"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
              }}
            >
              <p
                className="text-2xl sm:text-3xl font-bold m-0 mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-primary)",
                }}
              >
                {value}
              </p>
              <p
                className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest m-0"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          className="text-center mt-10 sm:mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              boxShadow: "0 4px 18px rgba(11,79,216,0.3)",
            }}
          >
            Explore All Services
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
