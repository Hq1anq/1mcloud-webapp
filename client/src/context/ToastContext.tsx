import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import ToastContainer from '../components/ui/ToastContainer'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export interface ToastOptions {
  keepAlive?: boolean
  duration?: number
  [key: string]: unknown
}

export interface ToastItem extends ToastOptions {
  id: string
  message: ReactNode
  type: ToastType
}

export interface ToastContextValue {
  addToast: (message: ReactNode, type?: ToastType, options?: ToastOptions) => string
  updateToast: (id: string, message: ReactNode) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback(
    (message: ReactNode, type: ToastType = 'info', options: ToastOptions = {}) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)
      setToasts((prevToasts) => [...prevToasts, { id, message, type, ...options }])
      return id
    },
    []
  )

  const updateToast = useCallback((id: string, message: ReactNode) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) => (toast.id === id ? { ...toast, message } : toast))
    )
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, updateToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
