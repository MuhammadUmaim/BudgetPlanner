'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './MorphSlider.css';

export interface MorphSliderProps {
  images?: string[]
  texts?: string[]
  children?: ReactNode
  autoplay?: boolean
  autoplaySpeed?: number
  easing?: string
  width?: string
  height?: string
  className?: string
  style?: CSSProperties
  showIndicators?: boolean
}

export const MorphSlider = ({
  images = [],
  texts = [],
  children,
  autoplay = true,
  autoplaySpeed = 5000,
  width = '100%',
  height = '400px',
  className = '',
  style,
  showIndicators = true,
}: MorphSliderProps) => {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoplay || images.length <= 1) return undefined
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), autoplaySpeed)
    return () => window.clearInterval(timer)
  }, [autoplay, autoplaySpeed, images.length])

  const caption = texts[index] ?? ''

  return (
    <div
      ref={containerRef}
      className={`morph-slider ${className}`.trim()}
      style={{ width, height, ...style } as CSSProperties}
      role="region"
      aria-label="Image slider"
    >
      <div className="morph-slider__stage">
        {children ? (
          children
        ) : (
          <>
            {images.map((src, i) => (
              <img
                key={src + i}
                className={`morph-slider__slide ${i === index ? 'is-active' : ''}`}
                src={src}
                alt={caption || `Slide ${i + 1}`}
                style={{ position: i === index ? 'relative' : 'absolute', inset: 0, opacity: i === index ? 1 : 0 }}
              />
            ))}
          </>
        )}
      </div>
      {caption && <div className="morph-slider__caption">{caption}</div>}
      {showIndicators && images.length > 1 && (
        <div className="morph-slider-indicators" role="tablist" aria-label="Slides">
          {images.map((_item, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`morph-slider-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MorphSlider;