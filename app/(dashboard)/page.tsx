'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FilePlus2, ClipboardList, CalendarDays, HeartPulse,
  Loader2, TrendingUp, AlertCircle, ShieldCheck,
  BarChart2, MapPin
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button, PageHeader, SILakaShell, StatCard } from '@/components/si-laka-shell'
import { laporanApi, type LaporanPolisi } from '@/lib/api'
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
    { name: 'Multi Pihak', value: total - tunggal },
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

/* ─── Admin Dashboard ─── */
function AdminDashboard({ laporan }: { laporan: LaporanPolisi[] }) {
  const total = laporan.length
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
  const topPolres = Object.values(polresMap).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <SILakaShell title="Dashboard Admin" eyebrow="Data Laka JR">
      <PageHeader
        title="Dashboard"
        description="Ringkasan seluruh laporan kecelakaan lalu lintas di semua wilayah."
        action={<Button href="/laporan-polisi/tambah"><FilePlus2 size={16} /> Buat Laporan</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Laporan" value={String(total)} note="Seluruh data laporan" tone="success" icon={ClipboardList} />
        <StatCard label="Bulan Ini" value={String(bulanIni)} note={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} icon={CalendarDays} />
        <StatCard label="Laka Tunggal" value={String(lakaTunggal)} note={`${total > 0 ? Math.round((lakaTunggal / total) * 100) : 0}% dari total`} tone="danger" icon={TrendingUp} />
        <StatCard label="Total Korban" value={String(totalKorban)} note="Dari seluruh laporan" icon={HeartPulse} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Tren Laporan per Bulan</p>
          <p className="mb-4 text-xs text-muted-foreground">6 bulan terakhir — lintas wilayah</p>
          <MonthlyBarChart data={monthlyData} />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Jenis Kecelakaan</p>
          <p className="mb-4 text-xs text-muted-foreground">Laka tunggal vs multi pihak</p>
          <JenisLakaPieChart tunggal={lakaTunggal} total={total} />
        </div>
      </div>

      {topPolres.length > 0 && (
        <div className="mt-6 rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" /> Top 5 Polres
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
function UserDashboard({ laporan, wilayahNama }: { laporan: LaporanPolisi[]; wilayahNama: string }) {
  const total = laporan.length
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Laporan" value={String(total)} note="Di wilayah Anda" tone="success" icon={ClipboardList} />
        <StatCard label="Bulan Ini" value={String(bulanIni)} note={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} icon={CalendarDays} />
        <StatCard label="Laka Tunggal" value={String(lakaTunggal)} note={`${total > 0 ? Math.round((lakaTunggal / total) * 100) : 0}% dari total`} tone="danger" icon={TrendingUp} />
        <StatCard label="Total Korban" value={String(totalKorban)} note="Dari seluruh laporan" icon={HeartPulse} />
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { init() }, [init])

  useEffect(() => {
    laporanApi.list()
      .then((res) => setLaporan(res.data.data || []))
      .catch(() => setError('Gagal memuat data dari server.'))
      .finally(() => setLoading(false))
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
    ? <AdminDashboard laporan={laporan} />
    : <UserDashboard laporan={laporan} wilayahNama={wilayahNama} />
}
