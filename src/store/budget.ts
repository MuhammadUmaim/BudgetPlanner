import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clampIncome, normalizePercent, rebalancePercent } from '../lib/allocation'
import { categoryDefaults, defaultCategories, profiles, type BudgetCategory, type ProfileId } from '../lib/presets'
import type { Currency } from '../lib/format'

export type Theme = 'light' | 'dark'

type BudgetState = {
  income: number
  currency: Currency
  profile: ProfileId
  categories: BudgetCategory[]
  autoBalance: boolean
  theme: Theme
  setIncome: (income: number) => void
  setCurrency: (currency: Currency) => void
  setProfile: (profile: ProfileId) => void
  setAutoBalance: (enabled: boolean) => void
  setTheme: (theme: Theme) => void
  setCategories: (categories: BudgetCategory[]) => void
  setPercent: (id: string, percent: number) => void
  toggleLock: (id: string) => void
  normalize: () => void
  addCategory: (name: string, color: string, percent: number) => void
  updateCategory: (id: string, changes: Partial<Pick<BudgetCategory, 'name' | 'color'>>) => void
  removeCategory: (id: string) => void
  reset: () => void
}

const initial = {
  income: 200_000,
  currency: 'PKR' as Currency,
  profile: 'single' as ProfileId,
  categories: defaultCategories,
  autoBalance: true,
  theme: 'light' as Theme,
}

function distributeRefund(categories: BudgetCategory[], percent: number): BudgetCategory[] {
  const recipients = categories.map((category, index) => ({ category, index })).filter(({ category }) => !category.locked)
  if (!recipients.length || percent <= 0) return categories
  const totalTicks = Math.round(percent * 2)
  const weights = recipients.map(({ category }) => Math.max(0, category.percent))
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0)
  const ideal = recipients.map((_, index) => totalTicks * (weightTotal > 0 ? weights[index] / weightTotal : 1 / recipients.length))
  const ticks = ideal.map(Math.floor)
  let remainder = totalTicks - ticks.reduce((sum, value) => sum + value, 0)
  const order = ideal.map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
  for (const { index } of order) {
    if (remainder <= 0) break
    ticks[index] += 1
    remainder -= 1
  }
  const next = categories.map((category) => ({ ...category }))
  recipients.forEach(({ index }, position) => {
    next[index].percent += ticks[position] / 2
  })
  return next
}

export const useBudget = create<BudgetState>()(persist((set, get) => ({
  ...initial,
  setIncome: (income) => set({ income: clampIncome(income) }),
  setCurrency: (currency) => set({ currency }),
  setProfile: (profile) => {
    const preset = profiles.find((item) => item.id === profile)
    if (!preset) return
    const presetById = new Map<string, number>(categoryDefaults.map((category, index) => [category.id, preset.percentages[index]]))
    const categories = get().categories.map((category) => ({
      ...category,
      percent: category.custom ? 0 : (presetById.get(category.id) ?? 0),
      locked: false,
    }))
    set({ profile, categories: normalizePercent(categories) })
  },
  setAutoBalance: (autoBalance) => set((state) => ({
    autoBalance,
    categories: autoBalance ? normalizePercent(state.categories) : state.categories,
  })),
  setCategories: (categories) => set({ categories }),
  setTheme: (theme) => set({ theme }),
  setPercent: (id, percent) => set((state) => {
    if (!Number.isFinite(percent)) return {}
    return {
      categories: state.autoBalance
        ? rebalancePercent(state.categories, id, percent)
        : state.categories.map((category) => category.id === id && !category.locked
          ? { ...category, percent: Math.round(Math.max(0, Math.min(100, percent)) * 2) / 2 }
          : category),
    }
  }),
  toggleLock: (id) => set((state) => ({
    categories: state.categories.map((category) => category.id === id ? { ...category, locked: !category.locked } : category),
  })),
  normalize: () => set((state) => ({ categories: normalizePercent(state.categories) })),
  addCategory: (name, color, percent) => set((state) => {
    const id = `custom-${crypto.randomUUID()}`
    const category: BudgetCategory = { id, name, color, percent: 0, locked: false, custom: true }
    const withCategory = [...state.categories, category]
    return { categories: rebalancePercent(withCategory, id, percent) }
  }),
  updateCategory: (id, changes) => set((state) => ({
    categories: state.categories.map((category) => category.id === id ? { ...category, ...changes } : category),
  })),
  removeCategory: (id) => set((state) => {
    if (state.categories.length <= 1) return {}
    const removed = state.categories.find((category) => category.id === id)
    if (!removed) return {}
    const remaining = state.categories.filter((category) => category.id !== id)
    return { categories: distributeRefund(remaining, removed.percent) }
  }),
  reset: () => set((state) => ({ ...initial, theme: state.theme, categories: defaultCategories.map((category) => ({ ...category })) })),
}), {
  name: 'smart-budget-planner-v1',
  partialize: (state) => ({
    income: state.income,
    currency: state.currency,
    profile: state.profile,
    categories: state.categories,
    autoBalance: state.autoBalance,
    theme: state.theme,
  }),
}))
