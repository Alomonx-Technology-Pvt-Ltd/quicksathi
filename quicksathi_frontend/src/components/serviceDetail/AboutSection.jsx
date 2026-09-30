import SectionHeader from "./SectionHeader";
import { ShieldCheck, Sparkles, Wrench, Clock, CheckCircle2 } from "lucide-react";

const AboutSection = ({ service }) => {
  return (
    <div id="about-section" className="scroll-mt-24">
      <SectionHeader
        title="About this Service"
        subtitle="Professional doorstep execution with certified experts and verified equipment"
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
            Expert Diagnosis
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            Accurate issue pinpointing before any repair.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            30-Day Warranty
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            Complete peace of mind on all service parts.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            Fixed Pricing
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            Standardized rates with zero hidden charges.
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock size={16} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
            On-Time Arrival
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 m-0 leading-snug">
            Slot guaranteed doorstep arrival within 60 mins.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;