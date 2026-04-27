import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../../i18n'

export default function PopConfirmPortal({ state, hide }) {
  const t = useTranslation()
  const { isOpen, coords, config } = state
  const title = config?.title

  // Handle actions internally
  const handleConfirm = useCallback(() => {
    hide()
    config?.onConfirm?.()
  }, [hide, config])

  const handleCancel = useCallback(() => {
    hide()
    config?.onCancel?.()
  }, [hide, config])

  return createPortal(
    <>
      {/* Invisible Backdrop to block scroll and catch outside clicks */}
      <div className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={handleCancel} />

      {/* Pop Confirm Modal */}
      <div
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        className={`pop-spring border-border bg-surface-secondary fixed z-50 flex w-64 origin-right -translate-x-full -translate-y-1/2 flex-col gap-4 rounded-xl border p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-400 ${
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.3] opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caret arrow pointing right toward the anchor */}
        <div className="border-border bg-surface-secondary absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rotate-45 rounded-sm border-t border-r" />

        <span className="text-sm leading-snug font-medium">{title}</span>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="text-text-muted flex-1 rounded-lg bg-black/10 py-1.5 text-xs font-semibold transition-colors outline-none hover:bg-black/15"
          >
            {t('dialog.no')}
          </button>
          <button
            onClick={handleConfirm}
            className="border-primary/30 bg-primary/20 text-primary hover:bg-primary/30 flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors outline-none"
          >
            {t('dialog.yes')}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
