"use client";

import React from "react";

interface SidebarProps {
  activeNav: "dashboard" | "weekly";
  setActiveNav: (tab: "dashboard" | "weekly") => void;
}

export default function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  return (
    <>
      {/* Desktop SideNavBar */}
      <aside className="bg-surface-container-lowest text-on-surface fixed left-0 top-0 h-full w-[260px] z-50 border-r border-outline-variant flex flex-col py-6 px-4 hidden md:flex">
        {/* Brand Header */}
        <div className="mb-8 mt-2 px-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant shrink-0">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-on-surface leading-tight">
              Danantara Indonesia
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">
              SOE Monitoring
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className="flex-1 space-y-2 w-full mt-2">
          <li>
            <button
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeNav === "dashboard"
                  ? "bg-surface-container text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
              }`}
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{
                  fontVariationSettings:
                    activeNav === "dashboard" ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                dashboard
              </span>
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveNav("weekly")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeNav === "weekly"
                  ? "bg-surface-container text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
              }`}
            >
              <span className="material-symbols-outlined text-secondary">
                calendar_view_week
              </span>
              Weekly Report
            </button>
          </li>
        </ul>

        {/* Footer info in sidebar */}
        <div className="mt-auto pt-4 border-t border-outline-variant px-3">
          <div className="text-[11px] font-medium text-on-surface-variant">
            Sistem Monitoring Laka
          </div>
          <div className="text-[10px] text-outline mt-0.5">
            v2.4.0 • Regional Jateng
          </div>
        </div>
      </aside>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="bg-surface-container-lowest text-on-surface-variant text-[11px] font-medium fixed bottom-0 w-full md:hidden z-50 border-t border-outline-variant shadow-lg flex justify-around items-center h-16 px-4">
        <button
          onClick={() => setActiveNav("dashboard")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-colors ${
            activeNav === "dashboard"
              ? "text-primary bg-surface-container font-bold"
              : "text-on-surface-variant hover:bg-surface-container/50"
          }`}
        >
          <span
            className="material-symbols-outlined mb-0.5 text-xl"
            style={{
              fontVariationSettings:
                activeNav === "dashboard" ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            dashboard
          </span>
          Dashboard
        </button>

        <button
          onClick={() => setActiveNav("weekly")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-colors ${
            activeNav === "weekly"
              ? "text-primary bg-surface-container font-bold"
              : "text-on-surface-variant hover:bg-surface-container/50"
          }`}
        >
          <span className="material-symbols-outlined mb-0.5 text-xl">
            calendar_view_week
          </span>
          Weekly
        </button>
      </nav>
    </>
  );
}
