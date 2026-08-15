"use client";

import React from "react";
import { KpiStats } from "./types";

interface KpiMetricsRowProps {
  stats: KpiStats;
}

export default function KpiMetricsRow({ stats }: KpiMetricsRowProps) {
  // Helper to parse numerical percentage values for Pie Chart angles
  const parsePct = (pctStr?: string): number => {
    if (!pctStr) return 0;
    const clean = pctStr.replace("%", "").trim();
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  const pct1 = parsePct(stats.late3Days?.pct);
  const pct2 = parsePct(stats.late7Days?.pct);
  const pct3 = parsePct(stats.lateMoreDays?.pct);
  const totalLatePct = pct1 + pct2 + pct3 || 100;

  const flex1 = (pct1 / totalLatePct) * 100;
  const flex2 = (pct2 / totalLatePct) * 100;
  const flex3 = (pct3 / totalLatePct) * 100;

  const angle1 = (flex1 / 100) * 360;
  const angle2 = angle1 + (flex2 / 100) * 360;
  const angle3 = 359.999; // Cap just below 360 for SVG arc calculation

  // SVG Pie Chart Geometry Helpers
  const cx = 90;
  const cy = 90;
  const r = 80;

  const getPieSlicePath = (startAngle: number, endAngle: number) => {
    if (endAngle - startAngle >= 359.9) {
      return `M ${cx - r} ${cy} a ${r} ${r} 0 1,0 ${r * 2} 0 a ${r} ${r} 0 1,0 -${r * 2} 0`;
    }
    const rad1 = ((startAngle - 90) * Math.PI) / 180;
    const rad2 = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(rad1);
    const y1 = cy + r * Math.sin(rad1);
    const x2 = cx + r * Math.cos(rad2);
    const y2 = cy + r * Math.sin(rad2);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getSliceLabelPos = (startAngle: number, endAngle: number) => {
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const midRad = ((midAngle - 90) * Math.PI) / 180;
    const labelR = r * 0.55; // Placed inside the slice area
    return {
      x: cx + labelR * Math.cos(midRad),
      y: cy + labelR * Math.sin(midRad),
    };
  };

  const pos1 = getSliceLabelPos(0, angle1);
  const pos2 = getSliceLabelPos(angle1, angle2);
  const pos3 = getSliceLabelPos(angle2, angle3);

  return (
    <div className="space-y-4 font-sans">
      {/* ROW 1 (FEATURED): Total LP & Distribusi Keterlambatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: TOTAL LP (with Normal & Terlambat sub-cards) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#1D4ED8] rounded-2xl p-5 md:p-6 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all duration-200">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                TOTAL LP
              </span>

              <div className="flex items-center gap-2">
                {/* REST API Status Indicator */}
                {stats.totalLpLoading || stats.normalLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-ping" />
                    MEMUAT...
                  </span>
                ) : stats.totalLpError || stats.normalError ? (
                  <button
                    type="button"
                    onClick={() => {
                      stats.onRetryTotalLp?.();
                      stats.onRetryNormal?.();
                    }}
                    title={stats.totalLpErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                    className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                  >
                    <span className="material-symbols-outlined text-[10px]">refresh</span>
                    RETRY
                  </button>
                ) : (
                  <span
                    title="Data diambil dari REST API totalLaporanPolisi & lpnormal"
                    className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE API
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    stats.onRetryTotalLp?.();
                    stats.onRetryNormal?.();
                  }}
                  title="Refresh data Total LP dari REST API"
                  className="w-8 h-8 rounded-xl bg-[#1D4ED8]/10 group-hover:bg-[#1D4ED8] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#1D4ED8] group-hover:text-white transition-colors">
                    {stats.totalLpLoading ? "sync" : "description"}
                  </span>
                </button>
              </div>
            </div>

            {/* Total Count */}
            <div className="text-center my-4">
              {stats.totalLpLoading ? (
                <div className="h-12 w-36 mx-auto rounded-xl bg-outline-variant/20 animate-pulse my-2" />
              ) : (
                <div className="text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight tabular-nums group-hover:scale-[1.01] transition-transform">
                  {stats.totalLp}
                </div>
              )}

              {/* Subtitle / Trend indicator */}
              <div className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12.5% from last month</span>
              </div>
            </div>
          </div>

          {/* Sub Cards: Normal & Terlambat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-outline-variant/30">
            {/* Box Normal */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-950/20 rounded-xl p-3.5 flex items-center justify-between transition-all hover:bg-emerald-500/15">
              <div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Normal
                </div>
                {stats.normalLoading ? (
                  <div className="h-6 w-16 rounded bg-outline-variant/20 animate-pulse mt-1" />
                ) : (
                  <div className="text-xl md:text-2xl font-extrabold text-on-surface mt-0.5 tabular-nums">
                    {stats.normal}
                  </div>
                )}
              </div>
              <div>
                {stats.normalLoading ? (
                  <div className="h-5 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {stats.normalPct}
                  </span>
                )}
              </div>
            </div>

            {/* Box Terlambat */}
            <div className="bg-rose-500/10 border border-rose-500/20 dark:bg-rose-950/20 rounded-xl p-3.5 flex items-center justify-between transition-all hover:bg-rose-500/15">
              <div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Terlambat
                </div>
                {stats.terlambatLaporLoading ? (
                  <div className="h-6 w-16 rounded bg-outline-variant/20 animate-pulse mt-1" />
                ) : (
                  <div className="text-xl md:text-2xl font-extrabold text-on-surface mt-0.5 tabular-nums">
                    {stats.terlambatLapor}
                  </div>
                )}
              </div>
              <div>
                {stats.terlambatLaporLoading ? (
                  <div className="h-5 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="text-sm md:text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {stats.terlambatPct}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: DISTRIBUSI KETERLAMBATAN (SVG Pie Chart with Inner Slice Percentages & Clean Count Legend) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#DC2626] rounded-2xl p-5 md:p-6 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all duration-200">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                DISTRIBUSI KETERLAMBATAN
              </span>

              <div className="flex items-center gap-2">
                {stats.terlambatLaporLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#DC2626]/10 text-[#DC2626] font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
                    MEMUAT...
                  </span>
                ) : stats.terlambatLaporError ? (
                  <button
                    type="button"
                    onClick={stats.onRetryTerlambatLapor}
                    title={stats.terlambatLaporErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                    className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                  >
                    <span className="material-symbols-outlined text-[10px]">refresh</span>
                    RETRY
                  </button>
                ) : (
                  <span
                    title="Data diambil dari REST API Terlambat Lapor"
                    className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE API
                  </span>
                )}

                <button
                  type="button"
                  onClick={stats.onRetryTerlambatLapor}
                  title="Refresh data Terlambat Lapor dari REST API"
                  className="w-8 h-8 rounded-xl bg-[#DC2626]/10 group-hover:bg-[#DC2626] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#DC2626] group-hover:text-white transition-colors">
                    {stats.terlambatLaporLoading ? "sync" : "pie_chart"}
                  </span>
                </button>
              </div>
            </div>

            {/* Content: SVG Solid Pie Chart on Left + Segment Details (Count only) on Right */}
            {stats.terlambatLaporLoading ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
                <div className="w-36 h-36 rounded-full bg-outline-variant/20 animate-pulse flex-shrink-0" />
                <div className="flex-1 w-full space-y-2.5">
                  <div className="h-10 w-full rounded-xl bg-outline-variant/20 animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-outline-variant/20 animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-outline-variant/20 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 my-3">
                {/* Left Side: Solid Pie Chart with Thick Separator Borders & Inner Slice Percentages */}
                <div className="flex-shrink-0 relative flex items-center justify-center p-1">
                  <svg
                    viewBox="0 0 180 180"
                    className="w-36 h-36 md:w-40 md:h-40 drop-shadow-lg transition-transform group-hover:scale-105 duration-300 overflow-visible"
                  >
                    {/* Slice 1: 1-3 Hari (Amber Gold: #F59E0B) */}
                    {flex1 > 0 && (
                      <path
                        d={getPieSlicePath(0, angle1)}
                        fill="#F59E0B"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Slice 2: 4-7 Hari (Deep Indigo: #6366F1) */}
                    {flex2 > 0 && (
                      <path
                        d={getPieSlicePath(angle1, angle2)}
                        fill="#6366F1"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Slice 3: >7 Hari (Crimson Rose: #E11D48) */}
                    {flex3 > 0 && (
                      <path
                        d={getPieSlicePath(angle2, angle3)}
                        fill="#E11D48"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Percentages INSIDE Slices */}
                    {flex1 >= 3 && (
                      <text
                        x={pos1.x}
                        y={pos1.y}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] pointer-events-none select-none tracking-tight"
                      >
                        {stats.late3Days?.pct}
                      </text>
                    )}

                    {flex2 >= 3 && (
                      <text
                        x={pos2.x}
                        y={pos2.y}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] pointer-events-none select-none tracking-tight"
                      >
                        {stats.late7Days?.pct}
                      </text>
                    )}

                    {flex3 >= 3 && (
                      <text
                        x={pos3.x}
                        y={pos3.y}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] pointer-events-none select-none tracking-tight"
                      >
                        {stats.lateMoreDays?.pct}
                      </text>
                    )}
                  </svg>
                </div>

                {/* Right Side: High-Contrast Colored Legend Segments (Count only) */}
                <div className="flex-1 w-full space-y-2">
                  {/* Segment 1: 1-3 Hari (Amber) */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] shadow-sm flex-shrink-0 border border-white" />
                      <span className="text-xs font-bold text-on-surface">1-3 HARI</span>
                    </div>
                    <span className="text-sm font-extrabold text-on-surface tabular-nums">
                      {stats.late3Days?.count}
                    </span>
                  </div>

                  {/* Segment 2: 4-7 Hari (Deep Indigo) */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/15 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#6366F1] shadow-sm flex-shrink-0 border border-white" />
                      <span className="text-xs font-bold text-on-surface">4-7 HARI</span>
                    </div>
                    <span className="text-sm font-extrabold text-on-surface tabular-nums">
                      {stats.late7Days?.count}
                    </span>
                  </div>

                  {/* Segment 3: >7 Hari (Crimson Rose) */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#E11D48] shadow-sm flex-shrink-0 border border-white" />
                      <span className="text-xs font-bold text-on-surface">&gt;7 HARI</span>
                    </div>
                    <span className="text-sm font-extrabold text-on-surface tabular-nums">
                      {stats.lateMoreDays?.count}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Link */}
          <div className="mt-3 pt-3 border-t border-outline-variant/30 flex justify-end">
            <span className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer group">
              View Detailed Breakdown
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2: Laka Tunggal & Jumlah Korban (2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Laka Tunggal */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#991B1B] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                LAKA TUNGGAL
              </span>

              {stats.lakaTunggalLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#991B1B]/10 text-[#991B1B] font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.lakaTunggalError ? (
                <button
                  type="button"
                  onClick={stats.onRetryLakaTunggal}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.lakaTunggalLoading ? (
              <div className="h-9 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums">
                {stats.lakaTunggal}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]" />
              {stats.lakaTunggalPct}
            </span>

            <button
              type="button"
              onClick={stats.onRetryLakaTunggal}
              title="Refresh Laka Tunggal"
              className="w-8 h-8 rounded-xl bg-[#991B1B]/10 group-hover:bg-[#991B1B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#991B1B] group-hover:text-white transition-colors">
                {stats.lakaTunggalLoading ? "sync" : "directions_car"}
              </span>
            </button>
          </div>
        </div>

        {/* Card: Jumlah Korban */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#EA580C] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                JUMLAH KORBAN
              </span>

              {stats.jumlahKorbanLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.jumlahKorbanError ? (
                <button
                  type="button"
                  onClick={stats.onRetryJumlahKorban}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.jumlahKorbanLoading ? (
              <div className="h-9 w-28 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums">
                {stats.jumlahKorban}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryJumlahKorban}
              title="Refresh Jumlah Korban"
              className="w-8 h-8 rounded-xl bg-[#EA580C]/10 group-hover:bg-[#EA580C] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#EA580C] group-hover:text-white transition-colors">
                {stats.jumlahKorbanLoading ? "sync" : "group"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: Luka Luka, LL - MD, MD (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card: Luka Luka */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#EF4444] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                LUKA LUKA
              </span>

              {stats.lukaLukaLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.lukaLukaError ? (
                <button
                  type="button"
                  onClick={stats.onRetryLukaLuka}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.lukaLukaLoading ? (
              <div className="h-9 w-28 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums">
                {stats.lukaLuka}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryLukaLuka}
              title="Refresh Luka Luka"
              className="w-8 h-8 rounded-xl bg-[#EF4444]/10 group-hover:bg-[#EF4444] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#EF4444] group-hover:text-white transition-colors">
                {stats.lukaLukaLoading ? "sync" : "local_hospital"}
              </span>
            </button>
          </div>
        </div>

        {/* Card: LL - MD */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#0D9488] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                LL - MD
              </span>

              {stats.llMdLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.llMdError ? (
                <button
                  type="button"
                  onClick={stats.onRetryLlMd}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.llMdLoading ? (
              <div className="h-9 w-20 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums">
                {stats.llMd}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryLlMd}
              title="Refresh LL - MD"
              className="w-8 h-8 rounded-xl bg-[#0D9488]/10 group-hover:bg-[#0D9488] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#0D9488] group-hover:text-white transition-colors">
                {stats.llMdLoading ? "sync" : "healing"}
              </span>
            </button>
          </div>
        </div>

        {/* Card: MD */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#475569] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                MD
              </span>

              {stats.mdLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#475569]/10 text-[#475569] font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.mdError ? (
                <button
                  type="button"
                  onClick={stats.onRetryMd}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.mdLoading ? (
              <div className="h-9 w-20 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums">
                {stats.md}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryMd}
              title="Refresh MD"
              className="w-8 h-8 rounded-xl bg-[#475569]/10 group-hover:bg-[#475569] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#475569] group-hover:text-white transition-colors">
                {stats.mdLoading ? "sync" : "warning"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: Terjamin, Tidak Terjamin, EG2R (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card: TERJAMIN */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#059669] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                TERJAMIN
              </span>

              {stats.terjaminLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.terjaminError ? (
                <button
                  type="button"
                  onClick={stats.onRetryTerjamin}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.terjaminLoading ? (
              <div className="h-9 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface my-1 group-hover:scale-[1.01] transition-transform origin-left tabular-nums">
                {stats.terjamin}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryTerjamin}
              title="Refresh TERJAMIN"
              className="w-8 h-8 rounded-xl bg-[#059669]/10 group-hover:bg-[#059669] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#059669] group-hover:text-white transition-colors">
                {stats.terjaminLoading ? "sync" : "refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* Card: TIDAK TERJAMIN */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#334155] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                TIDAK TERJAMIN
              </span>

              {stats.tidakTerjaminLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#334155]/10 text-[#334155] dark:text-slate-300 font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.tidakTerjaminError ? (
                <button
                  type="button"
                  onClick={stats.onRetryTidakTerjamin}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.tidakTerjaminLoading ? (
              <div className="h-9 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface my-1 group-hover:scale-[1.01] transition-transform origin-left tabular-nums">
                {stats.tidakTerjamin}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#334155]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryTidakTerjamin}
              title="Refresh TIDAK TERJAMIN"
              className="w-8 h-8 rounded-xl bg-[#334155]/10 group-hover:bg-[#334155] dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#334155] dark:text-slate-300 group-hover:text-white transition-colors">
                {stats.tidakTerjaminLoading ? "sync" : "refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* Card: EG2R */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#831843] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                EG2R
              </span>

              {stats.eg2rLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-pink-300 font-bold animate-pulse">
                  MEMUAT...
                </span>
              ) : stats.eg2rError ? (
                <button
                  type="button"
                  onClick={stats.onRetryEg2r}
                  className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE API
                </span>
              )}
            </div>

            {stats.eg2rLoading ? (
              <div className="h-9 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface my-1 group-hover:scale-[1.01] transition-transform origin-left tabular-nums">
                {stats.eg2r}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#831843]" />
              KORBAN
            </span>

            <button
              type="button"
              onClick={stats.onRetryEg2r}
              title="Refresh EG2R"
              className="w-8 h-8 rounded-xl bg-[#831843]/10 group-hover:bg-[#831843] dark:hover:bg-pink-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#831843] dark:text-pink-300 group-hover:text-white transition-colors">
                {stats.eg2rLoading ? "sync" : "refresh"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
