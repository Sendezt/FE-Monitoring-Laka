'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, MapPin, Car, User, FileText, Building2, Hospital, ShieldAlert, Calendar, Clock } from 'lucide-react'
import { SILakaShell } from '@/components/si-laka-shell'
import { laporanApi, masterApi, type LaporanPolisi, type MasterItem } from '@/lib/api'
import { useRoleBase } from '@/lib/role-base'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-sm">{value || '-'}</p>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function LaporanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const base = useRoleBase()
  const [laporan, setLaporan] = useState<LaporanPolisi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapKasusTabrak, setMapKasusTabrak] = useState<Map<number, string>>(new Map())
  const [mapFaktorPenyebab, setMapFaktorPenyebab] = useState<Map<number, string>>(new Map())
  const [mapSifatLaka, setMapSifatLaka] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    const toMap = (items: MasterItem[]) => new Map(items.map((i) => [i.id, i.nama]))
    Promise.all([
      laporanApi.get(Number(id)),
      masterApi.kasusTabrak.list(),
      masterApi.faktorPenyebab.list(),
      masterApi.sifatLaka.list(),
    ])
      .then(([laporanRes, kasusRes, faktorRes, sifatRes]) => {
        setLaporan(laporanRes.data.data)
        setMapKasusTabrak(toMap(kasusRes.data.data))
        setMapFaktorPenyebab(toMap(faktorRes.data.data))
        setMapSifatLaka(toMap(sifatRes.data.data))
      })
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
          <Link href={`${base}/laporan-polisi`} className="text-sm text-primary hover:underline">← Kembali ke daftar</Link>
        </div>
      </SILakaShell>
    )
  }

  return (
    <SILakaShell title={laporan.no_lp} eyebrow="Laporan Polisi">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`${base}/laporan-polisi`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} /> Kembali
        </Link>
        <Link href={`${base}/laporan-polisi/${laporan.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Edit Laporan
        </Link>
      </div>

      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight">{laporan.no_lp}</h2>
              <p className="text-xs text-muted-foreground">{laporan.hari_kejadian}, {formatDate(laporan.tanggal_lp)}</p>
            </div>
            <span className={`ml-auto inline-flex rounded-full px-3 py-1 text-xs font-semibold ${laporan.laka_tunggal ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {laporan.laka_tunggal ? 'Laka Tunggal' : 'Multi Pihak'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-sm">
            <Field label="Nomor LP" value={laporan.no_lp} />
            <Field label="Polres" value={laporan.polres?.nama || '-'} />
            <Field label="Tanggal Kejadian" value={formatDate(laporan.tanggal_laka)} />
            <Field label="Hari Kejadian" value={laporan.hari_kejadian} />
            <Field label="Tanggal LP" value={formatDate(laporan.tanggal_lp)} />
            <Field label="Telat LP" value={`${laporan.telat_lp} hari`} />
            <Field label="Laka Tunggal" value={laporan.laka_tunggal ? 'Ya' : 'Tidak'} />

          </div>
        </div>

        {/* ── Lokasi ── */}
        <Section icon={MapPin} title="Lokasi Kejadian">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <Field label="Kecamatan" value={laporan.kecamatan?.nama || '-'} />
            <Field label="Kelurahan" value={laporan.kelurahan?.nama || '-'} />
            <Field label="Lokasi Laka" value={laporan.lokasi_laka || '-'} />
          </div>
        </Section>

        {/* ── Rumah Sakit ── */}
        <Section icon={Hospital} title="Rumah Sakit">
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <Field label="RS Wilayah Sendiri" value={laporan.rumah_sakit_wilayah && /sendiri/i.test(laporan.rumah_sakit_wilayah) ? laporan.rumah_sakit_wilayah : '-'} />
            <Field label="RS Wilayah Lain" value={laporan.rumah_sakit_wilayah && /lain/i.test(laporan.rumah_sakit_wilayah) ? laporan.rumah_sakit_wilayah : (!laporan.rumah_sakit_wilayah || (/sendiri/i.test(laporan.rumah_sakit_wilayah) || /lain/i.test(laporan.rumah_sakit_wilayah)) ? '-' : laporan.rumah_sakit_wilayah)} />
          </div>
        </Section>

        {/* ── Klasifikasi ── */}
        <Section icon={ShieldAlert} title="Klasifikasi Kecelakaan">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <Field label="Kasus Tabrakan" value={laporan.kasus_tabrak_kecelakaan_id ? (mapKasusTabrak.get(laporan.kasus_tabrak_kecelakaan_id) || '-') : '-'} />
            <Field label="Faktor Penyebab" value={laporan.faktor_penyebab_laka_id ? (mapFaktorPenyebab.get(laporan.faktor_penyebab_laka_id) || '-') : '-'} />
            <Field label="Sifat Laka" value={laporan.sifat_laka_id ? (mapSifatLaka.get(laporan.sifat_laka_id) || '-') : '-'} />
          </div>
          {laporan.keterangan && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <Field label="Keterangan" value={laporan.keterangan} />
            </div>
          )}
        </Section>

        {/* ── Kendaraan ── */}
        {laporan.kendaraan && laporan.kendaraan.length > 0 && (
          <Section icon={Car} title={`Data Kendaraan (${laporan.kendaraan.length})`}>
            <div className="space-y-3">
              {laporan.kendaraan.map((k, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${k.peran === 'korban' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {k.peran === 'korban' ? 'Korban' : 'Penjamin'}
                    </span>
                    <span className="font-mono font-semibold text-sm">{k.nopol}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 text-sm">
                    <Field label="Jenis Kendaraan" value={k.jenisKendaraan?.nama || '-'} />
                    <Field label="No. Polisi" value={k.nopol} />
                    <Field label="Masa Laku SW" value={k.masa_laku_sw ? formatDate(k.masa_laku_sw) : '-'} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Korban ── */}
        {laporan.korban && laporan.korban.length > 0 && (
          <Section icon={User} title={`Data Korban (${laporan.korban.length})`}>
            <div className="space-y-4">
              {laporan.korban.map((k, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{k.nama}</p>
                      <p className="text-xs text-muted-foreground">{k.usia} tahun</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <Field label="Nama" value={k.nama} />
                    <Field label="Usia" value={`${k.usia} tahun`} />
                    <Field label="Profesi" value={k.profesi?.nama || '-'} />
                    <Field label="Cidera" value={k.cidera?.nama || '-'} />
                    <Field label="Tindak Lanjut" value={k.tindakLanjut?.nama || '-'} />
                    <Field label="Jenis Jaminan" value={k.jenisJaminan?.nama || '-'} />
                    <Field label="Keterjaminan" value={k.keterjaminan?.nama || '-'} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </SILakaShell>
  )
}
