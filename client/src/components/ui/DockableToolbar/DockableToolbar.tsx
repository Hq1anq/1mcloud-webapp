import React, { useMemo } from 'react'
import type { DockableToolbarProps } from './types'
import { useDockableToolbar } from './useDockableToolbar'
import FloatingWidget from './FloatingWidget'

const DropPlaceholder = () => (
  <div
    data-dockable-id="__placeholder__"
    className="min-h-10 min-w-24 grow rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 transition-all duration-150 animate-pulse pointer-events-none"
  />
)

export default function DockableToolbar({
  items,
  containerClassName = 'bg-wrapper flex w-full flex-wrap justify-center gap-2 rounded-lg p-4 sm:gap-3',
}: DockableToolbarProps) {
  const {
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
  } = useDockableToolbar(items)

  const itemMap = useMemo(() => {
    const map = new Map<string, (typeof items)[0]>()
    items.forEach((it) => map.set(it.id, it))
    return map
  }, [items])

  const floatingList = Object.entries(floatingMap)
  const activeItemConfig = activeDrag ? itemMap.get(activeDrag.itemId) : null
  const activeOverlayProps = activeItemConfig
    ? (activeItemConfig.render.props as React.HTMLAttributes<HTMLElement>)
    : null

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
        {dockedIds.map((id, idx) => {
          const itemConfig = itemMap.get(id)
          if (!itemConfig) return null

          const childProps = itemConfig.render.props as React.HTMLAttributes<HTMLElement>
          const isBeingDragged = activeDrag?.hasMoved && activeDrag.itemId === id
          const isPressingThis = pressingItemId === id

          return (
            <React.Fragment key={id}>
              {activeDrag?.hasMoved && isOverContainer && dropIndex === idx && (
                <DropPlaceholder />
              )}
              {React.cloneElement(itemConfig.render, {
                'data-dockable-id': id,
                onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
                  childProps.onPointerDown?.(e)
                  if (e.pointerType === 'mouse') {
                    handlePointerDown(id, e, 'docked')
                  }
                },
                onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
                  childProps.onTouchStart?.(e)
                  handleTouchStart(id, e, 'docked')
                },
                onClickCapture: handleCaptureClick,
                onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
                  childProps.onContextMenu?.(e)
                  e.preventDefault()
                },
                className: `${childProps.className || ''} touch-manipulation ${isBeingDragged
                  ? 'fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none'
                  : isPressingThis
                    ? 'scale-95 brightness-110 transition-transform duration-200'
                    : ''
                  }`,
              } as React.HTMLAttributes<HTMLElement>)}
            </React.Fragment>
          )
        })}

        {/* Drop placeholder at the very end */}
        {activeDrag?.hasMoved && isOverContainer && dropIndex === dockedIds.length && (
          <DropPlaceholder />
        )}
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
            onTouchStart={handleTouchStart}
            onClickCapture={handleCaptureClick}
            isDraggingThis={Boolean(activeDrag?.hasMoved && activeDrag.itemId === id)}
            isPressingThis={pressingItemId === id}
          />
        )
      })}

      {/* Active Drag Overlay Following Cursor */}
      {activeDrag?.hasMoved && activeItemConfig && activeOverlayProps && (
        React.cloneElement(activeItemConfig.render, {
          'data-capture-ignore': true,
          style: {
            ...activeOverlayProps.style,
            left: `${activeDrag.currentX}px`,
            top: `${activeDrag.currentY}px`,
            width: `${activeDrag.width}px`,
            height: `${activeDrag.height}px`,
          },
          className: `${activeOverlayProps.className || ''} fixed z-50 pointer-events-none shadow-2xl opacity-90 scale-75 cursor-grabbing select-none touch-none`,
        } as React.HTMLAttributes<HTMLElement>)
      )}
    </>
  )
}
