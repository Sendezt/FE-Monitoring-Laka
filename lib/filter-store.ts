import { create } from 'zustand'

const today = new Date().toISOString().slice(0, 10)
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

interface FilterState {
  from: string
  to: string
  polres: string
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setPolres: (v: string) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  from: firstOfMonth,
  to: today,
  polres: 'ALL',
  setFrom: (from) => set({ from }),
  setTo: (to) => set({ to }),
  setPolres: (polres) => set({ polres }),
}))
