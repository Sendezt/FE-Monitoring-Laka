'use client'

import { useAuthStore } from './auth-store'

export function useRoleBase() {
  const role = useAuthStore((s) => s.user?.role)
  return role === 'admin' ? '/admin' : '/user'
}