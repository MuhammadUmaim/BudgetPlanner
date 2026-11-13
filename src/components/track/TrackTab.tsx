import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Plus, Trash2, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react'
import { useExpenses } from '../../store/expenses'
import { useBudget } from '../../store/budget'
import { formatMoney } from '../../lib/format'
import { CountUp } from '../reactbits/CountUp'
import { SpotlightCard } from '../reactbits/SpotlightCard'
import { StarBorder } from '../reactbits/StarBorder'
import { AnimatedList } from '../reactbits/AnimatedList'

interface TrackTabProps {
  amounts: Record<string, number>
  onOpenAddExpense: () => void
  onToast: (msg: string) => void
}

export function TrackTab({ amounts, onOpenAddExpense, onToast }: TrackTabProps) {
  const { income, currency, categories } = useBudget()
  const { expenses, removeExpense, getCategorySpent, getTotalSpent } = useExpenses()

  const totalSpent = getTotalSpent()
  const remainingBudget = Math.max(0, income - totalSpent)

  // Calculate days remaining in current month
  const { daysRemaining, daysInMonth, dailySafeToSpend } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
    const daysLeft = Math.max(1, daysInCurrentMonth - now.getDate() + 1)
    const dailySafe = Math.round(remainingBudget / daysLeft)
    return {
      daysRemaining: daysLeft,
      daysInMonth: daysInCurrentMonth,
      dailySafeToSpend: dailySafe,
    }
  }, [remainingBudget])

  const percentSpentTotal = income > 0 ? Math.min(100, Math.round((totalSpent / income) * 100)) : 0

  function handleDeleteExpense(id: string, note: string) {
    removeExpense(id)
    onToast(`Removed expense: "${note || 'Expense'}"`)
  }

  return (
    <div className="tab-pane track-pane">
      {/* HUD Header stats */}
      <section className="track-hud-grid">
        <SpotlightCard className="hud-card hud-primary">
          <div className="hud-card-header">
            <span className="eyebrow">DAILY SAFE TO SPEND</span>
            <span className="hud-badge pulse-dot">{daysRemaining} days left</span>
          </div>
          <div className="hud-big-num">
            <CountUp value={dailySafeToSpend} format={(v) => formatMoney(v, currency)} />
            <span className="hud-unit">/ day</span>
          </div>
          <p className="hud-sub">
            Based on unspent liquidity of {formatMoney(remainingBudget, currency)} across {daysInMonth} days this month.
          </p>
        </SpotlightCard>

        <SpotlightCard className="hud-card">
          <div className="hud-card-header">
            <span className="eyebrow">MONTHLY SPENDING OVERVIEW</span>
            <span className="hud-percent-badge">{percentSpentTotal}% used</span>
          </div>
          <div className="hud-split-row">
            <div>
              <span className="hud-mini-label">TOTAL SPENT</span>
              <strong className="hud-mini-val text-warning">
                <CountUp value={totalSpent} format={(v) => formatMoney(v, currency)} />
              </strong>
            </div>
            <div className="hud-divider" />
            <div>
              <span className="hud-mini-label">REMAINING LIQUIDITY</span>
              <strong className="hud-mini-val text-success">
                <CountUp value={remainingBudget} format={(v) => formatMoney(v, currency)} />
              </strong>
            </div>
          </div>
          <div className="hud-progress-track">
            <div
              className={`hud-progress-fill ${
                percentSpentTotal >= 95 ? 'bg-danger' : percentSpentTotal >= 80 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${percentSpentTotal}%` }}
            />
          </div>
        </SpotlightCard>
      </section>

      {/* Main Action Bar */}
      <div className="track-action-bar">
        <div>
          <h2 className="section-title">Category Spending Meters</h2>
          <p className="section-caption">Real-time tracking of actual expenses against your monthly budget plan.</p>
        </div>
        <motion.button
          type="button"
          className="button-primary track-add-btn"
          onClick={onOpenAddExpense}
          whileTap={{ scale: 0.96 }}
        >
          <Plus size={16} />
          <span>Log Expense</span>
          <StarBorder />
        </motion.button>
      </div>

      {/* Category Progress Meters */}
      <div className="category-track-grid">
        {categories.map((category) => {
          const planned = amounts[category.id] ?? 0
          const spent = getCategorySpent(category.id)
          const remaining = planned - spent
          const percent = planned > 0 ? Math.round((spent / planned) * 100) : 0
          const isOver = spent > planned

          return (
            <SpotlightCard key={category.id} className="category-track-card">
              <div className="category-track-header">
                <div className="flex items-center gap-2">
                  <span className="track-color-indicator" style={{ backgroundColor: category.color }} />
                  <h3 className="category-track-name">{category.name}</h3>
                </div>
                {isOver ? (
                  <span className="status-tag status-danger">
                    <AlertTriangle size={12} /> Over by {formatMoney(Math.abs(remaining), currency)}
                  </span>
                ) : percent >= 80 ? (
                  <span className="status-tag status-warning">
                    <TrendingDown size={12} /> {percent}% Spent
                  </span>
                ) : (
                  <span className="status-tag status-safe">
                    <CheckCircle2 size={12} /> {formatMoney(remaining, currency)} left
                  </span>
                )}
              </div>

              <div className="category-track-numbers">
                <div>
                  <span className="track-num-label">Spent</span>
                  <strong>{formatMoney(spent, currency)}</strong>
                </div>
                <div className="text-right">
                  <span className="track-num-label">Budgeted</span>
                  <span className="text-muted">{formatMoney(planned, currency)}</span>
                </div>
              </div>

              <div className="track-bar-container">
                <div
                  className={`track-bar-fill ${
                    isOver ? 'is-over' : percent >= 80 ? 'is-warn' : 'is-safe'
                  }`}
                  style={{
                    width: `${Math.min(100, percent)}%`,
                    backgroundColor: isOver ? '#EF4444' : percent >= 80 ? '#F59E0B' : category.color,
                  }}
                />
              </div>
            </SpotlightCard>
          )
        })}
      </div>

      {/* Recent Transactions List */}
      <section className="recent-expenses-section">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">TRANSACTION HISTORY</p>
            <h2 className="section-title">Logged Expenses ({expenses.length})</h2>
          </div>
          {expenses.length > 0 && (
            <span className="section-note">Tap trash icon to delete an entry</span>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state-box">
            <span className="empty-icon">🧾</span>
            <h3>No expenses logged yet</h3>
            <p>Log your daily purchases, groceries, and bills to see live tracking in action.</p>
            <button type="button" className="button-secondary mt-3" onClick={onOpenAddExpense}>
              <Plus size={16} /> Add First Expense
            </button>
          </div>
        ) : (
          <AnimatedList>
            {expenses.map((expense) => {
              const category = categories.find((c) => c.id === expense.categoryId)
              return (
                <div key={expense.id} className="expense-item-row">
                  <div className="expense-item-left">
                    <span
                      className="expense-category-dot"
                      style={{ backgroundColor: category?.color ?? '#4F46E5' }}
                    />
                    <div>
                      <strong className="expense-note">{expense.note || category?.name || 'Expense'}</strong>
                      <span className="expense-meta">
                        {category?.name ?? 'General'} • {expense.date}
                      </span>
                    </div>
                  </div>
                  <div className="expense-item-right">
                    <strong className="expense-amount">
                      -{formatMoney(expense.amount, currency)}
                    </strong>
                    <button
                      type="button"
                      className="expense-del-btn"
                      onClick={() => handleDeleteExpense(expense.id, expense.note)}
                      aria-label="Delete expense"
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </AnimatedList>
        )}
      </section>
    </div>
  )
}
