import { useRef } from 'react'
import { useTranslation } from '../../i18n'
import { usePopConfirm } from '../../context/PopConfirmContext'
import ToggleButton from './ToggleButton'

// --- POP CONFIRM TOGGLE ---
// Renders only ToggleButton; opens the singleton PopConfirm from context on click.
export default function PopConfirmToggle({ isOn, onConfirm }) {
  const { show } = usePopConfirm()
  const buttonRef = useRef(null)
  const t = useTranslation()

  const handleClick = () => {
    if (!buttonRef.current) return

    const pendingState = !isOn

    show(buttonRef.current, {
      title: pendingState ? t('popConfirm.autoRenewOn') : t('popConfirm.autoRenewOff'),
      onConfirm: () => {
        if (onConfirm) {
          onConfirm(pendingState).catch((error) => {
            console.error('Auto-renew failed:', error)
            // Re-show the confirm on failure (rollback feedback)
            show(buttonRef.current, {
              title: pendingState ? t('popConfirm.autoRenewOn') : t('popConfirm.autoRenewOff'),
              onConfirm: () => onConfirm(pendingState),
            })
          })
        }
      },
    })
  }

  return (
    <div ref={buttonRef} className="inline-flex items-center justify-center">
      <ToggleButton isOn={isOn} onClick={handleClick} />
    </div>
  )
}
