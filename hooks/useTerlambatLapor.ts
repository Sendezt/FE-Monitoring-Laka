"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchTerlambatLaporApi,
  fetchTerlambat13Api,
  fetchTerlambat47Api,
  fetchTerlambatLebih7Api,
  FetchLateMetricResult,
} from "@/lib/api/kpiService";

export interface UseTerlambatLaporReturn {
  terlambatLapor: string;
  terlambatPct: string;
  late3Days: { count: string; pct: string };
  late7Days: { count: string; pct: string };
  lateMoreDays: { count: string; pct: string };
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  source: "api" | "fallback";
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useTerlambatLapor(): UseTerlambatLaporReturn {
  const [terlambatLapor, setTerlambatLapor] = useState<string>("1.053");
  const [terlambatPct, setTerlambatPct] = useState<string>("81.75%");
  const [late3Days, setLate3Days] = useState<{ count: string; pct: string }>({
    count: "688",
    pct: "65.34%",
  });
  const [late7Days, setLate7Days] = useState<{ count: string; pct: string }>({
    count: "193",
    pct: "18.33%",
  });
  const [lateMoreDays, setLateMoreDays] = useState<{ count: string; pct: string }>({
    count: "172",
    pct: "16.33%",
  });

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
      const [resTotal, res13, res47, resLebih7] = await Promise.allSettled([
        fetchTerlambatLaporApi(true),
        fetchTerlambat13Api(true),
        fetchTerlambat47Api(true),
        fetchTerlambatLebih7Api(true),
      ]);

      let hasApiSuccess = false;
      let hasError = false;

      // Handle Total Terlambat Lapor
      if (resTotal.status === "fulfilled" && resTotal.value.success) {
        setTerlambatLapor(resTotal.value.formattedCount);
        setTerlambatPct(resTotal.value.formattedPct);
        hasApiSuccess = true;
      } else {
        const val = resTotal.status === "fulfilled" ? resTotal.value : null;
        setTerlambatLapor(val?.formattedCount || "1.053");
        setTerlambatPct(val?.formattedPct || "81.75%");
        hasError = true;
      }

      // Handle 1-3 Hari
      if (res13.status === "fulfilled" && res13.value.success) {
        setLate3Days({
          count: res13.value.formattedCount,
          pct: res13.value.formattedPct,
        });
        hasApiSuccess = true;
      } else {
        const val = res13.status === "fulfilled" ? res13.value : null;
        setLate3Days({
          count: val?.formattedCount || "688",
          pct: val?.formattedPct || "65.34%",
        });
        hasError = true;
      }

      // Handle 4-7 Hari
      if (res47.status === "fulfilled" && res47.value.success) {
        setLate7Days({
          count: res47.value.formattedCount,
          pct: res47.value.formattedPct,
        });
        hasApiSuccess = true;
      } else {
        const val = res47.status === "fulfilled" ? res47.value : null;
        setLate7Days({
          count: val?.formattedCount || "193",
          pct: val?.formattedPct || "18.33%",
        });
        hasError = true;
      }

      // Handle >7 Hari
      if (resLebih7.status === "fulfilled" && resLebih7.value.success) {
        setLateMoreDays({
          count: resLebih7.value.formattedCount,
          pct: resLebih7.value.formattedPct,
        });
        hasApiSuccess = true;
      } else {
        const val = resLebih7.status === "fulfilled" ? resLebih7.value : null;
        setLateMoreDays({
          count: val?.formattedCount || "172",
          pct: val?.formattedPct || "16.33%",
        });
        hasError = true;
      }

      setSource(hasApiSuccess ? "api" : "fallback");
      setIsError(hasError && !hasApiSuccess);
      if (hasError && !hasApiSuccess) {
        setError("Sebagian atau seluruh data Terlambat Lapor gagal dimuat.");
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("[useTerlambatLapor] Fetch error:", err);
      setIsError(true);
      setError(err?.message || "Gagal memuat data Terlambat Lapor");
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    terlambatLapor,
    terlambatPct,
    late3Days,
    late7Days,
    lateMoreDays,
    isLoading,
    isError,
    error,
    source,
    lastUpdated,
    refetch: loadData,
  };
}
