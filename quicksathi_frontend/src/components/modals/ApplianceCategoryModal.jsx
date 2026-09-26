import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const APPLIANCE_SERVICES = [
  {
    section: "AC & APPLIANCE REPAIR",
    items: [
      {
        id: "ac-repair",
        name: "AC Repair & Services",
        icon: "/icons/appliances/ac-repair.jpg",
        route: "/services/ac",
        badge: "Popular",
      },
      {
        id: "washing-machine",
        name: "Washing Machine Repair",
        icon: "/icons/appliances/washing-machine.jpg",
        route: "/service/washing-machine-repair",
      },
      {
        id: "refrigerator",
        name: "Refrigerator Repair & Services",
        icon: "/icons/appliances/refrigerator.jpg",
        route: "/service/refrigerator-repair",
      },
      {
        id: "tv-repair",
        name: "TV Repair & Services",
        icon: "/icons/appliances/tv-repair.jpg",
        route: "/service/tv-repair",
      },
    ],
  },
  {
    section: "OTHER APPLIANCES",
    items: [
      {
        id: "geyser-repair",
        name: "Geyser Repair & Services",
        icon: "/icons/appliances/geyser-repair.jpg",
        route: "/service/geyser-repair",
        badge: "Essential",
      },
    ],
  },
];

const ApplianceCategoryModal = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof propIsOpen === "boolean";
  const isOpen = isControlled ? propIsOpen : internalOpen;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalOpen(false);
  };

  // Listen for global open event
  useEffect(() => {
    const handleGlobalOpen = () => setInternalOpen(true);
    window.addEventListener("open-appliance-modal", handleGlobalOpen);
    return () => window.removeEventListener("open-appliance-modal", handleGlobalOpen);
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
            className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden z-10 my-auto p-5 sm:p-7"
            style={{
              boxShadow: "0 25px 70px -12px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* Header: Title and Close Button */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight">
                    Appliance Repair
                  </h3>
                  <p className="text-[11.5px] text-slate-500 m-0 leading-none mt-0.5">
                    Select your appliance for instant verified booking
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

            {/* Sections Content */}
            <div className="mt-4 flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
              {APPLIANCE_SERVICES.map((sec) => (
                <div key={sec.section}>
                  {/* Section Label */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
                      {sec.section}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* 3-Column Grid */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                    {sec.items.map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSelectService(item.route)}
                        className="group flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 hover:bg-purple-50/50 border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer outline-none relative"
                      >
                        {/* Popular / Essential Badge */}
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white tracking-wide shadow-xs">
                            {item.badge}
                          </span>
                        )}

                        {/* High-res Appliance Icon Tile */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-slate-100/80 p-1 flex items-center justify-center overflow-hidden shadow-xs group-hover:shadow-sm transition-all">
                          <img
                            src={item.icon}
                            alt={item.name}
                            loading="eager"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/icons/categories/ac-appliances.png";
                            }}
                          />
                        </div>

                        {/* Title */}
                        <span className="mt-2 text-[11px] sm:text-[12px] font-semibold text-slate-800 group-hover:text-purple-700 leading-snug line-clamp-2 transition-colors">
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
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified & Background-Checked Pros
              </span>
              <span>Fixed Price Guarantee</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplianceCategoryModal;
