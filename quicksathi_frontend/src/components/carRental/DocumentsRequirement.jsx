import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IdCard, FileText, Wallet, UserCheck, ArrowRight } from "lucide-react";

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

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const iconVariants = {
  hidden: { 
    scale: 0.7,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
      delay: 0.1,
    },
  },
};

const DocumentRequirement = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { 
    once: true,
    amount: 0.1,
    margin: "-50px",
  });

  return (
    <section
      ref={sectionRef}
      className="relative px-4 sm:px-8 lg:px-16 py-16 sm:py-20 overflow-hidden w-full"
      style={{ backgroundColor: "var(--color-bg-soft)" }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(139,26,26,0.03)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(26,58,107,0.03)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto w-full">
        {/* ============ HEADER ============ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h2
            className="font-normal mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 42px)",
              color: "var(--color-text-dark)",
            }}
          >
            <span className="bg-gradient-to-r from-[#0b4fd8] to-[#ff6b00] bg-clip-text text-transparent">
              What You'll Need
            </span>
          </h2>
          <p
            className="text-sm sm:text-base max-w-xl mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              opacity: 0.7,
            }}
          >
            No surprises at pickup — here's everything you need to keep handy for a smooth rental experience.
          </p>
        </motion.div>

        {/* ============ FULL WIDTH BLUE CONTAINER ============ */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            background:
            "linear-gradient(135deg, #0a1628 0%, #122447 50%, #1a3a6b 100%)",
            boxShadow: "0 20px 60px -20px rgba(11, 12, 17, 0.4)",
          }}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
            <div
              className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          </div>

          {/* Grid Container - Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 sm:px-8 py-8 sm:py-10 w-full">
            {requirements.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                className="relative flex flex-col items-center text-center group w-full"
              >
                {/* Vertical Divider */}
                {index < requirements.length - 1 && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 hidden lg:block"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  />
                )}

                {/* Icon Circle - Glassmorphism */}
                <motion.div
                  variants={iconVariants}
                  whileHover={{
                    scale: 1.05,
                    rotate: 5,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    },
                  }}
                  className="flex items-center justify-center rounded-full mb-4 transition-all duration-300"
                  style={{
                    width: 64,
                    height: 64,
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px -8px rgba(0,0,0,0.1)",
                  }}
                >
                  <item.Icon 
                    size={24} 
                    strokeWidth={1.8} 
                    color="#ffffff" 
                  />
                </motion.div>

                {/* Title */}
                <motion.h4
                  className="text-white text-sm font-semibold m-0 mb-2 transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </motion.h4>

                {/* Description */}
                <motion.p
                  className="text-white/80 text-[13px] m-0 leading-relaxed max-w-xs"
                  style={{
                    fontFamily: "var(--font-body)",
                    opacity: 0.85,
                  }}
                >
                  {item.desc}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ============ FOOTER NOTE ============ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-xs mt-6 text-center"
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