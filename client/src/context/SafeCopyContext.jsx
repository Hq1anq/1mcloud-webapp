/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import CopyDialog from '../components/dialog/CopyDialog'

const SafeCopyContext = createContext(null)

export const SafeCopyProvider = ({ children }) => {
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

  return (
    <SafeCopyContext.Provider value={{ safeCopy }}>
      {children}
      <CopyDialog isOpen={isOpen} onClose={onClose} text={text} />
    </SafeCopyContext.Provider>
  )
}

export const useSafeCopy = () => {
  const context = useContext(SafeCopyContext)
  if (!context) {
    throw new Error('useSafeCopy must be used within a SafeCopyProvider')
  }
  return context
}
