import type { BudgetCategory } from './presets'

const TICKS_PER_PERCENT = 2
const TOTAL_TICKS = 100 * TICKS_PER_PERCENT

export function clampIncome(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.min(value, 1_000_000_000_000)
}

function distributeTicks(
  amount: number,
  indexes: number[],
  weights: number[],
  capacities: number[],
): number[] {
  const result = indexes.map(() => 0)
  let remaining = Math.min(amount, capacities.reduce((sum, capacity) => sum + capacity, 0))
  const active = new Set(indexes.map((_, index) => index).filter((index) => capacities[index] > 0))

  while (remaining > 0 && active.size > 0) {
    const weightTotal = [...active].reduce((sum, index) => sum + Math.max(0, weights[index]), 0)
    const basis = [...active].map((index) => weightTotal > 0 ? Math.max(0, weights[index]) : 1)
    const basisTotal = basis.reduce((sum, value) => sum + value, 0)
    const shares = [...active].map((index, position) => {
      const ideal = remaining * basis[position] / basisTotal
      return { index, whole: Math.min(capacities[index] - result[index], Math.floor(ideal)), fraction: ideal % 1 }
    })
    let allocated = 0
    for (const share of shares) {
      result[share.index] += share.whole
      allocated += share.whole
    }
    remaining -= allocated
    if (remaining === 0) break
    shares.sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    let progressed = false
    for (const share of shares) {
      if (remaining === 0) break
      if (result[share.index] < capacities[share.index]) {
        result[share.index] += 1
        remaining -= 1
        progressed = true
      }
    }
    for (const index of [...active]) {
      if (result[index] >= capacities[index]) active.delete(index)
    }
    if (!progressed && allocated === 0) break
  }
  return result
}

export function rebalancePercent(
  categories: BudgetCategory[],
  categoryId: string,
  requestedPercent: number,
): BudgetCategory[] {
  const targetIndex = categories.findIndex((category) => category.id === categoryId)
  if (targetIndex < 0 || categories[targetIndex].locked || !Number.isFinite(requestedPercent)) return categories
  const next = categories.map((category) => ({ ...category }))
  const lockedTicks = next.reduce((sum, category, index) =>
    index !== targetIndex && category.locked ? sum + Math.round(category.percent * TICKS_PER_PERCENT) : sum, 0)
  const targetTicks = Math.max(0, Math.min(TOTAL_TICKS - lockedTicks,
    Math.round(Math.max(0, Math.min(100, requestedPercent)) * TICKS_PER_PERCENT)))
  const currentTarget = Math.round(next[targetIndex].percent * TICKS_PER_PERCENT)
  const delta = targetTicks - currentTarget
  next[targetIndex].percent = targetTicks / TICKS_PER_PERCENT
  if (delta === 0) return next

  const otherIndexes = next
    .map((category, index) => ({ category, index }))
    .filter(({ category, index }) => index !== targetIndex && !category.locked)
    .map(({ index }) => index)
  if (otherIndexes.length === 0) {
    next[targetIndex].percent = currentTarget / TICKS_PER_PERCENT
    return next
  }
  const currentTicks = next.map((category) => Math.round(category.percent * TICKS_PER_PERCENT))
  if (delta > 0) {
    const changes = distributeTicks(
      delta,
      otherIndexes,
      otherIndexes.map((index) => currentTicks[index]),
      otherIndexes.map((index) => currentTicks[index]),
    )
    for (const [position, index] of otherIndexes.entries()) {
      next[index].percent = (currentTicks[index] - changes[position]) / TICKS_PER_PERCENT
    }
  } else {
    const changes = distributeTicks(
      -delta,
      otherIndexes,
      otherIndexes.map((index) => currentTicks[index]),
      otherIndexes.map(() => TOTAL_TICKS),
    )
    for (const [position, index] of otherIndexes.entries()) {
      next[index].percent = (currentTicks[index] + changes[position]) / TICKS_PER_PERCENT
    }
  }
  return next
}

export function normalizePercent(categories: BudgetCategory[]): BudgetCategory[] {
  const next = categories.map((category) => ({ ...category }))
  const lockedIndexes = next.map((category, index) => category.locked ? index : -1).filter((index) => index >= 0)
  const unlockedIndexes = next.map((category, index) => !category.locked ? index : -1).filter((index) => index >= 0)
  if (unlockedIndexes.length === 0) return next
  const lockedTicks = lockedIndexes.reduce((sum, index) => sum + Math.round(next[index].percent * TICKS_PER_PERCENT), 0)
  const remaining = Math.max(0, TOTAL_TICKS - lockedTicks)
  const current = unlockedIndexes.map((index) => Math.max(0, Math.round(next[index].percent * TICKS_PER_PERCENT)))
  const weightTotal = current.reduce((sum, value) => sum + value, 0)
  const allocation = weightTotal > 0
    ? distributeTicks(remaining, unlockedIndexes, current, unlockedIndexes.map(() => TOTAL_TICKS))
    : distributeTicks(remaining, unlockedIndexes, current.map(() => 1), unlockedIndexes.map(() => TOTAL_TICKS))
  for (const [position, index] of unlockedIndexes.entries()) {
    next[index].percent = allocation[position] / TICKS_PER_PERCENT
  }
  return next
}

export function allocateAmounts(
  income: number,
  categories: Pick<BudgetCategory, 'id' | 'percent'>[],
  fractionDigits = 2,
): Record<string, number> {
  const digits = Math.max(0, Math.min(4, Math.floor(fractionDigits)))
  const factor = 10 ** digits
  const totalUnits = Math.round(clampIncome(income) * factor)
  const positiveTotal = categories.reduce((sum, category) => sum + Math.max(0, category.percent), 0)
  if (positiveTotal === 0) return Object.fromEntries(categories.map((category) => [category.id, 0]))

  const portions = categories.map((category) => {
    const exact = totalUnits * Math.max(0, category.percent) / 100
    return { id: category.id, units: Math.floor(exact), fraction: exact % 1 }
  })
  const targetUnits = Math.round(totalUnits * positiveTotal / 100)
  let remainder = targetUnits - portions.reduce((sum, portion) => sum + portion.units, 0)
  const priority = [...portions].sort((a, b) => b.fraction - a.fraction)
  for (let index = 0; index < priority.length && remainder > 0; index += 1, remainder -= 1) {
    priority[index].units += 1
  }
  return Object.fromEntries(portions.map((portion) => [portion.id, portion.units / factor]))
}

export function totalPercent(categories: Pick<BudgetCategory, 'percent'>[]): number {
  return categories.reduce((sum, category) => sum + category.percent, 0)
}
