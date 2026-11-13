import confetti from 'canvas-confetti'

export function triggerConfetti() {
  if (typeof window === 'undefined') return

  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#4F46E5', '#10B981', '#06B6D4', '#F59E0B', '#EC4899', '#8B5CF6'],
      ticks: 200,
    })
  } catch (err) {
    console.warn('Confetti error', err)
  }
}

export function triggerGoalCelebration() {
  if (typeof window === 'undefined') return

  try {
    const end = Date.now() + 1000
    const colors = ['#00FF9D', '#6366F1', '#38BDF8', '#F43F5E']

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  } catch (err) {
    console.warn('Confetti error', err)
  }
}
