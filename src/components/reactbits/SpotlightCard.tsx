import type { CSSProperties, ReactNode, PointerEvent } from 'react'

export function SpotlightCard({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  function moveSpotlight(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
  }
  return (
    <div
      className={`spotlight-card ${className}`}
      onPointerMove={moveSpotlight}
      style={{ '--spot-x': '50%', '--spot-y': '50%', ...style } as CSSProperties}
    >
      {children}
    </div>
  )
}
