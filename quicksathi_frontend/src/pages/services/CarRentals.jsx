import { useState } from "react";
import { Link } from "react-router-dom";
import mercedese from "../../assets/mercedes.avif";
import rangeRover from "../../assets/rangeRover.avif";
import audiImg from "../../assets/audiImg.avif";
import teslaImg from "../../assets/teslaImg.avif";
import hondaImg from "../../assets/hondaImg.avif";

import {
  Star,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Tag,
  CalendarDays,
  Search,
  Wrench,
  IndianRupee,
  Users,
  Briefcase,
  Fuel,
  ArrowRight,
} from "lucide-react";
import Process from "../../components/carRental/Process";
import DocumentRequirement from "../../components/carRental/DocumentsRequirement";

const CARS = [
  {
    name: "Mercedes-Benz S-Class",
    category: "Luxury",
    segment: "LUXURY SEGMENT",
    image: mercedese,
    price: 15000,
    originalPrice: 18000,
    seats: 5,
    kit: "Luxury Kit",
    fuel: "4.5L/100KM",
    tags: ["WEDDING FAVOURITE", "AUTOMATIC"],
    featured: true,
    type: "Luxury",
    link: "/product/luxury-cars",
  },
  {
    name: "Range Rover Defender",
    category: "SUV / Adventure",
    image: rangeRover,
    price: 12500,
    seats: 7,
    tags: ["OFF ROAD READY"],
    type: "SUVs",
    link: "/product/luxury-cars",
  },
  {
    name: "Audi A4 Executive",
    category: "Sedan",
    image: audiImg,
    price: 8000,
    tags: ["PETROL", "AUTO"],
    type: "Economy",
    link: "/product/car-rental",
  },
  {
    name: "Tesla Model 3",
    category: "Electric",
    image: teslaImg,
    price: 9500,
    tags: ["ELECTRIC", "FULL AUTOPILOT"],
    type: "Economy",
    link: "/product/car-rental",
  },
  {
    name: "Honda Civic Comfort",
    category: "Sedan",
    image: hondaImg,
    price: 3500,
    tags: ["ECONOMY", "FUEL EFFICIENT"],
    type: "Economy",
    link: "/product/car-rental",
  },
];

const FILTERS = ["All Cars", "Economy", "Luxury", "SUVs"];

