import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShieldCheck } from "lucide-react";

const SALON_SERVICES = [
  {
    section: "SALON AT HOME FOR WOMEN",
    items: [
      {
        id: "hair-styling-care",
        name: "Hair Styling & Care",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=hair-styling-care",
        badge: "Popular",
      },
      {
        id: "facial-cleanup",
        name: "Facial & Cleanup",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=facial-cleanup",
        badge: "Glow Care",
      },
      {
        id: "bridal-party-makeup",
        name: "Bridal & Party Makeup",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=bridal-party-makeup",
        badge: "Trending",
      },
      {
        id: "manicure-pedicure",
        name: "Manicure & Pedicure",
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=manicure-pedicure",
      },
      {
        id: "waxing-threading",
        name: "Waxing & Threading",
        image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=waxing-threading",
        badge: "Essential",
      },
      {
        id: "spa-body-polishing",
        name: "Spa & Body Care",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=facial-cleanup",
      },
    ],
  },
  {
    section: "MEN'S GROOMING & SPA",
    items: [
      {
        id: "mens-haircut",
        name: "Men's Haircut & Styling",
        image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=mens-salon-spa",
        badge: "Top Rated",
      },
      {
        id: "beard-grooming",
        name: "Beard Trim & Care",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=mens-salon-spa",
      },
      {
        id: "mens-massage",
        name: "Head & Body Massage",
        image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=300&auto=format&fit=crop",
        route: "/category/home-salon?sub=mens-salon-spa",
      },
    ],
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

  const handleSelectService = (route) => {
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

          {/* Modal Container: Clean unified single background matching Appliance modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[490px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-auto p-5 sm:p-7"
            style={{
              boxShadow: "0 25px 70px -12px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* Header: Title and Close Button */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-100/80 text-pink-600 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight">
                    Home Salon & Beauty
                  </h3>
                  <p className="text-[11.5px] text-slate-500 m-0 leading-none mt-0.5">
                    Certified beauticians & single-use kits at your home
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center border-none cursor-pointer p-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sections Content — Scrollbars hidden cleanly */}
            <div className="mt-4 flex flex-col gap-5 max-h-[70vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5">
              {SALON_SERVICES.map((sec) => (
                <div key={sec.section}>
                  {/* Section Label */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
                      {sec.section}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* 3-Column Clean Icon Grid: matching ApplianceCategoryModal style */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                    {sec.items.map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSelectService(item.route)}
                        className="group flex flex-col items-center text-center p-2 sm:p-2.5 rounded-2xl bg-transparent hover:bg-slate-50/80 transition-all duration-200 cursor-pointer outline-none relative border-0"
                      >
                        {/* Popular / Essential Badge */}
                        {item.badge && (
                          <span className="absolute top-0.5 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-600 text-white tracking-wide shadow-xs z-10">
                            {item.badge}
                          </span>
                        )}

                        {/* Clean High-res Beauty Icon Tile */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center relative p-0.5 bg-pink-50/40 border border-slate-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="eager"
                            className="w-full h-full object-cover rounded-xl drop-shadow-xs group-hover:scale-108 transition-transform duration-300 select-none pointer-events-none"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/icons/categories/home-salon.png";
                            }}
                          />
                        </div>

                        {/* Title */}
                        <span className="mt-2 text-[11px] sm:text-[12px] font-semibold text-slate-800 group-hover:text-pink-700 leading-snug line-clamp-2 transition-colors">
                          {item.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
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
                onClick={() => handleSelectService("/category/home-salon")}
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
