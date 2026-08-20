'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FilePlus2, ClipboardList, CalendarDays, HeartPulse,
  Loader2, TrendingUp, AlertCircle, ShieldCheck, ShieldAlert, ShieldQuestion,
  BarChart2, MapPin, ArrowRight, FileText, PieChart as LucidePieChart
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button, PageHeader, SILakaShell, StatCard } from '@/components/si-laka-shell'
import { laporanApi, type LaporanPolisi, type KeterjaminanCardData } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'


const COLORS = ['#4f46e5', '#7c3aed', '#a78bfa', '#ddd6fe']

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Shared chart components ─── */

function MonthlyBarChart({ data }: { data: { name: string; count: number }[] }) {
  return data.length > 0 ? (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`${v} laporan`, 'Jumlah']}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
  )
}

function JenisLakaPieChart({ tunggal, total }: { tunggal: number; total: number }) {
  const data = [
    { name: 'Laka Tunggal', value: tunggal },
    { name: 'Laka Non-Tunggal', value: total - tunggal },
  ]
  return total > 0 ? (
    <>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" strokeWidth={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
              <span className="text-muted-foreground">{d.name}</span>
            </span>
            <span className="font-bold text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </>
  ) : (
    <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
  )
}

function RecentTable({ items }: { items: LaporanPolisi[] }) {
  return items.length === 0 ? (
    <div className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada laporan</div>
  ) : (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-muted/30 text-xs text-muted-foreground">
          <th className="px-5 py-3 text-left font-semibold">No</th>
          <th className="px-5 py-3 text-left font-semibold">No. LP</th>
          <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Tanggal</th>
          <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Lokasi</th>
          <th className="px-5 py-3 text-left font-semibold">Korban</th>
          <th className="px-5 py-3 text-left font-semibold">Jenis</th>
        </tr>
      </thead>
      <tbody>
        {items.map((l, i) => (
          <tr key={l.id} className={`hover:bg-muted/10 transition-colors border-t ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
            <td className="px-5 py-3 text-muted-foreground text-xs">
              {i + 1}
            </td>
            <td className="px-5 py-3">
              <Link href={`/laporan-polisi/${l.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                {l.no_lp}
              </Link>
            </td>
            <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell text-xs">{formatDate(l.tanggal_laka)}</td>
            <td className="px-5 py-3 text-muted-foreground hidden md:table-cell text-xs truncate max-w-[180px]">{l.lokasi_laka}</td>
            <td className="px-5 py-3 text-xs">{l.korban?.length ?? 0} orang</td>
            <td className="px-5 py-3">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold
                ${l.laka_tunggal
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {l.laka_tunggal ? 'Tunggal' : 'Multi'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface StatusLpCardData {
  total: number
  total_terlambat: number
  persentase_terlambat: string
  total_normal: number
  persentase_normal: string
}

interface BreakdownCardData {
  total_terlambat: number
  terlambat_1_3_hari: number
  persentase_1_3_hari: string
  terlambat_4_7_hari: number
  persentase_4_7_hari: string
  terlambat_lebih_7_hari: number
  persentase_lebih_7_hari: string
}

interface JenisLakaCardData {
  total_laka: number
  laka_tunggal: {
    total: number
    persentase: string
  }
  laka_non_tunggal: {
    total: number
    persentase: string
  }
}

interface KorbanCardData {
  total_korban: number
  cidera_LL: { total: number; persentase: string }
  cidera_LL_MD: { total: number; persentase: string }
  cidera_MD: { total: number; persentase: string }
}

function LakaMonitoringCards({
  statusData,
  breakdownData,
  jenisLakaData,
  korbanData,
  keterjaminanData,
}: {
  statusData: StatusLpCardData | null
  breakdownData: BreakdownCardData | null
  jenisLakaData: JenisLakaCardData | null
  korbanData: KorbanCardData | null
  keterjaminanData: KeterjaminanCardData | null
}) {
  const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num)
  const displayPersen = (p?: string) => {
    if (!p) return '0%'
    const val = parseFloat(p)
    return isNaN(val) ? p : `${Math.round(val)}%`
  }

  const chartData = [
    { name: '1-3 Hari', value: breakdownData?.terlambat_1_3_hari ?? 0, color: '#f97316' },
    { name: '4-7 Hari', value: breakdownData?.terlambat_4_7_hari ?? 0, color: '#e11d48' },
    { name: '>7 Hari', value: breakdownData?.terlambat_lebih_7_hari ?? 0, color: '#db2777' },
  ].filter((item) => item.value > 0)

  const hasData = chartData.length > 0
  const finalChartData = hasData ? chartData : [{ name: 'Tidak ada data', value: 1, color: '#e2e8f0' }]

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* CARD 1: TOTAL LP */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total LP</span>
              <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl p-2 shrink-0">
                <FileText size={20} />
              </div>
            </div>

            <div className="py-6">
              <span className="text-5xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                {formatNum(statusData?.total ?? 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            {/* Normal */}
            <div className="bg-muted/30 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">NORMAL</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {statusData?.persentase_normal ?? '0.00%'}
                </span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatNum(statusData?.total_normal ?? 0)}
              </span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: statusData?.persentase_normal ?? '0%' }}
                />
              </div>
            </div>

            {/* Terlambat */}
            <div className="bg-muted/30 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-wider">TERLAMBAT</span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  {statusData?.persentase_terlambat ?? '0.00%'}
                </span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatNum(statusData?.total_terlambat ?? 0)}
              </span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: statusData?.persentase_terlambat ?? '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: DISTRIBUSI KETERLAMBATAN */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 border-l-[6px] border-l-rose-600 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">LP Terlambat Lapor</span>
              <div className="flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl p-2 shrink-0">
                <LucidePieChart size={20} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
              {/* Donut Chart */}
              <div className="relative flex items-center justify-center size-[140px] shrink-0 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={hasData ? 3 : 0}
                      dataKey="value"
                      stroke="none"
                    >
                      {finalChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Terlambat</span>
                  <span className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                    {formatNum(breakdownData?.total_terlambat ?? 0)}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {statusData?.persentase_terlambat ?? '0.00%'}
                  </span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="flex-1 w-full space-y-2">
                {/* 1-3 HARI */}
                <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/20 rounded-xl px-4 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#f97316] shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">1-3 HARI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatNum(breakdownData?.terlambat_1_3_hari ?? 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                      {breakdownData?.persentase_1_3_hari ?? '0.00%'}
                    </span>
                  </div>
                </div>

                {/* 4-7 HARI */}
                <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-xl px-4 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#e11d48] shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">4-7 HARI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatNum(breakdownData?.terlambat_4_7_hari ?? 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      {breakdownData?.persentase_4_7_hari ?? '0.00%'}
                    </span>
                  </div>
                </div>

                {/* >7 HARI */}
                <div className="bg-pink-50/50 dark:bg-pink-950/10 border border-pink-100/50 dark:border-pink-900/20 rounded-xl px-4 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#db2777] shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">&gt;7 HARI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatNum(breakdownData?.terlambat_lebih_7_hari ?? 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400">
                      {breakdownData?.persentase_lebih_7_hari ?? '0.00%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* CARD 3: LAKA TUNGGAL */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-4">LAKA TUNGGAL</span>
            <span className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white block mb-6">
              {formatNum(jenisLakaData?.laka_tunggal?.total ?? 0)}
            </span>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: jenisLakaData?.laka_tunggal?.persentase ?? '0%' }}
              />
            </div>
            <span className="text-xs text-muted-foreground block">
              {displayPersen(jenisLakaData?.laka_tunggal?.persentase)} dari total insiden
            </span>
          </div>
        </div>

        {/* CARD 4: LAKA NON-TUNGGAL */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-4">LAKA NON-TUNGGAL</span>
            <span className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white block mb-6">
              {formatNum(jenisLakaData?.laka_non_tunggal?.total ?? 0)}
            </span>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: jenisLakaData?.laka_non_tunggal?.persentase ?? '0%' }}
              />
            </div>
            <span className="text-xs text-muted-foreground block">
              {displayPersen(jenisLakaData?.laka_non_tunggal?.persentase)} dari total insiden
            </span>
          </div>
        </div>
      </div>

      {/* ROW 3: KORBAN */}
      <div className="grid gap-6 md:grid-cols-1 mt-6">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Korban</span>
            <div className="flex items-center justify-center bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl p-2 shrink-0">
              <HeartPulse size={20} />
            </div>
          </div>

          <div className="py-6">
            <span className="text-5xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {formatNum(korbanData?.total_korban ?? 0)}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">orang</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-auto">
            {/* Cidera LL */}
            <div className="bg-muted/30 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider">LL</span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {korbanData?.cidera_LL?.persentase ?? '0.00%'}
                </span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatNum(korbanData?.cidera_LL?.total ?? 0)}
              </span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: korbanData?.cidera_LL?.persentase ?? '0%' }}
                />
              </div>
            </div>

            {/* Cidera LL + MD */}
            <div className="bg-muted/30 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 tracking-wider">LL - MD</span>
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  {korbanData?.cidera_LL_MD?.persentase ?? '0.00%'}
                </span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatNum(korbanData?.cidera_LL_MD?.total ?? 0)}
              </span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-500"
                  style={{ width: korbanData?.cidera_LL_MD?.persentase ?? '0%' }}
                />
              </div>
            </div>

            {/* Cidera MD */}
            <div className="bg-muted/30 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-wider">MD</span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  {korbanData?.cidera_MD?.persentase ?? '0.00%'}
                </span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatNum(korbanData?.cidera_MD?.total ?? 0)}
              </span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: korbanData?.cidera_MD?.persentase ?? '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <KeterjaminanCards data={keterjaminanData} />
    </>
  )
}

