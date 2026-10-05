import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap } from "lucide-react";

const TUITION_SERVICES = [
  {
    section: "SCHOOL & ACADEMIC TUITION",
    items: [
      {
        id: "nursery-to-class-5",
        name: "Nursery to Class 5",
        badge: "Foundation",
        image:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300&auto=format&fit=crop",
        fallbackIcon: "/icons/categories/home-tuition.png",
        route: "/category/home-tuition",
      },
      {
        id: "classes-6-8",
        name: "Classes 6–8",
        badge: "Middle School",
        image:
          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=300&auto=format&fit=crop",
        fallbackIcon: "/icons/categories/home-tuition.png",
        route: "/category/home-tuition",
      },
      {
        id: "classes-9-10",
        name: "Classes 9–10",
        badge: "Board Prep",
        image:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop",
        fallbackIcon: "/icons/categories/home-tuition.png",
        route: "/category/home-tuition",
      },
      {
        id: "classes-11-12",
        name: "Classes 11–12",
        badge: "Competitive",
        image:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop",
        fallbackIcon: "/icons/categories/home-tuition.png",
        route: "/category/home-tuition",
      },
    ],
  },
];

const HomeTuitionCategoryModal = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof propIsOpen === "boolean";
  const isOpen = isControlled ? propIsOpen : internalOpen;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalOpen(false);
  };

  // Listen for global open events
  useEffect(() => {
    const handleGlobalOpen = () => setInternalOpen(true);
    window.addEventListener("open-tuition-modal", handleGlobalOpen);
    window.addEventListener("open-home-tuition-modal", handleGlobalOpen);
    return () => {
      window.removeEventListener("open-tuition-modal", handleGlobalOpen);
      window.removeEventListener("open-home-tuition-modal", handleGlobalOpen);
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
          {/* Backdrop with optimized GPU compositing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            style={{ willChange: "opacity" }}
            aria-hidden="true"
          />

          {/* Modal Container: Optimized GPU Promoted Sheet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-auto p-5 sm:p-7"
            style={{
              boxShadow: "0 25px 70px -12px rgba(15, 23, 42, 0.22)",
              transform: "translateZ(0)",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Header: Title and Close Button */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight">
                    Home Tuition
                  </h3>
                  <p className="text-[11.5px] text-slate-500 m-0 leading-none mt-0.5">
                    Select your tuition option for doorstep or online classes
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 transition-all duration-150 flex items-center justify-center border-none cursor-pointer p-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sections Content — 3-Column Clean Icon Grid matching AC popup */}
            <div className="mt-4 flex flex-col gap-5 max-h-[70vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5">
              {TUITION_SERVICES.map((sec) => (
                <div key={sec.section}>
                  {/* Section Label */}
                  {sec.section && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
                        {sec.section}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                  )}

                  {/* 3-Column Clean Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                    {sec.items.map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        onClick={() => handleSelectService(item.route)}
                        className="group flex flex-col items-center text-center p-2 sm:p-2.5 rounded-2xl bg-transparent hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer outline-none relative border-0"
                        style={{ transform: "translateZ(0)" }}
                      >
                        {/* Optional Badge */}
                        {item.badge && (
                          <span className="absolute top-0.5 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white tracking-wide shadow-xs z-10 pointer-events-none">
                            {item.badge}
                          </span>
                        )}

                        {/* Clean High-res Image Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative p-1 shrink-0 aspect-square">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="eager"
                            decoding="async"
                            draggable="false"
                            className="w-full h-full object-cover rounded-2xl drop-shadow-xs group-hover:scale-108 transition-transform duration-200 ease-out select-none pointer-events-none"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = item.fallbackIcon;
                            }}
                          />
                        </div>

                        {/* Title Only */}
                        <span className="mt-2 text-[11px] sm:text-[12px] font-semibold text-slate-800 group-hover:text-indigo-600 leading-snug line-clamp-2 transition-colors duration-150">
                          {item.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HomeTuitionCategoryModal;
