"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTerjaminApi } from "@/lib/api/kpiService";

export interface UseTerjaminReturn {
  terjamin: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useTerjamin(): UseTerjaminReturn {
  const [terjamin, setTerjamin] = useState<string>("781");
  const [count, setCount] = useState<number | null>(781);
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
      const result = await fetchTerjaminApi(true);

      setTerjamin(result.formatted);
      setCount(result.count);
      setSource(result.source);
      setIsError(!result.success);

      if (!result.success) {
        setError(result.error || "Gagal memuat data Terjamin");
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("[useTerjamin] Fetch error:", err);
      setIsError(true);
      setError(err?.message || "Gagal memuat data Terjamin");
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    terjamin,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
