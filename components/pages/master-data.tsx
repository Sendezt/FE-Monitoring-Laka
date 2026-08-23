'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  Globe, ShieldCheck, MapPin, Building2, Hospital, Briefcase,
  HeartPulse, AlertTriangle, Zap, Car, FileText, CreditCard,
  CheckCircle2, Wrench, ChevronRight, Loader2
} from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader } from '@/components/si-laka-shell'
import { masterApi, type MasterItem } from '@/lib/api'
import { masterKeys } from '@/lib/hooks/use-master-data'
import { useRoleBase } from '@/lib/role-base'
import { useToast } from '@/components/ui/toast-provider'

const MASTER_GROUPS = [
  {
    group: 'Data Wilayah & Lokasi',
    iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
    entities: [
      { key: 'wilayah',   label: 'Wilayah',   icon: Globe },
      { key: 'polres',    label: 'Polres',     icon: ShieldCheck },
      { key: 'kecamatan', label: 'Kecamatan',  icon: MapPin },
      { key: 'kelurahan', label: 'Kelurahan',  icon: Building2 },
    ],
  },
  {
    group: 'Data Kejadian & Korban',
    iconColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400',
    entities: [
      { key: 'rumahsakit',    label: 'Rumah Sakit',   icon: Hospital },
      { key: 'profesi',       label: 'Profesi',        icon: Briefcase },
      { key: 'cidera',        label: 'Cidera',         icon: HeartPulse },
      { key: 'sifatLaka',     label: 'Sifat Laka',    icon: AlertTriangle },
      { key: 'faktorPenyebab',label: 'Faktor Penyebab',icon: Zap },
      { key: 'kasusTabrak',   label: 'Kasus Tabrak',  icon: Car },
    ],
  },
  {
    group: 'Data Jaminan & Tindak Lanjut',
    iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
    entities: [
      { key: 'tindakLanjut',  label: 'Tindak Lanjut',   icon: FileText },
      { key: 'jenisJaminan',  label: 'Jenis Jaminan',    icon: CreditCard },
      { key: 'keterjaminan',  label: 'Keterjaminan',     icon: CheckCircle2 },
      { key: 'jenisKendaraan',label: 'Jenis Kendaraan',  icon: Wrench },
    ],
  },
]

const ALL_ENTITIES = MASTER_GROUPS.flatMap((g) => g.entities)

export function MasterDataPage() {
  const { error: showError } = useToast()
  const base = useRoleBase()

  // Ambil semua entity master via useQueries — memakai query key & cache yang sama
  // dengan halaman detail entity (staleTime 30 menit), jadi tidak fetch ulang.
  const queries = useQueries({
    queries: ALL_ENTITIES.map((entity) => ({
      queryKey: masterKeys.list(entity.key),
      queryFn: async () => {
        const api = (masterApi as Record<string, any>)[entity.key]
        // Sebagian entity (mis. kelurahan) berupa fungsi tanpa .list — lewati.
        if (!api?.list) return [] as MasterItem[]
        const res = await api.list()
        return (res.data?.data ?? []) as MasterItem[]
      },
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    })),
  })

  const loading = queries.some((q) => q.isLoading)
  const counts: Record<string, number> = {}
  ALL_ENTITIES.forEach((entity, i) => {
    counts[entity.key] = queries[i].data?.length ?? 0
  })

  useEffect(() => {
    if (queries.some((q) => q.isError)) showError('Gagal memuat data master.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((q) => q.isError).join(',')])

  return (
    <AuthGuard adminOnly>
      <SILakaShell title="Data Master" eyebrow="Administrasi">
        <PageHeader
          title="Data Master"
          description="Kelola referensi data yang digunakan dalam seluruh laporan kecelakaan lalu lintas."
        />

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data master...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {MASTER_GROUPS.map((group) => (
              <div key={group.group}>
                <h3 className="mb-4 text-sm font-bold text-foreground">
                  {group.group}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.entities.map((entity) => (
                    <Link
                      key={entity.key}
                      href={`${base}/master-data/${entity.key}`}
                      className="group relative flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all duration-300"
                    >
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${group.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                        <entity.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {entity.label}
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {counts[entity.key] ?? 0} item tersedia
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SILakaShell>
    </AuthGuard>
  )
}
