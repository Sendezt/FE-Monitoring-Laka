'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, MapPin, ShieldAlert, CarFront, HeartPulse, Loader2, Save, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react'
import { Field, inputClass, selectClass, SILakaShell } from '@/components/si-laka-shell'
import { laporanApi, masterApi, type MasterItem, type CreateLaporanPayload } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { useRoleBase, useIsSuperadmin } from '@/lib/role-base'
import { useToast } from '@/components/ui/toast-provider'
import { getWeekday } from '@/lib/formatters'
import { SearchableSelect } from '@/components/ui/searchable-select'

interface VehicleForm {
  peran: 'korban' | 'penjamin'
  jenis_kendaraan_id: string
  nopol: string
  masa_laku_sw?: string
}

interface VictimForm {
  nama: string
  usia: string
  profesi_id: string
  cidera_id: string
  kendaraan_index: string
  tindak_lanjut_id: string
  jenis_jaminan_id: string
  keterjaminan_id: string
}

const emptyVehicle = (): VehicleForm => ({ peran: 'korban', jenis_kendaraan_id: '', nopol: '', masa_laku_sw: '' })
const emptyVictim = (): VictimForm => ({
  nama: '',
  usia: '',
  profesi_id: '',
  cidera_id: '',
  kendaraan_index: '0',
  tindak_lanjut_id: '',
  jenis_jaminan_id: '',
  keterjaminan_id: ''
})

const getVehicleLabel = (vehicles: VehicleForm[], index: number) => {
  const currentVehicle = vehicles[index]
  if (!currentVehicle) return `Kendaraan #${index + 1}`
  const roleName = currentVehicle.peran === 'korban' ? 'Korban' : 'Penjamin'
  const sameRoleCount = vehicles.filter((v) => v.peran === currentVehicle.peran).length
  if (sameRoleCount <= 1) {
    return `Kendaraan ${roleName}`
  }
  const indexInRole = vehicles.slice(0, index + 1).filter((v) => v.peran === currentVehicle.peran).length
  return `Kendaraan ${roleName} #${indexInRole}`
}

