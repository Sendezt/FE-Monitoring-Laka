'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Database, ChevronRight, Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SILakaShell, PageHeader } from '@/components/si-laka-shell'
import { masterApi, type MasterItem } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'

const MASTER_DATA_ENTITIES = [
  { key: 'wilayah', label: 'Wilayah', icon: '🗺️' },
  { key: 'polres', label: 'Polres', icon: '🚓' },
  { key: 'kecamatan', label: 'Kecamatan', icon: '📍' },
  { key: 'kelurahan', label: 'Kelurahan', icon: '📌' },
  { key: 'rumahsakit', label: 'Rumah Sakit', icon: '🏥' },
  { key: 'profesi', label: 'Profesi', icon: '💼' },
  { key: 'cidera', label: 'Cidera', icon: '🩹' },
  { key: 'sifatLaka', label: 'Sifat Laka', icon: '⚠️' },
  { key: 'faktorPenyebab', label: 'Faktor Penyebab', icon: '🔍' },
  { key: 'kasusTabrak', label: 'Kasus Tabrak', icon: '💥' },
  { key: 'tindakLanjut', label: 'Tindak Lanjut', icon: '✋' },
  { key: 'jenisJaminan', label: 'Jenis Jaminan', icon: '📋' },
  { key: 'keterjaminan', label: 'Keterjaminan', icon: '✅' },
  { key: 'jenisKendaraan', label: 'Jenis Kendaraan', icon: '🚗' },
]

export default function MasterDataPage() {
  const { error: showError } = useToast()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: Record<string, number> = {}
      try {
        await Promise.all(
          MASTER_DATA_ENTITIES.map(async (entity) => {
            try {
              const api = (masterApi as Record<string, any>)[entity.key]
              if (api?.list) {
                const res = await api.list()
                newCounts[entity.key] = res.data?.data?.length ?? 0
              }
            } catch (err) {
              console.error(`Failed to fetch ${entity.key}:`, err)
            }
          })
        )
        setCounts(newCounts)
      } catch (err) {
        showError('Gagal memuat data master.')
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [showError])

  return (
    <AuthGuard adminOnly>
      <SILakaShell title="Master Data" eyebrow="Administrasi">

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data...</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MASTER_DATA_ENTITIES.map((entity) => (
              <Link
                key={entity.key}
                href={`/master-data/${entity.key}`}
                className="group rounded-lg border bg-card p-5 hover:shadow-md transition-all duration-300 hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-2xl">{entity.icon}</span>
                    <h3 className="mt-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                      {entity.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {counts[entity.key] ?? 0} item
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </SILakaShell>
    </AuthGuard>
  )
}
