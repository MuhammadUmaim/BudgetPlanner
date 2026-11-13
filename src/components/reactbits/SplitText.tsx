import { motion, useReducedMotion } from 'motion/react'

export function SplitText({ children }: { children: string }) {
  const reduced = useReducedMotion()
  return (
    <span aria-label={children} className="split-text">
      {children.split('').map((character, index) => (
        <motion.span
          key={`${character}-${index}`}
          aria-hidden="true"
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : index * 0.025, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {character === ' ' ? '\u00a0' : character}
        </motion.span>
      ))}
    </span>
  )
}
