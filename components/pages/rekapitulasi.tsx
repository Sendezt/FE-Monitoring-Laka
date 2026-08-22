'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Download, Loader2, AlertCircle, TableProperties } from 'lucide-react'
import { SILakaShell } from '@/components/si-laka-shell'
import { laporanApi, masterApi, type RekapRow, type MasterItem } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { useFilterStore } from '@/lib/filter-store'

// ─── Column definition ─────────────────────────────────────────────────────────
const COLS: { key: keyof RekapRow; label: string; group: string }[] = [
  { key: 'jumlah_lp', label: 'Jumlah LP', group: 'Umum' },
  { key: 'terlambat_lapor', label: 'Terlambat Lapor', group: 'Umum' },
  { key: 'jumlah_korban', label: 'Jumlah Korban', group: 'Umum' },
  { key: 'laka_tunggal', label: 'Laka Tunggal', group: 'Umum' },
  // Cidera
  { key: 'll', label: 'LL', group: 'Cidera' },
  { key: 'll_md', label: 'LL-MD', group: 'Cidera' },
  { key: 'md', label: 'MD', group: 'Cidera' },
  // Keterjaminan
  { key: 'terjamin', label: 'Terjamin', group: 'Keterjaminan' },
  { key: 'eg2r', label: 'EG2R', group: 'Keterjaminan' },
  { key: 'tidak_terjamin', label: 'Tidak Terjamin', group: 'Keterjaminan' },
  // Kasus Tabrak
  { key: 'kt_depan_depan', label: 'Depan - Depan', group: 'Kasus Tabrak' },
  { key: 'kt_depan_samping', label: 'Depan - Samping', group: 'Kasus Tabrak' },
  { key: 'kt_depan_belakang', label: 'Depan - Belakang', group: 'Kasus Tabrak' },
  { key: 'kt_belakang_samping', label: 'Belakang - Samping', group: 'Kasus Tabrak' },
  { key: 'kt_samping_samping', label: 'Samping - Samping', group: 'Kasus Tabrak' },
  { key: 'kt_beruntun', label: 'Tabrakan Beruntun', group: 'Kasus Tabrak' },
  { key: 'kt_ka', label: 'Tabrakan dengan KA', group: 'Kasus Tabrak' },
  { key: 'kt_pjk', label: 'Menabrak Pjk', group: 'Kasus Tabrak' },
  { key: 'kt_jatuh_sendiri', label: 'Jatuh Sendiri', group: 'Kasus Tabrak' },
  { key: 'kt_ka_pjk', label: 'KA - Pjk', group: 'Kasus Tabrak' },
  // Profesi
  { key: 'pf_pelajar', label: 'Pelajar/Mahasiswa', group: 'Profesi' },
  { key: 'pf_karyawan', label: 'Karyawan/Swasta', group: 'Profesi' },
  { key: 'pf_wiraswasta', label: 'Wiraswasta/Wirausaha', group: 'Profesi' },
  { key: 'pf_pns', label: 'PNS/BUMN', group: 'Profesi' },
  { key: 'pf_pedagang', label: 'Pedagang', group: 'Profesi' },
  { key: 'pf_buruh', label: 'Buruh Harian Lepas', group: 'Profesi' },
  { key: 'pf_pensiunan', label: 'Pensiunan', group: 'Profesi' },
  { key: 'pf_guru', label: 'Guru', group: 'Profesi' },
  { key: 'pf_petani', label: 'Petani/Pekebun', group: 'Profesi' },
  { key: 'pf_rumah_tangga', label: 'Mengurus Rumah Tangga', group: 'Profesi' },
  { key: 'pf_tidak_bekerja', label: 'Tidak Bekerja', group: 'Profesi' },
  { key: 'pf_supir', label: 'Supir/Driver', group: 'Profesi' },
  { key: 'pf_lainnya', label: 'Lainnya', group: 'Profesi' },
  // Jenis Kendaraan
  { key: 'jk_a', label: 'A', group: 'Jenis Kendaraan' },
  { key: 'jk_b', label: 'B', group: 'Jenis Kendaraan' },
  { key: 'jk_c1', label: 'C1', group: 'Jenis Kendaraan' },
  { key: 'jk_c2', label: 'C2', group: 'Jenis Kendaraan' },
  { key: 'jk_dp', label: 'DP', group: 'Jenis Kendaraan' },
  { key: 'jk_du', label: 'DU', group: 'Jenis Kendaraan' },
  { key: 'jk_ep', label: 'EP', group: 'Jenis Kendaraan' },
  { key: 'jk_eu', label: 'EU', group: 'Jenis Kendaraan' },
  { key: 'jk_f', label: 'F', group: 'Jenis Kendaraan' },
  { key: 'jk_ka', label: 'KA', group: 'Jenis Kendaraan' },
  { key: 'jk_sepeda', label: 'Sepeda', group: 'Jenis Kendaraan' },
  { key: 'jk_pjk', label: 'PJK', group: 'Jenis Kendaraan' },
  { key: 'jk_tabrak_lari', label: 'Tidak diketahui/Tabrak Lari', group: 'Jenis Kendaraan' },
  // Keterlambatan detail
  { key: 'telat_1_3', label: 'Terlambat 1-3 Hari', group: 'Keterlambatan' },
  { key: 'telat_4_7', label: '4-7 Hari', group: 'Keterlambatan' },
  { key: 'telat_lebih_7', label: '>7 Hari', group: 'Keterlambatan' },
]

