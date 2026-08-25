import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Car,
  Sparkles,
  Scissors,
  Wrench,
  GraduationCap,
  ArrowRight,
  Star,
  CalendarCheck
} from "lucide-react";

// Top 6 Real-Time Working Categories
const REAL_CATEGORIES = [
  {
    id: "cctv",
    categoryId: 1,
    title: "CCTV Security",
    icon: ShieldCheck,
    bgColor: "#E8F5E9", // Soft Mint Green
    iconColor: "#166534",
    borderColor: "#C8E6C9",
    activeColor: "#166534",
    route: "/services/cctv",
    fallbackServices: [
      {
        id: 2,
        name: "Home CCTV Installation",
        description: "Comprehensive residential security setup with HD cameras & mobile alerts.",
        startingPrice: 2999,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop",
        badge: "Popular"
      },
      {
        id: 3,
        name: "Commercial CCTV Setup",
        description: "Scalable enterprise security infrastructure & central control station.",
        startingPrice: 8999,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
        badge: "Enterprise"
      },
      {
        id: 5,
        name: "Smart Lock Installation",
        description: "Fingerprint, keypad & smart lock installation by certified technicians.",
        startingPrice: 1999,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop",
        badge: "Smart Home"
      },
      {
        id: 4,
        name: "Security Maintenance",
        description: "Camera alignment, wiring repair, power supply replacement & inspection.",
        startingPrice: 599,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600&auto=format&fit=crop",
        badge: "Repair"
      }
    ]
  },
  {
    id: "rental",
    categoryId: 6,
    title: "Vehicle Rental",
    icon: Car,
    bgColor: "#F3E8FF", // Soft Lavender Purple
    iconColor: "#7E22CE",
    borderColor: "#E9D5FF",
    activeColor: "#7E22CE",
    route: "/services/car-rentals",
    fallbackServices: [
      {
        id: 7,
        name: "Car Rental (Self Drive)",
        description: "Hatchbacks, Sedans & SUVs for daily or long distance trips.",
        startingPrice: 1499,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop",
        badge: "Self Drive"
      },
      {
        id: 8,
        name: "Bike & Scooter Rental",
        description: "Commuter bikes and scooters for flexible city travel & open roads.",
        startingPrice: 399,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&auto=format&fit=crop",
        badge: "Budget"
      },
      {
        id: 9,
        name: "Luxury Car Rental",
        description: "Mercedes, Audi & Range Rover for weddings & VIP corporate events.",
        startingPrice: 7999,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&auto=format&fit=crop",
        badge: "Premium"
      },
      {
        id: 77,
        name: "Chauffeur Outstation Cab",
        description: "Reliable one-way or round-trip outstation cabs with verified drivers.",
        startingPrice: 2499,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=600&auto=format&fit=crop",
        badge: "With Driver"
      }
    ]
  },
  {
    id: "weddings",
    categoryId: 10,
    title: "Wedding & Events",
    icon: Sparkles,
    bgColor: "#FEF3C7", // Soft Warm Amber
    iconColor: "#B45309",
    borderColor: "#FDE68A",
    activeColor: "#B45309",
    route: "/services/weddings",
    fallbackServices: [
      {
        id: 11,
        name: "Wedding Photography",
        description: "Candid photography, cinematic wedding films, drone shoots & albums.",
        startingPrice: 15000,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
        badge: "Cinematic"
      },
      {
        id: 12,
        name: "Stage & Venue Decoration",
        description: "Theme floral stage setup, entryway decor & ambient LED lighting.",
        startingPrice: 25000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
        badge: "Themes"
      },
      {
        id: 13,
        name: "Wedding Catering",
        description: "Multi-cuisine live food counters, buffet setup & professional servers.",
        startingPrice: 450,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600&auto=format&fit=crop",
        badge: "Per Plate"
      },
      {
        id: 14,
        name: "Bridal Makeup Artist",
        description: "HD & Airbrush bridal makeover, hairstyling & saree draping.",
        startingPrice: 8500,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop",
        badge: "Bridal"
      }
    ]
  },
  {
    id: "salon",
    categoryId: 25,
    title: "Home Salon & Beauty",
    icon: Scissors,
    bgColor: "#FFE4E6", // Soft Rose Pink
    iconColor: "#BE123C",
    borderColor: "#FECDD3",
    activeColor: "#BE123C",
    route: "/category/25",
    fallbackServices: [
      {
        id: 26,
        name: "Hair Styling & Care",
        description: "Professional haircuts, hair coloring, keratin, smoothening & scalp care.",
        startingPrice: 799,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop",
        badge: "Best Seller"
      },
      {
        id: 27,
        name: "Facial & Skin Cleanup",
        description: "Rejuvenating facials, organic cleanups, skin brightening & anti-aging care.",
        startingPrice: 999,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
        badge: "Glow Care"
      },
      {
        id: 28,
        name: "Bridal & Party Makeup",
        description: "HD & 3D Airbrush bridal makeup, party glam & hair styling at home.",
        startingPrice: 4999,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop",
        badge: "Certified"
      },
      {
        id: 29,
        name: "Manicure & Pedicure",
        description: "Spa manicure, gel nail art, foot reflexology & hygienic pedicure.",
        startingPrice: 699,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop",
        badge: "Hygiene Pack"
      }
    ]
  },
  {
    id: "help",
    categoryId: 20,
    title: "House Help & Repair",
    icon: Wrench,
    bgColor: "#E0F2FE", // Soft Sky Blue
    iconColor: "#0369A1",
    borderColor: "#BAE6FD",
    activeColor: "#0369A1",
    route: "/category/20",
    fallbackServices: [
      {
        id: 21,
        name: "Maid & Deep Cleaning",
        description: "Daily or monthly home cleaning services with verified maids.",
        startingPrice: 1499,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
        badge: "Verified"
      },
      {
        id: 22,
        name: "Home Cook Service",
        description: "Experienced home cooks offering multi-cuisine healthy meals.",
        startingPrice: 2999,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
        badge: "Healthy Meals"
      },
      {
        id: 23,
        name: "Babysitting & Nanny",
        description: "Professional and caring child care services for toddlers and kids.",
        startingPrice: 3500,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
        badge: "Caring Tutors"
      },
      {
        id: 24,
        name: "Elder & Patient Care",
        description: "Trained caregivers for assistance & support for elderly family members.",
        startingPrice: 4000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop",
        badge: "Trained Staff"
      }
    ]
  },
  {
    id: "tuition",
    categoryId: 15,
    title: "Home Tuition",
    icon: GraduationCap,
    bgColor: "#E0E7FF", // Soft Indigo
    iconColor: "#3730A3",
    borderColor: "#C7D2FE",
    activeColor: "#3730A3",
    route: "/category/15",
    fallbackServices: [
      {
        id: 16,
        name: "School Academics (Class 1-10)",
        description: "Maths, Science & English home tuition by verified experienced tutors.",
        startingPrice: 2500,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop",
        badge: "Class 1-10"
      },
      {
        id: 17,
        name: "Online Tuition Classes",
        description: "Interactive online classes with expert tutors & live doubt solving.",
        startingPrice: 1999,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
        badge: "Online"
      },
      {
        id: 18,
        name: "Competitive Exam Prep",
        description: "Expert coaching for JEE, NEET, Olympiads & entrance examinations.",
        startingPrice: 4500,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop",
        badge: "Exam Prep"
      },
      {
        id: 19,
        name: "Language & Spoken English",
        description: "Learn Spoken English, Hindi, German & French from certified trainers.",
        startingPrice: 1499,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
        badge: "Languages"
      }
    ]
  }
];

