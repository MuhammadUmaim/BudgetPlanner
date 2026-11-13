export type HapticPattern = 'tick' | 'snap' | 'success' | 'error' | 'press'

let supported: boolean | null = null

function detect(): boolean {
  if (supported !== null) return supported
  if (typeof window === 'undefined') {
    supported = false
    return false
  }
  supported = 'navigator' in window && typeof (window as unknown as { navigator?: { vibrate?: (duration: number | number[]) => boolean } }).navigator?.vibrate === 'function'
  return supported
}

export function isHapticsSupported(): boolean {
  return detect()
}

export function vibrate(pattern: HapticPattern | number | number[]): boolean {
  if (!detect()) return false
  const map: Record<HapticPattern, number | number[]> = {
    tick: 10,
    snap: 20,
    success: [18, 40, 24],
    error: [30, 60, 30],
    press: 8,
  }
  const value = typeof pattern === 'string' ? map[pattern] : pattern
  try {
    return (window as unknown as { navigator: { vibrate: (v: number | number[]) => boolean } }).navigator.vibrate(value)
  } catch {
    return false
  }
}