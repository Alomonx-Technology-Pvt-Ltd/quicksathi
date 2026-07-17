import { motion } from "framer-motion";
import { Search, MapPinned, ShieldCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: Search,
    title: "Choose a Service",
    desc: "Browse categories like Home Services, Car Rentals, Wedding & Events, CCTV Installation, Cleaning, and more.",
  },
  {
    num: "02",
    Icon: MapPinned,
    title: "Select Date & Location",
    desc: "Pick your preferred date, time, and service location in seconds.",
  },
  {
    num: "03",
    Icon: ShieldCheck,
    title: "Get Verified Professionals",
    desc: "We connect you with trusted and verified professionals near you.",
  },
  {
    num: "04",
    Icon: CheckCircle2,
    title: "Service Delivered",
    desc: "Relax while our professionals complete the job with quality assurance.",
  },
];

const WorkProcess = () => {
  return (
    <section className="relative px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
      {/* ============ BACKGROUND DECORATIONS ============ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(139,26,26,0.05)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(139,26,26,0.04)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(139,26,26,0.02)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* ============ HEADER ============ */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(139,26,26,0.08), rgba(139,26,26,0.03))",
              border: "1px solid rgba(139,26,26,0.15)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-primary, #8B1A1A)" }}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--color-primary, #8B1A1A)", opacity: 0.85 }}
            >
              Simple Process
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.12 }}
            className="font-normal m-0 mb-4 leading-[1.1]"
            style={{
              fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
              fontSize: "clamp(28px, 4.5vw, 48px)",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--color-text-dark, #1a1a1a)" }}>How </span>
            <span
              style={{
                background: "linear-gradient(135deg, #8B1A1A, #6B1414)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              QuickSathi
            </span>
            <span style={{ color: "var(--color-text-dark, #1a1a1a)" }}> Works</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.18 }}
            className="text-sm sm:text-base leading-relaxed max-w-md mx-auto m-0"
            style={{
              fontFamily: "var(--font-body, 'Inter', sans-serif)",
              color: "var(--color-text-mid, #4a4a4a)",
              opacity: 0.8,
              lineHeight: "1.7",
            }}
          >
            Book trusted services in just four simple steps.
          </motion.p>
        </div>

        {/* ============ STEPS GRID — glass cards ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.15 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl p-6 sm:p-7"
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,0,0,0.04)",
                boxShadow: "0 16px 40px -18px rgba(0,0,0,0.10)",
              }}
            >
              {/* inner glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(circle at 20% 15%, rgba(139,26,26,0.06), transparent 60%)",
                }}
              />

              {/* large background number */}
              <span
                className="absolute top-2 right-4 font-bold select-none pointer-events-none"
                style={{
                  fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
                  fontSize: "56px",
                  lineHeight: 1,
                  color: "rgba(139,26,26,0.06)",
                }}
              >
                {step.num}
              </span>

              <div className="relative z-10">
                <div
                  className="flex items-center justify-center mb-5 rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110"
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: "rgba(139,26,26,0.06)",
                  }}
                >
                  <step.Icon
                    size={22}
                    strokeWidth={1.8}
                    style={{ color: "var(--color-primary, #8B1A1A)" }}
                  />
                </div>

                <h4
                  className="m-0 mb-2"
                  style={{
                    fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
                    fontSize: "17px",
                    fontWeight: 500,
                    color: "var(--color-text-dark, #1a1a1a)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {step.title}
                </h4>

                <p
                  className="m-0 text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body, 'Inter', sans-serif)",
                    color: "var(--color-text-mid, #4a4a4a)",
                    opacity: 0.75,
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;