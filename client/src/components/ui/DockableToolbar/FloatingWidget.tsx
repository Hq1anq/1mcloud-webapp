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
  onClickCapture: (e: React.MouseEvent) => void
  isDraggingThis: boolean
}

export default function FloatingWidget({
  item,
  position,
  onPointerDown,
  onClickCapture,
  isDraggingThis,
}: FloatingWidgetProps) {
  if (isDraggingThis) {
    return null
  }

  const childProps = item.render.props as {
    style?: React.CSSProperties
    className?: string
    onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void
  }

  return React.cloneElement(item.render, {
    'data-floating-id': item.id,
    'data-capture-ignore': true,
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerDown?.(e)
      onPointerDown(item.id, e, 'floating')
    },
    onClickCapture,
    style: {
      ...childProps.style,
      left: `${position.x}px`,
      top: `${position.y}px`,
    },
    className: `${childProps.className || ''} fixed z-50 select-none shadow-xl touch-none`,
  } as React.HTMLAttributes<HTMLElement>)
}
