"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchLukaLukaApi, FetchCardMetricResult } from "@/lib/api/kpiService";

export interface UseLukaLukaReturn {
  lukaLuka: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useLukaLuka(initialValue: string = "1,435"): UseLukaLukaReturn {
  const [lukaLuka, setLukaLuka] = useState<string>(initialValue);
  const [count, setCount] = useState<number | null>(1435);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const result: FetchCardMetricResult = await fetchLukaLukaApi(true);

    if (result.success && result.count !== null) {
      setLukaLuka(result.formatted);
      setCount(result.count);
      setIsError(false);
      setSource("api");
      setLastUpdated(new Date());
    } else {
      setIsError(true);
      setError(result.error || "Gagal memuat data API Luka Luka");
      setSource("fallback");
      setLukaLuka(result.formatted || initialValue);
      setCount(result.count || 1435);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [initialValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    lukaLuka,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
