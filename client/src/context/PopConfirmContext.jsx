import { createContext, useContext, useState, useCallback } from 'react'
import PopConfirmPortal from '../components/ui/PopConfirmPortal'

const PopConfirmContext = createContext(null)

export function usePopConfirm() {
  const context = useContext(PopConfirmContext)
  if (!context) throw new Error('usePopConfirm must be used inside <PopConfirmProvider>')
  return context
}

// ─── Provider ─────────────────────────────────────────────────────────────
export function PopConfirmProvider({ children }) {
  // null means "no active popup — don't render"
  const [active, setActive] = useState(null)

  /**
   * show(anchorEl, { title, onConfirm, onCancel })
   *  anchorEl — the DOM element used to calculate positioning
   */
  const show = useCallback((anchorEl, config) => {
    const rect = anchorEl.getBoundingClientRect()
    const coords = {
      top: rect.top + rect.height / 2,
      left: rect.left - 12,
    }

    // Animate in: mount with isOpen:false so the scale-start renders first,
    // then flip to isOpen:true on the next paint via rAF.
    setActive({ isOpen: false, coords, config })

    requestAnimationFrame(() => {
      setActive((prev) => prev && { ...prev, isOpen: true })
    })
  }, [])

  const hide = useCallback(() => {
    setActive((prev) => prev && { ...prev, isOpen: false })

    // Wait for animation to finish before destroying the node
    setTimeout(() => {
      setActive(null)
    }, 400)
  }, [])

  return (
    <PopConfirmContext.Provider value={{ show }}>
      {children}

      {/* Singleton popup — only mounted when there is an active request */}
      {active && <PopConfirmPortal state={active} hide={hide} />}
    </PopConfirmContext.Provider>
  )
}
