import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

export function AnimatedList({ children }: { children: ReactNode[] }) {
  const reduced = useReducedMotion()
  return (
    <div className="advice-list">
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: reduced ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : index * 0.06, duration: 0.32 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
