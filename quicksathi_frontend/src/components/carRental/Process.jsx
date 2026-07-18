import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Handshake, Car, ArrowRight } from "lucide-react";
import heroBg from "../../assets/audiImg.avif";


const PRIMARY = "#111111";
const SECONDARY = "#6B7280";
const BORDER = "#E7E7E7";
const BG_LIGHT = "#F5F5F3";
const CARD_BG = "#FFFFFF";
const ACCENT_BLUE = "#2553FF";
const ACCENT_BLUE_HOVER = "#1D4ED8";
const ICON_BG = "#F3F4F6";

// Typography
const FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ---------- Animation Variants ----------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const heroFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardHover = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stops = [
  {
    id: "01",
    Icon: Car,
    title: "Browse Our Fleet",
    desc: "Choose from a curated selection of premium vehicles.",
    cta: true,
  },
  {
    id: "02",
    Icon: MapPin,
    title: "Select Location",
    desc: "Pick up from 50+ convenient locations across the city.",
  },
  {
    id: "03",
    Icon: Handshake,
    title: "Choose Your Deal",
    desc: "Transparent pricing with no hidden fees or surprises.",
  },
  {
    id: "04",
    Icon: Car,
    title: "Reserve Your Car",
    desc: "Instant confirmation and doorstep delivery available.",
  },
];

const Process = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1, margin: "-50px" });

  return (
    <section
      ref={sectionRef}
      className="relative px-4 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24"
      style={{ backgroundColor: BG_LIGHT, fontFamily: FONT_FAMILY }}
    >
      <div className="relative max-w-6xl mx-auto">
        {/* ============ HERO SECTION ============ */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={heroFade}
          className="relative rounded-2xl overflow-hidden z-10 h-[420px] sm:h-[480px] lg:h-[520px]"
        >
          {/* Hero Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url(${heroBg})` }}
          >
            {/* Minimal overlay - let the image breathe */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)" }} />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col items-start justify-center px-8 sm:px-12 lg:px-16 z-20">
            <motion.h1
              variants={fadeUp}
              className="text-white font-bold m-0 leading-[1.08] max-w-xl text-left"
              style={{ 
                fontSize: "clamp(38px, 5vw, 48px)", 
                fontWeight: 700, 
                letterSpacing: "-0.025em" ,
                fontFamily: "var(--font-display)"
              }}
            >
             Drive the City.
              <br />
             Your Way.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base max-w-md mt-4 mb-8 text-left leading-relaxed"
              style={{ 
                fontFamily: "var(--font-body)", 
                fontWeight: 400, 
                color: "rgba(255,255,255,0.75)" 
              }}
            >
              Premium vehicles, transparent pricing, and doorstep delivery.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                to="#"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg cursor-pointer"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: ACCENT_BLUE,
                  boxShadow: "0 2px 8px rgba(37,83,255,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = ACCENT_BLUE_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ACCENT_BLUE;
                }}
              >
                Rent Now
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ============ PROCESS CARDS ============ */}
      <motion.div
  initial="hidden"
  animate={isInView ? "visible" : "hidden"}
  variants={containerStagger}
  className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 lg:mt-12"
>
  {stops.map((stop, index) => {
    const isFirst = stop.id === "01";
    return (
      <motion.div
        key={stop.id}
        variants={cardHover}
        whileHover={{ 
          y: -6, 
          transition: { duration: 0.25, ease: "easeOut" } 
        }}
        className="group relative rounded-[18px] p-[42px] flex flex-col items-start text-left transition-all duration-250"
        style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${isFirst ? '#2553FF' : '#ECECEC'}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          minHeight: "260px",
        }}
      >
        {/* Premium accent line for first card */}
        {isFirst && (
          <div
            className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
            style={{ backgroundColor: ACCENT_BLUE }}
          />
        )}

        {/* Step Number - Elegant & Minimal */}
        <span
          className="text-[12px] font-medium tracking-[0.2em] mb-5"
          style={{ 
            fontFamily: FONT_FAMILY,
            color: "#A0A0A0",
            letterSpacing: "0.2em",
          }}
        >
          {stop.id}
        </span>

        {/* Icon Container - Premium circular background */}
        <div
          className="flex items-center justify-center rounded-full mb-5 transition-all duration-250"
          style={{ 
            width: 56, 
            height: 56, 
            backgroundColor: ICON_BG,
            color: ACCENT_BLUE,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ACCENT_BLUE;
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = ICON_BG;
            e.currentTarget.style.color = ACCENT_BLUE;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <stop.Icon size={22} strokeWidth={1.5} />
        </div>

        {/* Title - Premium typography */}
        <h3
          className="text-[18px] font-bold m-0 mb-2 leading-snug"
          style={{ 
            fontFamily: "var(--font-display)",
            color: PRIMARY,
            letterSpacing: "-0.02em",
            lineHeight: "1.3",
          }}
        >
          {stop.title}
        </h3>

        {/* Description - Clean & readable */}
        <p 
          className="text-[14px] m-0 leading-relaxed"
          style={{ 
            fontFamily: "var(--font-body)",
            color: SECONDARY,
            lineHeight: "1.6",
          }}
        >
          {stop.desc}
        </p>

      
       

        {/* Subtle hover border effect */}
        <div
          className="absolute inset-0 rounded-[18px] transition-all duration-250 pointer-events-none"
          style={{
            border: `1px solid transparent`,
          }}
        />
      </motion.div>
    );
  })}
</motion.div>

        {/* Subtle decorative line */}
        <div 
          className="w-full h-px mt-12 lg:mt-16"
          style={{ backgroundColor: BORDER }}
        />
      </div>
    </section>
  );
};

export default Process;