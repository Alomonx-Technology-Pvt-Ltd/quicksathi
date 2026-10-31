import { useTranslation } from "react-i18next";
import SectionHeader from "./SectionHeader";
import { ShieldCheck, Sparkles, Wrench, Clock, CheckCircle2 } from "lucide-react";

const AboutSection = ({ service }) => {
  const { t } = useTranslation();
  return (
    <div id="about-section" className="scroll-mt-24">
      <SectionHeader
        title={t("serviceDetail.about.title")}
        subtitle={t("serviceDetail.about.subtitle")}
      />

      <div className="bg-slate-50/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/70 mb-6">
        <p className="text-sm sm:text-base leading-relaxed text-slate-700 m-0">
          {service.fullDescription || service.shortDescription || service.description}
        </p>

        {service.bullets && service.bullets.length > 0 && (
          <ul className="mt-4 pt-4 border-t border-slate-200/60 list-none p-0 m-0 space-y-2">
            {service.bullets.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4 Feature Value Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Wrench size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            {t("serviceDetail.about.diagnosisTitle")}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            {t("serviceDetail.about.diagnosisText")}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            {t("serviceDetail.about.warrantyTitle")}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            {t("serviceDetail.about.warrantyText")}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            {t("serviceDetail.about.pricingTitle")}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            {t("serviceDetail.about.pricingText")}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            {t("serviceDetail.about.onTimeTitle")}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            {t("serviceDetail.about.onTimeText")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;