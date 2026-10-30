import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, X, CheckCircle2, XCircle, Sparkles, ChevronDown } from "lucide-react";
import { formatPrice } from "../../content/catalogue";

/**
 * "Show more" dialog for a category listing. `service` is the display copy
 * (applyContent output); the caller books with its own DB record via onBook.
 */
const CatalogueServiceModal = ({
  service,
  onClose,
  onBook,
  image,
  fallbackImage,
  assuranceTitle,
  assuranceText,
}) => {
  const { t } = useTranslation();

  // Escape key & background scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={service.name}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0">{service.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {service.rating > 0 ? (
                <>
                  <span className="font-semibold text-slate-800">{service.rating}</span>
                  <span>
                    {t("common.reviewsCount", {
                      count: (service.totalReviews || 0).toLocaleString("en-IN"),
                    })}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-slate-800">{t("common.newService")}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 border-0 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700">
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={image || fallbackImage}
              alt={service.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImage;
              }}
            />
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
              {t("catalogue.aboutService")}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              {service.fullDescription || service.description || service.bullets?.join(" ")}
            </p>
          </div>

          {service.packages?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                {t("catalogue.packagesHeading")}
              </h4>
              <div className="space-y-2.5">
                {service.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-xs sm:text-sm text-slate-800">{pkg.title}</span>
                      <span className="font-bold text-sm text-purple-700 whitespace-nowrap">
                        {pkg.priceLabel || formatPrice(pkg.price)}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="m-0 text-xs text-slate-600">{pkg.description}</p>
                    )}
                    {pkg.features?.length > 0 && (
                      <ul className="m-0 p-0 list-none space-y-1 text-xs text-slate-500">
                        {pkg.features.map((feat, fidx) => (
                          <li key={fidx} className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {service.excludes?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                {t("catalogue.whatsNotIncluded")}
              </h4>
              <ul className="m-0 p-0 list-none space-y-1 text-xs text-slate-600">
                {service.excludes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <XCircle size={12} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.extraCharges?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                {t("catalogue.extraCharges")}
              </h4>
              <ul className="m-0 p-0 list-none space-y-1 text-xs text-slate-600">
                {service.extraCharges.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs text-purple-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={14} className="text-purple-600" />
              <span>{assuranceTitle}</span>
            </div>
            <p className="m-0 leading-relaxed text-purple-800/90">{assuranceText}</p>
          </div>

          {service.faqs?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                {t("catalogue.faqs")}
              </h4>
              <div className="space-y-2">
                {service.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 text-xs bg-white cursor-pointer group"
                  >
                    <summary className="font-semibold text-slate-800 list-none flex items-center justify-between">
                      <span>{faq.question}</span>
                      <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-2 text-slate-600 leading-relaxed m-0 pt-2 border-t border-slate-100">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div>
            {service.startingPrice > 0 && (
              <>
                <span className="text-[11px] text-slate-400 block font-medium">{t("common.startingFrom")}</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(service.startingPrice)}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onBook}
            className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            {t("common.bookNow")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CatalogueServiceModal;
