'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle, Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader, Button, Field, inputClass } from '@/components/si-laka-shell'
import { masterApi, type MasterItem } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'

const MASTER_DATA_CONFIG: Record<string, { label: string; icon: string; apiKey: string }> = {
  wilayah: { label: 'Wilayah', icon: '🗺️', apiKey: 'wilayah' },
  polres: { label: 'Polres', icon: '🚓', apiKey: 'polres' },
  kecamatan: { label: 'Kecamatan', icon: '📍', apiKey: 'kecamatan' },
  kelurahan: { label: 'Kelurahan', icon: '📌', apiKey: 'kelurahanCrud' },
  rumahsakit: { label: 'Rumah Sakit', icon: '🏥', apiKey: 'rumahsakit' },
  profesi: { label: 'Profesi', icon: '💼', apiKey: 'profesi' },
  cidera: { label: 'Cidera', icon: '🩹', apiKey: 'cidera' },
  sifatLaka: { label: 'Sifat Laka', icon: '⚠️', apiKey: 'sifatLaka' },
  faktorPenyebab: { label: 'Faktor Penyebab', icon: '🔍', apiKey: 'faktorPenyebab' },
  kasusTabrak: { label: 'Kasus Tabrak', icon: '💥', apiKey: 'kasusTabrak' },
  tindakLanjut: { label: 'Tindak Lanjut', icon: '✋', apiKey: 'tindakLanjut' },
  jenisJaminan: { label: 'Jenis Jaminan', icon: '📋', apiKey: 'jenisJaminan' },
  keterjaminan: { label: 'Keterjaminan', icon: '✅', apiKey: 'keterjaminan' },
  jenisKendaraan: { label: 'Jenis Kendaraan', icon: '🚗', apiKey: 'jenisKendaraan' },
}

export default function MasterDataDetailPage({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = use(params)
  const config = MASTER_DATA_CONFIG[entity]

  if (!config) {
    return (
      <SILakaShell>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle size={32} className="text-destructive" />
          <p className="font-semibold text-foreground">Entity tidak ditemukan</p>
        </div>
      </SILakaShell>
    )
  }

  return <MasterDataCRUD entity={entity} config={config} />
}

function MasterDataCRUD({ entity, config }: { entity: string; config: { label: string; icon: string; apiKey: string } }) {
  const { success, error: showError } = useToast()
  const [items, setItems] = useState<MasterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nama, setNama] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const api = (masterApi as Record<string, any>)[config.apiKey]

  const fetchItems = () => {
    setLoading(true)
    api
      .list()
      .then((res: any) => {
        setItems(res.data?.data ?? [])
      })
      .catch(() => showError(`Gagal memuat ${config.label.toLowerCase()}.`))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchItems()
    setCurrentPage(1)
    setSearch('')
    setShowForm(false)
    setEditingId(null)
    setNama('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await api.update(editingId, { nama })
        success(`${config.label} berhasil diperbarui.`)
      } else {
        await api.create({ nama })
        success(`${config.label} berhasil ditambahkan.`)
      }
      setNama('')
      setEditingId(null)
      setShowForm(false)
      fetchItems()
    } catch {
      showError(`Gagal menyimpan ${config.label.toLowerCase()}.`)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: MasterItem) => {
    setEditingId(item.id)
    setNama(item.nama)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus ${config.label.toLowerCase()} ini?`)) return
    setDeleting(id)
    try {
      await api.delete(id)
      success(`${config.label} berhasil dihapus.`)
      fetchItems()
    } catch {
      showError(`Gagal menghapus ${config.label.toLowerCase()}.`)
    } finally {
      setDeleting(null)
    }
  }

  // Filter first, then paginate
  const filtered = items.filter((i) => i.nama.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset page when search term changes
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingId(null)
    setNama('')
  }

  return (
    <AuthGuard adminOnly>
      <SILakaShell title={config.label} eyebrow="Master Data">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/master-data" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} /> Kembali
          </Link>
        </div>

        <PageHeader
          title={`Kelola ${config.label}`}
          action={
            <Button onClick={() => { setShowForm(true); setEditingId(null); setNama('') }}>
              <Plus size={16} /> Tambah {config.label}
            </Button>
          }
        />

        {/* Structured Grid Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm animate-fade-in">
            <h3 className="mb-4 font-bold text-sm text-foreground">{editingId ? 'Edit' : 'Tambah'} {config.label}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label={`Nama ${config.label}`} required>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder={`Masukkan nama ${config.label.toLowerCase()}...`}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {editingId ? 'Simpan Perubahan' : 'Tambah Baru'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-5 flex items-center gap-3">
          <input
            type="text"
            placeholder={`Cari ${config.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 max-w-sm rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <span className="text-xs text-muted-foreground">{filtered.length} item</span>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 size={18} className="animate-spin" /> Memuat data...
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle size={28} className="text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {search ? `Tidak ada hasil untuk pencarian "${search}".` : `Belum ada ${config.label.toLowerCase()}.`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-xs text-muted-foreground border-b">
                      <th className="px-5 py-3 text-left font-semibold">ID</th>
                      <th className="px-5 py-3 text-left font-semibold">Nama</th>
                      <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item, i) => (
                      <tr key={item.id} className={`border-t hover:bg-muted/10 transition-colors ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
                        <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{item.id}</td>
                        <td className="px-5 py-3 font-medium text-foreground">{item.nama}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deleting === item.id}
                              className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {deleting === item.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={12} />}
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-0 flex items-center justify-end gap-2 border-t px-5 py-4 bg-muted/5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40 cursor-pointer"
                  >
                    ← Sebelumnya
                  </button>
                  <span className="text-xs text-muted-foreground">Hal {currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40 cursor-pointer"
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </SILakaShell>
    </AuthGuard>
  )
}
