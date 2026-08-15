/**
 * KPI API Service - Safe REST API data fetcher for Monitoring Laka
 */

export interface CardMetricApiResponse {
  success: boolean;
  data?: (string | number)[][];
  message?: string;
}

export interface FetchCardMetricResult {
  success: boolean;
  count: number | null;
  formatted: string;
  pctOfTotal?: string;
  error?: string;
  source: "api" | "fallback";
}

export type FetchTotalLpResult = FetchCardMetricResult;

export interface LateMetricApiResponse {
  success: boolean;
  data?: {
    data?: (string | number)[][];
    percentage?: number;
  };
  message?: string;
}

export interface FetchLateMetricResult {
  success: boolean;
  count: number | null;
  percentage: number | null;
  formattedCount: string;
  formattedPct: string;
  error?: string;
  source: "api" | "fallback";
}

const DEFAULT_TIMEOUT_MS = 8000;

export type CardEndpointKey =
  | "totalLp"
  | "lakaTunggal"
  | "jumlahKorban"
  | "lukaLuka"
  | "llMd"
  | "md"
  | "terjamin"
  | "tidakTerjamin"
  | "eg2r";

export type LateEndpointKey = "terlambatLapor" | "terlambat13" | "terlambat47" | "terlambatLebih7" | "normal";

// API Endpoints
const API_ENDPOINTS: Record<CardEndpointKey, { external: string; proxy: string; fallback: number }> = {
  totalLp: {
    external: "https://be-monitoring-laka.vercel.app/api/card/totalLaporanPolisi",
    proxy: "/api/card/totalLaporanPolisi",
    fallback: 1288,
  },
  lakaTunggal: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lakaTunggal",
    proxy: "/api/card/lakaTunggal",
    fallback: 265,
  },
  jumlahKorban: {
    external: "https://be-monitoring-laka.vercel.app/api/card/jumlahKorban",
    proxy: "/api/card/jumlahKorban",
    fallback: 1691,
  },
  lukaLuka: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lukaLuka",
    proxy: "/api/card/lukaLuka",
    fallback: 1435,
  },
  llMd: {
    external: "https://be-monitoring-laka.vercel.app/api/card/llmd",
    proxy: "/api/card/llmd",
    fallback: 34,
  },
  md: {
    external: "https://be-monitoring-laka.vercel.app/api/card/meninggaldunia",
    proxy: "/api/card/meninggaldunia",
    fallback: 53,
  },
  terjamin: {
    external: "https://be-monitoring-laka.vercel.app/api/card/terjamin",
    proxy: "/api/card/terjamin",
    fallback: 781,
  },
  tidakTerjamin: {
    external: "https://be-monitoring-laka.vercel.app/api/card/tidakterjamin",
    proxy: "/api/card/tidakterjamin",
    fallback: 296,
  },
  eg2r: {
    external: "https://be-monitoring-laka.vercel.app/api/card/eg2r",
    proxy: "/api/card/eg2r",
    fallback: 473,
  },
};

const LATE_ENDPOINTS: Record<LateEndpointKey, { external: string; proxy: string; fallback: { count: number; percentage: number } }> = {
  terlambatLapor: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lpterlambat",
    proxy: "/api/card/lpterlambat",
    fallback: { count: 1053, percentage: 81.75 },
  },
  terlambat13: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lpterlambat13",
    proxy: "/api/card/lpterlambat13",
    fallback: { count: 688, percentage: 65.34 },
  },
  terlambat47: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lpterlambat47",
    proxy: "/api/card/lpterlambat47",
    fallback: { count: 193, percentage: 18.33 },
  },
  terlambatLebih7: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lpterlambatlebih7",
    proxy: "/api/card/lpterlambatlebih7",
    fallback: { count: 172, percentage: 16.33 },
  },
  normal: {
    external: "https://be-monitoring-laka.vercel.app/api/card/lpnormal",
    proxy: "/api/card/lpnormal",
    fallback: { count: 235, percentage: 18.25 },
  },
};

/**
 * Format raw number to localized integer format (e.g. 1.288 or 1,288)
 */
export function formatLpCount(count: number, locale: string = "id-ID"): string {
  if (isNaN(count) || count < 0) return "0";
  return new Intl.NumberFormat(locale).format(count);
}

/**
 * Safely format percentage (e.g. 18.25 -> "18.25%")
 */
export function formatPercentage(pct: number): string {
  if (isNaN(pct)) return "0%";
  return `${pct.toFixed(2)}%`;
}

/**
 * Safely calculate percentage string (e.g. "20.6% DARI TOTAL")
 */
