import axios from 'axios'

// URL API diambil dari environment (.env.development untuk lokal, .env.production untuk VPS).
// Fallback ke localhost bila variabel tidak tersedia.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: inject Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor: handle 401 → clear & redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || ''
    const isAuthEndpoint = url.includes('/api/auth/login')
    // Jangan auto-redirect saat request login gagal (biarkan halaman login
    // menampilkan notifikasi kesalahan sendiri). Redirect hanya untuk sesi
    // yang kedaluwarsa pada request lain.
    if (error.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Typed helpers ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T = unknown> {
  success: boolean
  message: string
  data: T[]
  meta: { total: number; page: number; limit: number; total_pages: number }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  username: string
  nama_lengkap: string
  role: 'admin' | 'user'
  wilayah_id: number
  wilayah: { id: number; nama: string }
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: AuthUser }>>('/api/auth/login', { username, password }),
}

// ─── Laporan Polisi ───────────────────────────────────────────────────────────

export interface Kendaraan {
  id?: number
  peran: 'korban' | 'penjamin'
  jenis_kendaraan_id: number
  nopol: string
  masa_laku_sw?: string
  jenisKendaraan?: { id: number; nama: string }
}

export interface Korban {
  id?: number
  nama: string
  usia: number
  profesi_id?: number
  cidera_id?: number
  kendaraan_index?: number // for create all-in-one
  kendaraan_id?: number    // for GET response
  tindak_lanjut_id?: number
  jenis_jaminan_id?: number
  keterjaminan_id?: number
  profesi?: { id: number; nama: string }
  cidera?: { id: number; nama: string }
  tindakLanjut?: { id: number; nama: string }
  jenisJaminan?: { id: number; nama: string }
  keterjaminan?: { id: number; nama: string }
}

export interface LaporanPolisi {
  id: number
  no_lp: string
  polres_id?: number
  tanggal_laka: string
  hari_kejadian: string
  tanggal_lp: string
  telat_lp: number
  kecamatan_id: number
  kelurahan_id: number
  lokasi_laka: string
  rumah_sakit_id?: number
  rumah_sakit_wilayah?: string
  laka_tunggal: boolean
  kasus_tabrak_kecelakaan_id?: number
  faktor_penyebab_laka_id?: number
  sifat_laka_id?: number
  keterangan?: string
  kendaraan?: Kendaraan[]
  korban?: Korban[]
  polres?: { id: number; nama: string }
  kecamatan?: { id: number; nama: string }
  kelurahan?: { id: number; nama: string }
  created_at?: string
}

export interface CreateLaporanPayload {
  no_lp: string
  polres_id: number
  tanggal_laka: string
  hari_kejadian: string
  tanggal_lp: string
  telat_lp: number
  kecamatan_id: number
  kelurahan_id: number
  lokasi_laka: string
  rumah_sakit_id?: number | null
  rumah_sakit_wilayah?: string | null
  laka_tunggal: boolean
  kasus_tabrak_kecelakaan_id?: number | null
  faktor_penyebab_laka_id?: number | null
  sifat_laka_id?: number | null
  keterangan?: string | null
  kendaraan: Omit<Kendaraan, 'id' | 'jenis_kendaraan'>[]
  korban: Omit<Korban, 'id' | 'kendaraan_id' | 'profesi' | 'cidera' | 'tindakLanjut' | 'jenisJaminan' | 'keterjaminan'>[]
}

export interface KeterjaminanItem {
  id: number
  nama: string
  total: number
  persentase: string
}

export interface KeterjaminanCardData {
  total_korban: number
  rincian_keterjaminan: KeterjaminanItem[]
  tanpa_keterjaminan: {
    total: number
    persentase: string
  }
}

export interface RekapRow {
  id: number
  nama: string
  kode_loket: string
  wilayah: string
  jumlah_lp: number
  terlambat_lapor: number
  jumlah_korban: number
  laka_tunggal: number
  ll: number; ll_md: number; md: number
  terjamin: number; eg2r: number; tidak_terjamin: number
  kt_depan_depan: number; kt_depan_samping: number; kt_depan_belakang: number
  kt_belakang_samping: number; kt_samping_samping: number; kt_beruntun: number
  kt_ka: number; kt_pjk: number; kt_jatuh_sendiri: number; kt_ka_pjk: number
  pf_pelajar: number; pf_karyawan: number; pf_wiraswasta: number; pf_pns: number; pf_pedagang: number
  pf_buruh: number; pf_pensiunan: number; pf_guru: number; pf_petani: number; pf_rumah_tangga: number
  pf_tidak_bekerja: number; pf_supir: number; pf_lainnya: number
  jk_a: number; jk_b: number; jk_c1: number; jk_c2: number; jk_dp: number; jk_du: number
  jk_ep: number; jk_eu: number; jk_f: number; jk_ka: number; jk_sepeda: number; jk_pjk: number; jk_tabrak_lari: number
  telat_1_3: number; telat_4_7: number; telat_lebih_7: number
}

