import React from 'react'
import type { DockableItemConfig, FloatingPosition } from './types'

interface FloatingWidgetProps {
  item: DockableItemConfig
  position: FloatingPosition
  onPointerDown: (
    itemId: string,
    e: React.PointerEvent<HTMLElement>,
    source: 'floating'
  ) => void
  onTouchStart: (
    itemId: string,
    e: React.TouchEvent<HTMLElement>,
    source: 'floating'
  ) => void
  onClickCapture: (e: React.MouseEvent) => void
  isDraggingThis: boolean
  isPressingThis: boolean
}

export default function FloatingWidget({
  item,
  position,
  onPointerDown,
  onTouchStart,
  onClickCapture,
  isDraggingThis,
  isPressingThis,
}: FloatingWidgetProps) {
  const childProps = item.render.props as React.HTMLAttributes<HTMLElement>

  return React.cloneElement(item.render, {
    'data-capture-ignore': true,
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerDown?.(e)
      if (e.pointerType === 'mouse') {
        onPointerDown(item.id, e, 'floating')
      }
    },
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      childProps.onTouchStart?.(e)
      onTouchStart(item.id, e, 'floating')
    },
    onClickCapture,
    onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
      childProps.onContextMenu?.(e)
      e.preventDefault()
    },
    style: {
      ...childProps.style,
      left: isDraggingThis ? '-9999px' : `${position.x}px`,
      top: isDraggingThis ? '-9999px' : `${position.y}px`,
    },
    className: `${childProps.className || ''} fixed z-50 select-none shadow-xl touch-manipulation ${isDraggingThis
      ? 'opacity-0 pointer-events-none'
      : isPressingThis
        ? 'scale-95 brightness-110 transition-transform duration-200'
        : ''
      }`,
  } as React.HTMLAttributes<HTMLElement>)
}
