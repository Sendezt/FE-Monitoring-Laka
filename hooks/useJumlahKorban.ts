"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJumlahKorbanApi, FetchCardMetricResult } from "@/lib/api/kpiService";

export interface UseJumlahKorbanReturn {
  jumlahKorban: string;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useJumlahKorban(initialValue: string = "1,691"): UseJumlahKorbanReturn {
  const [jumlahKorban, setJumlahKorban] = useState<string>(initialValue);
  const [count, setCount] = useState<number | null>(1691);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const result: FetchCardMetricResult = await fetchJumlahKorbanApi(true);

    if (result.success && result.count !== null) {
      setJumlahKorban(result.formatted);
      setCount(result.count);
      setIsError(false);
      setSource("api");
      setLastUpdated(new Date());
    } else {
      setIsError(true);
      setError(result.error || "Gagal memuat data API Jumlah Korban");
      setSource("fallback");
      setJumlahKorban(result.formatted || initialValue);
      setCount(result.count || 1691);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  }, [initialValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    jumlahKorban,
    count,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
