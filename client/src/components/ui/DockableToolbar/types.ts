import React from 'react'

export interface DockableItemConfig {
  id: string
  render: React.ReactElement
}

export interface FloatingPosition {
  x: number
  y: number
}

export interface ActiveDragState {
  itemId: string
  source: 'docked' | 'floating'
  pointerStartX: number
  pointerStartY: number
  elementStartX: number
  elementStartY: number
  currentX: number
  currentY: number
  width: number
  height: number
  hasMoved: boolean
}

export interface DockableToolbarProps {
  items: DockableItemConfig[]
  containerClassName?: string
}
