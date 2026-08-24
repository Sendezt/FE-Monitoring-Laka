'use client'

import { useCallback, useEffect, useState } from 'react'
import React from 'react'
import {
  RefreshCw, Loader2, AlertCircle, ChevronDown, DatabaseZap,
  CheckCircle2, XCircle, AlertTriangle, Search, UploadCloud, FileSpreadsheet,
  ChevronRight, Car, Users as UsersIcon, FileText, Pencil, MapPin,
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader } from '@/components/si-laka-shell'
import { useToast } from '@/components/ui/toast-provider'
import { migrasiApi, masterApi, type MigrasiRow, type MigrasiStatus, type MigrasiPayload, type MasterItem } from '@/lib/api'
import { SearchableSelect } from '@/components/ui/searchable-select'
const SHEET_OPTIONS = Array.from({ length: 35 }, (_, i) => String(i + 1))

type KecamatanItem = MasterItem & { polres_id?: number }
type RumahSakitItem = MasterItem & { wilayah_id?: number; wilayah?: { id: number; nama: string } }

interface MigrasiMasters {
  polres: MasterItem[]
  kecamatan: KecamatanItem[]
  rumahSakit: RumahSakitItem[]
  kasusTabrak: MasterItem[]
  faktorPenyebab: MasterItem[]
  sifatLaka: MasterItem[]
  jenisKendaraan: MasterItem[]
  profesi: MasterItem[]
  cidera: MasterItem[]
  tindakLanjut: MasterItem[]
  jenisJaminan: MasterItem[]
  keterjaminan: MasterItem[]
}

const REQUIRED_FIELDS: (keyof MigrasiPayload)[] = [
  'no_lp', 'polres_id', 'tanggal_laka', 'hari_kejadian', 'tanggal_lp',
  'kecamatan_id', 'kelurahan_id',
]

// Evaluasi ulang status baris di sisi klien setelah user mengedit (mirror logika backend).
// Duplikat tetap mengikuti hasil server terakhir (dikonfirmasi via tombol Check).
function evaluateRow(payload: MigrasiPayload, raw: MigrasiRow['raw'], duplicate: boolean) {
  const missing = REQUIRED_FIELDS.filter((f) => {
    const v = payload[f]
    return v === null || v === undefined || v === ''
  }) as string[]

  const issues: { field: string; value: string }[] = []
  const optional: [keyof MigrasiPayload, string | undefined, string][] = [
    ['kasus_tabrak_kecelakaan_id', raw.kasus_tabrakan, 'kasus_tabrakan'],
    ['faktor_penyebab_laka_id', raw.faktor_penyebab, 'faktor_penyebab'],
    ['sifat_laka_id', raw.sifat_laka, 'sifat_laka'],
  ]
  if (raw.rs_sendiri && payload.korban.some((k) => !k.rumah_sakit_id)) {
    issues.push({ field: 'rumah_sakit', value: raw.rs_sendiri })
  }

  optional.forEach(([idField, rawText, name]) => {
    if (!payload[idField] && rawText) issues.push({ field: name, value: rawText })
  })
  // Kendaraan yang di-skip saat import:
  // - Punya nopol tapi jenis kendaraan belum terpetakan → tandai (perlu dibetulkan agar tidak hilang).
  // - Kosong sepenuhnya → tidak diperlakukan sebagai masalah (akan dilewati diam-diam).
  payload.kendaraan.forEach((k) => {
    const hasNopol = !!(k.nopol && String(k.nopol).trim())
    if (hasNopol && !k.jenis_kendaraan_id) {
      issues.push({ field: 'jenis_kendaraan', value: k.nopol || '(kendaraan)' })
    }
  })

  let status: MigrasiStatus = 'VALID'
  if (missing.length > 0 || issues.length > 0) status = 'INVALID_MASTER'
  if (duplicate) status = 'DUPLICATE'
  return { status, missing, issues }
}

const STATUS_META: Record<MigrasiStatus, { label: string; row: string; badge: string; icon: React.ElementType }> = {
  VALID: {
    label: 'Siap Insert',
    row: 'bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  INVALID_MASTER: {
    label: 'Data Tidak Cocok',
    row: 'bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: AlertTriangle,
  },
  DUPLICATE: {
    label: 'Sudah Ada di Polres Ini',
    row: 'bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    icon: XCircle,
  },
}

const FIELD_LABEL: Record<string, string> = {
  no_lp: 'No LP',
  polres_id: 'Polres',
  tanggal_laka: 'Tanggal Laka',
  hari_kejadian: 'Hari Kejadian',
  tanggal_lp: 'Tanggal LP',
  kecamatan_id: 'Kecamatan',
  kelurahan_id: 'Kelurahan',
  lokasi_laka: 'Lokasi Laka',
  kecamatan: 'Kecamatan',
  kelurahan: 'Kelurahan',
  polres: 'Polres',
  rumah_sakit: 'Rumah Sakit',
  kasus_tabrakan: 'Kasus Tabrakan',
  faktor_penyebab: 'Faktor Penyebab',
  sifat_laka: 'Sifat Laka',
  jenis_kendaraan: 'Jenis Kendaraan',
}

