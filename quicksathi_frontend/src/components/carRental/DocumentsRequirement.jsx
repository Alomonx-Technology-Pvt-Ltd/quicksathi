import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IdCard, FileText, Wallet, UserCheck } from "lucide-react";

const requirements = [
  {
    Icon: IdCard,
    title: "Valid Driving License",
    desc: "Original license required for self-drive bookings. Minimum 1 year of driving experience.",
  },
  {
    Icon: FileText,
    title: "Government ID Proof",
    desc: "Aadhaar, Passport, or Voter ID for identity verification at pickup.",
  },
  {
    Icon: Wallet,
    title: "Refundable Security Deposit",
    desc: "Held at pickup and refunded in full within 3-5 days after the car is returned.",
  },
  {
    Icon: UserCheck,
    title: "Minimum Age of 21",
    desc: "Drivers must be 21+ for economy cars and 25+ for luxury or SUV categories.",
  },
];

// Animation variants - Left to Right Cascade
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    x: -100,
    scale: 0.9,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const iconVariants = {
  hidden: { 
    scale: 0,
    rotate: -30,
    opacity: 0,
  },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 18,
      delay: 0.1,
    },
  },
};

const contentVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const footerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const progressDotVariants = {
  hidden: { 
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
};

const arrowVariants = {
  hidden: { 
    opacity: 0,
    x: -15,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const DocumentRequirement = () => {
  // Create ref for section
  const sectionRef = useRef(null);
  // Check if section is in view
  const isInView = useInView(sectionRef, { 
    once: true, 
    amount: 0.1,
    margin: "-50px",
  });

  return (
    <section
      ref={sectionRef}
      className="relative px-4 sm:px-8 lg:px-16 py-16 sm:py-20 overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-soft)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(139,26,26,0.03)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(26,58,107,0.03)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* ============ HEADER ============ */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <h2
              className="font-normal mb-2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3vw, 36px)",
                color: "var(--color-text-dark)",
              }}
            >
              What You'll Need
            </h2>
            <p
              className="text-sm sm:text-base"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              No surprises at pickup — here's everything to keep handy.
            </p>
          </div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium text-gray-600">4 items</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  variants={progressDotVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: i <= 2 ? "#1a3a6b" : "rgba(26,58,107,0.2)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ============ CARDS WITH LEFT TO RIGHT CASCADE ============ */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative"
        >
          {/* Direction arrow indicator */}
          <motion.div
            variants={arrowVariants}
            className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:block text-[#1a3a6b]/10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {requirements.map((item, index) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              }}
              className="relative rounded-2xl p-5 sm:p-6 group"
              style={{
                backgroundColor: "var(--color-bg-white)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 4px 20px -8px rgba(0,0,0,0.04)",
                transformOrigin: "center left",
              }}
            >
              {/* Card number with sliding indicator */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="absolute top-3 left-3 flex items-center gap-2"
              >
                <span
                  className="text-[8px] font-bold uppercase tracking-wider"
                  style={{
                    color: "rgba(26,58,107,0.15)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  0{index + 1}
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="w-3 h-px"
                  style={{ backgroundColor: "rgba(26,58,107,0.1)" }}
                />
              </motion.div>

              {/* Icon - pops out */}
              <motion.div
                variants={iconVariants}
                className="flex items-center justify-center rounded-xl mb-4 mt-2"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(26,58,107,0.06)",
                  border: "1px solid rgba(26,58,107,0.06)",
                }}
              >
                <item.Icon size={20} strokeWidth={1.8} color="#1a3a6b" />
              </motion.div>

              {/* Content - slides up */}
              <motion.div variants={contentVariants}>
                <h4
                  className="m-0 mb-2 text-sm font-semibold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  {item.title}
                </h4>

                <p
                  className="m-0 text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                    opacity: 0.8,
                  }}
                >
                  {item.desc}
                </p>
              </motion.div>

              {/* Progress bar - fills from left to right */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                className="mt-4 h-0.5 rounded-full overflow-hidden"
                style={{ 
                  backgroundColor: "rgba(26,58,107,0.06)",
                  transformOrigin: "left",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${((index + 1) / requirements.length) * 100}%` } : { width: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: "#1a3a6b",
                    opacity: 0.3,
                  }}
                />
              </motion.div>

              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, rgba(26,58,107,0.04), transparent 70%)`,
                }}
              />

              {/* Arrow indicator for next card */}
              {index < requirements.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block text-gray-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ============ FOOTER ============ */}
        <motion.p
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={footerVariants}
          className="text-xs mt-6 text-center sm:text-left"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
          }}
        >
          For with-driver bookings, only ID proof and security deposit are required — no license needed.
        </motion.p>
      </div>
    </section>
  );
};

export default DocumentRequirement;