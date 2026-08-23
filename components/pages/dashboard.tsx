'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FilePlus2, ClipboardList, CalendarDays, HeartPulse,
  Loader2, TrendingUp, AlertCircle, ShieldCheck, ShieldAlert, ShieldQuestion,
  BarChart2, MapPin, ArrowRight, FileText, PieChart as LucidePieChart,
  Users, Car, Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList, LineChart, Line, Legend } from 'recharts'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Button, PageHeader, SILakaShell, StatCard } from '@/components/si-laka-shell'
import { laporanApi, chartApi, type MasterItem, type LaporanPolisi, type KeterjaminanCardData, type WilayahLakaItem, type WilayahKorbanItem } from '@/lib/api'
import { useMasterList } from '@/lib/hooks/use-master-data'
import { useAuthStore } from '@/lib/auth-store'
import { useFilterStore } from '@/lib/filter-store'
import { useRoleBase } from '@/lib/role-base'
import type {
  KasusTabrakData,
  ProfesiKorbanData,
  JenisKendaraanKorbanData,
  TopKecamatanLakaItem,
  TopRumahSakitKorbanItem,
  TrendHarianData,
  PerbandinganData,
  PerbandinganCideraData,
  TopPolresLpTerlamaItem,
  TopPolresLakaItem,
  TrenBulananItem,
  HariKejadianItem,
} from '@/lib/api'

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

function LoketAxisTick(props: any) {
  const { x, y, payload } = props
  const label: string = payload?.value ?? ''
  const truncated = label.length > 16 ? `${label.slice(0, 16)}…` : label
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={8}
        textAnchor="end"
        transform="rotate(-35)"
        fontSize={10}
        className="fill-muted-foreground"
      >
        {truncated}
      </text>
    </g>
  )
}

