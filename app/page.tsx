'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, user, init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.replace('/login')
      return
    }
    router.replace(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
  }, [isAuthenticated, user, router])

  return null
}