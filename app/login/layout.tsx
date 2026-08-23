import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description:
    'Halaman login SILAKA — Sistem Informasi Pencatatan Laporan Kecelakaan Jasa Raharja. Khusus untuk petugas internal.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