type RowState = {
  data: MigrasiRow
  checking: boolean
  importing: boolean
  imported: boolean
  edited?: boolean
}

export function MigrasiPage() {
  const { success, error: showError, info } = useToast()
  const [sheet, setSheet] = useState('1')
  const [startRow, setStartRow] = useState('6')
  const [endRow, setEndRow] = useState('200')
  const [rows, setRows] = useState<RowState[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncingAll, setSyncingAll] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [masters, setMasters] = useState<MigrasiMasters | null>(null)
  const [confirmSync, setConfirmSync] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | MigrasiStatus | 'IMPORTED'>('ALL')
  const [detectedPolres, setDetectedPolres] = useState<string | null>(null)
  const [detectedPolresId, setDetectedPolresId] = useState<number | null>(null)
  const [detectedWilayahId, setDetectedWilayahId] = useState<number | null>(null)

  // Muat data master untuk dropdown edit inline (sekali)
  useEffect(() => {
    let active = true
    Promise.all([
      masterApi.polres.list({ page: 1, limit: 1000 }),
      masterApi.kecamatan.list({ page: 1, limit: 5000 }),
      masterApi.rumahsakit.list({ page: 1, limit: 5000 }),
      masterApi.kasusTabrak.list({ page: 1, limit: 1000 }),
      masterApi.faktorPenyebab.list({ page: 1, limit: 1000 }),
      masterApi.sifatLaka.list({ page: 1, limit: 1000 }),
      masterApi.jenisKendaraan.list({ page: 1, limit: 1000 }),
      masterApi.profesi.list({ page: 1, limit: 1000 }),
      masterApi.cidera.list({ page: 1, limit: 1000 }),
      masterApi.tindakLanjut.list({ page: 1, limit: 1000 }),
      masterApi.jenisJaminan.list({ page: 1, limit: 1000 }),
      masterApi.keterjaminan.list({ page: 1, limit: 1000 }),
    ])
      .then((res) => {
        if (!active) return
        setMasters({
          polres: res[0].data.data || [],
          kecamatan: (res[1].data.data || []) as KecamatanItem[],
          rumahSakit: (res[2].data.data || []) as RumahSakitItem[],
          kasusTabrak: res[3].data.data || [],
          faktorPenyebab: res[4].data.data || [],
          sifatLaka: res[5].data.data || [],
          jenisKendaraan: res[6].data.data || [],
          profesi: res[7].data.data || [],
          cidera: res[8].data.data || [],
          tindakLanjut: res[9].data.data || [],
          jenisJaminan: res[10].data.data || [],
          keterjaminan: res[11].data.data || [],
        })
      })
      .catch(() => {
        if (active) showError('Gagal memuat data master untuk koreksi.')
      })
    return () => { active = false }
  }, [showError])

  const fetchSheet = useCallback(async () => {
    const start = parseInt(startRow, 10)
    const end = parseInt(endRow, 10)
    if (!start || start < 1) {
      setError('Baris awal harus angka minimal 1.')
      return
    }
    if (!end || end < start) {
      setError('Baris akhir harus angka dan tidak boleh lebih kecil dari baris awal.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await migrasiApi.sheets({ sheet, startRow: start, endRow: end })
      const fetched = res.data.data.rows || []
      setRows(fetched.map((r) => ({ data: r, checking: false, importing: false, imported: false })))
      setDetectedPolres(res.data.data.detected_polres ?? null)
      setDetectedPolresId(res.data.data.detected_polres_id ?? null)
      setDetectedWilayahId(res.data.data.detected_wilayah_id ?? null)
      setLoaded(true)
      if (fetched.length === 0) info('Tidak ada data pada rentang baris ini.')
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Gagal memuat data dari Google Sheets.')
    } finally {
      setLoading(false)
    }
  }, [sheet, startRow, endRow, info])

  useEffect(() => {
    fetchSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateRow = (noLp: string, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.data.no_lp === noLp ? { ...r, ...patch } : r)))
  }

  // Terapkan hasil edit inline: buat payload baru, hitung ulang status.
  const applyEdit = (rs: RowState, mutate: (p: MigrasiPayload) => void) => {
    const newPayload: MigrasiPayload = {
      ...rs.data.payload,
      kendaraan: rs.data.payload.kendaraan.map((k) => ({ ...k })),
      korban: rs.data.payload.korban.map((k) => ({ ...k })),
      labels: rs.data.payload.labels ? { ...rs.data.payload.labels } : undefined,
    }
    mutate(newPayload)
    const { status, missing, issues } = evaluateRow(newPayload, rs.data.raw, rs.data.duplicate)
    updateRow(rs.data.no_lp, {
      edited: true,
      data: { ...rs.data, payload: newPayload, status, missing_fields: missing, issues, duplicate: status === 'DUPLICATE' ? rs.data.duplicate : false },
    })
  }

  const handleCheck = async (rs: RowState) => {
    updateRow(rs.data.no_lp, { checking: true })
    try {
      const res = await migrasiApi.check(rs.data.payload)
      const result = res.data.data
      updateRow(rs.data.no_lp, {
        checking: false,
        data: {
          ...rs.data,
          status: result.status,
          duplicate: result.duplicate,
          missing_fields: result.missing_fields,
        },
      })
      if (result.insertable) success(`LP ${rs.data.no_lp}: siap di-insert.`)
      else if (result.duplicate) showError(`LP ${rs.data.no_lp}: sudah ada di database.`)
      else showError(`LP ${rs.data.no_lp}: data belum lengkap.`)
    } catch {
      updateRow(rs.data.no_lp, { checking: false })
      showError('Gagal memeriksa baris.')
    }
  }

  const handleImport = async (rs: RowState) => {
    updateRow(rs.data.no_lp, { importing: true })
    try {
      await migrasiApi.import(rs.data.payload)
      updateRow(rs.data.no_lp, { importing: false, imported: true })
      success(`LP ${rs.data.no_lp} berhasil masuk database.`)
    } catch (err) {
      updateRow(rs.data.no_lp, { importing: false })
      const resp = (err as { response?: { data?: { message?: string; errors?: string } } })?.response?.data
      const detail = resp?.errors ? ` (${resp.errors})` : ''
      showError((resp?.message || `Gagal mengimpor LP ${rs.data.no_lp}.`) + detail)
    }
  }

  const handleSyncAll = async () => {
    const targets = rows.filter((r) => r.data.status === 'VALID' && !r.imported)
    if (targets.length === 0) {
      info('Tidak ada baris valid yang bisa disinkronkan.')
      return
    }
    setConfirmSync(false)
    setSyncingAll(true)
    let ok = 0
    let fail = 0
    const failedList: string[] = []
    for (const rs of targets) {
      updateRow(rs.data.no_lp, { importing: true })
      try {
        await migrasiApi.import(rs.data.payload)
        updateRow(rs.data.no_lp, { importing: false, imported: true })
        ok++
      } catch {
        updateRow(rs.data.no_lp, { importing: false })
        failedList.push(rs.data.no_lp)
        fail++
      }
    }
    setSyncingAll(false)
    if (ok > 0 && fail === 0) {
      success(`Sinkronisasi selesai: ${ok} laporan berhasil masuk database.`)
    } else if (ok > 0 && fail > 0) {
      success(`${ok} laporan berhasil diimpor.`)
      showError(`${fail} laporan gagal: LP ${failedList.slice(0, 5).join(', ')}${failedList.length > 5 ? ', ...' : ''}. Cek status barisnya.`)
    } else {
      showError(`Semua ${fail} laporan gagal diimpor. Periksa koneksi atau status tiap baris.`)
    }
  }

  const counts = rows.reduce(
    (acc, r) => {
      if (r.imported) acc.imported++
      else acc[r.data.status]++
      return acc
    },
    { VALID: 0, INVALID_MASTER: 0, DUPLICATE: 0, imported: 0 }
  )
  const validPending = rows.filter((r) => r.data.status === 'VALID' && !r.imported).length

  // Sheet dianggap "tersinkron penuh" bila data sudah dimuat, ada baris,
  // dan tidak ada lagi baris VALID yang menunggu diimpor.
  const allSynced = loaded && rows.length > 0 && validPending === 0 && counts.imported > 0

  // Terapkan filter status pada daftar yang ditampilkan
  const visibleRows = rows.filter((r) => {
    if (statusFilter === 'ALL') return true
    if (statusFilter === 'IMPORTED') return r.imported
    return !r.imported && r.data.status === statusFilter
  })

  return (
    <AuthGuard adminOnly>
      <SILakaShell title="Migrasi Data" eyebrow="Administrasi">
        <PageHeader />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5 flex-wrap">
          <div className="relative">
            <select
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              disabled={loading || syncingAll}
              className="appearance-none rounded-lg border border-border/80 bg-card pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors disabled:opacity-50"
            >
              {SHEET_OPTIONS.map((s) => (
                <option key={s} value={s}>Sheet / Polres {s}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {allSynced && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CheckCircle2 size={12} /> SYNCED
            </span>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Baris</label>
            <input
              type="number"
              min={1}
              value={startRow}
              onChange={(e) => setStartRow(e.target.value)}
              disabled={loading || syncingAll}
              className="w-20 rounded-lg border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors disabled:opacity-50"
              placeholder="Awal"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="number"
              min={1}
              value={endRow}
              onChange={(e) => setEndRow(e.target.value)}
              disabled={loading || syncingAll}
              className="w-20 rounded-lg border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-colors disabled:opacity-50"
              placeholder="Akhir"
            />
          </div>

          <button
            onClick={fetchSheet}
            disabled={loading || syncingAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh Data
          </button>

          <button
            onClick={() => setConfirmSync(true)}
            disabled={loading || syncingAll || validPending === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 sm:ml-auto"
          >
            {syncingAll ? <Loader2 size={15} className="animate-spin" /> : <DatabaseZap size={15} />}
            Sync All Valid ({validPending})
          </button>
        </div>

        {/* Konfirmasi Sync All */}
        {confirmSync && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmSync(false)}>
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <DatabaseZap size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold">Konfirmasi Sinkronisasi</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Anda akan memasukkan <span className="font-semibold text-foreground">{validPending} laporan</span> berstatus &quot;Siap Insert&quot; ke database secara permanen.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 rounded-lg bg-muted/40 p-3 text-[13px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  Hanya baris hijau (Siap Insert) yang diproses. Baris kuning &amp; merah dilewati.
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                  Data yang sudah masuk tidak bisa dibatalkan dari sini. Pastikan koreksi sudah benar.
                </li>
              </ul>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmSync(false)}
                  className="rounded-lg border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSyncAll}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <DatabaseZap size={15} />
                  Ya, Impor {validPending} Laporan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Polres terdeteksi */}
        {loaded && !loading && rows.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
            <MapPin size={15} className="shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              Terdeteksi:{' '}
              {detectedPolres ? (
                <span className="font-semibold text-primary">{detectedPolres}</span>
              ) : (
                <span className="font-semibold text-amber-600">Tidak terdeteksi — periksa data</span>
              )}
            </p>
          </div>
        )}

        {/* Summary */}
        {loaded && !loading && rows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <SummaryCard label="Siap Insert" value={counts.VALID} tone="emerald" active={statusFilter === 'VALID'} onClick={() => setStatusFilter(statusFilter === 'VALID' ? 'ALL' : 'VALID')} />
            <SummaryCard label="Tidak Cocok" value={counts.INVALID_MASTER} tone="amber" active={statusFilter === 'INVALID_MASTER'} onClick={() => setStatusFilter(statusFilter === 'INVALID_MASTER' ? 'ALL' : 'INVALID_MASTER')} />
            <SummaryCard label="Duplikat" value={counts.DUPLICATE} tone="rose" active={statusFilter === 'DUPLICATE'} onClick={() => setStatusFilter(statusFilter === 'DUPLICATE' ? 'ALL' : 'DUPLICATE')} />
            <SummaryCard label="Terimpor" value={counts.imported} tone="primary" active={statusFilter === 'IMPORTED'} onClick={() => setStatusFilter(statusFilter === 'IMPORTED' ? 'ALL' : 'IMPORTED')} />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Menarik data dari Google Sheets...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={36} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && loaded && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileSpreadsheet size={36} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Tidak ada data pada sheet ini.</p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-auto rounded-xl border border-border/60 bg-card max-h-[calc(100vh-330px)]">
            <table className="w-full text-[13px] border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/70 border-b border-border/40">
                <tr>
                  <th className="px-2 py-2.5 w-8"></th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider w-10">#</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider whitespace-nowrap">No LP</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider">Tgl Laka</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider">Kecamatan</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider">Kelurahan</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider text-center">Korban</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left font-bold text-[11px] tracking-wider w-[200px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Tidak ada baris dengan status ini.
                    </td>
                  </tr>
                )}
                {visibleRows.map((rs, idx) => {
                  const r = rs.data
                  const meta = rs.imported
                    ? { label: 'Terimpor', row: 'bg-primary/5 hover:bg-primary/10', badge: 'bg-primary/15 text-primary', icon: CheckCircle2 }
                    : STATUS_META[r.status]
                  const StatusIcon = meta.icon
                  const isOpen = expanded === r.no_lp
                  return (
                    <React.Fragment key={r.no_lp}>
                    <tr className={`border-t border-border/40 transition-colors ${meta.row}`}>
                      <td className="px-2 py-2.5 align-top">
                        <button
                          onClick={() => setExpanded(isOpen ? null : r.no_lp)}
                          className="flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors"
                          aria-label="Lihat detail"
                        >
                          <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground align-top">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap align-top">{r.no_lp}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">{r.payload.tanggal_laka || <span className="text-rose-500">— kosong —</span>}</td>
                      <td className="px-3 py-2.5 align-top">
                        {r.raw.kecamatan || '-'}
                        {!r.payload.kecamatan_id && r.raw.kecamatan && (
                          <span className="block text-[11px] text-amber-600">tidak match master</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        {r.raw.kelurahan || '-'}
                        {!r.payload.kelurahan_id && r.raw.kelurahan && (
                          <span className="block text-[11px] text-amber-600">tidak match master</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center align-top">{r.payload.korban.length}</td>
                      <td className="px-3 py-2.5 align-top">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
                          <StatusIcon size={12} />
                          {meta.label}
                        </span>
                        {rs.edited && !rs.imported && (
                          <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            <Pencil size={9} /> diedit
                          </span>
                        )}
                        {(r.missing_fields.length > 0 || r.issues.length > 0) && !rs.imported && (
                          <div className="mt-1 space-y-0.5">
                            {r.missing_fields.length > 0 && (
                              <p className="text-[11px] text-rose-600">
                                Kosong: {r.missing_fields.map((f) => FIELD_LABEL[f] || f).join(', ')}
                              </p>
                            )}
                            {r.issues.map((iss, i) => (
                              <p key={i} className="text-[11px] text-amber-600">
                                {FIELD_LABEL[iss.field] || iss.field}: &quot;{iss.value}&quot; tidak ditemukan
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCheck(rs)}
                            disabled={rs.checking || rs.importing || rs.imported || syncingAll}
                            className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1.5 text-[12px] font-semibold hover:bg-muted transition-colors disabled:opacity-40"
                          >
                            {rs.checking ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                            Check
                          </button>
                          <button
                            onClick={() => handleImport(rs)}
                            disabled={rs.importing || rs.imported || syncingAll || r.status !== 'VALID'}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                          >
                            {rs.importing ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                            {rs.imported ? 'Tersimpan' : 'Add to DB'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-border/40 bg-muted/20">
                        <td colSpan={9} className="px-4 py-4">
                          <RowDetail row={r} masters={masters} detectedPolresId={detectedPolresId} detectedWilayahId={detectedWilayahId} onEdit={(mutate) => applyEdit(rs, mutate)} />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SILakaShell>
    </AuthGuard>
  )
}

function SummaryCard({ label, value, tone, active, onClick }: { label: string; value: number; tone: 'emerald' | 'amber' | 'rose' | 'primary'; active?: boolean; onClick?: () => void }) {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    primary: 'text-primary',
  }
  const ring = {
    emerald: 'ring-emerald-500/40',
    amber: 'ring-amber-500/40',
    rose: 'ring-rose-500/40',
    primary: 'ring-primary/40',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-card p-4 shadow-xs text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer
        ${active ? `ring-2 ${ring[tone]} border-transparent` : ''}`}
    >
      <p className="text-xs font-medium text-muted-foreground flex items-center justify-between">
        {label}
        {active && <span className="text-[10px] font-semibold text-muted-foreground/70">difilter</span>}
      </p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${colors[tone]}`}>{value}</p>
    </button>
  )
}

function DetailField({ label, value, invalid, warnEmpty }: { label: string; value?: string | number | null; invalid?: boolean; warnEmpty?: boolean }) {
  const isEmpty = value === null || value === undefined || value === ''
  const display = isEmpty ? '—' : String(value)
  const showWarn = warnEmpty && isEmpty && !invalid
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1">
        {label}
        {showWarn && <AlertTriangle size={11} className="text-amber-500" />}
      </p>
      <p className={`mt-0.5 text-[13px] ${invalid ? 'text-rose-600 font-medium' : showWarn ? 'text-amber-600' : display === '—' ? 'text-muted-foreground' : 'text-foreground'}`}>
        {display}
        {invalid && <span className="ml-1 text-[11px] font-normal text-amber-600">(belum terpetakan)</span>}
        {showWarn && <span className="ml-1 text-[11px] font-normal text-amber-600">(masih kosong — opsional)</span>}
      </p>
    </div>
  )
}

// Field master yang bisa dikoreksi lewat dropdown.
// - invalid (border kuning + teks merah): teks sheet ada tapi tidak match master.
// - kosong (border kuning muda): belum dipilih, boleh diisi (opsional).
// - terisi (teks hijau "Match").
function EditableMasterField({
  label, currentId, currentName, sheetText, options, invalid, onChange, disabled,
}: {
  label: string
  currentId: number | null
  currentName?: string | null
  sheetText?: string
  options: MasterItem[]
  invalid?: boolean
  onChange: (id: number | null) => void
  disabled?: boolean
}) {
  const isEmpty = !currentId && !invalid
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1">
        {label}
        {(invalid || isEmpty) && <AlertTriangle size={11} className="text-amber-500" />}
      </p>
      {invalid && sheetText && (
        <p className="mt-0.5 text-[11px] text-amber-600">Data sheet &quot;{sheetText}&quot; tidak ada di master. Pilih yang sesuai:</p>
      )}
      <div className="mt-1">
        <SearchableSelect
          options={options}
          value={currentId}
          onChange={onChange}
          disabled={disabled}
          invalid={invalid || isEmpty}
          placeholder="— Pilih —"
        />
      </div>
      {!invalid && currentName && (
        <p className="mt-0.5 text-[11px] text-emerald-600">Match: {currentName}</p>
      )}
      {isEmpty && (
        <p className="mt-0.5 text-[11px] text-amber-600">Masih kosong — bisa diisi (opsional)</p>
      )}
    </div>
  )
}

function RowDetail({ row, masters, detectedPolresId, detectedWilayahId, onEdit }: {
  row: MigrasiRow
  masters: MigrasiMasters | null
  detectedPolresId: number | null
  detectedWilayahId: number | null
  onEdit: (mutate: (p: MigrasiPayload) => void) => void
}) {
  const { raw, payload } = row
  const labels = payload.labels
  const mapValue = (id: number | null, nama?: string | null, sheetText?: string) => {
    if (id != null) return nama || `#${id}`
    if (sheetText) return `${sheetText} (belum terpetakan)`
    return null
  }

  // Opsi kelurahan dimuat sesuai kecamatan terpilih
  const [kelurahanOpts, setKelurahanOpts] = React.useState<MasterItem[]>([])
  const [loadingKel, setLoadingKel] = React.useState(false)

  React.useEffect(() => {
    let active = true
    if (!payload.kecamatan_id) {
      setKelurahanOpts([])
      return
    }
    setLoadingKel(true)
    masterApi.kelurahan(payload.kecamatan_id)
      .then((res) => { if (active) setKelurahanOpts(res.data.data || []) })
      .catch(() => { if (active) setKelurahanOpts([]) })
      .finally(() => { if (active) setLoadingKel(false) })
    return () => { active = false }
  }, [payload.kecamatan_id])

  // Dropdown kecamatan DIKUNCI ke polres yang terdeteksi (1 sheet = 1 polres).
  // Jadi tidak muncul kecamatan dari polres lain (mis. Semarang di sheet Magelang).
  const allKecamatan = masters?.kecamatan ?? []
  const kecamatanOptions = detectedPolresId
    ? allKecamatan.filter((k) => k.polres_id === detectedPolresId)
    : allKecamatan

  // Dropdown RS dikunci ke wilayah polres sheet (RS berelasi ke wilayah).
  const allRumahSakit = masters?.rumahSakit ?? []
  const rumahSakitOptions = detectedWilayahId
    ? allRumahSakit.filter((rs) => rs.wilayah_id === detectedWilayahId)
    : allRumahSakit
  const setKecamatan = (id: number | null) => {
    onEdit((p) => {
      p.kecamatan_id = id
      // Reset kelurahan karena daftar kelurahan bergantung kecamatan
      p.kelurahan_id = null
      if (p.labels) p.labels.kelurahan = null
      const kec = kecamatanOptions.find((k) => k.id === id)
      if (kec) {
        if (kec.polres_id) {
          p.polres_id = kec.polres_id
          const pol = masters?.polres.find((x) => x.id === kec.polres_id)
          if (p.labels) p.labels.polres = pol?.nama ?? null
        }
        if (p.labels) p.labels.kecamatan = kec.nama
      } else if (p.labels) {
        p.labels.kecamatan = null
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Data Laporan */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-foreground">
          <FileText size={14} className="text-primary" /> Data Laporan
          {!masters && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
          <DetailField label="No LP" value={payload.no_lp} />
          <DetailField label="Tanggal Laka" value={payload.tanggal_laka} invalid={!payload.tanggal_laka} />
          <DetailField label="Tanggal LP" value={payload.tanggal_lp} invalid={!payload.tanggal_lp} />
          <DetailField label="Hari Kejadian" value={payload.hari_kejadian} invalid={!payload.hari_kejadian} />

          {/* Kecamatan — editable (menentukan polres) */}
          {masters ? (
            <EditableMasterField
              label="Kecamatan"
              currentId={payload.kecamatan_id}
              currentName={labels?.kecamatan}
              sheetText={raw.kecamatan}
              options={kecamatanOptions}
              invalid={!payload.kecamatan_id}
              onChange={setKecamatan}
            />
          ) : (
            <DetailField label="Kecamatan" value={mapValue(payload.kecamatan_id, labels?.kecamatan, raw.kecamatan)} invalid={!payload.kecamatan_id} />
          )}

          {/* Polres — otomatis mengikuti kecamatan */}
          <DetailField label="Polres (otomatis dari kecamatan)" value={labels?.polres} invalid={!payload.polres_id} />

          {/* Kelurahan — editable, opsi bergantung kecamatan terpilih */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1">
              Kelurahan
              {!payload.kelurahan_id && <AlertTriangle size={11} className="text-amber-500" />}
              {loadingKel && <Loader2 size={10} className="animate-spin text-muted-foreground" />}
            </p>
            {!payload.kelurahan_id && raw.kelurahan && (
              <p className="mt-0.5 text-[11px] text-amber-600">Data sheet &quot;{raw.kelurahan}&quot; tidak ada di master. Pilih yang sesuai:</p>
            )}
            <div className="mt-1">
              <SearchableSelect
                options={kelurahanOpts}
                value={payload.kelurahan_id}
                disabled={!payload.kecamatan_id || loadingKel}
                invalid={!payload.kelurahan_id}
                placeholder={payload.kecamatan_id ? '— Pilih —' : 'Pilih kecamatan dahulu'}
                clearable={false}
                onChange={(id) => {
                  onEdit((p) => {
                    p.kelurahan_id = id
                    const kel = kelurahanOpts.find((x) => x.id === id)
                    if (p.labels) p.labels.kelurahan = kel?.nama ?? null
                  })
                }}
              />
            </div>
            {payload.kelurahan_id && labels?.kelurahan && (
              <p className="mt-0.5 text-[11px] text-emerald-600">
                Match: {labels.kelurahan}
                {labels?.kelurahan_from_lokasi && (
                  <span className="ml-1 text-sky-600">(dideteksi dari Lokasi Laka — mohon dicek)</span>
                )}
              </p>
            )}
          </div>

          <DetailField label="Lokasi Laka" value={payload.lokasi_laka} warnEmpty />

          <DetailField label="Laka Tunggal" value={payload.laka_tunggal ? 'Ya' : 'Tidak'} />

          {/* Kasus Tabrakan — editable */}
          {masters ? (
            <EditableMasterField
              label="Kasus Tabrakan"
              currentId={payload.kasus_tabrak_kecelakaan_id}
              currentName={labels?.kasus_tabrak_kecelakaan}
              sheetText={raw.kasus_tabrakan}
              options={masters.kasusTabrak}
              invalid={!!raw.kasus_tabrakan && !payload.kasus_tabrak_kecelakaan_id}
              onChange={(id) => onEdit((p) => {
                p.kasus_tabrak_kecelakaan_id = id
                const it = masters.kasusTabrak.find((x) => x.id === id)
                if (p.labels) p.labels.kasus_tabrak_kecelakaan = it?.nama ?? null
              })}
            />
          ) : (
            <DetailField label="Kasus Tabrakan" value={mapValue(payload.kasus_tabrak_kecelakaan_id, labels?.kasus_tabrak_kecelakaan, raw.kasus_tabrakan)} invalid={!!raw.kasus_tabrakan && !payload.kasus_tabrak_kecelakaan_id} />
          )}

          {/* Faktor Penyebab — editable */}
          {masters ? (
            <EditableMasterField
              label="Faktor Penyebab"
              currentId={payload.faktor_penyebab_laka_id}
              currentName={labels?.faktor_penyebab_laka}
              sheetText={raw.faktor_penyebab}
              options={masters.faktorPenyebab}
              invalid={!!raw.faktor_penyebab && !payload.faktor_penyebab_laka_id}
              onChange={(id) => onEdit((p) => {
                p.faktor_penyebab_laka_id = id
                const it = masters.faktorPenyebab.find((x) => x.id === id)
                if (p.labels) p.labels.faktor_penyebab_laka = it?.nama ?? null
              })}
            />
          ) : (
            <DetailField label="Faktor Penyebab" value={mapValue(payload.faktor_penyebab_laka_id, labels?.faktor_penyebab_laka, raw.faktor_penyebab)} invalid={!!raw.faktor_penyebab && !payload.faktor_penyebab_laka_id} />
          )}

          {/* Sifat Laka — editable */}
          {masters ? (
            <EditableMasterField
              label="Sifat Laka"
              currentId={payload.sifat_laka_id}
              currentName={labels?.sifat_laka}
              sheetText={raw.sifat_laka}
              options={masters.sifatLaka}
              invalid={!!raw.sifat_laka && !payload.sifat_laka_id}
              onChange={(id) => onEdit((p) => {
                p.sifat_laka_id = id
                const it = masters.sifatLaka.find((x) => x.id === id)
                if (p.labels) p.labels.sifat_laka = it?.nama ?? null
              })}
            />
          ) : (
            <DetailField label="Sifat Laka" value={mapValue(payload.sifat_laka_id, labels?.sifat_laka, raw.sifat_laka)} invalid={!!raw.sifat_laka && !payload.sifat_laka_id} />
          )}

          <DetailField label="Keterangan" value={payload.keterangan} warnEmpty />
        </div>
      </div>

      {/* Kendaraan */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-foreground">
          <Car size={14} className="text-primary" /> Kendaraan ({payload.kendaraan.length})
        </p>
        {payload.kendaraan.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Tidak ada data kendaraan.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground/70 border-b border-border/40">
                  <th className="py-1.5 pr-3 font-semibold">Peran</th>
                  <th className="py-1.5 pr-3 font-semibold">Jenis Kendaraan</th>
                  <th className="py-1.5 pr-3 font-semibold">Nopol</th>
                  <th className="py-1.5 pr-3 font-semibold">Masa Laku SW</th>
                </tr>
              </thead>
              <tbody>
                {payload.kendaraan.map((k, i) => {
                  const hasNopol = !!(k.nopol && String(k.nopol).trim())
                  const willSkip = !k.jenis_kendaraan_id || !hasNopol
                  return (
                  <tr key={i} className="border-b border-border/20 last:border-0">
                    <td className="py-1.5 pr-3 capitalize">
                      {k.peran}
                      {willSkip && (
                        <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-px text-[9px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          dilewati
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-3">
                      {masters ? (
                        <div className="min-w-[160px]">
                          <SearchableSelect
                            options={masters.jenisKendaraan}
                            value={k.jenis_kendaraan_id}
                            invalid={hasNopol && !k.jenis_kendaraan_id}
                            clearable={false}
                            placeholder="— Pilih —"
                            onChange={(id) => {
                              onEdit((p) => {
                                const item = masters.jenisKendaraan.find((x) => x.id === id)
                                p.kendaraan[i].jenis_kendaraan_id = id
                                p.kendaraan[i].jenis_kendaraan_nama = item?.nama ?? null
                              })
                            }}
                          />
                        </div>
                      ) : (
                        <span className={k.jenis_kendaraan_id ? '' : 'text-amber-600'}>
                          {k.jenis_kendaraan_id ? (k.jenis_kendaraan_nama || `#${k.jenis_kendaraan_id}`) : 'belum terpetakan'}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-3">{k.nopol || <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-1.5 pr-3">{k.masa_laku_sw || '—'}</td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Kendaraan tanpa nopol atau jenis kendaraan akan otomatis dilewati saat import (tidak disimpan).
            </p>
          </div>
        )}
      </div>

      {/* Korban */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-foreground">
          <UsersIcon size={14} className="text-primary" /> Korban ({payload.korban.length})
        </p>
        {payload.korban.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Tidak ada data korban.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground/70 border-b border-border/40">
                  <th className="py-1.5 pr-3 font-semibold">Nama</th>
                  <th className="py-1.5 pr-3 font-semibold">Usia</th>
                  <th className="py-1.5 pr-3 font-semibold">Profesi</th>
                  <th className="py-1.5 pr-3 font-semibold">Cidera</th>
                  <th className="py-1.5 pr-3 font-semibold">Tindak Lanjut</th>
                  <th className="py-1.5 pr-3 font-semibold">Jenis Jaminan</th>
                  <th className="py-1.5 pr-3 font-semibold">Keterjaminan</th>
                  <th className="py-1.5 pr-3 font-semibold">Rumah Sakit</th>
                  <th className="py-1.5 pr-3 font-semibold">Kendaraan</th>
                </tr>
              </thead>
              <tbody>
                {payload.korban.map((k, i) => (
                  <tr key={i} className="border-b border-border/20 last:border-0 align-top">
                    <td className="py-2 pr-3 font-medium">{k.nama || '—'}</td>
                    <td className="py-2 pr-3">{k.usia ?? '—'}</td>

                    {/* Profesi — editable */}
                    <td className="py-2 pr-3 min-w-[150px]">
                      {masters ? (
                        <SearchableSelect
                          options={masters.profesi}
                          value={k.profesi_id ?? null}
                          placeholder="— Pilih —"
                          onChange={(id) => onEdit((p) => {
                            const item = masters.profesi.find((x) => x.id === id)
                            p.korban[i].profesi_id = id
                            p.korban[i].profesi_nama = item?.nama ?? null
                          })}
                        />
                      ) : (
                        k.profesi_id ? (k.profesi_nama || `#${k.profesi_id}`) : '—'
                      )}
                    </td>

                    {/* Cidera — editable */}
                    <td className="py-2 pr-3 min-w-[130px]">
                      {masters ? (
                        <SearchableSelect
                          options={masters.cidera}
                          value={k.cidera_id ?? null}
                          placeholder="— Pilih —"
                          onChange={(id) => onEdit((p) => {
                            const item = masters.cidera.find((x) => x.id === id)
                            p.korban[i].cidera_id = id
                            p.korban[i].cidera_nama = item?.nama ?? null
                          })}
                        />
                      ) : (
                        k.cidera_id ? (k.cidera_nama || `#${k.cidera_id}`) : '—'
                      )}
                    </td>

                    {/* Tindak Lanjut — editable */}
                    <td className="py-2 pr-3 min-w-[140px]">
                      {masters ? (
                        <SearchableSelect
                          options={masters.tindakLanjut}
                          value={k.tindak_lanjut_id ?? null}
                          placeholder="— Pilih —"
                          onChange={(id) => onEdit((p) => {
                            const item = masters.tindakLanjut.find((x) => x.id === id)
                            p.korban[i].tindak_lanjut_id = id
                            p.korban[i].tindak_lanjut_nama = item?.nama ?? null
                          })}
                        />
                      ) : (
                        k.tindak_lanjut_id ? (k.tindak_lanjut_nama || `#${k.tindak_lanjut_id}`) : '—'
                      )}
                    </td>

                    {/* Jenis Jaminan — editable */}
                    <td className="py-2 pr-3 min-w-[150px]">
                      {masters ? (
                        <SearchableSelect
                          options={masters.jenisJaminan}
                          value={k.jenis_jaminan_id ?? null}
                          placeholder="— Pilih —"
                          onChange={(id) => onEdit((p) => {
                            const item = masters.jenisJaminan.find((x) => x.id === id)
                            p.korban[i].jenis_jaminan_id = id
                            p.korban[i].jenis_jaminan_nama = item?.nama ?? null
                          })}
                        />
                      ) : (
                        k.jenis_jaminan_id ? (k.jenis_jaminan_nama || `#${k.jenis_jaminan_id}`) : '—'
                      )}
                    </td>

                    {/* Keterjaminan — editable */}
                    <td className="py-2 pr-3 min-w-[140px]">
                      {masters ? (
                        <SearchableSelect
                          options={masters.keterjaminan}
                          value={k.keterjaminan_id ?? null}
                          placeholder="— Pilih —"
                          onChange={(id) => onEdit((p) => {
                            const item = masters.keterjaminan.find((x) => x.id === id)
                            p.korban[i].keterjaminan_id = id
                            p.korban[i].keterjaminan_nama = item?.nama ?? null
                          })}
                        />
                      ) : (
                        k.keterjaminan_id ? (k.keterjaminan_nama || `#${k.keterjaminan_id}`) : '—'
                      )}
                    </td>

                    <td className="py-2 pr-3">
                      {k.kendaraan_index != null && payload.kendaraan[k.kendaraan_index]
                        ? (payload.kendaraan[k.kendaraan_index].nopol || `#${k.kendaraan_index}`)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
