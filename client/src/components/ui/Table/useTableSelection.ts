import { useState, useCallback, useMemo } from 'react'

export interface UseTableSelectionOptions<T> {
  data?: T[]
  getRowKey?: (item: T, index?: number) => number
}

export interface UseTableSelectionReturn<T> {
  selectedIds: Set<number>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>
  selectedRows: T[]
  setSelectedRows: React.Dispatch<React.SetStateAction<T[]>>
  selectedCount: number
  getRowKey: (item: T, index?: number) => number
  isSelected: (item: T, index?: number) => boolean
  clearSelection: () => void
  deselectRows: (items: (T | number)[]) => void
  selectRows: (items: (T | number)[]) => void
  onSelectionChange: (rows: T[], ids: Set<number>) => void
}

const defaultGetRowKey = (item: any, index: number = 0): number => item?.sid ?? index

export default function useTableSelection<T extends Record<string, any>>({
  data,
  getRowKey = defaultGetRowKey,
}: UseTableSelectionOptions<T> = {}): UseTableSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>([])

  // When data is provided, selectedRows is directly derived from (data, selectedIds),
  // ensuring selectedIds is the single source of truth and rows always have fresh data.
  const selectedRows = useMemo(() => {
    if (data) {
      return data.filter((r, i) => selectedIds.has(getRowKey(r, i)))
    }
    return internalSelectedRows
  }, [data, selectedIds, getRowKey, internalSelectedRows])

  const setSelectedRows = useCallback(
    (action: React.SetStateAction<T[]>) => {
      if (data) {
        const nextRows = typeof action === 'function' ? action(selectedRows) : action
        setSelectedIds(new Set(nextRows.map((r, i) => getRowKey(r, i))))
      } else {
        setInternalSelectedRows(action)
      }
    },
    [data, selectedRows, getRowKey]
  )

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setInternalSelectedRows([])
  }, [])

  // Deselect accepts either full row objects or raw SIDs
  const deselectRows = useCallback(
    (items: (T | number)[]) => {
      if (!items?.length) return
      const keysToRemove = new Set(
        items.map((item, i) => (typeof item === 'number' ? item : getRowKey(item, i)))
      )
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const k of keysToRemove) next.delete(k)
        return next
      })
      if (!data) {
        setInternalSelectedRows((prev) =>
          prev.filter((r, i) => !keysToRemove.has(getRowKey(r, i)))
        )
      }
    },
    [getRowKey, data]
  )

  // Select accepts either full row objects or raw SIDs
  const selectRows = useCallback(
    (items: (T | number)[]) => {
      if (!items?.length) return
      const keysToAdd = items.map((item, i) =>
        typeof item === 'number' ? item : getRowKey(item, i)
      )
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const k of keysToAdd) next.add(k)
        return next
      })
      if (!data) {
        setInternalSelectedRows((prev) => {
          const existingKeys = new Set(prev.map((r, i) => getRowKey(r, i)))
          const additions = (items.filter((item) => typeof item !== 'number') as T[]).filter(
            (r, i) => !existingKeys.has(getRowKey(r, i))
          )
          return [...prev, ...additions]
        })
      }
    },
    [getRowKey, data]
  )

  const isSelected = useCallback(
    (item: T, index?: number) => selectedIds.has(getRowKey(item, index)),
    [selectedIds, getRowKey]
  )

  const onSelectionChange = useCallback(
    (rows: T[], ids: Set<number>) => {
      setSelectedIds(ids)
      if (!data) setInternalSelectedRows(rows)
    },
    [data]
  )

  return {
    selectedIds,
    setSelectedIds,
    selectedRows,
    setSelectedRows,
    selectedCount: selectedRows.length,
    getRowKey,
    isSelected,
    clearSelection,
    deselectRows,
    selectRows,
    onSelectionChange,
  }
}
