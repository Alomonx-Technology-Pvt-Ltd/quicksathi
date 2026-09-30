import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  ChevronDown,
  Check,
  Star,
  Users,
  ShieldCheck,
  Sparkles,
  Clock,
  Shield,
} from "lucide-react";
import { useLocation } from "../../context/LocationContext";

const HeroBanner = ({ service, allImages = [], activeImg = 0, setActiveImg }) => {
  const {
    city,
    street,
    road,
    locality,
    fullLocation,
    detecting,
    setCity,
    cityOptions = [],
  } = useLocation();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Format real-time location matching AC page
  const realTimeLocation = useMemo(() => {
    if (street && locality && street !== locality) return `${street}, ${locality}`;
    if (road && locality && road !== locality) return `${road}, ${locality}`;
    if (locality && city && locality !== city) return `${locality}, ${city}`;
    if (locality) return locality;
    if (street) return street;
    if (road) return road;
    if (city) return city;
    if (fullLocation) {
      const parts = fullLocation.split(",").map((p) => p.trim()).filter(Boolean);
      return parts.slice(0, 2).join(", ");
    }
    return null;
  }, [street, road, locality, city, fullLocation]);

  const currentImg = allImages[activeImg] || service.bannerImage || service.thumbnail;

  return (
    <div className="w-full bg-white border-b border-slate-100 pt-4 sm:pt-6 pb-6 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* ── Top Bar: Location + City Dropdown + Breadcrumbs ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Real-time Location Pill & City Picker */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Real-time located user location */}
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-purple-50/80 border border-purple-100/90 px-2.5 py-1 rounded-full shadow-2xs">
              <MapPin size={13} className="text-purple-600 shrink-0" />
              <span>
                {detecting
                  ? "Locating in real-time..."
                  : realTimeLocation || "Current Location"}
              </span>
              {detecting && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping inline-block ml-0.5" />
              )}
            </div>

            {/* Select city dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-purple-700 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer text-xs"
              >
                <span>{city ? `City: ${city}` : "Select city"}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    isCityDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCityDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCityDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 z-50 w-48 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 no-scrollbar">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select City
                    </div>
                    {cityOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCity(c);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 hover:text-purple-700 border-0 bg-transparent cursor-pointer flex items-center justify-between transition-colors ${
                          city === c
                            ? "font-bold text-purple-700 bg-purple-50/50"
                            : "text-slate-700"
                        }`}
                      >
                        <span>{c}</span>
                        {city === c && <Check size={12} className="text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link to="/" className="text-slate-500 hover:text-purple-600 no-underline transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            {service.categoryId && (
              <>
                <Link
                  to={`/category/${service.categoryId}`}
                  className="text-slate-500 hover:text-purple-600 no-underline transition-colors truncate max-w-[140px]"
                >
                  {service.categoryName || "Category"}
                </Link>
                <span className="text-slate-300">/</span>
              </>
            )}
            <span className="text-slate-900 font-semibold truncate max-w-[180px]">
              {service.name}
            </span>
          </nav>
        </div>

        {/* ── Main Header Title & Metadata ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
          <div>
            {/* Tags row */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                {service.tags.slice(0, 5).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Service Name */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
              {service.name}
            </h1>

            {/* Trust Badges matching AC Category Page */}
            <div className="flex items-center gap-2 sm:gap-2.5 mt-3 flex-wrap text-xs">
              {/* Star Rating */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 font-semibold border border-slate-200/60 shadow-xs">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{service.rating || 4.8} Rating</span>
                <span className="text-slate-500 font-normal">
                  ({(service.totalReviews || 2890).toLocaleString("en-IN")} reviews)
                </span>
              </div>

              {/* 200+ Happy Customers */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 font-semibold border border-slate-200/60 shadow-xs">
                <Users size={12} className="text-purple-600" />
                <span>200+ Happy Customers</span>
              </div>

              {/* Verified Experts */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 font-semibold border border-slate-200/60 shadow-xs">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Verified Experts</span>
              </div>

              {/* Experience or Warranty badge */}
              {service.experience && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 font-semibold border border-purple-100 shadow-xs">
                  <Sparkles size={12} className="text-purple-600" />
                  <span>{service.experience} Experience</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Starting Price Banner */}
          <div className="flex items-baseline md:flex-col md:items-end gap-1.5 shrink-0 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-2xl border md:border-0 border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹{(service.startingPrice || 349).toLocaleString("en-IN")}
              </span>
              {service.priceUnit && (
                <span className="text-xs text-slate-500 font-normal">
                  /{service.priceUnit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Modern Media Showcase / Image Card (No outdated dark full-bleed) ── */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/80">
          <div className="relative w-full aspect-[21/9] min-h-[220px] sm:min-h-[280px] max-h-[420px] overflow-hidden">
            <img
              src={currentImg}
              alt={service.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop";
              }}
            />

            {/* Gradient Scrim for subtle bottom readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

            {/* Left bottom badge */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-5 z-10 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>TiptoBook Guaranteed</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                <Clock size={12} className="text-amber-400" />
                <span>30-Day Warranty</span>
              </span>
            </div>

            {/* Right bottom gallery thumbnail switcher */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 z-10 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-2xl">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg && setActiveImg(idx)}
                    className={`relative w-9 h-7 sm:w-12 sm:h-9 rounded-lg overflow-hidden border-2 p-0 cursor-pointer transition-all ${
                      idx === activeImg
                        ? "border-purple-400 scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;