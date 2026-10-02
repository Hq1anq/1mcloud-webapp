import { useRef, useState } from 'react'
import { useTranslation } from '../../i18n'
import { usePopConfirm } from '../../context/PopConfirmContext'
import ToggleButton from './ToggleButton'

export interface RenewToggleProps {
  isOn: boolean
  onConfirm?: (newState: boolean) => Promise<void> | void
}

export default function RenewToggle({ isOn, onConfirm }: RenewToggleProps) {
  const { show } = usePopConfirm()
  const buttonRef = useRef<HTMLDivElement>(null)
  const t = useTranslation()
  const [isPending, setIsPending] = useState(false)

  const handleClick = () => {
    if (!buttonRef.current || isPending) return

    const pendingState = !isOn

    show(buttonRef.current, {
      title: pendingState ? t('popConfirm.autoRenewOn') : t('popConfirm.autoRenewOff'),
      onConfirm: async () => {
        if (!onConfirm) return
        setIsPending(true)
        try {
          await onConfirm(pendingState)
        } catch (error) {
          console.error('Auto-renew failed:', error)
        } finally {
          setIsPending(false)
        }
      },
    })
  }

  return (
    <div ref={buttonRef} className="inline-flex items-center justify-center">
      <ToggleButton isOn={isOn} onClick={handleClick} disabled={isPending} />
    </div>
  )
}
