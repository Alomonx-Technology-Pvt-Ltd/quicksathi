import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CARDS_DATA = [
  {
    id: 1,
    titleLines: ["VERIFIED &", "TRUSTED EXPERTS", "AT YOUR DOOR"],
    description:
      "Every technician, helper, and driver is background-checked and skill-verified before arriving at your doorstep.",
    tag: "CCTV • Repairs • House Help",
    step: "STEP 01",
    isOrange: false,
  },
  {
    id: 2,
    titleLines: ["FIXED & HONEST", "UPFRONT PRICING", "ALWAYS"],
    description:
      "See clear prices and estimates before you book. No hidden convenience fees, no surprise charges after the job is done.",
    tag: "Car Rentals • Events • Tutors",
    step: "STEP 02",
    isOrange: false,
  },
  {
    id: 3,
    titleLines: ["QUICK 1-MINUTE", "ONLINE BOOKING", "EXPERIENCE"],
    description:
      "Pick the service you need, choose your preferred date and time, and get instant confirmation right to your phone.",
    tag: "Fast Dispatch • Real-time Updates",
    step: "STEP 03",
    isOrange: false,
  },
  {
    id: 4,
    titleLines: ["100% SATISFACTION", "& RELIABLE LOCAL", "SUPPORT"],
    description:
      "We stand behind every booking. If you ever need help or rescheduling, our friendly team is always ready to assist you.",
    tag: "Quality Guarantee • Dedicated Helpline",
    step: "STEP 04",
    isOrange: true, // Signature brand logo orange card
  },
];

