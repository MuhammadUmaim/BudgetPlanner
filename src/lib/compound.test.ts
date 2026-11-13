import { describe, expect, it } from 'vitest'
import { calculateCompoundGrowth } from './compound'

describe('compound growth engine', () => {
  it('correctly calculates zero interest when rate is 0', () => {
    const points = calculateCompoundGrowth(10000, 1000, 0, 1)
    expect(points[1].totalContributed).toBe(22000)
    expect(points[1].totalInterest).toBe(0)
    expect(points[1].balance).toBe(22000)
  })

  it('generates accurate compound interest over multiple years', () => {
    const points = calculateCompoundGrowth(100000, 10000, 10, 5)
    expect(points.length).toBe(6) // year 0 to 5
    expect(points[5].balance).toBeGreaterThan(points[5].totalContributed)
    expect(points[5].totalInterest).toBeGreaterThan(0)
  })
})
