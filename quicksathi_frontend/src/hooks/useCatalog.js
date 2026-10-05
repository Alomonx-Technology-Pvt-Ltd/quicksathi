import { useCallback, useEffect, useState } from "react";
import api, { getCached } from "../config/api";

// One place that loads the public catalog (categories + services) from the API.
// There is no offline/mock fallback: when the API is down the caller gets `error` and shows it.

const withIds = (item) => ({
  ...item,
  id: item.id || item._id,
  _id: item._id || item.id,
  subCategories: item.subCategories?.map((sub) => ({ ...sub, id: sub.id || sub._id, _id: sub._id || sub.id })),
});

// Concurrent callers (Home, Hero, featured sections...) share one in-flight request per URL.
const inflight = new Map();
const load = (url) => {
  const cached = getCached(url);
  if (cached) return Promise.resolve(cached);
  if (!inflight.has(url)) {
    inflight.set(url, api.get(url).then((r) => r.data).finally(() => inflight.delete(url)));
  }
  return inflight.get(url);
};

export function useCatalog({ city } = {}) {
  const servicesUrl = `/services${city ? `?city=${encodeURIComponent(city)}` : ""}`;
  const [state, setState] = useState(() => ({
    categories: (getCached("/categories") || []).map(withIds),
    services: (getCached(servicesUrl) || []).map(withIds),
    loading: true,
    error: "",
  }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([load("/categories"), load(servicesUrl)])
      .then(([categories, services]) => {
        if (cancelled) return;
        setState({
          categories: (Array.isArray(categories) ? categories : []).map(withIds),
          services: (Array.isArray(services) ? services : []).map(withIds),
          loading: false,
          error: "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err?.response?.data?.message || "We couldn't load services right now." }));
      });
    return () => { cancelled = true; };
  }, [servicesUrl, attempt]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
