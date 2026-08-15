import { forwardRef } from 'react'
import VirtualizedTable from './VirtualizedTable'
import PaginatedTable from './PaginatedTable'
import StandardTable from './StandardTable'
import TableFilterToolbar from './TableFilterToolbar'

export { VirtualizedTable, PaginatedTable, StandardTable, StandardTable as SimpleTable, TableFilterToolbar }

const Table = forwardRef(function Table({ virtualized = true, pagination = false, ...props }, ref) {
  if (pagination) {
    return <PaginatedTable {...props} ref={ref} />
  }

  if (!virtualized) {
    return <StandardTable {...props} ref={ref} />
  }

  return <VirtualizedTable {...props} ref={ref} />
})

export default Table
