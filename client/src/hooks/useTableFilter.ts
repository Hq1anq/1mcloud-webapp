import { useState, useMemo, useCallback, useRef } from 'react'
import { formatInputDate } from '../utils/data'
import { applyFilters, applySort } from '../utils/tableFilter'
import type { ColumnDef, TableSortConfig } from '../types/table'

export interface UseTableFilterOptions<T> {
  data: T[]
  columns: ColumnDef<T>[]
  useFilter: boolean
  getRowKey: (row: T, index: number) => string | number
  onFilterApplied?: () => void
  serverSide?: boolean
  controlledSortConfig?: TableSortConfig
  onSortChange?: (sortConfig: TableSortConfig) => void
}

export interface UseTableFilterReturn<T> {
  filters: Record<string, string>
  filterInputs: Record<string, string>
  filteredData: T[]
  handleFilterInputChange: (header: string, value: string) => void
  applyFilter: (header: string, value: string) => void
  handleFilterKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, header: string) => void
  resetFilters: () => void
  sortConfig: TableSortConfig
  handleToggleSort: (columnKey: string) => void
}

const DEFAULT_DATA: never[] = []

export default function useTableFilter<T extends Record<string, any>>({
  data,
  columns,
  useFilter,
  getRowKey,
  onFilterApplied,
  serverSide = false,
  controlledSortConfig,
  onSortChange,
}: UseTableFilterOptions<T>): UseTableFilterReturn<T> {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>({})
  const [filterVersion, setFilterVersion] = useState(0)
  const [internalSortConfig, setInternalSortConfig] = useState<TableSortConfig>({
    columnKey: '',
    direction: 'none',
  })

  const activeSortConfig = controlledSortConfig ?? internalSortConfig

  const isFilterActiveRef = useRef<boolean>(false)
  const filteredResultRef = useRef<T[] | null>(null)
  const matchedKeysRef = useRef<(string | number)[] | null>(null)
  const lastFilterVersionRef = useRef<number>(0)
  const lastDataRef = useRef<T[] | undefined>(data)

  const handleFilterInputChange = useCallback((header: string, value: string) => {
    setFilterInputs((prev) => ({ ...prev, [header]: value }))
  }, [])

  const applyFilter = useCallback(
    (header: string, value: string) => {
      let finalValue = value

      if (['created', 'expired'].includes(header) && /^\d+$/.test(value.trim())) {
        finalValue = formatInputDate(value)
      }

      setFilterInputs((prev) => ({ ...prev, [header]: finalValue }))
      setFilters((prev) => ({
        ...prev,
        ...filterInputs,
        [header]: finalValue,
      }))
      setFilterVersion((v) => v + 1)
      onFilterApplied?.()
    },
    [filterInputs, onFilterApplied]
  )

  const handleFilterKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, header: string) => {
      if (e.key !== 'Enter') return

      const inputValue =
        filterInputs[header] !== undefined ? filterInputs[header] : filters[header] || ''

      applyFilter(header, inputValue)
    },
    [applyFilter, filterInputs, filters]
  )

  const handleToggleSort = useCallback(
    (columnKey: string) => {
      const isSameColumn = activeSortConfig.columnKey === columnKey
      let nextDirection: 'none' | 'asc' | 'desc' = 'asc'

      if (isSameColumn) {
        if (activeSortConfig.direction === 'none') {
          nextDirection = 'asc'
        } else if (activeSortConfig.direction === 'asc') {
          nextDirection = 'desc'
        } else {
          nextDirection = 'none'
        }
      }

      const nextSort: TableSortConfig = {
        columnKey: nextDirection === 'none' ? '' : columnKey,
        direction: nextDirection,
      }

      if (controlledSortConfig === undefined) {
        setInternalSortConfig(nextSort)
      }
      onSortChange?.(nextSort)
    },
    [activeSortConfig, controlledSortConfig, onSortChange]
  )

  const resetFilters = useCallback(() => {
    setFilters({})
    setFilterInputs({})
    setFilterVersion((v) => v + 1)
    isFilterActiveRef.current = false
    filteredResultRef.current = null
    matchedKeysRef.current = null
    onFilterApplied?.()
  }, [onFilterApplied])

  const filteredData = useMemo(() => {
    let resultData = data || DEFAULT_DATA

    if (!useFilter) {
      if (serverSide) return [...resultData]
      return applySort(resultData, activeSortConfig, columns)
    }

    const prevData = lastDataRef.current
    const dataChanged = data !== prevData

    if (filterVersion !== lastFilterVersionRef.current) {
      lastFilterVersionRef.current = filterVersion
      lastDataRef.current = data

      const isIpPortFilterActive = Boolean(filters['ip_port']?.trim())
      const isStatusFilterActive = Boolean(filters['status']?.trim())
      const shouldHideRefunded = !isIpPortFilterActive && !isStatusFilterActive

      const columnMap = new Map(columns.map((c) => [c.key, c]))
      const hasActiveHeaderFilter = Object.entries(filters).some(
        ([key, v]) => Boolean(v?.trim()) && columnMap.has(key)
      )
      isFilterActiveRef.current = hasActiveHeaderFilter

      if (hasActiveHeaderFilter) {
        let result = applyFilters(data || DEFAULT_DATA, filters, columns)
        if (shouldHideRefunded) {
          result = result.filter((row: T) => row?.status?.toLowerCase() !== 'refunded')
        }
        filteredResultRef.current = result
        matchedKeysRef.current = result.map((r, i) => getRowKey(r, i))
      } else {
        filteredResultRef.current = null
        matchedKeysRef.current = null
      }
    } else if (dataChanged) {
      lastDataRef.current = data

      const isSameDatasetStructure =
        isFilterActiveRef.current &&
        matchedKeysRef.current !== null &&
        Array.isArray(prevData) &&
        Array.isArray(data) &&
        prevData.length === data.length &&
        prevData.every((item, i) => getRowKey(item, i) === getRowKey(data[i], i))

      if (isSameDatasetStructure && matchedKeysRef.current) {
        const dataMap = new Map((data || []).map((r, i) => [getRowKey(r, i), r]))
        const updatedResult = matchedKeysRef.current
          .map((key) => dataMap.get(key))
          .filter((item): item is T => item !== undefined)

        filteredResultRef.current = updatedResult
      } else {
        isFilterActiveRef.current = false
        filteredResultRef.current = null
        matchedKeysRef.current = null
      }
    }

    if (isFilterActiveRef.current && filteredResultRef.current !== null) {
      resultData = filteredResultRef.current
    } else {
      resultData = data || DEFAULT_DATA
      resultData = resultData.filter((row: T) => row?.status?.toLowerCase() !== 'refunded')
    }

    if (serverSide) {
      return [...resultData]
    }

    return applySort(resultData, activeSortConfig, columns)
  }, [data, columns, filters, useFilter, filterVersion, activeSortConfig, serverSide, getRowKey])

  return {
    filters,
    filterInputs,
    filteredData,
    handleFilterInputChange,
    applyFilter,
    handleFilterKeyDown,
    resetFilters,
    sortConfig: activeSortConfig,
    handleToggleSort,
  }
}
