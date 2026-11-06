import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hiLatn from "./locales/hi-Latn.json";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi-Latn", label: "Hinglish" },
];

const STORAGE_KEY = "tb_lang";
const SUPPORTED = LANGUAGES.map((l) => l.code);

const readStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : "en";
  } catch {
    return "en";
  }
};

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // storage unavailable (private mode) — language still applies for this session
  }
  document.documentElement.lang = lng;
});

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "hi-Latn": { translation: hiLatn },
  },
  lng: readStoredLanguage(),
  fallbackLng: "en",
  supportedLngs: SUPPORTED,
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

export default i18n;