// Groups with their boundary columns (for header spanning)
const GROUPS = ['Umum', 'Cidera', 'Keterjaminan', 'Kasus Tabrak', 'Profesi', 'Jenis Kendaraan', 'Keterlambatan']
const GROUP_COLORS: Record<string, string> = {
  'Umum': 'bg-slate-800',
  'Cidera': 'bg-slate-800',
  'Keterjaminan': 'bg-slate-800',
  'Kasus Tabrak': 'bg-slate-800',
  'Profesi': 'bg-slate-800',
  'Jenis Kendaraan': 'bg-slate-800',
  'Keterlambatan': 'bg-slate-800',
}

// ─── Reusable big table ────────────────────────────────────────────────────────
function RekapTable({ rows, totals, nameLabel }: { rows: RekapRow[]; totals: RekapRow; nameLabel: string }) {
  return (
    <div className="overflow-auto max-h-[60vh] rounded-xl border border-border/60 shadow-xs">
      <table className="w-full text-xs whitespace-nowrap border-collapse">
        {/* Group header */}
        <thead className="sticky top-0 z-20">
          <tr>
            <th rowSpan={2} className="sticky left-0 z-30 bg-muted text-foreground px-3 py-2 text-left text-[10px] font-bold border-r border-border/60 min-w-[32px]">No</th>
            <th rowSpan={2} className="sticky left-8 z-30 bg-muted text-foreground px-3 py-2 text-left text-[10px] font-bold border-r border-border/60 min-w-[180px]">{nameLabel}</th>
            {GROUPS.map(g => {
              const count = COLS.filter(c => c.group === g).length
              return (
                <th key={g} colSpan={count} className={`bg-muted text-foreground px-3 py-1.5 text-center text-[10px] font-bold border-r border-border/60`}>
                  {g.toUpperCase()}
                </th>
              )
            })}
          </tr>
          <tr>
            {COLS.map(col => (
              <th key={col.key} className="bg-muted/60 text-muted-foreground px-2 py-1.5 text-center text-[9px] font-semibold border-r border-border/40 min-w-[56px]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={`border-b border-border/40 hover:bg-muted/40 transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
              <td className="sticky left-0 z-10 bg-inherit px-2 py-2 text-center text-muted-foreground border-r border-border/30 font-mono">{i + 1}</td>
              <td className="sticky left-8 z-10 bg-inherit px-3 py-2 font-semibold text-foreground border-r border-border/30 max-w-[200px] truncate">{row.nama}</td>
              {COLS.map(col => (
                <td key={col.key} className={`px-2 py-2 text-center tabular-nums border-r border-border/20 ${(row[col.key] as number) > 0 ? 'text-foreground font-medium' : 'text-muted-foreground/40'}`}>
                  {row[col.key] as number}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* Totals row */}
        <tfoot className="sticky bottom-0 z-20">
          <tr className="bg-muted text-foreground font-bold border-t-2 border-primary">
            <td className="sticky left-0 z-30 bg-muted px-2 py-2 border-r border-border/60" />
            <td className="sticky left-8 z-30 bg-muted px-3 py-2 font-bold border-r border-border/60">TOTAL</td>
            {COLS.map(col => (
              <td key={col.key} className="px-2 py-2 text-center tabular-nums border-r border-border/60 text-primary">
                {totals[col.key] as number || 0}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({
  from, setFrom, to, setTo,
  polres, setPolres, polresList, isAdmin
}: {
  from: string; setFrom: (v: string) => void
  to: string; setTo: (v: string) => void
  polres: string; setPolres: (v: string) => void
  polresList: MasterItem[]; isAdmin: boolean
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-card border border-border/60 rounded-xl p-3 shadow-xs">
      <div className="flex items-center gap-3 border border-border/80 rounded-lg px-3 py-1.5 bg-background w-full sm:w-auto">
        <CalendarDays size={16} className="text-primary/70 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tanggal Awal</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} disabled
            className="bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 p-0 text-foreground opacity-70 cursor-not-allowed" />
        </div>
      </div>
      <div className="flex items-center gap-3 border border-border/80 rounded-lg px-3 py-1.5 bg-background w-full sm:w-auto">
        <CalendarDays size={16} className="text-primary/70 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tanggal Akhir</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} disabled
            className="bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 p-0 text-foreground opacity-70 cursor-not-allowed" />
        </div>
      </div>
      {/* {isAdmin && (
        <div className="flex items-center gap-3 border border-border/80 rounded-lg px-3 py-1.5 bg-background w-full sm:min-w-[200px]">
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Polres</span>
            <select value={polres} onChange={e => setPolres(e.target.value)} disabled
              className="bg-transparent border-none text-xs font-semibold focus:outline-none focus:ring-0 p-0 w-full appearance-none text-foreground opacity-70 cursor-not-allowed">
              <option value="ALL">Semua Polres</option>
              {polresList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>
        </div>
      )} */}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function RekapitulasiPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const { from, to, polres, setFrom, setTo, setPolres } = useFilterStore()
  const [polresList, setPolresList] = useState<MasterItem[]>([])

  const [polresRows, setPolresRows] = useState<RekapRow[]>([])
  const [polresTotals, setPolresTotals] = useState<RekapRow | null>(null)
  const [loketRows, setLoketRows] = useState<RekapRow[]>([])
  const [loketTotals, setLoketTotals] = useState<RekapRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load polres list
  useEffect(() => {
    if (isAdmin) {
      masterApi.polres.list({ limit: 100 })
        .then(res => setPolresList(res.data.data || []))
        .catch(console.error)
    }
  }, [isAdmin])

  // Load rekapitulasi data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      const params = {
        from: from || undefined,
        to: to || undefined,
        polres_id: polres !== 'ALL' ? polres : undefined,
      }
      try {
        const [polresRes, loketRes] = await Promise.all([
          laporanApi.rekapitulasiPolres(params),
          laporanApi.rekapitulasiLoket(params),
        ])
        setPolresRows(polresRes.data.data.rows || [])
        setPolresTotals(polresRes.data.data.totals || null)
        setLoketRows(loketRes.data.data.rows || [])
        setLoketTotals(loketRes.data.data.totals || null)
      } catch (err) {
        setError('Gagal memuat data rekapitulasi. Pastikan server backend berjalan.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [from, to, polres])

  return (
    <SILakaShell title="Rekapitulasi Data" eyebrow="Monitoring Laka">
      <FilterBar
        from={from} setFrom={setFrom}
        to={to} setTo={setTo}
        polres={polres} setPolres={setPolres}
        polresList={polresList}
        isAdmin={isAdmin}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground text-sm">
          <Loader2 size={18} className="animate-spin" />
          Memuat data rekapitulasi...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <AlertCircle size={28} className="text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Table 1: Per Polres */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              {/* <TableProperties size={18} className="text-primary" /> */}
              <div>
                {/* <h2 className="text-sm font-bold text-foreground">Rekapitulasi Per Polres</h2> */}
                {/* <p className="text-xs text-muted-foreground">{polresRows.length} polres ditemukan</p> */}
              </div>
            </div>
            {polresRows.length > 0 && polresTotals ? (
              <RekapTable rows={polresRows} totals={polresTotals} nameLabel="POLRES" />
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground border rounded-xl border-dashed">
                Tidak ada data untuk periode ini.
              </div>
            )}
          </section>

          {/* Table 2: Per Loket */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              {/* <TableProperties size={18} className="text-emerald-600" /> */}
              <div>
                {/* <h2 className="text-sm font-bold text-foreground">Rekapitulasi Per Loket (Wilayah)</h2> */}
                {/* <p className="text-xs text-muted-foreground">{loketRows.length} loket ditemukan</p> */}
              </div>
            </div>
            {loketRows.length > 0 && loketTotals ? (
              <RekapTable rows={loketRows} totals={loketTotals} nameLabel="LOKET" />
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground border rounded-xl border-dashed">
                Tidak ada data untuk periode ini.
              </div>
            )}
          </section>
        </div>
      )}
    </SILakaShell>
  )
}
