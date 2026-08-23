'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MasterDataPage } from '@/components/pages/master-data'
import { useIsSuperadmin } from '@/lib/role-base'
import { useAuthStore } from '@/lib/auth-store'

export default function AdminMasterDataPage() {
  const router = useRouter()
  const { user, init } = useAuthStore()
  const isSuperadmin = useIsSuperadmin()

  useEffect(() => { init() }, [init])

  // Hanya superadmin (admin wilayah_id null) yang boleh akses master data.
  useEffect(() => {
    if (user && !isSuperadmin) router.replace('/admin/dashboard')
  }, [user, isSuperadmin, router])

  if (user && !isSuperadmin) return null
  return <MasterDataPage />
}
