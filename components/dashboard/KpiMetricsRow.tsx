"use client";

import React from "react";
import { KpiStats } from "./types";

interface KpiMetricsRowProps {
  stats: KpiStats;
}

export default function KpiMetricsRow({ stats }: KpiMetricsRowProps) {
  return (
    <div className="space-y-5 font-sans">
      {/* KPI ROW 1: Total LP, Laka Tunggal, Jumlah Korban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Blue (Total LP) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#1D4ED8] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                TOTAL LP
              </span>
              
              {/* REST API Status Indicator */}
              {stats.totalLpLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.totalLpError ? (
                <button
                  type="button"
                  onClick={stats.onRetryTotalLp}
                  title={stats.totalLpErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API totalLaporanPolisi"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.totalLpLoading ? (
              <div className="h-10 w-28 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums group-hover:scale-[1.01] transition-transform origin-left">
                {stats.totalLp}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
              BERKAS
              {stats.totalLpError && (
                <span className="text-[10px] text-amber-500 font-normal lowercase">(fallback)</span>
              )}
            </span>

            <button
              type="button"
              onClick={stats.onRetryTotalLp}
              title="Refresh data dari REST API"
              className="w-8 h-8 rounded-xl bg-[#1D4ED8]/10 group-hover:bg-[#1D4ED8] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#1D4ED8] group-hover:text-white transition-colors">
                {stats.totalLpLoading ? "sync" : "description"}
              </span>
            </button>
          </div>
        </div>

        {/* Card 2: Maroon (Laka Tunggal) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#991B1B] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                LAKA TUNGGAL
              </span>

              {/* REST API Status Indicator */}
              {stats.lakaTunggalLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#991B1B]/10 text-[#991B1B] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.lakaTunggalError ? (
                <button
                  type="button"
                  onClick={stats.onRetryLakaTunggal}
                  title={stats.lakaTunggalErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API lakaTunggal"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.lakaTunggalLoading ? (
              <div className="h-10 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums group-hover:scale-[1.01] transition-transform origin-left">
                {stats.lakaTunggal}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]" />
              {stats.lakaTunggalPct}
              {stats.lakaTunggalError && (
                <span className="text-[10px] text-amber-500 font-normal lowercase">(fallback)</span>
              )}
            </span>

            <button
              type="button"
              onClick={stats.onRetryLakaTunggal}
              title="Refresh data Laka Tunggal dari REST API"
              className="w-8 h-8 rounded-xl bg-[#991B1B]/10 group-hover:bg-[#991B1B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#991B1B] group-hover:text-white transition-colors">
                {stats.lakaTunggalLoading ? "sync" : "directions_car"}
              </span>
            </button>
          </div>
        </div>

        {/* Card 3: Orange (Jumlah Korban) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#EA580C] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                JUMLAH KORBAN
              </span>

              {/* REST API Status Indicator */}
              {stats.jumlahKorbanLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.jumlahKorbanError ? (
                <button
                  type="button"
                  onClick={stats.onRetryJumlahKorban}
                  title={stats.jumlahKorbanErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API jumlahKorban"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.jumlahKorbanLoading ? (
              <div className="h-10 w-28 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums group-hover:scale-[1.01] transition-transform origin-left">
                {stats.jumlahKorban}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
              KORBAN
              {stats.jumlahKorbanError && (
                <span className="text-[10px] text-amber-500 font-normal lowercase">(fallback)</span>
              )}
            </span>

            <button
              type="button"
              onClick={stats.onRetryJumlahKorban}
              title="Refresh data Jumlah Korban dari REST API"
              className="w-8 h-8 rounded-xl bg-[#EA580C]/10 group-hover:bg-[#EA580C] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#EA580C] group-hover:text-white transition-colors">
                {stats.jumlahKorbanLoading ? "sync" : "group"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI ROW 2: Luka-luka, LL-MD, MD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 4: Red/Salmon (Luka Luka) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#EF4444] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                LUKA LUKA
              </span>

              {/* REST API Status Indicator */}
              {stats.lukaLukaLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.lukaLukaError ? (
                <button
                  type="button"
                  onClick={stats.onRetryLukaLuka}
                  title={stats.lukaLukaErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API lukaLuka"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.lukaLukaLoading ? (
              <div className="h-10 w-28 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="inline-block bg-[#EF4444]/10 px-3 py-1 rounded-xl text-3xl lg:text-4xl font-extrabold text-on-surface border border-[#EF4444]/20 tabular-nums group-hover:scale-[1.01] transition-transform origin-left">
                {stats.lukaLuka}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              KORBAN
              {stats.lukaLukaError && (
                <span className="text-[10px] text-amber-500 font-normal lowercase">(fallback)</span>
              )}
            </span>

            <button
              type="button"
              onClick={stats.onRetryLukaLuka}
              title="Refresh data Luka Luka dari REST API"
              className="w-8 h-8 rounded-xl bg-[#EF4444]/10 group-hover:bg-[#EF4444] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#EF4444] group-hover:text-white transition-colors">
                {stats.lukaLukaLoading ? "sync" : "local_hospital"}
              </span>
            </button>
          </div>
        </div>

        {/* Card 5: Teal (LL - MD) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#0D9488] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                LL - MD
              </span>

              {/* REST API Status Indicator */}
              {stats.llMdLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.llMdError ? (
                <button
                  type="button"
                  onClick={stats.onRetryLlMd}
                  title={stats.llMdErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API llmd"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.llMdLoading ? (
              <div className="h-10 w-20 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums group-hover:scale-[1.01] transition-transform origin-left">
                {stats.llMd}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
              KORBAN
              {stats.llMdError && (
                <span className="text-[10px] text-amber-500 font-normal lowercase">(fallback)</span>
              )}
            </span>

            <button
              type="button"
              onClick={stats.onRetryLlMd}
              title="Refresh data LL - MD dari REST API"
              className="w-8 h-8 rounded-xl bg-[#0D9488]/10 group-hover:bg-[#0D9488] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#0D9488] group-hover:text-white transition-colors">
                {stats.llMdLoading ? "sync" : "healing"}
              </span>
            </button>
          </div>
        </div>

        {/* Card 6: Slate/Gray (MD) */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#475569] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                MD
              </span>

              {/* REST API Status Indicator */}
              {stats.mdLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#475569]/10 text-[#475569] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#475569] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.mdError ? (
                <button
                  type="button"
                  onClick={stats.onRetryMd}
                  title={stats.mdErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API meninggaldunia"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.mdLoading ? (
              <div className="h-10 w-20 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight tabular-nums group-hover:scale-[1.01] transition-transform origin-left">
                {stats.md}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />
              KORBAN
              {stats.mdError && (
                <span className="text-[10px] text-amber-500 font-normal lowercase">(fallback)</span>
              )}
            </span>

            <button
              type="button"
              onClick={stats.onRetryMd}
              title="Refresh data MD dari REST API"
              className="w-8 h-8 rounded-xl bg-[#475569]/10 group-hover:bg-[#475569] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#475569] group-hover:text-white transition-colors">
                {stats.mdLoading ? "sync" : "warning"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI ROW 3: LP Terlambat Lapor, Normal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consolidated Late Reports Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#DC2626] rounded-2xl p-5 shadow-soft flex flex-col md:flex-row gap-5 md:items-center relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex-1 flex flex-col justify-between min-w-[150px]">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                  LP TERLAMBAT LAPOR
                </span>

                {/* REST API Status Indicator */}
                {stats.terlambatLaporLoading ? (
                  <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#DC2626]/10 text-[#DC2626] font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
                    MEMUAT...
                  </span>
                ) : stats.terlambatLaporError ? (
                  <button
                    type="button"
                    onClick={stats.onRetryTerlambatLapor}
                    title={stats.terlambatLaporErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                    className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                  >
                    <span className="material-symbols-outlined text-[10px]">refresh</span>
                    RETRY
                  </button>
                ) : (
                  <span
                    title="Data diambil dari 4 REST API Terlambat Lapor"
                    className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE API
                  </span>
                )}
              </div>

              {stats.terlambatLaporLoading ? (
                <div className="h-9 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
              ) : (
                <div className="text-3xl lg:text-4xl font-extrabold text-on-surface leading-none mb-3 mt-1 tabular-nums">
                  {stats.terlambatLapor}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/80">
                  TOTAL LATE
                </div>
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-12 rounded bg-outline-variant/20 animate-pulse mt-0.5" />
                ) : (
                  <div className="text-sm font-extrabold text-[#DC2626] tabular-nums">
                    {stats.terlambatPct}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={stats.onRetryTerlambatLapor}
                title="Refresh data Terlambat Lapor dari REST API"
                className="w-8 h-8 rounded-xl bg-[#DC2626]/10 group-hover:bg-[#DC2626] flex items-center justify-center transition-colors cursor-pointer ml-2"
              >
                <span className="material-symbols-outlined text-base text-[#DC2626] group-hover:text-white transition-colors">
                  {stats.terlambatLaporLoading ? "sync" : "refresh"}
                </span>
              </button>
            </div>
          </div>

          <div className="hidden md:block w-px h-24 bg-outline-variant/40"></div>
          <div className="md:hidden h-px w-full bg-outline-variant/40"></div>

          <div className="flex-[2] flex flex-col justify-center gap-2">
            {/* 1-3 Hari */}
            <div className="flex items-center justify-between bg-surface-container/60 border border-outline-variant/40 px-3.5 py-2 rounded-xl">
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                1-3 HARI
              </span>
              <div className="flex items-center gap-4">
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="font-extrabold text-on-surface text-sm tabular-nums">
                    {stats.late3Days.count}
                  </span>
                )}
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="text-xs text-on-surface-variant font-bold tabular-nums w-12 text-right">
                    {stats.late3Days.pct}
                  </span>
                )}
              </div>
            </div>

            {/* 4-7 Hari */}
            <div className="flex items-center justify-between bg-surface-container/60 border border-outline-variant/40 px-3.5 py-2 rounded-xl">
              <span className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                4-7 HARI
              </span>
              <div className="flex items-center gap-4">
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="font-extrabold text-on-surface text-sm tabular-nums">
                    {stats.late7Days.count}
                  </span>
                )}
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="text-xs text-on-surface-variant font-bold tabular-nums w-12 text-right">
                    {stats.late7Days.pct}
                  </span>
                )}
              </div>
            </div>

            {/* >7 Hari */}
            <div className="flex items-center justify-between bg-surface-container/60 border border-outline-variant/40 px-3.5 py-2 rounded-xl">
              <span className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                &gt;7 HARI
              </span>
              <div className="flex items-center gap-4">
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="font-extrabold text-on-surface text-sm tabular-nums">
                    {stats.lateMoreDays.count}
                  </span>
                )}
                {stats.terlambatLaporLoading ? (
                  <div className="h-4 w-10 rounded bg-outline-variant/20 animate-pulse" />
                ) : (
                  <span className="text-xs text-on-surface-variant font-bold tabular-nums w-12 text-right">
                    {stats.lateMoreDays.pct}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card: NORMAL */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#16A34A] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                NORMAL
              </span>

              {/* REST API Status Indicator */}
              {stats.normalLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.normalError ? (
                <button
                  type="button"
                  onClick={stats.onRetryNormal}
                  title={stats.normalErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API lpnormal"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.normalLoading ? (
              <div className="h-10 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
            ) : (
              <div className="text-3xl lg:text-4xl font-extrabold text-on-surface my-1 group-hover:scale-[1.01] transition-transform origin-left tabular-nums">
                {stats.normal}
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A] mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
            {stats.normalLoading ? (
              <div className="h-4 w-12 rounded bg-outline-variant/20 animate-pulse" />
            ) : (
              <span className="flex items-center gap-1.5 tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                {stats.normalPct}
              </span>
            )}

            <button
              type="button"
              onClick={stats.onRetryNormal}
              title="Refresh data NORMAL dari REST API"
              className="w-8 h-8 rounded-xl bg-[#16A34A]/10 group-hover:bg-[#16A34A] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#16A34A] group-hover:text-white transition-colors">
                {stats.normalLoading ? "sync" : "refresh"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI ROW 4: Terjamin, Tidak Terjamin, EG2R */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TERJAMIN */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#059669] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                TERJAMIN
              </span>

              {/* REST API Status Indicator */}
              {stats.terjaminLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.terjaminError ? (
                <button
                  type="button"
                  onClick={stats.onRetryTerjamin}
                  title={stats.terjaminErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API terjamin"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.terjaminLoading ? (
              <div className="h-10 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
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
              title="Refresh data TERJAMIN dari REST API"
              className="w-8 h-8 rounded-xl bg-[#059669]/10 group-hover:bg-[#059669] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#059669] group-hover:text-white transition-colors">
                {stats.terjaminLoading ? "sync" : "refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* TIDAK TERJAMIN */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#334155] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                TIDAK TERJAMIN
              </span>

              {/* REST API Status Indicator */}
              {stats.tidakTerjaminLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#334155]/10 text-[#334155] dark:text-slate-300 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#334155] dark:bg-slate-300 animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.tidakTerjaminError ? (
                <button
                  type="button"
                  onClick={stats.onRetryTidakTerjamin}
                  title={stats.tidakTerjaminErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API tidakterjamin"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.tidakTerjaminLoading ? (
              <div className="h-10 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
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
              title="Refresh data TIDAK TERJAMIN dari REST API"
              className="w-8 h-8 rounded-xl bg-[#334155]/10 group-hover:bg-[#334155] dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#334155] dark:text-slate-300 group-hover:text-white transition-colors">
                {stats.tidakTerjaminLoading ? "sync" : "refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* EG2R */}
        <div className="bg-surface-container-lowest border border-outline-variant/70 border-l-[5px] border-l-[#831843] rounded-2xl p-5 shadow-soft flex flex-col justify-between relative group hover:shadow-floating hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant leading-tight">
                EG2R
              </span>

              {/* REST API Status Indicator */}
              {stats.eg2rLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-pink-300 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#831843] dark:bg-pink-300 animate-ping" />
                  MEMUAT...
                </span>
              ) : stats.eg2rError ? (
                <button
                  type="button"
                  onClick={stats.onRetryEg2r}
                  title={stats.eg2rErrorMessage || "Gagal memuat API. Klik untuk coba lagi."}
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <span className="material-symbols-outlined text-[10px]">refresh</span>
                  RETRY
                </button>
              ) : (
                <span
                  title="Data diambil dari REST API eg2r"
                  className="inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE API
                </span>
              )}
            </div>

            {stats.eg2rLoading ? (
              <div className="h-10 w-24 rounded-xl bg-outline-variant/20 animate-pulse my-1" />
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
              title="Refresh data EG2R dari REST API"
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
