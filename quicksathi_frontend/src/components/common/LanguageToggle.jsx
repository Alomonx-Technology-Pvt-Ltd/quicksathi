import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n";

const LanguageToggle = ({ className = "" }) => {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold ${className}`}
    >
      {LANGUAGES.map(({ code, label }) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            onClick={() => i18n.changeLanguage(code)}
            className={`px-2.5 py-1 rounded-full border-0 cursor-pointer transition-colors ${
              active ? "bg-purple-600 text-white shadow-xs" : "bg-transparent text-slate-600 hover:text-purple-700"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
