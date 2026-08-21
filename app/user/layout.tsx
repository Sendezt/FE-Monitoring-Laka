import type { ReactNode } from 'react'
import { RoleGuard } from '@/components/auth/role-guard'

export default function UserLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="user">{children}</RoleGuard>
}