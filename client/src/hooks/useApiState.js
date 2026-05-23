"use client";

import { useCallback, useEffect, useState } from "react";

export function useApiState(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to load data";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void run();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [run]);

  return { data, loading, error, refetch: run, setData };
}
