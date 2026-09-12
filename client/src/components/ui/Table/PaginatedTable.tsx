import React, { forwardRef, useCallback } from 'react'
import BaseTable from './BaseTable'
import TablePagination, { PAGE_SIZE_OPTIONS } from './TablePagination'
import TableRow from './TableRow'
import useTablePagination, { type UseTablePaginationOptions } from '../../../hooks/useTablePagination'
import type { BaseTableProps } from '../../../types/table'

export interface PaginatedTableProps
  extends BaseTableProps,
    Omit<UseTablePaginationOptions, 'onSelectionReset'> {}

const PaginatedTable = forwardRef<HTMLDivElement, PaginatedTableProps>(function PaginatedTable(
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
  const onSelectionChange = props.onSelectionChange
  const onSelectionReset = useCallback(() => {
    onSelectionChange?.([], new Set())
  }, [onSelectionChange])

  const pagination = useTablePagination({
    pageSizeOptions,
    defaultPageSize,
    page: controlledPage,
    pageSize: controlledPageSize,
    totalCount,
    pageCount: controlledPageCount,
    serverSide,
    onPageChange,
    onPageSizeChange,
    onSelectionReset,
  })

  return (
    <BaseTable
      {...props}
      ref={ref}
      renderBody={({ filteredData, context, virtuosoContext, fixedHeader }) => {
        if (filteredData.length === 0) return null

        const rowContext = context ?? virtuosoContext
        const paginatedRows = pagination.getPaginatedData(filteredData)
        const activePage = pagination.getActivePage(filteredData.length)
        const pageStartIndex = pagination.isServerSide ? 0 : activePage * pagination.activePageSize

        return (
          <table className="w-full border-collapse text-left">
            <thead>{fixedHeader()}</thead>
            <tbody>
              {paginatedRows.map((row, index) => {
                const localIndex = pagination.isServerSide ? index : pageStartIndex + index
                const rowKey = rowContext.getRowKey(row, localIndex)

                return (
                  <TableRow
                    key={rowKey}
                    row={row}
                    index={localIndex}
                    context={rowContext}
                  />
                )
              })}
            </tbody>
          </table>
        )
      }}
      renderFooter={({ filteredData, t }) => {
        const totalItems = pagination.getTotalItemsCount(filteredData.length)
        if (totalItems <= pagination.minPageSize) return null

        return (
          <TablePagination
            t={t}
            page={pagination.getActivePage(filteredData.length)}
            pageSize={pagination.activePageSize}
            pageCount={pagination.getPageCount(filteredData.length)}
            pageSizeOptions={pagination.normalizedPageSizeOptions}
            onPageChange={(nextPage) => pagination.setPage(nextPage, filteredData.length)}
            onPageSizeChange={pagination.setPageSize}
          />
        )
      }}
    />
  )
})

export default PaginatedTable
