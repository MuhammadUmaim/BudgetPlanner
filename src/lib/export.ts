import type { BudgetCategory } from './presets'
import { formatMoney, formatPercent, type Currency } from './format'

export function downloadCsv(categories: BudgetCategory[], amounts: Record<string, number>, currency: Currency) {
  const rows = [
    ['Category', 'Allocation', `Amount (${currency})`],
    ...categories.map((category) => [category.name, formatPercent(category.percent), amounts[category.id]?.toFixed(2) ?? '0.00']),
  ]
  const csv = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'monthly-budget.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function copySummary(
  income: number,
  currency: Currency,
  categories: BudgetCategory[],
  amounts: Record<string, number>,
) {
  const lines = [
    `Monthly budget — ${formatMoney(income, currency)}`,
    ...categories.map((category) => `${category.name}: ${formatPercent(category.percent)} · ${formatMoney(amounts[category.id] ?? 0, currency)}`),
  ]
  await navigator.clipboard.writeText(lines.join('\n'))
}