export const laporanApi = {
  list: (params?: { page?: number; limit?: number; sort_by?: string; sort_dir?: string; [key: string]: any }) =>
    api.get<PaginatedResponse<LaporanPolisi>>('/api/laporan-polisi', { params }),
  get: (id: number) => api.get<ApiResponse<LaporanPolisi>>(`/api/laporan-polisi/${id}`),
  create: (data: CreateLaporanPayload) => api.post<ApiResponse<LaporanPolisi>>('/api/laporan-polisi', data),
  update: (id: number, data: Partial<CreateLaporanPayload>) => api.put<ApiResponse<LaporanPolisi>>(`/api/laporan-polisi/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/api/laporan-polisi/${id}`),
  statistikKomparasi: (p: { start1: string; end1: string; start2: string; end2: string }) =>
    api.get<ApiResponse<unknown>>('/api/laporan-polisi/statistik/komparasi', { params: p }),
  statusLp: (params?: { from?: string; to?: string; polres_id?: string | number }) => api.get<ApiResponse<{
    total: number
    total_terlambat: number
    persentase_terlambat: string
    total_normal: number
    persentase_normal: string
  }>>('/api/laporan-polisi/status-lp', { params }),
  breakdownTerlambat: (params?: { from?: string; to?: string; polres_id?: string | number }) => api.get<ApiResponse<{
    total_terlambat: number
    terlambat_1_3_hari: number
    persentase_1_3_hari: string
    terlambat_4_7_hari: number
    persentase_4_7_hari: string
    terlambat_lebih_7_hari: number
    persentase_lebih_7_hari: string
  }>>('/api/laporan-polisi/breakdown-terlambat', { params }),
  jenisLaka: (params?: { from?: string; to?: string; polres_id?: string | number }) => api.get<ApiResponse<{
    total_laka: number
    laka_tunggal: {
      total: number
      persentase: string
    }
    laka_non_tunggal: {
      total: number
      persentase: string
    }
  }>>('/api/laporan-polisi/statistik/jenis-laka', { params }),
  statistikKorban: (params?: { from?: string; to?: string; polres_id?: string | number }) => api.get<ApiResponse<{
    total_korban: number
    cidera_LL: { total: number; persentase: string }
    cidera_LL_MD: { total: number; persentase: string }
    cidera_MD: { total: number; persentase: string }
  }>>('/api/laporan-polisi/statistik/korban', { params }),
  statistikKeterjaminan: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<KeterjaminanCardData>>('/api/laporan-polisi/statistik/keterjaminan', { params }),
  rekapitulasiPolres: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<{ rows: RekapRow[]; totals: RekapRow }>>('/api/laporan-polisi/rekapitulasi/polres', { params }),
  rekapitulasiLoket: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<{ rows: RekapRow[]; totals: RekapRow }>>('/api/laporan-polisi/rekapitulasi/loket', { params }),
}

// ─── Chart / Statistik per Wilayah (Loket) ────────────────────────────────────

export interface WilayahLakaItem {
  id: number
  nama: string
  total_laka: number
}

export interface TotalLakaPerWilayahData {
  total_keseluruhan: number
  data_wilayah: WilayahLakaItem[]
}

export interface WilayahKorbanItem {
  id: number
  nama: string
  total_korban: number
}

export interface KasusTabrakItem {
  id: number
  nama: string
  total: number
  persentase: string
}

export interface KasusTabrakData {
  total_laporan: number
  rincian_kasus: KasusTabrakItem[]
  tanpa_kasus: { total: number; persentase: string }
}

export interface ProfesiKorbanItem {
  id: number
  nama: string
  total: number
  persentase: string
}

export interface ProfesiKorbanData {
  total_korban: number
  rincian_profesi: ProfesiKorbanItem[]
  tanpa_profesi: { total: number; persentase: string }
}

export interface JenisKendaraanKorbanItem {
  id: number
  nama: string
  total: number
  persentase: string
}

export interface JenisKendaraanKorbanData {
  total_korban: number
  rincian_jenis_kendaraan: JenisKendaraanKorbanItem[]
  tanpa_kendaraan: { total: number; persentase: string }
}

export interface TotalKorbanPerWilayahData {
  total_keseluruhan: number
  data_wilayah: WilayahKorbanItem[]
}

export interface TopKecamatanLakaItem {
  kecamatan_id: number
  nama_kecamatan: string
  total_laka: number
}

