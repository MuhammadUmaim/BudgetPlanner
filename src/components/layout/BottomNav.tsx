import { motion } from 'motion/react'
import {
  PieChart as PieIcon,
  Sparkles,
  Receipt,
  Target,
  Wrench,
} from 'lucide-react'
import { playSound } from '../../lib/sound'
import { vibrate } from '../../lib/haptics'

export type TabId = 'plan' | 'insights' | 'track' | 'goals' | 'tools'

interface BottomNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  soundEnabled: boolean
  hapticsEnabled: boolean
}

const navItems: { id: TabId; label: string; icon: typeof PieIcon; badge?: string }[] = [
  { id: 'plan', label: 'Plan', icon: PieIcon },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'track', label: 'Track', icon: Receipt },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'tools', label: 'Tools', icon: Wrench },
]

export function BottomNav({ activeTab, onSelectTab, soundEnabled, hapticsEnabled }: BottomNavProps) {
  function handleSelect(tab: TabId) {
    if (soundEnabled) playSound('snap')
    if (hapticsEnabled) vibrate('tick')
    onSelectTab(tab)
  }

  return (
    <nav className="mobile-dock" aria-label="Main Navigation">
      <div className="mobile-dock-inner">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={`dock-tab ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSelect(item.id)}
              aria-selected={isActive}
              role="tab"
            >
              {isActive && (
                <motion.div
                  layoutId="active-dock-pill"
                  className="dock-active-glow"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
              <span className="dock-icon-wrap">
                <Icon className="dock-icon" size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span className="dock-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
