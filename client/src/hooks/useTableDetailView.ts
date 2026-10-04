import { useState, useMemo, useCallback } from 'react'
import { canAccessDetailView } from '../config/features'
import type { ColumnDef } from '../types/table'

export interface DetailPlacement<T extends Record<string, any> = Record<string, any>> {
  insertAfterKey: string
  columns: ColumnDef<T>[]
}

export interface UseTableDetailViewOptions<T extends Record<string, any> = Record<string, any>> {
  baseColumns: ColumnDef<T>[]
  detailPlacements: DetailPlacement<T>[]
}

export interface UseTableDetailViewReturn<T extends Record<string, any> = Record<string, any>> {
  isDetailEnabled: boolean
  isDetailView: boolean
  toggleDetailView: () => void
  columns: ColumnDef<T>[]
}

export function useTableDetailView<T extends Record<string, any> = Record<string, any>>({
  baseColumns,
  detailPlacements,
}: UseTableDetailViewOptions<T>): UseTableDetailViewReturn<T> {
  const isDetailEnabled = useMemo(() => canAccessDetailView(), [])
  const [isDetailView, setIsDetailView] = useState<boolean>(false)

  const toggleDetailView = useCallback(() => {
    if (!isDetailEnabled) return
    setIsDetailView((prev) => !prev)
  }, [isDetailEnabled])

  const columns = useMemo(() => {
    if (!isDetailEnabled || !isDetailView) {
      return baseColumns
    }

    let currentColumns = [...baseColumns]

    for (const placement of detailPlacements) {
      const insertIndex = currentColumns.findIndex((col) => col.key === placement.insertAfterKey)
      if (insertIndex === -1) {
        currentColumns = [...currentColumns, ...placement.columns]
      } else {
        currentColumns = [
          ...currentColumns.slice(0, insertIndex + 1),
          ...placement.columns,
          ...currentColumns.slice(insertIndex + 1),
        ]
      }
    }

    return currentColumns
  }, [baseColumns, detailPlacements, isDetailEnabled, isDetailView])

  return {
    isDetailEnabled,
    isDetailView,
    toggleDetailView,
    columns,
  }
}
