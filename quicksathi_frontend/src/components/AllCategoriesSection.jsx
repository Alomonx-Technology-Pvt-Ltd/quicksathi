import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApplianceCategoryModal from "./modals/ApplianceCategoryModal";

// ── 9 Official Platform Categories Matching Complete Services Catalogue ──
const DEFAULT_CATEGORIES = [
  {
    id: "rental",
    title: "Vehicle Rental",
    route: "/category/vehicle-rental",
    iconImage: "/icons/categories/car-rental.png",
    matchKeywords: ["vehicle", "car", "rental"],
    isModalTrigger: true,
    bgColor: "#FEF7DA",
    bgHover: "#FEEFBD",
    borderColor: "rgba(245, 158, 11, 0.16)",
    shadowColor: "rgba(245, 158, 11, 0.22)",
    textHoverColor: "#b45309",
  },
  {
    id: "weddings",
    title: "Wedding & Event",
    route: "/category/wedding",
    iconImage: "/icons/categories/wedding-events.png",
    matchKeywords: ["wedding", "party", "events", "event"],
    isModalTrigger: true,
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
    matchKeywords: ["house help", "maid", "cook", "laundry"],
    isModalTrigger: true,
    bgColor: "#EDFBF7",
    bgHover: "#D6F6EC",
    borderColor: "rgba(16, 185, 129, 0.16)",
    shadowColor: "rgba(16, 185, 129, 0.22)",
    textHoverColor: "#047857",
  },
  {
    id: "repair",
    title: "Home Services & Repair",
    route: "/category/house-services",
    iconImage: "/icons/categories/home-repair.png",
    matchKeywords: ["repair", "plumbing", "electrician", "carpentry", "cctv", "painting", "paint", "house services", "home services", "home services & repair"],
    isModalTrigger: true,
    bgColor: "#F4F4F8",
    bgHover: "#EAEBF2",
    borderColor: "rgba(100, 116, 139, 0.16)",
    shadowColor: "rgba(100, 116, 139, 0.20)",
    textHoverColor: "#4338ca",
  },
  {
    id: "salon",
    title: "Home Salon & Beauty",
    badge: "Coming Soon",
    route: "/category/home-salon",
    iconImage: "/icons/categories/home-salon.png",
    matchKeywords: ["salon", "beauty", "grooming"],
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
    isModalTrigger: true,
    bgColor: "#EFF2FE",
    bgHover: "#DFE5FE",
    borderColor: "rgba(99, 102, 241, 0.16)",
    shadowColor: "rgba(99, 102, 241, 0.22)",
    textHoverColor: "#3730a3",
  },
  {
    id: "ac",
    title: "AC & Home Appliance",
    route: "/services/ac",
    iconImage: "/icons/categories/ac-appliances.png",
    matchKeywords: ["ac", "appliance", "air conditioner", "geyser", "refrigerator", "washing machine", "tv"],
    isModalTrigger: true,
    bgColor: "#EDF7FE",
    bgHover: "#D9EDFE",
    borderColor: "rgba(14, 165, 233, 0.16)",
    shadowColor: "rgba(14, 165, 233, 0.22)",
    textHoverColor: "#0369a1",
  },
  {
    id: "construction",
    title: "Construction & Interior Design",
    route: "/services?q=construction",
    iconImage: "/icons/categories/construction.png",
    matchKeywords: ["construction", "interior", "interior design", "renovation", "remodeling", "ceiling"],
    isModalTrigger: true,
    bgColor: "#FFF5E9",
    bgHover: "#FFE8D1",
    borderColor: "rgba(234, 88, 12, 0.16)",
    shadowColor: "rgba(234, 88, 12, 0.22)",
    textHoverColor: "#c2410c",
  },
];

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

      return {
        id: matched?._id || matched?.id || def.id,
        title: def.title,
        badge: def.badge,
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
    e.preventDefault();
    const id = (cat.id || "").toString().toLowerCase();
    const title = (cat.title || "").toLowerCase();

    if (id === "ac" || title.includes("appliance")) {
      window.dispatchEvent(new CustomEvent("open-appliance-modal"));
    } else if (
      id === "salon" ||
      title.includes("salon") ||
      title.includes("beauty")
    ) {
      window.dispatchEvent(new CustomEvent("open-salon-modal"));
    } else if (
      id === "rental" ||
      title.includes("vehicle") ||
      title.includes("rental") ||
      title.includes("car")
    ) {
      window.dispatchEvent(new CustomEvent("open-rental-modal"));
    } else if (
      id === "weddings" ||
      id === "wedding" ||
      title.includes("wedding") ||
      title.includes("party")
    ) {
      window.dispatchEvent(new CustomEvent("open-wedding-modal"));
    } else if (
      id === "help" ||
      title.includes("house help") ||
      title.includes("maid")
    ) {
      window.dispatchEvent(new CustomEvent("open-help-modal"));
    } else if (
      id === "repair" ||
      title.includes("repair") ||
      title.includes("house services") ||
      title.includes("home services")
    ) {
      window.dispatchEvent(new CustomEvent("open-repair-modal"));
    } else if (
      id === "tuition" ||
      title.includes("tuition") ||
      title.includes("tutor")
    ) {
      window.dispatchEvent(new CustomEvent("open-tuition-modal"));
    } else if (
      id === "construction" ||
      title.includes("construction") ||
      title.includes("interior")
    ) {
      window.dispatchEvent(new CustomEvent("open-construction-modal"));
    } else if (
      id === "painting" ||
      title.includes("paint")
    ) {
      window.dispatchEvent(new CustomEvent("open-painting-modal"));
    } else {
      navigate(cat.route);
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

        {/* ── 8 Category Grid (4 per row, matching classic squircle style) ── */}
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
                  }}
                >
                  {cat.badge && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs z-10 pointer-events-none whitespace-nowrap">
                      {cat.badge}
                    </span>
                  )}
                  <img
                    src={cat.iconImage}
                    alt={cat.title}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-200 ease-out group-hover:scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
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
                  className="cat-title-label mt-2 sm:mt-2.5 text-center leading-[1.2] sm:leading-[1.25] transition-colors duration-200 font-semibold text-[11px] xs:text-xs sm:text-[13px] md:text-[13.5px] max-w-[78px] xs:max-w-[88px] sm:max-w-[115px] md:max-w-[130px] mx-auto text-slate-800"
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
