import { useEffect } from 'react'
import { Command } from 'cmdk'
import {
  PieChart,
  Sparkles,
  Receipt,
  Target,
  Wrench,
  PlusCircle,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Printer,
  Share2,
  RefreshCw,
  Coins,
  Globe,
  Users,
} from 'lucide-react'
import type { TabId } from './BottomNav'
import { currencies, type Currency } from '../../lib/format'
import { profiles, type ProfileId } from '../../lib/presets'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onSelectTab: (tab: TabId) => void
  onOpenAddExpense: () => void
  onOpenAddCategory: () => void
  onNormalize: () => void
  onReset: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  lang: 'en' | 'ur'
  onToggleLang: () => void
  onSetCurrency: (curr: Currency) => void
  onSetProfile: (p: ProfileId) => void
  onOpenShareCard: () => void
  onDownloadCsv: () => void
}

export function CommandPalette({
  open,
  onClose,
  onSelectTab,
  onOpenAddExpense,
  onOpenAddCategory,
  onNormalize,
  onReset,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  lang,
  onToggleLang,
  onSetCurrency,
  onSetProfile,
  onOpenShareCard,
  onDownloadCsv,
}: CommandPaletteProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) {
          onClose()
        } else {
          // Open triggered by parent state
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function runAction(action: () => void) {
    action()
    onClose()
  }

  return (
    <div className="cmdk-backdrop" onClick={onClose}>
      <div
        className="cmdk-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <Command label="Global Command Palette">
          <div className="cmdk-input-wrap">
            <span className="cmdk-search-icon">⚡</span>
            <Command.Input
              placeholder="Search commands, navigate tabs, change currency... (ESC to exit)"
              autoFocus
            />
            <kbd className="cmdk-kbd">ESC</kbd>
          </div>

          <Command.List className="cmdk-list">
            <Command.Empty className="cmdk-empty">No commands matching your search.</Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => runAction(() => onSelectTab('plan'))} className="cmdk-item">
                <PieChart size={16} />
                <span>Go to Budget Plan</span>
                <span className="cmdk-badge">Tab 1</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(() => onSelectTab('insights'))} className="cmdk-item">
                <Sparkles size={16} />
                <span>Go to Insights & Health</span>
                <span className="cmdk-badge">Tab 2</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(() => onSelectTab('track'))} className="cmdk-item">
                <Receipt size={16} />
                <span>Go to Expense Tracker & Safe-to-Spend</span>
                <span className="cmdk-badge">Tab 3</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(() => onSelectTab('goals'))} className="cmdk-item">
                <Target size={16} />
                <span>Go to Goals & Wealth Projections</span>
                <span className="cmdk-badge">Tab 4</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(() => onSelectTab('tools'))} className="cmdk-item">
                <Wrench size={16} />
                <span>Go to Tools & Zakat Engine</span>
                <span className="cmdk-badge">Tab 5</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick Actions">
              <Command.Item onSelect={() => runAction(onOpenAddExpense)} className="cmdk-item">
                <PlusCircle size={16} />
                <span>Log New Expense</span>
                <span className="cmdk-badge">Quick Add</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onOpenAddCategory)} className="cmdk-item">
                <PlusCircle size={16} />
                <span>Add Custom Budget Category</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onNormalize)} className="cmdk-item">
                <RefreshCw size={16} />
                <span>Normalize Allocations to 100%</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onOpenShareCard)} className="cmdk-item">
                <Share2 size={16} />
                <span>Create Branded Share Card</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onDownloadCsv)} className="cmdk-item">
                <FileSpreadsheet size={16} />
                <span>Download Budget CSV Spreadsheet</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(() => window.print())} className="cmdk-item">
                <Printer size={16} />
                <span>Print or Save PDF Report</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Preferences & Atmosphere">
              <Command.Item onSelect={() => runAction(onToggleTheme)} className="cmdk-item">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Cyber Dark Mode'}</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onToggleSound)} className="cmdk-item">
                {soundEnabled ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{soundEnabled ? 'Mute Interface Audio' : 'Enable Cyber UI Sounds'}</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onToggleLang)} className="cmdk-item">
                <Globe size={16} />
                <span>Language: Switch to {lang === 'en' ? 'اردو (Urdu RTL)' : 'English'}</span>
              </Command.Item>
              <Command.Item onSelect={() => runAction(onReset)} className="cmdk-item text-danger">
                <RefreshCw size={16} />
                <span>Reset Budget to Default Preset</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Select Currency">
              {currencies.map((curr) => (
                <Command.Item
                  key={curr}
                  onSelect={() => runAction(() => onSetCurrency(curr))}
                  className="cmdk-item"
                >
                  <Coins size={16} />
                  <span>Currency: {curr}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Switch Household Profile">
              {profiles.map((prof) => (
                <Command.Item
                  key={prof.id}
                  onSelect={() => runAction(() => onSetProfile(prof.id as ProfileId))}
                  className="cmdk-item"
                >
                  <Users size={16} />
                  <span>Profile: {prof.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
