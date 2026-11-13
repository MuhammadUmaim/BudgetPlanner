export type SoundType = 'tick' | 'snap' | 'toggle' | 'success' | 'alert'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  return audioCtx
}

export function playSound(type: SoundType, enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const now = ctx.currentTime

  switch (type) {
    case 'tick': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.03)
      gain.gain.setValueAtTime(0.015, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.04)
      break
    }
    case 'snap': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.04)
      gain.gain.setValueAtTime(0.025, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.06)
      break
    }
    case 'toggle': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.06)
      gain.gain.setValueAtTime(0.02, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.09)
      break
    }
    case 'success': {
      // Futuristic ascending chime: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((freq, index) => {
        const noteTime = now + index * 0.065
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, noteTime)
        gain.gain.setValueAtTime(0.03, noteTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteTime)
        osc.stop(noteTime + 0.23)
      })
      break
    }
    case 'alert': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320, now)
      gain.gain.setValueAtTime(0.02, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.13)
      break
    }
  }
}
