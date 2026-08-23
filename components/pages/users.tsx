'use client'

import { useEffect, useState } from 'react'
import { Loader2, Users, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader, Button } from '@/components/si-laka-shell'
import { usersApi, masterApi, type User, type MasterItem } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'
import { useIsSuperadmin } from '@/lib/role-base'

export function UsersPage() {
  const { success, error: showError } = useToast()
  const isSuperadmin = useIsSuperadmin()
  const [users, setUsers] = useState<User[]>([])
  const [wilayah, setWilayah] = useState<MasterItem[]>([])
  const [loading, setLoading] = useState(true)
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
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Admin wilayah (bukan superadmin) tidak boleh membuat akun admin.
    if (!isSuperadmin && form.role === 'admin') {
      showError('Hanya superadmin yang dapat membuat akun admin.')
      return
    }
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
                <input required className={inputCls} placeholder="Nama Lengkap" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Password</label>
                <input required type="password" className={inputCls} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Role</label>
                <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, wilayah_id: e.target.value === 'admin' ? '' : form.wilayah_id })}>
                  <option value="user">User</option>
                  {/* Hanya superadmin (wilayah_id null) yang boleh membuat akun admin */}
                  {isSuperadmin && <option value="admin">Admin</option>}
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

      </SILakaShell>
    </AuthGuard>
  )
}
