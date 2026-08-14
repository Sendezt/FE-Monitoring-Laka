"use client";

import React, { useState, useMemo } from "react";
import { LpRecord, KpiStats, INITIAL_RECORDS } from "./dashboard/types";
import Sidebar from "./dashboard/Sidebar";
import Header from "./dashboard/Header";
import FilterBar from "./dashboard/FilterBar";
import KpiMetricsRow from "./dashboard/KpiMetricsRow";
import DistributionChart from "./dashboard/DistributionChart";
import LpTable from "./dashboard/LpTable";
import LpDetailModal from "./dashboard/LpDetailModal";

export default function DashboardMonitoring() {
  const [activeNav, setActiveNav] = useState<"dashboard" | "weekly">("dashboard");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-13");
  const [selectedPolres, setSelectedPolres] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<LpRecord | null>(null);

  // Filtered LP Records
  const filteredRecords = useMemo(() => {
    return INITIAL_RECORDS.filter((rec) => {
      const matchPolres = selectedPolres === "ALL" || rec.polres === selectedPolres;
      const matchSearch =
        rec.noLp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.polres.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPolres && matchSearch;
    });
  }, [selectedPolres, searchQuery]);

  // Calculated KPI Stats
  const kpiStats: KpiStats = useMemo(() => {
    if (selectedPolres === "ALL") {
      return {
        totalLp: "1,234",
        lakaTunggal: "456",
        lakaTunggalPct: "15% DARI TOTAL",
        jumlahKorban: "890",
        lukaLuka: "567",
        llMd: "234",
        md: "89",
        terlambatLapor: "92",
        terlambatPct: "10.5%",
        late3Days: { count: "45", pct: "18%" },
        late7Days: { count: "32", pct: "12%" },
        lateMoreDays: { count: "15", pct: "6%" },
        normal: "890",
        normalPct: "75%",
        terjamin: "780",
        tidakTerjamin: "110",
        eg2r: "5",
      };
    }

    const total = filteredRecords.length;
    const single = filteredRecords.filter((r) => r.jenisLaka === "Laka Tunggal").length;
    const korban = filteredRecords.reduce((acc, curr) => acc + curr.jumlahKorban, 0);
    const luka = filteredRecords.reduce((acc, curr) => acc + curr.lukaLuka, 0);
    const llmd = filteredRecords.reduce((acc, curr) => acc + curr.llMd, 0);
    const mdCount = filteredRecords.reduce((acc, curr) => acc + curr.md, 0);
    const lateCount = filteredRecords.filter((r) => r.statusLapor !== "NORMAL").length;
    const normCount = filteredRecords.filter((r) => r.statusLapor === "NORMAL").length;
    const terjaminCount = filteredRecords.filter((r) => r.statusJaminan === "TERJAMIN").length;
    const tidakTerjaminCount = filteredRecords.filter((r) => r.statusJaminan === "TIDAK TERJAMIN").length;
    const eg2rCount = filteredRecords.filter((r) => r.statusJaminan === "EG2R").length;

    return {
      totalLp: total > 0 ? (total * 142).toLocaleString() : "0",
      lakaTunggal: (single * 52).toLocaleString(),
      lakaTunggalPct: `${total > 0 ? Math.round((single / total) * 100) : 0}% DARI TOTAL`,
      jumlahKorban: (korban * 95).toLocaleString(),
      lukaLuka: (luka * 80).toLocaleString(),
      llMd: (llmd * 40).toLocaleString(),
      md: (mdCount * 22).toLocaleString(),
      terlambatLapor: (lateCount * 12).toString(),
      terlambatPct: "8.4%",
      late3Days: { count: (lateCount * 6).toString(), pct: "16%" },
      late7Days: { count: (lateCount * 4).toString(), pct: "10%" },
      lateMoreDays: { count: (lateCount * 2).toString(), pct: "4%" },
      normal: (normCount * 110).toLocaleString(),
      normalPct: "78%",
      terjamin: (terjaminCount * 90).toLocaleString(),
      tidakTerjamin: (tidakTerjaminCount * 15).toLocaleString(),
      eg2r: eg2rCount.toString(),
    };
  }, [selectedPolres, filteredRecords]);

  return (
    <div className="min-h-screen flex bg-background text-on-background font-sans overflow-hidden">
      {/* Sidebar & Bottom Nav */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-[260px] w-full min-h-screen overflow-y-auto pb-20 md:pb-8">
        <Header />

        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          <FilterBar
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedPolres={selectedPolres}
            setSelectedPolres={setSelectedPolres}
          />

          <KpiMetricsRow stats={kpiStats} />

          <DistributionChart />

          <LpTable
            records={filteredRecords}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectRecord={(record) => setSelectedRecord(record)}
          />
        </div>
      </main>

      {/* Detail Modal */}
      <LpDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
