import type { BudgetCategory } from './presets'
import { normalizePercent } from './allocation'

export type Scenario = {
  id: string
  name: string
  description: string
  icon: string
  incomeDelta: number
  adjustments: { id: string; delta: number }[]
}

export const scenarios: Scenario[] = [
  {
    id: 'raise',
    name: 'Salary raise 10%',
    description: 'More income, same priorities.',
    icon: '📈',
    incomeDelta: 0.1,
    adjustments: [],
  },
  {
    id: 'loss',
    name: 'Lose 20% income',
    description: 'Tighten essentials first.',
    icon: '📉',
    incomeDelta: -0.2,
    adjustments: [{ id: 'entertainment', delta: -5 }, { id: 'fitness', delta: -2 }, { id: 'investments', delta: -3 }],
  },
  {
    id: 'baby',
    name: 'New baby',
    description: 'Care and learning take priority.',
    icon: '👶',
    incomeDelta: 0,
    adjustments: [{ id: 'health', delta: 4 }, { id: 'education', delta: 4 }, { id: 'housing', delta: -3 }, { id: 'entertainment', delta: -5 }],
  },
  {
    id: 'cheaper-rent',
    name: 'Move to cheaper rent',
    description: 'Housing cost drops, everything else breathes.',
    icon: '🏠',
    incomeDelta: 0,
    adjustments: [{ id: 'housing', delta: -8 }, { id: 'emergency', delta: 4 }, { id: 'investments', delta: 2 }, { id: 'entertainment', delta: 2 }],
  },
]

export function applyScenario(
  categories: BudgetCategory[],
  scenario: Scenario,
  income: number,
): { categories: BudgetCategory[]; income: number } {
  const next = categories.map((category) => ({ ...category }))
  for (const adjustment of scenario.adjustments) {
    const index = next.findIndex((category) => category.id === adjustment.id)
    if (index < 0) continue
    next[index].percent = Math.max(0, next[index].percent + adjustment.delta)
  }
  return {
    categories: normalizePercent(next),
    income: Math.round(income * (1 + scenario.incomeDelta)),
  }
}