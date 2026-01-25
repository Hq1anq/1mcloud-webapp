import { useState } from 'react'
import Toast from './Toast'

const ToastContainer = ({ toasts, removeToast }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="fixed top-4 right-4 z-50 w-full max-w-xs"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {toasts.map((toast, index) => {
        const style = isHovered
          ? {
            position: 'absolute',
            zIndex: index, // Higher index = on top
            top: index * 66,
          }
          : {
            position: 'absolute',
            zIndex: index, // Higher index = on top
            top: index * 5,
            left: index * -5,
          }

        return <Toast key={toast.id} {...toast} removeToast={removeToast} style={style} />
      })}
    </div>
  )
}

export default ToastContainer
