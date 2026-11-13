import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Check,
  RotateCcw,
  Download,
  Share2,
  FileSpreadsheet,
  Printer,
  Copy,
  Upload,
  Calendar,
} from 'lucide-react'
import { useBudget } from '../../store/budget'
import { useHistory } from '../../store/history'
import { useExpenses } from '../../store/expenses'
import { scenarios, applyScenario, type Scenario } from '../../lib/scenarios'
import { computeZakat, type ZakatAssets } from '../../lib/zakat'
import { formatMoney } from '../../lib/format'
import { downloadCsv, copySummary } from '../../lib/export'
import { SpotlightCard } from '../reactbits/SpotlightCard'
import { StarBorder } from '../reactbits/StarBorder'
import { CountUp } from '../reactbits/CountUp'

interface ToolsTabProps {
  amounts: Record<string, number>
  onOpenShareCard: () => void
  onToast: (msg: string) => void
}

export function ToolsTab({ amounts, onOpenShareCard, onToast }: ToolsTabProps) {
  const { income, currency, categories, setIncome, setCategories } = useBudget()
  const { snapshots, saveSnapshot, removeSnapshot } = useHistory()
  const { getTotalSpent } = useExpenses()

  // Scenario Simulator State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [customIncomeDelta, setCustomIncomeDelta] = useState<number>(0)

  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === selectedScenarioId) ?? null
  }, [selectedScenarioId])

  const simulated = useMemo(() => {
    if (!activeScenario) {
      if (customIncomeDelta === 0) return { income, categories }
      const customScenario: Scenario = {
        id: 'custom-delta',
        name: `Custom Income Delta (${customIncomeDelta > 0 ? '+' : ''}${customIncomeDelta}%)`,
        description: 'Adjusted income on current allocation ratios.',
        icon: '🎛️',
        incomeDelta: customIncomeDelta / 100,
        adjustments: [],
      }
      return applyScenario(categories, customScenario, income)
    }
    return applyScenario(categories, activeScenario, income)
  }, [activeScenario, customIncomeDelta, categories, income])

  function handleApplyScenario() {
    setIncome(simulated.income)
    setCategories(simulated.categories)
    setSelectedScenarioId(null)
    setCustomIncomeDelta(0)
    onToast('Scenario applied to your active monthly budget!')
  }

  // Zakat Calculator State
  const [zakatAssets, setZakatAssets] = useState<ZakatAssets>({
    cashInHand: 40000,
    bankBalance: 280000,
    goldValue: 150000,
    silverValue: 0,
    investmentPortfolio: 250000,
    businessMerchandise: 0,
    shortTermDebts: 20000,
  })
  const [nisabStandard, setNisabStandard] = useState<'silver' | 'gold'>('silver')

  const zakatResult = useMemo(() => {
    return computeZakat(zakatAssets, nisabStandard)
  }, [zakatAssets, nisabStandard])

  // Snapshots
  function handleSaveCurrentSnapshot() {
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())
    saveSnapshot({
      monthLabel: monthName,
      income,
      currency,
      totalAllocated: 100,
      totalSpent: getTotalSpent(),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        percent: c.percent,
        amount: amounts[c.id] ?? 0,
        color: c.color,
      })),
    })
    onToast(`Saved snapshot for ${monthName}!`)
  }

  // JSON Backup / Restore
  function handleExportJson() {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      income,
      currency,
      categories,
      snapshots,
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clearmoney-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    onToast('Exported complete JSON backup.')
  }

  function handleImportJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.income && Array.isArray(data.categories)) {
          setIncome(data.income)
          setCategories(data.categories)
          onToast('Budget successfully restored from backup!')
        } else {
          onToast('Invalid backup file format.')
        }
      } catch {
        onToast('Failed to parse backup JSON.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="tab-pane tools-pane">
      {/* 1. WHAT-IF SCENARIO SIMULATOR */}
      <section className="mb-8">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">PREDICTIVE LAB</p>
            <h2 className="section-title">What-If Life Scenario Simulator</h2>
          </div>
          <span className="section-note">Test major life events or salary shifts before committing</span>
        </div>

        <SpotlightCard className="scenario-lab-card">
          <div className="scenario-grid mb-4">
            {scenarios.map((scenario) => {
              const active = selectedScenarioId === scenario.id
              return (
                <button
                  key={scenario.id}
                  type="button"
                  className={`scenario-chip ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedScenarioId(active ? null : scenario.id)
                    setCustomIncomeDelta(0)
                  }}
                >
                  <span className="scenario-icon">{scenario.icon}</span>
                  <strong>{scenario.name}</strong>
                  <span className="scenario-desc">{scenario.description}</span>
                  {active && <span className="scenario-check">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Custom Income Slider */}
          <div className="custom-delta-box mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="input-field-label">Custom Income Adjustment</span>
              <strong className="text-accent">
                {customIncomeDelta > 0 ? `+${customIncomeDelta}%` : `${customIncomeDelta}%`}
              </strong>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={customIncomeDelta}
              onChange={(e) => {
                setCustomIncomeDelta(Number(e.target.value))
                setSelectedScenarioId(null)
              }}
              className="allocation-slider"
            />
          </div>

          {/* Before vs After comparison */}
          <div className="scenario-diff-box">
            <div className="diff-header">
              <div>
                <span className="hud-mini-label">BASELINE INCOME</span>
                <span className="text-muted font-bold">{formatMoney(income, currency)}</span>
              </div>
              <div className="text-right">
                <span className="hud-mini-label">SIMULATED INCOME</span>
                <strong className="text-success font-bold text-lg">
                  {formatMoney(simulated.income, currency)}
                </strong>
              </div>
            </div>

            <div className="diff-actions mt-4 flex gap-3">
              <motion.button
                type="button"
                className="button-primary flex-1"
                onClick={handleApplyScenario}
                whileTap={{ scale: 0.96 }}
              >
                <Check size={16} />
                <span>Adopt Scenario into Active Budget</span>
                <StarBorder />
              </motion.button>
              {(selectedScenarioId || customIncomeDelta !== 0) && (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setSelectedScenarioId(null)
                    setCustomIncomeDelta(0)
                  }}
                >
                  <RotateCcw size={16} /> Reset
                </button>
              )}
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* 2. ZAKAT & SADQA WEALTH ENGINE */}
      <section className="mb-8">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">SPIRITUAL & ETHICAL WEALTH</p>
            <h2 className="section-title">Zakat & Sadqa Wealth Calculator</h2>
          </div>
          <span className="section-note">2.5% eligible net wealth based on authentic Nisab standards</span>
        </div>

        <SpotlightCard className="zakat-card">
          <div className="zakat-standard-row mb-4">
            <span className="input-field-label">Nisab Standard:</span>
            <div className="flex gap-2">
              <button
                type="button"
                className={`preset-chip ${nisabStandard === 'silver' ? 'selected' : ''}`}
                onClick={() => setNisabStandard('silver')}
              >
                Silver (52.5 Tolas / 612g) - Recommended
              </button>
              <button
                type="button"
                className={`preset-chip ${nisabStandard === 'gold' ? 'selected' : ''}`}
                onClick={() => setNisabStandard('gold')}
              >
                Gold (7.5 Tolas / 87.5g)
              </button>
            </div>
          </div>

          <div className="zakat-inputs-grid mb-4">
            <label className="zakat-input-group">
              <span>Cash in Hand & Accounts</span>
              <input
                type="number"
                min="0"
                value={zakatAssets.cashInHand}
                onChange={(e) =>
                  setZakatAssets({ ...zakatAssets, cashInHand: Number(e.target.value) })
                }
              />
            </label>
            <label className="zakat-input-group">
              <span>Bank Savings & Deposits</span>
              <input
                type="number"
                min="0"
                value={zakatAssets.bankBalance}
                onChange={(e) =>
                  setZakatAssets({ ...zakatAssets, bankBalance: Number(e.target.value) })
                }
              />
            </label>
            <label className="zakat-input-group">
              <span>Gold & Silver Value</span>
              <input
                type="number"
                min="0"
                value={zakatAssets.goldValue}
                onChange={(e) =>
                  setZakatAssets({ ...zakatAssets, goldValue: Number(e.target.value) })
                }
              />
            </label>
            <label className="zakat-input-group">
              <span>Stocks & Investment Portfolios</span>
              <input
                type="number"
                min="0"
                value={zakatAssets.investmentPortfolio}
                onChange={(e) =>
                  setZakatAssets({ ...zakatAssets, investmentPortfolio: Number(e.target.value) })
                }
              />
            </label>
            <label className="zakat-input-group">
              <span>Business Goods & Merchandise</span>
              <input
                type="number"
                min="0"
                value={zakatAssets.businessMerchandise}
                onChange={(e) =>
                  setZakatAssets({ ...zakatAssets, businessMerchandise: Number(e.target.value) })
                }
              />
            </label>
            <label className="zakat-input-group">
              <span className="text-danger">Deductible Immediate Debts</span>
              <input
                type="number"
                min="0"
                value={zakatAssets.shortTermDebts}
                onChange={(e) =>
                  setZakatAssets({ ...zakatAssets, shortTermDebts: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <div className="zakat-summary-hud">
            <div>
              <span className="hud-mini-label">NET ELIGIBLE WEALTH</span>
              <strong className="text-xl">
                <CountUp value={zakatResult.netWealth} format={(v) => formatMoney(v, currency)} />
              </strong>
              <span className="text-xs text-muted block mt-0.5">
                Nisab threshold: {formatMoney(zakatResult.nisabThreshold, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="hud-mini-label">ZAKAT DUE (2.5%)</span>
              <strong className="text-2xl text-accent">
                <CountUp value={zakatResult.zakatDue} format={(v) => formatMoney(v, currency)} />
              </strong>
              <span className="text-xs text-success block mt-0.5">
                {zakatResult.nisabMet ? '✓ Nisab met' : 'Below Nisab (No Zakat due)'}
              </span>
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* 3. MONTHLY SNAPSHOTS & HISTORY */}
      <section className="mb-8">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">MEMORY & ARCHIVES</p>
            <h2 className="section-title">Monthly Budget Snapshots ({snapshots.length})</h2>
          </div>
          <button type="button" className="button-primary text-xs" onClick={handleSaveCurrentSnapshot}>
            <Calendar size={14} /> Save Current Month Snapshot
          </button>
        </div>

        <div className="snapshots-list">
          {snapshots.map((snap) => (
            <SpotlightCard key={snap.id} className="snapshot-card">
              <div className="snapshot-card-top">
                <div>
                  <h3 className="snapshot-title">{snap.monthLabel}</h3>
                  <span className="snapshot-date">
                    Archived on {new Date(snap.savedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="expense-del-btn"
                  onClick={() => {
                    removeSnapshot(snap.id)
                    onToast(`Removed snapshot: ${snap.monthLabel}`)
                  }}
                  title="Remove snapshot"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              <div className="snapshot-stats-row">
                <div>
                  <span className="hud-mini-label">Income</span>
                  <strong>{formatMoney(snap.income, snap.currency)}</strong>
                </div>
                <div>
                  <span className="hud-mini-label">Total Spent</span>
                  <span className="text-warning font-semibold">
                    {formatMoney(snap.totalSpent, snap.currency)}
                  </span>
                </div>
                <div>
                  <span className="hud-mini-label">Net Surplus</span>
                  <span className="text-success font-semibold">
                    {formatMoney(Math.max(0, snap.income - snap.totalSpent), snap.currency)}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 4. DATA CENTER, EXPORT & BACKUP */}
      <section className="mb-8">
        <div className="section-heading mb-3">
          <div>
            <p className="eyebrow">DATA PORTABILITY</p>
            <h2 className="section-title">Export & Backup Center</h2>
          </div>
          <span className="section-note">100% private, local-first storage. You own all your data.</span>
        </div>

        <SpotlightCard className="datacenter-card">
          <div className="export-buttons-grid">
            <button
              type="button"
              className="datacenter-btn highlight"
              onClick={onOpenShareCard}
            >
              <Share2 size={18} />
              <div>
                <strong>Share Branded Graphic Card</strong>
                <small>Export high-res visual card for social or saving</small>
              </div>
            </button>

            <button
              type="button"
              className="datacenter-btn"
              onClick={() => downloadCsv(categories, amounts, currency)}
            >
              <FileSpreadsheet size={18} />
              <div>
                <strong>Download CSV Spreadsheet</strong>
                <small>Open in Excel, Google Sheets, or Numbers</small>
              </div>
            </button>

            <button
              type="button"
              className="datacenter-btn"
              onClick={async () => {
                await copySummary(income, currency, categories, amounts)
                onToast('Budget summary copied to clipboard!')
              }}
            >
              <Copy size={18} />
              <div>
                <strong>Copy Plain Text Summary</strong>
                <small>Ready to paste in WhatsApp, Telegram, or Notes</small>
              </div>
            </button>

            <button
              type="button"
              className="datacenter-btn"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              <div>
                <strong>Print / Save as Clean PDF</strong>
                <small>Dedicated printer-friendly one-page document</small>
              </div>
            </button>

            <button
              type="button"
              className="datacenter-btn"
              onClick={handleExportJson}
            >
              <Download size={18} />
              <div>
                <strong>Download JSON Backup</strong>
                <small>Full snapshot of all categories, settings & goals</small>
              </div>
            </button>

            <label className="datacenter-btn cursor-pointer">
              <Upload size={18} />
              <div>
                <strong>Restore from JSON Backup</strong>
                <small>Restore settings and data from a previous file</small>
              </div>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJson}
              />
            </label>
          </div>
        </SpotlightCard>
      </section>
    </div>
  )
}
