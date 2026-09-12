import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { PAGE_SIZE_OPTIONS } from '../components/ui/Table/TablePagination'

export interface UseTablePaginationOptions {
  pageSizeOptions?: number[]
  defaultPageSize?: number
  page?: number
  pageSize?: number
  totalCount?: number
  pageCount?: number
  serverSide?: boolean
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSelectionReset?: () => void
}

export interface UseTablePaginationReturn {
  activePage: number
  activePageSize: number
  minPageSize: number
  normalizedPageSizeOptions: number[]
  isServerSide: boolean
  getTotalItemsCount: (filteredLength: number) => number
  getPageCount: (filteredLength: number) => number
  getActivePage: (filteredLength: number) => number
  getPaginatedData: <T>(items: T[]) => T[]
  setPage: (nextPage: number, filteredLength?: number) => void
  setPageSize: (nextPageSize: number) => void
}

export default function useTablePagination({
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  defaultPageSize = 20,
  page: controlledPage,
  pageSize: controlledPageSize,
  totalCount,
  pageCount: controlledPageCount,
  serverSide = false,
  onPageChange,
  onPageSizeChange,
  onSelectionReset,
}: UseTablePaginationOptions = {}): UseTablePaginationReturn {
  const [internalPage, setInternalPage] = useState(0)
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize)

  // Reset selection on controlled page change
  const lastControlledPageRef = useRef(controlledPage)
  useEffect(() => {
    if (lastControlledPageRef.current !== controlledPage) {
      lastControlledPageRef.current = controlledPage
      onSelectionReset?.()
    }
  }, [controlledPage, onSelectionReset])

  const normalizedPageSizeOptions = useMemo(() => {
    const options = pageSizeOptions?.length ? pageSizeOptions : PAGE_SIZE_OPTIONS
    const validOptions = (Array.from(new Set(options)) as number[]).filter(
      (option: number) => Number.isFinite(option) && option > 0
    )
    return validOptions.length ? validOptions : PAGE_SIZE_OPTIONS
  }, [pageSizeOptions])

  const minPageSize = useMemo(() => {
    return Math.min(...normalizedPageSizeOptions)
  }, [normalizedPageSizeOptions])

  const activePageSize = useMemo(() => {
    if (controlledPageSize !== undefined && normalizedPageSizeOptions.includes(controlledPageSize)) {
      return controlledPageSize
    }
    if (normalizedPageSizeOptions.includes(internalPageSize)) {
      return internalPageSize
    }
    return normalizedPageSizeOptions[0]
  }, [controlledPageSize, internalPageSize, normalizedPageSizeOptions])

  const isServerSide = serverSide || totalCount !== undefined || controlledPageCount !== undefined

  const getTotalItemsCount = useCallback(
    (filteredLength: number) => {
      return isServerSide ? (totalCount ?? filteredLength) : filteredLength
    },
    [isServerSide, totalCount]
  )

  const getPageCount = useCallback(
    (filteredLength: number) => {
      if (controlledPageCount !== undefined) return controlledPageCount
      const total = getTotalItemsCount(filteredLength)
      return Math.max(1, Math.ceil(total / activePageSize))
    },
    [controlledPageCount, getTotalItemsCount, activePageSize]
  )

  const getActivePage = useCallback(
    (filteredLength: number) => {
      const pageCount = getPageCount(filteredLength)
      const requestedPage = controlledPage ?? internalPage
      const maxPage = Math.max(pageCount - 1, 0)
      return Math.min(Math.max(requestedPage, 0), maxPage)
    },
    [getPageCount, controlledPage, internalPage]
  )

  const getPaginatedData = useCallback(
    <T>(items: T[]): T[] => {
      if (isServerSide) return items
      const page = getActivePage(items.length)
      const start = page * activePageSize
      return items.slice(start, start + activePageSize)
    },
    [isServerSide, getActivePage, activePageSize]
  )

  const setPage = useCallback(
    (nextPage: number, filteredLength?: number) => {
      const count = filteredLength !== undefined ? getPageCount(filteredLength) : 1
      const maxPage = Math.max(count - 1, 0)
      const boundedPage = Math.min(Math.max(nextPage, 0), maxPage)

      if (controlledPage === undefined) setInternalPage(boundedPage)
      onSelectionReset?.()
      onPageChange?.(boundedPage)
    },
    [getPageCount, controlledPage, onSelectionReset, onPageChange]
  )

  const setPageSize = useCallback(
    (nextPageSize: number) => {
      const boundedPageSize = normalizedPageSizeOptions.includes(nextPageSize)
        ? nextPageSize
        : normalizedPageSizeOptions[0]

      if (controlledPageSize === undefined) setInternalPageSize(boundedPageSize)
      if (controlledPage === undefined) setInternalPage(0)
      onSelectionReset?.()
      onPageSizeChange?.(boundedPageSize)
      onPageChange?.(0)
    },
    [normalizedPageSizeOptions, controlledPageSize, controlledPage, onSelectionReset, onPageSizeChange, onPageChange]
  )

  const activePage = controlledPage ?? internalPage

  return {
    activePage,
    activePageSize,
    minPageSize,
    normalizedPageSizeOptions,
    isServerSide,
    getTotalItemsCount,
    getPageCount,
    getActivePage,
    getPaginatedData,
    setPage,
    setPageSize,
  }
}
