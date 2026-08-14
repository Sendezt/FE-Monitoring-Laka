"use client";

import React from "react";
import { LpRecord } from "./types";

interface LpDetailModalProps {
  record: LpRecord | null;
  onClose: () => void;
}

export default function LpDetailModal({ record, onClose }: LpDetailModalProps) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-floating border border-outline-variant animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              description
            </span>
            Detail Laporan Polisi
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-on-surface-variant font-medium block">Nomor LP:</span>
            <span className="font-mono font-bold text-primary break-all">
              {record.noLp}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-on-surface-variant font-medium block">Tanggal:</span>
              <span className="font-semibold text-on-surface">{record.tanggal}</span>
            </div>
            <div>
              <span className="text-on-surface-variant font-medium block">Polres:</span>
              <span className="font-semibold text-on-surface">{record.polres}</span>
            </div>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium block">Lokasi:</span>
            <span className="font-semibold text-on-surface">{record.lokasi}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-surface-container p-3 rounded-xl">
            <div>
              <span className="text-[10px] text-on-surface-variant block">Luka-luka:</span>
              <span className="font-bold text-sm text-[#EF4444]">{record.lukaLuka}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">LL - MD:</span>
              <span className="font-bold text-sm text-[#0D9488]">{record.llMd}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">MD:</span>
              <span className="font-bold text-sm text-[#475569]">{record.md}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
