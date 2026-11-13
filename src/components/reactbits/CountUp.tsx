import { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

export function CountUp({ value, format }: { value: number; format: (value: number) => string }) {
  const reduced = useReducedMotion()
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, { stiffness: 150, damping: 26, mass: 0.45 })
  const text = useTransform(spring, format)

  useEffect(() => {
    if (reduced) {
      motionValue.jump(value)
    } else {
      motionValue.set(value)
    }
  }, [motionValue, reduced, value])

  return <motion.span>{text}</motion.span>
}
