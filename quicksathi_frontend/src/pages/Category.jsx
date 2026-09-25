import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Shield,
  ChevronRight,
  X,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import api from "../config/api";
import SEO from "../components/SEO";
import { useLocation } from "../context/LocationContext";
import { mockCategories } from "../data/mockCategories";
import { mockServices } from "../data/mockServices";
import ACCategoryPage from "./ACCategoryPage";

// Helper to extract clean bullet points from service data
const getServiceBullets = (service) => {
  if (service.bullets && service.bullets.length > 0) return service.bullets;
  const bullets = [];
  if (service.shortDescription) {
    bullets.push(service.shortDescription);
  }
  if (service.packages && service.packages.length > 0) {
    const firstPkg = service.packages[0];
    if (firstPkg.features && firstPkg.features.length > 0) {
      bullets.push(...firstPkg.features.slice(0, 2));
    }
  }
  if (bullets.length === 0 && service.description) {
    const sentences = service.description.split(".").filter(Boolean);
    bullets.push(...sentences.slice(0, 2).map((s) => s.trim() + "."));
  }
  if (bullets.length === 0) {
    bullets.push("Verified background-checked specialists.");
    bullets.push("Upfront pricing with 100% satisfaction assurance.");
  }
  return bullets.slice(0, 3);
};

// Helper to find services belonging to a subcategory
const getServicesForSub = (sub, allServices, categoryVertical) => {
  const subName = (sub.name || "").toLowerCase();
  const subKeywords = (sub.keywords || []).map((k) => k.toLowerCase());

  // 1. Filter services belonging to this vertical or category
  const categoryServices = allServices.filter((s) => {
    const sCatName = (s.categoryName || "").toLowerCase();
    const sVert = (s.vertical || "").toLowerCase();
    const targetVert = (categoryVertical || "").toLowerCase();

    return (
      (targetVert && sVert === targetVert) ||
      sCatName.includes(targetVert) ||
      (targetVert && sCatName.includes(targetVert.replace(/_/g, " ")))
    );
  });

  // 2. Find services matching this subcategory name or keywords
  const matched = categoryServices.filter((s) => {
    const sName = (s.name || "").toLowerCase();
    const sSection = (s.section || "").toLowerCase();
    const sDesc = (s.shortDescription || s.description || "").toLowerCase();
    const sTags = (s.tags || []).map((t) => t.toLowerCase());

    if (sSection === subName) return true;
    if (sName === subName || sName.includes(subName) || subName.includes(sName)) return true;
    if (subKeywords.some((kw) => sName.includes(kw) || sTags.includes(kw) || sDesc.includes(kw))) return true;
    return false;
  });

  if (matched.length > 0) return matched;

  // 3. Fallback: Check all services globally for subcategory name match
  const globalMatch = allServices.filter((s) => {
    const sName = (s.name || "").toLowerCase();
    return sName === subName || sName.includes(subName) || subName.includes(sName);
  });

  if (globalMatch.length > 0) return globalMatch;

  // 4. Generate structured fallback from the subcategory object itself
  return [
    {
      _id: sub._id || sub.id || subName.replace(/\s+/g, "-"),
      slug: sub.slug || subName.replace(/\s+/g, "-"),
      name: sub.name,
      rating: 4.8,
      totalReviews: 1200,
      startingPrice: sub.startingPrice || 499,
      priceUnit: sub.priceUnit || "service",
      thumbnail:
        sub.imageUrl ||
        sub.image ||
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
      bullets: [
        sub.description || "Expert doorstep assistance by verified professionals.",
        "Quality guarantee with upfront transparent pricing.",
      ],
      fullDescription:
        sub.description ||
        `${sub.name} by verified background-checked experts on TiptoBook. Complete satisfaction guaranteed.`,
      packages: [
        {
          title: `Standard ${sub.name}`,
          price: sub.startingPrice || 499,
          features: ["Verified Professional", "Standard Service", "Safety Assurance"],
        },
        {
          title: `Premium ${sub.name}`,
          price: Math.round((sub.startingPrice || 499) * 1.8),
          features: ["Top-Rated Specialist", "Deep Service & Inspection", "Extended Warranty"],
        },
      ],
      faqs: [
        {
          question: "How do I book this service?",
          answer: "Click 'BOOK' to select your preferred package, date, and address.",
        },
        {
          question: "Are your professionals verified?",
          answer: "Yes, all service partners undergo strict background checks and skill verification.",
        },
      ],
    },
  ];
};

