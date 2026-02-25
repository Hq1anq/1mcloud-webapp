import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function CaptureViewer({ dataUrl, onClose }) {
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 250)
  }, [onClose])

  const handleDownload = useCallback(
    (e) => {
      e.stopPropagation()
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `proxyStatus.png`
      a.click()
    },
    [dataUrl]
  )

  return createPortal(
    <div
      className={`fixed inset-0 z-10000 flex cursor-pointer flex-col items-center justify-center bg-black/75 backdrop-blur-sm ${closing ? 'float-out' : 'float-in'}`}
      onClick={handleClose}
    >
      <img
        src={dataUrl}
        alt="Captured table"
        className="max-h-[80vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={handleDownload}
        className="bg-bg-getData mt-4 cursor-pointer rounded-lg px-5 py-2 text-base font-semibold hover:brightness-(--highlight-brightness)"
      >
        Download
      </button>
    </div>,
    document.body
  )
}
