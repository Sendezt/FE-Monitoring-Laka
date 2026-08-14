"use client";

import React, { useState } from "react";
import { CHART_DATA } from "./types";

export default function DistributionChart() {
  const [chartMetric, setChartMetric] = useState<"lp" | "korban">("lp");

  const maxChartVal = chartMetric === "lp" ? 400 : 350;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Area */}
      <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant p-6 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                bar_chart
              </span>
              Distribusi Kecelakaan per Polres Jawa Tengah
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Perbandingan jumlah LP vs Korban per jajaran Polres
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl">
            <button
              onClick={() => setChartMetric("lp")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMetric === "lp"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Total LP
            </button>
            <button
              onClick={() => setChartMetric("korban")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMetric === "korban"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Jumlah Korban
            </button>
          </div>
        </div>

        {/* Custom SVG Bar Chart */}
        <div className="flex-1 min-h-[280px] flex flex-col justify-end pt-4 pb-2 px-2">
          <div className="flex items-end justify-between h-56 gap-2 border-b border-outline-variant pb-2">
            {CHART_DATA.map((item) => {
              const value = chartMetric === "lp" ? item.lp : item.korban;
              const heightPct = Math.round((value / maxChartVal) * 100);
              return (
                <div
                  key={item.polres}
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                >
                  <div className="text-[11px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                    {value}
                  </div>
                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-300 group-hover:bg-primary-container relative overflow-hidden"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-2 pt-3 text-[10px] font-bold uppercase text-on-surface-variant text-center">
            {CHART_DATA.map((item) => (
              <div key={item.polres} className="flex-1 truncate">
                {item.polres}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Breakdown Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">
              pie_chart
            </span>
            Status Keterjaminan
          </h3>

          <div className="space-y-4 my-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-on-surface">Terjamin (780 Korban)</span>
                <span className="text-[#059669] font-bold">87.6%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#059669] h-full rounded-full w-[87.6%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-on-surface">Tidak Terjamin (110 Korban)</span>
                <span className="text-[#334155] font-bold">12.3%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#334155] h-full rounded-full w-[12.3%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-on-surface">EG2R (5 Korban)</span>
                <span className="text-[#831843] font-bold">0.5%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#831843] h-full rounded-full w-[0.5%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant bg-surface-container/40 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-medium">Status Pengiriman LP:</span>
            <span className="bg-[#16A34A]/10 text-[#16A34A] px-2.5 py-1 rounded-full font-bold">
              95% Terhubung
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
