import { useState, useEffect } from 'react'
import {
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  Globe,
} from 'lucide-react'
import { useBudget } from '../../store/budget'
import { currencies, type Currency } from '../../lib/format'
import { playSound } from '../../lib/sound'

interface HeaderProps {
  soundEnabled: boolean
  onToggleSound: () => void
  lang: 'en' | 'ur'
  onToggleLang: () => void
  onOpenCommandPalette: () => void
  onReset: () => void
  totalPercent: number
}

export function Header({
  soundEnabled,
  onToggleSound,
  lang,
  onToggleLang,
  onOpenCommandPalette,
  onReset,
  totalPercent,
}: HeaderProps) {
  const { income, currency, theme, setIncome, setCurrency, setTheme } = useBudget()
  const [incomeDraft, setIncomeDraft] = useState(String(income))

  useEffect(() => {
    setIncomeDraft(String(income))
  }, [income])

  const presets = [50_000, 100_000, 200_000, 500_000, 1_000_000]

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (soundEnabled) playSound('toggle')
  }

  const isBalanced = Math.abs(totalPercent - 100) < 0.001

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Brand Group */}
        <div className="brand-group">
          <a className="brand" href="#" aria-label="clearmoney home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="brand-name">
              clear<span>money</span>
            </span>
          </a>

          {/* Quick HUD balance status pill */}
          <div className={`topbar-hud-pill ${isBalanced ? 'is-good' : 'is-warn'}`}>
            <span className="hud-pill-dot" />
            <span className="hud-pill-text">
              {isBalanced ? '100% Locked' : `${totalPercent.toFixed(1)}% Allocated`}
            </span>
          </div>
        </div>

        {/* Central Income Controls */}
        <div className="income-controls">
          <div className="flex justify-between items-center mb-1">
            <label className="income-label" htmlFor="monthly-income">
              MONTHLY TAKE-HOME
            </label>
            <div className="preset-row" aria-label="Quick presets">
              {presets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`preset-chip ${income === amount ? 'selected' : ''}`}
                  onClick={() => {
                    setIncome(amount)
                    if (soundEnabled) playSound('snap')
                  }}
                >
                  {amount >= 1_000_000 ? `${amount / 1_000_000}M` : `${amount / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div className="income-entry">
            <label className="sr-only" htmlFor="currency-select">
              Currency
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as Currency)
                if (soundEnabled) playSound('snap')
              }}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <span className="entry-divider" />

            <input
              id="monthly-income"
              type="number"
              min="0"
              max="1000000000000"
              step="1000"
              inputMode="decimal"
              value={incomeDraft}
              onChange={(e) => {
                const val = e.target.value
                setIncomeDraft(val)
                if (val.trim() !== '' && Number.isFinite(Number(val))) {
                  setIncome(Number(val))
                }
              }}
              onBlur={() => {
                if (incomeDraft.trim() === '') {
                  setIncome(0)
                  setIncomeDraft('0')
                } else if (!Number.isFinite(Number(incomeDraft))) {
                  setIncomeDraft(String(income))
                }
              }}
              aria-label={`Monthly income in ${currency}`}
            />
          </div>
        </div>

        {/* Action icons group */}
        <div className="utility-actions">
          {/* Command Palette search trigger */}
          <button
            type="button"
            className="utility-btn cmdk-trigger-btn"
            onClick={onOpenCommandPalette}
            title="Open Command Palette (Ctrl+K)"
            aria-label="Open Command Palette"
          >
            <Search size={15} />
            <span className="cmdk-shortcut-pill">⌘K</span>
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            className="utility-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Disable interface sounds' : 'Enable interface sounds'}
            aria-label={soundEnabled ? 'Disable interface sounds' : 'Enable interface sounds'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Language toggle (English / Urdu) */}
          <button
            type="button"
            className="utility-btn"
            onClick={onToggleLang}
            title={`Switch language (${lang === 'en' ? 'اردو' : 'English'})`}
            aria-label={`Switch language (${lang === 'en' ? 'اردو' : 'English'})`}
          >
            <Globe size={15} />
            <span className="text-[10px] font-bold ml-1">{lang === 'en' ? 'UR' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            className="utility-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'cyber dark' : 'clean light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'cyber dark' : 'clean light'} mode`}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Reset budget */}
          <button
            type="button"
            className="utility-btn text-danger"
            onClick={onReset}
            title="Reset budget to starter plan"
            aria-label="Reset budget"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
