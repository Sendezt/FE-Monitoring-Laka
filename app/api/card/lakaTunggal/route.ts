import { NextResponse } from "next/server";
import { parseCardMetricPayload } from "@/lib/api/kpiService";

const EXTERNAL_API_URL = "https://be-monitoring-laka.vercel.app/api/card/lakaTunggal";

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
      next: { revalidate: 60 }, // Cache on server for 60 seconds
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
    const parsedCount = parseCardMetricPayload(data);

    if (parsedCount === null) {
      return NextResponse.json(
        { success: false, error: "Invalid data format received from upstream lakaTunggal API", raw: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: [[String(parsedCount)]],
      count: parsedCount,
    });
  } catch (error: any) {
    console.error("[API Route lakaTunggal] Fetch error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.name === "AbortError" ? "Upstream request timed out" : error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