export function calculatePctString(part: number, total: number): string {
  if (!total || total <= 0 || isNaN(part) || isNaN(total)) return "0% DARI TOTAL";
  const pct = ((part / total) * 100).toFixed(1);
  return `${pct}% DARI TOTAL`;
}

/**
 * Safely parse standard API response JSON payload: { "success": true, "data": [["1288"]] }
 */
export function parseCardMetricPayload(json: unknown): number | null {
  try {
    if (!json || typeof json !== "object") return null;
    
    const res = json as CardMetricApiResponse;
    if (res.success === false) return null;
    
    if (!Array.isArray(res.data) || res.data.length === 0) return null;
    
    const firstRow = res.data[0];
    if (!Array.isArray(firstRow) || firstRow.length === 0) return null;
    
    const rawVal = firstRow[0];
    if (rawVal === null || rawVal === undefined) return null;
    
    const parsedNum = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal).trim(), 10);
    return isNaN(parsedNum) ? null : parsedNum;
  } catch (err) {
    console.error("[parseCardMetricPayload] Error parsing response:", err);
    return null;
  }
}

/**
 * Safely parse Late/Percentage Metric API response JSON payload:
 * { "success": true, "data": { "data": [["235"]], "percentage": 18.25 } }
 */
export function parseLateMetricPayload(json: unknown): { count: number; percentage: number } | null {
  try {
    if (!json || typeof json !== "object") return null;
    
    const res = json as LateMetricApiResponse;
    if (res.success === false || !res.data) return null;
    
    const innerData = res.data.data;
    if (!Array.isArray(innerData) || innerData.length === 0) return null;
    
    const firstRow = innerData[0];
    if (!Array.isArray(firstRow) || firstRow.length === 0) return null;
    
    const rawVal = firstRow[0];
    if (rawVal === null || rawVal === undefined) return null;
    
    const count = typeof rawVal === "number" ? rawVal : parseInt(String(rawVal).trim(), 10);
    const percentage = typeof res.data.percentage === "number" ? res.data.percentage : 0;
    
    if (isNaN(count)) return null;
    return { count, percentage };
  } catch (err) {
    console.error("[parseLateMetricPayload] Error parsing response:", err);
    return null;
  }
}

// Alias for backward compatibility
export const parseTotalLpPayload = parseCardMetricPayload;

/**
 * Generic safe fetcher for standard card endpoints
 */
async function fetchCardMetricGeneric(
  endpointKey: CardEndpointKey,
  useProxy: boolean = true,
  totalForPct?: number
): Promise<FetchCardMetricResult> {
  const config = API_ENDPOINTS[endpointKey];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const primaryUrl = useProxy ? config.proxy : config.external;
  const secondaryUrl = useProxy ? config.external : config.proxy;

  try {
    const response = await fetch(primaryUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const count = parseCardMetricPayload(json);

    if (count !== null) {
      return {
        success: true,
        count,
        formatted: formatLpCount(count),
        pctOfTotal: totalForPct ? calculatePctString(count, totalForPct) : undefined,
        source: "api",
      };
    }

    throw new Error(`Invalid response format received from ${endpointKey} endpoint`);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`[fetchCardMetricGeneric] Primary fetch to ${primaryUrl} failed:`, error?.message || error);

    // Attempt secondary fallback URL if primary was proxy
    if (useProxy) {
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), DEFAULT_TIMEOUT_MS);
        
        const fallbackRes = await fetch(secondaryUrl, {
          method: "GET",
          headers: { "Accept": "application/json" },
          signal: fallbackController.signal,
        });
        
        clearTimeout(fallbackTimeout);

        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          const count = parseCardMetricPayload(json);
          if (count !== null) {
            return {
              success: true,
              count,
              formatted: formatLpCount(count),
              pctOfTotal: totalForPct ? calculatePctString(count, totalForPct) : undefined,
              source: "api",
            };
          }
        }
      } catch (fallbackErr: any) {
        console.warn(`[fetchCardMetricGeneric] Secondary fallback fetch for ${endpointKey} also failed:`, fallbackErr?.message);
      }
    }

    // Return safe fallback data
    const fallbackCount = config.fallback;
    return {
      success: false,
      count: fallbackCount,
      formatted: formatLpCount(fallbackCount),
      pctOfTotal: totalForPct ? calculatePctString(fallbackCount, totalForPct) : undefined,
      error: error?.name === "AbortError" ? "Request timeout" : error?.message || "Gagal mengambil data",
      source: "fallback",
    };
  }
}

/**
 * Generic safe fetcher for Late / Percentage Report endpoints
 */
