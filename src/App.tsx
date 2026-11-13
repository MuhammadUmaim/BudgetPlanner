import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ReactLenis } from 'lenis/react'
import { X } from 'lucide-react'
import type { BudgetCategory } from './lib/presets'
import { profiles } from './lib/presets'
import { allocateAmounts, totalPercent } from './lib/allocation'
import { getAdvice } from './lib/advice'
import { computeHealth, compareRuleOfThumb } from './lib/healthScore'
import { currencyDigits, formatMoney, formatPercent, type Currency } from './lib/format'
import { downloadCsv } from './lib/export'
import { useBudget } from './store/budget'
import { playSound } from './lib/sound'
import { vibrate } from './lib/haptics'
import { triggerConfetti } from './lib/confetti'

// React Bits components
import GlowCursor from './components/reactbits/GlowCursor'
import { StarBorder } from './components/reactbits/StarBorder'
import { HealthScore, HealthLeverList, RuleOfThumb } from './components/HealthScore'
import type { HealthResult } from './lib/healthScore'

// Layout & Tabs
import { Header } from './components/layout/Header'
import { BottomNav, type TabId } from './components/layout/BottomNav'
import { CommandPalette } from './components/layout/CommandPalette'
import { PlanTab } from './components/plan/PlanTab'
import { InsightsTab } from './components/insights/InsightsTab'
import { TrackTab } from './components/track/TrackTab'
import { GoalsTab } from './components/goals/GoalsTab'
import { ToolsTab } from './components/tools/ToolsTab'

// Modals
import { ShareCardModal } from './components/modals/ShareCardModal'
import { ExpenseModal } from './components/modals/ExpenseModal'
import { GoalModal } from './components/modals/GoalModal'

const DotGrid = lazy(() => import('./components/reactbits/DotGrid'))

type ModalValue = { id?: string; name: string; color: string }

