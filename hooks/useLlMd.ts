"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchLlMdApi, FetchCardMetricResult } from "@/lib/api/kpiService";

export interface UseLlMdReturn {
  llMd: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useLlMd(initialValue: string = "34"): UseLlMdReturn {
  const [llMd, setLlMd] = useState<string>(initialValue);
  const [count, setCount] = useState<number | null>(34);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const result: FetchCardMetricResult = await fetchLlMdApi(true);

    if (result.success && result.count !== null) {
      setLlMd(result.formatted);
      setCount(result.count);
      setIsError(false);
      setSource("api");
      setLastUpdated(new Date());
    } else {
      setIsError(true);
      setError(result.error || "Gagal memuat data API LL - MD");
      setSource("fallback");
      setLlMd(result.formatted || initialValue);
      setCount(result.count || 34);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [initialValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    llMd,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
