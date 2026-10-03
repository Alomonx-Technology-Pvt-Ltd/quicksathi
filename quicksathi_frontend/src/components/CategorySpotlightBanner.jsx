import { useState, useEffect, useMemo } from "react";
import api from "../config/api";

const BANNER_CONFIGS = {
  ac: {
    match: ["ac", "appliance", "air conditioner", "ac_appliances"],
    badge: "AC & Appliance Experts",
    badgeStyle: "bg-sky-100 text-sky-700 border-sky-200/80",
    headline: "Keep Your Home Cool & Functional.",
    subheadLabel: "Doorstep repair & deep servicing for all appliances:",
    subheadItems: "AC Foam Jet • Washing Machine • Refrigerator • Smart TV • Geyser",
    bullets: [
      "⚡ 30-Day Service Warranty",
      "🔧 Certified Expert Technicians",
      "🏷️ Upfront Transparent Pricing",
    ],
    image: "/banners/ac_banner.webp",
    fallbackBg: "#f0f9ff",
    borderColor: "border-sky-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(240, 249, 255, 0.90)",
  },
  wedding: {
    match: ["wedding", "party", "events", "celebration"],
    badge: "Wedding & Celebration",
    badgeStyle: "bg-rose-100 text-rose-700 border-rose-200/80",
    headline: "Plan Your Perfect Wedding.",
    subheadLabel: "Find trusted services for your special day:",
    subheadItems: "Venues • Decorators • Photographers • Makeup • Catering & More",
    bullets: [
      "💍 Trusted Service Providers",
      "✨ Multiple Options",
      "📅 Easy Booking",
    ],
    image: "/banners/wedding_banner.webp",
    fallbackBg: "#fdf8f5",
    borderColor: "border-rose-100/80",
    overlayLeft: "rgba(255, 255, 255, 0.96)",
    overlayMid: "rgba(253, 248, 245, 0.88)",
  },
  tuition: {
    match: ["tuition", "tutor", "tution", "home_tuition"],
    badge: "Verified Expert Tutors",
    badgeStyle: "bg-sky-100 text-sky-700 border-sky-200/80",
    headline: "Find trusted home tutors for:",
    subheadLabel: null,
    subheadItems: "Maths • Science • English • Computer • Other Subjects",
    bullets: [
      "👨‍🏫 Experienced Tutors",
      "🏠 One-to-One Learning",
      "📚 Personalized Classes",
    ],
    image: "/banners/tuition_banner.webp",
    fallbackBg: "#f0f9ff",
    borderColor: "border-sky-100/80",
    overlayLeft: "rgba(255, 255, 255, 0.96)",
    overlayMid: "rgba(240, 249, 255, 0.88)",
  },
  repair: {
    match: ["repair", "house-services", "house_services", "plumbing", "electrician", "carpentry", "cctv", "home-repair"],
    badge: "Verified Home Repairs",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-200/80",
    headline: "Reliable Home Repairs at Honest Prices.",
    subheadLabel: "Expert doorstep solutions for your house:",
    subheadItems: "Electricians • Plumbers • Carpenters • CCTV Cameras • Smart Locks",
    bullets: [
      "🛡️ Verified Background-Checked Pros",
      "⏱️ 60-Minute Doorstep Arrival",
      "💯 100% Satisfaction Guarantee",
    ],
    image: "/banners/repair_banner.webp",
    fallbackBg: "#fffbeb",
    borderColor: "border-amber-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(255, 251, 235, 0.90)",
  },
  rental: {
    match: ["vehicle-rental", "rental", "cars", "car", "bike", "vehicle", "vehicle_rental"],
    badge: "Chauffeur & Self-Drive",
    badgeStyle: "bg-indigo-100 text-indigo-700 border-indigo-200/80",
    headline: "Rent Your Ride With Total Peace of Mind.",
    subheadLabel: "Clean, insured cars & bikes for every journey:",
    subheadItems: "Sedans • SUVs • Luxury Wedding Cars • Daily Self-Drive • Outstation",
    bullets: [
      "🚗 Insured & Sanitized Fleet",
      "⚡ Instant Booking Confirmation",
      "📍 Free Doorstep Delivery & Pickup",
    ],
    image: "/banners/rental_banner.webp",
    fallbackBg: "#eef2ff",
    borderColor: "border-indigo-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(238, 242, 255, 0.90)",
  },
  salon: {
    match: ["home-salon", "salon", "beauty", "home_salon", "makeup", "parlour"],
    badge: "Salon & Spa at Home",
    badgeStyle: "bg-pink-100 text-pink-700 border-pink-200/80",
    headline: "Glow at Home With Top Beauty Experts.",
    subheadLabel: "Professional parlour & grooming services at your doorstep:",
    subheadItems: "Hair Styling • Facials & Clean-up • Waxing • Bridal Makeup • Manicure",
    bullets: [
      "💄 100% Genuine Branded Products",
      "🧼 Single-Use Sealed Hygiene Kits",
      "👩‍🦰 Trained & Certified Beauticians",
    ],
    image: "/banners/salon_banner.webp",
    fallbackBg: "#fdf2f8",
    borderColor: "border-pink-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(253, 242, 248, 0.90)",
  },
  help: {
    match: ["house-help", "help", "maid", "cook", "house_help", "cleaning"],
    badge: "Trusted Domestic Assistance",
    badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-200/80",
    headline: "Verified Daily House Help & Cooking Experts.",
    subheadLabel: "Dedicated domestic helpers tailored to your routine:",
    subheadItems: "All-Round Maids • Expert Cooks • Deep Cleaning • Babysitters • Elderly Care",
    bullets: [
      "👮 Police Verified & Document Checked",
      "🔄 Instant Replacement Guarantee",
      "⏰ Flexible Part-Time & Full-Time",
    ],
    image: "/banners/help_banner.webp",
    fallbackBg: "#f0fdf4",
    borderColor: "border-emerald-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(240, 253, 244, 0.90)",
  },
  painting: {
    match: ["painting", "paint"],
    badge: "Professional Home Painting",
    badgeStyle: "bg-orange-100 text-orange-800 border-orange-200/80",
    headline: "Transform Your Walls With Expert Finish.",
    subheadLabel: "Hassle-free interior & exterior painting with warranty:",
    subheadItems: "Interior Painting • Exterior Weatherproof • Waterproofing • Texture Walls",
    bullets: [
      "📐 Free On-Site Laser Measurement",
      "🎨 Asian Paints & Berger Authorized",
      "✨ Post-Paint Complete Cleanup",
    ],
    image: "/banners/painting_banner.webp",
    fallbackBg: "#fff7ed",
    borderColor: "border-orange-100/90",
    overlayLeft: "rgba(255, 255, 255, 0.97)",
    overlayMid: "rgba(255, 247, 237, 0.90)",
  },
};

