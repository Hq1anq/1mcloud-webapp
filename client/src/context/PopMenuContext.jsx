import { createContext, useContext, useState, useCallback } from 'react'
import AnchorPopup from '../components/ui/AnchorPopup'
import ControlMenuContent from '../components/ui/ControlMenuContent'

const PopMenuContext = createContext(null)

/**
 * usePopMenu — hook for showing the VPS action menu popup.
 *
 * API:
 *   const { show, hide } = usePopMenu()
 *   show(anchorEl, { actions })
 */
export function usePopMenu() {
  const context = useContext(PopMenuContext)
  if (!context) throw new Error('usePopMenu must be used inside <PopMenuProvider>')
  return context
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PopMenuProvider({ children }) {
  // null = no active menu — don't render the portal
  const [active, setActive] = useState(null)

  /**
   * show(anchorEl, { actions })
   *  anchorEl — DOM element used to compute card position
   *  actions  — array of action descriptors passed to ControlMenuContent
   */
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
    <PopMenuContext.Provider value={{ show, hide }}>
      {children}

      {/* Singleton menu popup */}
      {active && (
        <AnchorPopup
          isOpen={active.isOpen}
          coords={active.coords}
          onClose={hide}
          bgClassName="bg-terminal"
          cardClassName="p-3 gap-1"
        >
          <ControlMenuContent actions={active.config.actions} onClose={hide} />
        </AnchorPopup>
      )}
    </PopMenuContext.Provider>
  )
}
