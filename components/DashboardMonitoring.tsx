"use client";

import React, { useState, useMemo } from "react";
import { LpRecord, KpiStats, INITIAL_RECORDS } from "./dashboard/types";
import { useTotalLp } from "@/hooks/useTotalLp";
import { useLakaTunggal } from "@/hooks/useLakaTunggal";
import { useJumlahKorban } from "@/hooks/useJumlahKorban";
import { useLukaLuka } from "@/hooks/useLukaLuka";
import { useLlMd } from "@/hooks/useLlMd";
import { useMd } from "@/hooks/useMd";
import { useTerlambatLapor } from "@/hooks/useTerlambatLapor";
import { useNormalLp } from "@/hooks/useNormalLp";
import { useTerjamin } from "@/hooks/useTerjamin";
import { useTidakTerjamin } from "@/hooks/useTidakTerjamin";
import { useEg2r } from "@/hooks/useEg2r";
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

  // Fetch Total LP from REST API safely
  const {
    totalLp: apiTotalLp,
    count: rawTotalLpCount,
    isLoading: isTotalLpLoading,
    isError: isTotalLpError,
    error: totalLpErrorMessage,
    source: totalLpSource,
    refetch: refetchTotalLp,
  } = useTotalLp();

  // Fetch Laka Tunggal from REST API safely
  const {
    lakaTunggal: apiLakaTunggal,
    lakaTunggalPct: apiLakaTunggalPct,
    isLoading: isLakaTunggalLoading,
    isError: isLakaTunggalError,
    error: lakaTunggalErrorMessage,
    source: lakaTunggalSource,
    refetch: refetchLakaTunggal,
  } = useLakaTunggal(rawTotalLpCount);

  // Fetch Jumlah Korban from REST API safely
  const {
    jumlahKorban: apiJumlahKorban,
    isLoading: isJumlahKorbanLoading,
    isError: isJumlahKorbanError,
    error: jumlahKorbanErrorMessage,
    source: jumlahKorbanSource,
    refetch: refetchJumlahKorban,
  } = useJumlahKorban();

  // Fetch Luka Luka from REST API safely
  const {
    lukaLuka: apiLukaLuka,
    isLoading: isLukaLukaLoading,
    isError: isLukaLukaError,
    error: lukaLukaErrorMessage,
    source: lukaLukaSource,
    refetch: refetchLukaLuka,
  } = useLukaLuka();

  // Fetch LL - MD from REST API safely
  const {
    llMd: apiLlMd,
    isLoading: isLlMdLoading,
    isError: isLlMdError,
    error: llMdErrorMessage,
    source: llMdSource,
    refetch: refetchLlMd,
  } = useLlMd();

  // Fetch Meninggal Dunia (MD) from REST API safely
  const {
    md: apiMd,
    isLoading: isMdLoading,
    isError: isMdError,
    error: mdErrorMessage,
    source: mdSource,
    refetch: refetchMd,
  } = useMd();

  // Fetch Terlambat Lapor metrics from REST API safely
  const {
    terlambatLapor: apiTerlambatLapor,
    terlambatPct: apiTerlambatPct,
    late3Days: apiLate3Days,
    late7Days: apiLate7Days,
    lateMoreDays: apiLateMoreDays,
    isLoading: isTerlambatLoading,
    isError: isTerlambatError,
    error: terlambatErrorMessage,
    source: terlambatSource,
    refetch: refetchTerlambat,
  } = useTerlambatLapor();

  // Fetch LP Normal from REST API safely
  const {
    normal: apiNormal,
    normalPct: apiNormalPct,
    isLoading: isNormalLoading,
    isError: isNormalError,
    error: normalErrorMessage,
    source: normalSource,
    refetch: refetchNormal,
  } = useNormalLp();

  // Fetch Terjamin from REST API safely
  const {
    terjamin: apiTerjamin,
    isLoading: isTerjaminLoading,
    isError: isTerjaminError,
    error: terjaminErrorMessage,
    source: terjaminSource,
    refetch: refetchTerjamin,
  } = useTerjamin();

  // Fetch Tidak Terjamin from REST API safely
  const {
    tidakTerjamin: apiTidakTerjamin,
    isLoading: isTidakTerjaminLoading,
    isError: isTidakTerjaminError,
    error: tidakTerjaminErrorMessage,
    source: tidakTerjaminSource,
    refetch: refetchTidakTerjamin,
  } = useTidakTerjamin();

  // Fetch EG2R from REST API safely
  const {
    eg2r: apiEg2r,
    isLoading: isEg2rLoading,
    isError: isEg2rError,
    error: eg2rErrorMessage,
    source: eg2rSource,
    refetch: refetchEg2r,
  } = useEg2r();

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
        totalLp: apiTotalLp,
        totalLpLoading: isTotalLpLoading,
        totalLpError: isTotalLpError,
        totalLpErrorMessage,
        totalLpSource,
        onRetryTotalLp: refetchTotalLp,
        lakaTunggal: apiLakaTunggal,
        lakaTunggalPct: apiLakaTunggalPct,
        lakaTunggalLoading: isLakaTunggalLoading,
        lakaTunggalError: isLakaTunggalError,
        lakaTunggalErrorMessage,
        lakaTunggalSource,
        onRetryLakaTunggal: refetchLakaTunggal,
        jumlahKorban: apiJumlahKorban,
        jumlahKorbanLoading: isJumlahKorbanLoading,
        jumlahKorbanError: isJumlahKorbanError,
        jumlahKorbanErrorMessage,
        jumlahKorbanSource,
        onRetryJumlahKorban: refetchJumlahKorban,
        lukaLuka: apiLukaLuka,
        lukaLukaLoading: isLukaLukaLoading,
        lukaLukaError: isLukaLukaError,
        lukaLukaErrorMessage,
        lukaLukaSource,
        onRetryLukaLuka: refetchLukaLuka,
        llMd: apiLlMd,
        llMdLoading: isLlMdLoading,
        llMdError: isLlMdError,
        llMdErrorMessage,
        llMdSource,
        onRetryLlMd: refetchLlMd,
        md: apiMd,
        mdLoading: isMdLoading,
        mdError: isMdError,
        mdErrorMessage,
        mdSource,
        onRetryMd: refetchMd,
        terlambatLapor: apiTerlambatLapor,
        terlambatPct: apiTerlambatPct,
        terlambatLaporLoading: isTerlambatLoading,
        terlambatLaporError: isTerlambatError,
        terlambatLaporErrorMessage: terlambatErrorMessage,
        terlambatLaporSource: terlambatSource,
        onRetryTerlambatLapor: refetchTerlambat,
        late3Days: apiLate3Days,
        late7Days: apiLate7Days,
        lateMoreDays: apiLateMoreDays,
        normal: apiNormal,
        normalPct: apiNormalPct,
        normalLoading: isNormalLoading,
        normalError: isNormalError,
        normalErrorMessage,
        normalSource,
        onRetryNormal: refetchNormal,
        terjamin: apiTerjamin,
        terjaminLoading: isTerjaminLoading,
        terjaminError: isTerjaminError,
        terjaminErrorMessage,
        terjaminSource,
        onRetryTerjamin: refetchTerjamin,
        tidakTerjamin: apiTidakTerjamin,
        tidakTerjaminLoading: isTidakTerjaminLoading,
        tidakTerjaminError: isTidakTerjaminError,
        tidakTerjaminErrorMessage,
        tidakTerjaminSource,
        onRetryTidakTerjamin: refetchTidakTerjamin,
        eg2r: apiEg2r,
        eg2rLoading: isEg2rLoading,
        eg2rError: isEg2rError,
        eg2rErrorMessage,
        eg2rSource,
        onRetryEg2r: refetchEg2r,
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
      totalLpLoading: false,
      totalLpError: false,
      totalLpSource: "api",
      onRetryTotalLp: refetchTotalLp,
      lakaTunggal: (single * 52).toLocaleString(),
      lakaTunggalPct: `${total > 0 ? Math.round((single / total) * 100) : 0}% DARI TOTAL`,
      lakaTunggalLoading: false,
      lakaTunggalError: false,
      lakaTunggalSource: "api",
      onRetryLakaTunggal: refetchLakaTunggal,
      jumlahKorban: (korban * 95).toLocaleString(),
      jumlahKorbanLoading: false,
      jumlahKorbanError: false,
      jumlahKorbanSource: "api",
      onRetryJumlahKorban: refetchJumlahKorban,
      lukaLuka: (luka * 80).toLocaleString(),
      lukaLukaLoading: false,
      lukaLukaError: false,
      lukaLukaSource: "api",
      onRetryLukaLuka: refetchLukaLuka,
      llMd: (llmd * 40).toLocaleString(),
      llMdLoading: false,
      llMdError: false,
      llMdSource: "api",
      onRetryLlMd: refetchLlMd,
      md: (mdCount * 22).toLocaleString(),
      mdLoading: false,
      mdError: false,
      mdSource: "api",
      onRetryMd: refetchMd,
      terlambatLapor: (lateCount * 12).toString(),
      terlambatPct: "8.4%",
      terlambatLaporLoading: false,
      terlambatLaporError: false,
      terlambatLaporSource: "api",
      onRetryTerlambatLapor: refetchTerlambat,
      late3Days: { count: (lateCount * 6).toString(), pct: "16%" },
      late7Days: { count: (lateCount * 4).toString(), pct: "10%" },
      lateMoreDays: { count: (lateCount * 2).toString(), pct: "4%" },
      normal: (normCount * 110).toLocaleString(),
      normalPct: "78%",
      normalLoading: false,
      normalError: false,
      normalSource: "api",
      onRetryNormal: refetchNormal,
      terjamin: (terjaminCount * 90).toLocaleString(),
      terjaminLoading: false,
      terjaminError: false,
      terjaminSource: "api",
      onRetryTerjamin: refetchTerjamin,
      tidakTerjamin: (tidakTerjaminCount * 15).toLocaleString(),
      tidakTerjaminLoading: false,
      tidakTerjaminError: false,
      tidakTerjaminSource: "api",
      onRetryTidakTerjamin: refetchTidakTerjamin,
      eg2r: eg2rCount.toString(),
      eg2rLoading: false,
      eg2rError: false,
      eg2rSource: "api",
      onRetryEg2r: refetchEg2r,
    };
  }, [
    selectedPolres,
    filteredRecords,
    apiTotalLp,
    isTotalLpLoading,
    isTotalLpError,
    totalLpErrorMessage,
    totalLpSource,
    refetchTotalLp,
    apiLakaTunggal,
    apiLakaTunggalPct,
    isLakaTunggalLoading,
    isLakaTunggalError,
    lakaTunggalErrorMessage,
    lakaTunggalSource,
    refetchLakaTunggal,
    apiJumlahKorban,
    isJumlahKorbanLoading,
    isJumlahKorbanError,
    jumlahKorbanErrorMessage,
    jumlahKorbanSource,
    refetchJumlahKorban,
    apiLukaLuka,
    isLukaLukaLoading,
    isLukaLukaError,
    lukaLukaErrorMessage,
    lukaLukaSource,
    refetchLukaLuka,
    apiLlMd,
    isLlMdLoading,
    isLlMdError,
    llMdErrorMessage,
    llMdSource,
    refetchLlMd,
    apiMd,
    isMdLoading,
    isMdError,
    mdErrorMessage,
    mdSource,
    refetchMd,
    apiTerlambatLapor,
    apiTerlambatPct,
    apiLate3Days,
    apiLate7Days,
    apiLateMoreDays,
    isTerlambatLoading,
    isTerlambatError,
    terlambatErrorMessage,
    terlambatSource,
    refetchTerlambat,
    apiNormal,
    apiNormalPct,
    isNormalLoading,
    isNormalError,
    normalErrorMessage,
    normalSource,
    refetchNormal,
    apiTerjamin,
    isTerjaminLoading,
    isTerjaminError,
    terjaminErrorMessage,
    terjaminSource,
    refetchTerjamin,
    apiTidakTerjamin,
    isTidakTerjaminLoading,
    isTidakTerjaminError,
    tidakTerjaminErrorMessage,
    tidakTerjaminSource,
    refetchTidakTerjamin,
    apiEg2r,
    isEg2rLoading,
    isEg2rError,
    eg2rErrorMessage,
    eg2rSource,
    refetchEg2r,
  ]);

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
