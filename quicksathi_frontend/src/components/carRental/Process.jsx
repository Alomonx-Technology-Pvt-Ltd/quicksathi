import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, CalendarClock, FileCheck2, KeyRound } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: Search,
    title: "Choose Your Car",
    desc: "Browse our verified fleet and pick the car that fits your trip.",
  },
  {
    num: "02",
    Icon: CalendarClock,
    title: "Select Dates & Location",
    desc: "Pick your rental duration, pickup point, and self-drive or with-driver option.",
  },
  {
    num: "03",
    Icon: FileCheck2,
    title: "Verify Documents",
    desc: "Upload your license and ID for a quick, one-time verification.",
  },
  {
    num: "04",
    Icon: KeyRound,
    title: "Get your car delivered or picked up — you're ready to go.",
    desc: "Collect your car at the scheduled time and hit the road.",
  },
];

// Animation Variants - Bottom to Top
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

const stepVariants = {
  hidden: { 
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Process = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { 
    once: true,
    amount: 0.1,
    margin: "-50px",
  });

  return (
    <section
      ref={sectionRef}
      className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-12 sm:mb-14">
          <h2
            className="font-normal mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3vw, 36px)",
              color: "var(--color-text-dark)",
            }}
          >
            How It Works
          </h2>
          <p
            className="text-sm sm:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
            }}
          >
            Renting a car takes just a few minutes, start to finish.
          </p>
        </div>

        {/* Steps with Bottom to Top Animation */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div
                className="relative flex items-center justify-center rounded-2xl mb-5"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: "rgba(26,58,107,0.08)",
                }}
              >
                <step.Icon size={22} strokeWidth={1.8} color="#1a3a6b" />
                <span
                  className="absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#1a3a6b",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {step.num.replace("0", "")}
                </span>
              </div>

              {/* Title */}
              <h4
                className="m-0 mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--color-text-dark)",
                }}
              >
                {step.title}
              </h4>

              {/* Description */}
              <p
                className="m-0 text-sm leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                  maxWidth: "220px",
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Process;