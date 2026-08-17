'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, FileBarChart, LayoutDashboard, LogOut, Settings, Users, Activity, X, ChevronDown, ChevronRight, Database } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user, logout, init } = useAuthStore()
  const isLaporanPath = pathname.startsWith('/laporan-polisi')
  const [laporanOpen, setLaporanOpen] = useState(isLaporanPath)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    init()
  }, [init])

  // Keep dropdown open if we navigate to reports pages
  useEffect(() => {
    if (isLaporanPath) {
      setLaporanOpen(true)
    }
  }, [pathname, isLaporanPath])

  // Compute initials from user name
  const initials = user?.nama_lengkap
    ? user.nama_lengkap.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'U'

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar text-sidebar-foreground shadow-[1px_0_0_var(--sidebar-border)] transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-5">
        <div className="flex flex-col items-center">
          <span className="text-base font-black tracking-tight text-sidebar-foreground leading-none">DATA LAKA</span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-sidebar-foreground/45 leading-none mt-1">Jasa Raharja</span>
        </div>
        <button className="absolute right-4 md:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={onClose} aria-label="Tutup menu"><X size={18} /></button>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">Menu Utama</p>
        <div className="flex flex-col gap-1">
          {/* Dashboard */}
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${pathname === '/'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
              }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          {/* Laporan Polisi Dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => setLaporanOpen(!laporanOpen)}
              className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-left ${isLaporanPath
                ? 'bg-sidebar-accent/30 text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                }`}
            >
              <span className="flex items-center gap-3">
                <ClipboardList size={18} />
                Laporan Polisi
              </span>
              {laporanOpen ? <ChevronDown size={14} className="opacity-70" /> : <ChevronRight size={14} className="opacity-70" />}
            </button>

            {/* Dropdown Items (Collapsible) */}
            <div className={`overflow-hidden transition-all duration-300 ${laporanOpen ? 'max-h-24 opacity-100 mt-1 pl-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="flex flex-col gap-1 border-l border-sidebar-border/60 pl-3 ml-2">
                <Link
                  href="/laporan-polisi"
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${pathname === '/laporan-polisi'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                    }`}
                >
                  Daftar Laporan
                </Link>
                <Link
                  href="/laporan-polisi/tambah"
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${pathname === '/laporan-polisi/tambah'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                    }`}
                >
                  Buat Laporan Baru
                </Link>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <Link
            href="/statistik"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${pathname === '/statistik'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
              }`}
          >
            <FileBarChart size={18} />
            Statistik
          </Link>
        </div>

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <p className="px-3 pb-3 pt-8 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">Administrasi</p>
            <div className="flex flex-col gap-1">
              <Link
                href="/master-data"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${pathname === '/master-data'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                  }`}
              >
                <Database size={18} />
                Data Master
              </Link>
              <Link
                href="/users"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${pathname === '/users'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                  }`}
              >
                <Users size={18} />
                Pengguna
              </Link>
              <Link
                href="/activity-log"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${pathname === '/activity-log'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                  }`}
              >
                <Activity size={18} />
                Log Aktivitas
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Profile Footer */}
      <div className="relative border-t border-sidebar-border/60 p-4 bg-sidebar-accent/5 mt-auto">
        {/* Floating Menu Popover */}
        {profileMenuOpen && (
          <div className="absolute bottom-[4.5rem] left-4 right-4 z-50 rounded-xl border border-sidebar-border bg-sidebar p-1.5 shadow-lg">
            <button
              onClick={() => {
                setProfileMenuOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
            >
              <LogOut size={14} />
              Keluar Akun
            </button>
          </div>
        )}

        {/* Profile Card Button */}
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent/50 text-left transition-colors duration-200 cursor-pointer"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground text-xs font-bold shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground/90">{user?.nama_lengkap || 'Pengguna'}</p>
            <p className="truncate text-[10px] text-sidebar-foreground/50 capitalize">{user?.role || '-'} · {user?.wilayah?.nama || ''}</p>
          </div>
          <ChevronDown size={14} className={`text-sidebar-foreground/45 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  )
}
