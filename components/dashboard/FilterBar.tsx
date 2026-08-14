"use client";

import React, { useState } from "react";
import { POLRES_LIST } from "./types";

interface FilterBarProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedPolres: string;
  setSelectedPolres: (polres: string) => void;
  onApplyFilter?: () => void;
}

export default function FilterBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedPolres,
  setSelectedPolres,
  onApplyFilter,
}: FilterBarProps) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    if (onApplyFilter) onApplyFilter();
    setTimeout(() => setIsApplying(false), 300);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end bg-surface-container-lowest p-5 rounded-2xl shadow-soft border border-outline-variant">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
          TANGGAL AWAL
        </label>
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface cursor-pointer"
          />
        </div>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
          TANGGAL AKHIR
        </label>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface cursor-pointer"
          />
        </div>
      </div>

      <div className="flex-1 min-w-[220px]">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
          POLRES
        </label>
        <select
          value={selectedPolres}
          onChange={(e) => setSelectedPolres(e.target.value)}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface cursor-pointer"
        >
          {POLRES_LIST.map((pol) => (
            <option key={pol} value={pol}>
              {pol}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleApply}
        className={`bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all h-[42px] flex items-center justify-center gap-2 active:scale-95 shadow-sm ${
          isApplying ? "opacity-75 scale-95" : ""
        }`}
      >
        <span className="material-symbols-outlined text-sm">filter_alt</span>
        Terapkan
      </button>
    </div>
  );
}
