"use client";

import React from "react";

export default function Header() {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant text-on-surface sticky top-0 z-40 transition-colors duration-200 flex justify-between items-center w-full px-4 md:px-10 h-[72px] shrink-0 shadow-soft">
      <div className="flex items-center gap-3 truncate">
        <span className="material-symbols-outlined text-primary text-2xl md:hidden">
          shield
        </span>
        <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-on-surface truncate">
          Dashboard Monitoring Laka Jawa Tengah
        </h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Jasa Raharja
          </span>
          <span className="text-[10px] text-outline">A Member of IFG</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
          JR
        </div>
      </div>
    </header>
  );
}
