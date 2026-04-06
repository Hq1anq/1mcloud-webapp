/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import ConfirmActionDialog from '../components/dialog/ConfirmActionDialog'

const ConfirmContext = createContext(null)

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({})
  const [resolver, setResolver] = useState(null)

  const confirmAction = useCallback((dialogConfig) => {
    return new Promise((resolve) => {
      setConfig(dialogConfig)
      setIsOpen(true)
      setResolver(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(
    (payload = true) => {
      setIsOpen(false)
      if (resolver) resolver(payload)
    },
    [resolver]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (resolver) resolver(false)
  }, [resolver])

  return (
    <ConfirmContext.Provider value={{ confirmAction }}>
      {children}
      <ConfirmActionDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={config.title}
        infoText={config.infoText}
        isRenew={config.isRenew}
        isRefund={config.isRefund}
        selectedRows={config.selectedRows || []}
      />
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}