const CarRentals = () => {
  const [activeFilter, setActiveFilter] = useState("All Cars");
  const [serviceType, setServiceType] = useState("self-drive");
  const [days, setDays] = useState(3);

  const filteredCars =
    activeFilter === "All Cars"
      ? CARS
      : CARS.filter((c) => c.type === activeFilter);
  const featuredCar = CARS.find((c) => c.featured);

  const dailyRate = 3500;
  const discount = days >= 3 ? Math.round(dailyRate * days * 0.05) : 0;
  const total = dailyRate * days - discount;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Hero */}
     
      <section
        className="relative w-full overflow-hidden flex items-end"
        style={{
          minHeight: "55vh",
          background:
            "linear-gradient(135deg, #0a1628 0%, #122447 50%, #1a3a6b 100%)",
        }}
      >
        {/* subtle texture for depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{
            background:
              "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06), transparent 55%)",
          }}
        />

        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 pb-12 pt-28">
          <h1
            className="text-white font-bold leading-tight mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 4.5vw, 56px)",
            }}
          >
            Premium Rides for Every
            <br />
            Journey
          </h1>
          <p
            className="text-white/55 text-sm sm:text-base mb-5"
            style={{ fontFamily: "var(--font-body)", maxWidth: "520px" }}
          >
            From luxury sedans for weddings to rugged SUVs for mountain escapes.
            <br />
            Verified vehicles, professional drivers, 24/7 peace of mind.
          </p>

          {/* Trust line */}
          <div
            className="flex items-center gap-5 mb-8 text-white/70 text-xs sm:text-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="flex items-center gap-1.5">
              <Star size={14} strokeWidth={0} fill="#facc15" />
              <span className="font-semibold text-white">4.8</span>
              <span>rating</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} strokeWidth={2} />
              50,000+ trips completed
            </span>
          </div>

          {/* Search Bar */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 p-3 sm:p-2 rounded-2xl max-w-3xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            {/* Service Type Toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              {["self-drive", "with-driver"].map((type) => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor:
                      serviceType === type ? "#1a3a6b" : "transparent",
                    color:
                      serviceType === type ? "#fff" : "var(--color-text-mid)",
                  }}
                >
                  {type === "self-drive" ? "Self Drive" : "With Driver"}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 sm:px-4">
              <div className="relative flex-1">
                <MapPin
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-mid)" }}
                />
                <input
                  placeholder="City or Airport"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none"
                  style={{
                    fontFamily: "var(--font-body)",
                    borderColor: "var(--color-border)",
                  }}
                />
              </div>
              <div className="relative flex-1">
                <CalendarDays
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-mid)" }}
                />
                <input
                  type="text"
                  placeholder="Mar 15 - Mar 20"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none"
                  style={{
                    fontFamily: "var(--font-body)",
                    borderColor: "var(--color-border)",
                  }}
                />
              </div>
            </div>

            <button
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "#1a3a6b",
                color: "#fff",
              }}
            >
              <Search size={16} strokeWidth={2.2} />
              Find Cars
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-10 sm:py-12"
        style={{ backgroundColor: "#1a3a6b" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              Icon: ShieldCheck,
              title: "Verified Vehicles",
              desc: "Every car undergoes a 120-point safety inspection.",
            },
            {
              Icon: Wrench,
              title: "24/7 Roadside",
              desc: "Instant support anywhere, anytime, for any issue.",
            },
            {
              Icon: IndianRupee,
              title: "Price Guarantee",
              desc: "No hidden charges. What you see is what you pay.",
            },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="flex items-center justify-center shrink-0 rounded-xl"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <badge.Icon size={20} strokeWidth={1.8} color="#ffffff" />
              </div>
              <div>
                <p
                  className="text-white text-sm font-semibold m-0"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {badge.title}
                </p>
                <p
                  className="text-white/55 text-xs m-0 mt-1 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Fleet */}
      
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header with Black Friday Banner */}
          {/* Header with Filters on Right */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
  <div>
    <h2
      className="font-normal mb-2"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(24px, 3vw, 36px)",
        color: "var(--color-text-dark)",
      }}
    >
      Explore Our Fleet
    </h2>
    <p
      className="text-sm"
      style={{
        fontFamily: "var(--font-body)",
        color: "var(--color-text-mid)",
      }}
    >
      Filter by category to find your perfect match.
    </p>
  </div>

  {/* Premium Filter Pills */}
  <div
    className="flex flex-wrap gap-1 p-1.5 rounded-2xl w-fit"
    style={{
      backgroundColor: "rgba(26, 58, 107, 0.05)",
      border: "1px solid var(--color-border)",
    }}
  >
    {FILTERS.map((f) => (
      <button
        key={f}
        onClick={() => setActiveFilter(f)}
        className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all duration-300 whitespace-nowrap"
        style={{
          fontFamily: "var(--font-body)",
          background:
            activeFilter === f
              ? "linear-gradient(135deg, #1a3a6b 0%, #234a85 100%)"
              : "transparent",
          color: activeFilter === f ? "#fff" : "var(--color-text-mid)",
          boxShadow:
            activeFilter === f
              ? "0 4px 12px rgba(26, 58, 107, 0.25)"
              : "none",
        }}
      >
        {f}
      </button>
    ))}
  </div>
</div>

<div className="mb-6">
  <h3
    className="text-lg font-normal mt-1"
    style={{
      fontFamily: "var(--font-display)",
      color: "var(--color-text-dark)",
    }}
  >
    Find the Best Deals For You
  </h3>
