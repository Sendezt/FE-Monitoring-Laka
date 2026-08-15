"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchMdApi, FetchCardMetricResult } from "@/lib/api/kpiService";

export interface UseMdReturn {
  md: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useMd(initialValue: string = "53"): UseMdReturn {
  const [md, setMd] = useState<string>(initialValue);
  const [count, setCount] = useState<number | null>(53);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const result: FetchCardMetricResult = await fetchMdApi(true);

    if (result.success && result.count !== null) {
      setMd(result.formatted);
      setCount(result.count);
      setIsError(false);
      setSource("api");
      setLastUpdated(new Date());
    } else {
      setIsError(true);
      setError(result.error || "Gagal memuat data API Meninggal Dunia (MD)");
      setSource("fallback");
      setMd(result.formatted || initialValue);
      setCount(result.count || 53);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [initialValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    md,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
