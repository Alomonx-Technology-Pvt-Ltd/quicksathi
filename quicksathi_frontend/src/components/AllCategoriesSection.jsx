import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApplianceCategoryModal from "./modals/ApplianceCategoryModal";

// ── Default 8 Platform Categories Designed in Soft Pastel Squircle Style ──
const DEFAULT_CATEGORIES = [
  {
    id: "rental",
    title: "Vehicle Rental",
    route: "/category/vehicle-rental",
    iconImage: "/icons/categories/car-rental.png",
    matchKeywords: ["vehicle", "car", "rental"],
    bgColor: "#FEF7DA",
    bgHover: "#FEEFBD",
    borderColor: "rgba(245, 158, 11, 0.16)",
    shadowColor: "rgba(245, 158, 11, 0.22)",
    textHoverColor: "#b45309",
  },
  {
    id: "weddings",
    title: "Wedding & Party Services",
    route: "/category/wedding",
    iconImage: "/icons/categories/wedding-events.png",
    matchKeywords: ["wedding", "party", "events"],
    bgColor: "#FDF1F7",
    bgHover: "#FCE4F2",
    borderColor: "rgba(236, 72, 153, 0.16)",
    shadowColor: "rgba(236, 72, 153, 0.22)",
    textHoverColor: "#be185d",
  },
  {
    id: "help",
    title: "House Help",
    route: "/category/house-help",
    iconImage: "/icons/categories/house-help.png",
    matchKeywords: ["house help", "maid", "cook"],
    bgColor: "#EDFBF7",
    bgHover: "#D6F6EC",
    borderColor: "rgba(16, 185, 129, 0.16)",
    shadowColor: "rgba(16, 185, 129, 0.22)",
    textHoverColor: "#047857",
  },
  {
    id: "repair",
    title: "House Services Repair",
    route: "/category/house-services",
    iconImage: "/icons/categories/home-repair.png",
    matchKeywords: ["repair", "plumbing", "electrician", "carpentry", "house services", "house services repair", "house services & repair"],
    bgColor: "#F4F4F8",
    bgHover: "#EAEBF2",
    borderColor: "rgba(100, 116, 139, 0.16)",
    shadowColor: "rgba(100, 116, 139, 0.20)",
    textHoverColor: "#4338ca",
  },
  {
    id: "salon",
    title: "Home Salon & Beauty",
    route: "/category/home-salon",
    iconImage: "/icons/categories/home-salon.png",
    matchKeywords: ["salon", "beauty"],
    isModalTrigger: true,
    bgColor: "#FFF0F3",
    bgHover: "#FEDDE4",
    borderColor: "rgba(244, 63, 94, 0.16)",
    shadowColor: "rgba(244, 63, 94, 0.22)",
    textHoverColor: "#be123c",
  },
  {
    id: "tuition",
    title: "Home Tuition",
    route: "/category/home-tuition",
    iconImage: "/icons/categories/home-tuition.png",
    matchKeywords: ["tuition", "tutor", "tution"],
    bgColor: "#EFF2FE",
    bgHover: "#DFE5FE",
    borderColor: "rgba(99, 102, 241, 0.16)",
    shadowColor: "rgba(99, 102, 241, 0.22)",
    textHoverColor: "#3730a3",
  },
  {
    id: "ac",
    title: "AC & Appliances",
    route: "/services/ac",
    iconImage: "/icons/categories/ac-appliances.png",
    matchKeywords: ["ac", "appliance", "air conditioner"],
    isModalTrigger: true,
    bgColor: "#EDF7FE",
    bgHover: "#D9EDFE",
    borderColor: "rgba(14, 165, 233, 0.16)",
    shadowColor: "rgba(14, 165, 233, 0.22)",
    textHoverColor: "#0369a1",
  },
  {
    id: "painting",
    title: "Painting",
    route: "/category/painting",
    iconImage: "/icons/categories/painting.png",
    matchKeywords: ["painting", "paint"],
    bgColor: "#FFF8E7",
    bgHover: "#FEF0C7",
    borderColor: "rgba(245, 158, 11, 0.16)",
    shadowColor: "rgba(245, 158, 11, 0.22)",
    textHoverColor: "#b45309",
  },
];

