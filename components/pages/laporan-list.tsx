'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FilePlus2, Search, Trash2, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, PageHeader, SILakaShell } from '@/components/si-laka-shell'
import { Pagination } from '@/components/ui/pagination'
import { laporanApi, masterApi, type LaporanPolisi, type MasterItem } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { useRoleBase } from '@/lib/role-base'
import { useToast } from '@/components/ui/toast-provider'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function LaporanPolisiListPage() {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const isAdmin = user?.role === 'admin'
  const base = useRoleBase()

  const [laporan, setLaporan] = useState<LaporanPolisi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [polresFilter, setPolresFilter] = useState('')
  const [polresList, setPolresList] = useState<MasterItem[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  // State untuk pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 10

  const fetchLaporan = (pageNum: number = page, searchQuery: string = search, filterPolres: string = polresFilter) => {
    setLoading(true)
    
    // Build params object
    const params: any = { 
      page: pageNum, 
      limit: limit
    }
    
    // Gunakan parameter 'no_lp' yang sudah didukung backend
    if (searchQuery.trim()) {
      params.no_lp = searchQuery.trim()
    }
    
    if (filterPolres) {
      params.polres_id = filterPolres
    }
    
    laporanApi.list(params)
      .then((res) => {
        setLaporan(res.data.data || [])
        setTotalPages(res.data.meta?.total_pages || 1)
        setTotalItems(res.data.meta?.total || 0)
        setPage(res.data.meta?.page || 1)
      })
      .catch(() => showError('Gagal memuat daftar laporan.'))
      .finally(() => setLoading(false))
  }

  // Initial fetch untuk daftar polres
  useEffect(() => {
    masterApi.polres.list({ limit: 100 })
      .then((res) => setPolresList(res.data.data || []))
      .catch(console.error)
  }, [])

  useEffect(() => { 
    fetchLaporan(1, search, polresFilter) 
  }, [polresFilter])

  // Handle search dengan debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLaporan(1, search, polresFilter)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (id: number, noLp: string) => {
    if (!confirm(`Hapus laporan ${noLp}? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(id)
    try {
      await laporanApi.delete(id)
      success(`Laporan ${noLp} berhasil dihapus.`)
      fetchLaporan(page)
    } catch {
      showError('Gagal menghapus laporan. Coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    fetchLaporan(newPage)
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
        <Link href={`${base}/laporan-polisi/tambah`} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <FilePlus2 size={15} />
          Tambah Laporan Baru
        </Link>
      </div>

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
                    <th className="px-5 py-3 text-left font-semibold">No. LP</th>
                    <th className="px-5 py-3 text-left font-semibold">Tanggal LP</th>
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