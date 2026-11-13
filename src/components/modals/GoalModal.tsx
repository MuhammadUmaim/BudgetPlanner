import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Target } from 'lucide-react'
import { useBudget } from '../../store/budget'
import { useGoals } from '../../store/goals'
import { formatMoney } from '../../lib/format'
import { StarBorder } from '../reactbits/StarBorder'

interface GoalModalProps {
  open: boolean
  onClose: () => void
  onToast: (msg: string) => void
}

export function GoalModal({ open, onClose, onToast }: GoalModalProps) {
  const { currency } = useBudget()
  const { addGoal } = useGoals()

  const [name, setName] = useState('')
  const [targetAmountStr, setTargetAmountStr] = useState('')
  const [currentAmountStr, setCurrentAmountStr] = useState('0')
  const [monthlyContributionStr, setMonthlyContributionStr] = useState('10000')
  const [category, setCategory] = useState('Savings')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#4F46E5')

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const targetAmount = Number(targetAmountStr)
    if (!targetAmount || targetAmount <= 0) return

    addGoal({
      name: name.trim() || 'Custom Goal',
      targetAmount,
      currentAmount: Number(currentAmountStr) || 0,
      monthlyContribution: Number(monthlyContributionStr) || 0,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      category,
      icon,
      color,
    })

    onToast(`Created new savings goal: "${name}" (${formatMoney(targetAmount, currency)})`)
    onClose()
  }

  const icons = ['🎯', '🛡️', '🕋', '🚗', '🏡', '📈', '💍', '🎓', '🏖️', '💻']

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="category-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-modal-title"
        >
          <div className="modal-heading">
            <div>
              <p className="eyebrow">NEW HORIZON</p>
              <h2 id="goal-modal-title">Create Savings Goal</h2>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="form-label">
              <span>Goal Name</span>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Wedding, Emergency Buffer, Downpayment"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="form-label">
                <span>Target Amount ({currency})</span>
                <input
                  type="number"
                  min="1000"
                  placeholder="500000"
                  value={targetAmountStr}
                  onChange={(e) => setTargetAmountStr(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                <span>Initial Saved Amount</span>
                <input
                  type="number"
                  min="0"
                  value={currentAmountStr}
                  onChange={(e) => setCurrentAmountStr(e.target.value)}
                />
              </label>
            </div>

            <label className="form-label">
              <span>Planned Monthly Contribution ({currency} / mo)</span>
              <input
                type="number"
                min="0"
                value={monthlyContributionStr}
                onChange={(e) => setMonthlyContributionStr(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="form-label">
                <span>Category Tag</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="modal-select"
                >
                  <option value="Savings">Savings</option>
                  <option value="Safety">Safety</option>
                  <option value="Spiritual">Spiritual</option>
                  <option value="Wealth">Wealth</option>
                  <option value="Family">Family</option>
                  <option value="Asset">Asset</option>
                </select>
              </label>

              <label className="form-label color-label">
                <span>Goal Color</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span className="color-code">{color.toUpperCase()}</span>
                </div>
              </label>
            </div>

            <div className="form-label">
              <span>Choose Icon</span>
              <div className="flex gap-2 flex-wrap mt-1">
                {icons.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className={`icon-picker-btn ${icon === ic ? 'is-active' : ''}`}
                    onClick={() => setIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions mt-4 flex gap-3">
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button-primary flex-1">
                <Target size={16} />
                <span>Create Goal</span>
                <StarBorder />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
