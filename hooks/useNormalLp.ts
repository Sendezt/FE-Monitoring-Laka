"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchNormalLpApi } from "@/lib/api/kpiService";

export interface UseNormalLpReturn {
  normal: string;
  normalPct: string;
  count: number | null;
  percentage: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useNormalLp(): UseNormalLpReturn {
  const [normal, setNormal] = useState<string>("235");
  const [normalPct, setNormalPct] = useState<string>("18.25%");
  const [count, setCount] = useState<number | null>(235);
  const [percentage, setPercentage] = useState<number | null>(18.25);
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
      const result = await fetchNormalLpApi(true);

      setNormal(result.formattedCount);
      setNormalPct(result.formattedPct);
      setCount(result.count);
      setPercentage(result.percentage);
      setSource(result.source);
      setIsError(!result.success);

      if (!result.success) {
        setError(result.error || "Gagal memuat data LP Normal");
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("[useNormalLp] Fetch error:", err);
      setIsError(true);
      setError(err?.message || "Gagal memuat data LP Normal");
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    normal,
    normalPct,
    count,
    percentage,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
