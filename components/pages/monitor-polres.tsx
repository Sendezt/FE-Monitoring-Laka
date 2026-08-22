'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  TableProperties, LayoutGrid, Loader2, AlertCircle,
  Printer, FileText, Check,
  ChevronDown
} from 'lucide-react'
import { laporanApi, masterApi, type LaporanPolisi, type MasterItem, type Korban } from '@/lib/api'
import { SILakaShell, PageHeader } from '@/components/si-laka-shell'

function fmtDate(s?: string | null) {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusLp(lap: LaporanPolisi): 'NORMAL' | 'TERLAMBAT' {
  return (lap.telat_lp ?? 0) > 0 ? 'TERLAMBAT' : 'NORMAL'
}

const HARI_INDO = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function hariKejadian(s?: string | null): string {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '-'
  return HARI_INDO[d.getDay()]
}

function selisihHari(tglLaka?: string | null, tglLp?: string | null): number | string {
  if (!tglLaka || !tglLp) return '-'
  const d1 = new Date(tglLaka)
  const d2 = new Date(tglLp)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '-'
  const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function AttendanceGridView({ laporan, polresList, monthFilter }: { laporan: LaporanPolisi[]; polresList: MasterItem[]; monthFilter: string }) {
  const [yearStr, monthStr] = monthFilter.split('-')
  const year = parseInt(yearStr) || new Date().getFullYear()
  const monthIdx = (parseInt(monthStr) || (new Date().getMonth() + 1)) - 1
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const displayDate = new Date(year, monthIdx, 1)

  const filledMap = new Map<number, Set<number>>()
  laporan.forEach((lap) => {
    const d = new Date(lap.tanggal_laka)
    if (isNaN(d.getTime())) return
    if (d.getFullYear() !== year || d.getMonth() !== monthIdx) return
    const pid = lap.polres_id || 0
    if (!filledMap.has(pid)) filledMap.set(pid, new Set())
    filledMap.get(pid)!.add(d.getDate())
  })

  return (
    <div className="overflow-auto rounded-xl border border-border/60 bg-card max-h-[calc(100vh-260px)]">
      <table className="border-collapse text-[11px] w-full">
        <thead className="sticky top-0 z-10 border-b border-border/40">
          <tr>
            <th rowSpan={3} className="border border-border/60 bg-muted/70 px-2 py-1.5 font-bold text-[9px] tracking-wider text-foreground align-middle w-10">No</th>
            <th rowSpan={3} className="border border-border/60 bg-muted/70 px-3 py-1.5 font-bold text-[9px] tracking-wider text-foreground align-middle text-left whitespace-nowrap">Nama Polres</th>
          </tr>
          <tr>
            <th colSpan={daysInMonth} className="border border-border/60 bg-muted/70 px-2 py-1.5 font-bold text-[9px] tracking-wider text-foreground text-center">{displayDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</th>
          </tr>
          <tr>
            {days.map((d) => (
              <th key={d} className="border border-border/60 bg-muted/70 px-1.5 py-1.5 font-bold text-[9px] tracking-wider text-foreground text-center w-8">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {polresList.map((polres, idx) => {
            const filledDays = filledMap.get(polres.id) || new Set<number>()
            return (
              <tr key={polres.id} className="hover:bg-muted/30">
                <td className="border border-border/50 px-2 py-1.5 text-center text-muted-foreground">{idx + 1}</td>
                <td className="border border-border/50 px-3 py-1.5 font-medium whitespace-nowrap">{polres.nama}</td>
                {days.map((d) => {
                  const checked = filledDays.has(d)
                  return (
                    <td key={d} className="border border-border/50 px-1 py-1.5 text-center">
                      <div className={`mx-auto flex items-center justify-center w-4 h-4 rounded-[3px] border ${checked ? 'bg-slate-400 border-slate-400' : 'bg-white dark:bg-transparent border-slate-300 dark:border-slate-600'}`}>
                        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {polresList.length === 0 && (
            <tr>
              <td colSpan={2 + daysInMonth} className="text-center py-10 text-muted-foreground">Tidak ada data tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

interface RowData {
  lap: LaporanPolisi
  korban: (Korban & { profesi?: { id: number; nama: string }; cidera?: { id: number; nama: string }; tindakLanjut?: { id: number; nama: string }; jenisJaminan?: { id: number; nama: string }; keterjaminan?: { id: number; nama: string } }) | null
}

function SpreadsheetView({ laporan, polresList, mapKasusTabrak, mapFaktorPenyebab, mapSifatLaka }: { laporan: LaporanPolisi[]; polresList: MasterItem[]; mapKasusTabrak: Map<number, string>; mapFaktorPenyebab: Map<number, string>; mapSifatLaka: Map<number, string> }) {
  const tableRef = useRef<HTMLDivElement>(null)

  const BULAN_FULL = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER']

  type MonthBucket = { monthIdx: number; year: number; rows: RowData[] }
  const buckets: MonthBucket[] = []
    ;[...laporan].sort((a, b) => {
      const da = new Date(a.tanggal_laka).getTime()
      const db = new Date(b.tanggal_laka).getTime()
      if (isNaN(da) || isNaN(db)) return 0
      return da - db
    }).forEach((lap) => {
      const d = new Date(lap.tanggal_laka)
      if (isNaN(d.getTime())) return
      const monthIdx = d.getMonth()
      const year = d.getFullYear()
      let bucket = buckets.find((b) => b.monthIdx === monthIdx && b.year === year)
      if (!bucket) {
        bucket = { monthIdx, year, rows: [] }
        buckets.push(bucket)
      }
      const korbanList = (lap.korban || []).filter((k) => k.cidera_id != null)
      if (korbanList.length === 0) {
        bucket.rows.push({ lap, korban: null })
      } else {
        korbanList.forEach((k) => bucket.rows.push({ lap, korban: k }))
      }
    })

  const handlePrint = () => {
    const content = tableRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=1400,height=800')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Monitor Laporan per Polres</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; color: #1e293b; }
            h1 { font-size: 16px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th, td { border: 1px solid #cbd5e1; padding: 3px 4px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; font-weight: 700; font-size: 8px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Monitor Laporan per Polres</h1>
          ${content.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
  }

  const totalCols = 31

  return (
    <div>
      <div ref={tableRef} className="overflow-auto rounded-xl border border-border/60 bg-card max-h-[calc(100vh-260px)]">
        <table className="w-full text-[10px] border-collapse">
          <thead className="sticky top-0 z-10 border-b border-border/40">
            <tr className="bg-muted/70">
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider w-7 align-middle"></th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider w-7 align-middle">#</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">No LP</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">Nama Korban</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider w-10 align-middle">Usia (Tahun)</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">Profesi</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Tanggal Laka</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Tanggal LP</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">LP Terlambat</th>
              <th colSpan={3} className="border border-border/60 px-1.5 py-1 text-center font-bold text-[9px] tracking-wider">Tempat Laka</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Rumah Sakit Wil. Sendiri</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Rumah Sakit Wil Lain</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-center font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Laka Tunggal</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Tindak Lanjut</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">Cidera</th>
              <th colSpan={3} className="border border-border/60 px-1.5 py-1 text-center font-bold text-[9px] tracking-wider">Kend Korban</th>
              <th colSpan={3} className="border border-border/60 px-1.5 py-1 text-center font-bold text-[9px] tracking-wider">Kendaraan Penjamin</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Jenis Jaminan</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">Keterjaminan</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Kasus Tabrakan Kecelakaan</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Faktor Penyebab Laka</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">Sifat Laka</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider align-middle">Keterangan</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Selisih Hari</th>
              <th rowSpan={2} className="border border-border/60 px-1.5 py-2 text-left font-bold text-[9px] tracking-wider whitespace-nowrap align-middle">Hari Kejadian</th>
            </tr>
            <tr className="bg-muted/70">
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Kecamatan</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Kelurahan</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Lokasi Laka</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Jenis</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Nopol</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider whitespace-nowrap">Masa Laku SW</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Jenis</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider">Nopol</th>
              <th className="border border-border/60 px-1.5 py-1.5 text-left font-bold text-[9px] tracking-wider whitespace-nowrap">Masa Laku SW</th>
            </tr>
          </thead>
          <tbody>
            {buckets.length === 0 && (
              <tr>
                <td colSpan={totalCols} className="text-center py-10 text-muted-foreground">Tidak ada data tersedia</td>
              </tr>
            )}
            {buckets.map((bucket) => {
              let globalIdx = 0
              return bucket.rows.map((row, idx) => {
              const { lap, korban } = row
              const st = statusLp(lap)
              const kendKorban = (lap.kendaraan || []).filter((k) => k.peran === 'korban')
              const kendPenjamin = (lap.kendaraan || []).filter((k) => k.peran === 'penjamin')
              const rsSendiri = (lap.rumah_sakit_wilayah && /sendiri/i.test(lap.rumah_sakit_wilayah)) ? lap.rumah_sakit_wilayah : '-'
              const rsLain = (lap.rumah_sakit_wilayah && /lain/i.test(lap.rumah_sakit_wilayah)) ? lap.rumah_sakit_wilayah : '-'
              const noRs = !lap.rumah_sakit_wilayah || (rsSendiri === '-' && rsLain === '-') ? (lap.rumah_sakit_wilayah || '-') : null
              return (
                <tr key={`${lap.id}-${korban?.id || 'n'}`} className="hover:bg-muted/30">
                  {idx === 0 && (
                    <td rowSpan={bucket.rows.length} className="border border-border/50 px-1.5 py-1 font-bold text-foreground bg-muted/20 whitespace-nowrap align-top">
                      {BULAN_FULL[bucket.monthIdx]}
                    </td>
                  )}
                  <td className="border border-border/50 px-1.5 py-1 text-muted-foreground">{idx + 1}</td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">{lap.no_lp}</td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.usia ?? '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.profesi?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">{fmtDate(lap.tanggal_laka)}</td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">{fmtDate(lap.tanggal_lp)}</td>
                      <td className="border border-border/50 px-1.5 py-1 text-center">
                        <span className={`${st === 'NORMAL' ? '' : ''}`}>
                          {st}
                        </span>
                      </td>
                      <td className="border border-border/50 px-1.5 py-1">{lap.kecamatan?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{lap.kelurahan?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{lap.lokasi_laka || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{noRs || rsSendiri}</td>
                      <td className="border border-border/50 px-1.5 py-1">{rsLain}</td>
                      <td className="border border-border/50 px-1.5 py-1 text-center">{lap.laka_tunggal ? 'Ya' : 'Tidak'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.tindakLanjut?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.cidera?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">
                        {kendKorban.length > 0
                          ? kendKorban.map((k, ki) => <div key={ki}>{k.jenisKendaraan?.nama || '-'}</div>)
                          : '-'}
                      </td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">
                        {kendKorban.length > 0
                          ? kendKorban.map((k, ki) => <div key={ki}>{k.nopol || '-'}</div>)
                          : '-'}
                      </td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">
                        {kendKorban.length > 0
                          ? kendKorban.map((k, ki) => <div key={ki}>{k.masa_laku_sw || '-'}</div>)
                          : '-'}
                      </td>
                      <td className="border border-border/50 px-1.5 py-1">
                        {kendPenjamin.length > 0
                          ? kendPenjamin.map((k, ki) => <div key={ki}>{k.jenisKendaraan?.nama || '-'}</div>)
                          : '-'}
                      </td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">
                        {kendPenjamin.length > 0
                          ? kendPenjamin.map((k, ki) => <div key={ki}>{k.nopol || '-'}</div>)
                          : '-'}
                      </td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">
                        {kendPenjamin.length > 0
                          ? kendPenjamin.map((k, ki) => <div key={ki}>{k.masa_laku_sw || '-'}</div>)
                          : '-'}
                      </td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.jenisJaminan?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{korban?.keterjaminan?.nama || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{lap.kasus_tabrak_kecelakaan_id ? (mapKasusTabrak.get(lap.kasus_tabrak_kecelakaan_id) || '-') : '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{lap.faktor_penyebab_laka_id ? (mapFaktorPenyebab.get(lap.faktor_penyebab_laka_id) || '-') : '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1">{lap.sifat_laka_id ? (mapSifatLaka.get(lap.sifat_laka_id) || '-') : '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1 max-w-[120px] truncate">{lap.keterangan || '-'}</td>
                      <td className="border border-border/50 px-1.5 py-1 text-center">{selisihHari(lap.tanggal_laka, lap.tanggal_lp)}</td>
                      <td className="border border-border/50 px-1.5 py-1 whitespace-nowrap">{hariKejadian(lap.tanggal_laka)}</td>
                    </tr>
                  )
                })
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MonitorPolresPage() {
  const [laporan, setLaporan] = useState<LaporanPolisi[]>([])
  const [polresList, setPolresList] = useState<MasterItem[]>([])
  const [mapKasusTabrak, setMapKasusTabrak] = useState<Map<number, string>>(new Map())
  const [mapFaktorPenyebab, setMapFaktorPenyebab] = useState<Map<number, string>>(new Map())
  const [mapSifatLaka, setMapSifatLaka] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'spreadsheet'>('card')
  const [polresFilter, setPolresFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [laporanRes, polresRes, kasusRes, faktorRes, sifatRes] = await Promise.all([
          laporanApi.list({ limit: 9999 }),
          masterApi.polres.list(),
          masterApi.kasusTabrak.list(),
          masterApi.faktorPenyebab.list(),
          masterApi.sifatLaka.list(),
        ])
        const toMap = (items: MasterItem[]) => new Map(items.map((i) => [i.id, i.nama]))
        setLaporan(laporanRes.data.data)
        setPolresList(polresRes.data.data)
        setMapKasusTabrak(toMap(kasusRes.data.data))
        setMapFaktorPenyebab(toMap(faktorRes.data.data))
        setMapSifatLaka(toMap(sifatRes.data.data))
      } catch (err) {
        setError('Gagal memuat data. Silakan coba lagi.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = laporan.filter((l) => {
    if (polresFilter !== 'all' && l.polres_id !== parseInt(polresFilter)) return false
    if (monthFilter) {
      const d = new Date(l.tanggal_laka)
      if (!isNaN(d.getTime())) {
        const lpMonth = d.toISOString().slice(0, 7)
        if (lpMonth !== monthFilter) return false
      }
    }
    return true
  })

  const polresListFiltered = polresFilter === 'all' ? polresList : polresList.filter((p) => p.id === parseInt(polresFilter))

  return (
    <SILakaShell title="Monitor Polres" eyebrow="Administrasi">
      <PageHeader
        title="Monitor Polres"
        description="Monitoring laporan kecelakaan per polres. Gunakan toggle untuk beralih antara tampilan kartu dan spreadsheet."
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <select
            value={polresFilter}
            onChange={(e) => setPolresFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border/80 bg-card pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors"
          >
            <option value="all">Semua Polres</option>
            {polresList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-lg border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors"
        />

        <div className="flex rounded-lg border border-border/80 bg-muted/40 p-0.5 ml-auto">
          <button
            onClick={() => setViewMode('card')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'card' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid size={14} />
            Checklist
          </button>
          <button
            onClick={() => setViewMode('spreadsheet')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === 'spreadsheet' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <TableProperties size={14} />
            Spreadsheet
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={36} className="text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={36} className="text-destructive" />
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {viewMode === 'card' && (
            <>
              {polresListFiltered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <FileText size={36} className="text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Tidak ada data untuk filter yang dipilih</p>
                </div>
              ) : (
                <AttendanceGridView laporan={filtered} polresList={polresListFiltered} monthFilter={monthFilter} />
              )}
            </>
          )}
          {viewMode === 'spreadsheet' && (
            <SpreadsheetView laporan={filtered} polresList={polresList} mapKasusTabrak={mapKasusTabrak} mapFaktorPenyebab={mapFaktorPenyebab} mapSifatLaka={mapSifatLaka} />
          )}
        </>
      )}
    </SILakaShell>
  )
}