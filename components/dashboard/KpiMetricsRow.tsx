"use client";

import React from "react";
import { KpiStats } from "./types";

interface KpiMetricsRowProps {
  stats: KpiStats;
}

export default function KpiMetricsRow({ stats }: KpiMetricsRowProps) {
  return (
    <div className="space-y-4">
      {/* KPI ROW 1 (6 main cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Blue */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-[#1D4ED8] rounded-2xl p-4 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              TOTAL LP
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              {stats.totalLp}
            </div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-4 flex items-center justify-between">
            <span>BERKAS</span>
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#1D4ED8]">
                description
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Maroon */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-[#991B1B] rounded-2xl p-4 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              LAKA TUNGGAL
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              {stats.lakaTunggal}
            </div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-4 flex items-center justify-between">
            <span>{stats.lakaTunggalPct}</span>
            <div className="w-8 h-8 rounded-full bg-[#991B1B]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#991B1B]">
                directions_car
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Orange */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-[#EA580C] rounded-2xl p-4 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              JUMLAH KORBAN
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              {stats.jumlahKorban}
            </div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-4 flex items-center justify-between">
            <span>KORBAN</span>
            <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#EA580C]">
                group
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Red/Salmon */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-[#EF4444] rounded-2xl p-4 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              LUKA LUKA
            </div>
            <div className="inline-block bg-[#EF4444]/5 px-3 py-1 rounded-xl text-3xl md:text-4xl font-extrabold text-on-surface border border-[#EF4444]/20">
              {stats.lukaLuka}
            </div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-4 flex items-center justify-between">
            <span>KORBAN</span>
            <div className="w-8 h-8 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#EF4444]">
                local_hospital
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Teal */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-[#0D9488] rounded-2xl p-4 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              LL - MD
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              {stats.llMd}
            </div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-4 flex items-center justify-between">
            <span>KORBAN</span>
            <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#0D9488]">
                healing
              </span>
            </div>
          </div>
        </div>

        {/* Card 6: Slate/Gray */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-[#475569] rounded-2xl p-4 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:shadow-floating transition-all">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              MD
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
              {stats.md}
            </div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-4 flex items-center justify-between">
            <span>KORBAN</span>
            <div className="w-8 h-8 rounded-full bg-[#475569]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#475569]">
                warning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI ROW 2 (8 compact columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3">
        {/* Consolidated Late Reports Card */}
        <div className="col-span-2 md:col-span-2 lg:col-span-4 bg-surface-container-lowest border border-outline-variant border-l-4 border-[#DC2626] rounded-2xl p-4 shadow-soft flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1 flex flex-col justify-center min-w-[120px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 leading-tight">
              LP TERLAMBAT LAPOR
            </div>
            <div className="text-3xl font-extrabold text-on-surface leading-none mb-2 mt-1">
              {stats.terlambatLapor}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                TOTAL LATE
              </div>
              <div className="text-sm font-bold text-[#DC2626]">
                {stats.terlambatPct}
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-20 bg-outline-variant/40"></div>
          <div className="md:hidden h-px w-full bg-outline-variant/40"></div>

          <div className="flex-[2] flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between bg-surface-container px-3 py-1.5 rounded-full">
              <span className="bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide w-20 text-center">
                1-3 HARI
              </span>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface text-sm">
                  {stats.late3Days.count}
                </span>
                <span className="text-xs text-on-surface-variant font-medium w-10 text-right">
                  {stats.late3Days.pct}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container px-3 py-1.5 rounded-full">
              <span className="bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide w-20 text-center">
                4-7 HARI
              </span>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface text-sm">
                  {stats.late7Days.count}
                </span>
                <span className="text-xs text-on-surface-variant font-medium w-10 text-right">
                  {stats.late7Days.pct}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container px-3 py-1.5 rounded-full">
              <span className="bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide w-20 text-center">
                &gt;7 HARI
              </span>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface text-sm">
                  {stats.lateMoreDays.count}
                </span>
                <span className="text-xs text-on-surface-variant font-medium w-10 text-right">
                  {stats.lateMoreDays.pct}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Compact Status Cards */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-[#16A34A] rounded-2xl p-4 shadow-soft flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 leading-tight">
            NORMAL
          </div>
          <div className="text-2xl font-extrabold text-on-surface my-1">
            {stats.normal}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] mt-auto">
            {stats.normalPct}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-[#059669] rounded-2xl p-4 shadow-soft flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 leading-tight">
            TERJAMIN
          </div>
          <div className="text-2xl font-extrabold text-on-surface my-1">
            {stats.terjamin}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-auto">
            KORBAN
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-[#334155] rounded-2xl p-4 shadow-soft flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 leading-tight">
            TIDAK TERJAMIN
          </div>
          <div className="text-2xl font-extrabold text-on-surface my-1">
            {stats.tidakTerjamin}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-auto">
            KORBAN
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-[#831843] rounded-2xl p-4 shadow-soft flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 leading-tight">
            EG2R
          </div>
          <div className="text-2xl font-extrabold text-on-surface my-1">
            {stats.eg2r}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-auto">
            KORBAN
          </div>
        </div>
      </div>
    </div>
  );
}
