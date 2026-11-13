export const currencies = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'] as const
export type Currency = (typeof currencies)[number]

export function currencyDigits(currency: Currency): number {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
}

export function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currencyDigits(currency),
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatMoneyForSpeech(value: number, currency: Currency): string {
  const amount = new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : undefined, {
    maximumFractionDigits: currencyDigits(currency),
  }).format(Number.isFinite(value) ? value : 0)
  return `${amount} ${currency}`
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)}%`
}