const QuickServicesSection = ({ categories = [], services = [] }) => {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState("cctv");

  const activeCategoryConfig = REAL_CATEGORIES.find((c) => c.id === activeCategoryId) || REAL_CATEGORIES[0];

  // Dynamically match services from backend/categories props if available
  const getDisplayServices = () => {
    if (services && services.length > 0) {
      const matched = services.filter((s) => {
        const catId = activeCategoryConfig.categoryId;
        return s.categoryId === catId || s.parentCategory === catId;
      });
      if (matched.length > 0) return matched.slice(0, 4);
    }
    
    // Check in category subCategories
    const categoryInProps = categories.find((c) => c.id === activeCategoryConfig.categoryId || c._id === activeCategoryConfig.categoryId);
    if (categoryInProps && categoryInProps.subCategories && categoryInProps.subCategories.length > 0) {
      return categoryInProps.subCategories.slice(0, 4).map((sub) => ({
        id: sub.id || sub._id,
        _id: sub._id || sub.id,
        name: sub.name,
        description: sub.description,
        startingPrice: sub.startingPrice || activeCategoryConfig.fallbackServices[0]?.startingPrice || 1999,
        rating: sub.rating || 4.8,
        imageUrl: sub.imageUrl || activeCategoryConfig.fallbackServices[0]?.imageUrl,
        badge: "Active Service"
      }));
    }

    return activeCategoryConfig.fallbackServices;
  };

  const displayServices = getDisplayServices();

  const handleBookClick = (service) => {
    // Try to find the real backend service by matching name
    const realService = services?.find(
      (s) =>
        s.name?.toLowerCase() === service.name?.toLowerCase() ||
        s.name?.toLowerCase().includes(service.name?.toLowerCase()) ||
        service.name?.toLowerCase().includes(s.name?.toLowerCase())
    );

    if (realService) {
      // Use the real backend service ID and data
      const serviceId = realService._id || realService.id;
      const price = realService.startingPrice || service.startingPrice || 999;
      const packageTitle = realService.packages?.[0]?.title || "Standard";
      const query = new URLSearchParams({
        name: realService.name || service.name,
        package: packageTitle,
        price: price.toString(),
      });
      navigate(`/booking/${serviceId}?${query.toString()}`);
    } else {
      // No real service found — navigate to category/service detail page
      // so user can browse and select a proper service with packages
      navigate(activeCategoryConfig.route);
    }
  };

  return (
    <section
      className="w-full py-14 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Section Header — editorial style from image 3 ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-2">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              Popular Services
            </p>
            <h2
              className="text-3xl sm:text-4xl font-semibold m-0 leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              Discover what we offer
            </h2>
          </div>
          <p
            className="text-base sm:text-lg italic hidden sm:block"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}
          >
            Discover our services and how we do it better
          </p>
        </div>

        {/* ── TOP: Category Tab Bar ── */}
        <div
          className="no-scrollbar flex gap-2.5 mb-8 pb-1"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
        >
          {REAL_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = category.id === activeCategoryId;

            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategoryId(category.id)}
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 outline-none"
                style={{
                  backgroundColor: isActive ? "#1c1c1c" : "transparent",
                  border: isActive ? "1.5px solid #1c1c1c" : "1.5px solid rgba(0,0,0,0.18)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? "#ffffff" : "#444" }}
                  strokeWidth={1.8}
                />
                <span
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: isActive ? "#ffffff" : "#333" }}
                >
                  {category.title}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* ── BOTTOM: Category title row + Cards — no wrapper box ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategoryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {/* Category Title & "View All" — sits directly on section bg */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3">
                <h3
                  className="text-xl sm:text-2xl font-semibold m-0"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                >
                  {activeCategoryConfig.title}
                </h3>
                <div
                  className="hidden sm:block h-px w-16"
                  style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                />
              </div>

              <Link
                to={activeCategoryConfig.route}
                className="inline-flex items-center gap-1.5 no-underline self-start sm:self-auto"
              >
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: "#1c1c1c",
                    color: "#ffffff",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  View All Services
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            {/* Service Cards Grid — 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayServices.map((service) => (
                <div
                  key={service._id || service.id}
                  className="flex flex-col justify-between overflow-hidden group cursor-pointer"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    transition: "transform 0.28s ease, box-shadow 0.28s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.13)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Thumbnail Image */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      borderRadius: "20px 20px 0 0",
                      backgroundColor: "#e8e0d4",
                      height: "clamp(120px, 18vw, 180px)",
                    }}
                  >
                    <img
                      src={service.imageUrl || service.thumbnail || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop"}
                      alt={service.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient overlay at bottom for text readability */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.22), transparent)" }}
                    />

                    {/* Badge */}
                    {service.badge && (
                      <span
                        className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          borderRadius: "6px",
                          color: "#ffffff",
                          backgroundColor: "rgba(0,0,0,0.42)",
                          backdropFilter: "blur(6px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {service.badge}
                      </span>
                    )}

                    {/* Star rating */}
                    <div
                      className="absolute top-2.5 right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: "8px",
                        color: "#1c1c1c",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      }}
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{service.rating || 4.8}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-3.5 sm:p-5 gap-3">
                    <h4
                      className="text-xs sm:text-sm font-semibold m-0 leading-snug line-clamp-2 flex-1"
                      style={{ fontFamily: "var(--font-display)", color: "#1c1c1c" }}
                    >
                      {service.name}
                    </h4>

                    {/* Price & Book in one row */}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span
                          className="text-[9px] uppercase font-semibold tracking-widest block"
                          style={{ color: "#aaa" }}
                        >
                          From
                        </span>
                        <span
                          className="text-sm sm:text-base font-bold leading-none"
                          style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}
                        >
                          ₹{(service.startingPrice || 999).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleBookClick(service)}
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-white border-none cursor-pointer active:scale-95 transition-all"
                        style={{
                          backgroundColor: "#1c1c1c",
                          borderRadius: "20px",
                          padding: "6px 14px",
                          fontFamily: "var(--font-body)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span>Book</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};

export default QuickServicesSection;
