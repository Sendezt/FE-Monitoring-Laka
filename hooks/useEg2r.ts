"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchEg2rApi } from "@/lib/api/kpiService";

export interface UseEg2rReturn {
  eg2r: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useEg2r(): UseEg2rReturn {
  const [eg2r, setEg2r] = useState<string>("473");
  const [count, setCount] = useState<number | null>(473);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await fetchEg2rApi(true);

      setEg2r(result.formatted);
      setCount(result.count);
      setSource(result.source);
      setIsError(!result.success);

      if (!result.success) {
        setError(result.error || "Gagal memuat data EG2R");
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("[useEg2r] Fetch error:", err);
      setIsError(true);
      setError(err?.message || "Gagal memuat data EG2R");
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    eg2r,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
