import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import structure from "./structure.json";

export { structure };

// Explicit map so Vite emits one chunk per language file.
const LOADERS = {
  en: () => import("./en.json"),
  "hi-Latn": () => import("./hi-Latn.json"),
};

const pending = {};
const loaded = {};
const merged = {};

const loadLanguage = (lang) => {
  if (!pending[lang]) {
    pending[lang] = LOADERS[lang]().then((mod) => {
      loaded[lang] = mod.default;
      return mod.default;
    });
  }
  return pending[lang];
};

const isMissing = (value) => value === undefined || value === null || value === "";

const mergeFields = (primary = {}, fallback = {}) => {
  const out = { ...fallback };
  for (const [field, value] of Object.entries(primary)) {
    if (!isMissing(value)) out[field] = value;
  }
  return out;
};

const mergeService = (primary, fallback) => {
  if (!primary) return fallback;
  if (!fallback) return primary;
  const out = mergeFields(primary, fallback);
  const keys = new Set([
    ...Object.keys(fallback.packages ?? {}),
    ...Object.keys(primary.packages ?? {}),
  ]);
  out.packages = {};
  for (const key of keys) {
    out.packages[key] = mergeFields(primary.packages?.[key], fallback.packages?.[key]);
  }
  return out;
};

/** Active-language content with English filling any missing slug or field. */
export const mergeContent = (active, en) => {
  const services = {};
  const slugs = new Set([...Object.keys(en.services), ...Object.keys(active.services ?? {})]);
  for (const slug of slugs) {
    services[slug] = mergeService(active.services?.[slug], en.services[slug]);
  }
  return { groups: mergeFields(active.groups, en.groups), services };
};

const resolveContent = (lang) => {
  const en = loaded.en;
  if (lang === "en" || !loaded[lang]) return en ?? null;
  if (!en) return loaded[lang];
  if (!merged[lang]) merged[lang] = mergeContent(loaded[lang], en);
  return merged[lang];
};

/**
 * Catalogue display text for the active UI language, or null while loading.
 * Re-renders when the language changes.
 */
export const useCatalogueContent = () => {
  const { i18n } = useTranslation();
  const lang = LOADERS[i18n.resolvedLanguage] ? i18n.resolvedLanguage : "en";
  const [, setReady] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([loadLanguage("en"), loadLanguage(lang)]).then(() => {
      if (active) setReady((n) => n + 1);
    });
    return () => {
      active = false;
    };
  }, [lang]);

  return resolveContent(lang);
};

/** Shared key between DB package titles and content `packages` entries. */
export const packageKey = (title) =>
  String(title ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** ₹ with Indian digit grouping; keeps decimals (3.5 -> "₹3.5"). */
export const formatPrice = (n) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return "";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

/** "per job" stays as-is; legacy bare units ("visit") render as "/visit". */
export const formatPriceUnit = (unit) => {
  if (!unit) return "";
  return /^(per\s|\/)/i.test(unit) ? unit : `/${unit}`;
};

const fillPriceLabel = (template, price) =>
  template.replaceAll("{price}", formatPrice(price));

/**
 * Display copy of an API service with text from catalogue content.
 * Package order and prices always come from the DB; content only supplies text.
 */
export const applyContent = (service, content) => {
  const entry = service?.slug ? content?.services?.[service.slug] : null;
  if (!entry) return service;

  const out = { ...service };
  for (const field of ["name", "shortDescription", "fullDescription", "priceUnit"]) {
    if (!isMissing(entry[field])) out[field] = entry[field];
  }
  for (const field of ["bullets", "faqs", "extraCharges", "excludes"]) {
    if (Array.isArray(entry[field]) && entry[field].length > 0) out[field] = entry[field];
  }

  if (Array.isArray(service.packages)) {
    out.packages = service.packages.map((pkg) => {
      const text = entry.packages?.[packageKey(pkg.title)];
      if (!text) return pkg;
      return {
        ...pkg,
        title: text.title || pkg.title,
        description: text.description || pkg.description,
        priceLabel: text.priceLabel ? fillPriceLabel(text.priceLabel, pkg.price) : pkg.priceLabel,
      };
    });
  }
  return out;
};

export const MORE_GROUP_KEY = "__more";

/** Heading for a group returned by groupByStructure. */
export const groupTitle = (key, content, t) =>
  key === MORE_GROUP_KEY ? t("catalogue.moreServices") : content?.groups?.[key] ?? key;

const idOf = (value) => (value && typeof value === "object" ? value._id ?? value.id : value);

/**
 * API services that belong to a vertical: listed under it in the structure,
 * or linked to the given category id in the DB.
 */
export const servicesForVertical = (services, vertical, categoryId) => {
  const catId = categoryId ? String(categoryId) : null;
  return (services ?? []).filter(
    (s) =>
      (vertical && structure.services[s.slug]?.vertical === vertical) ||
      (catId && String(idOf(s.category)) === catId)
  );
};

/**
 * Groups API services by the vertical's structure groups (group slug order).
 * Services not placed in any group of the vertical go to a trailing MORE_GROUP_KEY
 * group (omitted when filtering by gender). Empty groups are dropped.
 * Returns null when the vertical has no structure.
 */
export const groupByStructure = (services, vertical, { gender } = {}) => {
  const verticalStructure = structure.verticals[vertical];
  if (!verticalStructure) return null;

  const bySlug = new Map((services ?? []).map((s) => [s.slug, s]));
  const placed = new Set(verticalStructure.groups.flatMap((g) => g.slugs));

  const groups = verticalStructure.groups
    .filter((g) => !gender || g.gender === gender)
    .map((g) => ({
      key: g.key,
      gender: g.gender,
      services: g.slugs.map((slug) => bySlug.get(slug)).filter(Boolean),
    }));

  if (!gender) {
    groups.push({
      key: MORE_GROUP_KEY,
      services: (services ?? []).filter((s) => !placed.has(s.slug)),
    });
  }
  return groups.filter((g) => g.services.length > 0);
};
