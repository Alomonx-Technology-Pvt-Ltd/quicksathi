import { useTranslation } from "react-i18next";
import { Star, ChevronRight } from "lucide-react";
import { formatPrice, formatPriceUnit } from "../../content/catalogue";

/**
 * One service row in a category listing. `service` is the display copy
 * (applyContent output); callbacks receive nothing so the caller books with
 * its own DB record.
 */
const CatalogueServiceItem = ({
  service,
  bullets = service.bullets || [],
  onOpen,
  onBook,
  image,
  fallbackImage,
}) => {
  const { t } = useTranslation();

  return (
    <article className="py-6 sm:py-7 flex items-start justify-between gap-4 sm:gap-6 group">
      <div className="flex-1 min-w-0 pr-2">
        <h4
          onClick={onOpen}
          className="text-base sm:text-lg font-bold text-slate-900 leading-snug m-0 cursor-pointer hover:text-purple-600 transition-colors"
        >
          {service.name}
        </h4>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          {service.rating > 0 ? (
            <>
              <span className="font-semibold text-slate-800">{service.rating}</span>
              <span className="text-slate-500">
                {t("common.reviewsCount", {
                  count: (service.totalReviews || 0).toLocaleString("en-IN"),
                })}
              </span>
            </>
          ) : (
            <span className="font-semibold text-slate-800">{t("common.newService")}</span>
          )}
        </div>

        <div className="w-full border-b border-dashed border-slate-200 my-2.5 max-w-md" />

        <ul className="m-0 p-0 list-none space-y-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-md">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-slate-400 mt-1 select-none">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-700 hover:text-purple-900 mt-2 bg-transparent border-0 p-0 cursor-pointer transition-colors"
        >
          <span>{t("common.showMore")}</span>
          <ChevronRight size={13} />
        </button>

        <div className="flex items-center justify-between mt-4 max-w-md pt-2">
          <div className="flex items-baseline gap-1">
            {service.startingPrice > 0 && (
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                {formatPrice(service.startingPrice)}
              </span>
            )}
            {service.priceUnit && (
              <span className="text-[11px] text-slate-500 font-normal">
                {formatPriceUnit(service.priceUnit)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onBook}
            className="px-5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95 font-bold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
          >
            {t("common.book")}
          </button>
        </div>
      </div>

      <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
        <img
          src={image || fallbackImage}
          alt={service.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />
      </div>
    </article>
  );
};

export default CatalogueServiceItem;
