import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ── Default 8 Platform Categories with Provided Image Icons ──
const DEFAULT_CATEGORIES = [
  {
    id: "cctv",
    title: "CCTV & Security",
    route: "/services/cctv",
    iconImage: "/icons/categories/cctv.png",
    matchKeywords: ["cctv", "security"],
  },
  {
    id: "weddings",
    title: "Wedding & Events",
    route: "/services/weddings",
    iconImage: "/icons/categories/wedding-events.png",
    matchKeywords: ["wedding", "party", "events"],
  },
  {
    id: "rental",
    title: "Vehicle Rental",
    route: "/services/car-rentals",
    iconImage: "/icons/categories/car-rental.png",
    matchKeywords: ["vehicle", "car", "rental"],
  },
  {
    id: "salon",
    title: "Home Salon & Beauty",
    route: "/category/25",
    iconImage: "/icons/categories/home-salon.png",
    matchKeywords: ["salon", "beauty"],
  },
  {
    id: "help",
    title: "House Help",
    route: "/category/20",
    iconImage: "/icons/categories/house-help.png",
    matchKeywords: ["house help", "maid", "cook"],
  },
  {
    id: "repair",
    title: "House Repair",
    route: "/category/31",
    iconImage: "/icons/categories/home-repair.png",
    matchKeywords: ["repair", "plumbing", "electrician", "carpentry", "house services"],
  },
  {
    id: "tuition",
    title: "Home Tuition",
    route: "/category/15",
    iconImage: "/icons/categories/home-tuition.png",
    matchKeywords: ["tuition", "tutor", "tution"],
  },
  {
    id: "painting",
    title: "Painting",
    route: "/category/35",
    iconImage: "/icons/categories/painting.png",
    matchKeywords: ["painting", "paint"],
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

const AllCategoriesSection = ({ categories = [] }) => {
  const navigate = useNavigate();

  // Merge real-time backend categories with icon metadata and dynamic routing
  const displayCategories = useMemo(() => {
    return DEFAULT_CATEGORIES.map((def) => {
      // Find matching real-time category from backend
      const matched = (categories || []).find((c) => {
        const catName = (c.name || "").toLowerCase();
        const catVert = (c.vertical || "").toLowerCase();
        return def.matchKeywords.some(
          (kw) => catName.includes(kw) || catVert.includes(kw)
        );
      });

      // Prefer backend iconUrl if provided and non-empty
      const icon = matched?.iconUrl || def.iconImage;

      // Determine destination route
      let route = def.route;
      if (matched?._id) {
        if (def.id === "cctv") route = "/services/cctv";
        else if (def.id === "weddings") route = "/services/weddings";
        else if (def.id === "rental") route = "/services/car-rentals";
        else route = `/category/${matched._id}`;
      }

      return {
        id: matched?._id || matched?.id || def.id,
        title: matched?.name || def.title,
        route,
        iconImage: icon,
        rawCategory: matched,
      };
    });
  }, [categories]);

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

        {/* ── 8 Category Grid (4 per row on all screens) ── */}
        <motion.div
          className="grid grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-2 sm:gap-x-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {displayCategories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={itemVariants}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(cat.route)}
              className="group flex flex-col items-center border-none bg-transparent cursor-pointer p-0 outline-none w-full"
              style={{ fontFamily: "var(--font-body, inherit)" }}
            >
              {/* Image Icon Container - 20% larger & image covers the entire box */}
              <div
                className="relative flex items-center justify-center rounded-2xl sm:rounded-3xl transition-all duration-300 w-[74px] h-[74px] sm:w-[100px] sm:h-[100px] bg-white border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.05)] group-hover:border-[#FF6B00] group-hover:shadow-[0_10px_25px_rgba(255,107,0,0.22)] group-hover:scale-105 overflow-hidden p-0"
              >
                <img
                  src={cat.iconImage}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to URL-encoded image name if needed
                    if (!e.target.dataset.triedFallback) {
                      e.target.dataset.triedFallback = "true";
                      e.target.src = `/icons/categories/${encodeURIComponent(cat.title.toLowerCase())}.png`;
                    }
                  }}
                />
              </div>

              {/* Service Label: 2 lines max, centered, tight spacing */}
              <span
                className="mt-2.5 text-center leading-snug transition-colors duration-200 text-slate-800 group-hover:text-[#FF6B00] font-semibold text-xs sm:text-[13.5px] max-w-[95px] sm:max-w-[130px] line-clamp-2"
              >
                {cat.title}
              </span>
            </motion.button>
          ))}
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
