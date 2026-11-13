export interface CompoundPoint {
  year: number
  totalContributed: number
  totalInterest: number
  balance: number
}

export function calculateCompoundGrowth(
  principal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number
): CompoundPoint[] {
  const points: CompoundPoint[] = []
  const monthlyRate = annualRatePercent / 100 / 12
  let currentBalance = Math.max(0, principal)
  let totalContributed = Math.max(0, principal)

  points.push({
    year: 0,
    totalContributed,
    totalInterest: 0,
    balance: Math.round(currentBalance),
  })

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      currentBalance = (currentBalance + Math.max(0, monthlyContribution)) * (1 + monthlyRate)
      totalContributed += Math.max(0, monthlyContribution)
    }
    const totalInterest = Math.max(0, currentBalance - totalContributed)
    points.push({
      year,
      totalContributed: Math.round(totalContributed),
      totalInterest: Math.round(totalInterest),
      balance: Math.round(currentBalance),
    })
  }

  return points
}
