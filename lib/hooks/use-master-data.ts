'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { masterApi, type MasterItem } from '@/lib/api'

// ─── Master Data Hooks (TanStack Query) ─────────────────────────────────────────
// Master data (polres, wilayah, kategori, dll) jarang berubah, jadi di-cache lama
// (30 menit). Data dipakai lintas halaman (form tambah/edit, detail, monitor) —
// dengan cache ini, list yang sama tidak di-fetch berulang tiap buka halaman.
// Saat ada CRUD master, list otomatis di-refresh via invalidateQueries.

const MASTER_STALE_TIME = 30 * 60 * 1000 // 30 menit
const MASTER_GC_TIME = 60 * 60 * 1000 // simpan di cache 1 jam

// Query key terpusat agar konsisten antara fetch dan invalidate.
export const masterKeys = {
  all: ['master'] as const,
  list: (apiKey: string, params?: unknown) =>
    params === undefined
      ? (['master', apiKey] as const)
      : (['master', apiKey, params] as const),
}

type MasterApiModule = {
  list: (params?: number | Record<string, unknown>) => Promise<{ data?: { data?: MasterItem[] } }>
  create: (data: { nama: string }) => Promise<unknown>
  update: (id: number, data: { nama: string }) => Promise<unknown>
  delete: (id: number) => Promise<unknown>
}

function resolveModule(apiKey: string): MasterApiModule {
  return (masterApi as Record<string, unknown>)[apiKey] as MasterApiModule
}

/**
 * Ambil daftar master data ber-cache untuk sebuah apiKey (mis. 'polres', 'wilayah').
 * Menggantikan pola useEffect + useState + fetch manual.
 */
export function useMasterList(
  apiKey: string,
  params?: number | Record<string, unknown>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: masterKeys.list(apiKey, params ?? undefined),
    queryFn: async () => {
      const res = await resolveModule(apiKey).list(params)
      return res.data?.data ?? []
    },
    staleTime: MASTER_STALE_TIME,
    gcTime: MASTER_GC_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Mutasi (create/update/delete) master data. Setelah sukses, semua list untuk
 * apiKey tersebut di-invalidate sehingga komponen mana pun yang menampilkannya
 * otomatis refresh — tidak perlu fetch manual.
 */
export function useMasterMutations(apiKey: string) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['master', apiKey] })

  const create = useMutation({
    mutationFn: (data: { nama: string }) => resolveModule(apiKey).create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nama: string } }) =>
      resolveModule(apiKey).update(id, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => resolveModule(apiKey).delete(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

// ─── Hooks khusus (relasi/cascading) ────────────────────────────────────────────
// Master data yang di-scope oleh relasi tetap di-cache 30 menit. Query hanya jalan
// (enabled) saat id parent tersedia, sehingga tidak ada fetch sia-sia.

async function unwrap(promise: Promise<{ data?: { data?: MasterItem[] } }>) {
  const res = await promise
  return res.data?.data ?? []
}

/** Polres yang di-scope wilayah user (dipakai di form tambah/edit). */
export function usePolresByWilayah(wilayahId?: number | null) {
  return useQuery({
    queryKey: ['master', 'polres', 'wilayah', wilayahId] as const,
    queryFn: () => unwrap(masterApi.polres.listByWilayah(wilayahId as number, { page: 1, limit: 100 })),
    staleTime: MASTER_STALE_TIME,
    gcTime: MASTER_GC_TIME,
    enabled: wilayahId != null,
  })
}

/** Kecamatan berdasarkan polres terpilih. */
export function useKecamatanByPolres(polresId?: number | null) {
  return useQuery({
    queryKey: ['master', 'kecamatan', 'polres', polresId] as const,
    queryFn: () => unwrap(masterApi.kecamatan.listByPolres(polresId as number, { page: 1, limit: 100 })),
    staleTime: MASTER_STALE_TIME,
    gcTime: MASTER_GC_TIME,
    enabled: polresId != null,
  })
}

/** Kelurahan berdasarkan kecamatan terpilih. */
export function useKelurahanByKecamatan(kecamatanId?: number | null) {
  return useQuery({
    queryKey: ['master', 'kelurahan', 'kecamatan', kecamatanId] as const,
    queryFn: () => unwrap(masterApi.kelurahan(kecamatanId as number)),
    staleTime: MASTER_STALE_TIME,
    gcTime: MASTER_GC_TIME,
    enabled: kecamatanId != null,
  })
}

/** Rumah sakit yang di-scope wilayah user. */
export function useRumahSakitByWilayah(wilayahId?: number | null) {
  return useQuery({
    queryKey: ['master', 'rumahsakit', 'wilayah', wilayahId ?? 'all'] as const,
    queryFn: () => unwrap(masterApi.rumahsakit.list({ wilayah_id: wilayahId, page: 1, limit: 500 })),
    staleTime: MASTER_STALE_TIME,
    gcTime: MASTER_GC_TIME,
  })
}
