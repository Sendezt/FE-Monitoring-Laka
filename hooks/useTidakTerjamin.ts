"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTidakTerjaminApi } from "@/lib/api/kpiService";

export interface UseTidakTerjaminReturn {
  tidakTerjamin: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useTidakTerjamin(): UseTidakTerjaminReturn {
  const [tidakTerjamin, setTidakTerjamin] = useState<string>("296");
  const [count, setCount] = useState<number | null>(296);
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
      const result = await fetchTidakTerjaminApi(true);

      setTidakTerjamin(result.formatted);
      setCount(result.count);
      setSource(result.source);
      setIsError(!result.success);

      if (!result.success) {
        setError(result.error || "Gagal memuat data Tidak Terjamin");
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("[useTidakTerjamin] Fetch error:", err);
      setIsError(true);
      setError(err?.message || "Gagal memuat data Tidak Terjamin");
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    tidakTerjamin,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
