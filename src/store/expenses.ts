import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ExpenseItem {
  id: string
  categoryId: string
  amount: number
  note: string
  date: string
}

interface ExpensesState {
  expenses: ExpenseItem[]
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void
  removeExpense: (id: string) => void
  clearExpenses: () => void
  getCategorySpent: (categoryId: string) => number
  getTotalSpent: () => number
}

export const useExpenses = create<ExpensesState>()(
  persist(
    (set, get) => ({
      expenses: [
        {
          id: 'exp-1',
          categoryId: 'housing',
          amount: 56000,
          note: 'Monthly Rent & Maintenance',
          date: new Date().toISOString().slice(0, 10),
        },
        {
          id: 'exp-2',
          categoryId: 'groceries',
          amount: 14200,
          note: 'Bi-weekly supermarket groceries',
          date: new Date().toISOString().slice(0, 10),
        },
        {
          id: 'exp-3',
          categoryId: 'health',
          amount: 3200,
          note: 'Pharmacy & vitamins',
          date: new Date().toISOString().slice(0, 10),
        },
        {
          id: 'exp-4',
          categoryId: 'sadqa',
          amount: 5000,
          note: 'Payday Charity / Sadqa',
          date: new Date().toISOString().slice(0, 10),
        },
      ],
      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            {
              ...expense,
              id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            },
            ...state.expenses,
          ],
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      clearExpenses: () => set({ expenses: [] }),
      getCategorySpent: (categoryId) => {
        return get()
          .expenses.filter((e) => e.categoryId === categoryId)
          .reduce((sum, e) => sum + e.amount, 0)
      },
      getTotalSpent: () => {
        return get().expenses.reduce((sum, e) => sum + e.amount, 0)
      },
    }),
    {
      name: 'smart-budget-expenses-v1',
    }
  )
)