export function LaporanTambahPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const base = useRoleBase()
  const isSuperadmin = useIsSuperadmin()

  // Master data
  const [polres, setPolres] = useState<MasterItem[]>([])
  const [kecamatan, setKecamatan] = useState<MasterItem[]>([])
  const [kelurahan, setKelurahan] = useState<MasterItem[]>([])
  const [jenisKendaraan, setJenisKendaraan] = useState<MasterItem[]>([])
  const [profesi, setProfesi] = useState<MasterItem[]>([])
  const [cidera, setCidera] = useState<MasterItem[]>([])
  const [sifatLaka, setSifatLaka] = useState<MasterItem[]>([])
  const [faktorPenyebab, setFaktorPenyebab] = useState<MasterItem[]>([])
  const [kasusTabrak, setKasusTabrak] = useState<MasterItem[]>([])
  const [tindakLanjut, setTindakLanjut] = useState<MasterItem[]>([])
  const [jenisJaminan, setJenisJaminan] = useState<MasterItem[]>([])
  const [keterjaminan, setKeterjaminan] = useState<MasterItem[]>([])
  const [rumahSakit, setRumahSakit] = useState<MasterItem[]>([])
  const [masterLoading, setMasterLoading] = useState(true)

  // Form state
  const [noLp, setNoLp] = useState('')
  const [polresId, setPolresId] = useState('')
  const [tanggalLaka, setTanggalLaka] = useState(new Date().toISOString().slice(0, 10))
  const [tanggalLp, setTanggalLp] = useState(new Date().toISOString().slice(0, 10))
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [lokasi, setLokasi] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [lakaTunggal, setLakaTunggal] = useState(false)
  const [sifatLakaId, setSifatLakaId] = useState('')
  const [faktorId, setFaktorId] = useState('')
  const [kasusId, setKasusId] = useState('')
  const [rumahSakitId, setRumahSakitId] = useState('')
  const [rumahSakitWilayah, setRumahSakitWilayah] = useState('')
  const [vehicles, setVehicles] = useState<VehicleForm[]>([emptyVehicle()])
  const [victims, setVictims] = useState<VictimForm[]>([emptyVictim()])
  const [isSaving, setIsSaving] = useState(false)

  // ── Urutan section (dapat diatur pengguna, disimpan di localStorage) ──────────
  const DEFAULT_SECTION_ORDER = ['identitas', 'lokasi', 'kendaraan', 'korban', 'klasifikasi']
  const SECTION_ORDER_KEY = 'laporan_form_section_order'
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SECTION_ORDER_KEY)
      if (saved) {
        const arr = JSON.parse(saved) as string[]
        // Validasi: harus memuat semua section yang dikenal, tanpa yang asing
        const valid =
          Array.isArray(arr) &&
          arr.length === DEFAULT_SECTION_ORDER.length &&
          DEFAULT_SECTION_ORDER.every((s) => arr.includes(s))
        if (valid) setSectionOrder(arr)
      }
    } catch { /* abaikan, pakai default */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistOrder = (arr: string[]) => {
    setSectionOrder(arr)
    try { localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(arr)) } catch { /* noop */ }
  }

  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= sectionOrder.length) return
    const next = [...sectionOrder]
    ;[next[index], next[target]] = [next[target], next[index]]
    persistOrder(next)
  }

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); return }
    const next = [...sectionOrder]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    persistOrder(next)
    setDragIndex(null)
  }

  const resetOrder = () => persistOrder(DEFAULT_SECTION_ORDER)

  const weekday = useMemo(() => getWeekday(tanggalLaka), [tanggalLaka])
  const telat = useMemo(() => {
    const d1 = new Date(tanggalLaka), d2 = new Date(tanggalLp)
    return Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / 86400000))
  }, [tanggalLaka, tanggalLp])

  // Fetch all master data once (filtered by user's wilayah)
  useEffect(() => {
    const wilayahId = user?.wilayah_id
    Promise.all([
      wilayahId ? masterApi.polres.listByWilayah(wilayahId, { page: 1, limit: 100 }) : Promise.resolve({ data: { data: [] } }),
      masterApi.jenisKendaraan.list({ page: 1, limit: 500 }),
      masterApi.profesi.list({ page: 1, limit: 500 }),
      masterApi.cidera.list({ page: 1, limit: 500 }),
      masterApi.sifatLaka.list({ page: 1, limit: 500 }),
      masterApi.faktorPenyebab.list({ page: 1, limit: 500 }),
      masterApi.kasusTabrak.list({ page: 1, limit: 500 }),
      masterApi.tindakLanjut.list({ page: 1, limit: 500 }),
      masterApi.jenisJaminan.list({ page: 1, limit: 500 }),
      masterApi.keterjaminan.list({ page: 1, limit: 500 }),
      masterApi.rumahsakit.list({ wilayah_id: wilayahId, page: 1, limit: 500 }),
    ]).then(([pol, jk, prof, cid, sifat, faktor, kasus, tl, jj, ket, rs]) => {
      setPolres(pol.data.data || [])
      setJenisKendaraan(jk.data.data || [])
      setProfesi(prof.data.data || [])
      setCidera(cid.data.data || [])
      setSifatLaka(sifat.data.data || [])
      setFaktorPenyebab(faktor.data.data || [])
      setKasusTabrak(kasus.data.data || [])
      setTindakLanjut(tl.data.data || [])
      setJenisJaminan(jj.data.data || [])
      setKeterjaminan(ket.data.data || [])
      setRumahSakit(rs.data.data || [])
    }).catch(() => showError('Gagal memuat data referensi. Cek koneksi server.')).finally(() => setMasterLoading(false))
  }, [user?.wilayah_id, showError])

  // Fetch kecamatan when polres changes
  useEffect(() => {
    if (!polresId) { setKecamatan([]); setKecamatanId(''); setKelurahan([]); setKelurahanId(''); return }
    masterApi.kecamatan.listByPolres(Number(polresId), { page: 1, limit: 100 }).then((res) => {
      setKecamatan(res.data.data || [])
      setKecamatanId('')
      setKelurahan([])
      setKelurahanId('')
    })
  }, [polresId])

  // Fetch kelurahan when kecamatan changes
  useEffect(() => {
    if (!kecamatanId) { setKelurahan([]); setKelurahanId(''); return }
    masterApi.kelurahan(Number(kecamatanId)).then((res) => {
      setKelurahan(res.data.data || [])
      setKelurahanId('')
    })
  }, [kecamatanId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!polresId) { showError('Pilih polres terlebih dahulu.'); return }
    if (!kecamatanId || !kelurahanId) { showError('Pilih kecamatan dan kelurahan terlebih dahulu.'); return }
    if (vehicles.some((v) => !v.nopol || !v.jenis_kendaraan_id)) { showError('Lengkapi data semua kendaraan.'); return }
    if (victims.some((v) => !v.nama || !v.usia)) { showError('Lengkapi nama dan usia semua korban.'); return }

    setIsSaving(true)
    const payload: CreateLaporanPayload = {
      no_lp: noLp,
      polres_id: Number(polresId),
      tanggal_laka: tanggalLaka,
      hari_kejadian: weekday,
      tanggal_lp: tanggalLp,
      telat_lp: telat,
      kecamatan_id: Number(kecamatanId),
      kelurahan_id: Number(kelurahanId),
      lokasi_laka: lokasi,
      keterangan: keterangan || null,
      laka_tunggal: lakaTunggal,
      sifat_laka_id: sifatLakaId ? Number(sifatLakaId) : null,
      faktor_penyebab_laka_id: faktorId ? Number(faktorId) : null,
      kasus_tabrak_kecelakaan_id: kasusId ? Number(kasusId) : null,
      rumah_sakit_id: rumahSakitId ? Number(rumahSakitId) : null,
      rumah_sakit_wilayah: rumahSakitWilayah || null,
      kendaraan: vehicles.map((v) => ({
        peran: v.peran,
        jenis_kendaraan_id: Number(v.jenis_kendaraan_id),
        nopol: v.nopol,
        masa_laku_sw: v.masa_laku_sw || undefined,
      })),
      korban: victims.map((v) => ({
        nama: v.nama,
        usia: Number(v.usia),
        profesi_id: v.profesi_id ? Number(v.profesi_id) : undefined,
        cidera_id: v.cidera_id ? Number(v.cidera_id) : undefined,
        kendaraan_index: Number(v.kendaraan_index),
        tindak_lanjut_id: v.tindak_lanjut_id ? Number(v.tindak_lanjut_id) : undefined,
        jenis_jaminan_id: v.jenis_jaminan_id ? Number(v.jenis_jaminan_id) : undefined,
        keterjaminan_id: v.keterjaminan_id ? Number(v.keterjaminan_id) : undefined,
      })),
    }

    try {
      await laporanApi.create(payload)
      success('Laporan berhasil disimpan!')
      router.push(`${base}/laporan-polisi`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan laporan.'
      showError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const SectionHeader = ({ icon: Icon, title, desc, index }: { icon: React.ElementType; title: string; desc: string; index: number }) => (
    <div className="mb-5 flex items-center gap-3 border-b pb-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={18} /></div>
      <div className="flex-1"><h3 className="font-semibold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{desc}</p></div>
      {/* Kontrol urutan: panah naik/turun (drag handle ada di wrapper section) */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => moveSection(index, -1)}
          disabled={index === 0}
          aria-label="Naikkan urutan"
          title="Naikkan"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronUp size={15} />
        </button>
        <button
          type="button"
          onClick={() => moveSection(index, 1)}
          disabled={index === sectionOrder.length - 1}
          aria-label="Turunkan urutan"
          title="Turunkan"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </div>
  )

  if (masterLoading) {
    return (
      <SILakaShell title="Buat Laporan Baru" eyebrow="Laporan Polisi">
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat data referensi...</span>
        </div>
      </SILakaShell>
    )
  }

  return (
    <SILakaShell title="Buat Laporan Baru" eyebrow="Laporan Polisi">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Info urutan + reset */}
        <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-2.5">
          <div className="text-xs text-muted-foreground">
            <p>Anda dapat mengatur urutan bagian form: pakai panah ↑↓ atau seret kartu ke posisi yang diinginkan. Urutan tersimpan di perangkat ini.</p>
            {isSuperadmin && (
              <p className="mt-1 flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                {/* <ShieldAlert size={13} className="mt-0.5 shrink-0" /> */}
                Anda login sebagai Superadmin. Disarankan tidak menginput laporan kecelakaan — gunakan akun admin wilayah atau hubungi administrator terkait.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={resetOrder}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <RotateCcw size={12} /> Reset Urutan
          </button>
        </div>

        {sectionOrder.map((key, index) => {
          const wrapperProps = {
            draggable: true,
            onDragStart: () => setDragIndex(index),
            onDragOver: (e: React.DragEvent) => e.preventDefault(),
            onDrop: () => handleDrop(index),
            onDragEnd: () => setDragIndex(null),
            className: `rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 md:p-6 ${dragIndex === index ? 'opacity-60 ring-2 ring-primary/40' : ''}`,
          }

          if (key === 'identitas') {
            return (
              <section key={key} {...wrapperProps}>
                <SectionHeader icon={MapPin} title="Identitas & Waktu Kejadian" desc="Nomor laporan dan waktu kejadian perkara" index={index} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nomor LP" required>
                    <input required value={noLp} onChange={(e) => setNoLp(e.target.value)} placeholder="Nomor LP" className={inputClass} />
                  </Field>
                  <Field label="Hari">
                    <input readOnly value={weekday} className={`${inputClass} bg-muted cursor-not-allowed text-muted-foreground`} />
                  </Field>
                  <Field label="Tanggal Kejadian" required>
                    <input required type="date" value={tanggalLaka} onChange={(e) => setTanggalLaka(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Tanggal LP" required>
                    <input required type="date" value={tanggalLp} onChange={(e) => setTanggalLp(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Telat LP (hari)">
                    <input readOnly value={telat} className={`${inputClass} bg-muted cursor-not-allowed text-muted-foreground`} />
                  </Field>
                </div>
              </section>
            )
          }

          if (key === 'lokasi') {
            return (
              <section key={key} {...wrapperProps}>
                <SectionHeader icon={MapPin} title="Lokasi Kejadian" desc="Wilayah dan tempat kejadian perkara" index={index} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Polres" required>
                    <SearchableSelect options={polres} value={polresId} onChange={(id) => setPolresId(id ? String(id) : '')} placeholder="Pilih polres" clearable={false} />
                  </Field>
                  <Field label="Kecamatan" required>
                    <SearchableSelect options={kecamatan} value={kecamatanId} onChange={(id) => setKecamatanId(id ? String(id) : '')} placeholder={polresId ? 'Pilih kecamatan' : 'Pilih polres dahulu'} disabled={!polresId} clearable={false} />
                  </Field>
                  <Field label="Kelurahan" required>
                    <SearchableSelect options={kelurahan} value={kelurahanId} onChange={(id) => setKelurahanId(id ? String(id) : '')} placeholder={kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan dahulu'} disabled={!kecamatanId} clearable={false} />
                  </Field>
                  <Field label="Jalan / Tempat Kejadian" required>
                    <input required value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="Jl. Slamet Riyadi No. 10" className={inputClass} />
                  </Field>
                  <Field label="Rumah Sakit">
                    <SearchableSelect options={rumahSakit} value={rumahSakitId} onChange={(id) => setRumahSakitId(id ? String(id) : '')} placeholder="Pilih rumah sakit" />
                  </Field>
                  <Field label="RS Luar Wilayah (Opsional)">
                    <input value={rumahSakitWilayah} onChange={(e) => setRumahSakitWilayah(e.target.value)} placeholder="Rumah sakit wilayah lain" className={inputClass} />
                  </Field>
                </div>
              </section>
            )
          }

          if (key === 'kendaraan') {
            return (
              <section key={key} {...wrapperProps}>
                <SectionHeader icon={CarFront} title="Data Kendaraan" desc="Tambahkan semua kendaraan yang terlibat" index={index} />
                <div className="space-y-4">
                  {vehicles.map((v, i) => (
                    <div key={i} className="rounded-lg border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{getVehicleLabel(vehicles, i)}</span>
                        {vehicles.length > 1 && (
                          <button type="button" onClick={() => setVehicles(vehicles.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/70 cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <Field label="Peran">
                          <select value={v.peran} onChange={(e) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, peran: e.target.value as 'korban' | 'penjamin' } : x))} className={selectClass}>
                            <option value="korban">Korban</option>
                            <option value="penjamin">Penjamin</option>
                          </select>
                        </Field>
                        <Field label="Jenis Kendaraan" required>
                          <SearchableSelect options={jenisKendaraan} value={v.jenis_kendaraan_id} onChange={(id) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, jenis_kendaraan_id: id ? String(id) : '' } : x))} placeholder="Pilih jenis" clearable={false} />
                        </Field>
                        <Field label="Nopol" required>
                          <input required value={v.nopol} onChange={(e) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, nopol: e.target.value.toUpperCase() } : x))} placeholder="Nopol Kendaraan" className={inputClass} />
                        </Field>
                        <Field label="Masa Laku SW">
                          <input type="date" value={v.masa_laku_sw || ''} onChange={(e) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, masa_laku_sw: e.target.value } : x))} className={inputClass} />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setVehicles([...vehicles, emptyVehicle()])} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
                    <Plus size={13} /> Tambah Kendaraan
                  </button>
                </div>
              </section>
            )
          }

          if (key === 'korban') {
            return (
              <section key={key} {...wrapperProps}>
                <SectionHeader icon={HeartPulse} title="Data Korban" desc="Tambahkan semua korban yang terlibat" index={index} />
                <div className="space-y-4">
                  {victims.map((v, i) => (
                    <div key={i} className="rounded-lg border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Korban #{i + 1}</span>
                        {victims.length > 1 && (
                          <button type="button" onClick={() => setVictims(victims.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/70 cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <Field label="Nama" required>
                          <input required value={v.nama} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, nama: e.target.value } : x))} placeholder="Nama korban" className={inputClass} />
                        </Field>
                        <Field label="Usia" required>
                          <input required type="number" min="0" max="120" value={v.usia} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, usia: e.target.value } : x))} placeholder="35" className={inputClass} />
                        </Field>
                        <Field label="Profesi">
                          <SearchableSelect options={profesi} value={v.profesi_id} onChange={(id) => setVictims(victims.map((x, j) => j === i ? { ...x, profesi_id: id ? String(id) : '' } : x))} placeholder="Pilih profesi" />
                        </Field>
                        <Field label="Jenis Cidera">
                          <SearchableSelect options={cidera} value={v.cidera_id} onChange={(id) => setVictims(victims.map((x, j) => j === i ? { ...x, cidera_id: id ? String(id) : '' } : x))} placeholder="Pilih cidera" />
                        </Field>
                        <Field label="Kendaraan (index)">
                          <select value={v.kendaraan_index} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, kendaraan_index: e.target.value } : x))} className={selectClass}>
                            {vehicles.map((veh, idx) => <option key={idx} value={idx}>{getVehicleLabel(vehicles, idx)} · {veh.nopol || '(belum diisi)'}</option>)}
                          </select>
                        </Field>
                        <Field label="Tindak Lanjut">
                          <SearchableSelect options={tindakLanjut} value={v.tindak_lanjut_id} onChange={(id) => setVictims(victims.map((x, j) => j === i ? { ...x, tindak_lanjut_id: id ? String(id) : '' } : x))} placeholder="Pilih tindak lanjut" />
                        </Field>
                        <Field label="Jenis Jaminan">
                          <SearchableSelect options={jenisJaminan} value={v.jenis_jaminan_id} onChange={(id) => setVictims(victims.map((x, j) => j === i ? { ...x, jenis_jaminan_id: id ? String(id) : '' } : x))} placeholder="Pilih jenis jaminan" />
                        </Field>
                        <Field label="Keterjaminan">
                          <SearchableSelect options={keterjaminan} value={v.keterjaminan_id} onChange={(id) => setVictims(victims.map((x, j) => j === i ? { ...x, keterjaminan_id: id ? String(id) : '' } : x))} placeholder="Pilih keterjaminan" />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setVictims([...victims, emptyVictim()])} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
                    <Plus size={13} /> Tambah Korban
                  </button>
                </div>
              </section>
            )
          }

          if (key === 'klasifikasi') {
            return (
              <section key={key} {...wrapperProps}>
                <SectionHeader icon={ShieldAlert} title="Klasifikasi Kejadian" desc="Jenis, faktor, dan tindak lanjut kejadian" index={index} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Sifat Laka">
                    <SearchableSelect options={sifatLaka} value={sifatLakaId} onChange={(id) => setSifatLakaId(id ? String(id) : '')} placeholder="Pilih sifat laka" />
                  </Field>
                  <Field label="Faktor Penyebab">
                    <SearchableSelect options={faktorPenyebab} value={faktorId} onChange={(id) => setFaktorId(id ? String(id) : '')} placeholder="Pilih faktor penyebab" />
                  </Field>
                  <Field label="Kasus Tabrak">
                    <SearchableSelect options={kasusTabrak} value={kasusId} onChange={(id) => setKasusId(id ? String(id) : '')} placeholder="Pilih kasus tabrak" />
                  </Field>
                  <Field label="Laka Tunggal">
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" id="laka-tunggal" checked={lakaTunggal} onChange={(e) => setLakaTunggal(e.target.checked)} className="size-4 rounded accent-primary" />
                      <label htmlFor="laka-tunggal" className="text-sm cursor-pointer">Ya, kecelakaan tunggal</label>
                    </div>
                  </Field>
                  <Field label="Keterangan">
                    <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Catatan tambahan (opsional)" className={inputClass} />
                  </Field>
                </div>
              </section>
            )
          }

          return null
        })}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-5">
          <button type="button" onClick={() => router.back()} className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
            Batal
          </button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-primary/20">
            {isSaving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : <><Save size={15} /> Simpan Laporan</>}
          </button>
        </div>

      </form>
    </SILakaShell>
  )
}
