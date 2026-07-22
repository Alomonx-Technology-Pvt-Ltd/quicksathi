import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bike,
  Droplet,
  Cog,
  Users,
  Gauge,
  Shield,
  Car,
  MapPin,
  ShieldCheck
} from "lucide-react";
import api from "../config/api";
import { mockServices } from "../data/mockServices";

/* ── Star rating display ── */
const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#C4A882" : "none"} stroke="#C4A882" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [duration, setDuration] = useState(1); // Default 1 day/hour

  const isNumericId = !isNaN(id) && !isNaN(parseInt(id));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/services/${id}`);
        setProduct(data);
      } catch (err) {
        console.warn("Backend failed or product not found, checking mock data");
        const match = mockServices.find(
          (s) =>
            String(s.id) === String(id) ||
            s.slug === String(id) ||
            s.name?.toLowerCase() === String(id).toLowerCase()
        );

        if (match) {
          setProduct(match);
        } else {
          setError(
            err.response?.data?.message || err.message || "Product not found"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-sm italic" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
          Loading details…
        </span>
      </div>
    );

  if (error || !product)
    return (
      <div className="text-center py-40 text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)", backgroundColor: "var(--color-bg)" }}>
        {error || "Product not found"}
      </div>
    );

  const allImages = [product.bannerImage, ...(product.gallery ?? [])].filter(Boolean);
  const pkg = product.packages?.[selectedPkg];
  const unit = product.priceUnit || "per day";

  // Calculate pricing based on duration and packages
  const basePrice = pkg?.price ?? product.startingPrice;
  const totalPrice = basePrice * duration;

  // Specifications builder
  const getSpecs = () => {
    const name = product.name.toLowerCase();
    if (name.includes("bike") || name.includes("scooter")) {
      return [
        { label: "Category", value: "Scooter / Motorcycle", icon: Bike },
        { label: "Fuel Type", value: "Petrol (Highly Efficient)", icon: Droplet },
        { label: "Transmission", value: "Gearless / Manual", icon: Cog },
        { label: "Capacity", value: "2 Seats", icon: Users },
        { label: "Mileage", value: "45 km/l", icon: Gauge },
        { label: "Helmet", value: "Included", icon: Shield },
      ];
    }
    return [
      { label: "Category", value: name.includes("luxury") ? "Luxury Sedan/SUV" : "Premium Sedan", icon: Car },
      { label: "Fuel Type", value: "Petrol / Diesel", icon: Droplet },
      { label: "Transmission", value: "Automatic", icon: Cog },
      { label: "Capacity", value: "5 - 7 Seats", icon: Users },
      { label: "GPS Security", value: "Real-time Tracking", icon: MapPin },
      { label: "Insurance", value: "Zero-Depreciation", icon: ShieldCheck },
    ];
  };

  const specs = getSpecs();

  const handleBooking = () => {
    const bookingParams = new URLSearchParams({
      name: product.name,
      package: `${pkg?.title || "Standard"} (${duration} ${unit.split(" ")[1]}s)`,
      price: totalPrice.toString(),
    });
    navigate(`/booking/${product.id || product._id}?${bookingParams.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero Gallery ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh", minHeight: "440px" }}>
        {allImages.length > 0 && (
          <img
            src={allImages[activeImg]}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-all duration-700"
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />

        {/* Breadcrumb */}
        <nav className="absolute top-20 left-6 sm:left-12 flex items-center gap-2 text-xs z-10" style={{ fontFamily: "var(--font-body)" }}>
          <Link to="/" className="no-underline text-white/50 hover:text-white">Home</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <Link to={`/category/${product.categoryId || product.category}`} className="no-underline text-white/50 hover:text-white">
            {product.categoryName || "Rentals"}
          </Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <span className="font-semibold text-white/90">{product.name}</span>
        </nav>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="absolute top-20 right-6 sm:right-12 z-10 flex gap-2">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="rounded-xl overflow-hidden border-2 transition-all duration-200"
                style={{
                  width: "56px", height: "40px", padding: 0, cursor: "pointer",
                  borderColor: i === activeImg ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-8 left-6 sm:left-12 z-10">
          <div className="flex gap-2 mb-3">
            {product.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold border border-white/20 backdrop-blur-sm text-white/90" style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.1)" }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-white font-normal leading-tight mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 56px)", letterSpacing: "-0.01em" }}>
            {product.name}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <Stars rating={product.rating} />
            <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {product.rating} · {product.totalReviews} reviews
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {product.experience || "Verified"} Rating
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ── Left Column: Specs & Overview ── */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Specs Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader title="Vehicle Specifications" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div key={idx} className="p-4 rounded-2xl border flex flex-col gap-2" style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}>
                      <span className="text-[#C4A882]" style={{ display: "inline-flex" }}>
                        <Icon size={20} strokeWidth={1.5} />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-mid" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{spec.label}</span>
                      <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{spec.value}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Overview */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SectionHeader title="Rental Overview" />
              <p className="text-base leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                {product.fullDescription}
              </p>
            </motion.div>

            {/* Rental Terms Checklist */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <SectionHeader title="Important Rental Guidelines" />
              <ul className="m-0 p-0 list-none flex flex-col gap-3" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", fontSize: "14px" }}>
                {[
                  "Valid driving license is mandatory at the time of delivery.",
                  "Refundable security deposit is required during vehicle collection.",
                  "Fuel charges are not included in the rental price.",
                  "Late returns are subject to flat hourly extensions fees.",
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* ── Right Column: Interactive Booking & Cost Calculator ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="sticky top-24 rounded-3xl border p-6 flex flex-col gap-6"
              style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-mid" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Select Package
                </p>
                
                {/* Package select buttons */}
                <div className="flex flex-col gap-2.5 mt-3">
                  {product.packages?.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPkg(idx)}
                      type="button"
                      className="w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: selectedPkg === idx ? "var(--color-primary)" : "var(--color-bg-white)",
                        color: selectedPkg === idx ? "#fff" : "var(--color-text-dark)",
                        borderColor: selectedPkg === idx ? "var(--color-primary)" : "var(--color-border)",
                      }}
                    >
                      <div>
                        <p className="m-0 font-semibold text-sm">{p.title}</p>
                        <p className="m-0 text-[10px] opacity-70 mt-0.5">{p.features?.[0]}</p>
                      </div>
                      <span className="font-bold text-sm">₹{p.price?.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Calculator */}
              <div className="border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-mid" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    Rental Duration ({unit.split(" ")[1]}s)
                  </label>
                  <span className="text-sm font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{duration} {unit.split(" ")[1]}s</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                
                <div className="flex justify-between text-[10px] text-muted mt-1 px-1" style={{ color: "var(--color-text-mid)" }}>
                  <span>1 day</span>
                  <span>7 days</span>
                  <span>14 days</span>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="border-t pt-5 flex items-baseline justify-between" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest m-0 text-mid" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Total Cost</p>
                  <p className="text-[10px] italic m-0" style={{ color: "var(--color-text-mid)" }}>₹{basePrice.toLocaleString()} x {duration} {unit.split(" ")[1]}s</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold m-0" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                    ₹{totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                className="w-full py-4 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  boxShadow: "0 6px 24px rgba(139,26,26,0.30)",
                }}
              >
                Proceed to Book Now
              </button>

              <p className="text-[10px] text-center text-muted m-0 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                Refundable security deposit is required during collection. Insurance covers third-party liabilities.
              </p>
            </motion.div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
};

/* ── Reusable section header ── */
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-5">
    <h2 className="text-lg font-normal whitespace-nowrap m-0"
      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
      {title}
    </h2>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, var(--color-accent), transparent)" }} />
  </div>
);

export default ProductDetail;
