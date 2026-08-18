'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList, FileBarChart, LayoutDashboard, LogOut,
  Users, Activity, X, ChevronDown, ChevronRight, Database,
  Shield, FilePlus, List, ChevronUp, MapPin
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

function NavLink({
  href, icon: Icon, label, active, onClick, indent = false
}: {
  href: string; icon?: React.ElementType; label: string; active: boolean; onClick?: () => void; indent?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group
        ${indent ? 'py-2 text-xs ml-1' : ''}
        ${active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs'
          : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        }`}
    >
      {active && (
        <span className="absolute left-0 inset-y-1.5 w-[3px] rounded-full bg-sidebar-primary" />
      )}
      {Icon && (
        <Icon
          size={indent ? 14 : 16}
          className={`shrink-0 transition-transform duration-200 ${active ? 'text-sidebar-primary' : 'group-hover:scale-110'}`}
        />
      )}
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user, logout, init } = useAuthStore()
  const isLaporanPath = pathname.startsWith('/laporan-polisi')
  const [laporanOpen, setLaporanOpen] = useState(isLaporanPath)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (isLaporanPath) setLaporanOpen(true)
  }, [pathname, isLaporanPath])

  const initials = user?.nama_lengkap
    ? user.nama_lengkap.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'U'

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground
        border-r border-sidebar-border/80 shadow-xl shadow-black/5
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* ── Logo Header ── */}
      <div className="relative flex h-16 items-center gap-3 px-5 border-b border-sidebar-border/60 overflow-hidden">
        {/* Background gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/8 to-transparent pointer-events-none" />
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 shadow-md shadow-sidebar-primary/30">
          <Shield size={18} className="text-white" />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-sm font-black tracking-tight text-sidebar-foreground leading-none">DATA LAKA</p>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/45 leading-none mt-0.5">
            Jasa Raharja
          </p>
        </div>
        <button
          className="relative md:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent/50"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">

        {/* Menu Utama */}
        <div>
          <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/35">
            Menu Utama
          </p>
          <div className="flex flex-col gap-0.5">
            <NavLink href="/" icon={LayoutDashboard} label="Dashboard" active={pathname === '/'} onClick={onClose} />

            {/* Laporan Polisi Accordion */}
            <div>
              <button
                onClick={() => setLaporanOpen(!laporanOpen)}
                className={`w-full relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left group
                  ${isLaporanPath
                    ? 'bg-sidebar-accent/40 text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
              >
                {isLaporanPath && (
                  <span className="absolute left-0 inset-y-1.5 w-[3px] rounded-full bg-sidebar-primary/60" />
                )}
                <ClipboardList size={16} className={`shrink-0 transition-transform duration-200 ${isLaporanPath ? 'text-sidebar-primary' : 'group-hover:scale-110'}`} />
                <span className="flex-1 truncate">Laporan Polisi</span>
                <ChevronDown
                  size={13}
                  className={`shrink-0 text-sidebar-foreground/40 transition-transform duration-200 ${laporanOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown items */}
              <div className={`overflow-hidden transition-all duration-300 ${laporanOpen ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="mt-0.5 ml-4 pl-3 border-l-2 border-sidebar-border/50 flex flex-col gap-0.5 py-1">
                  <NavLink
                    href="/laporan-polisi"
                    icon={List}
                    label="Daftar Laporan"
                    active={pathname === '/laporan-polisi'}
                    onClick={onClose}
                    indent
                  />
                  <NavLink
                    href="/laporan-polisi/tambah"
                    icon={FilePlus}
                    label="Buat Laporan Baru"
                    active={pathname === '/laporan-polisi/tambah'}
                    onClick={onClose}
                    indent
                  />
                </div>
              </div>
            </div>

            <NavLink href="/statistik" icon={FileBarChart} label="Statistik" active={pathname === '/statistik'} onClick={onClose} />
          </div>
        </div>

        {/* Administrasi (admin only) */}
        {isAdmin && (
          <div>
            <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/35">
              Administrasi
            </p>
            <div className="flex flex-col gap-0.5">
              <NavLink href="/master-data" icon={Database} label="Data Master" active={pathname.startsWith('/master-data')} onClick={onClose} />
              <NavLink href="/users" icon={Users} label="Pengguna" active={pathname === '/users'} onClick={onClose} />
              <NavLink href="/activity-log" icon={Activity} label="Log Aktivitas" active={pathname === '/activity-log'} onClick={onClose} />
            </div>
          </div>
        )}
      </nav>

      {/* ── Profile Footer ── */}
      <div className="relative border-t border-sidebar-border/60 p-3">
        {/* Floating popover */}
        {profileMenuOpen && (
          <div className="absolute bottom-[4.8rem] left-3 right-3 z-50 rounded-xl border border-sidebar-border bg-sidebar shadow-xl shadow-black/10 overflow-hidden">
            <div className="p-1">
              <button
                onClick={() => { setProfileMenuOpen(false); logout() }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/8 transition-colors text-left cursor-pointer"
              >
                <LogOut size={13} />
                Keluar Akun
              </button>
            </div>
          </div>
        )}

        {/* Profile card */}
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex w-full items-center gap-3 rounded-xl p-2.5 hover:bg-sidebar-accent/60 text-left transition-all duration-200 cursor-pointer group"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground/90 leading-tight">
              {user?.nama_lengkap || 'Pengguna'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide
                ${isAdmin
                  ? 'bg-sidebar-primary/15 text-sidebar-primary'
                  : 'bg-sidebar-foreground/10 text-sidebar-foreground/60'
                }`}>
                {user?.role || 'user'}
              </span>
              {user?.wilayah?.nama && (
                <span className="flex items-center gap-0.5 text-[9px] text-sidebar-foreground/45 truncate">
                  <MapPin size={8} />
                  {user.wilayah.nama}
                </span>
              )}
            </div>
          </div>
          <ChevronUp
            size={13}
            className={`shrink-0 text-sidebar-foreground/35 transition-transform duration-200 ${profileMenuOpen ? '' : 'rotate-180'}`}
          />
        </button>
      </div>
    </aside>
  )
}
