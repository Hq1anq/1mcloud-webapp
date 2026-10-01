import { useState, useMemo, useCallback } from 'react'
import { canAccessDetailView } from '../config/features'
import type { ColumnDef } from '../types/table'

export interface UseTableDetailViewOptions<T extends Record<string, any> = Record<string, any>> {
  baseColumns: ColumnDef<T>[]
  detailColumns: ColumnDef<T>[]
  insertAfterKey: string
}

export interface UseTableDetailViewReturn<T extends Record<string, any> = Record<string, any>> {
  isDetailEnabled: boolean
  isDetailView: boolean
  toggleDetailView: () => void
  columns: ColumnDef<T>[]
}

export function useTableDetailView<T extends Record<string, any> = Record<string, any>>({
  baseColumns,
  detailColumns,
  insertAfterKey,
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

    const insertIndex = baseColumns.findIndex((col) => col.key === insertAfterKey)
    if (insertIndex === -1) {
      return [...baseColumns, ...detailColumns]
    }

    return [
      ...baseColumns.slice(0, insertIndex + 1),
      ...detailColumns,
      ...baseColumns.slice(insertIndex + 1),
    ]
  }, [baseColumns, detailColumns, insertAfterKey, isDetailEnabled, isDetailView])

  return {
    isDetailEnabled,
    isDetailView,
    toggleDetailView,
    columns,
  }
}

