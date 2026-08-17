'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, MapPin, Car, User, FileText } from 'lucide-react'
import { SILakaShell } from '@/components/si-laka-shell'
import { laporanApi, type LaporanPolisi } from '@/lib/api'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function DetailLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [laporan, setLaporan] = useState<LaporanPolisi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    laporanApi.get(Number(id))
      .then((res) => setLaporan(res.data.data))
      .catch(() => setError('Laporan tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <SILakaShell title="Detail Laporan" eyebrow="Laporan Polisi">
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat detail laporan...</span>
        </div>
      </SILakaShell>
    )
  }

  if (error || !laporan) {
    return (
      <SILakaShell title="Detail Laporan" eyebrow="Laporan Polisi">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle size={32} className="text-destructive" />
          <p className="font-semibold">{error}</p>
          <Link href="/laporan-polisi" className="text-sm text-primary hover:underline">← Kembali ke daftar</Link>
        </div>
      </SILakaShell>
    )
  }

  return (
    <SILakaShell title={laporan.no_lp} eyebrow="Laporan Polisi">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/laporan-polisi" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} /> Kembali
        </Link>
        <Link href={`/laporan-polisi/${laporan.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Edit Laporan
        </Link>
      </div>

      <div className="space-y-5">
        {/* Header info */}
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight">{laporan.no_lp}</h2>
              <p className="text-xs text-muted-foreground">{laporan.hari_kejadian}, {formatDate(laporan.tanggal_laka)}</p>
            </div>
            <span className={`ml-auto inline-flex rounded-full px-3 py-1 text-xs font-semibold ${laporan.laka_tunggal ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {laporan.laka_tunggal ? 'Laka Tunggal' : 'Multi Pihak'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
            {[
              ['Nomor LP', laporan.no_lp],
              ['Tanggal Kejadian', formatDate(laporan.tanggal_laka)],
              ['Hari', laporan.hari_kejadian],
              ['Tanggal LP', formatDate(laporan.tanggal_lp)],
              ['Telat LP', `${laporan.telat_lp} hari`],
              ['Kecamatan', laporan.kecamatan?.nama ?? '-'],
              ['Kelurahan', laporan.kelurahan?.nama ?? '-'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lokasi */}
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={15} className="text-primary" />
            <h3 className="font-semibold text-sm">Lokasi Kejadian</h3>
          </div>
          <p className="text-sm text-muted-foreground">{laporan.lokasi_laka}</p>
          {laporan.keterangan && (
            <p className="mt-2 text-xs text-muted-foreground italic">Keterangan: {laporan.keterangan}</p>
          )}
        </div>

        {/* Kendaraan */}
        {laporan.kendaraan && laporan.kendaraan.length > 0 && (
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="mb-3 flex items-center gap-2">
              <Car size={15} className="text-primary" />
              <h3 className="font-semibold text-sm">Data Kendaraan ({laporan.kendaraan.length})</h3>
            </div>
            <div className="space-y-3">
              {laporan.kendaraan.map((k, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${k.peran === 'korban' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {k.peran}
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold font-mono">{k.nopol}</p>
                    <p className="text-xs text-muted-foreground">{k.jenis_kendaraan?.nama ?? `Jenis #${k.jenis_kendaraan_id}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Korban */}
        {laporan.korban && laporan.korban.length > 0 && (
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="mb-3 flex items-center gap-2">
              <User size={15} className="text-primary" />
              <h3 className="font-semibold text-sm">Data Korban ({laporan.korban.length})</h3>
            </div>
            <div className="space-y-3">
              {laporan.korban.map((k, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{k.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {k.usia} tahun · {k.profesi?.nama ?? 'Profesi tidak diketahui'} · {k.cidera?.nama ?? 'Cidera tidak diketahui'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SILakaShell>
  )
}
