/* eslint-disable react-refresh/only-export-components */
import React, { forwardRef } from 'react'
import VirtualizedTable, { type VirtualizedTableProps } from './VirtualizedTable'
import PaginatedTable, { type PaginatedTableProps } from './PaginatedTable'
import StandardTable, { type StandardTableProps } from './StandardTable'
import TableRow from './TableRow'
import TableCells from './TableCells'
import TableFilterToolbar from '../TableFilterToolbar'
import useTableSelection from '../../../hooks/useTableSelection'
import TableFilterHeader from './TableFilterHeader'
import { VIRTUOSO_COMPONENTS, itemContent, VirtuosoTableRow } from './TableVirtuosoRow'
import useTableFilter, { type UseTableFilterOptions, type UseTableFilterReturn } from '../../../hooks/useTableFilter'
import TableContext, { TableProvider, useTableContext, type TableContextValue } from './TableContext'

import useTablePagination, { type UseTablePaginationOptions, type UseTablePaginationReturn } from '../../../hooks/useTablePagination'
import TableFloatingStatus, { type TableFloatingStatusProps } from './TableFloatingStatus'

export * from '../../../types/table'
export * from '../../../utils/tableColumn'
export {
  VirtualizedTable,
  PaginatedTable,
  StandardTable,
  TableRow,
  TableCells,
  VirtuosoTableRow,
  VIRTUOSO_COMPONENTS,
  itemContent,
  TableFilterToolbar,
  TableFilterHeader,
  useTableSelection,
  useTableFilter,
  useTablePagination,
  TableContext,
  TableProvider,
  useTableContext,
  TableFloatingStatus,
}
export type {
  UseTableFilterOptions,
  UseTableFilterReturn,
  UseTablePaginationOptions,
  UseTablePaginationReturn,
  TableContextValue,
  TableFloatingStatusProps,
}

export interface TableProps
  extends StandardTableProps,
    PaginatedTableProps,
    VirtualizedTableProps {
  virtualized?: boolean
  pagination?: boolean
}

const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  { virtualized = true, pagination = false, ...props },
  ref
) {
  if (pagination) {
    return <PaginatedTable {...props} ref={ref} />
  }

  if (!virtualized) {
    return <StandardTable {...props} ref={ref} />
  }

  return <VirtualizedTable {...props} ref={ref} />
})

export default Table