function KeterjaminanCards({ data }: { data: KeterjaminanCardData | null }) {
  const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num)
  const displayPersen = (p?: string) => {
    if (!p) return '0%'
    const val = parseFloat(p)
    return isNaN(val) ? p : `${Math.round(val)}%`
  }

  const findByNama = (nama: string) =>
    data?.rincian_keterjaminan?.find((r) => r.nama.toLowerCase() === nama.toLowerCase())

  const cards = [
    {
      key: 'terjamin',
      label: 'TERJAMIN',
      item: findByNama('Terjamin'),
      icon: ShieldCheck,
      accent: 'emerald',
    },
    {
      key: 'tidak-terjamin',
      label: 'TIDAK TERJAMIN',
      item: findByNama('Tidak Terjamin'),
      icon: ShieldAlert,
      accent: 'rose',
    },
    {
      key: 'eg2r',
      label: 'EG2R',
      item: findByNama('EG2R'),
      icon: ShieldQuestion,
      accent: 'amber',
    },
  ] as const

  const accentClasses: Record<string, { bg: string; text: string; border: string; bar: string }> = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      bar: 'bg-emerald-500',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/30',
      bar: 'bg-rose-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
      bar: 'bg-amber-500',
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 mt-6">
      {cards.map(({ key, label, item, icon: Icon, accent }) => {
        const c = accentClasses[accent]
        return (
          <div
            key={key}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                <div className={`flex items-center justify-center ${c.bg} border ${c.border} ${c.text} rounded-xl p-2 shrink-0`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="py-6">
                <span className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                  {formatNum(item?.total ?? 0)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.bar} transition-all duration-500`}
                  style={{ width: item?.persentase ?? '0%' }}
                />
              </div>
              <span className="text-xs text-muted-foreground block">
                {displayPersen(item?.persentase)} dari total laporan
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Admin Dashboard ─── */
function AdminDashboard({
  laporan,
  total,
  statusData,
  breakdownData,
  jenisLakaData,
  korbanData,
  keterjaminanData
}: {
  laporan: LaporanPolisi[]
  total: number
  statusData: StatusLpCardData | null
  breakdownData: BreakdownCardData | null
  jenisLakaData: JenisLakaCardData | null
  korbanData: KorbanCardData | null
  keterjaminanData: KeterjaminanCardData | null
}) {
  const today = new Date().toISOString().slice(0, 10)
  const bulanIni = laporan.filter((l) => l.tanggal_laka?.slice(0, 7) === today.slice(0, 7)).length
  const lakaTunggal = laporan.filter((l) => l.laka_tunggal).length
  const totalKorban = laporan.reduce((sum, l) => sum + (l.korban?.length ?? 0), 0)

  const monthlyMap: Record<string, number> = {}
  laporan.forEach((l) => {
    const m = l.tanggal_laka?.slice(0, 7)
    if (m) monthlyMap[m] = (monthlyMap[m] ?? 0) + 1
  })
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    .map(([month, count]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      count,
    }))

  const polresMap: Record<string, { nama: string; count: number }> = {}
  laporan.forEach((l) => {
    if (l.polres_id) {
      const key = String(l.polres_id)
      if (!polresMap[key]) polresMap[key] = { nama: l.polres?.nama ?? `Polres #${l.polres_id}`, count: 0 }
      polresMap[key].count++
    }
  })
  const topPolres = Object.values(polresMap).sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <SILakaShell title="Dashboard Admin" eyebrow="Data Laka JR">
      <PageHeader
        title="Dashboard"
        description="Ringkasan seluruh laporan kecelakaan lalu lintas di semua wilayah."
        action={<Button href="/laporan-polisi/tambah"><FilePlus2 size={16} /> Buat Laporan</Button>}
      />

      {/* <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Laporan" value={String(total)} note="Seluruh data laporan" tone="success" icon={ClipboardList} />
        <StatCard label="Bulan Ini" value={String(bulanIni)} note={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} icon={CalendarDays} />
        <StatCard label="Laka Tunggal" value={String(lakaTunggal)} note={`${total > 0 ? Math.round((lakaTunggal / total) * 100) : 0}% dari total`} tone="danger" icon={TrendingUp} />
        <StatCard label="Total Korban" value={String(totalKorban)} note="Dari seluruh laporan" icon={HeartPulse} />
      </div> */}

      <LakaMonitoringCards statusData={statusData} breakdownData={breakdownData} jenisLakaData={jenisLakaData} korbanData={korbanData} keterjaminanData={keterjaminanData} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Tren Laporan per Bulan</p>
          <p className="mb-4 text-xs text-muted-foreground">6 bulan terakhir — lintas wilayah</p>
          <MonthlyBarChart data={monthlyData} />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Jenis Kecelakaan</p>
          <p className="mb-4 text-xs text-muted-foreground">Laka tunggal vs Laka Non-Tunggal</p>
          <JenisLakaPieChart tunggal={lakaTunggal} total={total} />
        </div>
      </div>

      {topPolres.length > 0 && (
        <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" /> Top 10 Polres
              </p>
              <p className="text-xs text-muted-foreground">Polres dengan laporan terbanyak</p>
            </div>
            <Link href="/users" className="text-xs font-semibold text-primary hover:underline">Monitor detail →</Link>
          </div>
          <div className="p-5 space-y-3">
            {topPolres.map((p, i) => (
              <div key={p.nama} className="flex items-center gap-3">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                  ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground truncate">{p.nama}</span>
                    <span className="text-xs font-bold text-primary ml-2 shrink-0">{p.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                      style={{ width: `${Math.round((p.count / (topPolres[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground text-sm">Laporan Terbaru</p>
            <p className="text-xs text-muted-foreground">5 laporan terakhir yang masuk</p>
          </div>
          <Link href="/laporan-polisi" className="text-xs font-semibold text-primary hover:underline">Lihat semua →</Link>
        </div>
        <RecentTable items={laporan.slice(0, 5)} />
      </div>
    </SILakaShell>
  )
}

/* ─── User Dashboard ─── */
function UserDashboard({
  laporan,
  wilayahNama,
  total,
  statusData,
  breakdownData,
  jenisLakaData,
  korbanData,
  keterjaminanData
}: {
  laporan: LaporanPolisi[]
  wilayahNama: string
  total: number
  statusData: StatusLpCardData | null
  breakdownData: BreakdownCardData | null
  jenisLakaData: JenisLakaCardData | null
  korbanData: KorbanCardData | null
  keterjaminanData: KeterjaminanCardData | null
}) {
  const today = new Date().toISOString().slice(0, 10)
  const bulanIni = laporan.filter((l) => l.tanggal_laka?.slice(0, 7) === today.slice(0, 7)).length
  const lakaTunggal = laporan.filter((l) => l.laka_tunggal).length
  const totalKorban = laporan.reduce((sum, l) => sum + (l.korban?.length ?? 0), 0)

  const monthlyMap: Record<string, number> = {}
  laporan.forEach((l) => {
    const m = l.tanggal_laka?.slice(0, 7)
    if (m) monthlyMap[m] = (monthlyMap[m] ?? 0) + 1
  })
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    .map(([month, count]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      count,
    }))

  return (
    <SILakaShell title="Dashboard" eyebrow="Data Laka JR">
      <PageHeader
        title="Dashboard"
        description={wilayahNama ? `Data laporan kecelakaan lalu lintas wilayah ${wilayahNama}.` : 'Selamat datang di sistem monitoring laka lantas.'}
        action={<Button href="/laporan-polisi/tambah"><FilePlus2 size={16} /> Buat Laporan</Button>}
      />

      {/* <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Laporan" value={String(total)} note="Di wilayah Anda" tone="success" icon={ClipboardList} />
        <StatCard label="Bulan Ini" value={String(bulanIni)} note={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} icon={CalendarDays} />
        <StatCard label="Laka Tunggal" value={String(lakaTunggal)} note={`${total > 0 ? Math.round((lakaTunggal / total) * 100) : 0}% dari total`} tone="danger" icon={TrendingUp} />
        <StatCard label="Total Korban" value={String(totalKorban)} note="Dari seluruh laporan" icon={HeartPulse} />
      </div> */}

      <LakaMonitoringCards statusData={statusData} breakdownData={breakdownData} jenisLakaData={jenisLakaData} korbanData={korbanData} keterjaminanData={keterjaminanData} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Tren Laporan per Bulan</p>
          <p className="mb-4 text-xs text-muted-foreground">6 bulan terakhir di wilayah Anda</p>
          <MonthlyBarChart data={monthlyData} />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Jenis Kecelakaan</p>
          <p className="mb-4 text-xs text-muted-foreground">Laka tunggal vs multi pihak</p>
          <JenisLakaPieChart tunggal={lakaTunggal} total={total} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-gradient-to-r from-primary/5 to-primary/0 p-5 flex items-center gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <BarChart2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Pantau perkembangan laporan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gunakan menu <strong>Statistik</strong> untuk analisis lebih mendalam berdasarkan periode waktu.
          </p>
        </div>
        <Link href="/statistik" className="shrink-0 text-xs font-semibold text-primary hover:underline">Buka →</Link>
      </div>

      <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground text-sm">Laporan Terbaru</p>
            <p className="text-xs text-muted-foreground">5 laporan terakhir yang masuk</p>
          </div>
          <Link href="/laporan-polisi" className="text-xs font-semibold text-primary hover:underline">Lihat semua →</Link>
        </div>
        <RecentTable items={laporan.slice(0, 5)} />
      </div>
    </SILakaShell>
  )
}

/* ─── Main ─── */
export default function DashboardPage() {
  const { user, init } = useAuthStore()
  const [laporan, setLaporan] = useState<LaporanPolisi[]>([])
  const [totalLaporan, setTotalLaporan] = useState(0)
  const [statusLpData, setStatusLpData] = useState<StatusLpCardData | null>(null)
  const [breakdownData, setBreakdownData] = useState<BreakdownCardData | null>(null)
  const [jenisLakaData, setJenisLakaData] = useState<JenisLakaCardData | null>(null)
  const [korbanData, setKorbanData] = useState<KorbanCardData | null>(null)
  const [keterjaminanData, setKeterjaminanData] = useState<KeterjaminanCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { init() }, [init])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch required list
        const listRes = await laporanApi.list({ page: 1, limit: 1000 })
        setLaporan(listRes.data.data || [])
        setTotalLaporan(listRes.data.meta?.total ?? 0)

        // Fetch optional stats in parallel
        const [statusRes, breakdownRes, jenisLakaRes, korbanRes, keterjaminanRes] = await Promise.all([
          laporanApi.statusLp().catch(() => null),
          laporanApi.breakdownTerlambat().catch(() => null),
          laporanApi.jenisLaka().catch(() => null),
          laporanApi.statistikKorban().catch(() => null),
          laporanApi.statistikKeterjaminan().catch(() => null)
        ])

        if (statusRes) setStatusLpData(statusRes.data.data)
        if (breakdownRes) setBreakdownData(breakdownRes.data.data)
        if (jenisLakaRes) setJenisLakaData(jenisLakaRes.data.data)
        if (korbanRes) setKorbanData(korbanRes.data.data)
        if (keterjaminanRes) setKeterjaminanData(keterjaminanRes.data.data)
      } catch (err) {
        setError('Gagal memuat data dari server.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <SILakaShell>
        <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat data dashboard...</span>
        </div>
      </SILakaShell>
    )
  }

  if (error) {
    return (
      <SILakaShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle size={32} className="text-destructive" />
          <p className="font-semibold text-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Pastikan server backend berjalan di port 3001.</p>
        </div>
      </SILakaShell>
    )
  }

  const isAdmin = user?.role === 'admin'
  const wilayahNama = user?.wilayah?.nama ?? ''

  return isAdmin
    ? <AdminDashboard laporan={laporan} total={totalLaporan} statusData={statusLpData} breakdownData={breakdownData} jenisLakaData={jenisLakaData} korbanData={korbanData} keterjaminanData={keterjaminanData} />
    : <UserDashboard laporan={laporan} wilayahNama={wilayahNama} total={totalLaporan} statusData={statusLpData} breakdownData={breakdownData} jenisLakaData={jenisLakaData} korbanData={korbanData} keterjaminanData={keterjaminanData} />
}
