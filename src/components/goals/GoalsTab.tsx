import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useGoals } from '../../store/goals'
import { useBudget } from '../../store/budget'
import { formatMoney } from '../../lib/format'
import { calculateCompoundGrowth } from '../../lib/compound'
import { triggerGoalCelebration } from '../../lib/confetti'
import { playSound } from '../../lib/sound'
import { SpotlightCard } from '../reactbits/SpotlightCard'
import { StarBorder } from '../reactbits/StarBorder'
import { CountUp } from '../reactbits/CountUp'

interface GoalsTabProps {
  onOpenAddGoal: () => void
  onToast: (msg: string) => void
  soundEnabled: boolean
}

export function GoalsTab({ onOpenAddGoal, onToast, soundEnabled }: GoalsTabProps) {
  const { currency } = useBudget()
  const { goals, addContribution, removeGoal } = useGoals()

  // Compound growth calculator states
  const [initialPrincipal, setInitialPrincipal] = useState<number>(100000)
  const [monthlyAddition, setMonthlyAddition] = useState<number>(25000)
  const [annualRate, setAnnualRate] = useState<number>(12)
  const [years, setYears] = useState<number>(10)

  const projectionData = useMemo(() => {
    return calculateCompoundGrowth(initialPrincipal, monthlyAddition, annualRate, years)
  }, [initialPrincipal, monthlyAddition, annualRate, years])

  const finalPoint = projectionData[projectionData.length - 1] ?? {
    balance: 0,
    totalContributed: 0,
    totalInterest: 0,
  }

  function handleQuickDeposit(id: string, name: string, amount: number) {
    addContribution(id, amount)
    if (soundEnabled) playSound('success')
    triggerGoalCelebration()
    onToast(`Added +${formatMoney(amount, currency)} to "${name}"!`)
  }

  function handleDeleteGoal(id: string, name: string) {
    removeGoal(id)
    onToast(`Deleted goal: "${name}"`)
  }

  return (
    <div className="tab-pane goals-pane">
      {/* Header action */}
      <div className="section-heading mb-4">
        <div>
          <p className="eyebrow">DREAMS & TARGETS</p>
          <h2 className="section-title">Savings & Wealth Goals</h2>
        </div>
        <motion.button
          type="button"
          className="button-primary"
          onClick={onOpenAddGoal}
          whileTap={{ scale: 0.96 }}
        >
          <Plus size={16} />
          <span>New Goal</span>
          <StarBorder />
        </motion.button>
      </div>

      {/* Goals Cards */}
      <div className="goals-grid mb-8">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
          const monthsLeft =
            goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : 0
          const isCompleted = percent >= 100

          return (
            <SpotlightCard key={goal.id} className="goal-card">
              <div className="goal-header">
                <span className="goal-icon-badge">{goal.icon || '🎯'}</span>
                <div className="goal-header-text">
                  <div className="flex items-center gap-2">
                    <span className="goal-cat-tag">{goal.category}</span>
                    {isCompleted && (
                      <span className="status-tag status-safe">
                        <Sparkles size={12} /> Goal Achieved!
                      </span>
                    )}
                  </div>
                  <h3 className="goal-name">{goal.name}</h3>
                </div>
                <button
                  type="button"
                  className="expense-del-btn"
                  onClick={() => handleDeleteGoal(goal.id, goal.name)}
                  title="Remove goal"
                  aria-label="Remove goal"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="goal-progress-wrap">
                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color || '#4F46E5',
                    }}
                  />
                </div>
                <div className="goal-progress-labels">
                  <span className="goal-pct">{percent}% Completed</span>
                  <span className="goal-meta">
                    {isCompleted
                      ? 'Fully Funded!'
                      : monthsLeft > 0
                      ? `~${monthsLeft} months left (${formatMoney(goal.monthlyContribution, currency)}/mo)`
                      : 'Ongoing'}
                  </span>
                </div>
              </div>

              <div className="goal-amounts-row">
                <div>
                  <span className="goal-stat-label">Saved so far</span>
                  <strong className="goal-stat-val text-success">
                    {formatMoney(goal.currentAmount, currency)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="goal-stat-label">Target</span>
                  <strong className="goal-stat-val">
                    {formatMoney(goal.targetAmount, currency)}
                  </strong>
                </div>
              </div>

              <div className="goal-actions-row">
                <button
                  type="button"
                  className="quick-deposit-chip"
                  onClick={() => handleQuickDeposit(goal.id, goal.name, 10000)}
                >
                  +10k
                </button>
                <button
                  type="button"
                  className="quick-deposit-chip"
                  onClick={() => handleQuickDeposit(goal.id, goal.name, 25000)}
                >
                  +25k
                </button>
                <button
                  type="button"
                  className="quick-deposit-chip"
                  onClick={() => handleQuickDeposit(goal.id, goal.name, 50000)}
                >
                  +50k
                </button>
                <button
                  type="button"
                  className="quick-deposit-primary"
                  onClick={() => handleQuickDeposit(goal.id, goal.name, goal.monthlyContribution || 10000)}
                >
                  Deposit {formatMoney(goal.monthlyContribution || 10000, currency)}
                </button>
              </div>
            </SpotlightCard>
          )
        })}
      </div>

      {/* Futuristic Interactive Compound Interest Simulator */}
      <section className="compound-simulator-section">
        <div className="section-heading mb-4">
          <div>
            <p className="eyebrow">WEALTH ACCELERATOR</p>
            <h2 className="section-title">Compound Growth & Investment Projector</h2>
          </div>
          <span className="section-note">Visualizing the exponential power of disciplined monthly investing</span>
        </div>

        <div className="compound-grid">
          {/* Controls Column */}
          <SpotlightCard className="compound-controls-card">
            <h3 className="compound-card-title">Simulator Parameters</h3>

            <div className="control-slider-group">
              <div className="flex justify-between items-center mb-1">
                <label className="input-field-label">Initial Principal</label>
                <strong className="text-accent">{formatMoney(initialPrincipal, currency)}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="2000000"
                step="10000"
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                className="allocation-slider"
              />
            </div>

            <div className="control-slider-group">
              <div className="flex justify-between items-center mb-1">
                <label className="input-field-label">Monthly Addition</label>
                <strong className="text-accent">{formatMoney(monthlyAddition, currency)} / mo</strong>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="2000"
                value={monthlyAddition}
                onChange={(e) => setMonthlyAddition(Number(e.target.value))}
                className="allocation-slider"
              />
            </div>

            <div className="control-slider-group">
              <div className="flex justify-between items-center mb-1">
                <label className="input-field-label">Expected Annual Return</label>
                <strong className="text-accent">{annualRate}% p.a.</strong>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="allocation-slider"
              />
            </div>

            <div className="control-slider-group">
              <div className="flex justify-between items-center mb-1">
                <label className="input-field-label">Time Horizon</label>
                <strong className="text-accent">{years} Years</strong>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="allocation-slider"
              />
            </div>
          </SpotlightCard>

          {/* Visual Chart Column */}
          <SpotlightCard className="compound-chart-card">
            <div className="compound-hud-summary">
              <div>
                <span className="hud-mini-label">FUTURE PORTFOLIO VALUE</span>
                <strong className="text-success text-xl font-bold">
                  <CountUp value={finalPoint.balance} format={(v) => formatMoney(v, currency)} />
                </strong>
              </div>
              <div>
                <span className="hud-mini-label">YOUR CONTRIBUTIONS</span>
                <span className="text-muted font-semibold">
                  {formatMoney(finalPoint.totalContributed, currency)}
                </span>
              </div>
              <div>
                <span className="hud-mini-label">COMPOUND INTEREST GAINED</span>
                <span className="text-accent font-semibold">
                  +{formatMoney(finalPoint.totalInterest, currency)}
                </span>
              </div>
            </div>

            <div className="compound-chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="#9CA3AF" fontSize={11} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`)}
                  />
                  <Tooltip
                    formatter={(val: any) => [
                      formatMoney(Number(val ?? 0), currency),
                      '',
                    ]}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: '#4F46E5',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Total Portfolio"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalContributed"
                    name="Your Principal"
                    stroke="#6366F1"
                    strokeWidth={1.8}
                    fillOpacity={1}
                    fill="url(#colorContrib)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-disclaimer">
              Assumes monthly compounding at a steady annual rate. Real market returns fluctuate over time.
            </p>
          </SpotlightCard>
        </div>
      </section>
    </div>
  )
}
