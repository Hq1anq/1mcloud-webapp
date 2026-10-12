import React, { useMemo } from 'react'
import type { DockableToolbarProps } from './types'
import { useDockableToolbar } from './useDockableToolbar'
import FloatingWidget from './FloatingWidget'

export default function DockableToolbar({
  items,
  containerClassName = 'bg-wrapper flex w-full flex-wrap justify-center gap-2 rounded-lg p-4 sm:gap-3',
}: DockableToolbarProps) {
  const {
    displayDockedIds,
    floatingMap,
    activeDrag,
    dropIndex,
    isOverContainer,
    containerRef,
    wasDraggingRef,
    handlePointerDown,
  } = useDockableToolbar(items)

  const itemMap = useMemo(() => {
    const map = new Map<string, (typeof items)[0]>()
    items.forEach((it) => map.set(it.id, it))
    return map
  }, [items])

  const floatingList = Object.entries(floatingMap)
  const activeItemConfig = activeDrag ? itemMap.get(activeDrag.itemId) : null

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  return (
    <>
      {/* Main Dock Container */}
      <div
        ref={containerRef}
        className={`${containerClassName} ${isOverContainer && activeDrag?.hasMoved
          ? 'ring-2 ring-primary/40 transition-all duration-150'
          : ''
          }`}
      >
        {(() => {
          const elements: React.ReactNode[] = []

          displayDockedIds.forEach((id, idx) => {
            // Drop placeholder if hovering over this slot
            if (activeDrag?.hasMoved && isOverContainer && dropIndex === idx) {
              elements.push(
                <div
                  key="__placeholder__"
                  data-dockable-id="__placeholder__"
                  className="min-h-10 min-w-24 grow rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 transition-all duration-150 animate-pulse pointer-events-none"
                />
              )
            }

            const itemConfig = itemMap.get(id)
            if (!itemConfig) return

            const childProps = itemConfig.render.props as {
              onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void
            }

            elements.push(
              React.cloneElement(itemConfig.render, {
                key: id,
                'data-dockable-id': id,
                onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
                  childProps.onPointerDown?.(e)
                  handlePointerDown(id, e, 'docked')
                },
                onClickCapture: handleCaptureClick,
              } as React.HTMLAttributes<HTMLElement>)
            )
          })

          // Drop placeholder at the very end
          if (
            activeDrag?.hasMoved &&
            isOverContainer &&
            dropIndex === displayDockedIds.length
          ) {
            elements.push(
              <div
                key="__placeholder_end__"
                data-dockable-id="__placeholder__"
                className="min-h-10 min-w-24 grow rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 transition-all duration-150 animate-pulse pointer-events-none"
              />
            )
          }

          return elements
        })()}
      </div>

      {/* Detached Floating Items */}
      {floatingList.map(([id, pos]) => {
        const itemConfig = itemMap.get(id)
        if (!itemConfig) return null

        return (
          <FloatingWidget
            key={id}
            item={itemConfig}
            position={pos}
            onPointerDown={handlePointerDown}
            onClickCapture={handleCaptureClick}
            isDraggingThis={activeDrag?.hasMoved === true && activeDrag.itemId === id}
          />
        )
      })}

      {/* Active Drag Overlay Following Cursor */}
      {activeDrag?.hasMoved && activeItemConfig && React.isValidElement(activeItemConfig.render) && (() => {
        const childProps = activeItemConfig.render.props as {
          style?: React.CSSProperties
          className?: string
        }
        return React.cloneElement(activeItemConfig.render, {
          'data-capture-ignore': true,
          style: {
            ...childProps.style,
            left: `${activeDrag.currentX}px`,
            top: `${activeDrag.currentY}px`,
            width: `${activeDrag.width}px`,
            height: `${activeDrag.height}px`,
          },
          className: `${childProps.className || ''} fixed z-50 pointer-events-none shadow-2xl opacity-90 scale-75 cursor-grabbing select-none touch-none`,
        } as React.HTMLAttributes<HTMLElement>)
      })()}
    </>
  )
}
