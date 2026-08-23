'use client'

import { useAuthStore } from './auth-store'

export function useRoleBase() {
  const role = useAuthStore((s) => s.user?.role)
  return role === 'admin' ? '/admin' : '/user'
}

// Superadmin = admin dengan wilayah_id null (akses penuh lintas wilayah).
// Admin biasa = admin dengan wilayah_id terisi (scope wilayah, fitur terbatas).
export function useIsSuperadmin() {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'admin' && (user?.wilayah_id === null || user?.wilayah_id === undefined)
}
