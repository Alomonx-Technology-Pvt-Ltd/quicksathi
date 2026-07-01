import { useState } from "react";
import { Link } from "react-router-dom";

const CARS = [
  {
    name: "Mercedes-Benz S-Class",
    category: "Luxury",
    segment: "LUXURY SEGMENT",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070&auto=format&fit=crop",
    price: 15000,
    originalPrice: 18000,
    seats: 5,
    kit: "Luxury Kit",
    fuel: "4.5L/100KM",
    tags: ["WEDDING FAVOURITE", "AUTOMATIC"],
    featured: true,
    type: "Luxury",
  },
  {
    name: "Range Rover Defender",
    category: "SUV / Adventure",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=2070&auto=format&fit=crop",
    price: 12500,
    seats: 7,
    tags: ["OFF ROAD READY"],
    type: "SUVs",
  },
  {
    name: "Audi A4 Executive",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=2070&auto=format&fit=crop",
    price: 8000,
    tags: ["PETROL", "AUTO"],
    type: "Economy",
  },
  {
    name: "Tesla Model 3",
    category: "Electric",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    price: 9500,
    tags: ["ELECTRIC", "FULL AUTOPILOT"],
    type: "Economy",
  },
  {
    name: "Honda Civic Comfort",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
    price: 3500,
    tags: ["ECONOMY", "FUEL EFFICIENT"],
    type: "Economy",
  },
];

const FILTERS = ["All Cars", "Economy", "Luxury", "SUVs"];

