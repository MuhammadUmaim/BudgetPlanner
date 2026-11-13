import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toPng } from 'html-to-image'
import { X, Download, Share2, Sparkles } from 'lucide-react'
import type { BudgetCategory } from '../../lib/presets'
import { formatMoney, formatPercent, type Currency } from '../../lib/format'
import { StarBorder } from '../reactbits/StarBorder'

interface ShareCardModalProps {
  open: boolean
  onClose: () => void
  income: number
  currency: Currency
  categories: BudgetCategory[]
  amounts: Record<string, number>
  healthScore: number
}

export function ShareCardModal({
  open,
  onClose,
  income,
  currency,
  categories,
  amounts,
  healthScore,
}: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  if (!open) return null

  async function handleDownloadPng() {
    if (!cardRef.current) return
    try {
      setExporting(true)
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0A0D14',
      })
      const link = document.createElement('a')
      link.download = `clearmoney-budget-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Image export failed', err)
    } finally {
      setExporting(false)
    }
  }

  async function handleNativeShare() {
    if (!cardRef.current) return
    try {
      setExporting(true)
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0A0D14',
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'clearmoney-plan.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Monthly Financial Plan',
          text: `Here is my monthly financial plan on clearmoney: ${formatMoney(income, currency)} take-home.`,
          files: [file],
        })
      } else {
        handleDownloadPng()
      }
    } catch {
      handleDownloadPng()
    } finally {
      setExporting(false)
    }
  }

  const topCategories = [...categories]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6)

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="share-card-dialog"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          <div className="modal-heading">
            <div>
              <p className="eyebrow">SHARE & PRESERVE</p>
              <h2>Branded Budget Card</h2>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>

          <div className="share-preview-scroll">
            {/* The exportable graphic card container */}
            <div ref={cardRef} className="branded-export-card">
              <div className="card-top-row">
                <div className="card-brand">
                  <div className="card-logo-dot" />
                  <span className="card-brand-title">clear<strong>money</strong></span>
                </div>
                <div className="card-health-pill">
                  <Sparkles size={12} />
                  <span>Health Score: <strong>{healthScore}/100</strong></span>
                </div>
              </div>

              <div className="card-hero-row">
                <div>
                  <span className="card-hero-label">MONTHLY TAKE-HOME</span>
                  <h2 className="card-hero-income">{formatMoney(income, currency)}</h2>
                </div>
                <div className="card-date-stamp">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date())}
                </div>
              </div>

              <div className="card-categories-preview">
                {topCategories.map((cat) => (
                  <div key={cat.id} className="card-cat-row">
                    <div className="flex items-center gap-2">
                      <span className="card-cat-dot" style={{ backgroundColor: cat.color }} />
                      <span className="card-cat-name">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="card-cat-pct">{formatPercent(cat.percent)}</span>
                      <strong className="card-cat-amt">{formatMoney(amounts[cat.id] ?? 0, currency)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-footer-row">
                <span className="card-motto">Financial clarity, on your terms.</span>
                <span className="card-tagline">100% Balanced • clearmoney.app</span>
              </div>
            </div>
          </div>

          <div className="modal-actions mt-4 flex gap-3">
            <button
              type="button"
              className="button-primary flex-1"
              onClick={handleDownloadPng}
              disabled={exporting}
            >
              <Download size={16} />
              <span>{exporting ? 'Generating...' : 'Download PNG'}</span>
              <StarBorder />
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handleNativeShare}
              disabled={exporting}
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
