import { useState, useCallback } from 'react'

/**
 * Hook for safe clipboard copy with fallback dialog.
 *
 * Returns:
 *   safeCopy(text) — tries navigator.clipboard.writeText, opens dialog on failure
 *   copyDialogProps — spread onto <CopyDialog {...copyDialogProps} />
 */
export default function useSafeCopy() {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')

  const safeCopy = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      return true
    } catch {
      // Clipboard API failed — show fallback dialog
      setText(content)
      setIsOpen(true)
      return false
    }
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    safeCopy,
    copyDialogProps: { isOpen, onClose, text },
  }
}
