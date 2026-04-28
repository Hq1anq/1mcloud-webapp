import { useState } from 'react'
import { useTranslation } from '../../i18n'

// --- TOGGLE COMPONENT: Elastic Stretch ---
const ToggleElastic = ({ isOn, onToggle, t }) => (
  <button
    onClick={onToggle}
    className="group relative h-9 w-[72px] shrink-0 overflow-hidden rounded-full bg-black/40 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-transform outline-none active:scale-95"
  >
    <div
      className={`absolute inset-0 transition-colors duration-500 ${isOn ? 'bg-oncheck/20' : 'bg-white/20'}`}
    />
    <div className="absolute inset-0 z-0 flex items-center justify-between px-2.5 text-[0.6rem] uppercase">
      <span
        className={`font-bold tracking-wide transition-all duration-500 ${
          isOn
            ? 'text-oncheck translate-x-0 opacity-100'
            : '-translate-x-4 text-transparent opacity-0'
        }`}
      >
        {t('popConfirm.on')}
      </span>
      <span
        className={`font-bold tracking-wide transition-all duration-500 ${
          !isOn
            ? 'text-text-muted translate-x-0 opacity-100'
            : 'translate-x-4 text-transparent opacity-0'
        }`}
      >
        {t('popConfirm.off')}
      </span>
    </div>

    <div
      className={`elastic-out absolute top-1 left-1 z-10 size-7 rounded-full bg-white shadow-md transition-all duration-400 group-active:w-10 ${
        isOn ? 'bg-oncheck translate-x-[36px] group-active:translate-x-[24px]' : 'translate-x-0'
      }`}
    />
  </button>
)

// --- POP CONFIRM WRAPPER ---
export default function PopConfirmToggle({ initialIsOn, onConfirm }) {
  const [isOn, setIsOn] = useState(initialIsOn)
  const [isOpen, setIsOpen] = useState(false)
  const [pendingState, setPendingState] = useState(isOn)
  const t = useTranslation()

  const handleToggleClick = () => {
    setPendingState(!isOn)
    setIsOpen(true)
  }

  const handleYes = async () => {
    try {
      if (onConfirm) await onConfirm(pendingState)
      setIsOn(pendingState)
    } catch (error) {
      console.error('Failed to toggle auto renew:', error)
    } finally {
      setIsOpen(false)
    }
  }

  const handleNo = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* The Pop Confirm Modal */}
      <div
        className={`pop-spring border-border bg-surface-secondary absolute top-1/2 right-full z-50 mr-3 flex w-64 origin-right -translate-y-1/2 flex-col gap-4 rounded-xl border p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-400 ${
          isOpen
            ? 'translate-x-0 scale-100 opacity-100'
            : 'pointer-events-none translate-x-6 scale-[0.3] opacity-0'
        }`}
      >
        <div className="border-border bg-surface-secondary absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rotate-45 rounded-sm border-t border-r" />

        {pendingState ? t('popConfirm.autoRenewOn') : t('popConfirm.autoRenewOff')}

        <div className="flex gap-2">
          <button
            onClick={handleNo}
            className="text-text-muted flex-1 rounded-lg bg-black/10 py-1.5 text-xs font-semibold transition-colors outline-none hover:bg-black/15"
          >
            {t('dialog.no')}
          </button>
          <button
            onClick={handleYes}
            className="border-primary/30 bg-primary/20 text-primary hover:bg-primary/30 flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors outline-none"
          >
            {t('dialog.yes')}
          </button>
        </div>
      </div>

      {/* The Toggle Button itself */}
      <ToggleElastic isOn={isOn} onToggle={handleToggleClick} t={t} />
    </div>
  )
}
