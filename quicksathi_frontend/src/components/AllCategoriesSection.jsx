import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Sparkles,
  Car,
  Scissors,
  Home,
  Wrench,
  GraduationCap,
  LayoutGrid,
} from "lucide-react";

// ── Only real TiptoBook platform services (4 in a row layout) ──────────────
const PLATFORM_SERVICES = [
  {
    id: "cctv",
    title: "CCTV & Security",
    route: "/services/cctv",
    icon: ShieldCheck,
    isHighlighted: false,
  },
  {
    id: "weddings",
    title: "Wedding & Events",
    route: "/services/weddings",
    icon: Sparkles,
    isHighlighted: false,
  },
  {
    id: "rental",
    title: "Vehicle Rental",
    route: "/services/car-rentals",
    icon: Car,
    isHighlighted: false,
  },
  {
    id: "salon",
    title: "Home Salon & Beauty",
    route: "/category/25",
    icon: Scissors,
    isHighlighted: false,
  },
  {
    id: "help",
    title: "House Help",
    route: "/category/20",
    icon: Home,
    isHighlighted: false,
  },
  {
    id: "repair",
    title: "House Repair",
    route: "/category/30",
    icon: Wrench,
    isHighlighted: false,
  },
  {
    id: "tuition",
    title: "Home Tuition",
    route: "/category/15",
    icon: GraduationCap,
    isHighlighted: false,
  },
  {
    id: "all",
    title: "All Services",
    route: "/services",
    icon: LayoutGrid,
    isHighlighted: true, // Matching the yellow circular highlight from reference image
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const AllCategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="w-full py-8 sm:py-12 px-4 sm:px-8 lg:px-12 select-none bg-white"
    >
      <div className="max-w-4xl mx-auto">
        {/* ── Section Header ── */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight m-0"
              style={{
                color: "var(--color-text-dark, #0f172a)",
                fontFamily: "var(--font-display, inherit)",
              }}
            >
              All Categories
            </h2>
            <p
              className="text-xs sm:text-sm mt-1 mb-0"
              style={{
                color: "var(--color-text-mid, #64748b)",
                fontFamily: "var(--font-body, inherit)",
              }}
            >
              Find the right service for your needs
            </p>
          </div>

          <button
            onClick={() => navigate("/services")}
            className="group hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold border-none bg-transparent cursor-pointer p-0 transition-colors"
            style={{
              color: "var(--color-primary, #0b4fd8)",
              fontFamily: "var(--font-body, inherit)",
            }}
          >
            <span>View all categories</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        {/* ── App-style 4-column Grid ── */}
        <motion.div
          className="grid grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-2 sm:gap-x-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {PLATFORM_SERVICES.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(cat.route)}
                className="group flex flex-col items-center border-none bg-transparent cursor-pointer p-0 outline-none w-full"
                style={{ fontFamily: "var(--font-body, inherit)" }}
              >
                {/* 
                  Clean circle container (NO square card borders)
                  Matches the outline stroke icons and yellow highlight from reference image
                */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-200 w-[58px] h-[58px] sm:w-[76px] sm:h-[76px] ${
                    cat.isHighlighted
                      ? "bg-[#FF6B00] text-white shadow-md group-hover:bg-[#E05600] group-hover:scale-105"
                      : "bg-white text-slate-800 border border-slate-200/90 group-hover:border-[#FF6B00] group-hover:bg-orange-50/60 group-hover:text-[#FF6B00] group-hover:scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md"
                  }`}
                >
                  <Icon
                    className="w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-200"
                    strokeWidth={1.85}
                  />
                </div>

                {/* Service Label: 2 lines max, centered, tight spacing */}
                <span
                  className="mt-2 text-center leading-snug transition-colors duration-200 text-slate-800 group-hover:text-slate-950 font-medium text-[11px] sm:text-[13px] max-w-[78px] sm:max-w-[105px] line-clamp-2"
                >
                  {cat.title}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Mobile "View All" Footer CTA */}
        <div className="flex justify-center mt-6 sm:hidden">
          <button
            onClick={() => navigate("/services")}
            className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all"
            style={{ fontFamily: "var(--font-body, inherit)" }}
          >
            <span>View all categories</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AllCategoriesSection;