export interface TopRumahSakitKorbanItem {
  rumah_sakit_id: number
  nama_rumah_sakit: string
  total_korban: number
}

export interface TrendHarianItem {
  tanggal: string // format "01", "02", ... sesuai hari dalam bulan
  lp_periode_utama: number
  korban_periode_utama: number
  lp_periode_pembanding: number
  korban_periode_pembanding: number
}

export interface TrendHarianData {
  periode_utama: {
    tanggal_awal: string
    tanggal_akhir: string
  }
  periode_pembanding: {
    tanggal_awal: string
    tanggal_akhir: string
  }
  trend: TrendHarianItem[]
}

export const chartApi = {
  totalLakaPerWilayah: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<TotalLakaPerWilayahData>>('/api/chart/statistik/total-laka-per-wilayah', { params }),
  totalKorbanPerWilayah: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<TotalKorbanPerWilayahData>>('/api/chart/statistik/total-korban-per-wilayah', { params }),
  kasusTabrak: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<KasusTabrakData>>('/api/chart/statistik/kasus-tabrak', { params }),
  korbanPerProfesi: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<ProfesiKorbanData>>('/api/chart/statistik/korban-per-profesi', { params }),
  korbanPerJenisKendaraan: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<JenisKendaraanKorbanData>>('/api/chart/statistik/korban-per-jenis-kendaraan', { params }),
  topKecamatanLaka: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<TopKecamatanLakaItem[]>>('/api/chart/statistik/top-20-kecamatan-laka', { params }),
  topRumahSakitKorban: (params?: { from?: string; to?: string; polres_id?: string | number }) =>
    api.get<ApiResponse<TopRumahSakitKorbanItem[]>>('/api/chart/statistik/top-15-rumah-sakit-korban', { params }),
  trendHarian: (params: { tanggal_awal: string; tanggal_akhir: string; polres_id: string }) =>
    api.get<ApiResponse<TrendHarianData>>('/api/chart/statistik/trend-harian', { params }),
}

// ─── Migrasi (Google Sheets) ───────────────────────────────────────────────────

export interface MigrasiIssue {
  field: string
  value: string
}

export type MigrasiStatus = 'VALID' | 'INVALID_MASTER' | 'DUPLICATE'

export interface MigrasiKendaraanPayload {
  peran: 'korban' | 'penjamin'
  jenis_kendaraan_id: number | null
  jenis_kendaraan_nama?: string | null
  nopol: string
  masa_laku_sw: string | null
}

export interface MigrasiKorbanPayload {
  nama: string
  usia: number | null
  profesi_id: number | null
  profesi_nama?: string | null
  cidera_id: number | null
  cidera_nama?: string | null
  kendaraan_index: number | null
  tindak_lanjut_id: number | null
  tindak_lanjut_nama?: string | null
  jenis_jaminan_id: number | null
  jenis_jaminan_nama?: string | null
  keterjaminan_id: number | null
  keterjaminan_nama?: string | null
}

export interface MigrasiLabels {
  polres: string | null
  kecamatan: string | null
  kelurahan: string | null
  kelurahan_from_lokasi?: boolean
  rumah_sakit: string | null
  kasus_tabrak_kecelakaan: string | null
  faktor_penyebab_laka: string | null
  sifat_laka: string | null
}

export interface MigrasiPayload {
  no_lp: string
  polres_id: number | null
  tanggal_laka: string | null
  hari_kejadian: string | null
  tanggal_lp: string | null
  kecamatan_id: number | null
  kelurahan_id: number | null
  lokasi_laka: string
  rumah_sakit_id: number | null
  rumah_sakit_wilayah: string | null
  laka_tunggal: boolean
  kasus_tabrak_kecelakaan_id: number | null
  faktor_penyebab_laka_id: number | null
  sifat_laka_id: number | null
  keterangan: string | null
  kendaraan: MigrasiKendaraanPayload[]
  korban: MigrasiKorbanPayload[]
  labels?: MigrasiLabels
}

export interface MigrasiRawLaporan {
  no_lp: string
  tanggal_laka: string
  tanggal_lp: string
  kecamatan: string
  kelurahan: string
  lokasi_laka: string
  rs_sendiri: string
  rs_lain: string
  laka_tunggal: string
  kasus_tabrakan: string
  faktor_penyebab: string
  sifat_laka: string
  keterangan: string
  hari: string
  hari_kejadian: string
  nomor_urut: number
  [key: string]: unknown
}

export interface MigrasiRow {
  no_lp: string
  nomor_urut: number
  status: MigrasiStatus
  duplicate: boolean
  missing_fields: string[]
  issues: MigrasiIssue[]
  raw: MigrasiRawLaporan
  payload: MigrasiPayload
}

