import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function FloatingThumbnail({
  dataUrl,
  rect,
  pad,
  isOverflowing,
  onClickThumbnail,
  onComplete,
}) {
  const [phase, setPhase] = useState('init') // init -> bouncing -> fading

  useEffect(() => {
    if (isOverflowing) {
      const t = setTimeout(() => setPhase('bouncing'), 100)
      return () => clearTimeout(t)
    } else {
      const raf = requestAnimationFrame(() => setPhase('bouncing'))
      return () => cancelAnimationFrame(raf)
    }
  }, [isOverflowing])

  useEffect(() => {
    if (phase !== 'bouncing') return
    const t = setTimeout(() => setPhase('fading'), 3000)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'fading') return
    const t = setTimeout(onComplete, 400)
    return () => clearTimeout(t)
  }, [phase, onComplete])

  // Target coords
  const targetWidth = isOverflowing ? Math.min(window.innerWidth - pad * 2, 300) : rect.width / 3
  const targetLeft = (window.innerWidth - targetWidth) / 2
  const targetTop = Math.max(window.innerHeight - rect.height / 3 - pad * 2, window.innerHeight / 3)

  const style = {
    position: 'fixed',
    top: phase === 'init' && !isOverflowing ? `${rect.top - pad}px` : `${targetTop}px`,
    left: phase === 'init' && !isOverflowing ? `${rect.left - pad}px` : `${targetLeft}px`,
    width: phase === 'init' && !isOverflowing ? `${rect.width}px` : `${targetWidth}px`,
    height: phase === 'init' && !isOverflowing ? `${rect.height}px` : 'auto',
    zIndex: 55,
    transition: phase === 'fading' ? 'opacity 0.35s ease-out' : 'all 0.5s ease-in-out',
    opacity: phase === 'fading' ? 0 : 0.85,
    pointerEvents: phase === 'bouncing' ? 'auto' : 'none',
    cursor: phase === 'bouncing' ? 'pointer' : 'default',
    animation: phase === 'bouncing' ? 'capture-bounce 1.2s ease-in-out infinite' : 'none',
  }

  return createPortal(
    <img
      src={dataUrl}
      alt="Thumbnail"
      style={style}
      onClick={() => {
        if (phase === 'bouncing') onClickThumbnail()
      }}
    />,
    document.body
  )
}
