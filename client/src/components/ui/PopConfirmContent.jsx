import { useTranslation } from '../../i18n'

/**
 * PopConfirmContent — pure content for a confirmation popup.
 *
 * Props:
 *  title     — confirmation question text
 *  onConfirm — called when user clicks Yes
 *  onCancel  — called when user clicks No
 */
export default function PopConfirmContent({ title, onConfirm, onCancel }) {
  const t = useTranslation()

  return (
    <>
      <span className="text-sm leading-snug font-medium whitespace-nowrap">{title}</span>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="text-text-muted flex-1 rounded-lg bg-black/10 py-1.5 text-xs font-semibold transition-colors outline-none hover:bg-black/15"
        >
          {t('dialog.no')}
        </button>
        <button
          onClick={onConfirm}
          className="border-primary/30 bg-primary/20 text-primary hover:bg-primary/30 flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors outline-none"
        >
          {t('dialog.yes')}
        </button>
      </div>
    </>
  )
}
