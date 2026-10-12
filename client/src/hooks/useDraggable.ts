import { useState, useRef, useEffect, useCallback } from 'react'

export interface Position {
  x: number
  y: number
}

export interface UseDraggableOptions {
  margin?: number
}

export interface UseDraggableReturn {
  position: Position | null
  isDragging: boolean
  elementRef: React.RefObject<HTMLElement | null>
  handlePointerDown: (e: React.PointerEvent<HTMLElement>) => void
  handlePointerMove: (e: React.PointerEvent<HTMLElement>) => void
  handlePointerUp: (e: React.PointerEvent<HTMLElement>) => void
  handlePointerCancel: () => void
  handleDoubleClick: (e: React.MouseEvent<HTMLElement>) => void
  resetPosition: () => void
}

export default function useDraggable({
  margin = 8,
}: UseDraggableOptions = {}): UseDraggableReturn {
  const [position, setPosition] = useState<Position | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  const dragOffsetRef = useRef<{
    offsetX: number
    offsetY: number
    width: number
    height: number
  } | null>(null)

  const hasMovedRef = useRef(false)
  const initialPosRef = useRef<Position | null>(null)

  // Clamp position within viewport boundaries
  const clampPosition = useCallback(
    (pos: Position, width: number, height: number): Position => {
      const maxX = Math.max(margin, window.innerWidth - width - margin)
      const maxY = Math.max(margin, window.innerHeight - height - margin)
      return {
        x: Math.min(Math.max(margin, pos.x), maxX),
        y: Math.min(Math.max(margin, pos.y), maxY),
      }
    },
    [margin]
  )

  // Keep element within viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev || !elementRef.current) return prev
        const rect = elementRef.current.getBoundingClientRect()
        const clamped = clampPosition(prev, rect.width, rect.height)
        return clamped.x !== prev.x || clamped.y !== prev.y ? clamped : prev
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [clampPosition])

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return

    const target = e.target as HTMLElement | null
    if (target?.closest('button, a, input, select, textarea, [data-drag-ignore]')) {
      return
    }

    const element = elementRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture fails
    }

    initialPosRef.current = position
    hasMovedRef.current = false

    dragOffsetRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    }

    setPosition({ x: rect.left, y: rect.top })
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragOffsetRef.current) return

    const { offsetX, offsetY, width, height } = dragOffsetRef.current
    const rawPos = {
      x: e.clientX - offsetX,
      y: e.clientY - offsetY,
    }

    hasMovedRef.current = true
    setPosition(clampPosition(rawPos, width, height))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragOffsetRef.current) return

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }

    dragOffsetRef.current = null
    setIsDragging(false)

    // If user clicked without dragging, keep the default centered position
    if (!hasMovedRef.current && initialPosRef.current === null) {
      setPosition(null)
    }

    hasMovedRef.current = false
  }

  const handlePointerCancel = () => {
    if (!dragOffsetRef.current) return
    dragOffsetRef.current = null
    setIsDragging(false)
    if (!hasMovedRef.current && initialPosRef.current === null) {
      setPosition(null)
    }
    hasMovedRef.current = false
  }

  const resetPosition = () => {
    setPosition(null)
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null
    if (target?.closest('button, a, input, select, textarea, [data-drag-ignore]')) {
      return
    }
    resetPosition()
  }

  return {
    position,
    isDragging,
    elementRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleDoubleClick,
    resetPosition,
  }
}
