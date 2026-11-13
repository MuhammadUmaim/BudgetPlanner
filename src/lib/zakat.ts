export interface ZakatAssets {
  cashInHand: number
  bankBalance: number
  goldValue: number
  silverValue: number
  investmentPortfolio: number
  businessMerchandise: number
  shortTermDebts: number
}

export interface ZakatCalculationResult {
  grossWealth: number
  netWealth: number
  nisabThreshold: number
  nisabMet: boolean
  zakatDue: number
  rate: number
}

export const NISAB_DEFAULTS = {
  silverGrams: 612.36, // 52.5 tolas
  goldGrams: 87.48,    // 7.5 tolas
  // Default estimates in PKR per gram; editable by user
  silverGramPricePKR: 280, 
  goldGramPricePKR: 24500,
}

export function computeZakat(
  assets: ZakatAssets,
  nisabStandard: 'silver' | 'gold' = 'silver',
  customNisab?: number
): ZakatCalculationResult {
  const grossWealth =
    Math.max(0, assets.cashInHand) +
    Math.max(0, assets.bankBalance) +
    Math.max(0, assets.goldValue) +
    Math.max(0, assets.silverValue) +
    Math.max(0, assets.investmentPortfolio) +
    Math.max(0, assets.businessMerchandise)

  const netWealth = Math.max(0, grossWealth - Math.max(0, assets.shortTermDebts))

  const nisabThreshold =
    customNisab !== undefined && customNisab > 0
      ? customNisab
      : nisabStandard === 'silver'
      ? NISAB_DEFAULTS.silverGrams * NISAB_DEFAULTS.silverGramPricePKR
      : NISAB_DEFAULTS.goldGrams * NISAB_DEFAULTS.goldGramPricePKR

  const nisabMet = netWealth >= nisabThreshold
  const rate = 0.025 // 2.5%
  const zakatDue = nisabMet ? Math.round(netWealth * rate) : 0

  return {
    grossWealth,
    netWealth,
    nisabThreshold,
    nisabMet,
    zakatDue,
    rate,
  }
}
