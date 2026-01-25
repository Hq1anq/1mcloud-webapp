import { useEffect, useState } from 'react'

const statusStyles = {
  success: {
    icon: (
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" />
      </svg>
    ),
    bg: 'bg-bg-success text-text-success',
  },
  error: {
    icon: (
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" />
      </svg>
    ),
    bg: 'bg-bg-error text-text-error',
  },
  warning: {
    icon: (
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z" />
      </svg>
    ),
    bg: 'bg-bg-warning text-text-warning',
  },
  info: {
    icon: (
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z" />
      </svg>
    ),
    bg: 'bg-bg-info text-text-info',
  },
  loading: {
    icon: (
      <svg className="h-8 w-8 animate-spin fill-none" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          className="text-border"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="90"
          strokeDashoffset="60"
        ></circle>
      </svg>
    ),
    bg: 'text-text-toast',
  },
}

const Toast = ({ id, message, type, removeToast, style }) => {
  const [isExiting, setIsExiting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const { icon, bg } = statusStyles[type] || statusStyles.info

  useEffect(() => {
    if (type === 'loading') return // Loading toasts don't auto-dismiss

    let timer
    if (!isPaused) {
      timer = setTimeout(() => {
        setIsExiting(true)
        // Wait for animation to finish before removing
        setTimeout(() => removeToast(id), 300)
      }, 3000)
    }

    return () => clearTimeout(timer)
  }, [type, removeToast, id, isPaused])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(id), 300)
  }

  return (
    <div
      className={`group bg-toast text-text-toast border-border flex w-full max-w-xs cursor-pointer items-center rounded-lg border p-4 shadow-sm transition-all duration-300 ${
        isExiting ? 'float-out' : 'float-in'
      }`}
      style={style}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleDismiss}
    >
      <div id="toast-content" className="flex w-full items-center">
        <div className={`${bg} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg`}>
          {icon}
        </div>
        <div
          id="toast-message"
          className="mx-3 flex-1 text-sm font-bold"
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <button
          type="button"
          className="bg-toast -mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 group-hover:brightness-125"
          onClick={(e) => {
            e.stopPropagation() // Prevent triggering parent click
            handleDismiss()
          }}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 14 14">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toast
