export const categoryDefaults = [
  { id: 'housing', name: 'Housing', color: '#4F46E5' },
  { id: 'groceries', name: 'Groceries', color: '#84CC16' },
  { id: 'education', name: 'Education', color: '#F59E0B' },
  { id: 'health', name: 'Health', color: '#F43F5E' },
  { id: 'fitness', name: 'Fitness', color: '#06B6D4' },
  { id: 'emergency', name: 'Emergency fund', color: '#F97316' },
  { id: 'sadqa', name: 'Sadqa', color: '#8B5CF6' },
  { id: 'investments', name: 'Investments', color: '#14B8A6' },
  { id: 'entertainment', name: 'Entertainment', color: '#EC4899' },
] as const

export type ProfileId = 'single' | 'married' | 'one-child' | 'two-children' | 'large-family'
export type BudgetCategory = {
  id: string
  name: string
  color: string
  percent: number
  locked: boolean
  custom?: boolean
}

export const profiles: {
  id: ProfileId
  name: string
  shortName: string
  rationale: string
  percentages: number[]
  advice: string
}[] = [
  {
    id: 'single',
    name: 'Unmarried / Single',
    shortName: 'Single',
    rationale: 'More room for savings, growth and leisure.',
    percentages: [28, 12, 8, 5, 5, 15, 5, 14, 8],
    advice: 'As a single household, use your flexibility to build a strong savings cushion and invest consistently.',
  },
  {
    id: 'married',
    name: 'Married, no children',
    shortName: 'Couple',
    rationale: 'A balanced foundation for two.',
    percentages: [32, 16, 4, 6, 4, 14, 5, 11, 8],
    advice: 'With two incomes or shared costs, agree on a joint emergency fund target and automate contributions.',
  },
  {
    id: 'one-child',
    name: 'Married, 1 child',
    shortName: '1 child',
    rationale: 'More room for care and learning.',
    percentages: [30, 17, 8, 9, 3, 14, 5, 9, 5],
    advice: 'With one child, plan ahead for healthcare and education costs before they arrive.',
  },
  {
    id: 'two-children',
    name: 'Married, 2 children',
    shortName: '2 children',
    rationale: 'Extra care for a growing family.',
    percentages: [28, 19, 13, 10, 3, 12, 5, 6, 4],
    advice: 'With 2+ children, work toward six months of essential expenses in your emergency fund and set Sadqa aside first on payday.',
  },
  {
    id: 'large-family',
    name: 'Married, 3+ children',
    shortName: '3+ children',
    rationale: 'Prioritizes essentials and dependents.',
    percentages: [26, 21, 16, 11, 2, 10, 6, 5, 3],
    advice: 'With a larger household, revisit essential costs each month and keep emergency savings contributions consistent.',
  },
]

export const defaultCategories: BudgetCategory[] = categoryDefaults.map((category, index) => ({
  ...category,
  percent: profiles[0].percentages[index],
  locked: false,
}))
