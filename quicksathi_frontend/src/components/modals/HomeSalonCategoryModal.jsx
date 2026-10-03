import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShieldCheck } from "lucide-react";

const GENDER_OPTIONS = [
  {
    id: "women",
    label: "Women",
    subtitle: "Hair, Facial, Bridal Makeup, Waxing & more",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=480&auto=format&fit=crop",
    route: "/category/home-salon?gender=women",
    gradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
    accentColor: "#db2777",
    badgeColor: "#ec4899",
    iconBg: "rgba(236, 72, 153, 0.12)",
  },
  {
    id: "men",
    label: "Men",
    subtitle: "Haircut, Beard Styling, Grooming & Spa",
    image:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=480&auto=format&fit=crop",
    route: "/category/home-salon?gender=men",
    gradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
    accentColor: "#2563eb",
    badgeColor: "#3b82f6",
    iconBg: "rgba(59, 130, 246, 0.12)",
  },
];

const HomeSalonCategoryModal = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof propIsOpen === "boolean";
  const isOpen = isControlled ? propIsOpen : internalOpen;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalOpen(false);
  };

  // Listen for global open events for salon
  useEffect(() => {
    const handleGlobalOpen = () => setInternalOpen(true);
    window.addEventListener("open-salon-modal", handleGlobalOpen);
    window.addEventListener("open-home-salon-modal", handleGlobalOpen);
    return () => {
      window.removeEventListener("open-salon-modal", handleGlobalOpen);
      window.removeEventListener("open-home-salon-modal", handleGlobalOpen);
    };
  }, []);

  // Close on Escape key press & prevent background body scrolling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleSelectGender = (route) => {
    handleClose();
    navigate(route);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-auto p-5 sm:p-7"
            style={{
              boxShadow: "0 25px 70px -12px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-600 flex items-center justify-center">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight">
                    Home Salon & Beauty
                  </h3>
                  <p className="text-[11.5px] text-slate-500 m-0 leading-none mt-0.5">
                    Certified beauticians at your doorstep
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center border-none cursor-pointer p-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Gender Selection Prompt */}
            <div className="mt-5 mb-4 text-center">
              <p className="text-sm font-semibold text-slate-800 m-0">
                Choose your service category
              </p>
              <p className="text-[11.5px] text-slate-400 m-0 mt-1">
                Select to explore available salon services
              </p>
            </div>

            {/* Two Gender Cards */}
            <div className="flex flex-col gap-3 sm:gap-3.5">
              {GENDER_OPTIONS.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectGender(option.route)}
                  className="group relative w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 bg-white hover:border-transparent cursor-pointer outline-none transition-all duration-250"
                  style={{
                    boxShadow: "0 2px 10px -2px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = option.gradient;
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.boxShadow = `0 8px 24px -4px ${option.accentColor}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = "rgba(226,232,240,0.7)";
                    e.currentTarget.style.boxShadow = "0 2px 10px -2px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                    <img
                      src={option.image}
                      alt={option.label}
                      loading="eager"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/icons/categories/home-salon.png";
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left min-w-0">
                    <h4
                      className="text-base sm:text-lg font-bold m-0 text-slate-900 tracking-tight group-hover:text-opacity-100 transition-colors"
                      style={{ "--hover-color": option.accentColor }}
                    >
                      {option.label}
                    </h4>
                    <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 mt-1 leading-relaxed line-clamp-2 group-hover:text-slate-600 transition-colors">
                      {option.subtitle}
                    </p>

                    {/* CTA hint */}
                    <span
                      className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: option.accentColor }}
                    >
                      Explore Services →
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Modal Footer Note */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-pink-600 font-medium">
                <ShieldCheck size={13} className="text-pink-600 shrink-0" />
                100% Sealed Single-Use Kits
              </span>
              <button
                type="button"
                onClick={() => handleSelectGender("/category/home-salon")}
                className="text-pink-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Full Salon Menu →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HomeSalonCategoryModal;
