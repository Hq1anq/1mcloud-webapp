import { forwardRef, useState, useMemo } from 'react'
import BaseTable from './BaseTable'
import TablePagination, { PAGE_SIZE_OPTIONS } from './TablePagination'
import { TableRow, itemContent } from './TableVirtuosoRow.jsx'

const PaginatedTable = forwardRef(function PaginatedTable(
  {
    pageSizeOptions = PAGE_SIZE_OPTIONS,
    defaultPageSize = 20,
    page: controlledPage,
    pageSize: controlledPageSize,
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
      normalizedPageSizeOptions={normalizedPageSizeOptions}
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
    normalizedPageSizeOptions,
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
  return (
    <BaseTable
      {...props}
      ref={ref}
      renderBody={({ filteredData, virtuosoContext, fixedHeader }) => {
        const pageCount = Math.ceil(filteredData.length / activePageSize)
        const requestedPage = controlledPage ?? internalPage
        const maxPage = Math.max(pageCount - 1, 0)
        const activePage = Math.min(Math.max(requestedPage, 0), maxPage)
        const pageStartIndex = activePage * activePageSize
        const paginatedData = filteredData.slice(pageStartIndex, pageStartIndex + activePageSize)

        return (
          <table className="w-full border-collapse text-left">
            <thead>{fixedHeader()}</thead>
            <tbody>
              {paginatedData.map((row, index) => {
                const rowIndex = pageStartIndex + index

                return (
                  <TableRow
                    key={row.sid !== undefined ? row.sid : rowIndex}
                    context={virtuosoContext}
                    item={row}
                    data-index={rowIndex}
                  >
                    {itemContent(rowIndex, row, virtuosoContext)}
                  </TableRow>
                )
              })}
            </tbody>
          </table>
        )
      }}
      renderFooter={({ filteredData, t }) => {
        const pageCount = Math.ceil(filteredData.length / activePageSize)
        const requestedPage = controlledPage ?? internalPage
        const maxPage = Math.max(pageCount - 1, 0)
        const activePage = Math.min(Math.max(requestedPage, 0), maxPage)

        const setPage = (nextPage) => {
          const boundedPage = Math.min(Math.max(nextPage, 0), Math.max(pageCount - 1, 0))
          if (controlledPage === undefined) setInternalPage(boundedPage)
          onPageChange?.(boundedPage)
        }

        const setPageSize = (nextPageSize) => {
          const boundedPageSize = normalizedPageSizeOptions.includes(nextPageSize)
            ? nextPageSize
            : normalizedPageSizeOptions[0]

          if (controlledPageSize === undefined) setInternalPageSize(boundedPageSize)
          if (controlledPage === undefined) setInternalPage(0)
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
