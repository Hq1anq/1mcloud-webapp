import { useState, useMemo, useCallback, useRef } from 'react'
import { formatInputDate } from '../utils/data'
import { applyFilters } from '../utils/tableFilter'
import type { ColumnDef } from '../types/table'

export interface UseTableFilterOptions<T> {
  data: T[]
  columns: ColumnDef<T>[]
  useFilter: boolean
  getRowKey: (row: T, index: number) => string | number
  onFilterApplied?: () => void
}

export interface UseTableFilterReturn<T> {
  filters: Record<string, string>
  filterInputs: Record<string, string>
  filteredData: T[]
  handleFilterInputChange: (header: string, value: string) => void
  applyFilter: (header: string, value: string) => void
  handleFilterKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, header: string) => void
  resetFilters: () => void
}

const DEFAULT_DATA: any[] = []

export default function useTableFilter<T extends Record<string, any>>({
  data,
  columns,
  useFilter,
  getRowKey,
  onFilterApplied,
}: UseTableFilterOptions<T>): UseTableFilterReturn<T> {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>({})
  const [filterVersion, setFilterVersion] = useState(0)

  const isFilterActiveRef = useRef<boolean>(false)
  const filteredResultRef = useRef<T[] | null>(null)
  const matchedKeysRef = useRef<(string | number)[] | null>(null)
  const lastFilterVersionRef = useRef<number>(0)
  const lastDataRef = useRef<T[] | undefined>(data)
  const lastColumnsRef = useRef<ColumnDef<T>[]>(columns)

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
      return [...resultData].sort((a, b) => {
        if (a.sid !== undefined && b.sid !== undefined) return b.sid - a.sid
        return 0
      })
    }

    const prevData = lastDataRef.current
    const dataChanged = data !== prevData
    const prevColumns = lastColumnsRef.current
    const columnsChanged = columns !== prevColumns

    if (filterVersion !== lastFilterVersionRef.current || columnsChanged) {
      lastFilterVersionRef.current = filterVersion
      lastDataRef.current = data
      lastColumnsRef.current = columns

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

    return [...resultData].sort((a, b) => {
      if (a.sid !== undefined && b.sid !== undefined) return b.sid - a.sid
      return 0
    })
  }, [data, columns, filters, useFilter, filterVersion, getRowKey])

  return {
    filters,
    filterInputs,
    filteredData,
    handleFilterInputChange,
    applyFilter,
    handleFilterKeyDown,
    resetFilters,
  }
}
