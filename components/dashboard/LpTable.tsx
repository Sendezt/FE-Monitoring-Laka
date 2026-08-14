"use client";

import React from "react";
import { LpRecord } from "./types";

interface LpTableProps {
  records: LpRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectRecord: (record: LpRecord) => void;
}

export default function LpTable({
  records,
  searchQuery,
  setSearchQuery,
  onSelectRecord,
}: LpTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              table_chart
            </span>
            Rincian Laporan Polisi (LP) Terbaru
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Daftar laporan polisi kecelakaan lalu lintas wilayah Jawa Tengah
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Cari No LP, Polres, Lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="material-symbols-outlined text-outline absolute left-2.5 top-2.5 text-sm">
              search
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="py-3 px-4">NO. LP</th>
              <th className="py-3 px-4">TANGGAL</th>
              <th className="py-3 px-4">POLRES</th>
              <th className="py-3 px-4">LOKASI</th>
              <th className="py-3 px-4">KORBAN</th>
              <th className="py-3 px-4">STATUS LAPOR</th>
              <th className="py-3 px-4">JAMINAN</th>
              <th className="py-3 px-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-xs text-on-surface">
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                  Tidak ada data LP yang sesuai filter.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-surface-container/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-primary max-w-[200px] truncate">
                    {record.noLp}
                  </td>
                  <td className="py-3 px-4 font-medium text-on-surface-variant whitespace-nowrap">
                    {record.tanggal}
                  </td>
                  <td className="py-3 px-4 font-bold text-on-surface whitespace-nowrap">
                    {record.polres}
                  </td>
                  <td className="py-3 px-4 max-w-[180px] truncate text-on-surface-variant">
                    {record.lokasi}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {record.jumlahKorban} orang
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        record.statusLapor === "NORMAL"
                          ? "bg-[#16A34A]/10 text-[#16A34A]"
                          : "bg-[#DC2626]/10 text-[#DC2626]"
                      }`}
                    >
                      {record.statusLapor}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        record.statusJaminan === "TERJAMIN"
                          ? "bg-[#059669]/10 text-[#059669]"
                          : record.statusJaminan === "EG2R"
                          ? "bg-[#831843]/10 text-[#831843]"
                          : "bg-[#334155]/10 text-[#334155]"
                      }`}
                    >
                      {record.statusJaminan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectRecord(record)}
                      className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors"
                      title="Detail LP"
                    >
                      <span className="material-symbols-outlined text-lg">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
