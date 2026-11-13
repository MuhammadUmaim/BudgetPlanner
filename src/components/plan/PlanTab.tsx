import { useState, useMemo, type CSSProperties } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { Plus, Lock, Unlock, Edit3, Minus, Sparkles, Check } from 'lucide-react'
import { useBudget } from '../../store/budget'
import { profiles, type BudgetCategory, type ProfileId } from '../../lib/presets'
import { formatMoney, formatPercent, formatMoneyForSpeech } from '../../lib/format'
import { totalPercent } from '../../lib/allocation'
import { triggerConfetti } from '../../lib/confetti'
import { playSound } from '../../lib/sound'
import { vibrate } from '../../lib/haptics'
import { SpotlightCard } from '../reactbits/SpotlightCard'
import { CountUp } from '../reactbits/CountUp'

interface PlanTabProps {
  amounts: Record<string, number>
  onOpenEditCategory: (cat: BudgetCategory) => void
  onOpenAddCategory: () => void
  onOpenHealth: () => void
  soundEnabled: boolean
  hapticsEnabled: boolean
}

export function PlanTab({
  amounts,
  onOpenEditCategory,
  onOpenAddCategory,
  onOpenHealth,
  soundEnabled,
  hapticsEnabled,
}: PlanTabProps) {
  const {
    income,
    currency,
    profile,
    categories,
    autoBalance,
    setProfile,
    setAutoBalance,
    setPercent,
    toggleLock,
    normalize,
  } = useBudget()

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const total = totalPercent(categories)
  const isBalanced = Math.abs(total - 100) < 0.001

  const chartData = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      percent: cat.percent,
      color: cat.color,
    }))
  }, [categories])

  const hovered = categories.find((c) => c.id === hoveredId)
  const activeIndex = chartData.findIndex((c) => c.id === hoveredId)

  function handlePercentChange(id: string, value: number) {
    if (soundEnabled) playSound('tick')
    if (hapticsEnabled) vibrate('tick')
    setPercent(id, value)
    if (Math.abs(value - 100) < 0.001) {
      triggerConfetti()
    }
  }

  function handleStep(id: string, current: number, delta: number) {
    const next = Math.max(0, Math.min(100, current + delta))
    handlePercentChange(id, next)
  }

  function handleNormalize() {
    normalize()
    if (soundEnabled) playSound('success')
    triggerConfetti()
  }

  return (
    <div className="tab-pane plan-pane">
      {/* 1. Household Profile Carousel */}
      <section className="profile-section mb-6">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">HOUSEHOLD BASELINE</p>
            <h2 className="section-title">Select Family Profile</h2>
          </div>
          <span className="section-note">Instantly aligns percentages to proven real-world benchmarks</span>
        </div>

        <LayoutGroup>
          <div className="profile-grid">
            {profiles.map((p, index) => {
              const active = p.id === profile
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  layout
                  className={`profile-card ${active ? 'active' : ''}`}
                  onClick={() => {
                    setProfile(p.id as ProfileId)
                    if (soundEnabled) playSound('snap')
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="profile-card-top">
                    <span className="profile-index">0{index + 1}</span>
                    {active && (
                      <motion.span layoutId="profile-check" className="profile-check">
                        <Check size={10} strokeWidth={3} />
                      </motion.span>
                    )}
                  </div>
                  <strong>{p.name}</strong>
                  <span>{p.rationale}</span>
                </motion.button>
              )
            })}
          </div>
        </LayoutGroup>
      </section>

      {/* 2. Planner Main Grid: Sliders on left/top, Donut on right/side */}
      <section className="planner-main-section">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">BUDGET SCULPTOR</p>
            <h2 className="section-title">Shape Allocations</h2>
          </div>

          <div className="planner-controls">
            <label className="balance-toggle cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoBalance}
                onChange={(e) => {
                  setAutoBalance(e.target.checked)
                  if (soundEnabled) playSound('toggle')
                }}
              />
              <span className="toggle-track">
                <span />
              </span>
              <span className="text-xs font-semibold">Auto-balance</span>
            </label>
            <span className={`mode-label ${autoBalance ? 'on' : ''}`}>
              {autoBalance ? 'ON' : 'MANUAL'}
            </span>
          </div>
        </div>

        <div className="planner-grid">
          {/* Categories Sliders Column */}
          <div className="category-column">
            <AnimatePresence>
              {categories.map((category) => {
                const amount = amounts[category.id] ?? 0
                return (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SpotlightCard className="category-card">
                      <div className="category-main">
                        <span className="category-color" style={{ backgroundColor: category.color }} />
                        <div className="category-title">
                          <h3>{category.name}</h3>
                          <p>
                            <CountUp value={amount} format={(v) => formatMoney(v, currency)} />
                          </p>
                        </div>

                        <div className="category-actions">
                          <button
                            type="button"
                            className={`icon-button ${category.locked ? 'is-locked' : ''}`}
                            onClick={() => {
                              toggleLock(category.id)
                              if (soundEnabled) playSound('toggle')
                            }}
                            title={category.locked ? 'Unlock category' : 'Lock category'}
                            aria-label={`${category.locked ? 'Unlock' : 'Lock'} ${category.name}`}
                          >
                            {category.locked ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => onOpenEditCategory(category)}
                            title="Edit category"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="category-controls">
                        {/* Mobile Stepper Down */}
                        <button
                          type="button"
                          className="stepper-btn"
                          disabled={category.locked}
                          onClick={() => handleStep(category.id, category.percent, -0.5)}
                          title="Decrease by 0.5%"
                        >
                          <Minus size={12} />
                        </button>

                        <input
                          className="allocation-slider"
                          style={
                            {
                              '--category-color': category.color,
                              '--range-progress': `${category.percent}%`,
                            } as CSSProperties
                          }
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={category.percent}
                          disabled={category.locked}
                          onChange={(e) => handlePercentChange(category.id, Number(e.target.value))}
                          aria-label={`${category.name} allocation slider`}
                          aria-valuetext={`${category.name} ${category.percent} percent, ${formatMoneyForSpeech(
                            amount,
                            currency
                          )}`}
                          data-lenis-prevent
                        />

                        {/* Mobile Stepper Up */}
                        <button
                          type="button"
                          className="stepper-btn"
                          disabled={category.locked}
                          onClick={() => handleStep(category.id, category.percent, +0.5)}
                          title="Increase by 0.5%"
                        >
                          <Plus size={12} />
                        </button>

                        <label className="percent-field">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={category.percent}
                            disabled={category.locked}
                            onChange={(e) => handlePercentChange(category.id, Number(e.target.value))}
                          />
                          <span>%</span>
                        </label>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <motion.button
              type="button"
              className="add-category-button"
              onClick={onOpenAddCategory}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
            >
              <span className="add-icon">
                <Plus size={16} />
              </span>
              <span>
                <strong>Add Custom Category</strong>
                <small>Create an extra priority bucket</small>
              </span>
            </motion.button>
          </div>

          {/* Sticky Donut Column */}
          <div className="chart-column">
            <SpotlightCard className="summary-card chart-card">
              <div className="chart-card-heading">
                <div>
                  <p className="eyebrow">ALLOCATION DONUT</p>
                  <h2>Visual Balance</h2>
                </div>

                <div className="chart-card-actions">
                  <div className={`total-badge ${isBalanced ? 'balanced' : 'unbalanced'}`}>
                    <span className="total-dot" />
                    <span>
                      {isBalanced
                        ? '100% allocated'
                        : `${formatPercent(Math.abs(total - 100))} ${
                            total > 100 ? 'over' : 'unallocated'
                          }`}
                    </span>
                  </div>

                  {!isBalanced && (
                    <button type="button" className="normalize-button" onClick={handleNormalize}>
                      Normalize
                    </button>
                  )}

                  <button
                    type="button"
                    className="health-score-btn"
                    onClick={onOpenHealth}
                    title="View Budget Health Checkup"
                  >
                    <Sparkles size={14} />
                    <span>Health</span>
                  </button>
                </div>
              </div>

              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {total > 0 ? (
                      <Pie
                        data={chartData}
                        dataKey="percent"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="68%"
                        outerRadius="88%"
                        paddingAngle={1.8}
                        stroke="none"
                        activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                        activeShape={(props: PieSectorDataItem) => (
                          <Sector {...props} outerRadius={Number(props.outerRadius) + 8} />
                        )}
                        onMouseEnter={(_, index) => setHoveredId(chartData[index]?.id ?? null)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                    ) : (
                      <Pie
                        data={[{ percent: 100 }]}
                        dataKey="percent"
                        cx="50%"
                        cy="50%"
                        innerRadius="68%"
                        outerRadius="88%"
                        stroke="none"
                      >
                        <Cell fill="#374151" />
                      </Pie>
                    )}
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center" aria-live="polite">
                  <span className="center-label">{hovered?.name ?? 'TOTAL INCOME'}</span>
                  <strong>
                    <CountUp
                      value={hovered ? (amounts[hovered.id] ?? 0) : income}
                      format={(v) => formatMoney(v, currency)}
                    />
                  </strong>
                  <span className="center-caption">
                    {hovered ? formatPercent(hovered.percent) : `${formatPercent(total)} allocated`}
                  </span>
                </div>
              </div>

              <div className="chart-legend">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`legend-row ${hoveredId === cat.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredId(cat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setHoveredId(hoveredId === cat.id ? null : cat.id)}
                  >
                    <span className="legend-name">
                      <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="legend-value">{formatMoney(amounts[cat.id] ?? 0, currency)}</span>
                  </button>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>
    </div>
  )
}