async function fetchLateMetricGeneric(
  endpointKey: LateEndpointKey,
  useProxy: boolean = true
): Promise<FetchLateMetricResult> {
  const config = LATE_ENDPOINTS[endpointKey];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const primaryUrl = useProxy ? config.proxy : config.external;
  const secondaryUrl = useProxy ? config.external : config.proxy;

  try {
    const response = await fetch(primaryUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const parsed = parseLateMetricPayload(json);

    if (parsed !== null) {
      return {
        success: true,
        count: parsed.count,
        percentage: parsed.percentage,
        formattedCount: formatLpCount(parsed.count),
        formattedPct: formatPercentage(parsed.percentage),
        source: "api",
      };
    }

    throw new Error(`Invalid response format received from ${endpointKey} endpoint`);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`[fetchLateMetricGeneric] Primary fetch to ${primaryUrl} failed:`, error?.message || error);

    if (useProxy) {
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), DEFAULT_TIMEOUT_MS);
        
        const fallbackRes = await fetch(secondaryUrl, {
          method: "GET",
          headers: { "Accept": "application/json" },
          signal: fallbackController.signal,
        });
        
        clearTimeout(fallbackTimeout);

        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          const parsed = parseLateMetricPayload(json);
          if (parsed !== null) {
            return {
              success: true,
              count: parsed.count,
              percentage: parsed.percentage,
              formattedCount: formatLpCount(parsed.count),
              formattedPct: formatPercentage(parsed.percentage),
              source: "api",
            };
          }
        }
      } catch (fallbackErr: any) {
        console.warn(`[fetchLateMetricGeneric] Secondary fallback fetch for ${endpointKey} also failed:`, fallbackErr?.message);
      }
    }

    const fb = config.fallback;
    return {
      success: false,
      count: fb.count,
      percentage: fb.percentage,
      formattedCount: formatLpCount(fb.count),
      formattedPct: formatPercentage(fb.percentage),
      error: error?.name === "AbortError" ? "Request timeout" : error?.message || "Gagal mengambil data",
      source: "fallback",
    };
  }
}

/**
 * Fetch total LP count safely
 */
export async function fetchTotalLpApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("totalLp", useProxy);
}

/**
 * Fetch Laka Tunggal count safely
 */
export async function fetchLakaTunggalApi(
  useProxy: boolean = true,
  totalForPct?: number
): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("lakaTunggal", useProxy, totalForPct);
}

/**
 * Fetch Jumlah Korban count safely
 */
export async function fetchJumlahKorbanApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("jumlahKorban", useProxy);
}

/**
 * Fetch Luka Luka count safely
 */
export async function fetchLukaLukaApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("lukaLuka", useProxy);
}

/**
 * Fetch LL - MD count safely
 */
export async function fetchLlMdApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("llMd", useProxy);
}

/**
 * Fetch Meninggal Dunia (MD) count safely
 */
export async function fetchMdApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("md", useProxy);
}

/**
 * Fetch Terjamin count safely
 */
export async function fetchTerjaminApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("terjamin", useProxy);
}

/**
 * Fetch Tidak Terjamin count safely
 */
export async function fetchTidakTerjaminApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("tidakTerjamin", useProxy);
}

/**
 * Fetch EG2R count safely
 */
export async function fetchEg2rApi(useProxy: boolean = true): Promise<FetchCardMetricResult> {
  return fetchCardMetricGeneric("eg2r", useProxy);
}

/**
 * Fetch Terlambat Lapor total metric
 */
export async function fetchTerlambatLaporApi(useProxy: boolean = true): Promise<FetchLateMetricResult> {
  return fetchLateMetricGeneric("terlambatLapor", useProxy);
}

/**
 * Fetch Terlambat Lapor 1-3 Hari metric
 */
export async function fetchTerlambat13Api(useProxy: boolean = true): Promise<FetchLateMetricResult> {
  return fetchLateMetricGeneric("terlambat13", useProxy);
}

/**
 * Fetch Terlambat Lapor 4-7 Hari metric
 */
export async function fetchTerlambat47Api(useProxy: boolean = true): Promise<FetchLateMetricResult> {
  return fetchLateMetricGeneric("terlambat47", useProxy);
}

/**
 * Fetch Terlambat Lapor >7 Hari metric
 */
export async function fetchTerlambatLebih7Api(useProxy: boolean = true): Promise<FetchLateMetricResult> {
  return fetchLateMetricGeneric("terlambatLebih7", useProxy);
}

/**
 * Fetch Normal LP count and percentage safely
 */
export async function fetchNormalLpApi(useProxy: boolean = true): Promise<FetchLateMetricResult> {
  return fetchLateMetricGeneric("normal", useProxy);
}
