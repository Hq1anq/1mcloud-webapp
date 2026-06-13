import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Dialog({ isOpen, onClose, title, children, className = '' }) {
  const [visible, setVisible] = useState(isOpen)
  const [animating, setAnimating] = useState(false)

  // Derive state during render to avoid synchronous setState in useEffect
  if (isOpen && !visible) {
    setVisible(true)
  }
  if (!isOpen && animating) {
    setAnimating(false)
  }

  useEffect(() => {
    if (isOpen) {
      // Trigger enter animation on next frame
      const frameId = requestAnimationFrame(() => setAnimating(true))
      return () => cancelAnimationFrame(frameId)
    } else {
      // Wait for exit animation to finish before unmounting
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!visible) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 text-lg backdrop-blur-sm transition-opacity ${
        animating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`bg-dialog relative flex max-h-[90vh] w-fit max-w-[95vw] flex-col rounded-xl p-6 shadow-2xl transition-all ${
          animating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        } ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {title && <h1 className="mb-4 font-bold">{title}</h1>}
        {children}
      </div>
    </div>,
    document.body
  )
}
