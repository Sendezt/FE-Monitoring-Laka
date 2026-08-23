'use client'

import { useState } from 'react'
import {
  BookOpen, ChevronRight, LayoutDashboard, ClipboardList, FileBarChart,
  Monitor, TableProperties, Database, FileSpreadsheet, Users, Activity,
  PlusCircle, Search, UploadCloud, Info,
} from 'lucide-react'
import { SILakaShell } from '@/components/si-laka-shell'
import { useRoleBase } from '@/lib/role-base'
import { useAuthStore } from '@/lib/auth-store'

interface GuideStep {
  title: string
  desc: string
}

interface GuideSection {
  icon: React.ElementType
  title: string
  summary: string
  steps: GuideStep[]
  adminOnly?: boolean
  superadminOnly?: boolean
}

const SECTIONS: GuideSection[] = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    summary: 'Ringkasan data kecelakaan: total laporan, korban, status pelaporan, dan grafik statistik.',
    steps: [
      { title: 'Lihat ringkasan', desc: 'Kartu di bagian atas menampilkan total laporan polisi, jumlah korban, dan status LP (tepat waktu / terlambat).' },
      { title: 'Gunakan filter', desc: 'Atur rentang tanggal (dan Polres untuk admin) untuk menyaring data yang ditampilkan di seluruh grafik.' },
      { title: 'Laporan Terbaru', desc: 'Tabel di bawah menampilkan 5 laporan terakhir yang masuk. Klik No. LP untuk membuka detailnya.' },
    ],
  },
  {
    icon: ClipboardList,
    title: 'Kelola Laporan Polisi',
    summary: 'Menambah, melihat, mengubah, dan menghapus laporan kecelakaan beserta data korban dan kendaraannya.',
    steps: [
      { title: 'Tambah laporan', desc: 'Klik tombol "Tambah Laporan", isi data kejadian, kendaraan, dan korban, lalu simpan. Hari kejadian terisi otomatis dari tanggal laka.' },
      { title: 'Lihat & edit', desc: 'Klik salah satu baris untuk melihat detail lengkap. Gunakan tombol Edit untuk memperbarui data.' },
      { title: 'Cari & urutkan', desc: 'Gunakan kolom pencarian dan klik judul kolom (No LP / Tanggal) untuk mengurutkan data.' },
    ],
  },
  {
    icon: FileBarChart,
    title: 'Statistik',
    summary: 'Grafik dan perbandingan data kecelakaan antar periode untuk analisis tren.',
    steps: [
      { title: 'Pilih periode', desc: 'Tentukan dua rentang tanggal untuk membandingkan jumlah laka dan korban antar periode.' },
      { title: 'Baca grafik', desc: 'Grafik menampilkan tren harian, distribusi cidera, jenis kendaraan, dan lainnya.' },
    ],
  },
  {
    icon: Monitor,
    title: 'Monitoring Data',
    summary: 'Memantau kelengkapan input laporan setiap Polres dalam bentuk checklist harian maupun tabel spreadsheet.',
    adminOnly: true,
    steps: [
      { title: 'Pilih tampilan', desc: 'Gunakan toggle Checklist untuk melihat hari mana saja tiap Polres sudah menginput, atau Spreadsheet untuk tabel rinci.' },
      { title: 'Filter Polres & bulan', desc: 'Saring berdasarkan Polres tertentu dan bulan yang diinginkan.' },
    ],
  },
  {
    icon: TableProperties,
    title: 'Rekapitulasi Data',
    summary: 'Tabel rekap agregat jumlah laporan, korban, keterjaminan, dan kategori lainnya per Polres/loket.',
    adminOnly: true,
    steps: [
      { title: 'Atur filter', desc: 'Pilih rentang tanggal dan Polres untuk menghitung ulang rekap.' },
      { title: 'Cetak', desc: 'Gunakan fitur cetak untuk mengekspor tabel rekap bila tersedia.' },
    ],
  },
  {
    icon: Database,
    title: 'Kelola Data Master',
    summary: 'Mengatur data referensi: wilayah, polres, kecamatan, kelurahan, rumah sakit, cidera, profesi, dan lainnya.',
    superadminOnly: true,
    steps: [
      { title: 'Pilih entitas', desc: 'Buka salah satu kategori data master untuk melihat daftarnya.' },
      { title: 'Tambah / ubah / hapus', desc: 'Kelola isi master data. Data ini dipakai sebagai acuan saat input laporan dan migrasi.' },
    ],
  },
  {
    icon: FileSpreadsheet,
    title: 'Migrasi Data',
    summary: 'Menarik data dari Google Spreadsheet per Polres, memvalidasi terhadap data master, lalu memasukkannya ke database.',
    superadminOnly: true,
    steps: [
      { title: 'Pilih Sheet & baris', desc: 'Pilih Sheet/Polres (1-35) dan tentukan rentang baris awal-akhir yang ingin ditarik, lalu klik "Refresh Data".' },
      { title: 'Periksa status baris', desc: 'Hijau = siap masuk, Kuning = ada data yang belum cocok dengan master, Merah = No LP sudah ada di Polres itu. Klik ikon panah untuk melihat detail tiap baris.' },
      { title: 'Check & Add to DB', desc: 'Tombol "Check" memeriksa ulang kesiapan baris. "Add to DB" menyimpan satu baris. "Sync All Valid" menyimpan semua baris hijau sekaligus.' },
    ],
  },
  {
    icon: Users,
    title: 'Kelola Pengguna',
    summary: 'Menambah dan mengatur akun pengguna beserta peran dan wilayahnya.',
    adminOnly: true,
    steps: [
      { title: 'Tambah pengguna', desc: 'Klik "Tambah Pengguna", isi data akun. Admin wilayah hanya dapat membuat akun User; pembuatan akun Admin khusus Superadmin.' },
      { title: 'Pantau daftar', desc: 'Lihat daftar pengguna beserta status aktifnya.' },
    ],
  },
  {
    icon: Activity,
    title: 'Riwayat Aktivitas',
    summary: 'Catatan aktivitas pengguna: pembuatan, perubahan, dan penghapusan data.',
    adminOnly: true,
    steps: [
      { title: 'Telusuri log', desc: 'Lihat siapa melakukan aksi apa dan kapan. Gunakan filter untuk mempersempit hasil.' },
    ],
  },
]

