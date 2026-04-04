import { useState, useCallback } from 'react'
import Dialog from '../ui/Dialog'
import { useTranslation } from '../../i18n'

// Copy icon (default state)
const CopyIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="size-7 fill-none"
  >
    <path
      strokeLinejoin="round"
      strokeWidth="2"
      className="text-text-muted stroke-current group-hover:brightness-(--highlight-brightness)"
      d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"
    />
  </svg>
)

// Checkmark icon (copied state)
const CopiedIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 11.917 9.724 16.5 19 7.5"
    />
  </svg>
)

// X icon (failed state)
const FailedIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
)

export default function CopyDialog({ isOpen, onClose, text }) {
  // 'idle' | 'copied' | 'failed'
  const [copyState, setCopyState] = useState('idle')
  const t = useTranslation()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 1000)
  }, [text])

  const handleClose = useCallback(() => {
    setCopyState('idle')
    onClose()
  }, [onClose])

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={t('dialog.copy')}>
      <button
        onClick={handleCopy}
        className={`group absolute top-6 right-6 inline-flex cursor-pointer items-center justify-center rounded-lg px-1 py-0.5 hover:brightness-(--highlight-brightness) ${
          copyState === 'copied'
            ? 'text-text-toast-success'
            : copyState === 'failed'
              ? 'text-text-toast-error'
              : 'text-text-muted'
        }`}
      >
        {copyState === 'copied' ? (
          <CopiedIcon />
        ) : copyState === 'failed' ? (
          <FailedIcon />
        ) : (
          <CopyIcon />
        )}
        {copyState === 'copied'
          ? t('dialog.copied')
          : copyState === 'failed'
            ? t('dialog.failed')
            : t('dialog.copy')}
      </button>
      <textarea
        readOnly
        value={text}
        className="min-h-48 min-w-xs whitespace-nowrap sm:min-w-lg"
        onClick={(e) => e.target.select()}
      />
      <button
        onClick={handleClose}
        className="bg-red mt-3 self-end rounded-lg px-4 py-2 font-medium hover:brightness-(--highlight-brightness)"
      >
        {t('dialog.close')}
      </button>
    </Dialog>
  )
}
