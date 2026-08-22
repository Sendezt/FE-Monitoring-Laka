import { create } from 'zustand'

// Format tanggal lokal ke YYYY-MM-DD (hindari pergeseran zona waktu dari toISOString)
function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const now = new Date()
// Default rentang: 1 bulan lalu (tanggal 1) → akhir bulan ini
const firstOfPrevMonth = fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1))
const endOfThisMonth = fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0))

interface FilterState {
  from: string
  to: string
  polres: string
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setPolres: (v: string) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  from: firstOfPrevMonth,
  to: endOfThisMonth,
  polres: 'ALL',
  setFrom: (from) => set({ from }),
  setTo: (to) => set({ to }),
  setPolres: (polres) => set({ polres }),
}))
