'use client'

import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader, SILakaShell, StatCard } from '@/components/si-laka-shell'
import { ClipboardList, Activity, ShieldAlert, Loader2, AlertCircle } from 'lucide-react'
import { laporanApi } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'

export default function StatistikPage() {
  const { error: showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  // Default to this month vs last month
  const getFirstLastDay = (date: Date) => {
    const y = date.getFullYear()
    const m = date.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    return { 
      start: first.toISOString().slice(0,10), 
      end: last.toISOString().slice(0,10) 
    }
  }

  const now = new Date()
  const thisMonth = getFirstLastDay(now)
  
  const lastMonthDate = new Date(now)
  lastMonthDate.setMonth(now.getMonth() - 1)
  const lastMonth = getFirstLastDay(lastMonthDate)

  const [start1, setStart1] = useState(thisMonth.start)
  const [end1, setEnd1] = useState(thisMonth.end)
  const [start2, setStart2] = useState(lastMonth.start)
  const [end2, setEnd2] = useState(lastMonth.end)

  const fetchStatistik = () => {
    setLoading(true)
    laporanApi.statistikKomparasi({ start1, end1, start2, end2 })
      .then((res) => {
        setData(res.data.data)
      })
      .catch(() => showError('Gagal memuat data statistik komparasi.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStatistik()
  }, [])

  return (
    <SILakaShell title="Statistik" eyebrow="Laporan Polisi">
      <PageHeader
        title="Statistik & Komparasi"
        description="Bandingkan data kecelakaan lalu lintas antara 2 periode waktu."
      />

      <div className="mb-6 rounded-xl border bg-card p-5 shadow-xs">
        <h3 className="mb-4 font-semibold text-sm">Pilih Periode Komparasi</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Periode 1</p>
            <div className="flex items-center gap-2">
              <input type="date" value={start1} onChange={e => setStart1(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <span className="text-muted-foreground text-xs">s/d</span>
              <input type="date" value={end1} onChange={e => setEnd1(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Periode 2</p>
            <div className="flex items-center gap-2">
              <input type="date" value={start2} onChange={e => setStart2(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <span className="text-muted-foreground text-xs">s/d</span>
              <input type="date" value={end2} onChange={e => setEnd2(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>
          <button onClick={fetchStatistik} disabled={loading} className="w-full lg:w-auto h-10 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Terapkan'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={20} className="animate-spin" /> Memuat data...
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Laporan Periode 1"
              value={String(data.periode1?.jumlah_laka ?? data.periode1?.laka ?? 0)}
              note={`${start1} s/d ${end1}`}
              icon={ClipboardList}
            />
            <StatCard
              label="Laporan Periode 2"
              value={String(data.periode2?.jumlah_laka ?? data.periode2?.laka ?? 0)}
              note={`${start2} s/d ${end2}`}
              icon={ClipboardList}
            />
            <StatCard
              label="Selisih Kejadian"
              value={String(Math.abs((data.periode1?.jumlah_laka ?? 0) - (data.periode2?.jumlah_laka ?? 0)))}
              note={(data.periode1?.jumlah_laka ?? 0) > (data.periode2?.jumlah_laka ?? 0) ? 'Periode 1 lebih tinggi' : 'Periode 2 lebih tinggi'}
              tone={(data.periode1?.jumlah_laka ?? 0) > (data.periode2?.jumlah_laka ?? 0) ? 'danger' : 'success'}
              icon={Activity}
            />
          </div>

          <section className="mt-6 rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300">
            <h3 className="font-semibold text-foreground mb-4">Grafik Komparasi</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { 
                      name: 'Jumlah Laka', 
                      periode1: data.periode1?.jumlah_laka ?? 0, 
                      periode2: data.periode2?.jumlah_laka ?? 0 
                    },
                    { 
                      name: 'Laka Tunggal', 
                      periode1: data.periode1?.laka_tunggal ?? 0, 
                      periode2: data.periode2?.laka_tunggal ?? 0 
                    },
                    { 
                      name: 'Korban Jiwa/Luka', 
                      periode1: data.periode1?.korban ?? 0, 
                      periode2: data.periode2?.korban ?? 0 
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="periode1" name="Periode 1" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="periode2" name="Periode 2" fill="#bfdbfe" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground border rounded-xl bg-card">
          <AlertCircle size={28} className="opacity-50" />
          <p className="text-sm">Data komparasi tidak tersedia.</p>
        </div>
      )}
    </SILakaShell>
  )
}
