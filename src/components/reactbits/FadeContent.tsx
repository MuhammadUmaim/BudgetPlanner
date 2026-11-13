import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

export function FadeContent({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
