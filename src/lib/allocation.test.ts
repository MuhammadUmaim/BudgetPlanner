import { describe, expect, it } from 'vitest'
import { allocateAmounts, clampIncome, normalizePercent, rebalancePercent, totalPercent } from './allocation'
import { defaultCategories, profiles } from './presets'

describe('allocation engine', () => {
  it('redistributes a change across unlocked categories and preserves 100%', () => {
    const result = rebalancePercent(defaultCategories, 'housing', 33)
    expect(result.find((category) => category.id === 'housing')?.percent).toBe(33)
    expect(totalPercent(result)).toBe(100)
  })

  it('never changes locked categories while rebalancing', () => {
    const locked = defaultCategories.map((category) => ({ ...category, locked: category.id === 'groceries' }))
    const result = rebalancePercent(locked, 'housing', 34)
    expect(result.find((category) => category.id === 'groceries')?.percent).toBe(12)
    expect(totalPercent(result)).toBe(100)
  })

  it('normalizes percentages while leaving locked values untouched', () => {
    const drifted = defaultCategories.map((category) => ({
      ...category,
      percent: category.id === 'housing' ? 30 : category.percent + 1,
      locked: category.id === 'housing',
    }))
    const result = normalizePercent(drifted)
    expect(result[0].percent).toBe(30)
    expect(totalPercent(result)).toBe(100)
  })

  it('uses largest remainders so rounded amounts equal income exactly', () => {
    const categories = [
      { id: 'a', percent: 33.3 },
      { id: 'b', percent: 33.3 },
      { id: 'c', percent: 33.4 },
    ]
    const amounts = allocateAmounts(100, categories, 0)
    expect(Object.values(amounts).reduce((sum, amount) => sum + amount, 0)).toBe(100)
  })

  it('calculates the 200,000 PKR starter plan amounts exactly', () => {
    const amounts = allocateAmounts(200_000, defaultCategories, 0)
    expect(amounts).toEqual({
      housing: 56_000,
      groceries: 24_000,
      education: 16_000,
      health: 10_000,
      fitness: 10_000,
      emergency: 30_000,
      sadqa: 10_000,
      investments: 28_000,
      entertainment: 16_000,
    })
    expect(Object.values(amounts).reduce((sum, amount) => sum + amount, 0)).toBe(200_000)
  })

  it('keeps every household preset at exactly 100%', () => {
    expect(profiles.every((profile) => profile.percentages.reduce((sum, value) => sum + value, 0) === 100)).toBe(true)
  })

  it('keeps auto-balanced categories at 100% after both increases and decreases', () => {
    const increased = rebalancePercent(defaultCategories, 'housing', 30)
    const decreased = rebalancePercent(increased, 'housing', 26)
    expect(totalPercent(increased)).toBe(100)
    expect(totalPercent(decreased)).toBe(100)
    expect(decreased.find((category) => category.id === 'housing')?.percent).toBe(26)
  })

  it('handles zero income and all-locked categories safely', () => {
    expect(Object.values(allocateAmounts(0, defaultCategories)).every((amount) => amount === 0)).toBe(true)
    const allLocked = defaultCategories.map((category) => ({ ...category, locked: true }))
    expect(rebalancePercent(allLocked, 'housing', 90)).toEqual(allLocked)
    expect(totalPercent(normalizePercent(allLocked))).toBe(100)
  })

  it('clamps negative, invalid, and very large income values', () => {
    expect(clampIncome(-25)).toBe(0)
    expect(clampIncome(Number.NaN)).toBe(0)
    expect(clampIncome(Number.POSITIVE_INFINITY)).toBe(0)
    expect(clampIncome(2_000_000_000_000)).toBe(1_000_000_000_000)
  })
})
