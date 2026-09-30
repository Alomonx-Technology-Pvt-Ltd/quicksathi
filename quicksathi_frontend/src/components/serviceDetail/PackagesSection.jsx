import { useState } from "react";
import SectionHeader from "./SectionHeader";
import {
  Car,
  Star,
  ChevronRight,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const PackagesSection = ({
  packages = [],
  selectedPkg = 0,
  setSelectedPkg,
  isRental = false,
  onShowMore,
  service = {},
}) => {
  if (!packages?.length) return null;

  return (
    <div id="packages-section" className="scroll-mt-24">
      <SectionHeader
        title={isRental ? "Choose Vehicle Variation" : "Select Service Package"}
        subtitle={
          isRental
            ? "Transparent pricing with verified commercial drivers and clean AC cabs"
            : "Select a package for instant doorstep service by verified professionals"
        }
      />

      {/* ── Standard Service Packages (Urban Company Style) ── */}
      {!isRental && (
        <div className="divide-y divide-slate-100 border-y border-slate-100">
          {packages.map((pkg, i) => {
            const isSelected = i === selectedPkg;
            const originalPrice = pkg.price ? Math.round(pkg.price * 1.25) : null;
            const pkgImage =
              pkg.image ||
              service.thumbnail ||
              service.bannerImage ||
              "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=300&auto=format&fit=crop";

            return (
              <article
                key={pkg.id || pkg._id || i}
                onClick={() => setSelectedPkg(i)}
                className={`py-5 sm:py-6 flex items-start justify-between gap-4 sm:gap-6 group cursor-pointer transition-all duration-200 px-2 sm:px-3 rounded-2xl ${
                  isSelected
                    ? "bg-purple-50/40 border border-purple-100 my-1 shadow-2xs"
                    : "hover:bg-slate-50/70 border border-transparent"
                }`}
              >
                {/* Left: Info, Rating, Bullets, Show More, Price & BOOK Button */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0 group-hover:text-purple-700 transition-colors">
                      {pkg.title}
                    </h3>
                    {pkg.recommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs tracking-wide">
                        RECOMMENDED
                      </span>
                    )}
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-2xs tracking-wide">
                        <Check size={11} strokeWidth={3} />
                        SELECTED
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">
                      {service.rating || 4.8}
                    </span>
                    <span className="text-slate-500">
                      ({(service.totalReviews || 2890).toLocaleString("en-IN")} reviews)
                    </span>
                  </div>

                  {/* Dashed Separator */}
                  <div className="w-full border-b border-dashed border-slate-200 my-2.5 max-w-md" />

                  {/* Features / Bullets matching AC reference */}
                  <ul className="m-0 p-0 list-none space-y-1.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-md">
                    {(pkg.features || []).slice(0, 3).map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-1.5">
                        <span className="text-purple-500 mt-0.5 select-none font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* "Show more >" link to open popup modal */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShowMore) {
                        onShowMore(pkg);
                      }
                    }}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-700 hover:text-purple-900 mt-2.5 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                  >
                    <span>Show more</span>
                    <ChevronRight size={13} />
                  </button>

                  {/* Price & BOOK / SELECT Button Row */}
                  <div className="flex items-center justify-between mt-4 max-w-md pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-xl font-extrabold text-slate-900">
                        ₹{(pkg.price || service.startingPrice || 349).toLocaleString("en-IN")}
                      </span>
                      {originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-normal">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      {service.priceUnit && (
                        <span className="text-[11px] text-slate-500 font-normal">
                          /{service.priceUnit}
                        </span>
                      )}
                    </div>

                    {/* BOOK / SELECT Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPkg(i);
                      }}
                      className={`px-5 py-2 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-purple-600 text-white border border-purple-600 shadow-md scale-102"
                          : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={13} strokeWidth={3} />
                          <span>SELECTED</span>
                        </>
                      ) : (
                        <span>SELECT</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Clean Service/Package Image */}
                <div className="relative shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                  <img
                    src={pkgImage}
                    alt={pkg.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=300&auto=format&fit=crop";
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Rental Vehicle Variation Cards (Preserves Car Rental functionality) ── */}
      {isRental && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packages.map((p, i) => {
            const isSelected = i === selectedPkg;
            return (
              <button
                key={p.id || p._id || i}
                type="button"
                onClick={() => setSelectedPkg(i)}
                className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-purple-50/50 border-purple-600 shadow-md ring-2 ring-purple-600/20"
                    : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-sm"
                }`}
              >
                {/* Vehicle Thumbnail */}
                {p.image && (
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                      <Car size={12} />
                      <span>{p.title}</span>
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    {p.title}
                  </h3>
                  <span className="text-lg font-extrabold text-purple-700">
                    ₹{p.price?.toLocaleString()}
                  </span>
                </div>

                <ul className="m-0 p-0 list-none space-y-1 text-xs text-slate-600 mb-3">
                  {p.features?.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold">
                  <span className="text-slate-500">Chauffeur Driven</span>
                  <span className={isSelected ? "text-purple-700 font-bold" : "text-slate-400"}>
                    {isSelected ? "Selected ✓" : "Click to select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PackagesSection;