function CategoryModal({ value, onClose }: { value: ModalValue | null; onClose: () => void }) {
  const { addCategory, updateCategory, removeCategory } = useBudget()
  const categories = useBudget((state) => state.categories)
  const [name, setName] = useState(value?.name ?? '')
  const [color, setColor] = useState(value?.color ?? '#4F46E5')
  const [percent, setPercent] = useState('5')

  useEffect(() => {
    setName(value?.name ?? '')
    setColor(value?.color ?? '#4F46E5')
    setPercent('5')
  }, [value])

  const categoryId = value?.id
  const editing = Boolean(categoryId)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!value) return
    const trimmed = name.trim()
    if (!trimmed) return
    if (editing && categoryId) {
      updateCategory(categoryId, { name: trimmed, color })
    } else {
      addCategory(trimmed, color, Number(percent))
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {value && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            className="category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-heading"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editing ? 'CUSTOMIZE BUCKET' : 'EXPAND ALLOCATION'}</p>
                <h2 id="modal-heading">{editing ? 'Edit category' : 'Add custom category'}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit}>
              <label className="form-label">
                Category name
                <input
                  autoFocus
                  maxLength={32}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Travel & Vacations"
                  required
                />
              </label>

              <label className="form-label color-label">
                Category color
                <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
                <span className="color-code">{color.toUpperCase()}</span>
              </label>

              {!editing && (
                <label className="form-label">
                  Starting allocation
                  <span className="modal-percent-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={percent}
                      onChange={(event) => setPercent(event.target.value)}
                    />
                    <span>%</span>
                  </span>
                  <span className="field-note">
                    This percentage is shared proportionally from your unlocked categories.
                  </span>
                </label>
              )}

              <div className="modal-actions">
                {editing && categoryId?.startsWith('custom-') && (
                  <button
                    className="delete-button"
                    type="button"
                    disabled={categories.length <= 1}
                    onClick={() => {
                      if (categoryId) removeCategory(categoryId)
                      onClose()
                    }}
                  >
                    Delete category
                  </button>
                )}
                <button className="button-secondary" type="button" onClick={onClose}>
                  Cancel
                </button>
                <button className="button-primary" type="submit">
                  {editing ? 'Save changes' : 'Add category'}
                  <StarBorder />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function HealthModal({
  open,
  onClose,
  health,
  ruleOfThumb,
}: {
  open: boolean
  onClose: () => void
  health: HealthResult
  ruleOfThumb: ReturnType<typeof compareRuleOfThumb>
}) {
  const reduced = useReducedMotion() ?? false

  return (
    <AnimatePresence>
      {open && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            className="category-modal health-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-heading"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">DIAGNOSTIC REPORT</p>
                <h2 id="health-heading">Budget Health Checkup</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <HealthScore result={health} reduced={reduced} />

            <div className="health-modal__body">
              {health.levers.length > 0 ? (
                <>
                  <p className="health-modal__levers-title">Key Levers for Improvement</p>
                  <HealthLeverList levers={health.levers} />
                </>
              ) : (
                <p className="health-modal__good">
                  ✓ Outstanding! Your budget satisfies all optimal financial health metrics.
                </p>
              )}
              <div className="health-modal__rule">
                <p className="eyebrow">50/30/20 BENCHMARK</p>
                <RuleOfThumb {...ruleOfThumb} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="button-secondary" type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function PrintReport({
  categories,
  amounts,
  income,
  currency,
  profile,
  tips,
}: {
  categories: BudgetCategory[]
  amounts: Record<string, number>
  income: number
  currency: Currency
  profile: string
  tips: { severity: string; text: string }[]
}) {
  return (
    <article className="print-report">
      <header className="print-header">
        <div>
          <p className="print-kicker">CLEARMONEY • MONTHLY FINANCIAL PLAN</p>
          <h1>Official Budget & Resource Allocation Report</h1>
        </div>
        <p>Prepared {new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date())}</p>
      </header>

      <div className="print-meta">
        <div>
          <span>Monthly Take-Home</span>
          <strong>{formatMoney(income, currency)}</strong>
        </div>
        <div>
          <span>Household Situation</span>
          <strong>{profile}</strong>
        </div>
        <div>
          <span>Total Planned</span>
          <strong>{formatPercent(totalPercent(categories))}</strong>
        </div>
      </div>

      <div className="print-body">
        <div className="print-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocation</th>
                <th>Monthly Amount</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{formatPercent(c.percent)}</td>
                  <td>{formatMoney(amounts[c.id] ?? 0, currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total Allocated</th>
                <td>{formatPercent(totalPercent(categories))}</td>
                <th>
                  {formatMoney(
                    Object.values(amounts).reduce((s, a) => s + a, 0),
                    currency
                  )}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <section className="print-advice">
        <h2>Guidance Notes</h2>
        {tips.slice(0, 4).map((tip, index) => (
          <p key={index}>• {tip.text}</p>
        ))}
      </section>

      <footer className="print-footer">
        Generated by clearmoney. Financial clarity on your terms.
      </footer>
    </article>
  )
}

export default function App() {
  const reduced = useReducedMotion()
  const [isPrinting, setIsPrinting] = useState(false)

  // Active Tab state: 'plan' | 'insights' | 'track' | 'goals' | 'tools'
  const [activeTab, setActiveTab] = useState<TabId>('plan')

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shareCardModalOpen, setShareCardModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [categoryModal, setCategoryModal] = useState<ModalValue | null>(null)
  const [healthModalOpen, setHealthModalOpen] = useState(false)

  // Audio & Haptics & Language
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hapticsEnabled] = useState(true)
  const [lang, setLang] = useState<'en' | 'ur'>('en')

  // Toast state
  const [toast, setToast] = useState('')
  const [toastId, setToastId] = useState(0)

  // Budget store
  const theme = useBudget((state) => state.theme)
  const income = useBudget((state) => state.income)
  const currency = useBudget((state) => state.currency)
  const profile = useBudget((state) => state.profile)
  const categories = useBudget((state) => state.categories)
  const { setCurrency, setProfile, normalize, reset } = useBudget()

  const amounts = useMemo(
    () => allocateAmounts(income, categories, currencyDigits(currency)),
    [income, categories, currency]
  )
  const total = totalPercent(categories)
  const advice = useMemo(
    () => getAdvice(categories, income, profile, currency, total),
    [categories, income, profile, currency, total]
  )
  const health = useMemo(() => computeHealth(categories, total), [categories, total])
  const ruleOfThumb = useMemo(() => compareRuleOfThumb(categories), [categories])
  const currentProfile = profiles.find((item) => item.id === profile)?.name ?? profiles[0].name

  function showToast(message: string) {
    setToast(message)
    setToastId((id) => id + 1)
  }

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#0A0D14' : '#FAFAFB'
    )
  }, [theme])

  // Sync language / direction
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
  }, [lang])

  // Toast timer
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toast, toastId])

  // Print events
  useEffect(() => {
    const beforePrint = () => setIsPrinting(true)
    const afterPrint = () => setIsPrinting(false)
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])

  function handleReset() {
    if (window.confirm('Reset your income, profile, and categories to the starter plan?')) {
      reset()
      if (soundEnabled) playSound('alert')
      showToast('Budget reset to default starting plan.')
    }
  }

  const content = (
    <>
      <Suspense fallback={null}>
        <DotGrid />
      </Suspense>

      <div className="app-content">
        <GlowCursor
          className="hero-glow"
          color={theme === 'dark' ? '#00FF9D' : '#6366F1'}
          secondaryColor={theme === 'dark' ? '#6366F1' : '#38BDF8'}
          intensity={0.45}
          glow={0.35}
          trailWidth={24}
          linger={0.5}
          quality="low"
          theme={theme === 'dark' ? 'dark' : 'light'}
          clickBurst
          enabled={!reduced}
        >
          {/* Futuristic Sticky Header */}
          <Header
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
            lang={lang}
            onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ur' : 'en'))}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onReset={handleReset}
            totalPercent={total}
          />

          {/* Desktop Tab Switcher Bar */}
          <div className="desktop-tab-bar">
            <div className="desktop-tab-bar-inner">
              {(
                [
                  { id: 'plan', label: '1. Budget Plan' },
                  { id: 'insights', label: '2. Insights & Health' },
                  { id: 'track', label: '3. Track Expenses' },
                  { id: 'goals', label: '4. Savings & Wealth' },
                  { id: 'tools', label: '5. Tools & Zakat' },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`desktop-tab-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      if (soundEnabled) playSound('snap')
                      if (hapticsEnabled) vibrate('tick')
                      setActiveTab(tab.id)
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-desktop-pill"
                        className="desktop-tab-glow"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main App Container */}
          <main className="page-shell">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === 'plan' && (
                  <PlanTab
                    amounts={amounts}
                    onOpenEditCategory={(cat) =>
                      setCategoryModal({ id: cat.id, name: cat.name, color: cat.color })
                    }
                    onOpenAddCategory={() => setCategoryModal({ name: '', color: '#4F46E5' })}
                    onOpenHealth={() => setHealthModalOpen(true)}
                    soundEnabled={soundEnabled}
                    hapticsEnabled={hapticsEnabled}
                  />
                )}

                {activeTab === 'insights' && (
                  <InsightsTab
                    health={health}
                    ruleOfThumb={ruleOfThumb}
                    tips={advice}
                    onToast={showToast}
                    soundEnabled={soundEnabled}
                  />
                )}

                {activeTab === 'track' && (
                  <TrackTab
                    amounts={amounts}
                    onOpenAddExpense={() => setExpenseModalOpen(true)}
                    onToast={showToast}
                  />
                )}

                {activeTab === 'goals' && (
                  <GoalsTab
                    onOpenAddGoal={() => setGoalModalOpen(true)}
                    onToast={showToast}
                    soundEnabled={soundEnabled}
                  />
                )}

                {activeTab === 'tools' && (
                  <ToolsTab
                    amounts={amounts}
                    onOpenShareCard={() => setShareCardModalOpen(true)}
                    onToast={showToast}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <footer className="site-footer">
              <span>Made for financial clarity & sustainable peace of mind.</span>
              <span>© {new Date().getFullYear()} clearmoney • Local-First & Private</span>
            </footer>
          </main>
        </GlowCursor>

        {/* Mobile Floating Glass Dock */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      {/* Printable Sheet */}
      <PrintReport
        categories={categories}
        amounts={amounts}
        income={income}
        currency={currency}
        profile={currentProfile}
        tips={advice}
      />

      {/* Global Modals */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onOpenAddExpense={() => setExpenseModalOpen(true)}
        onOpenAddCategory={() => setCategoryModal({ name: '', color: '#4F46E5' })}
        onNormalize={() => {
          normalize()
          triggerConfetti()
          showToast('Budget allocations normalized to 100%.')
        }}
        onReset={handleReset}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'light' ? 'dark' : 'light'
          useBudget.getState().setTheme(next)
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((p) => !p)}
        lang={lang}
        onToggleLang={() => setLang((p) => (p === 'en' ? 'ur' : 'en'))}
        onSetCurrency={(curr) => setCurrency(curr)}
        onSetProfile={(prof) => setProfile(prof)}
        onOpenShareCard={() => setShareCardModalOpen(true)}
        onDownloadCsv={() => downloadCsv(categories, amounts, currency)}
      />

      <ShareCardModal
        open={shareCardModalOpen}
        onClose={() => setShareCardModalOpen(false)}
        income={income}
        currency={currency}
        categories={categories}
        amounts={amounts}
        healthScore={health.score}
      />

      <ExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onToast={showToast}
      />

      <GoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onToast={showToast}
      />

      <CategoryModal
        value={categoryModal}
        onClose={() => setCategoryModal(null)}
      />

      <HealthModal
        open={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        health={health}
        ruleOfThumb={ruleOfThumb}
      />

      {/* Animated Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toastId}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return reduced || isPrinting ? (
    content
  ) : (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        duration: 1.1,
        easing: (t) => Math.min(1, 1 - (1 - t) ** 3),
      }}
    >
      {content}
    </ReactLenis>
  )
}
