'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Globe, ShieldCheck, MapPin, Building2, Hospital, Briefcase,
  HeartPulse, AlertTriangle, Zap, Car, FileText, CreditCard,
  CheckCircle2, Wrench, ChevronRight, Loader2
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader } from '@/components/si-laka-shell'
import { masterApi, type MasterItem } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'

const MASTER_GROUPS = [
  {
    group: 'Data Wilayah & Lokasi',
    color: 'from-blue-500/10 to-indigo-500/5 border-blue-200/60 dark:border-blue-800/40',
    iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    entities: [
      { key: 'wilayah',   label: 'Wilayah',   icon: Globe },
      { key: 'polres',    label: 'Polres',     icon: ShieldCheck },
      { key: 'kecamatan', label: 'Kecamatan',  icon: MapPin },
      { key: 'kelurahan', label: 'Kelurahan',  icon: Building2 },
    ],
  },
  {
    group: 'Data Kejadian & Korban',
    color: 'from-rose-500/10 to-orange-500/5 border-rose-200/60 dark:border-rose-800/40',
    iconColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
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
    color: 'from-emerald-500/10 to-teal-500/5 border-emerald-200/60 dark:border-emerald-800/40',
    iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    entities: [
      { key: 'tindakLanjut',  label: 'Tindak Lanjut',   icon: FileText },
      { key: 'jenisJaminan',  label: 'Jenis Jaminan',    icon: CreditCard },
      { key: 'keterjaminan',  label: 'Keterjaminan',     icon: CheckCircle2 },
      { key: 'jenisKendaraan',label: 'Jenis Kendaraan',  icon: Wrench },
    ],
  },
]

const ALL_ENTITIES = MASTER_GROUPS.flatMap((g) => g.entities)

export default function MasterDataPage() {
  const { error: showError } = useToast()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: Record<string, number> = {}
      try {
        await Promise.all(
          ALL_ENTITIES.map(async (entity) => {
            try {
              const api = (masterApi as Record<string, any>)[entity.key]
              if (api?.list) {
                const res = await api.list()
                newCounts[entity.key] = res.data?.data?.length ?? 0
              }
            } catch {
              // silent fail per entity
            }
          })
        )
        setCounts(newCounts)
      } catch {
        showError('Gagal memuat data master.')
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [showError])

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
                <h3 className="mb-3 text-sm font-semibold text-foreground/70 flex items-center gap-2">
                  <span className="inline-block h-px flex-1 bg-border/60" />
                  {group.group}
                  <span className="inline-block h-px flex-1 bg-border/60" />
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {group.entities.map((entity) => (
                    <Link
                      key={entity.key}
                      href={`/master-data/${entity.key}`}
                      className={`group relative rounded-xl border bg-gradient-to-br p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${group.color}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`flex size-10 items-center justify-center rounded-xl ${group.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                          <entity.icon size={18} />
                        </div>
                        <ChevronRight
                          size={15}
                          className="text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200 mt-1"
                        />
                      </div>
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-foreground transition-colors leading-tight">
                          {entity.label}
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-bold text-foreground/80">{counts[entity.key] ?? 0}</span> item tersedia
                        </p>
                      </div>
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
