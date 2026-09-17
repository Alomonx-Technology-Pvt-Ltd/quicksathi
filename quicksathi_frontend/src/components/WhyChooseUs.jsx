import { motion } from "framer-motion";
import {
  ShieldCheck,
  BadgeCheck,
  Zap,
  IndianRupee,
  Headphones,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * WhyChooseUs — Reimagined Bento-Grid Showcase
 * Modern, compact, high-converting trust architecture for TiptoBook
 */
const WhyChooseUs = () => {
  return (
    <section
      className="relative px-4 sm:px-8 lg:px-16 py-14 sm:py-20 overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-soft)" }}
    >
      {/* Ambient background glows */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full filter blur-[140px] opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #0b4fd8 0%, #ff6b00 100%)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Compact & Impactful Header ── */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3.5 border shadow-sm"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-primary)",
              backgroundColor: "rgba(11, 79, 216, 0.08)",
              borderColor: "rgba(11, 79, 216, 0.2)",
            }}
          >
            <Sparkles size={13} className="text-blue-600" />
            <span className="tracking-wide uppercase text-[10px] sm:text-xs">The TiptoBook Standard</span>
          </div>

          <h2
            className="font-normal leading-[1.15] m-0 mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(26px, 3.8vw, 42px)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.02em",
            }}
          >
            Built for Convenience.{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-primary)" }}>
              Engineered for Trust.
            </span>
          </h2>

          <p
            className="text-xs sm:text-sm md:text-base leading-relaxed m-0 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            Every service is backed by rigorous vetting, upfront transparent pricing, and direct doorstep accountability.
          </p>
        </motion.div>

        {/* ── Asymmetric Bento Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Bento Item 1: Spotlight Card (Spans 2 columns on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 relative rounded-3xl p-6 sm:p-8 overflow-hidden flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:border-blue-500/30 group"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Soft decorative gradient pill */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: "rgba(11, 79, 216, 0.1)", color: "#0b4fd8" }}
                >
                  <BadgeCheck size={26} strokeWidth={2} />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Top 1% Acceptance Rate
                </span>
              </div>

              <h3
                className="text-lg sm:text-2xl font-semibold m-0 mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                100% Background-Checked Professionals
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed m-0 text-slate-600 max-w-xl"
                style={{ fontFamily: "var(--font-body)" }}
              >
                We don't allow just anyone to list. Every service provider completes strict government ID verification, criminal background checks, and an in-person skill assessment before taking jobs.
              </p>
            </div>

            {/* Visual Micro-Badge Ribbon inside Spotlight Card */}
            <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                  <CheckCircle2 size={13} className="text-blue-600" /> Government ID Verified
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Skill Audited
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                  <CheckCircle2 size={13} className="text-amber-600" /> Police Clearance
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span className="text-slate-800">4.89 / 5.0</span>
                <span className="text-slate-400 font-normal">(Verified Client Reviews)</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 2: Upfront & Honest Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:border-emerald-500/30 group"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                style={{ backgroundColor: "rgba(22, 163, 74, 0.1)", color: "#16a34a" }}
              >
                <IndianRupee size={24} strokeWidth={2} />
              </div>

              <h3
                className="text-base sm:text-xl font-semibold m-0 mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Transparent & Upfront Pricing
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed m-0 text-slate-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                See clear estimates and exact rate cards before booking. Zero hidden convenience fees, zero unexpected surprises at your door.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/50">
                Guaranteed Quotes
              </span>
              <span className="text-[11px] text-slate-400">Digital Invoices</span>
            </div>
          </motion.div>

          {/* Bento Item 3: Fast 60-Second Booking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:border-amber-500/30 group"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                style={{ backgroundColor: "rgba(217, 119, 6, 0.1)", color: "#d97706" }}
              >
                <Zap size={24} strokeWidth={2} />
              </div>

              <h3
                className="text-base sm:text-xl font-semibold m-0 mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Fast 60-Second Booking
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed m-0 text-slate-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Pick your preferred service, select date & time, and get matched with an available nearby expert instantly.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                Instant Confirmation
              </span>
              <span className="text-[11px] text-slate-400">Real-Time Dispatch</span>
            </div>
          </motion.div>

          {/* Bento Item 4: Escrow-Safe Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:border-purple-500/30 group"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                style={{ backgroundColor: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}
              >
                <Lock size={24} strokeWidth={2} />
              </div>

              <h3
                className="text-base sm:text-xl font-semibold m-0 mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                100% Protected Checkout
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed m-0 text-slate-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Pay safely with UPI, cards, net banking, or choose Pay After Service. Your money is protected under the TiptoBook guarantee.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/50">
                256-Bit SSL Encrypted
              </span>
              <span className="text-[11px] text-slate-400">Pay Post-Service</span>
            </div>
          </motion.div>

          {/* Bento Item 5: 24/7 Human Concierge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:border-cyan-500/30 group"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                style={{ backgroundColor: "rgba(8, 145, 178, 0.1)", color: "#0891b2" }}
              >
                <Headphones size={24} strokeWidth={2} />
              </div>

              <h3
                className="text-base sm:text-xl font-semibold m-0 mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                24/7 Live Support
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed m-0 text-slate-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Need to reschedule, modify requirements, or have questions? Our human concierge team is available round the clock on call and chat.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200/50">
                &lt; 2 Min Response
              </span>
              <span className="text-[11px] text-slate-400">Call &amp; In-App Chat</span>
            </div>
          </motion.div>
        </div>

        {/* ── Sleek Integrated Trust Strip (Replaces clunky white boxes) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-10 rounded-2xl border p-4 sm:p-6 bg-white/80 backdrop-blur-md shadow-sm"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="text-center pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 m-0" style={{ fontFamily: "var(--font-display)" }}>
                500<span className="text-blue-600">+</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider m-0 mt-0.5">
                Vetted Professionals
              </p>
            </div>

            <div className="text-center pt-2 md:pt-0 md:pl-4">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 m-0" style={{ fontFamily: "var(--font-display)" }}>
                15,000<span className="text-emerald-600">+</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider m-0 mt-0.5">
                Happy Bookings
              </p>
            </div>

            <div className="text-center pt-2 md:pt-0 md:pl-4">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 m-0" style={{ fontFamily: "var(--font-display)" }}>
                4.9 <span className="text-amber-500 text-lg sm:text-xl">★</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider m-0 mt-0.5">
                Average Rating
              </p>
            </div>

            <div className="text-center pt-2 md:pt-0 md:pl-4">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 m-0" style={{ fontFamily: "var(--font-display)" }}>
                100<span className="text-purple-600">%</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider m-0 mt-0.5">
                Quality Guarantee
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Subdued Minimalist CTA ── */}
        <div className="text-center mt-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors no-underline group"
          >
            <span>Explore all verified services &amp; rates</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
