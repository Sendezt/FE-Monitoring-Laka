'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FilePlus2, ClipboardList, CalendarDays, HeartPulse, Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button, PageHeader, SILakaShell, StatCard } from '@/components/si-laka-shell'
import { laporanApi, type LaporanPolisi } from '@/lib/api'

const COLORS = ['#1d4ed8', '#3b82f6', '#93c5fd', '#dbeafe']

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const [laporan, setLaporan] = useState<LaporanPolisi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    laporanApi.list()
      .then((res) => setLaporan(res.data.data || []))
      .catch(() => setError('Gagal memuat data dari server.'))
      .finally(() => setLoading(false))
  }, [])

  // Computed stats
  const total = laporan.length
  const today = new Date().toISOString().slice(0, 10)
  const bulanIni = laporan.filter((l) => l.tanggal_laka?.slice(0, 7) === today.slice(0, 7)).length
  const lakaTunggal = laporan.filter((l) => l.laka_tunggal).length
  const totalKorban = laporan.reduce((sum, l) => sum + (l.korban?.length ?? 0), 0)

  // Monthly bar chart: group by month
  const monthlyMap: Record<string, number> = {}
  laporan.forEach((l) => {
    const m = l.tanggal_laka?.slice(0, 7)
    if (m) monthlyMap[m] = (monthlyMap[m] ?? 0) + 1
  })
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({
      name: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short' }),
      count,
    }))

  // Pie: laka tunggal vs tidak
  const pieData = [
    { name: 'Laka Tunggal', value: lakaTunggal },
    { name: 'Multi Pihak', value: total - lakaTunggal },
  ]

  const recent = laporan.slice(0, 5)

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

  return (
    <SILakaShell>
      <PageHeader
        title="Dashboard"
        description="Ringkasan data kecelakaan lalu lintas wilayah kerja Anda."
        action={
          <Button href="/laporan-polisi/tambah">
            <FilePlus2 size={17} /> Buat Laporan Baru
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Laporan" value={String(total)} note="Seluruh data laporan" tone="success" icon={ClipboardList} />
        <StatCard label="Bulan Ini" value={String(bulanIni)} note={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} icon={CalendarDays} />
        <StatCard label="Laka Tunggal" value={String(lakaTunggal)} note={`${total > 0 ? Math.round((lakaTunggal / total) * 100) : 0}% dari total`} tone="danger" icon={TrendingUp} />
        <StatCard label="Total Korban" value={String(totalKorban)} note="Dari seluruh laporan" tone="default" icon={HeartPulse} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-1 text-sm font-semibold text-foreground">Tren Laporan per Bulan</p>
          <p className="mb-4 text-xs text-muted-foreground">6 bulan terakhir</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} laporan`, 'Jumlah']} />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-1 text-sm font-semibold text-foreground">Jenis Kecelakaan</p>
          <p className="mb-4 text-xs text-muted-foreground">Laka tunggal vs multi pihak</p>
          {total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: COLORS[i] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground text-sm">Laporan Terbaru</p>
            <p className="text-xs text-muted-foreground">5 laporan terakhir yang masuk</p>
          </div>
          <Link href="/laporan-polisi" className="text-xs font-semibold text-primary hover:underline">
            Lihat semua →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada laporan</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-semibold">No. LP</th>
                <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Tanggal</th>
                <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Lokasi</th>
                <th className="px-5 py-3 text-left font-semibold">Korban</th>
                <th className="px-5 py-3 text-left font-semibold">Jenis</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((l, i) => (
                <tr key={l.id} className={`hover:bg-muted/10 transition-colors border-t ${i % 2 === 0 ? '' : 'bg-muted/5'}`}>
                  <td className="px-5 py-3">
                    <Link href={`/laporan-polisi/${l.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                      {l.no_lp}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell text-xs">{formatDate(l.tanggal_laka)}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell text-xs truncate max-w-[180px]">{l.lokasi_laka}</td>
                  <td className="px-5 py-3 text-xs">{l.korban?.length ?? 0} orang</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.laka_tunggal ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {l.laka_tunggal ? 'Tunggal' : 'Multi'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SILakaShell>
  )
}
