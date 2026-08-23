'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FilePlus2, Search, Trash2, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Button, PageHeader, SILakaShell } from '@/components/si-laka-shell'
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { laporanApi, exportApi, type LaporanPolisi } from '@/lib/api'
import { useMasterList } from '@/lib/hooks/use-master-data'
import { useAuthStore } from '@/lib/auth-store'
import { useRoleBase } from '@/lib/role-base'
import { useToast } from '@/components/ui/toast-provider'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function LaporanPolisiListPage() {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'
  const base = useRoleBase()

  const [search, setSearch] = useState('')
  const [polresFilter, setPolresFilter] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')
  const [exportPolres, setExportPolres] = useState('')

  // Daftar polres = master data, di-cache 30 menit.
  const polresList = useMasterList('polres', { limit: 100 }).data ?? []

  const handleExport = async () => {
    if (exportFrom && exportTo && exportFrom > exportTo) {
      showError('Tanggal awal tidak boleh lebih besar dari tanggal akhir.')
      return
    }
    setExporting(true)
    try {
      await exportApi.laporanPolisi({
        from: exportFrom || undefined,
        to: exportTo || undefined,
        polres_id: exportPolres || undefined,
      })
      success('File laporan polisi berhasil diunduh.')
      setShowExportDialog(false)
    } catch {
      showError('Gagal mengekspor laporan polisi.')
    } finally {
      setExporting(false)
    }
  }

  // State pagination & sorting
  const [page, setPage] = useState(1)
  const limit = 10

  const [sortField, setSortField] = useState<'no_lp' | 'tanggal_lp' | 'tanggal_laka'>('tanggal_laka')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

  // Debounce nilai search agar tidak query tiap ketikan.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Reset ke halaman 1 saat filter/pencarian/sorting berubah.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, polresFilter, sortField, sortOrder])

  // Daftar laporan (transaksional) — di-cache 60 detik. keepPreviousData menjaga
  // data lama tetap tampil saat pindah halaman/filter sehingga tidak berkedip.
  const listParams = {
    page,
    limit,
    sort_by: sortField,
    sort_dir: sortOrder,
    ...(debouncedSearch.trim() ? { no_lp: debouncedSearch.trim() } : {}),
    ...(polresFilter ? { polres_id: polresFilter } : {}),
  }

  const { data: listData, isLoading: loading, isError } = useQuery({
    queryKey: ['laporan', 'list', listParams],
    queryFn: async () => {
      const res = await laporanApi.list(listParams as any)
      return res.data
    },
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (isError) showError('Gagal memuat daftar laporan.')
  }, [isError, showError])

  const laporan: LaporanPolisi[] = listData?.data || []
  const totalPages = listData?.meta?.total_pages || 1
  const totalItems = listData?.meta?.total || 0

  const toggleSort = (field: 'no_lp' | 'tanggal_lp') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortField(field)
      setSortOrder('ASC')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-muted-foreground/40" />
    return sortOrder === 'ASC' ? <ArrowUpAZ size={14} className="text-primary" /> : <ArrowDownAZ size={14} className="text-primary" />
  }

  const handleDelete = async (id: number, noLp: string) => {
    if (!confirm(`Hapus laporan ${noLp}? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(id)
    try {
      await laporanApi.delete(id)
      success(`Laporan ${noLp} berhasil dihapus.`)
      // Refresh daftar laporan (semua halaman/filter) via invalidate.
      queryClient.invalidateQueries({ queryKey: ['laporan'] })
    } catch {
      showError('Gagal menghapus laporan. Coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <SILakaShell title="Daftar Laporan" eyebrow="Laporan Polisi">
      {/* Search & Actions */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nomor LP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <select
          value={polresFilter}
          onChange={(e) => setPolresFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="">Semua Polres</option>
          {polresList.map((p) => (
            <option key={p.id} value={p.id}>{p.nama}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          {loading ? 'Memuat...' : `${totalItems} laporan`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { setExportPolres(polresFilter); setShowExportDialog(true) }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            Export
          </button>
          <Link href={`${base}/laporan-polisi/tambah`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <FilePlus2 size={15} />
            Tambah Laporan Baru
          </Link>
        </div>
      </div>

      {/* Dialog filter export */}
      {showExportDialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => !exporting && setShowExportDialog(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Download size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold">Export Laporan ke Excel</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pilih rentang periode (berdasarkan Tanggal LP) dan Polres. Kosongkan tanggal untuk mengekspor semua data.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-foreground/80">Tanggal Awal (LP)</span>
                  <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-foreground/80">Tanggal Akhir (LP)</span>
                  <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                </label>
              </div>
              {isAdmin && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-foreground/80">Polres</span>
                  <select value={exportPolres} onChange={(e) => setExportPolres(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                    <option value="">Semua Polres</option>
                    {polresList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowExportDialog(false)} disabled={exporting}
                className="rounded-lg border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleExport} disabled={exporting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Export XLSX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
            <Loader2 size={18} className="animate-spin" />
            Memuat data...
          </div>
        ) : laporan.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle size={28} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Tidak ada hasil untuk pencarian ini.' : 'Belum ada laporan yang tercatat.'}
            </p>
            {!search && (
              <Link href={`${base}/laporan-polisi/tambah`} className="text-xs font-semibold text-primary hover:underline">
                + Buat laporan pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs text-muted-foreground border-b">
                    <th className="px-5 py-3 text-left font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort('no_lp')}>
                      <div className="flex items-center gap-1.5">No. LP <SortIcon field="no_lp" /></div>
                    </th>
                    <th className="px-5 py-3 text-left font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSort('tanggal_lp')}>
                      <div className="flex items-center gap-1.5">Tanggal LP <SortIcon field="tanggal_lp" /></div>
                    </th>
                    <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Lokasi</th>
                    <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Kendaraan</th>
                    <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Korban</th>
                    <th className="px-5 py-3 text-left font-semibold">Jenis</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.map((l, i) => (
                    <tr key={l.id} className={`border-t hover:bg-muted/10 transition-colors ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-semibold text-primary">{l.no_lp}</span>
                        {l.polres?.nama && (
                          <span className="block text-[10px] font-medium text-muted-foreground mt-0.5">{l.polres.nama}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(l.tanggal_lp)}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{l.lokasi_laka}</td>
                      <td className="px-5 py-3 text-xs hidden sm:table-cell">{l.kendaraan?.length ?? 0} unit</td>
                      <td className="px-5 py-3 text-xs hidden sm:table-cell">{l.korban?.length ?? 0} orang</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.laka_tunggal ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {l.laka_tunggal ? 'Tunggal' : 'Multi'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`${base}/laporan-polisi/${l.id}`}
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                          >
                            <Eye size={12} /> Detail
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(l.id, l.no_lp)}
                              disabled={deletingId === l.id}
                              className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === l.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={12} />}
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </SILakaShell>
  )
}