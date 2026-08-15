"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchLakaTunggalApi, calculatePctString, FetchCardMetricResult } from "@/lib/api/kpiService";

export interface UseLakaTunggalReturn {
  lakaTunggal: string;
  lakaTunggalPct: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useLakaTunggal(totalLpCount: number | null = 1288, initialValue: string = "265"): UseLakaTunggalReturn {
  const [lakaTunggal, setLakaTunggal] = useState<string>(initialValue);
  const [lakaTunggalPct, setLakaTunggalPct] = useState<string>("20.6% DARI TOTAL");
  const [count, setCount] = useState<number | null>(265);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const effectiveTotal = totalLpCount || 1288;
    const result: FetchCardMetricResult = await fetchLakaTunggalApi(true, effectiveTotal);

    if (result.success && result.count !== null) {
      setLakaTunggal(result.formatted);
      setCount(result.count);
      setLakaTunggalPct(result.pctOfTotal || calculatePctString(result.count, effectiveTotal));
      setIsError(false);
      setSource("api");
      setLastUpdated(new Date());
    } else {
      setIsError(true);
      setError(result.error || "Gagal memuat data API Laka Tunggal");
      setSource("fallback");
      setLakaTunggal(result.formatted || initialValue);
      setCount(result.count || 265);
      setLakaTunggalPct(calculatePctString(result.count || 265, effectiveTotal));
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [totalLpCount, initialValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    lakaTunggal,
    lakaTunggalPct,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
