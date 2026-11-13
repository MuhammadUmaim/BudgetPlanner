import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  targetDate: string
  category: string
  color: string
  icon: string
}

interface GoalsState {
  goals: SavingsGoal[]
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void
  removeGoal: (id: string) => void
  addContribution: (id: string, amount: number) => void
  resetGoals: () => void
}

const defaultGoals: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    name: 'Emergency Fund (6 Months)',
    targetAmount: 300000,
    currentAmount: 125000,
    monthlyContribution: 30000,
    targetDate: '2027-06-30',
    category: 'Safety',
    color: '#F97316',
    icon: '🛡️',
  },
  {
    id: 'goal-hajj',
    name: 'Hajj / Umrah Journey',
    targetAmount: 850000,
    currentAmount: 320000,
    monthlyContribution: 25000,
    targetDate: '2028-05-15',
    category: 'Spiritual',
    color: '#8B5CF6',
    icon: '🕋',
  },
  {
    id: 'goal-wealth',
    name: 'Index Fund Investment Milestone',
    targetAmount: 1000000,
    currentAmount: 480000,
    monthlyContribution: 28000,
    targetDate: '2028-12-31',
    category: 'Wealth',
    color: '#14B8A6',
    icon: '📈',
  },
]

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: defaultGoals,
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            },
          ],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
      addContribution: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
          ),
        })),
      resetGoals: () => set({ goals: defaultGoals }),
    }),
    {
      name: 'smart-budget-goals-v1',
    }
  )
)
