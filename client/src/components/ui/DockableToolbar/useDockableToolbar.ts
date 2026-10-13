import { useState, useRef, useEffect, useCallback } from 'react'
import type { DockableItemConfig, FloatingPosition, ActiveDragState } from './types'

const LONG_PRESS_DELAY_MS = 500
const TOUCH_SCROLL_CANCEL_DISTANCE_PX = 10

function calculateDropIndex(
  container: HTMLElement,
  clientX: number,
  clientY: number
): number {
  const children = Array.from(container.children) as HTMLElement[]
  const itemElements = children.filter(
    (el) => el.dataset.dockableId && el.dataset.dockableId !== '__placeholder__'
  )

  if (itemElements.length === 0) return 0

  // Group elements into visual rows based on flex layout
  const rows: { index: number; rect: DOMRect }[][] = []
  let currentRow: { index: number; rect: DOMRect }[] = []

  for (let i = 0; i < itemElements.length; i++) {
    const rect = itemElements[i].getBoundingClientRect()
    if (currentRow.length === 0) {
      currentRow.push({ index: i, rect })
    } else {
      const prev = currentRow[currentRow.length - 1]
      // Flex row wrap detection: left edge moved backwards or top is significantly lower
      if (rect.left < prev.rect.left || rect.top > prev.rect.top + prev.rect.height * 0.6) {
        rows.push(currentRow)
        currentRow = [{ index: i, rect }]
      } else {
        currentRow.push({ index: i, rect })
      }
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  // If pointer is above the first row
  const firstRowTop = Math.min(...rows[0].map((it) => it.rect.top))
  if (clientY < firstRowTop - 8) {
    return 0
  }

  // If pointer is below the last row
  const lastRow = rows[rows.length - 1]
  const lastRowBottom = Math.max(...lastRow.map((it) => it.rect.bottom))
  if (clientY > lastRowBottom + 8) {
    return itemElements.length
  }

  // Find the matching row by vertical range
  let targetRow = rows[0]
  let foundDirectRow = false
  for (const r of rows) {
    const rTop = Math.min(...r.map((it) => it.rect.top))
    const rBottom = Math.max(...r.map((it) => it.rect.bottom))
    if (clientY >= rTop - 6 && clientY <= rBottom + 6) {
      targetRow = r
      foundDirectRow = true
      break
    }
  }

  // If in a vertical gap between rows, pick the vertically closest row
  if (!foundDirectRow) {
    let minDiff = Infinity
    for (const r of rows) {
      const rMidY =
        (Math.min(...r.map((it) => it.rect.top)) +
          Math.max(...r.map((it) => it.rect.bottom))) /
        2
      const diff = Math.abs(clientY - rMidY)
      if (diff < minDiff) {
        minDiff = diff
        targetRow = r
      }
    }
  }

  // Within targetRow, determine insertion slot based on clientX
  for (let i = 0; i < targetRow.length; i++) {
    const item = targetRow[i]
    const midX = item.rect.left + item.rect.width / 2
    if (clientX < midX) {
      return item.index
    }
  }

  return targetRow[targetRow.length - 1].index + 1
}

function measureFloatingDimensions(elem: HTMLElement): { width: number; height: number } {
  const clone = elem.cloneNode(true) as HTMLElement
  clone.style.position = 'fixed'
  clone.style.visibility = 'hidden'
  clone.style.pointerEvents = 'none'
  clone.style.left = '-9999px'
  clone.style.top = '-9999px'
  clone.style.zIndex = '-9999'
  clone.style.transform = 'none'
  clone.style.transition = 'none'
  clone.style.width = 'auto'
  clone.style.height = 'auto'
  clone.style.maxWidth = 'none'
  clone.style.maxHeight = 'none'
  document.body.appendChild(clone)
  const rect = clone.getBoundingClientRect()
  document.body.removeChild(clone)
  return {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  }
}

function isPointInsideContainer(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  tolerance = 16
): boolean {
  const rect = container.getBoundingClientRect()
  return (
    clientX >= rect.left - tolerance &&
    clientX <= rect.right + tolerance &&
    clientY >= rect.top - tolerance &&
    clientY <= rect.bottom + tolerance
  )
}

export function useDockableToolbar(items: DockableItemConfig[]) {
  const [dockedIds, setDockedIds] = useState<string[]>(() => items.map((it) => it.id))
  const [floatingMap, setFloatingMap] = useState<Record<string, FloatingPosition>>({})
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [isOverContainer, setIsOverContainer] = useState(false)
  const [pressingItemId, setPressingItemId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const wasDraggingRef = useRef(false)
  const activeDragRef = useRef<ActiveDragState | null>(null)
  activeDragRef.current = activeDrag
  const dropIndexRef = useRef<number | null>(null)
  dropIndexRef.current = dropIndex

  const floatingMapRef = useRef(floatingMap)
  floatingMapRef.current = floatingMap

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeTouchCleanupRef = useRef<(() => void) | null>(null)

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (activeTouchCleanupRef.current) {
      activeTouchCleanupRef.current()
      activeTouchCleanupRef.current = null
    }
    setPressingItemId(null)
  }, [])

  // Keep dockedIds and floatingMap in sync when available items change
  useEffect(() => {
    const currentValidIds = new Set(items.map((it) => it.id))

    setDockedIds((prev) => {
      const filtered = prev.filter((id) => currentValidIds.has(id))
      const currentFloating = floatingMapRef.current
      items.forEach((it) => {
        if (!filtered.includes(it.id) && !currentFloating[it.id]) {
          filtered.push(it.id)
        }
      })
      const isSame =
        prev.length === filtered.length &&
        prev.every((id, i) => id === filtered[i])
      return isSame ? prev : filtered
    })

    setFloatingMap((prev) => {
      let changed = false
      const next = { ...prev }
      Object.keys(next).forEach((id) => {
        if (!currentValidIds.has(id)) {
          delete next[id]
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [items])

  // Shared internal starter for dragging
  const startDrag = useCallback(
    (
      itemId: string,
      source: 'docked' | 'floating',
      clientX: number,
      clientY: number,
      elem: HTMLElement,
      isImmediateLift: boolean
    ) => {
      const rect = elem.getBoundingClientRect()
      const naturalDim =
        source === 'floating'
          ? { width: rect.width, height: rect.height }
          : measureFloatingDimensions(elem)

      const width = naturalDim.width
      const height = naturalDim.height

      // Proportional click position within the element rect
      const ratioX = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5
      const ratioY = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5

      // Keep pointer comfortably inside the floating element bounds
      const padX = Math.min(16, width / 4)
      const padY = Math.min(16, height / 4)
      const pointerOffsetX = Math.max(padX, Math.min(width - padX, ratioX * width))
      const pointerOffsetY = Math.max(padY, Math.min(height - padY, ratioY * height))

      const startX = clientX - pointerOffsetX
      const startY = clientY - pointerOffsetY

      wasDraggingRef.current = isImmediateLift

      setActiveDrag({
        itemId,
        source,
        pointerStartX: clientX,
        pointerStartY: clientY,
        elementStartX: startX,
        elementStartY: startY,
        currentX: startX,
        currentY: startY,
        width,
        height,
        hasMoved: isImmediateLift,
      })
    },
    []
  )

  // Drag position updater shared by touch and mouse
  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      const drag = activeDragRef.current
      if (!drag) return

      const deltaX = clientX - drag.pointerStartX
      const deltaY = clientY - drag.pointerStartY
      const dist = Math.hypot(deltaX, deltaY)

      const hasMoved = drag.hasMoved || dist >= 6
      if (hasMoved) {
        wasDraggingRef.current = true
      }

      const nextX = drag.elementStartX + deltaX
      const nextY = drag.elementStartY + deltaY

      setActiveDrag((prev) =>
        prev
          ? {
            ...prev,
            currentX: nextX,
            currentY: nextY,
            hasMoved,
          }
          : null
      )

      // Collision detection with container
      const container = containerRef.current
      if (container && hasMoved) {
        if (isPointInsideContainer(container, clientX, clientY)) {
          setDropIndex(calculateDropIndex(container, clientX, clientY))
          setIsOverContainer(true)
        } else {
          setDropIndex(null)
          setIsOverContainer(false)
        }
      }
    },
    []
  )

  // Drag finalizer shared by touch and mouse
  const finalizeDrop = useCallback(
    (clientX: number, clientY: number) => {
      const drag = activeDragRef.current
      if (!drag) return

      if (drag.hasMoved) {
        const container = containerRef.current
        const droppedInside = Boolean(
          container && isPointInsideContainer(container, clientX, clientY)
        )

        if (droppedInside && container) {
          const finalDropIdx =
            dropIndexRef.current ?? calculateDropIndex(container, clientX, clientY)

          // Re-dock into container
          setFloatingMap((prev) => {
            if (!prev[drag.itemId]) return prev
            const next = { ...prev }
            delete next[drag.itemId]
            return next
          })

          setDockedIds((prev) => {
            const withoutItem = prev.filter((id) => id !== drag.itemId)
            const clampedIdx = Math.max(0, Math.min(withoutItem.length, finalDropIdx))
            const next = [...withoutItem]
            next.splice(clampedIdx, 0, drag.itemId)
            return next
          })
        } else {
          // Detach or keep floating outside
          setDockedIds((prev) =>
            prev.includes(drag.itemId) ? prev.filter((id) => id !== drag.itemId) : prev
          )

          const margin = 8
          const clampedX = Math.max(
            margin,
            Math.min(window.innerWidth - drag.width - margin, drag.currentX)
          )
          const clampedY = Math.max(
            margin,
            Math.min(window.innerHeight - drag.height - margin, drag.currentY)
          )

          setFloatingMap((prev) => ({
            ...prev,
            [drag.itemId]: { x: clampedX, y: clampedY },
          }))
        }

        setTimeout(() => {
          wasDraggingRef.current = false
        }, 100)
      } else {
        wasDraggingRef.current = false
      }

      setActiveDrag(null)
      setDropIndex(null)
      setIsOverContainer(false)
    },
    []
  )

  // Mobile / Tablet Touch handler
  const handleTouchStart = useCallback(
    (
      itemId: string,
      e: React.TouchEvent<HTMLElement>,
      source: 'docked' | 'floating'
    ) => {
      const target = e.target as HTMLElement | null
      // Never initiate drag when touching inside inputs, textareas, selects, or ignored elements
      if (target?.closest('input, textarea, select, [data-dock-ignore]') || e.touches.length > 1) {
        return
      }

      const touch = e.touches[0]
      const startX = touch.clientX
      const startY = touch.clientY
      let lastX = startX
      let lastY = startY

      const elem = e.currentTarget as HTMLElement

      cancelLongPress()
      wasDraggingRef.current = false

      let isDragActive = false
      let isCancelled = false
      let prevUserSelect = ''
      let prevTouchAction = ''

      setPressingItemId(itemId)

      const restoreBodyStyles = () => {
        document.body.style.userSelect = prevUserSelect
        document.body.style.touchAction = prevTouchAction
        document.body.style.overflow = ''
      }

      const cleanupTouch = () => {
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('touchcancel', onTouchCancel)
        activeTouchCleanupRef.current = null
      }

      activeTouchCleanupRef.current = cleanupTouch

      const onTouchMove = (ev: TouchEvent) => {
        if (isCancelled) return

        const currentTouch = ev.touches[0]
        if (!currentTouch) return

        lastX = currentTouch.clientX
        lastY = currentTouch.clientY

        // 1. If long-press has NOT triggered yet:
        if (!isDragActive) {
          const dist = Math.hypot(lastX - startX, lastY - startY)
          // If moved beyond threshold before timer -> user is scrolling!
          if (dist > TOUCH_SCROLL_CANCEL_DISTANCE_PX) {
            isCancelled = true
            cancelLongPress()
            return
          }
          return
        }

        // 2. Long-press IS active -> block browser scrolling completely
        if (ev.cancelable) {
          ev.preventDefault()
        }

        updateDrag(lastX, lastY)
      }

      const onTouchEnd = (ev: TouchEvent) => {
        cleanupTouch()

        if (!isDragActive) {
          cancelLongPress()
          return
        }

        restoreBodyStyles()

        const endTouch = ev.changedTouches[0]
        finalizeDrop(endTouch ? endTouch.clientX : lastX, endTouch ? endTouch.clientY : lastY)
      }

      const onTouchCancel = () => {
        cleanupTouch()
        cancelLongPress()
        if (isDragActive) {
          restoreBodyStyles()
          setActiveDrag(null)
          setDropIndex(null)
          setIsOverContainer(false)
        }
      }

      // Register non-passive touchmove listener to window at touchstart
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('touchcancel', onTouchCancel, { passive: true })

      longPressTimerRef.current = setTimeout(() => {
        if (isCancelled) return

        isDragActive = true
        longPressTimerRef.current = null
        setPressingItemId(null)

        navigator.vibrate?.(50)

        prevUserSelect = document.body.style.userSelect
        prevTouchAction = document.body.style.touchAction
        document.body.style.userSelect = 'none'
        document.body.style.touchAction = 'none'
        document.body.style.overflow = 'hidden'

        startDrag(itemId, source, lastX, lastY, elem, true)
      }, LONG_PRESS_DELAY_MS)
    },
    [cancelLongPress, finalizeDrop, startDrag, updateDrag]
  )

  // Desktop Mouse handler
  const handlePointerDown = useCallback(
    (
      itemId: string,
      e: React.PointerEvent<HTMLElement>,
      source: 'docked' | 'floating'
    ) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return

      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [data-dock-ignore]')) {
        return
      }

      cancelLongPress()
      startDrag(itemId, source, e.clientX, e.clientY, e.currentTarget, false)
    },
    [cancelLongPress, startDrag]
  )

  // Desktop Mouse window listeners for drag movement & release
  useEffect(() => {
    if (!activeDrag) return

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        updateDrag(e.clientX, e.clientY)
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        finalizeDrop(e.clientX, e.clientY)
      }
    }

    const handleBlur = () => {
      setActiveDrag(null)
      setDropIndex(null)
      setIsOverContainer(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [Boolean(activeDrag), finalizeDrop, updateDrag])

  // Clean up timer & touch listener on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (activeTouchCleanupRef.current) {
        activeTouchCleanupRef.current()
      }
    }
  }, [])

  // Keep floating widgets clamped inside viewport if window is resized
  useEffect(() => {
    const handleResize = () => {
      setFloatingMap((prev) => {
        let changed = false
        const next: Record<string, FloatingPosition> = {}
        const margin = 8

        Object.entries(prev).forEach(([id, pos]) => {
          const maxX = Math.max(margin, window.innerWidth - 60 - margin)
          const maxY = Math.max(margin, window.innerHeight - 40 - margin)
          const clampedX = Math.max(margin, Math.min(maxX, pos.x))
          const clampedY = Math.max(margin, Math.min(maxY, pos.y))

          if (clampedX !== pos.x || clampedY !== pos.y) {
            changed = true
            next[id] = { x: clampedX, y: clampedY }
          } else {
            next[id] = pos
          }
        })

        return changed ? next : prev
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    dockedIds,
    floatingMap,
    activeDrag,
    dropIndex,
    isOverContainer,
    pressingItemId,
    containerRef,
    wasDraggingRef,
    handlePointerDown,
    handleTouchStart,
  }
}
