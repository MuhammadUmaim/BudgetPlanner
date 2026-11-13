import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import type { HealthResult } from '../lib/healthScore'

const VERDICT_STYLES: Record<HealthResult['verdict'], { label: string; color: string; bg: string; ring: string }> = {
  strong: { label: 'Strong', color: '#14734f', bg: '#e6f7ed', ring: 'rgba(20,115,79,.25)' },
  balanced: { label: 'Balanced', color: '#b45309', bg: '#fffbeb', ring: 'rgba(180,83,9,.25)' },
  'needs attention': { label: 'Needs attention', color: '#b91c1c', bg: '#fef2f2', ring: 'rgba(185,28,28,.25)' },
}

export function HealthScore({ result, reduced }: { result: HealthResult; reduced: boolean | null }) {
  const style = VERDICT_STYLES[result.verdict]
  const circumference = 2 * Math.PI * 46
  const offset = circumference * (1 - result.score / 100)
  return (
    <div className="health-score">
      <div className="health-score__ring" style={{ ['--ring-color']: style.color } as React.CSSProperties}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="health-score__track" style={{ color: 'rgba(0,0,0,.07)' }} />
          <motion.circle
            cx="50" cy="50" r="46" fill="none" className="health-score__progress"
            style={{ color: style.color, strokeDasharray: circumference, strokeDashoffset: offset, strokeWidth: 6, strokeLinecap: 'round' }}
            initial={reduced ? { strokeDashoffset: circumference } : { strokeDashoffset: circumference }}
            animate={reduced ? { strokeDashoffset: offset } : { strokeDashoffset: offset }}
            transition={reduced ? { duration: 0 } : { duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="health-score__center">
          <span className="health-score__score">{result.score}</span>
          <span className="health-score__max">/ 100</span>
        </div>
      </div>
      <div className="health-score__meta">
        <span className="health-score__badge" style={{ color: style.color, background: style.bg, ['--ring']: style.ring } as React.CSSProperties}>
          <span className="health-score__dot" style={{ background: style.color }} />
          {style.label}
        </span>
        <p className="health-score__summary">{result.summary}</p>
      </div>
    </div>
  )
}

export function HealthLeverList({ levers }: { levers: HealthResult['levers'] }) {
  return (
    <ul className="health-levers">
      {levers.map((lever, index) => (
        <li key={index} className="health-lever">
          <span className="health-lever__num" aria-hidden="true">{index + 1}</span>
          <div>
            <p className="health-lever__label">{lever.label}</p>
            <p className="health-lever__desc">{lever.description}</p>
            <p className="health-lever__target">{lever.target}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function RuleOfThumb({ needs, wants, savings, target }: { needs: number; wants: number; savings: number; target: { needs: number; wants: number; savings: number } }) {
  const reduced = useReducedMotion()
  const items = [
    { label: 'Needs', value: needs, target: target.needs, color: '#138764' },
    { label: 'Wants', value: wants, target: target.wants, color: '#f59e0b' },
    { label: 'Savings', value: savings, target: target.savings, color: '#4f46e5' },
  ]
  return (
    <div className="rule-of-thumb">
      <div className="rule-of-thumb__bar" aria-hidden="true">
        {items.map((item) => (
          <motion.div
            key={item.label}
            className="rule-of-thumb__seg"
            style={{ ['--seg-color']: item.color, ['--seg-w']: `${item.value}%` } as React.CSSProperties}
            initial={reduced ? { width: 0 } : { width: 0 }}
            animate={reduced ? { width: `${item.value}%` } : { width: `${item.value}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, ease: 'easeOut', delay: 0.2 + items.indexOf(item) * 0.1 }}
          />
        ))}
      </div>
      <div className="rule-of-thumb__legend">
        {items.map((item) => {
          const ok = Math.abs(item.value - item.target) <= 5
          return (
            <span key={item.label} className="rule-of-thumb__item">
              <span className="rule-of-thumb__dot" style={{ background: item.color }} />
              <strong>{item.label} {item.value}%</strong>
              <span>· target {item.target}%{ok ? ' ✓' : ''}</span>
            </span>
          )
        })}
      </div>
      <p className="rule-of-thumb__note">The 50/30/20 rule of thumb — a rough guide, not a target.</p>
    </div>
  )
}