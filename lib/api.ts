import axios from 'axios'

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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
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
  profesi?: { id: number; nama: string }
  cidera?: { id: number; nama: string }
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
  tindak_lanjut_id?: number
  jenis_jaminan_id?: number
  keterjaminan_id?: number
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
  tindak_lanjut_id?: number | null
  jenis_jaminan_id?: number | null
  keterjaminan_id?: number | null
  kasus_tabrak_kecelakaan_id?: number | null
  faktor_penyebab_laka_id?: number | null
  sifat_laka_id?: number | null
  keterangan?: string | null
  kendaraan: Omit<Kendaraan, 'id' | 'jenis_kendaraan'>[]
  korban: Omit<Korban, 'id' | 'kendaraan_id' | 'profesi' | 'cidera'>[]
}

export interface KeterjaminanItem {
  id: number
  nama: string
  total: number
  persentase: string
}

export interface KeterjaminanCardData {
  total_laporan: number
  rincian_keterjaminan: KeterjaminanItem[]
  tanpa_keterjaminan: {
    total: number
    persentase: string
  }
}

export const laporanApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<LaporanPolisi>>('/api/laporan-polisi', { params }),
  get: (id: number) => api.get<ApiResponse<LaporanPolisi>>(`/api/laporan-polisi/${id}`),
  create: (data: CreateLaporanPayload) => api.post<ApiResponse<LaporanPolisi>>('/api/laporan-polisi', data),
  update: (id: number, data: Partial<CreateLaporanPayload>) => api.put<ApiResponse<LaporanPolisi>>(`/api/laporan-polisi/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/api/laporan-polisi/${id}`),
  statistikKomparasi: (p: { start1: string; end1: string; start2: string; end2: string }) =>
    api.get<ApiResponse<unknown>>('/api/laporan-polisi/statistik/komparasi', { params: p }),
  statusLp: () => api.get<ApiResponse<{
    total: number
    total_terlambat: number
    persentase_terlambat: string
    total_normal: number
    persentase_normal: string
  }>>('/api/laporan-polisi/status-lp'),
  breakdownTerlambat: () => api.get<ApiResponse<{
    total_terlambat: number
    terlambat_1_3_hari: number
    persentase_1_3_hari: string
    terlambat_4_7_hari: number
    persentase_4_7_hari: string
    terlambat_lebih_7_hari: number
    persentase_lebih_7_hari: string
  }>>('/api/laporan-polisi/breakdown-terlambat'),
  jenisLaka: () => api.get<ApiResponse<{
    total_laka: number
    laka_tunggal: {
      total: number
      persentase: string
    }
    laka_non_tunggal: {
      total: number
      persentase: string
    }
  }>>('/api/laporan-polisi/statistik/jenis-laka'),
  statistikKorban: () => api.get<ApiResponse<{
    total_korban: number
    cidera_LL: { total: number; persentase: string }
    cidera_LL_MD: { total: number; persentase: string }
    cidera_MD: { total: number; persentase: string }
  }>>('/api/laporan-polisi/statistik/korban'),
  statistikKeterjaminan: () =>
    api.get<ApiResponse<KeterjaminanCardData>>('/api/laporan-polisi/statistik/keterjaminan'),
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

export const chartApi = {
  totalLakaPerWilayah: () =>
    api.get<ApiResponse<TotalLakaPerWilayahData>>('/api/chart/statistik/total-laka-per-wilayah'),
  totalKorbanPerWilayah: () =>
    api.get<ApiResponse<TotalKorbanPerWilayahData>>('/api/chart/statistik/total-korban-per-wilayah'),
  kasusTabrak: () =>
    api.get<ApiResponse<KasusTabrakData>>('/api/chart/statistik/kasus-tabrak'),
  korbanPerProfesi: () =>
    api.get<ApiResponse<ProfesiKorbanData>>('/api/chart/statistik/korban-per-profesi'),
  korbanPerJenisKendaraan: () =>
    api.get<ApiResponse<JenisKendaraanKorbanData>>('/api/chart/statistik/korban-per-jenis-kendaraan'),
  topKecamatanLaka: () =>
    api.get<ApiResponse<TopKecamatanLakaItem[]>>('/api/chart/statistik/top-20-kecamatan-laka'),
  topRumahSakitKorban: () =>
    api.get<ApiResponse<TopRumahSakitKorbanItem[]>>('/api/chart/statistik/top-15-rumah-sakit-korban'),
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