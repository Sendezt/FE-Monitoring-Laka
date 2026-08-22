'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, AlertCircle, Filter } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader } from '@/components/si-laka-shell'
import { activityLogApi, type ActivityLog } from '@/lib/api'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/components/ui/toast-provider'

const AKSI_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-destructive/10 text-destructive',
  LOGIN: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

function formatWaktu(s: string) {
  return new Date(s).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export function ActivityLogPage() {
  const { error: showError } = useToast()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 })
  const [filters, setFilters] = useState({ tabel: '', from: '', to: '' })

  const fetchLogs = useCallback(() => {
    setLoading(true)
    activityLogApi.list({ ...filters, page, limit: 20 })
      .then((res) => {
        setLogs(res.data.data || [])
        setMeta(res.data.meta)
      })
      .catch(() => showError('Gagal memuat log aktivitas.'))
      .finally(() => setLoading(false))
  }, [filters, page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <AuthGuard adminOnly>
      <SILakaShell title="Log Aktivitas" eyebrow="Administrasi">
        <PageHeader
          title="Log Aktivitas"
        />

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter size={13} />
            <span className="font-semibold uppercase tracking-wide">Filter:</span>
          </div>
          <select
            value={filters.tabel}
            onChange={(e) => { setFilters({ ...filters, tabel: e.target.value }); setPage(1) }}
            className="rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="">Semua Tabel</option>
            <option value="laporan_polisi">Laporan Polisi</option>
            <option value="kendaraan">Kendaraan</option>
            <option value="korban">Korban</option>
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => { setFilters({ ...filters, from: e.target.value }); setPage(1) }}
            className="rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <span className="text-xs text-muted-foreground">s/d</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => { setFilters({ ...filters, to: e.target.value }); setPage(1) }}
            className="rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {(filters.tabel || filters.from || filters.to) && (
            <button
              onClick={() => { setFilters({ tabel: '', from: '', to: '' }); setPage(1) }}
              className="text-xs text-destructive hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{meta.total} entri</span>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground text-sm">
              <Loader2 size={18} className="animate-spin" /> Memuat log...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <AlertCircle size={28} className="text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Tidak ada log aktivitas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs text-muted-foreground border-b">
                    <th className="px-5 py-3 text-left font-semibold">Waktu</th>
                    <th className="px-5 py-3 text-left font-semibold">Aksi</th>
                    <th className="px-5 py-3 text-left font-semibold">Deskripsi</th>
                    <th className="px-5 py-3 text-left font-semibold">Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} className={`border-t hover:bg-muted/10 transition-colors ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatWaktu(log.waktu)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${AKSI_COLORS[log.aksi] ?? 'bg-muted text-muted-foreground'}`}>
                          {log.aksi}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-foreground font-medium max-w-sm">
                        {log.deskripsi || `${log.aksi === 'CREATE' ? 'Membuat' : log.aksi === 'UPDATE' ? 'Memperbarui' : log.aksi === 'DELETE' ? 'Menghapus' : log.aksi} data ${log.tabel.replace(/_/g, ' ')} #${log.record_id}`}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <p className="font-semibold">{log.user?.nama_lengkap || 'System'}</p>
                        <p className="text-muted-foreground">@{log.user?.username || 'system'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.total_pages > 0 && (
            <Pagination
              currentPage={page}
              totalPages={meta.total_pages}
              totalItems={meta.total}
              itemsPerPage={20}
              onPageChange={setPage}
            />
          )}
        </div>
      </SILakaShell>
    </AuthGuard>
  )
}