const QUICK_ACTIONS = [
  { icon: PlusCircle, label: 'Tambah laporan baru', desc: 'Menu Kelola Laporan Polisi → Tambah Laporan' },
  { icon: Search, label: 'Cari laporan', desc: 'Gunakan kolom pencarian di halaman daftar laporan' },
  { icon: FileBarChart, label: 'Lihat statistik', desc: 'Menu Statistik → atur periode perbandingan' },
]

const QUICK_ACTIONS_ADMIN = [
  { icon: UploadCloud, label: 'Migrasi dari Google Sheets', desc: 'Menu Migrasi Data → pilih Sheet → Check → Add to DB' },
  { icon: Database, label: 'Atur data master', desc: 'Menu Kelola Data Master → pilih entitas' },
]

const QUICK_ACTIONS_USERS = [
  { icon: Users, label: 'Tambah pengguna', desc: 'Menu Kelola Pengguna → Tambah Pengguna' },
]

export function PanduanPage() {
  const base = useRoleBase()
  const role = useAuthStore((s) => s.user?.role)
  const wilayahId = useAuthStore((s) => s.user?.wilayah_id)
  const isAdmin = role === 'admin'
  const isSuperadmin = isAdmin && (wilayahId === null || wilayahId === undefined)
  const [open, setOpen] = useState<number | null>(0)

  const sections = SECTIONS.filter((s) => {
    if (s.superadminOnly) return isSuperadmin
    if (s.adminOnly) return isAdmin
    return true
  })

  // Superadmin: tidak input laporan; punya migrasi + master + users.
  // Admin wilayah: input laporan; punya users (buat user saja).
  let quickActions = [...QUICK_ACTIONS]
  if (isSuperadmin) {
    // Superadmin tidak menginput laporan → buang aksi "Tambah laporan baru"
    quickActions = quickActions.filter((qa) => qa.label !== 'Tambah laporan baru')
    quickActions = [...quickActions, ...QUICK_ACTIONS_ADMIN, ...QUICK_ACTIONS_USERS]
  } else if (isAdmin) {
    quickActions = [...quickActions, ...QUICK_ACTIONS_USERS]
  }

  return (
    <SILakaShell title="Panduan Penggunaan" eyebrow="Bantuan">
      {/* Quick Usage */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground/80">Aksi Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((qa) => {
            const Icon = qa.icon
            return (
              <div key={qa.label} className="rounded-xl border bg-card p-4 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm font-semibold">{qa.label}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{qa.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Panduan per fitur (accordion) */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground/80">Panduan per Fitur</h2>
        <div className="space-y-2">
          {sections.map((s, idx) => {
            const Icon = s.icon
            const isOpen = open === idx
            return (
              <div key={s.title} className="rounded-xl border bg-card shadow-xs overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.summary}</p>
                  </div>
                  <ChevronRight size={16} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="border-t bg-muted/20 px-4 py-4">
                    <ol className="space-y-3">
                      {s.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                            <p className="text-[13px] text-muted-foreground leading-relaxed">{step.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Catatan */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            {isSuperadmin ? (
              <>Sebagai Superadmin, Anda memiliki akses penuh: seluruh Polres, data master, migrasi data, dan pembuatan akun admin. Namun Superadmin tidak menginput laporan kecelakaan — gunakan akun admin wilayah untuk pencatatan.</>
            ) : isAdmin ? (
              <>Sebagai Admin wilayah, Anda dapat menginput dan mengelola laporan di wilayah Anda serta membuat akun User. Menu Migrasi Data & Kelola Data Master hanya tersedia untuk Superadmin.</>
            ) : (
              <>Sebagai Pengguna, Anda hanya dapat melihat dan mengelola data pada wilayah/Polres Anda sendiri. Hubungi Administrator bila membutuhkan akses tambahan.</>
            )}
          </div>
        </div>
      </div>
    </SILakaShell>
  )
}
