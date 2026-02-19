import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Dialog({ isOpen, onClose, title, children, className = '' }) {
  const dialogRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setAnimating(true))
    } else if (visible) {
      // Trigger exit animation
      setAnimating(false)
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
      className={`fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 text-lg backdrop-blur-sm transition-opacity duration-200 ${
        animating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={`bg-dialog text-text-primary relative flex w-full max-w-md transform flex-col rounded-xl p-6 shadow-2xl transition-all duration-200 ${
          animating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        } ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4">
          <h1 className="font-bold">{title}</h1>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