</div>

          {/* Featured Car - Full Width Banner Style */}
          {featuredCar && activeFilter === "All Cars" && (
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer mb-8">
              <div className="relative" style={{ height: "320px" }}>
                <img
                  src={featuredCar.image}
                  alt={featuredCar.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 80%)",
                  }}
                />

                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {featuredCar.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor: tag.includes("WEDDING")
                          ? "#c4185a"
                          : "#1a3a6b",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Content */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p
                      className="text-white/60 text-xs uppercase tracking-wider m-0"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {featuredCar.segment}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-white/85">
                      <Star size={12} strokeWidth={0} fill="#facc15" />
                      {featuredCar.rating ?? 4.8}
                    </span>
                  </div>
                  <h3
                    className="text-white text-3xl font-normal mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {featuredCar.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div
                      className="flex flex-wrap items-center gap-4 text-white/60 text-xs"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Users size={13} strokeWidth={1.8} />
                        {featuredCar.seats} Seats
                      </span>
                      {featuredCar.kit && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={13} strokeWidth={1.8} />
                          {featuredCar.kit}
                        </span>
                      )}
                      {featuredCar.fuel && (
                        <span className="flex items-center gap-1.5">
                          <Fuel size={13} strokeWidth={1.8} />
                          {featuredCar.fuel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {featuredCar.originalPrice && (
                          <span
                            className="text-white/40 line-through text-sm"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            ₹{featuredCar.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span
                          className="text-white font-bold text-2xl"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          ₹{featuredCar.price.toLocaleString()}
                        </span>
                        <span
                          className="text-white/50 text-xs"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          /day
                        </span>
                      </div>
                      <Link
                        to={featuredCar.link}
                        className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer no-underline transition-all duration-200 hover:opacity-90 text-center"
                        style={{
                          fontFamily: "var(--font-body)",
                          backgroundColor: "#1a3a6b",
                          color: "#fff",
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Car Grid - 4 Cards Per Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars
              .filter((c) => !c.featured || activeFilter !== "All Cars")
              .map((car, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
                  style={{
                    backgroundColor: "var(--color-bg-white)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {car.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded text-[9px] font-semibold text-white"
                          style={{
                            backgroundColor: tag.includes("ELECTRIC")
                              ? "#16a34a"
                              : "#1a3a6b",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      <Star size={11} strokeWidth={0} fill="#facc15" />
                      {car.rating ?? 4.6}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3
                      className="text-sm font-semibold mb-1"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {car.name}
                    </h3>

                    <div
                      className="flex items-center justify-between mt-2 pt-2 border-t"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span
                        className="text-base font-bold"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "#1a3a6b",
                        }}
                      >
                        ₹{car.price.toLocaleString()}
                        <span
                          className="text-[10px] font-normal"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          /day
                        </span>
                      </span>
                      <Link
                        to={car.link}
                        className="text-xs font-semibold no-underline transition-all duration-200 hover:opacity-70"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "#1a3a6b",
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Documents Requirements  */}
      <DocumentRequirement />

     

      {/* How it work Process */}
      <Process />

      {/* Why Choose + Price Calculator */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20"
        style={{ backgroundColor: "var(--color-bg-soft)" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Why Choose */}
          <div>
            <h2
              className="font-normal mb-8"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3vw, 36px)",
                color: "var(--color-text-dark)",
              }}
            >
              Why choose QuickSathi?
            </h2>
            {[
              {
                Icon: CheckCircle2,
                title: "No Hidden Fees",
                desc: "Mandatory insurance and taxes are always included in the initial quote.",
              },
              {
                Icon: RefreshCw,
                title: "Flexible Cancellation",
                desc: "Free cancellation up to 24 hours before your trip starts.",
              },
              {
                Icon: Sparkles,
                title: "Premium Support",
                desc: "Dedicated concierge for luxury bookings and long-term rentals.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div
                  className="flex items-center justify-center shrink-0 rounded-xl"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "rgba(26,58,107,0.08)",
                  }}
                >
                  <item.Icon size={18} strokeWidth={1.8} color="#1a3a6b" />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm mb-1 m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-sm m-0 leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Calculator */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "var(--color-bg-white)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              className="text-lg font-normal mb-6"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-dark)",
              }}
            >
              Quick Price Calculator
            </h3>
            <div className="mb-4">
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                Select Duration
              </label>
              <div className="flex gap-2">
                {[1, 3, 5, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold border cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: days === d ? "#1a3a6b" : "transparent",
                      color: days === d ? "#fff" : "var(--color-text-mid)",
                      borderColor:
                        days === d ? "#1a3a6b" : "var(--color-border)",
                    }}
                  >
                    {d} {d === 1 ? "Day" : "Days"}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="flex flex-col gap-3 py-4"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <div
                className="flex justify-between text-sm"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span style={{ color: "var(--color-text-mid)" }}>
                  Economy Daily Rate
                </span>
                <span style={{ color: "var(--color-text-dark)" }}>
                  ₹{dailyRate.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div
                  className="flex justify-between text-sm"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: "var(--color-text-mid)" }}
                  >
                    <Tag size={13} strokeWidth={1.8} />
                    Duration Discount (5%)
                  </span>
                  <span style={{ color: "#16a34a" }}>
                    -₹{discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div
                className="flex justify-between text-lg font-bold pt-3"
                style={{
                  borderTop: "1px solid var(--color-border)",
                  fontFamily: "var(--font-display)",
                }}
              >
                <span style={{ color: "var(--color-text-dark)" }}>
                  Estimated Total
                </span>
                <span style={{ color: "#1a3a6b" }}>
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "#1a3a6b",
                color: "#fff",
              }}
            >
              Proceed to Book
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarRentals;
