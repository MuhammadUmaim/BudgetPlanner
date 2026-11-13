import type { BudgetCategory, ProfileId } from './presets'
import { profiles } from './presets'
import { formatPercent, formatMoney, type Currency } from './format'

export type AdviceTip = { severity: 'good' | 'info' | 'warning'; text: string }

export function getAdvice(
  categories: BudgetCategory[],
  income: number,
  profileId: ProfileId,
  currency: Currency,
  total: number,
): AdviceTip[] {
  const percentOf = (id: string) => categories.find((category) => category.id === id)?.percent ?? 0
  const essentials = categories
    .filter((category) => ['housing', 'groceries', 'health', 'education'].includes(category.id))
    .reduce((sum, category) => sum + category.percent, 0)
  const emergencyMonthly = income * percentOf('emergency') / 100
  const goal = income * essentials / 100 * 6
  const months = emergencyMonthly > 0 ? Math.ceil(goal / emergencyMonthly) : Infinity
  const profileTip = profiles.find((profile) => profile.id === profileId)?.advice ?? profiles[0].advice
  const tips: AdviceTip[] = [{ severity: 'info', text: profileTip }]

  if (percentOf('housing') > 35) {
    tips.push({ severity: 'warning', text: `Housing is ${formatPercent(percentOf('housing'))} of your income. Many budgets feel more flexible when it stays closer to 30%.` })
  } else {
    tips.push({ severity: 'good', text: `Housing at ${formatPercent(percentOf('housing'))} leaves room for other priorities.` })
  }
  if (percentOf('sadqa') < 2.5) {
    tips.push({ severity: 'info', text: 'Consider setting aside at least 2.5% for Sadqa, if that fits your practice and goals.' })
  }
  if (percentOf('investments') < 5) {
    tips.push({ severity: 'warning', text: 'Investments are below 5%. A small, regular contribution can build momentum over time.' })
  }
  if (percentOf('entertainment') > 15) {
    tips.push({ severity: 'warning', text: 'Entertainment is above 15%. Check whether that trade-off still feels right for you.' })
  }
  if (emergencyMonthly > 0 && Number.isFinite(months)) {
    tips.push({ severity: months <= 72 ? 'good' : 'info', text: `At this pace, your six-month essentials fund could take about ${months} months to build (${formatMoney(goal, currency)} target).` })
  } else {
    tips.push({ severity: 'warning', text: 'Add a monthly emergency-fund contribution to start building toward six months of essentials.' })
  }
  if (Math.abs(total - 100) > 0.001) {
    tips.push({ severity: 'warning', text: `Your plan is ${formatPercent(Math.abs(total - 100))} ${total > 100 ? 'over' : 'unallocated'}. Normalize it to balance the full income.` })
  }
  return tips
}
