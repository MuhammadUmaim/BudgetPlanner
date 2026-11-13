import type { BudgetCategory } from './presets'

export type Verdict = 'strong' | 'balanced' | 'needs attention'

export type HealthResult = {
  score: number
  verdict: Verdict
  summary: string
  levers: { label: string; description: string; target: string }[]
}

function percentOf(categories: BudgetCategory[], id: string): number {
  return categories.find((category) => category.id === id)?.percent ?? 0
}

export function computeHealth(categories: BudgetCategory[], total: number): HealthResult {
  const housing = percentOf(categories, 'housing')
  const groceries = percentOf(categories, 'groceries')
  const health = percentOf(categories, 'health')
  const education = percentOf(categories, 'education')
  const emergency = percentOf(categories, 'emergency')
  const investments = percentOf(categories, 'investments')
  const sadqa = percentOf(categories, 'sadqa')
  const entertainment = percentOf(categories, 'entertainment')
  const fitness = percentOf(categories, 'fitness')

  const essentials = housing + groceries + health + education
  const savings = emergency + investments + sadqa

  let score = 100
  const levers: HealthResult['levers'] = []

  if (Math.abs(total - 100) > 0.001) {
    score -= 18
    levers.push({
      label: 'Balance the plan',
      description: `Your categories currently total ${total.toFixed(1)}%.`,
      target: 'Normalize to 100%',
    })
  }

  if (housing > 35) {
    score -= 14
    levers.push({
      label: 'Trim housing',
      description: `Housing is ${housing.toFixed(0)}% of income, above the 30% comfort zone.`,
      target: 'Move housing closer to 30%',
    })
  } else if (housing > 32) {
    score -= 6
  }

  if (savings < 20) {
    score -= 14
    levers.push({
      label: 'Grow the buffer',
      description: `Only ${savings.toFixed(0)}% goes to savings, emergency and giving.`,
      target: 'Raise savings to 20%+',
    })
  } else if (savings < 25) {
    score -= 5
  }

  if (emergency < 10) {
    score -= 12
    levers.push({
      label: 'Fund the emergency buffer',
      description: `Emergency fund is ${emergency.toFixed(0)}% — below the 10% floor.`,
      target: 'Set emergency to at least 10%',
    })
  }

  if (investments < 5) {
    score -= 10
    levers.push({
      label: 'Keep investing',
      description: `Investments sit at ${investments.toFixed(0)}%, below the 5% minimum.`,
      target: 'Raise investments to 5%+',
    })
  }

  if (entertainment > 15) {
    score -= 8
    levers.push({
      label: 'Check entertainment',
      description: `Entertainment is ${entertainment.toFixed(0)}% — worth reviewing.`,
      target: 'Keep entertainment under 15%',
    })
  }

  if (sadqa < 2.5) {
    score -= 4
    levers.push({
      label: 'Set aside for Sadqa',
      description: `Sadqa is ${sadqa.toFixed(1)}% — consider at least 2.5%.`,
      target: 'Raise Sadqa to 2.5%',
    })
  }

  if (essentials > 65) {
    score -= 8
    levers.push({
      label: 'Essentials are heavy',
      description: `Essentials consume ${essentials.toFixed(0)}% of income.`,
      target: 'Look for one recurring saving',
    })
  } else if (essentials > 55) {
    score -= 3
  }

  if (fitness < 2) {
    score -= 4
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let verdict: Verdict
  let summary: string
  if (score >= 78) {
    verdict = 'strong'
    summary = 'Your plan is in good shape. Keep the current balance and revisit it when life changes.'
  } else if (score >= 55) {
    verdict = 'balanced'
    summary = 'A workable plan with room to improve. A couple of small shifts would lift it further.'
  } else {
    verdict = 'needs attention'
    summary = 'A few categories are pulling the plan off course. Start with the biggest lever below.'
  }

  return { score, verdict, summary, levers: levers.slice(0, 3) }
}

export function compareRuleOfThumb(categories: BudgetCategory[]): {
  needs: number
  wants: number
  savings: number
  target: { needs: number; wants: number; savings: number }
} {
  const p = (id: string) => percentOf(categories, id)
  const needs = p('housing') + p('groceries') + p('health') + p('education')
  const savings = p('emergency') + p('investments') + p('sadqa')
  const wants = Math.max(0, 100 - needs - savings)
  return {
    needs: Math.round(needs * 10) / 10,
    wants: Math.round(wants * 10) / 10,
    savings: Math.round(savings * 10) / 10,
    target: { needs: 50, wants: 30, savings: 20 },
  }
}