const WhyChooseUs = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(4); // Default highlighted card

  return (
    <section
      className="relative w-full py-16 sm:py-20 lg:py-24 overflow-hidden select-none bg-white"
    >
      {/* ── Main Section Title & Easy Subtitle ── */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-8 mb-12 sm:mb-16 relative z-10">
        <span
          className="inline-block text-xs sm:text-sm font-bold tracking-[0.18em] uppercase mb-2.5"
          style={{ color: "#FF6B00" }}
        >
          Why Choose Us
        </span>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-slate-950 tracking-tight leading-[1.18] m-0"
          style={{ fontFamily: "var(--font-display, inherit)" }}
        >
          Why Choose TiptoBook For Your Service Needs?
        </h2>
        <p
          className="text-xs sm:text-sm md:text-base text-slate-600 mt-3.5 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-body, inherit)" }}
        >
          From CCTV installation and car rentals to wedding arrangements, home help, tuition, and repairs — we make booking verified local professionals simple, safe, and affordable.
        </p>
      </div>

      {/* ── 4 Feature / Step Cards Container ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CARDS_DATA.map((card) => {
            const isOrange = card.isOrange || activeCard === card.id;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                onClick={() => setActiveCard(card.id)}
                className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-[24px] cursor-pointer transition-colors duration-300 min-h-[270px] sm:min-h-[300px] ${
                  isOrange
                    ? "bg-[#FF6B00] text-white shadow-xl shadow-orange-500/20"
                    : "bg-white text-slate-900 border border-slate-200/80 shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-slate-300"
                }`}
              >
                {/* Top Section: Uppercase Bold Title & Friendly Service Tag */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isOrange
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3
                    className={`font-extrabold text-base sm:text-lg lg:text-[18px] tracking-tight leading-[1.25] uppercase m-0 ${
                      isOrange ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {card.titleLines.map((line, idx) => (
                      <span key={idx} className="block">
                        {line}
                      </span>
                    ))}
                  </h3>

                  <p
                    className={`mt-3 text-xs sm:text-[13px] leading-relaxed ${
                      isOrange
                        ? "text-white/90 font-medium"
                        : "text-slate-600 font-normal"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>

                {/* Bottom Step Number */}
                <div
                  className={`pt-4 mt-4 border-t flex items-center justify-between ${
                    isOrange ? "border-white/20" : "border-black/5"
                  }`}
                >
                  <span
                    className={`text-[11px] sm:text-xs font-bold tracking-widest uppercase ${
                      isOrange ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {card.step} +
                  </span>
                  {isOrange && (
                    <CheckCircle2 size={16} className="text-white" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Fully Extended Full-Width Track Design (Brand Logo Orange #FF6B00) ── */}
      <div className="relative -mt-16 sm:-mt-24 md:-mt-32 w-full pointer-events-none z-0 overflow-hidden">
        <svg
          className="w-full h-[180px] sm:h-[220px] md:h-[260px]"
          viewBox="0 0 1440 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft atmospheric glow with brand orange */}
            <filter id="roadOrangeGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing headlight beam gradient */}
            <linearGradient id="headlightBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#FED7AA" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Full-width glowing border halo in brand orange */}
          <path
            d="M -120 248 C 160 235 260 55 480 55 C 700 55 860 235 1080 235 C 1220 235 1320 155 1560 100"
            stroke="#FF6B00"
            strokeWidth="38"
            strokeOpacity="0.35"
            strokeLinecap="round"
            fill="none"
            filter="url(#roadOrangeGlow)"
          />

          {/* Primary Solid Orange Highway in brand logo color #FF6B00 */}
          <path
            d="M -120 248 C 160 235 260 55 480 55 C 700 55 860 235 1080 235 C 1220 235 1320 155 1560 100"
            stroke="#FF6B00"
            strokeWidth="28"
            strokeLinecap="round"
            fill="none"
          />

          {/* Dashed Black Center Road Line */}
          <path
            d="M -120 248 C 160 235 260 55 480 55 C 700 55 860 235 1080 235 C 1220 235 1320 155 1560 100"
            stroke="#000000"
            strokeWidth="2.5"
            strokeDasharray="9 9"
            fill="none"
          />

          {/* ── Continuous Looping Top-Down Car Moving Along Road Track ── */}
          <g>
            <animateMotion
              path="M -120 248 C 160 235 260 55 480 55 C 700 55 860 235 1080 235 C 1220 235 1320 155 1560 100"
              dur="11s"
              repeatCount="indefinite"
              rotate="auto"
              calcMode="paced"
            />
            {/* Rotate 90 deg so car front (headlights) faces forward along the track */}
            <g transform="rotate(90)">
              {/* Headlight beam illuminating the track ahead */}
              <polygon
                points="-9,-21 9,-21 34,-105 -34,-105"
                fill="url(#headlightBeamGrad)"
              />

              {/* Headlight bright glow spots */}
              <circle cx="-7" cy="-21" r="3.5" fill="#FFFFFF" opacity="0.8" />
              <circle cx="7" cy="-21" r="3.5" fill="#FFFFFF" opacity="0.8" />

              {/* Car Drop Shadow */}
              <rect
                x="-11"
                y="-21"
                width="22"
                height="42"
                rx="6"
                fill="rgba(0, 0, 0, 0.28)"
                transform="translate(2.5, 3.5)"
              />

              {/* Car Main Body */}
              <rect x="-11" y="-21" width="22" height="42" rx="6" fill="#000000" />
              <rect x="-9.5" y="-19.5" width="19" height="39" rx="4.5" fill="#1e293b" />

              {/* Front Windshield */}
              <path d="M -7 -7 L -6 -13 L 6 -13 L 7 -7 Z" fill="#94a3b8" />
              {/* Rear Windshield */}
              <path d="M -6.5 9 L -5.5 14.5 L 5.5 14.5 L 6.5 9 Z" fill="#94a3b8" />
              {/* Cabin Roof */}
              <rect x="-6" y="-6" width="12" height="14" rx="2" fill="#0f172a" />

              {/* Headlights (Warm White) */}
              <rect x="-9" y="-21" width="3.5" height="2" rx="1" fill="#FFFFFF" />
              <rect x="5.5" y="-21" width="3.5" height="2" rx="1" fill="#FFFFFF" />

              {/* Taillights & Subtle Red Glow */}
              <rect x="-9" y="19" width="3.5" height="2" rx="1" fill="#EF4444" />
              <rect x="5.5" y="19" width="3.5" height="2" rx="1" fill="#EF4444" />
              <circle cx="-7.2" cy="20" r="2.5" fill="#EF4444" opacity="0.6" />
              <circle cx="7.2" cy="20" r="2.5" fill="#EF4444" opacity="0.6" />
            </g>
          </g>
        </svg>
      </div>

      {/* ── Bottom Action Row: Clear CTA & Trust Badges ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
        {/* Pill CTA Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/services")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-orange-50/60 text-slate-950 hover:text-[#FF6B00] border border-slate-200/90 hover:border-[#FF6B00] shadow-sm font-semibold text-xs sm:text-sm cursor-pointer transition-colors duration-200"
          style={{ fontFamily: "var(--font-body, inherit)" }}
        >
          <ArrowUpRight size={16} className="text-[#FF6B00]" />
          <span>Book a Trusted Service</span>
        </motion.button>

        {/* Reassurance text */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck size={16} className="text-[#FF6B00]" />
          <span>Verified professionals • Instant quotes • Safe online booking</span>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
