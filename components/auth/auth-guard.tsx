'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user, init } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.replace('/login')
    } else if (adminOnly && user && user.role !== 'admin') {
      router.replace('/')
    }
  }, [isAuthenticated, user, adminOnly, router])

  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return null
  }

  if (adminOnly && user && user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground">Halaman ini hanya untuk Administrator.</p>
      </div>
    )
  }

  return <>{children}</>
}
