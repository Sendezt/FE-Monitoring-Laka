'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MasterDataEntityPage } from '@/components/pages/master-data-entity'
import { useIsSuperadmin } from '@/lib/role-base'
import { useAuthStore } from '@/lib/auth-store'

export default function AdminMasterDataEntityPage() {
  const router = useRouter()
  const { user, init } = useAuthStore()
  const isSuperadmin = useIsSuperadmin()

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (user && !isSuperadmin) router.replace('/admin/dashboard')
  }, [user, isSuperadmin, router])

  if (user && !isSuperadmin) return null
  return <MasterDataEntityPage />
}
