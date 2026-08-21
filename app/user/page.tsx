'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UserIndexPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/user/dashboard') }, [router])
  return null
}