"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTotalLpApi, FetchTotalLpResult } from "@/lib/api/kpiService";

export interface UseTotalLpReturn {
  totalLp: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useTotalLp(initialValue: string = "1,288"): UseTotalLpReturn {
  const [totalLp, setTotalLp] = useState<string>(initialValue);
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const result: FetchTotalLpResult = await fetchTotalLpApi(true);

    if (result.success && result.count !== null) {
      setTotalLp(result.formatted);
      setCount(result.count);
      setIsError(false);
      setSource("api");
      setLastUpdated(new Date());
    } else {
      setIsError(true);
      setError(result.error || "Gagal memuat data API");
      setSource("fallback");
      // Use fallback value formatted
      setTotalLp(result.formatted || initialValue);
      setCount(result.count);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [initialValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    totalLp,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
