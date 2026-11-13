import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency } from '../lib/format'

export interface MonthSnapshot {
  id: string
  monthLabel: string
  savedAt: string
  income: number
  currency: Currency
  totalAllocated: number
  totalSpent: number
  categories: { id: string; name: string; percent: number; amount: number; color: string }[]
}

interface HistoryState {
  snapshots: MonthSnapshot[]
  saveSnapshot: (snapshot: Omit<MonthSnapshot, 'id' | 'savedAt'>) => void
  removeSnapshot: (id: string) => void
  clearHistory: () => void
}

const defaultSnapshots: MonthSnapshot[] = [
  {
    id: 'snap-prev-2',
    monthLabel: 'September 2026',
    savedAt: '2026-09-30T23:59:59.000Z',
    income: 180000,
    currency: 'PKR',
    totalAllocated: 100,
    totalSpent: 168000,
    categories: [
      { id: 'housing', name: 'Housing', percent: 28, amount: 50400, color: '#4F46E5' },
      { id: 'groceries', name: 'Groceries', percent: 14, amount: 25200, color: '#84CC16' },
      { id: 'emergency', name: 'Emergency', percent: 15, amount: 27000, color: '#F97316' },
      { id: 'investments', name: 'Investments', percent: 15, amount: 27000, color: '#14B8A6' },
    ],
  },
  {
    id: 'snap-prev-1',
    monthLabel: 'October 2026',
    savedAt: '2026-10-31T23:59:59.000Z',
    income: 200000,
    currency: 'PKR',
    totalAllocated: 100,
    totalSpent: 174000,
    categories: [
      { id: 'housing', name: 'Housing', percent: 28, amount: 56000, color: '#4F46E5' },
      { id: 'groceries', name: 'Groceries', percent: 12, amount: 24000, color: '#84CC16' },
      { id: 'emergency', name: 'Emergency', percent: 15, amount: 30000, color: '#F97316' },
      { id: 'investments', name: 'Investments', percent: 14, amount: 28000, color: '#14B8A6' },
    ],
  },
]

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      snapshots: defaultSnapshots,
      saveSnapshot: (snapshot) =>
        set((state) => ({
          snapshots: [
            {
              ...snapshot,
              id: `snap-${Date.now()}`,
              savedAt: new Date().toISOString(),
            },
            ...state.snapshots,
          ],
        })),
      removeSnapshot: (id) =>
        set((state) => ({
          snapshots: state.snapshots.filter((s) => s.id !== id),
        })),
      clearHistory: () => set({ snapshots: [] }),
    }),
    {
      name: 'smart-budget-history-v1',
    }
  )
)