const normalizeLiveConfig = (b) => ({
  badge: b.badge || b.tag || "Verified Services",
  badgeStyle: b.badgeStyle || "bg-sky-100 text-sky-700 border-sky-200/80",
  headline: b.headline || b.title,
  subheadLabel: b.subheadLabel || null,
  subheadItems: b.subheadItems || b.subtitle || "",
  bullets:
    Array.isArray(b.bullets) && b.bullets.length > 0
      ? b.bullets
      : [
          "⚡ 30-Day Service Warranty",
          "🔧 Certified Expert Technicians",
          "🏷️ Upfront Transparent Pricing",
        ],
  image: b.image || "/banners/repair_banner.webp",
  fallbackBg: b.fallbackBg || b.bgFallback || "#f0f9ff",
  borderColor: b.borderColor || "border-sky-100/90",
  overlayLeft: b.overlayLeft || "rgba(255, 255, 255, 0.97)",
  overlayMid: b.overlayMid || "rgba(240, 249, 255, 0.90)",
});

export default function CategorySpotlightBanner({ category, id }) {
  const [liveBanners, setLiveBanners] = useState([]);

  // Fetch real-time category page banners from Admin Panel
  useEffect(() => {
    let active = true;
    api
      .get("/banners?section=category_page")
      .then(({ data }) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setLiveBanners(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const config = useMemo(() => {
    const rawKey = String(id || category?.slug || category?._id || "").toLowerCase();
    const catName = String(category?.name || "").toLowerCase();
    const catVert = String(category?.vertical || "").toLowerCase();

    // 1. Try matching from liveBanners (Admin-managed)
    if (liveBanners.length > 0) {
      // Direct category match (e.g. 'ac', 'wedding', 'salon', etc.)
      const directMatch = liveBanners.find(
        (b) =>
          b.category &&
          (b.category.toLowerCase() === rawKey ||
            rawKey.includes(b.category.toLowerCase()) ||
            catName.includes(b.category.toLowerCase()))
      );
      if (directMatch) return normalizeLiveConfig(directMatch);

      // Match keywords array
      const keywordMatch = liveBanners.find(
        (b) =>
          Array.isArray(b.matchKeywords) &&
          b.matchKeywords.some((m) => {
            const kw = String(m).toLowerCase().trim();
            return (
              kw &&
              (rawKey.includes(kw) ||
                catName.includes(kw) ||
                catVert.includes(kw))
            );
          })
      );
      if (keywordMatch) return normalizeLiveConfig(keywordMatch);
    }

    // 2. Direct key match in static fallback configs
    if (BANNER_CONFIGS[rawKey]) return BANNER_CONFIGS[rawKey];

    // 3. Iterate static match keywords
    for (const [key, cfg] of Object.entries(BANNER_CONFIGS)) {
      if (
        cfg.match.some(
          (m) =>
            rawKey.includes(m) ||
            catName.includes(m) ||
            catVert.includes(m)
        )
      ) {
        return cfg;
      }
    }

    // 4. Generic fallback for custom admin categories
    const displayName = category?.name || "Professional Services";
    return {
      badge: "Verified Local Services",
      badgeStyle: "bg-purple-100 text-purple-700 border-purple-200/80",
      headline: `Trusted ${displayName} Near You.`,
      subheadLabel: "Book verified doorstep professionals with transparent pricing:",
      subheadItems: "Doorstep Service • Quality Guaranteed • Verified Technicians",
      bullets: [
        "⭐ Top-Rated Local Experts",
        "🛡️ Verified & Background Checked",
        "⚡ Quick & Easy Online Booking",
      ],
      image: "/banners/repair_banner.webp",
      fallbackBg: "#f8fafc",
      borderColor: "border-purple-100/90",
      overlayLeft: "rgba(255, 255, 255, 0.97)",
      overlayMid: "rgba(248, 250, 252, 0.90)",
    };
  }, [category, id, liveBanners]);

  return (
    <div
      className={`mt-5 rounded-2xl sm:rounded-3xl overflow-hidden border ${config.borderColor} shadow-xs relative min-h-[250px] sm:min-h-[280px] md:min-h-[300px] flex items-center bg-cover bg-no-repeat`}
      style={{
        backgroundImage: `url('${config.image}')`,
        backgroundColor: config.fallbackBg,
        backgroundPosition: "center right",
      }}
    >
      {/* Soft gradient overlay so left text is always 100% legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${config.overlayLeft} 0%, ${config.overlayMid} 54%, rgba(255,255,255,0.15) 80%, transparent 100%)`,
        }}
      />

      {/* Mobile subtle blur backdrop for extra contrast */}
      <div className="absolute inset-0 pointer-events-none md:hidden bg-gradient-to-r from-white/95 via-white/85 to-transparent" />

      {/* Left Column Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-8 max-w-lg md:max-w-xl">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase ${config.badgeStyle} mb-2.5 shadow-2xs`}
        >
          {config.badge}
        </span>

        <h2 className="text-xl sm:text-2xl md:text-[27px] font-extrabold text-slate-900 leading-tight m-0 mb-1.5">
          {config.headline}
        </h2>

        {config.subheadLabel && (
          <p className="text-xs sm:text-[13px] text-slate-500 m-0 mb-1">{config.subheadLabel}</p>
        )}

        <p className="text-xs sm:text-sm md:text-[14.5px] text-slate-800 font-semibold m-0 mb-3.5 leading-snug">
          {config.subheadItems}
        </p>

        {/* 3 Key Feature Badges */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {config.bullets.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/95 border border-slate-200/80 text-slate-800 shadow-2xs"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
