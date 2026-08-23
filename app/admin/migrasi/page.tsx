'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MigrasiPage } from '@/components/pages/migrasi'
import { useIsSuperadmin } from '@/lib/role-base'
import { useAuthStore } from '@/lib/auth-store'

export default function AdminMigrasiPage() {
  const router = useRouter()
  const { user, init } = useAuthStore()
  const isSuperadmin = useIsSuperadmin()

  useEffect(() => { init() }, [init])

  // Hanya superadmin (admin wilayah_id null) yang boleh akses migrasi.
  useEffect(() => {
    if (user && !isSuperadmin) router.replace('/admin/dashboard')
  }, [user, isSuperadmin, router])

  if (user && !isSuperadmin) return null
  return <MigrasiPage />
}
