import { useState, useEffect } from "react";
// import axios from 'axios'; // Uncomment when backend is ready

export const useFetch = (mockData, delay = 800) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // SIMULATED API CALL
        await new Promise((resolve) => setTimeout(resolve, delay));
        setData(mockData);

        // REAL API CALL (Future)
        // const response = await axios.get(endpoint);
        // setData(response.data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mockData]); // Add endpoint as dependency later

  return { data, loading, error };
};
