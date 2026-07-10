import { useState, useEffect } from "react";
import api from "../config/api";

export const useFetch = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoint);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error, setData };
};
