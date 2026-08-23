import { QueryClient, isServer } from '@tanstack/react-query'

// Default staleTime 60 detik: data transaksional (list/dashboard/statistik) dianggap
// "fresh" selama 1 menit — cocok untuk data laka yang diinput harian. Bolak-balik
// dalam rentang ini pakai cache (instan, tanpa loading), lewat itu di-refetch.
// Master data override staleTime ini menjadi lebih panjang di hook-nya masing-masing.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 detik
        gcTime: 5 * 60 * 1000, // cache disimpan 5 menit setelah tidak dipakai
        refetchOnWindowFocus: true, // balik dari tab lain → refresh di background
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

// Di server selalu buat instance baru; di browser pakai singleton agar cache
// bertahan lintas navigasi.
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