const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { city, setIsPickerOpen } = useLocation();

  // Instant render: find mock category for this id immediately
  const findMock = (catId) => {
    if (!catId) return null;
    const cid = String(catId).toLowerCase();

    let match = mockCategories.find(
      (c) => (c.id || c._id)?.toString().toLowerCase() === cid
    );
    if (match) return match;

    const cleanVert = cid.toUpperCase().replace(/-/g, "_");
    match = mockCategories.find((c) => c.vertical?.toUpperCase() === cleanVert);
    if (match) return match;

    const aliasMap = {
      wedding: 10,
      weddings: 10,
      "vehicle-rental": 6,
      rental: 6,
      "home-tuition": 15,
      tuition: 15,
      "house-help": 20,
      help: 20,
      "home-salon": 25,
      salon: 25,
      "house-services": 31,
      repair: 31,
      painting: 35,
      cctv: 31,
      "cctv-security": 31,
      ac: 1,
      "ac-appliances": 1,
    };
    if (aliasMap[cid]) {
      match = mockCategories.find((c) => c.id === aliasMap[cid]);
      if (match) return match;
    }

    const cleanName = cid.replace(/-/g, " ");
    return (
      mockCategories.find(
        (c) =>
          c.name?.toLowerCase() === cleanName ||
          c.name?.toLowerCase().includes(cleanName) ||
          cleanName.includes(c.name?.toLowerCase())
      ) ?? null
    );
  };

  const [category, setCategory] = useState(() => findMock(id));
  const [services, setServices] = useState(() => mockServices);
  const [activeSection, setActiveSection] = useState("all");
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);
  const sectionRefs = useRef({});

  // Background fetch — upgrades mock → real data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await api.get(`/categories/${id}`);
        if (data) {
          setCategory(data);
          return;
        }
      } catch {
        // fallback to full list
      }
      try {
        const { data } = await api.get("/categories");
        const found = data?.find((cat) => {
          const catId = (cat._id || cat.id)?.toString();
          const cleanParam = String(id).toLowerCase().replace(/-/g, "_");
          return catId === String(id) || cat.vertical?.toLowerCase() === cleanParam;
        });
        if (found) setCategory(found);
      } catch {
        // Keep mock already displayed
      }
    };
    fetchCategory();
  }, [id]);

  // Fetch real-time services from backend
  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => {
        if (data && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  // Delegate AC category to ACCategoryPage for tailored multi-package experience
  if (
    category?.vertical === "AC_APPLIANCES" ||
    id === "ac" ||
    id === "ac-appliances" ||
    category?.name?.toLowerCase().includes("ac & appliances")
  ) {
    return <ACCategoryPage category={category} />;
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800 text-xl font-semibold">
        Category not found
      </div>
    );
  }

  const subs = category.subCategories && category.subCategories.length > 0
    ? category.subCategories
    : [
        {
          _id: category._id || category.id,
          id: category.id || category._id,
          name: category.name,
          imageUrl: category.imageUrl,
          description: category.description,
        },
      ];

  // Scroll to section handler matching AC page
  const handleScrollToSection = (sectionName) => {
    setActiveSection(sectionName);
    const element = sectionRefs.current[sectionName];
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleBookService = (service) => {
    let packageTitle = "Standard";
    let price = 0;
    if (service.packages && service.packages.length > 0) {
      packageTitle = service.packages[0].title;
      price = service.packages[0].price;
    } else if (service.startingPrice) {
      price = service.startingPrice;
    }
    const params = new URLSearchParams({
      name: service.name,
      package: packageTitle,
      price: price.toString(),
    });
    navigate(`/booking/${service.slug || service._id || service.id}?${params.toString()}`);
  };

  const displayTitle = category.name.toLowerCase().endsWith("services")
    ? `${category.name} near you`
    : `${category.name} services near you`;

  const canonicalSlug = category?.vertical
    ? category.vertical.toLowerCase().replace(/_/g, "-")
    : id;

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <SEO
        title={`${category?.name || "Local Services"} in Patna & Bihar — TiptoBook`}
        description={`Explore and book verified ${category?.name || "local services"} in Patna, Bihar, and India on TiptoBook. Compare packages, read reviews, and book vetted professionals.`}
        canonical={`https://www.tiptobook.com/category/${canonicalSlug}`}
        keywords={`${category?.name}, ${category?.name} in Patna, ${category?.name} Bihar, online service booking, local service providers, TiptoBook`}
      />

      {/* ── Main Container: max-w-4xl for clean centered Urban Company feel ── */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* ── Top City / Location Selector Header ── */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setIsPickerOpen?.(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-600 mb-1.5 bg-transparent border-0 p-0 cursor-pointer transition-colors"
          >
            <MapPin size={13} className="text-purple-600" />
            <span>{city ? `Services in ${city}` : "Select city"}</span>
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight m-0">
            {displayTitle}
          </h1>

          {/* Trust Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 mt-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Shield size={12} className="text-purple-600" />
              <span>5k+ Experts</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60 shadow-xs">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>400K+ ★★★★★</span>
            </div>
          </div>
        </div>

        {/* ── Coming Soon Banner (if toggled) ── */}
        {category?.comingSoon && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl px-5 py-4 border bg-amber-50/70 border-amber-200 text-amber-900">
            <span style={{ fontSize: "20px" }}>⏳</span>
            <div>
              <p className="m-0 text-sm font-bold">{category.name} is launching soon!</p>
              <p className="m-0 text-xs text-amber-800/80">
                We're currently onboarding top verified providers. Booking will open shortly!
              </p>
            </div>
          </div>
        )}

        {/* ── Custom Category Spotlight Banner (Wedding & Events) ── */}
        {(category?.vertical === "WEDDING" || id === "wedding" || category?.name?.toLowerCase().includes("wedding")) && (
          <div
            className="mt-5 rounded-2xl overflow-hidden border border-rose-100/80 shadow-sm relative min-h-[220px] sm:min-h-[260px] flex items-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: "url('/banners/wedding_banner.webp')",
              backgroundColor: "#fdf8f5",
              backgroundPosition: "center right",
            }}
          >
            <div className="absolute inset-0 pointer-events-none md:hidden bg-gradient-to-r from-white/95 via-white/85 to-transparent" />
            <div className="relative z-10 p-5 sm:p-7 max-w-lg">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-700 mb-2">
                Wedding & Celebration
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight m-0 mb-1">
                Plan Your Perfect Wedding.
              </h2>
              <p className="text-xs text-gray-500 m-0 mb-1">Find trusted services for your special day:</p>
              <p className="text-xs sm:text-sm text-gray-800 font-semibold m-0 mb-3">
                Venues • Decorators • Photographers • Makeup • Catering & More
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-gray-200/80 shadow-xs">💍 Trusted Service Providers</span>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-gray-200/80 shadow-xs">✨ Multiple Options</span>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-gray-200/80 shadow-xs">📅 Easy Booking</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Custom Category Spotlight Banner (Home Tuition) ── */}
        {(category?.vertical === "HOME_TUITION" || id === "home-tuition" || category?.name?.toLowerCase().includes("tuition") || category?.name?.toLowerCase().includes("tutor")) && (
          <div
            className="mt-5 rounded-2xl overflow-hidden border border-sky-100/80 shadow-sm relative min-h-[220px] sm:min-h-[260px] flex items-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: "url('/banners/tuition_banner.webp')",
              backgroundColor: "#f0f9ff",
              backgroundPosition: "center right",
            }}
          >
            <div className="absolute inset-0 pointer-events-none md:hidden bg-gradient-to-r from-white/95 via-white/85 to-transparent" />
            <div className="relative z-10 p-5 sm:p-7 max-w-lg">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-sky-100 text-sky-700 mb-2">
                Verified Expert Tutors
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight m-0 mb-1.5">
                Find trusted home tutors for:
              </h2>
              <p className="text-xs sm:text-sm text-sky-950 font-semibold m-0 mb-3">
                Maths • Science • English • Computer • Other Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-gray-200/80 shadow-xs">👨‍🏫 Experienced Tutors</span>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-gray-200/80 shadow-xs">🏠 One-to-One Learning</span>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-gray-200/80 shadow-xs">📚 Personalized Classes</span>
              </div>
            </div>
          </div>
        )}

        {/* ── "What service do you need ?" (Visual Grid Cards matching AC design) ── */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 tracking-tight m-0">
            What service do you need ?
          </h2>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {subs.map((sub) => (
              <button
                key={sub.id || sub._id || sub.name}
                onClick={() => handleScrollToSection(sub.name)}
                className="group flex flex-col items-center text-center bg-transparent border-0 cursor-pointer p-0 outline-none transition-transform duration-200 active:scale-95"
              >
                {/* Visual Thumbnail Card */}
                <div className="relative w-full aspect-square max-w-[105px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-xs group-hover:border-purple-300 group-hover:shadow-md transition-all">
                  <img
                    src={
                      sub.imageUrl ||
                      sub.image ||
                      category.imageUrl ||
                      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop"
                    }
                    alt={sub.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop";
                    }}
                  />
                </div>

                {/* Sub-category Label */}
                <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors line-clamp-2 max-w-[100px]">
                  {sub.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Sticky Category Navigation Bar ── */}
        <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md py-3.5 mt-8 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {subs.map((sub) => {
            const isSelected = activeSection === sub.name;
            return (
              <button
                key={sub.id || sub._id || sub.name}
                onClick={() => handleScrollToSection(sub.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>

        {/* ── Service Sections (Grouped matching AC reference) ── */}
        <div className="mt-6 flex flex-col gap-10">
          {subs.map((sub) => {
            const servicesInSection = getServicesForSub(sub, services, category?.vertical);
            if (servicesInSection.length === 0) return null;

            return (
              <section
                key={sub.id || sub._id || sub.name}
                ref={(el) => (sectionRefs.current[sub.name] = el)}
                className="scroll-mt-28"
              >
                {/* Section Header */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-200 m-0">
                  {sub.name}
                </h3>

                {/* Service Cards in this Section */}
                <div className="divide-y divide-slate-100">
                  {servicesInSection.map((service) => (
                    <article
                      key={service._id || service.slug || service.id}
                      className="py-6 sm:py-7 flex items-start justify-between gap-4 sm:gap-6 group"
                    >
                      {/* Left: Info, Ratings, Bullets, Show More, Price & BOOK Button */}
                      <div className="flex-1 min-w-0 pr-2">
                        {/* Title */}
                        <h4
                          onClick={() => setSelectedServiceForModal(service)}
                          className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0 cursor-pointer hover:text-purple-600 transition-colors"
                        >
                          {service.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-800">
                            {service.rating || 4.8}
                          </span>
                          <span className="text-slate-500">
                            ({(service.totalReviews || 1240).toLocaleString("en-IN")} reviews)
                          </span>
                        </div>

                        {/* Dashed Separator */}
                        <div className="w-full border-b border-dashed border-slate-200 my-2.5 max-w-md" />

                        {/* Bullets */}
                        <ul className="m-0 p-0 list-none space-y-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-md">
                          {getServiceBullets(service).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-slate-400 mt-1 select-none">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Show more > link */}
                        <button
                          type="button"
                          onClick={() => setSelectedServiceForModal(service)}
                          className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-700 hover:text-purple-900 mt-2 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          <span>Show more</span>
                          <ChevronRight size={13} />
                        </button>

                        {/* Price & BOOK Button Row */}
                        <div className="flex items-center justify-between mt-4 max-w-md pt-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              ₹{(service.startingPrice || 499).toLocaleString("en-IN")}
                            </span>
                            {service.priceUnit && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                /{service.priceUnit}
                              </span>
                            )}
                          </div>

                          {/* BOOK Button */}
                          <button
                            type="button"
                            onClick={() => handleBookService(service)}
                            className="px-5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95 font-bold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                          >
                            BOOK
                          </button>
                        </div>
                      </div>

                      {/* Right: Clean Service Image */}
                      <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                        <img
                          src={
                            service.thumbnail ||
                            service.imageUrl ||
                            service.bannerImage ||
                            sub.imageUrl ||
                            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop"
                          }
                          alt={service.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop";
                          }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Bottom Support CTA ── */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
          <h3 className="text-xl font-bold text-slate-900 m-0 mb-2">
            Need customized {category.name}?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto m-0 mb-6">
            Speak directly with our dedicated customer support team for custom packages and instant bookings.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wider uppercase hover:bg-purple-600 transition-colors no-underline shadow-sm"
          >
            <span>Contact Support</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Detail Drawer / Modal for "Show More >" ── */}
      <AnimatePresence>
        {selectedServiceForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    {selectedServiceForModal.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">
                      {selectedServiceForModal.rating || 4.8}
                    </span>
                    <span>
                      ({(selectedServiceForModal.totalReviews || 1200).toLocaleString("en-IN")} reviews)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedServiceForModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 border-0 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700">
                {/* Banner / Thumbnail */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={
                      selectedServiceForModal.thumbnail ||
                      selectedServiceForModal.imageUrl ||
                      selectedServiceForModal.bannerImage ||
                      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={selectedServiceForModal.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                    About this service
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                    {selectedServiceForModal.fullDescription ||
                      selectedServiceForModal.description ||
                      selectedServiceForModal.bullets?.join(" ")}
                  </p>
                </div>

                {/* Packages available */}
                {selectedServiceForModal.packages?.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                      Included Options & Packages
                    </h4>
                    <div className="space-y-2.5">
                      {selectedServiceForModal.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs sm:text-sm text-slate-800">
                              {pkg.title}
                            </span>
                            <span className="font-bold text-sm text-purple-700">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          {pkg.features && (
                            <ul className="m-0 p-0 list-none space-y-1 text-xs text-slate-500">
                              {pkg.features.map((feat, fidx) => (
                                <li key={fidx} className="flex items-center gap-1.5">
                                  <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Benefits */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs text-purple-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>TiptoBook Assurance</span>
                  </div>
                  <p className="m-0 leading-relaxed text-purple-800/90">
                    Background-verified professionals • Transparent pricing • Post-service quality guarantee with dedicated support.
                  </p>
                </div>

                {/* FAQs */}
                {selectedServiceForModal.faqs?.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-2">
                      {selectedServiceForModal.faqs.map((faq, idx) => (
                        <details
                          key={idx}
                          className="p-3 rounded-xl border border-slate-200 text-xs bg-white cursor-pointer group"
                        >
                          <summary className="font-semibold text-slate-800 list-none flex items-center justify-between">
                            <span>{faq.question}</span>
                            <ChevronDown
                              size={14}
                              className="text-slate-400 group-open:rotate-180 transition-transform"
                            />
                          </summary>
                          <p className="mt-2 text-slate-600 leading-relaxed m-0 pt-2 border-t border-slate-100">
                            {faq.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with BOOK button */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{(selectedServiceForModal.startingPrice || 499).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const svc = selectedServiceForModal;
                    setSelectedServiceForModal(null);
                    handleBookService(svc);
                  }}
                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  BOOK NOW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Category;