const CarRentals = () => {
  const [activeFilter, setActiveFilter] = useState("All Cars");
  const [serviceType, setServiceType] = useState("self-drive");
  const [days, setDays] = useState(3);

  const filteredCars = activeFilter === "All Cars" ? CARS : CARS.filter((c) => c.type === activeFilter);
  const featuredCar = CARS.find((c) => c.featured);

  const dailyRate = 3500;
  const discount = days >= 3 ? Math.round(dailyRate * days * 0.05) : 0;
  const total = dailyRate * days - discount;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Hero */}
      <section
        className="relative w-full overflow-hidden flex items-end"
        style={{ minHeight: "55vh", background: "linear-gradient(135deg, #0a1628 0%, #122447 50%, #1a3a6b 100%)" }}
      >
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 pb-12 pt-28">
          <h1
            className="text-white font-bold leading-tight mb-3"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 56px)" }}
          >
            Premium Rides for Every<br />Journey
          </h1>
          <p className="text-white/55 text-sm sm:text-base mb-8" style={{ fontFamily: "var(--font-body)", maxWidth: "520px" }}>
            From luxury sedans for weddings to rugged SUVs for mountain escapes.<br />
            Verified vehicles, professional drivers, 24/7 peace of mind.
          </p>

          {/* Search Bar */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 p-3 sm:p-2 rounded-2xl max-w-3xl"
            style={{ backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            {/* Service Type Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }}>
              {["self-drive", "with-driver"].map((type) => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: serviceType === type ? "#1a3a6b" : "transparent",
                    color: serviceType === type ? "#fff" : "var(--color-text-mid)",
                  }}
                >
                  {type === "self-drive" ? "Self Drive" : "With Driver"}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 sm:px-4">
              <input
                placeholder="City or Airport"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)" }}
              />
              <input
                type="text"
                placeholder="Mar 15 - Mar 20"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)" }}
              />
            </div>

            <button
              className="px-6 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a3a6b", color: "#fff" }}
            >
              Find Cars
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 sm:px-8 lg:px-16 py-8" style={{ backgroundColor: "#1a3a6b" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "🛡️", title: "Verified Vehicles", desc: "Every car undergoes a 120-point safety inspection." },
            { icon: "🔧", title: "24/7 Roadside", desc: "Instant support anywhere, anytime, for any issue." },
            { icon: "💰", title: "Price Guarantee", desc: "No hidden charges. What you see is what you pay." },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                {badge.icon}
              </div>
              <div>
                <p className="text-white text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)" }}>{badge.title}</p>
                <p className="text-white/50 text-xs m-0 mt-1" style={{ fontFamily: "var(--font-body)" }}>{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Fleet */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-normal mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", color: "var(--color-text-dark)" }}>
                Explore Our Fleet
              </h2>
              <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                Filter by category to find your perfect match.
              </p>
            </div>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: activeFilter === f ? "#1a3a6b" : "transparent",
                    color: activeFilter === f ? "#fff" : "var(--color-text-mid)",
                    borderColor: activeFilter === f ? "#1a3a6b" : "var(--color-border)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Car */}
          {featuredCar && activeFilter === "All Cars" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div
                className="relative overflow-hidden rounded-2xl group cursor-pointer"
                style={{ height: "380px" }}
              >
                <img src={featuredCar.image} alt={featuredCar.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                <div className="absolute top-4 left-4 flex gap-2">
                  {featuredCar.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: tag.includes("WEDDING") ? "#c4185a" : "#1a3a6b", fontFamily: "var(--font-body)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)" }}>{featuredCar.segment}</p>
                  <h3 className="text-white text-2xl font-normal mb-2" style={{ fontFamily: "var(--font-display)" }}>{featuredCar.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white/60 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                      <span>🪑 {featuredCar.seats} Seats</span>
                      <span>🎒 {featuredCar.kit}</span>
                      <span>⛽ {featuredCar.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {featuredCar.originalPrice && (
                        <span className="text-white/40 line-through text-sm" style={{ fontFamily: "var(--font-body)" }}>₹{featuredCar.originalPrice.toLocaleString()}</span>
                      )}
                      <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>₹{featuredCar.price.toLocaleString()}</span>
                      <span className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>/day</span>
                    </div>
                  </div>
                  <button
                    className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a3a6b", color: "#fff" }}
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Second featured car */}
              <div className="relative overflow-hidden rounded-2xl group cursor-pointer" style={{ height: "380px" }}>
                <img src={CARS[1].image} alt={CARS[1].name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                <div className="absolute top-4 left-4 flex gap-2">
                  {CARS[1].tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "#1a3a6b", fontFamily: "var(--font-body)" }}>{tag}</span>
                  ))}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-body)" }}>{CARS[1].category}</p>
                  <h3 className="text-white text-xl font-normal mb-1" style={{ fontFamily: "var(--font-display)" }}>{CARS[1].name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>₹{CARS[1].price.toLocaleString()}<span className="text-white/50 text-xs font-normal">/day</span></span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/10 transition-all">
                      <span className="text-white text-lg">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Car Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.filter(c => !c.featured || activeFilter !== "All Cars").map((car, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)" }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {car.tags?.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: tag.includes("ELECTRIC") ? "#16a34a" : "#1a3a6b", fontFamily: "var(--font-body)", fontSize: "10px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>{car.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                      ₹{car.price.toLocaleString()}<span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>/day</span>
                    </span>
                    <Link to="/contact" className="text-sm font-semibold no-underline" style={{ fontFamily: "var(--font-body)", color: "#1a3a6b" }}>
                      View Specs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose + Price Calculator */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20" style={{ backgroundColor: "var(--color-bg-soft)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Why Choose */}
          <div>
            <h2 className="font-normal mb-8" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", color: "var(--color-text-dark)" }}>
              Why choose QuickSathi?
            </h2>
            {[
              { icon: "✅", title: "No Hidden Fees", desc: "Mandatory insurance and taxes are always included in the initial quote." },
              { icon: "🔄", title: "Flexible Cancellation", desc: "Free cancellation up to 24 hours before your trip starts." },
              { icon: "⭐", title: "Premium Support", desc: "Dedicated concierge for luxury bookings and long-term rentals." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-1 m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{item.title}</p>
                  <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Calculator */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h3 className="text-lg font-normal mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Quick Price Calculator</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                Select Duration
              </label>
              <div className="flex gap-2">
                {[1, 3, 5, 7].map((d) => (
                  <button key={d} onClick={() => setDays(d)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold border cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: days === d ? "#1a3a6b" : "transparent",
                      color: days === d ? "#fff" : "var(--color-text-mid)",
                      borderColor: days === d ? "#1a3a6b" : "var(--color-border)",
                    }}>
                    {d} {d === 1 ? "Day" : "Days"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
              <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--color-text-mid)" }}>Economy Daily Rate</span>
                <span style={{ color: "var(--color-text-dark)" }}>₹{dailyRate.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  <span style={{ color: "var(--color-text-mid)" }}>Duration Discount (5%)</span>
                  <span style={{ color: "#16a34a" }}>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3" style={{ borderTop: "1px solid var(--color-border)", fontFamily: "var(--font-display)" }}>
                <span style={{ color: "var(--color-text-dark)" }}>Estimated Total</span>
                <span style={{ color: "#1a3a6b" }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarRentals;
