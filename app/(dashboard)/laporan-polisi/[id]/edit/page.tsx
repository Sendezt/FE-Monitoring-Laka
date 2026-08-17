'use client'

import { useEffect, useMemo, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, MapPin, ShieldAlert, CarFront, HeartPulse, Loader2, Save, ArrowLeft } from 'lucide-react'
import { Field, inputClass, selectClass, SILakaShell } from '@/components/si-laka-shell'
import { laporanApi, masterApi, type MasterItem, type CreateLaporanPayload } from '@/lib/api'
import { useToast } from '@/components/ui/toast-provider'
import { getWeekday } from '@/lib/formatters'
import Link from 'next/link'

interface VehicleForm { id?: number; peran: 'korban' | 'penjamin'; jenis_kendaraan_id: string; nopol: string }
interface VictimForm { id?: number; nama: string; usia: string; profesi_id: string; cidera_id: string; kendaraan_index: string }

const emptyVehicle = (): VehicleForm => ({ peran: 'korban', jenis_kendaraan_id: '', nopol: '' })
const emptyVictim = (): VictimForm => ({ nama: '', usia: '', profesi_id: '', cidera_id: '', kendaraan_index: '0' })

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const reportId = Number(id)
  const { success, error: showError } = useToast()

  // Master data
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
  const [loading, setLoading] = useState(true)

  // Form state
  const [noLp, setNoLp] = useState('')
  const [tanggalLaka, setTanggalLaka] = useState('')
  const [tanggalLp, setTanggalLp] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [lokasi, setLokasi] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [lakaTunggal, setLakaTunggal] = useState(false)
  const [sifatLakaId, setSifatLakaId] = useState('')
  const [faktorId, setFaktorId] = useState('')
  const [kasusId, setKasusId] = useState('')
  const [tindakLanjutId, setTindakLanjutId] = useState('')
  const [jenisJaminanId, setJenisJaminanId] = useState('')
  const [keterjaminanId, setKeterjaminanId] = useState('')
  const [rumahSakitId, setRumahSakitId] = useState('')
  const [rumahSakitWilayah, setRumahSakitWilayah] = useState('')
  const [vehicles, setVehicles] = useState<VehicleForm[]>([])
  const [victims, setVictims] = useState<VictimForm[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const weekday = useMemo(() => getWeekday(tanggalLaka || new Date().toISOString().slice(0, 10)), [tanggalLaka])
  const telat = useMemo(() => {
    if (!tanggalLaka || !tanggalLp) return 0
    const d1 = new Date(tanggalLaka), d2 = new Date(tanggalLp)
    return Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / 86400000))
  }, [tanggalLaka, tanggalLp])

  useEffect(() => {
    Promise.all([
      masterApi.kecamatan(),
      masterApi.jenisKendaraan(),
      masterApi.profesi(),
      masterApi.cidera(),
      masterApi.sifatLaka(),
      masterApi.faktorPenyebab(),
      masterApi.kasusTabrak(),
      masterApi.tindakLanjut(),
      masterApi.jenisJaminan(),
      masterApi.keterjaminan(),
      masterApi.rumahsakit(),
      laporanApi.get(reportId),
    ]).then(([kec, jk, prof, cid, sifat, faktor, kasus, tl, jj, ket, rs, rep]) => {
      setKecamatan(kec.data.data || [])
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

      const data = rep.data.data
      setNoLp(data.no_lp)
      setTanggalLaka(data.tanggal_laka)
      setTanggalLp(data.tanggal_lp)
      setKecamatanId(String(data.kecamatan_id))
      
      // Load kelurahan options
      masterApi.kelurahan(data.kecamatan_id).then((res) => {
        setKelurahan(res.data.data || [])
        setKelurahanId(String(data.kelurahan_id))
      })

      setLokasi(data.lokasi_laka)
      setKeterangan(data.keterangan || '')
      setLakaTunggal(data.laka_tunggal)
      setSifatLakaId(data.sifat_laka_id ? String(data.sifat_laka_id) : '')
      setFaktorId(data.faktor_penyebab_laka_id ? String(data.faktor_penyebab_laka_id) : '')
      setKasusId(data.kasus_tabrak_kecelakaan_id ? String(data.kasus_tabrak_kecelakaan_id) : '')
      setTindakLanjutId(data.tindak_lanjut_id ? String(data.tindak_lanjut_id) : '')
      setJenisJaminanId(data.jenis_jaminan_id ? String(data.jenis_jaminan_id) : '')
      setKeterjaminanId(data.keterjaminan_id ? String(data.keterjaminan_id) : '')
      setRumahSakitId(data.rumah_sakit_id ? String(data.rumah_sakit_id) : '')
      setRumahSakitWilayah(data.rumah_sakit_wilayah || '')
      
      setVehicles((data.kendaraan || []).map(v => ({
        id: v.id,
        peran: v.peran,
        jenis_kendaraan_id: String(v.jenis_kendaraan_id),
        nopol: v.nopol
      })))
      
      setVictims((data.korban || []).map(v => ({
        id: v.id,
        nama: v.nama,
        usia: String(v.usia),
        profesi_id: v.profesi_id ? String(v.profesi_id) : '',
        cidera_id: v.cidera_id ? String(v.cidera_id) : '',
        kendaraan_index: String(v.kendaraan_index || (v.kendaraan_id ? data.kendaraan?.findIndex(k => k.id === v.kendaraan_id) ?? 0 : 0))
      })))
      
      if (!data.kendaraan?.length) setVehicles([emptyVehicle()])
      if (!data.korban?.length) setVictims([emptyVictim()])

    }).catch(() => showError('Gagal memuat data. Cek koneksi server.'))
    .finally(() => setLoading(false))
  }, [reportId, showError])

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setKecamatanId(val)
    if (!val) {
      setKelurahan([])
      setKelurahanId('')
      return
    }
    masterApi.kelurahan(Number(val)).then((res) => {
      setKelurahan(res.data.data || [])
      setKelurahanId('')
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kecamatanId || !kelurahanId) { showError('Pilih kecamatan dan kelurahan terlebih dahulu.'); return }
    if (vehicles.some((v) => !v.nopol || !v.jenis_kendaraan_id)) { showError('Lengkapi data semua kendaraan.'); return }
    if (victims.some((v) => !v.nama || !v.usia)) { showError('Lengkapi nama dan usia semua korban.'); return }

    setIsSaving(true)
    const payload: Partial<CreateLaporanPayload> = {
      no_lp: noLp,
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
      tindak_lanjut_id: tindakLanjutId ? Number(tindakLanjutId) : null,
      jenis_jaminan_id: jenisJaminanId ? Number(jenisJaminanId) : null,
      keterjaminan_id: keterjaminanId ? Number(keterjaminanId) : null,
      rumah_sakit_id: rumahSakitId ? Number(rumahSakitId) : null,
      rumah_sakit_wilayah: rumahSakitWilayah || null,
      // API might handle full replacement or we just send the new arrays
      kendaraan: vehicles.map((v) => ({ peran: v.peran, jenis_kendaraan_id: Number(v.jenis_kendaraan_id), nopol: v.nopol })),
      korban: victims.map((v) => ({
        nama: v.nama,
        usia: Number(v.usia),
        profesi_id: v.profesi_id ? Number(v.profesi_id) : null,
        cidera_id: v.cidera_id ? Number(v.cidera_id) : null,
        kendaraan_index: Number(v.kendaraan_index),
      })),
    }

    try {
      await laporanApi.update(reportId, payload)
      success('Laporan berhasil diperbarui!')
      router.push(`/laporan-polisi/${reportId}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan laporan.'
      showError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const SectionHeader = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
    <div className="mb-5 flex items-center gap-3 border-b pb-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={18} /></div>
      <div><h3 className="font-semibold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{desc}</p></div>
    </div>
  )

  if (loading) {
    return (
      <SILakaShell title="Edit Laporan" eyebrow="Laporan Polisi">
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat data...</span>
        </div>
      </SILakaShell>
    )
  }

  return (
    <SILakaShell title={`Edit: ${noLp}`} eyebrow="Laporan Polisi">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/laporan-polisi/${reportId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} /> Kembali ke Detail
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identitas Laporan */}
        <section className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 md:p-6">
          <SectionHeader icon={MapPin} title="Identitas & Waktu Kejadian" desc="Nomor laporan dan waktu kejadian perkara" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nomor LP" required>
              <input required value={noLp} onChange={(e) => setNoLp(e.target.value)} placeholder="LP/123/VIII/2026" className={inputClass} />
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

        {/* Section 2: Lokasi */}
        <section className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 md:p-6">
          <SectionHeader icon={MapPin} title="Lokasi Kejadian" desc="Wilayah dan tempat kejadian perkara" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Kecamatan" required>
              <select required value={kecamatanId} onChange={handleKecamatanChange} className={selectClass}>
                <option value="">Pilih kecamatan</option>
                {kecamatan.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </Field>
            <Field label="Kelurahan" required>
              <select required value={kelurahanId} onChange={(e) => setKelurahanId(e.target.value)} disabled={!kecamatanId} className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}>
                <option value="">{kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan dahulu'}</option>
                {kelurahan.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </Field>
            <Field label="Jalan / Tempat Kejadian" required>
              <input required value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="Jl. Slamet Riyadi No. 10" className={inputClass} />
            </Field>
            <Field label="Rumah Sakit">
              <select value={rumahSakitId} onChange={(e) => setRumahSakitId(e.target.value)} className={selectClass}>
                <option value="">Pilih rumah sakit</option>
                {rumahSakit.map((r) => <option key={r.id} value={r.id}>{r.nama}</option>)}
              </select>
            </Field>
            <Field label="RS Luar Wilayah (Opsional)">
              <input value={rumahSakitWilayah} onChange={(e) => setRumahSakitWilayah(e.target.value)} placeholder="Nama RS jika tidak ada di daftar" className={inputClass} />
            </Field>
          </div>
        </section>

        {/* Section 3: Klasifikasi */}
        <section className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 md:p-6">
          <SectionHeader icon={ShieldAlert} title="Klasifikasi Kejadian" desc="Jenis, faktor, dan tindak lanjut kejadian" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Sifat Laka">
              <select value={sifatLakaId} onChange={(e) => setSifatLakaId(e.target.value)} className={selectClass}>
                <option value="">Pilih sifat laka</option>
                {sifatLaka.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </Field>
            <Field label="Faktor Penyebab">
              <select value={faktorId} onChange={(e) => setFaktorId(e.target.value)} className={selectClass}>
                <option value="">Pilih faktor penyebab</option>
                {faktorPenyebab.map((f) => <option key={f.id} value={f.id}>{f.nama}</option>)}
              </select>
            </Field>
            <Field label="Kasus Tabrak">
              <select value={kasusId} onChange={(e) => setKasusId(e.target.value)} className={selectClass}>
                <option value="">Pilih kasus tabrak</option>
                {kasusTabrak.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </Field>
            <Field label="Tindak Lanjut">
              <select value={tindakLanjutId} onChange={(e) => setTindakLanjutId(e.target.value)} className={selectClass}>
                <option value="">Pilih tindak lanjut</option>
                {tindakLanjut.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </Field>
            <Field label="Jenis Jaminan">
              <select value={jenisJaminanId} onChange={(e) => setJenisJaminanId(e.target.value)} className={selectClass}>
                <option value="">Pilih jenis jaminan</option>
                {jenisJaminan.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
              </select>
            </Field>
            <Field label="Keterjaminan">
              <select value={keterjaminanId} onChange={(e) => setKeterjaminanId(e.target.value)} className={selectClass}>
                <option value="">Pilih keterjaminan</option>
                {keterjaminan.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
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

        {/* Section 4: Kendaraan */}
        <section className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 md:p-6">
          <SectionHeader icon={CarFront} title="Data Kendaraan" desc="Tambahkan semua kendaraan yang terlibat" />
          <div className="space-y-4">
            {vehicles.map((v, i) => (
              <div key={i} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Kendaraan #{i + 1}</span>
                  {vehicles.length > 1 && (
                    <button type="button" onClick={() => setVehicles(vehicles.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/70 cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Peran">
                    <select value={v.peran} onChange={(e) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, peran: e.target.value as 'korban' | 'penjamin' } : x))} className={selectClass}>
                      <option value="korban">Korban</option>
                      <option value="penjamin">Penjamin</option>
                    </select>
                  </Field>
                  <Field label="Jenis Kendaraan" required>
                    <select required value={v.jenis_kendaraan_id} onChange={(e) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, jenis_kendaraan_id: e.target.value } : x))} className={selectClass}>
                      <option value="">Pilih jenis</option>
                      {jenisKendaraan.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </Field>
                  <Field label="Nopol" required>
                    <input required value={v.nopol} onChange={(e) => setVehicles(vehicles.map((x, j) => j === i ? { ...x, nopol: e.target.value.toUpperCase() } : x))} placeholder="AA 1234 BB" className={inputClass} />
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setVehicles([...vehicles, emptyVehicle()])} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
              <Plus size={13} /> Tambah Kendaraan
            </button>
          </div>
        </section>

        {/* Section 5: Korban */}
        <section className="rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 md:p-6">
          <SectionHeader icon={HeartPulse} title="Data Korban" desc="Tambahkan semua korban yang terlibat" />
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
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <Field label="Nama" required>
                    <input required value={v.nama} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, nama: e.target.value } : x))} placeholder="Nama korban" className={inputClass} />
                  </Field>
                  <Field label="Usia" required>
                    <input required type="number" min="0" max="120" value={v.usia} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, usia: e.target.value } : x))} placeholder="35" className={inputClass} />
                  </Field>
                  <Field label="Profesi">
                    <select value={v.profesi_id} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, profesi_id: e.target.value } : x))} className={selectClass}>
                      <option value="">Pilih profesi</option>
                      {profesi.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </Field>
                  <Field label="Jenis Cidera">
                    <select value={v.cidera_id} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, cidera_id: e.target.value } : x))} className={selectClass}>
                      <option value="">Pilih cidera</option>
                      {cidera.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                  </Field>
                  <Field label="Kendaraan (index)">
                    <select value={v.kendaraan_index} onChange={(e) => setVictims(victims.map((x, j) => j === i ? { ...x, kendaraan_index: e.target.value } : x))} className={selectClass}>
                      {vehicles.map((veh, idx) => <option key={idx} value={idx}>#{idx + 1} · {veh.nopol || '(belum diisi)'}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setVictims([...victims, emptyVictim()])} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
              <Plus size={13} /> Tambah Korban
            </button>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-5">
          <button type="button" onClick={() => router.back()} className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
            Batal
          </button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-primary/20">
            {isSaving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : <><Save size={15} /> Simpan Perubahan</>}
          </button>
        </div>
      </form>
    </SILakaShell>
  )
}
