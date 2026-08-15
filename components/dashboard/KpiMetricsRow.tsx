"use client";

import React from "react";
import { KpiStats } from "./types";

interface KpiMetricsRowProps {
  stats: KpiStats;
}

export default function KpiMetricsRow({ stats }: KpiMetricsRowProps) {
  // Helper to parse numerical percentage values for stacked progress bar
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

        {/* CARD 2: DISTRIBUSI KETERLAMBATAN */}
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
                    {stats.terlambatLaporLoading ? "sync" : "bar_chart"}
                  </span>
                </button>
              </div>
            </div>

            {/* Stacked Progress Bar */}
            <div className="my-6">
              {stats.terlambatLaporLoading ? (
                <div className="h-6 w-full rounded-xl bg-outline-variant/20 animate-pulse" />
              ) : (
                <div className="h-6 w-full bg-outline-variant/20 rounded-xl overflow-hidden flex gap-1 p-0.5 shadow-inner">
                  {/* Segment 1: 1-3 Hari */}
                  <div
                    style={{ width: `${flex1}%` }}
                    className="bg-amber-500 h-full rounded-l-lg transition-all duration-500"
                    title={`1-3 Hari: ${stats.late3Days?.count} (${stats.late3Days?.pct})`}
                  />
                  {/* Segment 2: 4-7 Hari */}
                  <div
                    style={{ width: `${flex2}%` }}
                    className="bg-orange-500 h-full transition-all duration-500"
                    title={`4-7 Hari: ${stats.late7Days?.count} (${stats.late7Days?.pct})`}
                  />
                  {/* Segment 3: >7 Hari */}
                  <div
                    style={{ width: `${flex3}%` }}
                    className="bg-rose-500 h-full rounded-r-lg transition-all duration-500"
                    title={`>7 Hari: ${stats.lateMoreDays?.count} (${stats.lateMoreDays?.pct})`}
                  />
                </div>
              )}
            </div>

            {/* 3 Metrics Columns */}
            <div className="grid grid-cols-3 divide-x divide-outline-variant/30 pt-1">
              {/* Column 1: 1-3 HARI */}
              <div className="pr-3">
                <div className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
                  1-3 HARI
                </div>
                {stats.terlambatLaporLoading ? (
                  <div className="h-7 w-12 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <div className="text-xl md:text-2xl font-extrabold text-on-surface tabular-nums">
                    {stats.late3Days?.count}
                  </div>
                )}
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse mt-1" />
                ) : (
                  <div className="text-xs font-semibold text-on-surface-variant/80 mt-0.5 tabular-nums">
                    {stats.late3Days?.pct}
                  </div>
                )}
              </div>

              {/* Column 2: 4-7 HARI */}
              <div className="px-3">
                <div className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
                  4-7 HARI
                </div>
                {stats.terlambatLaporLoading ? (
                  <div className="h-7 w-12 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <div className="text-xl md:text-2xl font-extrabold text-on-surface tabular-nums">
                    {stats.late7Days?.count}
                  </div>
                )}
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse mt-1" />
                ) : (
                  <div className="text-xs font-semibold text-on-surface-variant/80 mt-0.5 tabular-nums">
                    {stats.late7Days?.pct}
                  </div>
                )}
              </div>

              {/* Column 3: >7 HARI */}
              <div className="pl-3">
                <div className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
                  &gt;7 HARI
                </div>
                {stats.terlambatLaporLoading ? (
                  <div className="h-7 w-12 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <div className="text-xl md:text-2xl font-extrabold text-on-surface tabular-nums">
                    {stats.lateMoreDays?.count}
                  </div>
                )}
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse mt-1" />
                ) : (
                  <div className="text-xs font-semibold text-on-surface-variant/80 mt-0.5 tabular-nums">
                    {stats.lateMoreDays?.pct}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Link */}
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-end">
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
