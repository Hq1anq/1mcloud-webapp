import { useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { useToast } from '../context/ToastContext'
import CaptureViewer from '../components/dialog/CaptureViewer'
import FloatingThumbnail from '../components/ui/FloatingThumbnail'

export default function useCapture(targetRef) {
  const PAD = 16
  const { addToast } = useToast()
  const [viewer, setViewer] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)

  const handleCapture = useCallback(async () => {
    const el = targetRef.current
    if (!el) return

    try {
      const flash = document.createElement('div')
      flash.className = 'flash'
      document.body.appendChild(flash)
      setTimeout(() => flash.remove(), 500)

      const scrollContainer = el.querySelector('.scroll-container')
      const isOverflowing =
        scrollContainer && scrollContainer.scrollWidth > scrollContainer.clientWidth

      let captureTarget = el
      let clone = null

      if (isOverflowing) {
        clone = el.cloneNode(true)
        const cloneScroll = clone.querySelector('.scroll-container')
        if (cloneScroll) {
          cloneScroll.style.overflow = 'visible'
          cloneScroll.style.width = `${scrollContainer.scrollWidth}px`
        }
        Object.assign(clone.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: `${scrollContainer.scrollWidth}px`,
          zIndex: '-1',
          pointerEvents: 'none',
        })
        document.body.appendChild(clone)
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        captureTarget = clone
      }

      const rawDataUrl = await toPng(captureTarget, {
        cacheBust: true,
        filter: (node) => !node?.hasAttribute?.('data-capture-ignore'),
      })
      if (clone) clone.remove()

      const bodyBg = getComputedStyle(document.body).backgroundColor
      const capturedImg = new Image()
      capturedImg.src = rawDataUrl
      await new Promise((r) => (capturedImg.onload = r))

      const canvas = document.createElement('canvas')
      canvas.width = capturedImg.width + PAD * 2
      canvas.height = capturedImg.height + PAD * 2
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = bodyBg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(capturedImg, PAD, PAD)
      const dataUrl = canvas.toDataURL('image/png')

      const res = await fetch(dataUrl)
      const blob = await res.blob()

      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        addToast('Table captured to clipboard', 'success')
      } catch {
        addToast('Captured! Click thumbnail to view & download', 'info')
      }

      const rect = el.getBoundingClientRect()
      // Use timestamp as ID to ensure fresh component on every capture
      setThumbnail({
        id: Date.now(),
        dataUrl,
        rect,
        pad: PAD,
        isOverflowing,
      })
    } catch (err) {
      console.error('Capture failed:', err)
      addToast('Capture failed', 'error')
    }
  }, [targetRef, addToast])

  const captureUI = (
    <>
      {thumbnail && (
        <FloatingThumbnail
          key={thumbnail.id}
          {...thumbnail}
          onComplete={() => setThumbnail(null)}
          onClickThumbnail={() => {
            setViewer({
              dataUrl: thumbnail.dataUrl,
            })
            setThumbnail(null)
          }}
        />
      )}
      {viewer && <CaptureViewer {...viewer} onClose={() => setViewer(null)} />}
    </>
  )

  return { handleCapture, captureUI }
}