const AllCategoriesSection = ({ categories = [] }) => {
  const navigate = useNavigate();
  const [isApplianceModalOpen, setIsApplianceModalOpen] = useState(false);

  // Listen for global event to open appliance modal from any component
  useEffect(() => {
    const handleOpen = () => setIsApplianceModalOpen(true);
    window.addEventListener("open-appliance-modal", handleOpen);
    return () => window.removeEventListener("open-appliance-modal", handleOpen);
  }, []);

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

      return {
        id: matched?._id || matched?.id || def.id,
        title: def.title,
        route: def.route,
        iconImage: def.iconImage,
        rawCategory: matched,
        isModalTrigger: def.isModalTrigger,
        bgColor: def.bgColor,
        bgHover: def.bgHover,
        borderColor: def.borderColor,
        shadowColor: def.shadowColor,
        textHoverColor: def.textHoverColor,
      };
    });
  }, [categories]);

  const handleCategoryClick = (e, cat) => {
    if (cat.id === "ac" || cat.title?.toLowerCase().includes("appliance")) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-appliance-modal"));
    } else if (
      cat.id === "salon" ||
      cat.title?.toLowerCase().includes("salon") ||
      cat.title?.toLowerCase().includes("beauty")
    ) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-salon-modal"));
    }
  };

  return (
    <section className="w-full py-8 sm:py-12 px-4 sm:px-8 lg:px-12 select-none bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-gray-100 pb-4">
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

        {/* ── 8 Category Grid (4 per row, squircle icons matching attached reference) ── */}
        <div className="w-full flex justify-center">
          <div
            className="grid grid-cols-4 justify-items-center gap-y-6 sm:gap-y-8 md:gap-y-10 gap-x-2 sm:gap-x-6 md:gap-x-10 w-full max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto"
            style={{ margin: "0 auto" }}
          >
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.route}
                onClick={(e) => handleCategoryClick(e, cat)}
                className="group flex flex-col items-center text-center justify-start no-underline border-none bg-transparent cursor-pointer p-0 outline-none w-full transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body, inherit)",
                  "--cat-bg": cat.bgColor,
                  "--cat-bg-hover": cat.bgHover,
                  "--cat-border": cat.borderColor,
                  "--cat-shadow": cat.shadowColor,
                  "--cat-text-hover": cat.textHoverColor,
                }}
              >
                {/* ── Soft Pastel Squircle Tile ── */}
                <div
                  className="cat-squircle-tile relative flex items-center justify-center aspect-square active:scale-95 w-[66px] h-[66px] xs:w-[72px] xs:h-[72px] sm:w-[82px] sm:h-[82px] md:w-[92px] md:h-[92px] rounded-[22px] xs:rounded-[24px] sm:rounded-[28px] md:rounded-[30px] p-2.5 xs:p-3 sm:p-3.5 md:p-4 mx-auto select-none"
                  style={{
                    backgroundColor: cat.bgColor,
                    border: `1px solid ${cat.bgColor}`,
                    boxShadow: "0 4px 14px -2px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = cat.bgHover;
                    e.currentTarget.style.borderColor = cat.bgHover;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 12px 24px -4px ${cat.shadowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = cat.bgColor;
                    e.currentTarget.style.borderColor = cat.bgColor;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px -2px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)";
                  }}
                >
                  <img
                    src={cat.iconImage}
                    alt={cat.title}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-300 ease-out group-hover:scale-108 drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
                    onError={(e) => {
                      if (!e.target.dataset.triedFallback) {
                        e.target.dataset.triedFallback = "true";
                        e.target.src = `/icons/categories/${encodeURIComponent(cat.title.toLowerCase())}.png`;
                      }
                    }}
                  />
                </div>

                {/* ── Balanced Category Label ── */}
                <span
                  className="mt-2 sm:mt-2.5 text-center leading-[1.2] sm:leading-[1.25] transition-colors duration-200 font-semibold text-[11px] xs:text-xs sm:text-[13px] md:text-[13.5px] max-w-[78px] xs:max-w-[88px] sm:max-w-[115px] md:max-w-[130px] mx-auto text-slate-800"
                  style={{
                    textWrap: "balance",
                    color: "#1e293b",
                  }}
                >
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
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
