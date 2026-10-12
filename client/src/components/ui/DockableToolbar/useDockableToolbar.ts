import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { DockableItemConfig, FloatingPosition, ActiveDragState } from './types'

export function calculateDropIndex(
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

export function measureFloatingDimensions(elem: HTMLElement): { width: number; height: number } {
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

export function useDockableToolbar(items: DockableItemConfig[]) {
  const initialIds = items.map((it) => it.id)
  const [dockedIds, setDockedIds] = useState<string[]>(initialIds)
  const [floatingMap, setFloatingMap] = useState<Record<string, FloatingPosition>>({})
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [isOverContainer, setIsOverContainer] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const wasDraggingRef = useRef(false)
  const activeDragRef = useRef<ActiveDragState | null>(null)
  activeDragRef.current = activeDrag
  const dropIndexRef = useRef<number | null>(null)
  dropIndexRef.current = dropIndex

  // Currently rendered docked items (excluding the item being actively dragged)
  const displayDockedIds = useMemo(() => {
    if (activeDrag?.hasMoved) {
      return dockedIds.filter((id) => id !== activeDrag.itemId)
    }
    return dockedIds
  }, [dockedIds, activeDrag?.hasMoved, activeDrag?.itemId])

  // Keep dockedIds in sync when available items change
  useEffect(() => {
    const currentValidIds = new Set(items.map((it) => it.id))

    setDockedIds((prev) => {
      const filtered = prev.filter((id) => currentValidIds.has(id))
      // Add any new items that are neither docked nor floating
      items.forEach((it) => {
        if (!filtered.includes(it.id) && !floatingMap[it.id]) {
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
  }, [items, floatingMap])

  // Drag start handler
  const handlePointerDown = useCallback(
    (
      itemId: string,
      e: React.PointerEvent<HTMLElement>,
      source: 'docked' | 'floating'
    ) => {
      if (e.button !== 0) return

      const target = e.target as HTMLElement | null
      // Never initiate drag when clicking inside text inputs, textareas, selects, or ignored elements
      if (target?.closest('input, textarea, select, [data-dock-ignore]')) {
        return
      }

      // Find the root element of this item or floating card
      const elem = (e.currentTarget.closest('[data-dockable-id], [data-floating-id]') ||
        e.currentTarget) as HTMLElement

      const rect = elem.getBoundingClientRect()
      const naturalDim =
        source === 'floating'
          ? { width: rect.width, height: rect.height }
          : measureFloatingDimensions(elem)

      const naturalWidth = naturalDim.width > 0 ? naturalDim.width : rect.width
      const naturalHeight = naturalDim.height > 0 ? naturalDim.height : rect.height

      // Proportional click position within the docked rect
      const ratioX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5
      const ratioY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5

      // Keep pointer comfortably inside the floating element bounds
      const padX = Math.min(16, naturalWidth / 4)
      const padY = Math.min(16, naturalHeight / 4)
      const pointerOffsetX = Math.max(
        padX,
        Math.min(naturalWidth - padX, ratioX * naturalWidth)
      )
      const pointerOffsetY = Math.max(
        padY,
        Math.min(naturalHeight - padY, ratioY * naturalHeight)
      )

      const startX = e.clientX - pointerOffsetX
      const startY = e.clientY - pointerOffsetY

      wasDraggingRef.current = false

      setActiveDrag({
        itemId,
        source,
        pointerStartX: e.clientX,
        pointerStartY: e.clientY,
        elementStartX: startX,
        elementStartY: startY,
        currentX: startX,
        currentY: startY,
        width: naturalWidth,
        height: naturalHeight,
        hasMoved: false,
      })
    },
    []
  )

  // Global window listeners for drag movement & release
  useEffect(() => {
    if (!activeDrag) return

    const handlePointerMove = (e: PointerEvent) => {
      const drag = activeDragRef.current
      if (!drag) return

      const deltaX = e.clientX - drag.pointerStartX
      const deltaY = e.clientY - drag.pointerStartY
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
        const cRect = container.getBoundingClientRect()
        const tolerance = 16
        const isInside =
          e.clientX >= cRect.left - tolerance &&
          e.clientX <= cRect.right + tolerance &&
          e.clientY >= cRect.top - tolerance &&
          e.clientY <= cRect.bottom + tolerance

        if (isInside) {
          const calculatedIndex = calculateDropIndex(
            container,
            e.clientX,
            e.clientY
          )
          setDropIndex(calculatedIndex)
          setIsOverContainer(true)
        } else {
          setDropIndex(null)
          setIsOverContainer(false)
        }
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      const drag = activeDragRef.current
      if (!drag) return

      if (drag.hasMoved) {
        const container = containerRef.current
        let droppedInside = false
        let finalDropIdx: number | null = null

        if (container) {
          const cRect = container.getBoundingClientRect()
          const tolerance = 16
          droppedInside =
            e.clientX >= cRect.left - tolerance &&
            e.clientX <= cRect.right + tolerance &&
            e.clientY >= cRect.top - tolerance &&
            e.clientY <= cRect.bottom + tolerance

          if (droppedInside) {
            finalDropIdx =
              dropIndexRef.current !== null
                ? dropIndexRef.current
                : calculateDropIndex(container, e.clientX, e.clientY)
          }
        }

        if (droppedInside && finalDropIdx !== null) {
          // Re-dock into container
          setFloatingMap((prev) => {
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
          setDockedIds((prev) => prev.filter((id) => id !== drag.itemId))

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
      }

      setActiveDrag(null)
      setDropIndex(null)
      setIsOverContainer(false)
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
  }, [Boolean(activeDrag)])

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
    displayDockedIds,
    floatingMap,
    activeDrag,
    dropIndex,
    isOverContainer,
    containerRef,
    wasDraggingRef,
    handlePointerDown,
  }
}
