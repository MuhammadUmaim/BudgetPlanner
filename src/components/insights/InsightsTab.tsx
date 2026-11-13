import { Sparkles, Check, TrendingUp, ShieldCheck } from 'lucide-react'
import { useBudget } from '../../store/budget'
import type { HealthResult } from '../../lib/healthScore'
import { compareRuleOfThumb } from '../../lib/healthScore'
import { formatPercent } from '../../lib/format'
import { triggerConfetti } from '../../lib/confetti'
import { playSound } from '../../lib/sound'
import { SpotlightCard } from '../reactbits/SpotlightCard'
import { AnimatedList } from '../reactbits/AnimatedList'
import { CountUp } from '../reactbits/CountUp'

interface InsightsTabProps {
  health: HealthResult
  ruleOfThumb: ReturnType<typeof compareRuleOfThumb>
  tips: { severity: 'good' | 'info' | 'warning'; text: string }[]
  onToast: (msg: string) => void
  soundEnabled: boolean
}

export function InsightsTab({
  health,
  ruleOfThumb,
  tips,
  onToast,
  soundEnabled,
}: InsightsTabProps) {
  const { categories, setPercent } = useBudget()

  const symbols = { good: '✓', info: 'i', warning: '!' }

  function handleApplyLever(categoryName: string, delta: number) {
    const target = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName.toLowerCase()
    )
    if (!target) return

    const next = Math.max(0, Math.min(100, target.percent + delta))
    setPercent(target.id, next)
    if (soundEnabled) playSound('success')
    triggerConfetti()
    onToast(`Applied suggested adjustment to ${target.name}!`)
  }

  const scoreColor =
    health.score >= 80 ? '#10B981' : health.score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="tab-pane insights-pane">
      {/* 1. Health Score Hero HUD */}
      <section className="insights-hero-grid mb-6">
        <SpotlightCard className="health-hero-card">
          <div className="health-hero-left">
            <span className="eyebrow">DIAGNOSTIC INDEX</span>
            <h2 className="health-verdict-title">
              Budget Health: <span style={{ color: scoreColor }}>{health.verdict}</span>
            </h2>
            <p className="health-verdict-desc">
              Evaluated across safety buffers, essential expense ratios, discretionary spending, and long-term wealth building.
            </p>

            <div className="health-status-tags mt-4 flex gap-2 flex-wrap">
              <span className="status-tag status-safe">
                <ShieldCheck size={14} /> 50/30/20 Aligned
              </span>
              <span className="status-tag status-safe">
                <TrendingUp size={14} /> Compound Ready
              </span>
            </div>
          </div>

          <div className="health-dial-wrap">
            <svg className="health-dial-svg" viewBox="0 0 120 120">
              <circle
                className="dial-bg-circle"
                cx="60"
                cy="60"
                r="50"
                strokeWidth="10"
                fill="none"
              />
              <circle
                className="dial-progress-circle"
                cx="60"
                cy="60"
                r="50"
                strokeWidth="10"
                strokeDasharray={314.16}
                strokeDashoffset={314.16 - (314.16 * health.score) / 100}
                stroke={scoreColor}
                fill="none"
              />
            </svg>
            <div className="health-dial-center">
              <span className="health-dial-score">
                <CountUp value={health.score} format={(v) => Math.round(v).toString()} />
              </span>
              <span className="health-dial-max">/ 100</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 2. 50/30/20 Rule Comparison Card */}
        <SpotlightCard className="rule-card">
          <div className="section-heading mb-3">
            <div>
              <p className="eyebrow">GOLD STANDARD</p>
              <h3 className="section-title text-base">50 / 30 / 20 Framework</h3>
            </div>
            <span className="rule-badge">Needs • Wants • Savings</span>
          </div>

          <div className="rule-bars-stack">
            {/* Needs */}
            <div className="rule-row">
              <div className="rule-row-header">
                <span className="font-semibold text-sm">Needs (Housing, Food, Health)</span>
                <span className="text-sm">
                  <strong>{formatPercent(ruleOfThumb.needs)}</strong> / 50% target
                </span>
              </div>
              <div className="rule-track">
                <div
                  className="rule-fill"
                  style={{
                    width: `${Math.min(100, ruleOfThumb.needs * 2)}%`,
                    backgroundColor: ruleOfThumb.needs <= 50 ? '#10B981' : '#F59E0B',
                  }}
                />
              </div>
            </div>

            {/* Wants */}
            <div className="rule-row">
              <div className="rule-row-header">
                <span className="font-semibold text-sm">Wants (Entertainment, Fitness)</span>
                <span className="text-sm">
                  <strong>{formatPercent(ruleOfThumb.wants)}</strong> / 30% target
                </span>
              </div>
              <div className="rule-track">
                <div
                  className="rule-fill"
                  style={{
                    width: `${Math.min(100, (ruleOfThumb.wants / 30) * 100)}%`,
                    backgroundColor: ruleOfThumb.wants <= 30 ? '#10B981' : '#F59E0B',
                  }}
                />
              </div>
            </div>

            {/* Savings */}
            <div className="rule-row">
              <div className="rule-row-header">
                <span className="font-semibold text-sm">Savings, Investments & Charity</span>
                <span className="text-sm">
                  <strong>{formatPercent(ruleOfThumb.savings)}</strong> / 20% target
                </span>
              </div>
              <div className="rule-track">
                <div
                  className="rule-fill"
                  style={{
                    width: `${Math.min(100, (ruleOfThumb.savings / 20) * 100)}%`,
                    backgroundColor: ruleOfThumb.savings >= 20 ? '#10B981' : '#EF4444',
                  }}
                />
              </div>
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* 3. Actionable Levers to Boost Health */}
      <section className="mb-6">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">OPTIMIZATION ENGINE</p>
            <h2 className="section-title">High-Impact Levers</h2>
          </div>
          <span className="section-note">1-tap actionable recommendations to strengthen your plan</span>
        </div>

        {health.levers.length === 0 ? (
          <SpotlightCard className="p-5 text-center">
            <Check className="mx-auto text-success mb-2" size={24} />
            <h3 className="font-semibold text-base">Exceptional Balance!</h3>
            <p className="text-muted text-sm mt-1">
              Your budget satisfies all primary health thresholds. Keep accumulating disciplined savings.
            </p>
          </SpotlightCard>
        ) : (
          <div className="levers-grid">
            {health.levers.map((lever, index) => (
              <SpotlightCard key={index} className="lever-card">
                <div className="lever-card-body">
                  <span className="lever-icon-wrap">⚡</span>
                  <div>
                    <h4 className="lever-title">{lever.label}</h4>
                    <p className="lever-impact">{lever.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="button-primary text-xs"
                  onClick={() => handleApplyLever(lever.label, 2)}
                >
                  <Sparkles size={12} /> Apply Suggestion
                </button>
              </SpotlightCard>
            ))}
          </div>
        )}
      </section>

      {/* 4. Smart AI Financial Coaching Feed */}
      <section className="mb-8">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">FINANCIAL MENTOR</p>
            <h2 className="section-title">Contextual Guidance Feed</h2>
          </div>
          <span className="section-note">Rules-based financial wellness insights</span>
        </div>

        <AnimatedList>
          {tips.map((tip, index) => (
            <SpotlightCard key={index} className="advice-feed-card">
              <span className={`advice-icon ${tip.severity}`} aria-label={tip.severity}>
                {symbols[tip.severity]}
              </span>
              <p className="advice-text">{tip.text}</p>
            </SpotlightCard>
          ))}
        </AnimatedList>

        <p className="disclaimer mt-4 text-center">
          For educational planning purposes only — not certified professional financial advice.
        </p>
      </section>
    </div>
  )
}
