import { NextResponse } from "next/server";
import { parseLateMetricPayload } from "@/lib/api/kpiService";

const EXTERNAL_API_URL = "https://be-monitoring-laka.vercel.app/api/card/lpterlambatlebih7";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(EXTERNAL_API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "MonitoringLaka-FE/1.0",
      },
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const parsed = parseLateMetricPayload(data);

    if (parsed === null) {
      return NextResponse.json(
        { success: false, error: "Invalid data format received from upstream lpterlambatlebih7 API", raw: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        data: [[String(parsed.count)]],
        percentage: parsed.percentage,
      },
    });
  } catch (error: any) {
    console.error("[API Route lpterlambatlebih7] Fetch error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.name === "AbortError" ? "Upstream request timed out" : error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