function PerLoketBarChart({
  data,
  color,
  labelColor,
  unitLabel,
}: {
  data: { name: string; value: number }[] | null
  color: string
  labelColor: string
  unitLabel: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 56 }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          interval={0}
          height={64}
          tickLine={false}
          axisLine={false}
          tick={<LoketAxisTick />}
        />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => [`${v} ${unitLabel}`, 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill={color} radius={[5, 5, 0, 0]}>
          <LabelList dataKey="value" position="insideTop" fontSize={10} fontWeight="bold" fill={labelColor} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function JenisLakaPieChart({ tunggal, total }: { tunggal: number; total: number }) {
  const nonTunggal = Math.max(0, total - tunggal)
  const data = [
    { name: 'Laka Tunggal', value: tunggal },
    { name: 'Laka Non-Tunggal', value: nonTunggal },
  ]
  const grand = tunggal + nonTunggal
  return grand > 0 ? (
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
  const base = useRoleBase()
  // Urutkan berdasarkan waktu input (created_at) terbaru → "laporan yang baru masuk"
  const recent = [...items].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0
    return tb - ta
  }).slice(0, 5)
  return recent.length === 0 ? (
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
        {recent.map((l, i) => (
          <tr key={l.id} className={`hover:bg-muted/10 transition-colors border-t ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
            <td className="px-5 py-3 text-muted-foreground text-xs">
              {i + 1}
            </td>
            <td className="px-5 py-3">
              <Link href={`${base}/laporan-polisi/${l.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                {l.no_lp}{l.polres?.nama ? ` / ${l.polres.nama}` : ''}
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

// Panah selisih: naik (▲ merah, karena kecelakaan bertambah = buruk),
// turun (▼ hijau), sama (– abu).
function SelisihCell({ value }: { value: number }) {
  if (value > 0) return <span className="font-semibold text-rose-600">{value} ▲</span>
  if (value < 0) return <span className="font-semibold text-emerald-600">{Math.abs(value)} ▼</span>
  return <span className="text-muted-foreground">0 –</span>
}

function fmtRangeID(s?: string) {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateSlashed(s?: string) {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function PerbandinganPeriodeTable({ data, cidera }: { data?: PerbandinganData | null; cidera?: PerbandinganCideraData | null }) {
  if (!data && !cidera) return null

  return (
    <div className="mt-6 mb-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tabel 1 — Laka & Korban */}
        {data && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm text-slate-800 dark:text-white uppercase tracking-wide">
                  Perbandingan Laka &amp; Korban
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {/* {fmtRangeID(data.periode_utama.tanggal_awal)} – {fmtRangeID(data.periode_utama.tanggal_akhir)} <span className="font-semibold text-slate-500">vs</span> {fmtRangeID(data.periode_pembanding.tanggal_awal)} – {fmtRangeID(data.periode_pembanding.tanggal_akhir)} */}
                </p>
              </div>
              <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl p-2 shrink-0">
                <BarChart2 size={18} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Periode</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Laka (LP)</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Korban</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-white dark:bg-slate-950">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {fmtDateSlashed(data.periode_utama.tanggal_awal)} <span className="font-semibold text-slate-500 mx-1">S.D</span> {fmtDateSlashed(data.periode_utama.tanggal_akhir)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{data.periode_utama.total_lp}</td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{data.periode_utama.total_korban}</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {fmtDateSlashed(data.periode_pembanding.tanggal_awal)} <span className="font-semibold text-slate-500 mx-1">S.D</span> {fmtDateSlashed(data.periode_pembanding.tanggal_akhir)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{data.periode_pembanding.total_lp}</td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{data.periode_pembanding.total_korban}</td>
                  </tr>
                  <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                    <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">SELISIH</td>
                    <td className="px-4 py-3 text-center"><SelisihCell value={data.selisih.selisih_lp} /></td>
                    <td className="px-4 py-3 text-center"><SelisihCell value={data.selisih.selisih_korban} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel 2 — Kategori Cidera */}
        {cidera && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm text-slate-800 dark:text-white uppercase tracking-wide">
                  Perbandingan Cidera
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {/* {fmtRangeID(cidera.periode_utama.tanggal_awal)} – {fmtRangeID(cidera.periode_utama.tanggal_akhir)} <span className="font-semibold text-slate-500">vs</span> {fmtRangeID(cidera.periode_pembanding.tanggal_awal)} – {fmtRangeID(cidera.periode_pembanding.tanggal_akhir)} */}
                </p>
              </div>
              <div className="flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl p-2 shrink-0">
                <HeartPulse size={18} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Periode</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">LL</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">LL-MD</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">MD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-white dark:bg-slate-950">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      BULAN INI
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{cidera.periode_utama.ll}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{cidera.periode_utama.ll_md}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{cidera.periode_utama.md}</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      BULAN LALU
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{cidera.periode_pembanding.ll}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{cidera.periode_pembanding.ll_md}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{cidera.periode_pembanding.md}</td>
                  </tr>
                  <tr className="bg-rose-50/30 dark:bg-rose-900/10">
                    <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">SELISIH</td>
                    <td className="px-3 py-3 text-center"><SelisihCell value={cidera.selisih.ll} /></td>
                    <td className="px-3 py-3 text-center"><SelisihCell value={cidera.selisih.ll_md} /></td>
                    <td className="px-3 py-3 text-center"><SelisihCell value={cidera.selisih.md} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
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

const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name, color } = props
  if (value === 0 || name === 'Tidak ada data') return null

  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)

  const sx = cx + outerRadius * cos
  const sy = cy + outerRadius * sin
  const mx = cx + (outerRadius + 12) * cos
  const my = cy + (outerRadius + 12) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 28
  const ey = my

  const textAnchor = cos >= 0 ? 'start' : 'end'
  const percentageStr = `${(percent * 100).toFixed(1)}%`.replace('.', ',')
  const displayName = name.length > 10 ? name.slice(0, 10) + '...' : name

  const rInside = innerRadius + (outerRadius - innerRadius) * 0.5
  const ix = cx + rInside * cos
  const iy = cy + rInside * sin

  const itemColor = color || props.payload?.color || ''
  const isLight = ['#00ff00', '#00e676', '#ef9a9a', '#ffc107', '#e2e8f0'].includes(itemColor.toLowerCase())
  const textInsideColor = isLight ? '#0f172a' : '#ffffff'

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#94a3b8" fill="none" strokeWidth={1} />
      <circle cx={sx} cy={sy} r={2} fill="#94a3b8" />
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey - 4}
        textAnchor={textAnchor}
        fontSize={10}
        fontWeight="bold"
        className="fill-slate-700 dark:fill-slate-300 tracking-wider"
      >
        {displayName.toUpperCase()}
      </text>
      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey + 11}
        textAnchor={textAnchor}
        fontSize={9}
        fontWeight="600"
        className="fill-slate-400 dark:fill-slate-500"
      >
        {percentageStr}
      </text>
      {value > 0 && (
        <text
          x={ix}
          y={iy}
          fill={textInsideColor}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight="bold"
          className="select-none pointer-events-none"
        >
          {value}
        </text>
      )}
    </g>
  )
}

/* ─── Row 6 & 7 chart components ──────────────────────────────────────────── */

function VerticalDetailBarChart({
  data,
  color = '#6366f1',
  labelColor = '#ffffff',
  unitLabel = 'laporan',
}: {
  data: { name: string; value: number; percentage?: string }[] | null
  color?: string
  labelColor?: string
  unitLabel?: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 56 }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          interval={0}
          height={64}
          tickLine={false}
          axisLine={false}
          tick={<LoketAxisTick />}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            const pct = props.payload?.percentage
            return [`${value} ${unitLabel}${pct ? ` (${pct})` : ''}`, 'Total']
          }}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill={color} radius={[5, 5, 0, 0]}>
          <LabelList dataKey="value" position="insideTop" fontSize={10} fontWeight="bold" fill={labelColor} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function HorizontalDetailBarChart({
  data,
  color = '#8b5cf6',
  unitLabel = 'orang',
}: {
  data: { name: string; value: number; percentage?: string }[] | null
  color?: string
  unitLabel?: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  // Urutkan dari nilai tertinggi ke terendah
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
        barSize={16}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            const pct = props.payload?.percentage
            return [`${value} ${unitLabel}${pct ? ` (${pct})` : ''}`, 'Total']
          }}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill={color} radius={[0, 5, 5, 0]}>
          <LabelList dataKey="value" position="right" fontSize={10} fontWeight="bold" fill="var(--foreground)" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function TopKecamatanBarChart({
  data,
}: {
  data: { name: string; value: number }[] | null
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 80 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          interval={0}
          height={80}
          tickLine={false}
          axisLine={false}
          tick={<LoketAxisTick />}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value} laka`, 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill="#f59e0b" radius={[5, 5, 0, 0]}>
          <LabelList dataKey="value" position="insideTop" fontSize={10} fontWeight="bold" fill="#ffffff" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function TopRumahSakitBarChart({
  data,
}: {
  data: { name: string; value: number }[] | null
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 120, bottom: 8 }}
        barSize={14}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          formatter={(value: number) => [`${value} korban`, 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 5, 5, 0]}>
          <LabelList dataKey="value" position="right" fontSize={10} fontWeight="bold" fill="var(--foreground)" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Top 10 Polres dengan Laka Tertinggi (horizontal bar, ungu) ───────────── */

function TopPolresBarChart({
  data,
}: {
  data: { name: string; value: number }[] | null
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[340px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 48, left: 100, bottom: 8 }}
        barSize={18}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={100}
          tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
        />
        <Tooltip
          formatter={(value: number) => [`${value} laka`, 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill="#9333ea" radius={[0, 8, 8, 0]}>
          <LabelList
            dataKey="value"
            position="right"
            fontSize={11}
            fontWeight="bold"
            fill="#9333ea"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Row 8: Trend Line Chart ──────────────────────────────────────────────── */

function TrendLineChart({
  data,
  loading,
  error,
  periodeUtama,
  periodePembanding,
}: {
  data: any[] | null
  loading: boolean
  error: string | null
  periodeUtama: { tanggal_awal: string; tanggal_akhir: string } | null
  periodePembanding: { tanggal_awal: string; tanggal_akhir: string } | null
}) {
  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Memuat data trend...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Belum ada data trend</span>
      </div>
    )
  }

  const BULAN_FULL = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER']
  const now = new Date()
  const bulanIni = BULAN_FULL[now.getMonth()]
  const bulanLalu = BULAN_FULL[now.getMonth() === 0 ? 11 : now.getMonth() - 1]

  const labelUtama = `LP ${bulanIni}`
  const labelKorbanUtama = `KRB ${bulanIni}`
  const labelPembanding = `LP ${bulanLalu}`
  const labelKorbanPembanding = `KRB ${bulanLalu}`

  const colors = {
    lpUtama: '#3b82f6',      // biru
    korbanUtama: '#ef4444',  // merah
    lpPembanding: '#f59e0b', // kuning/oranye
    korbanPembanding: '#10b981', // hijau
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
            formatter={(value: number, name: string) => [`${value}`, name]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            content={() => (
              <div className="flex items-center justify-center gap-4 pt-1">
                {[
                  { label: labelUtama, color: colors.lpUtama },
                  { label: labelKorbanUtama, color: colors.korbanUtama },
                  { label: labelPembanding, color: colors.lpPembanding },
                  { label: labelKorbanPembanding, color: colors.korbanPembanding },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          />
          <Line
            type="monotone"
            dataKey="lp_periode_utama"
            name={labelUtama}
            stroke={colors.lpUtama}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="korban_periode_utama"
            name={labelKorbanUtama}
            stroke={colors.korbanUtama}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="lp_periode_pembanding"
            name={labelPembanding}
            stroke={colors.lpPembanding}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="korban_periode_pembanding"
            name={labelKorbanPembanding}
            stroke={colors.korbanPembanding}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── LakaMonitoringCards ──────────────────────────────────────────────────── */

function LakaMonitoringCards({
  statusData,
  breakdownData,
  jenisLakaData,
  korbanData,
  keterjaminanData,
  lakaPerLoketData,
  korbanPerLoketData,
  kasusTabrakData,
  profesiData,
  jenisKendaraanData,
  topKecamatanData,
  topRumahSakitData,
  topPolresData,
  topPolresLamaData,
  perbandinganData,
  perbandinganCideraData,
  hariKejadianData,
}: {
  statusData: StatusLpCardData | null
  breakdownData: BreakdownCardData | null
  jenisLakaData: JenisLakaCardData | null
  korbanData: KorbanCardData | null
  keterjaminanData: KeterjaminanCardData | null
  lakaPerLoketData: WilayahLakaItem[] | null
  korbanPerLoketData: WilayahKorbanItem[] | null
  kasusTabrakData?: KasusTabrakData | null
  profesiData?: ProfesiKorbanData | null
  jenisKendaraanData?: JenisKendaraanKorbanData | null
  topKecamatanData?: TopKecamatanLakaItem[] | null
  topRumahSakitData?: TopRumahSakitKorbanItem[] | null
  topPolresData?: { nama: string; count: number }[] | null
  topPolresLamaData?: { nama: string; avgTelat: number }[] | null
  perbandinganData?: PerbandinganData | null
  perbandinganCideraData?: PerbandinganCideraData | null
  hariKejadianData?: HariKejadianItem[] | null
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

  const keterjaminanChartData = (keterjaminanData?.rincian_keterjaminan || []).map((item) => {
    let color = '#94a3b8'
    const namaLower = item.nama.toLowerCase()
    if (namaLower === 'terjamin') {
      color = '#10b981'
    } else if (namaLower === 'eg2r') {
      color = '#ef4444'
    } else if (namaLower === 'tidak terjamin') {
      color = '#fca5a5'
    }
    return {
      name: item.nama,
      value: item.total,
      color,
    }
  })
  const filteredKeterjaminanData = keterjaminanChartData.filter(d => d.value > 0)
  const hasKeterjaminanData = filteredKeterjaminanData.length > 0

  const korbanChartData = [
    {
      name: 'LL',
      value: korbanData?.cidera_LL?.total ?? 0,
      color: '#3b82f6',
    },
    {
      name: 'LL - MD',
      value: korbanData?.cidera_LL_MD?.total ?? 0,
      color: '#fbbf24',
    },
    {
      name: 'MD',
      value: korbanData?.cidera_MD?.total ?? 0,
      color: '#f43f5e',
    },
  ]
  const filteredKorbanData = korbanChartData.filter(d => d.value > 0)
  const hasKorbanData = filteredKorbanData.length > 0

  const lakaPerLoketChartData = lakaPerLoketData
    ? lakaPerLoketData.map((d) => ({ name: d.nama, value: d.total_laka }))
    : null

  const korbanPerLoketChartData = korbanPerLoketData
    ? korbanPerLoketData.map((d) => ({ name: d.nama, value: d.total_korban }))
    : null

  const kasusChartData = kasusTabrakData?.rincian_kasus?.map(item => ({
    name: item.nama,
    value: item.total,
    percentage: item.persentase,
  })) ?? null

  const profesiChartData = profesiData?.rincian_profesi?.map(item => ({
    name: item.nama,
    value: item.total,
    percentage: item.persentase,
  })) ?? null

  const kendaraanChartData = jenisKendaraanData?.rincian_jenis_kendaraan?.map(item => ({
    name: item.nama,
    value: item.total,
    percentage: item.persentase,
  })) ?? null

  const topKecamatanChartData = topKecamatanData
    ? topKecamatanData.map((item) => ({
      name: item.nama_kecamatan,
      value: item.total_laka,
    }))
    : null

  const topRumahSakitChartData = topRumahSakitData
    ? topRumahSakitData.map((item) => ({
      name: item.nama_rumah_sakit,
      value: item.total_korban,
    }))
    : null

  const topPolresChartData = topPolresData
    ? topPolresData.map((item) => ({
      name: item.nama,
      value: item.count,
    }))
    : null

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
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">LP Terlambat Lapor</span>
              <div className="flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl p-2 shrink-0">
                <LucidePieChart size={20} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
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

              <div className="flex-1 w-full space-y-2">
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

      <PerbandinganPeriodeTable data={perbandinganData} cidera={perbandinganCideraData} />

      {/* TOP 10 POLRES DENGAN LAKA TERTINGGI & LP TERLAMA */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {topPolresChartData && topPolresChartData.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-800 dark:text-white uppercase tracking-wide">
                10 Polres dengan Laka Tertinggi
              </span>
              <div className="flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl p-2 shrink-0">
                <ShieldCheck size={18} />
              </div>
            </div>
            <TopPolresBarChart data={topPolresChartData} />
          </div>
        )}

        {topPolresLamaData && topPolresLamaData.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-800 dark:text-white uppercase tracking-wide">
                10 Polres dengan Penerbitan LP Terlama
              </span>
              <div className="flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl p-2 shrink-0">
                <Clock size={18} />
              </div>
            </div>
            <TopLpTerlamaBarChart data={topPolresLamaData} />
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                TERJAMIN & TIDAK TERJAMIN
              </span>
              <div className="flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl p-2 shrink-0">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="h-[240px] w-full flex items-center justify-center">
              {hasKeterjaminanData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredKeterjaminanData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={renderPieLabel}
                      labelLine={false}
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {filteredKeterjaminanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={16} />
                  Belum ada data keterjaminan
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                SIFAT CIDERA
              </span>
              <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl p-2 shrink-0">
                <HeartPulse size={20} />
              </div>
            </div>

            <div className="relative h-[240px] w-full flex items-center justify-center">
              {hasKorbanData ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredKorbanData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                        stroke="var(--card)"
                        strokeWidth={2}
                      >
                        {filteredKorbanData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-850 rounded-full p-2 border border-slate-200/50 dark:border-slate-700/50">
                      <svg className="w-8 h-8 text-slate-700 dark:text-slate-350" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.9" />
                        <path d="M30 25 L70 41" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M34 19 L66 35" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M15 85 C15 65 30 58 50 58 C70 58 85 65 85 85" fill="currentColor" opacity="0.9" />
                        <path d="M33 71 H41 M37 67 V75" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M59 71 H67 M63 67 V75" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={16} />
                  Belum ada data korban
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HARI KEJADIAN LAKA */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                HARI KEJADIAN LAKA
              </span>
              <div className="flex items-center justify-center bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl p-2 shrink-0">
                <CalendarDays size={20} />
              </div>
            </div>

            <div className="h-[240px] w-full">
              {hariKejadianData && hariKejadianData.some((d) => d.total_laka > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hariKejadianData.map((d) => ({
                      name: d.hari.charAt(0) + d.hari.slice(1).toLowerCase(),
                      total: d.total_laka,
                    }))}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={64} />
                    <Tooltip
                      formatter={(v) => [`${v} laka`, 'Jumlah']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                    />
                    <Bar dataKey="total" fill="#8b5cf6" radius={[0, 5, 5, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground gap-2">
                  <AlertCircle size={16} />
                  Belum ada data hari kejadian
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: STATISTIK PER LOKET */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Laka per Loket
            </span>
            <div className="flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl p-2 shrink-0">
              <BarChart2 size={20} />
            </div>
          </div>
          <PerLoketBarChart
            data={lakaPerLoketChartData}
            color="#eab308"
            labelColor="#1e293b"
            unitLabel="laka"
          />
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Korban per Loket
            </span>
            <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl p-2 shrink-0">
              <HeartPulse size={20} />
            </div>
          </div>
          <PerLoketBarChart
            data={korbanPerLoketChartData}
            color="#3b82f6"
            labelColor="#ffffff"
            unitLabel="orang"
          />
        </div>
      </div>

      {/* ROW 6: STATISTIK DETAIL KECELAKAAN */}
      <div className="mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jenis Laka</span>
              <div className="flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl p-2 shrink-0">
                <BarChart2 size={18} />
              </div>
            </div>
            <VerticalDetailBarChart
              data={kasusChartData}
              color="#6366f1"
              labelColor="#ffffff"
              unitLabel="laporan"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profesi</span>
              <div className="flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl p-2 shrink-0">
                <Users size={18} />
              </div>
            </div>
            <HorizontalDetailBarChart
              data={profesiChartData}
              color="#8b5cf6"
              unitLabel="orang"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jenis Kendaraan</span>
              <div className="flex items-center justify-center bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl p-2 shrink-0">
                <Car size={18} />
              </div>
            </div>
            <VerticalDetailBarChart
              data={kendaraanChartData}
              color="#06b6d4"
              labelColor="#ffffff"
              unitLabel="orang"
            />
          </div>
        </div>
      </div>

      {/* ROW 7: TOP WILAYAH DAN RUMAH SAKIT */}
      <div className="mt-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                20 Kecamatan dengan Laka Tertinggi
              </span>
              <div className="flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl p-2 shrink-0">
                <MapPin size={18} />
              </div>
            </div>
            <TopKecamatanBarChart data={topKecamatanChartData} />
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                RS Korban Dirawat
              </span>
              <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl p-2 shrink-0">
                <HeartPulse size={18} />
              </div>
            </div>
            <TopRumahSakitBarChart data={topRumahSakitChartData} />
          </div>
        </div>
      </div>
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
                {displayPersen(item?.persentase)} dari total korban
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Top 10 Polres dengan Penerbitan LP Terlama ───────────── */

function TopLpTerlamaBarChart({ data }: { data: { nama: string; avgTelat: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[340px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <AlertCircle size={16} />
        <span>Data tidak tersedia</span>
      </div>
    )
  }

  const chartData = [...data]
    .sort((a, b) => b.avgTelat - a.avgTelat)
    .slice(0, 10)
    .map(d => ({ name: d.nama, value: parseFloat(d.avgTelat.toFixed(2)) }))

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 56, left: 100, bottom: 8 }}
        barSize={18}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={true}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={100}
          tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
        />
        <Tooltip
          formatter={(value: number) => [`${value} hari`, 'Rata-rata Telat']}
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill="#e11d48" radius={[0, 8, 8, 0]}>
          <LabelList
            dataKey="value"
            position="right"
            fontSize={11}
            fontWeight="bold"
            fill="#e11d48"
            formatter={(v: number) => `${v} hari`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Admin Dashboard ──────────────────────────────────────────────────────── */

function AdminDashboard({
  filterProps,
  laporan,
  total,
  statusData,
  breakdownData,
  jenisLakaData,
  korbanData,
  keterjaminanData,
  lakaPerLoketData,
  korbanPerLoketData,
  kasusTabrakData,
  profesiData,
  jenisKendaraanData,
  topKecamatanData,
  topRumahSakitData,
  trendData,
  trendLoading,
  trendError,
  perbandinganData,
  perbandinganCideraData,
  topPolresLpTerlamaData,
  topPolresLakaData,
  trenBulananData,
  hariKejadianData,
}: {
  laporan: LaporanPolisi[]
  total: number
  statusData: StatusLpCardData | null
  breakdownData: BreakdownCardData | null
  jenisLakaData: JenisLakaCardData | null
  korbanData: KorbanCardData | null
  keterjaminanData: KeterjaminanCardData | null
  lakaPerLoketData: WilayahLakaItem[] | null
  korbanPerLoketData: WilayahKorbanItem[] | null
  kasusTabrakData?: KasusTabrakData | null
  profesiData?: ProfesiKorbanData | null
  jenisKendaraanData?: JenisKendaraanKorbanData | null
  topKecamatanData?: TopKecamatanLakaItem[] | null
  topRumahSakitData?: TopRumahSakitKorbanItem[] | null
  trendData: any
  trendLoading: boolean
  trendError: string | null
  perbandinganData?: PerbandinganData | null
  perbandinganCideraData?: PerbandinganCideraData | null
  topPolresLpTerlamaData?: TopPolresLpTerlamaItem[] | null
  topPolresLakaData?: TopPolresLakaItem[] | null
  trenBulananData?: TrenBulananItem[] | null
  hariKejadianData?: HariKejadianItem[] | null
}) {
  const base = useRoleBase()

  // Tren per bulan dari endpoint agregasi DB (akurat). Ambil 6 bulan terakhir.
  const monthlyData = (trenBulananData ?? [])
    .slice(-6)
    .map((d) => ({
      name: new Date(d.bulan + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      count: d.total_lp,
    }))

  // Top 10 Polres dengan laka tertinggi — dari endpoint khusus (akurat, agregasi DB).
  const topPolres = (topPolresLakaData ?? []).map((d) => ({ nama: d.nama_polres, count: d.total_laka }))

  return (
    <SILakaShell title="Dashboard Admin" eyebrow="DEMO SI-LAKA">
      <PageHeader
        title="Dashboard"
        description="Ringkasan seluruh laporan kecelakaan lalu lintas di semua wilayah."
        // action={<Button href={`${base}/laporan-polisi/tambah`}><FilePlus2 size={16} /> Buat Laporan</Button>}
      />

      {filterProps && <DashboardFilterBar {...filterProps} />}

      <LakaMonitoringCards
        statusData={statusData}
        breakdownData={breakdownData}
        jenisLakaData={jenisLakaData}
        korbanData={korbanData}
        keterjaminanData={keterjaminanData}
        lakaPerLoketData={lakaPerLoketData}
        korbanPerLoketData={korbanPerLoketData}
        kasusTabrakData={kasusTabrakData}
        profesiData={profesiData}
        jenisKendaraanData={jenisKendaraanData}
        topKecamatanData={topKecamatanData}
        topRumahSakitData={topRumahSakitData}
        topPolresData={topPolres}
        topPolresLamaData={topPolresLpTerlamaData?.map(d => ({ nama: d.nama_polres, avgTelat: parseFloat(d.rata_rata_telat) })) ?? null}
        perbandinganData={perbandinganData}
        perbandinganCideraData={perbandinganCideraData}
        hariKejadianData={hariKejadianData}
      />

      <div className="mt-8">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-800 dark:text-white uppercase tracking-wide">
              Trend LP & Korban
            </span>
            <div className="flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl p-2 shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
          <TrendLineChart
            data={trendData?.trend || null}
            loading={trendLoading}
            error={trendError}
            periodeUtama={trendData?.periode_utama || null}
            periodePembanding={trendData?.periode_pembanding || null}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Tren Laporan per Bulan</p>
          <p className="mb-4 text-xs text-muted-foreground">6 bulan terakhir — lintas wilayah</p>
          <MonthlyBarChart data={monthlyData} />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Jenis Kecelakaan</p>
          <p className="mb-4 text-xs text-muted-foreground">Laka tunggal vs Laka Non-Tunggal</p>
          <JenisLakaPieChart
            tunggal={jenisLakaData?.laka_tunggal.total ?? 0}
            total={jenisLakaData?.total_laka ?? total}
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground text-sm">Laporan Terbaru</p>
            <p className="text-xs text-muted-foreground">5 laporan terakhir yang masuk</p>
          </div>
          <Link href={`${base}/laporan-polisi`} className="text-xs font-semibold text-primary hover:underline">Lihat semua →</Link>
        </div>
        <RecentTable items={laporan} />
      </div>
    </SILakaShell>
  )
}

function UserDashboard({
  filterProps,
  laporan,
  wilayahNama,
  total,
  statusData,
  breakdownData,
  jenisLakaData,
  korbanData,
  keterjaminanData,
  lakaPerLoketData,
  korbanPerLoketData,
  kasusTabrakData,
  profesiData,
  jenisKendaraanData,
  topKecamatanData,
  topRumahSakitData,
  trendData,
  trendLoading,
  trendError,
  perbandinganData,
  perbandinganCideraData,
  topPolresLpTerlamaData,
  trenBulananData,
  hariKejadianData,
}: {
  laporan: LaporanPolisi[]
  wilayahNama: string
  total: number
  statusData: StatusLpCardData | null
  breakdownData: BreakdownCardData | null
  jenisLakaData: JenisLakaCardData | null
  korbanData: KorbanCardData | null
  keterjaminanData: KeterjaminanCardData | null
  lakaPerLoketData: WilayahLakaItem[] | null
  korbanPerLoketData: WilayahKorbanItem[] | null
  kasusTabrakData?: KasusTabrakData | null
  profesiData?: ProfesiKorbanData | null
  jenisKendaraanData?: JenisKendaraanKorbanData | null
  topKecamatanData?: TopKecamatanLakaItem[] | null
  topRumahSakitData?: TopRumahSakitKorbanItem[] | null
  trendData: any
  trendLoading: boolean
  trendError: string | null
  perbandinganData?: PerbandinganData | null
  perbandinganCideraData?: PerbandinganCideraData | null
  topPolresLpTerlamaData?: TopPolresLpTerlamaItem[] | null
  topPolresLakaData?: TopPolresLakaItem[] | null
  trenBulananData?: TrenBulananItem[] | null
  hariKejadianData?: HariKejadianItem[] | null
}) {
  const base = useRoleBase()

  // Tren per bulan dari endpoint agregasi DB (akurat). Ambil 6 bulan terakhir.
  const monthlyData = (trenBulananData ?? [])
    .slice(-6)
    .map((d) => ({
      name: new Date(d.bulan + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      count: d.total_lp,
    }))

  return (
    <SILakaShell title="Dashboard" eyebrow="DEMO SI-LAKA">
      <PageHeader
        title="Dashboard"
        description={wilayahNama ? `Data laporan kecelakaan lalu lintas wilayah ${wilayahNama}.` : 'Selamat datang di sistem monitoring laka lantas.'}
        // action={<Button href={`${base}/laporan-polisi/tambah`}><FilePlus2 size={16} /> Buat Laporan</Button>}
      />

      {filterProps && <DashboardFilterBar {...filterProps} />}

      <LakaMonitoringCards
        statusData={statusData}
        breakdownData={breakdownData}
        jenisLakaData={jenisLakaData}
        korbanData={korbanData}
        keterjaminanData={keterjaminanData}
        lakaPerLoketData={lakaPerLoketData}
        korbanPerLoketData={korbanPerLoketData}
        kasusTabrakData={kasusTabrakData}
        profesiData={profesiData}
        jenisKendaraanData={jenisKendaraanData}
        topKecamatanData={topKecamatanData}
        topRumahSakitData={topRumahSakitData}
        topPolresLamaData={topPolresLpTerlamaData?.map(d => ({ nama: d.nama_polres, avgTelat: parseFloat(d.rata_rata_telat) })) ?? null}
        perbandinganData={perbandinganData}
        perbandinganCideraData={perbandinganCideraData}
        hariKejadianData={hariKejadianData}
      />

      <div className="mt-8">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              TREND LP & KORBAN
            </span>
            <div className="flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl p-2 shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
          <TrendLineChart
            data={trendData?.trend || null}
            loading={trendLoading}
            error={trendError}
            periodeUtama={trendData?.periode_utama || null}
            periodePembanding={trendData?.periode_pembanding || null}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Tren Laporan per Bulan</p>
          <p className="mb-4 text-xs text-muted-foreground">6 bulan terakhir di wilayah Anda</p>
          <MonthlyBarChart data={monthlyData} />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Jenis Kecelakaan</p>
          <p className="mb-4 text-xs text-muted-foreground">Laka tunggal vs multi pihak</p>
          <JenisLakaPieChart
            tunggal={jenisLakaData?.laka_tunggal.total ?? 0}
            total={jenisLakaData?.total_laka ?? total}
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground text-sm">Laporan Terbaru</p>
            <p className="text-xs text-muted-foreground">5 laporan terakhir yang masuk</p>
          </div>
          <Link href={`${base}/laporan-polisi`} className="text-xs font-semibold text-primary hover:underline">Lihat semua →</Link>
        </div>
        <RecentTable items={laporan} />
      </div>
    </SILakaShell>
  )
}


function DashboardFilterBar({
  filterTanggalAwal, setFilterTanggalAwal,
  filterTanggalAkhir, setFilterTanggalAkhir,
  filterPolres, setFilterPolres,
  polresList,
  isAdmin
}: any) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-card border border-border/60 rounded-xl p-3 shadow-xs">
      <div className="flex items-center gap-3 border border-border/80 rounded-lg px-3 py-1.5 bg-background w-full sm:w-auto">
        <CalendarDays size={18} className="text-primary/70 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tanggal Awal</span>
          <input type="date" value={filterTanggalAwal} onChange={(e) => setFilterTanggalAwal(e.target.value)} className="bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 p-0 text-foreground" />
        </div>
      </div>
      <div className="flex items-center gap-3 border border-border/80 rounded-lg px-3 py-1.5 bg-background w-full sm:w-auto">
        <CalendarDays size={18} className="text-primary/70 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tanggal Akhir</span>
          <input type="date" value={filterTanggalAkhir} onChange={(e) => setFilterTanggalAkhir(e.target.value)} className="bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 p-0 text-foreground" />
        </div>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-3 border border-border/80 rounded-lg px-3 py-1.5 bg-background w-full sm:min-w-[220px]">
          <ShieldCheck size={18} className="text-primary/70 shrink-0" />
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Polres</span>
            <select value={filterPolres} onChange={(e) => setFilterPolres(e.target.value)} className="bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 p-0 w-full appearance-none text-foreground cursor-pointer">
              <option value="ALL">ALL</option>
              {polresList.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */

export function DashboardPage() {
  const { user, init } = useAuthStore()
  const { from, to, polres, setFrom, setTo, setPolres } = useFilterStore()

  // Daftar polres = master data, di-cache 30 menit (hanya admin butuh filter ini).
  const polresList = useMasterList('polres', { limit: 100 }, { enabled: user?.role === 'admin' }).data ?? []

  useEffect(() => { init() }, [init])

  // Bundle statistik dashboard — di-cache 60 detik, kunci per filter (from/to/polres).
  // Bolak-balik antar polres dalam 60 detik memakai cache (tidak fetch ulang 16 endpoint).
  const filterKey = { from: from || null, to: to || null, polres }
  const p = { from: from || undefined, to: to || undefined, polres_id: polres !== 'ALL' ? polres : undefined }

  const { data: dash, isLoading: loading, isError } = useQuery({
    queryKey: ['dashboard', 'bundle', filterKey],
    queryFn: async () => {
      const listRes = await laporanApi.list({ page: 1, limit: 10, sort_by: 'created_at', sort_dir: 'DESC', ...p })

      const [
        statusRes, breakdownRes, jenisLakaRes, korbanRes, keterjaminanRes,
        lakaPerLoketRes, korbanPerLoketRes, kasusTabrakRes, profesiRes,
        jenisKendaraanRes, topKecamatanRes, topRumahSakitRes,
        topPolresLpTerlamaRes, topPolresLakaRes, trenBulananRes, hariKejadianRes,
      ] = await Promise.all([
        laporanApi.statusLp(p).catch(() => null),
        laporanApi.breakdownTerlambat(p).catch(() => null),
        laporanApi.jenisLaka(p).catch(() => null),
        laporanApi.statistikKorban(p).catch(() => null),
        laporanApi.statistikKeterjaminan(p).catch(() => null),
        chartApi.totalLakaPerWilayah(p).catch(() => null),
        chartApi.totalKorbanPerWilayah(p).catch(() => null),
        chartApi.kasusTabrak(p).catch(() => null),
        chartApi.korbanPerProfesi(p).catch(() => null),
        chartApi.korbanPerJenisKendaraan(p).catch(() => null),
        chartApi.topKecamatanLaka(p).catch(() => null),
        chartApi.topRumahSakitKorban(p).catch(() => null),
        chartApi.topPolresLpTerlama(p).catch(() => null),
        chartApi.topPolresLaka(p).catch(() => null),
        chartApi.trenBulanan(p).catch(() => null),
        chartApi.hariKejadian(p).catch(() => null),
      ])

      // Perbandingan 2 periode hanya bila rentang tanggal diisi.
      let perbandinganData: PerbandinganData | null = null
      let perbandinganCideraData: PerbandinganCideraData | null = null
      if (from && to) {
        const cmpParams = { tanggal_awal: from, tanggal_akhir: to, polres_id: polres !== 'ALL' ? polres : 'ALL' }
        const [perbRes, perbCideraRes] = await Promise.all([
          chartApi.perbandingan(cmpParams).catch(() => null),
          chartApi.perbandinganCidera(cmpParams).catch(() => null),
        ])
        perbandinganData = perbRes ? perbRes.data.data : null
        perbandinganCideraData = perbCideraRes ? perbCideraRes.data.data : null
      }

      return {
        laporan: listRes.data.data || [],
        totalLaporan: listRes.data.meta?.total ?? 0,
        statusLpData: statusRes ? statusRes.data.data : null,
        breakdownData: breakdownRes ? breakdownRes.data.data : null,
        jenisLakaData: jenisLakaRes ? jenisLakaRes.data.data : null,
        korbanData: korbanRes ? korbanRes.data.data : null,
        keterjaminanData: keterjaminanRes ? keterjaminanRes.data.data : null,
        lakaPerLoketData: lakaPerLoketRes ? lakaPerLoketRes.data.data.data_wilayah : null,
        korbanPerLoketData: korbanPerLoketRes ? korbanPerLoketRes.data.data.data_wilayah : null,
        kasusTabrakData: kasusTabrakRes ? kasusTabrakRes.data.data : null,
        profesiData: profesiRes ? profesiRes.data.data : null,
        jenisKendaraanData: jenisKendaraanRes ? jenisKendaraanRes.data.data : null,
        topKecamatanData: topKecamatanRes ? topKecamatanRes.data.data : null,
        topRumahSakitData: topRumahSakitRes ? topRumahSakitRes.data.data : null,
        topPolresLpTerlamaData: topPolresLpTerlamaRes ? topPolresLpTerlamaRes.data.data : null,
        topPolresLakaData: topPolresLakaRes ? topPolresLakaRes.data.data : null,
        trenBulananData: trenBulananRes ? trenBulananRes.data.data : null,
        hariKejadianData: hariKejadianRes ? hariKejadianRes.data.data : null,
        perbandinganData,
        perbandinganCideraData,
      }
    },
    staleTime: 60 * 1000,
  })

  const error = isError ? 'Gagal memuat data dari server.' : null

  const laporan = dash?.laporan ?? []
  const totalLaporan = dash?.totalLaporan ?? 0
  const statusLpData = dash?.statusLpData ?? null
  const breakdownData = dash?.breakdownData ?? null
  const jenisLakaData = dash?.jenisLakaData ?? null
  const korbanData = dash?.korbanData ?? null
  const keterjaminanData = dash?.keterjaminanData ?? null
  const lakaPerLoketData = dash?.lakaPerLoketData ?? null
  const korbanPerLoketData = dash?.korbanPerLoketData ?? null
  const kasusTabrakData = dash?.kasusTabrakData ?? null
  const profesiData = dash?.profesiData ?? null
  const jenisKendaraanData = dash?.jenisKendaraanData ?? null
  const topKecamatanData = dash?.topKecamatanData ?? null
  const topRumahSakitData = dash?.topRumahSakitData ?? null
  const topPolresLpTerlamaData = dash?.topPolresLpTerlamaData ?? null
  const topPolresLakaData = dash?.topPolresLakaData ?? null
  const trenBulananData = dash?.trenBulananData ?? null
  const hariKejadianData = dash?.hariKejadianData ?? null
  const perbandinganData = dash?.perbandinganData ?? null
  const perbandinganCideraData = dash?.perbandinganCideraData ?? null

  // Trend harian — dependen pada user (role/wilayah), di-cache 60 detik.
  const trendPolresId = user ? (user.role === 'admin' ? 'ALL' : user.wilayah_id?.toString() || 'ALL') : 'ALL'
  const { data: trendData = null, isLoading: trendLoading, isError: trendIsError } = useQuery({
    queryKey: ['dashboard', 'trendHarian', trendPolresId],
    queryFn: async () => {
      const today = new Date()
      const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const res = await chartApi.trendHarian({
        tanggal_awal: startOfPrevMonth.toISOString().split('T')[0],
        tanggal_akhir: today.toISOString().split('T')[0],
        polres_id: trendPolresId,
      })
      return res.data.data
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  })
  const trendError = trendIsError ? 'Gagal memuat data trend' : null

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

  const filterProps = {
    filterTanggalAwal: from, setFilterTanggalAwal: setFrom,
    filterTanggalAkhir: to, setFilterTanggalAkhir: setTo,
    filterPolres: polres, setFilterPolres: setPolres,
    polresList, isAdmin
  }


  return isAdmin
    ? <AdminDashboard
      filterProps={filterProps}
      laporan={laporan}
      total={totalLaporan}
      statusData={statusLpData}
      breakdownData={breakdownData}
      jenisLakaData={jenisLakaData}
      korbanData={korbanData}
      keterjaminanData={keterjaminanData}
      lakaPerLoketData={lakaPerLoketData}
      korbanPerLoketData={korbanPerLoketData}
      kasusTabrakData={kasusTabrakData}
      profesiData={profesiData}
      jenisKendaraanData={jenisKendaraanData}
      topKecamatanData={topKecamatanData}
      topRumahSakitData={topRumahSakitData}
      trendData={trendData}
      trendLoading={trendLoading}
      trendError={trendError}
      perbandinganData={perbandinganData}
      perbandinganCideraData={perbandinganCideraData}
      topPolresLpTerlamaData={topPolresLpTerlamaData}
      topPolresLakaData={topPolresLakaData}
      trenBulananData={trenBulananData}
      hariKejadianData={hariKejadianData}
    />
    : <UserDashboard
      filterProps={filterProps}
      laporan={laporan}
      wilayahNama={wilayahNama}
      total={totalLaporan}
      statusData={statusLpData}
      breakdownData={breakdownData}
      jenisLakaData={jenisLakaData}
      korbanData={korbanData}
      keterjaminanData={keterjaminanData}
      lakaPerLoketData={lakaPerLoketData}
      korbanPerLoketData={korbanPerLoketData}
      kasusTabrakData={kasusTabrakData}
      profesiData={profesiData}
      jenisKendaraanData={jenisKendaraanData}
      topKecamatanData={topKecamatanData}
      topRumahSakitData={topRumahSakitData}
      trendData={trendData}
      trendLoading={trendLoading}
      trendError={trendError}
      perbandinganData={perbandinganData}
      perbandinganCideraData={perbandinganCideraData}
      topPolresLpTerlamaData={topPolresLpTerlamaData}
      topPolresLakaData={topPolresLakaData}
      trenBulananData={trenBulananData}
      hariKejadianData={hariKejadianData}
    />
}



