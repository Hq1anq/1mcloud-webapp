import { createContext, useContext, useState, useCallback } from 'react'
import AnchorPopup from '../components/ui/AnchorPopup'
import PopConfirmContent from '../components/ui/PopConfirmContent'

const PopConfirmContext = createContext(null)

/**
 * usePopConfirm — hook for showing a Yes/No confirmation popup.
 *
 * API:
 *   const { show, hide } = usePopConfirm()
 *   show(anchorEl, { title, onConfirm, onCancel? })
 */
export function usePopConfirm() {
  const ctx = useContext(PopConfirmContext)
  if (!ctx) throw new Error('usePopConfirm must be used inside <PopConfirmProvider>')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PopConfirmProvider({ children }) {
  // null = no active confirm — don't render the portal
  const [active, setActive] = useState(null)

  const show = useCallback((anchorEl, config) => {
    const rect = anchorEl.getBoundingClientRect()
    const coords = {
      top: rect.top + rect.height / 2,
      left: rect.left - 12,
    }

    setActive({ isOpen: false, coords, config })

    requestAnimationFrame(() => {
      setActive((prev) => prev && { ...prev, isOpen: true })
    })
  }, [])

  const hide = useCallback(() => {
    setActive((prev) => prev && { ...prev, isOpen: false })
    setTimeout(() => setActive(null), 400)
  }, [])

  return (
    <PopConfirmContext.Provider value={{ show, hide }}>
      {children}

      {/* Singleton confirm popup — independent of the menu popup */}
      {active && (
        <AnchorPopup
          isOpen={active.isOpen}
          coords={active.coords}
          onClose={hide}
          bgClassName="bg-surface-secondary"
          cardClassName="p-4 gap-4"
        >
          <PopConfirmContent
            title={active.config.title}
            onConfirm={() => {
              hide()
              active.config.onConfirm?.()
            }}
            onCancel={() => {
              hide()
              active.config.onCancel?.()
            }}
          />
        </AnchorPopup>
      )}
    </PopConfirmContext.Provider>
  )
}
