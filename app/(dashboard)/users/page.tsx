'use client'

import { useEffect, useState, useMemo } from 'react'
import { Loader2, Users, Plus, AlertCircle, ShieldCheck, ChevronLeft, ChevronRight, Search, Eye, Filter } from 'lucide-react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader, Button } from '@/components/si-laka-shell'
import { usersApi, masterApi, laporanApi, type User, type MasterItem, type LaporanPolisi } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(s?: string) {
  if (!s) return '-'
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const LIMIT_OPTIONS = [10, 25, 50]

// ─── Laporan by Polres Monitor ───────────────────────────────────────────────

function LaporanByPolresMonitor({ laporan, polresList }: { laporan: LaporanPolisi[]; polresList: MasterItem[] }) {
  const [selectedPolresId, setSelectedPolresId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Filter laporan by selected polres + optional search
  const filtered = useMemo(() => {
    let rows = selectedPolresId
      ? laporan.filter((l) => l.polres_id === selectedPolresId)
      : laporan

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (l) =>
          l.no_lp?.toLowerCase().includes(q) ||
          l.lokasi_laka?.toLowerCase().includes(q) ||
          l.kecamatan?.nama?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [laporan, selectedPolresId, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const safeP = Math.min(page, totalPages)
  const paginated = filtered.slice((safeP - 1) * limit, safeP * limit)

  useEffect(() => { setPage(1) }, [selectedPolresId, search, limit])

  const selectedPolresNama = polresList.find((p) => p.id === selectedPolresId)?.nama

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <p className="font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
          <Eye size={15} className="text-primary" />
          Monitor Laporan per Polres
        </p>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Polres selector */}
          <div className="relative flex-1">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={selectedPolresId ?? ''}
              onChange={(e) => setSelectedPolresId(e.target.value ? Number(e.target.value) : null)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer appearance-none transition-all"
            >
              <option value="">Semua Polres</option>
              {polresList.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Cari no. LP / lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="text-sm rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / hal</option>
            ))}
          </select>
        </div>

        {/* Active filter badge */}
        {selectedPolresId && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck size={11} />
              {selectedPolresNama}
              <button
                onClick={() => setSelectedPolresId(null)}
                className="ml-0.5 hover:text-primary/60 transition-colors"
              >
                ×
              </button>
            </span>
            <span className="text-xs text-muted-foreground">{filtered.length} laporan ditemukan</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 text-xs text-muted-foreground border-b">
              <th className="px-4 py-3 text-left font-semibold w-8">No.</th>
              <th className="px-4 py-3 text-left font-semibold">No. LP</th>
              <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Polres</th>
              <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Tanggal Laka</th>
              <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Kecamatan</th>
              <th className="px-4 py-3 text-left font-semibold">Lokasi</th>
              <th className="px-4 py-3 text-center font-semibold hidden md:table-cell">Korban</th>
              <th className="px-4 py-3 text-center font-semibold">Jenis</th>
              <th className="px-4 py-3 text-center font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle size={24} className="opacity-40" />
                    <p className="text-sm">
                      {search || selectedPolresId
                        ? 'Tidak ada laporan yang cocok dengan filter.'
                        : 'Belum ada data laporan.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((l, i) => {
                const no = (safeP - 1) * limit + i + 1
                return (
                  <tr key={l.id} className={`border-t hover:bg-muted/10 transition-colors ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{no}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground">{l.no_lp}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ShieldCheck size={11} className="text-primary/60 shrink-0" />
                        {l.polres?.nama ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {formatDate(l.tanggal_laka)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {l.kecamatan?.nama ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                      {l.lokasi_laka ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className="inline-flex items-center justify-center rounded-full min-w-[1.5rem] h-6 px-1.5 text-[10px] font-bold bg-muted text-muted-foreground">
                        {l.korban?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold
                        ${l.laka_tunggal
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {l.laka_tunggal ? 'Tunggal' : 'Multi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/laporan-polisi/${l.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                      >
                        <Eye size={10} /> Lihat
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-5 py-3 bg-muted/5">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? '0 data'
            : `${(safeP - 1) * limit + 1}–${Math.min(safeP * limit, filtered.length)} dari ${filtered.length} laporan`}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safeP <= 1}
            className="flex size-7 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let p: number
            if (totalPages <= 5) { p = i + 1 }
            else if (safeP <= 3) { p = i + 1 }
            else if (safeP >= totalPages - 2) { p = totalPages - 4 + i }
            else { p = safeP - 2 + i }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex size-7 items-center justify-center rounded-lg text-xs font-semibold transition-colors
                  ${p === safeP
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeP >= totalPages}
            className="flex size-7 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { success, error: showError } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [wilayah, setWilayah] = useState<MasterItem[]>([])
  const [polresList, setPolresList] = useState<MasterItem[]>([])
  const [laporan, setLaporan] = useState<LaporanPolisi[]>([])
  const [loading, setLoading] = useState(true)
  const [laporanLoading, setLaporanLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ username: '', nama_lengkap: '', password: '', role: 'user', wilayah_id: '' })

  const fetchUsers = () => {
    setLoading(true)
    usersApi.list()
      .then((res) => setUsers(res.data.data || []))
      .catch(() => showError('Gagal memuat data pengguna.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
    masterApi.wilayah.list().then((res) => setWilayah(res.data.data || []))
    masterApi.polres.list().then((res) => setPolresList(res.data.data || []))
    laporanApi.list()
      .then((res) => setLaporan(res.data.data || []))
      .catch(() => {})
      .finally(() => setLaporanLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.create({ ...form, wilayah_id: form.wilayah_id ? Number(form.wilayah_id) : null })
      success('Pengguna berhasil ditambahkan.')
      setShowForm(false)
      setForm({ username: '', nama_lengkap: '', password: '', role: 'user', wilayah_id: '' })
      fetchUsers()
    } catch {
      showError('Gagal menambahkan pengguna.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"

  return (
    <AuthGuard adminOnly>
      <SILakaShell title="Pengguna" eyebrow="Administrasi">
        <PageHeader
          title="Pengguna"
          description="Kelola akun pengguna dan pantau laporan per Polres secara langsung."
          action={<Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> Tambah Pengguna</Button>}
        />

        {/* Form Tambah */}
        {showForm && (
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-xs">
            <h3 className="mb-4 font-semibold text-sm flex items-center gap-2">
              <Users size={15} className="text-primary" /> Tambah Pengguna Baru
            </h3>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Username</label>
                <input required className={inputCls} placeholder="user01" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Nama Lengkap</label>
                <input required className={inputCls} placeholder="Budi Santoso" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Password</label>
                <input required type="password" className={inputCls} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Role</label>
                <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, wilayah_id: e.target.value === 'admin' ? '' : form.wilayah_id })}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'user' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Wilayah</label>
                  <select className={inputCls} value={form.wilayah_id} onChange={(e) => setForm({ ...form, wilayah_id: e.target.value })}>
                    <option value="">Pilih wilayah</option>
                    {wilayah.map((w) => <option key={w.id} value={w.id}>{w.nama}</option>)}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 cursor-pointer flex items-center gap-2 transition-colors">
                  {saving && <Loader2 size={13} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden mb-6">
          <div className="px-5 py-4 border-b">
            <p className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Users size={15} className="text-primary" /> Daftar Pengguna
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground text-sm">
              <Loader2 size={18} className="animate-spin" /> Memuat data...
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <AlertCircle size={28} className="text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Belum ada pengguna.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-xs text-muted-foreground border-b">
                  <th className="px-5 py-3 text-left font-semibold">Nama</th>
                  <th className="px-5 py-3 text-left font-semibold">Username</th>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Wilayah</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-t hover:bg-muted/10 transition-colors ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                          {u.nama_lengkap?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{u.nama_lengkap}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{u.username}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold
                        ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground hidden sm:table-cell">{u.wilayah?.nama ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold
                        ${u.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'}`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Monitor Laporan per Polres */}
        {laporanLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm rounded-xl border">
            <Loader2 size={18} className="animate-spin" /> Memuat data laporan...
          </div>
        ) : (
          <LaporanByPolresMonitor laporan={laporan} polresList={polresList} />
        )}

      </SILakaShell>
    </AuthGuard>
  )
}
