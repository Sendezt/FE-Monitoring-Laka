'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export function RoleGuard({ role, children }: { role: 'admin' | 'user'; children: React.ReactNode }) {
  const { isAuthenticated, user, init } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.replace('/login')
    } else if (user) {
      if (role === 'admin' && user.role !== 'admin') {
        router.replace('/user/dashboard')
      } else if (role === 'user' && user.role !== 'user') {
        router.replace('/admin/dashboard')
      }
    }
  }, [isAuthenticated, user, role, router])

  if (typeof window !== 'undefined' && !isAuthenticated && !localStorage.getItem('token')) {
    return null
  }

  if (user && ((role === 'admin' && user.role !== 'admin') || (role === 'user' && user.role !== 'user'))) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground">Halaman ini hanya untuk peran {role === 'admin' ? 'Administrator' : 'Pengguna'}.</p>
      </div>
    )
  }

  return <>{children}</>
}