export interface MigrasiSheetData {
  sheet: string
  start_row?: number
  end_row?: number
  detected_polres?: string | null
  detected_polres_id?: number | null
  detected_wilayah_id?: number | null
  total?: number
  rows: MigrasiRow[]
}

export interface MigrasiCheckResult {
  no_lp: string
  status: MigrasiStatus
  insertable: boolean
  duplicate: boolean
  missing_fields: string[]
}

export const migrasiApi = {
  sheets: (params?: { sheet?: string | number; startRow?: number; endRow?: number }) =>
    api.get<ApiResponse<MigrasiSheetData>>('/api/migrasi/sheets', { params }),
  check: (payload: MigrasiPayload) =>
    api.post<ApiResponse<MigrasiCheckResult>>('/api/migrasi/check', { payload }),
  import: (payload: MigrasiPayload) =>
    api.post<ApiResponse<LaporanPolisi>>('/api/migrasi/import', { payload }),
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  nama_lengkap: string
  role: 'admin' | 'user'
  wilayah_id: number
  wilayah?: { id: number; nama: string }
  is_active: boolean
}

export const usersApi = {
  list: () => api.get<ApiResponse<User[]>>('/api/users', { params: { page: 1, limit: 100 } }),
  get: (id: number) => api.get<ApiResponse<User>>(`/api/users/${id}`),
  create: (data: { username: string; nama_lengkap: string; password: string; role: string; wilayah_id?: number | null }) =>
    api.post<ApiResponse<User>>('/api/users', data),
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: number
  aksi: string
  tabel: string
  record_id: number
  waktu: string
  deskripsi?: string
  user: { id: number; username: string; nama_lengkap: string }
}

export const activityLogApi = {
  list: (params?: { user_id?: number; tabel?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<ActivityLog>>('/api/activity-log', { params }),
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export interface MasterItem { id: number; nama: string }

const masterGet = (url: string) => () => api.get<ApiResponse<MasterItem[]>>(url)

const withPaging = (params: Record<string, unknown> = {}) => ({
  page: 1,
  limit: 500,
  ...params,
})

// Create generic CRUD factory for master data
const masterCrud = (baseUrl: string) => ({
  list: (params?: number | Record<string, unknown>) => {
    const normalized = typeof params === 'number' ? { wilayah_id: params } : (params ?? {})
    return api.get<ApiResponse<MasterItem[]>>(baseUrl, { params: withPaging(normalized as Record<string, unknown>) })
  },
  get: (id: number) => api.get<ApiResponse<MasterItem>>(`${baseUrl}/${id}`),
  create: (data: { nama: string }) => api.post<ApiResponse<MasterItem>>(baseUrl, data),
  update: (id: number, data: { nama: string }) => api.put<ApiResponse<MasterItem>>(`${baseUrl}/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`${baseUrl}/${id}`),
})

export const masterApi = {
  wilayah: masterCrud('/api/wilayah'),
  polres: {
    ...masterCrud('/api/polres'),
    listByWilayah: (wilayahId: number, params?: Record<string, unknown>) =>
      api.get<ApiResponse<MasterItem[]>>(`/api/polres/wilayah/${wilayahId}`, { params: withPaging(params ?? {}) }),
  },
  kecamatan: {
    ...masterCrud('/api/kecamatan'),
    listByPolres: (polresId: number, params?: Record<string, unknown>) =>
      api.get<ApiResponse<MasterItem[]>>(`/api/kecamatan/polres/${polresId}`, { params: withPaging(params ?? {}) }),
  },
  kelurahan: (kecamatan_id?: number, params?: Record<string, unknown>) =>
    api.get<ApiResponse<MasterItem[]>>('/api/kelurahan', {
      params: withPaging({
        ...(kecamatan_id ? { kecamatan_id } : {}),
        ...(params ?? {}),
      })
    }),
  kelurahanCrud: masterCrud('/api/kelurahan'),
  rumahsakit: masterCrud('/api/rumahsakit'),
  profesi: masterCrud('/api/profesi'),
  tindakLanjut: masterCrud('/api/tindak-lanjut'),
  cidera: masterCrud('/api/cidera'),
  keterjaminan: masterCrud('/api/keterjaminan'),
  sifatLaka: masterCrud('/api/sifat-laka'),
  jenisKendaraan: masterCrud('/api/jenis-kendaraan'),
  kasusTabrak: masterCrud('/api/kasus-tabrak-kecelakaan'),
  faktorPenyebab: masterCrud('/api/faktor-penyebab-laka'),
  jenisJaminan: masterCrud('/api/jenis-jaminan'),
}