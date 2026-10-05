import React, { createContext, useContext, useState, useCallback } from 'react'
import AnchorPopup from '../components/ui/AnchorPopup'
import PopConfirmContent from '../components/ui/PopConfirmContent'

export interface PopConfirmConfig {
  title: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  direction?: [number, number]
  align?: 'center' | 'left' | 'start' | 'right' | 'end' | 'top' | 'bottom' | 'down'
}

export interface PopConfirmContextType {
  show: (anchorEl: HTMLElement, config: PopConfirmConfig) => void
  hide: () => void
}

interface ActiveConfirmState {
  isOpen: boolean
  anchorRect: {
    top: number
    left: number
    width: number
    height: number
  }
  config: PopConfirmConfig
}

const PopConfirmContext = createContext<PopConfirmContextType | null>(null)

/**
 * usePopConfirm — hook for showing a Yes/No confirmation popup.
 */
export function usePopConfirm(): PopConfirmContextType {
  const context = useContext(PopConfirmContext)
  if (!context) throw new Error('usePopConfirm must be used inside <PopConfirmProvider>')
  return context
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PopConfirmProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActiveConfirmState | null>(null)

  const show = useCallback((anchorEl: HTMLElement, config: PopConfirmConfig) => {
    const rect = anchorEl.getBoundingClientRect()
    const anchorRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }

    setActive({ isOpen: false, anchorRect, config })

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
          anchorRect={active.anchorRect}
          direction={active.config.direction}
          align={active.config.align}
          zIndex={12}
          onClose={hide}
          bgClassName="bg-terminal"
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
