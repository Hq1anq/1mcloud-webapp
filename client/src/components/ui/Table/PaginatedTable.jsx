import { forwardRef, useState, useMemo, useRef, useEffect } from 'react'
import BaseTable from './BaseTable'
import TablePagination, { PAGE_SIZE_OPTIONS } from './TablePagination'
import { TableRow, itemContent } from './TableVirtuosoRow.jsx'

const PaginatedTable = forwardRef(function PaginatedTable(
  {
    pageSizeOptions = PAGE_SIZE_OPTIONS,
    defaultPageSize = 20,
    page: controlledPage,
    pageSize: controlledPageSize,
    totalCount,
    pageCount: controlledPageCount,
    serverSide = false,
    onPageChange,
    onPageSizeChange,
    ...props
  },
  ref
) {
  const [internalPage, setInternalPage] = useState(0)
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize)

  const normalizedPageSizeOptions = useMemo(() => {
    const options = pageSizeOptions?.length ? pageSizeOptions : PAGE_SIZE_OPTIONS
    const validOptions = [...new Set(options)].filter(
      (option) => Number.isFinite(option) && option > 0
    )
    return validOptions.length ? validOptions : PAGE_SIZE_OPTIONS
  }, [pageSizeOptions])

  const minPageSize = useMemo(() => {
    return Math.min(...normalizedPageSizeOptions)
  }, [normalizedPageSizeOptions])

  const activePageSize = normalizedPageSizeOptions.includes(controlledPageSize)
    ? controlledPageSize
    : normalizedPageSizeOptions.includes(internalPageSize)
      ? internalPageSize
      : normalizedPageSizeOptions[0]

  return (
    <PaginatedTableInternal
      {...props}
      ref={ref}
      controlledPage={controlledPage}
      controlledPageSize={controlledPageSize}
      totalCount={totalCount}
      controlledPageCount={controlledPageCount}
      serverSide={serverSide}
      normalizedPageSizeOptions={normalizedPageSizeOptions}
      minPageSize={minPageSize}
      activePageSize={activePageSize}
      internalPage={internalPage}
      setInternalPage={setInternalPage}
      setInternalPageSize={setInternalPageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  )
})

const PaginatedTableInternal = forwardRef(function PaginatedTableInternal(
  {
    controlledPage,
    controlledPageSize,
    totalCount,
    controlledPageCount,
    serverSide,
    normalizedPageSizeOptions,
    minPageSize,
    activePageSize,
    internalPage,
    setInternalPage,
    setInternalPageSize,
    onPageChange,
    onPageSizeChange,
    ...props
  },
  ref
) {
  const onSelectionChange = props.onSelectionChange

  // Reset selection whenever controlled page changes
  const lastControlledPageRef = useRef(controlledPage)
  useEffect(() => {
    if (lastControlledPageRef.current !== controlledPage) {
      lastControlledPageRef.current = controlledPage
      onSelectionChange?.([], new Set())
    }
  }, [controlledPage, onSelectionChange])

  return (
    <BaseTable
      {...props}
      ref={ref}
      useFilter={false}
      renderBody={({ filteredData, virtuosoContext, fixedHeader }) => {
        const isServerSide =
          serverSide || totalCount !== undefined || controlledPageCount !== undefined
        const totalItemsCount = isServerSide
          ? (totalCount ?? filteredData.length)
          : filteredData.length
        const pageCount =
          controlledPageCount ?? Math.max(1, Math.ceil(totalItemsCount / activePageSize))
        const requestedPage = controlledPage ?? internalPage
        const maxPage = Math.max(pageCount - 1, 0)
        const activePage = Math.min(Math.max(requestedPage, 0), maxPage)

        const pageStartIndex = isServerSide ? 0 : activePage * activePageSize
        const paginatedData = isServerSide
          ? filteredData
          : filteredData.slice(pageStartIndex, pageStartIndex + activePageSize)

        if (filteredData.length === 0) {
          return null
        }

        return (
          <table className="w-full border-collapse text-left">
            <thead>{fixedHeader()}</thead>
            <tbody>
              {paginatedData.map((row, index) => {
                const localIndex = isServerSide ? index : pageStartIndex + index
                const globalKey =
                  row.sid !== undefined
                    ? row.sid
                    : (isServerSide ? activePage * activePageSize : pageStartIndex) + index

                return (
                  <TableRow
                    key={globalKey}
                    context={virtuosoContext}
                    item={row}
                    data-index={localIndex}
                  >
                    {itemContent(localIndex, row, virtuosoContext)}
                  </TableRow>
                )
              })}
            </tbody>
          </table>
        )
      }}
      renderFooter={({ filteredData, t }) => {
        const isServerSide =
          serverSide || totalCount !== undefined || controlledPageCount !== undefined
        const totalItemsCount = isServerSide
          ? (totalCount ?? filteredData.length)
          : filteredData.length

        // Only show pagination control section when data items exceed the minimum page size
        if (totalItemsCount <= minPageSize) {
          return null
        }

        const pageCount =
          controlledPageCount ?? Math.max(1, Math.ceil(totalItemsCount / activePageSize))
        const requestedPage = controlledPage ?? internalPage
        const maxPage = Math.max(pageCount - 1, 0)
        const activePage = Math.min(Math.max(requestedPage, 0), maxPage)

        const setPage = (nextPage) => {
          const boundedPage = Math.min(Math.max(nextPage, 0), Math.max(pageCount - 1, 0))
          if (controlledPage === undefined) setInternalPage(boundedPage)
          onSelectionChange?.([], new Set())
          onPageChange?.(boundedPage)
        }

        const setPageSize = (nextPageSize) => {
          const boundedPageSize = normalizedPageSizeOptions.includes(nextPageSize)
            ? nextPageSize
            : normalizedPageSizeOptions[0]

          if (controlledPageSize === undefined) setInternalPageSize(boundedPageSize)
          if (controlledPage === undefined) setInternalPage(0)
          onSelectionChange?.([], new Set())
          onPageSizeChange?.(boundedPageSize)
          onPageChange?.(0)
        }

        return (
          <TablePagination
            t={t}
            page={activePage}
            pageSize={activePageSize}
            pageCount={pageCount}
            pageSizeOptions={normalizedPageSizeOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )
      }}
    />
  )
})

export default PaginatedTable
