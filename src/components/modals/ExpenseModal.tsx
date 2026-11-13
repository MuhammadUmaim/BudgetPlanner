import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Receipt } from 'lucide-react'
import { useBudget } from '../../store/budget'
import { useExpenses } from '../../store/expenses'
import { formatMoney } from '../../lib/format'
import { StarBorder } from '../reactbits/StarBorder'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  onToast: (msg: string) => void
}

export function ExpenseModal({ open, onClose, onToast }: ExpenseModalProps) {
  const { categories, currency } = useBudget()
  const { addExpense } = useExpenses()

  const [amountStr, setAmountStr] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'groceries')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amount = Number(amountStr)
    if (!amount || amount <= 0) return

    addExpense({
      categoryId,
      amount,
      note: note.trim(),
      date,
    })

    const catName = categories.find((c) => c.id === categoryId)?.name ?? 'General'
    onToast(`Logged expense of ${formatMoney(amount, currency)} in ${catName}`)
    setAmountStr('')
    setNote('')
    onClose()
  }

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
          aria-labelledby="expense-modal-title"
        >
          <div className="modal-heading">
            <div>
              <p className="eyebrow">QUICK TRACK</p>
              <h2 id="expense-modal-title">Log an Expense</h2>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="form-label">
              <span>Expense Amount ({currency})</span>
              <input
                type="number"
                min="1"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="e.g. 3500"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
              />
            </label>

            <label className="form-label">
              <span>Budget Category</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="modal-select"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              <span>Note / Description (Optional)</span>
              <input
                type="text"
                placeholder="e.g. Weekly organic veggies"
                maxLength={60}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            <label className="form-label">
              <span>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <div className="modal-actions mt-4 flex gap-3">
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button-primary flex-1">
                <Receipt size={16} />
                <span>Save Expense</span>
                <StarBorder />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
