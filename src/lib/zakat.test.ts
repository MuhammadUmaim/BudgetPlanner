import { describe, expect, it } from 'vitest'
import { computeZakat } from './zakat'

describe('zakat calculation engine', () => {
  it('correctly calculates zakat due when net wealth exceeds nisab', () => {
    const assets = {
      cashInHand: 50000,
      bankBalance: 250000,
      goldValue: 100000,
      silverValue: 0,
      investmentPortfolio: 200000,
      businessMerchandise: 0,
      shortTermDebts: 20000,
    }
    const result = computeZakat(assets, 'silver', 150000)
    expect(result.grossWealth).toBe(600000)
    expect(result.netWealth).toBe(580000)
    expect(result.nisabMet).toBe(true)
    expect(result.zakatDue).toBe(14500) // 2.5% of 580000
  })

  it('yields zero zakat if wealth is below the nisab threshold', () => {
    const assets = {
      cashInHand: 10000,
      bankBalance: 20000,
      goldValue: 0,
      silverValue: 0,
      investmentPortfolio: 0,
      businessMerchandise: 0,
      shortTermDebts: 0,
    }
    const result = computeZakat(assets, 'silver', 100000)
    expect(result.nisabMet).toBe(false)
    expect(result.zakatDue).toBe(0)
  })

  it('safely handles negative inputs or huge debts without crashing or negative zakat', () => {
    const assets = {
      cashInHand: -5000,
      bankBalance: 50000,
      goldValue: 0,
      silverValue: 0,
      investmentPortfolio: 0,
      businessMerchandise: 0,
      shortTermDebts: 100000,
    }
    const result = computeZakat(assets, 'silver', 10000)
    expect(result.netWealth).toBe(0)
    expect(result.zakatDue).toBe(0)
  })
})
