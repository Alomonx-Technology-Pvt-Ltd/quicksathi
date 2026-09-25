import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

// ── Default 8 Platform Categories with Provided Image Icons ──
const DEFAULT_CATEGORIES = [
  {
    id: "ac",
    title: "AC & Appliances",
    route: "/services/ac",
    iconImage: "/icons/categories/ac-appliances.png",
    matchKeywords: ["ac", "appliance", "air conditioner"],
  },
  {
    id: "weddings",
    title: "Wedding & Party Services",
    route: "/category/wedding",
    iconImage: "/icons/categories/wedding-events.png",
    matchKeywords: ["wedding", "party", "events"],
  },
  {
    id: "rental",
    title: "Vehicle Rental",
    route: "/category/vehicle-rental",
    iconImage: "/icons/categories/car-rental.png",
    matchKeywords: ["vehicle", "car", "rental"],
  },
  {
    id: "salon",
    title: "Home Salon & Beauty",
    route: "/category/home-salon",
    iconImage: "/icons/categories/home-salon.png",
    matchKeywords: ["salon", "beauty"],
  },
  {
    id: "help",
    title: "House Help",
    route: "/category/house-help",
    iconImage: "/icons/categories/house-help.png",
    matchKeywords: ["house help", "maid", "cook"],
  },
  {
    id: "repair",
    title: "House Services & Repair",
    route: "/category/house-services",
    iconImage: "/icons/categories/home-repair.png",
    matchKeywords: ["repair", "plumbing", "electrician", "carpentry", "house services"],
  },
  {
    id: "tuition",
    title: "Home Tuition",
    route: "/category/home-tuition",
    iconImage: "/icons/categories/home-tuition.png",
    matchKeywords: ["tuition", "tutor", "tution"],
  },
  {
    id: "painting",
    title: "Painting",
    route: "/category/painting",
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

      // Always use our clean high-quality icons
      const icon = def.iconImage;

      // Keep clean semantic slug route (e.g. /category/vehicle-rental)
      const route = def.route;

      return {
        id: matched?._id || matched?.id || def.id,
        title: def.title,
        route,
        iconImage: icon,
        rawCategory: matched,
      };
    });
  }, [categories]);

  return (
    <section
      className="w-full py-8 sm:py-12 px-4 sm:px-8 lg:px-12 select-none bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
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
              Explore All Categories
            </h2>
            <p
              className="text-xs sm:text-sm mt-1 mb-0 max-w-xl"
              style={{
                color: "var(--color-text-mid, #64748b)",
                fontFamily: "var(--font-body, inherit)",
              }}
            >
              Book home services, wedding services, car rentals, tutors, and more—all in one convenient place.
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

        {/* ── 8 Category Grid (4 per row, centered in the middle) ── */}
        <div className="w-full flex justify-center">
          <motion.div
            className="grid grid-cols-4 justify-items-center gap-y-5 sm:gap-y-8 md:gap-y-9 gap-x-2 sm:gap-x-6 md:gap-x-12 w-full max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto"
            style={{ margin: "0 auto" }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {displayCategories.map((cat) => (
              <MotionLink
                key={cat.id}
                to={cat.route}
                variants={itemVariants}
                whileTap={{ scale: 0.94 }}
                className="group flex flex-col items-center text-center justify-center no-underline border-none bg-transparent cursor-pointer p-0 outline-none w-full"
                style={{ fontFamily: "var(--font-body, inherit)" }}
              >
                {/* Clean Icon Container: responsive sizing, NO border, NO card */}
                <div
                  className="relative flex items-center justify-center rounded-2xl sm:rounded-3xl transition-transform duration-200 w-[54px] h-[54px] xs:w-[62px] xs:h-[62px] sm:w-[74px] sm:h-[74px] md:w-[80px] md:h-[80px] group-hover:scale-105 active:scale-95 overflow-hidden p-0 mx-auto"
                >
                  <img
                    src={cat.iconImage}
                    alt={cat.title}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className="w-full h-full object-contain select-none pointer-events-none rounded-2xl sm:rounded-3xl"
                    onError={(e) => {
                      if (!e.target.dataset.triedFallback) {
                        e.target.dataset.triedFallback = "true";
                        e.target.src = `/icons/categories/${encodeURIComponent(cat.title.toLowerCase())}.png`;
                      }
                    }}
                  />
                </div>

                {/* Service Label: centered below the icon */}
                <span
                  className="mt-1.5 sm:mt-2.5 text-center leading-tight sm:leading-snug transition-colors duration-200 text-slate-800 group-hover:text-purple-700 font-semibold text-[10.5px] xs:text-xs sm:text-[13px] max-w-[74px] xs:max-w-[86px] sm:max-w-[125px] line-clamp-2 mx-auto"
                >
                  {cat.title}
                </span>
              </MotionLink>
            ))}
          </motion.div>
        </div>

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
