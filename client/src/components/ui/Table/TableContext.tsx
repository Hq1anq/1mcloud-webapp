import React, { createContext, useContext } from 'react'
import type { ColumnDef, TableSortConfig } from '../../../types/table'

export interface TableContextValue<T = Record<string, any>> {
  // Config & Metadata
  headers: string[]
  columns: ColumnDef<T>[]
  tableTitle?: string
  useFilter: boolean
  selectable: boolean
  isRowSelectable: (row: T) => boolean
  t: (key: string) => string

  // Display toggles
  showCountryCode: boolean
  onToggleCountryCode: () => void

  // Filter state & actions
  filters: Record<string, string>
  filterInputs: Record<string, string>
  onFilterInputChange: (header: string, value: string) => void
  onFilterKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, header: string) => void
  onFilterApply: (header: string, value: string) => void

  // Sort state & actions
  sortConfig: TableSortConfig
  onToggleSort: (columnKey: string) => void

  // Selection state & actions
  selectedIds: Set<string | number>
  isAllSelected: boolean
  isIndeterminate: boolean
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectRow: (index: number, shiftKey: boolean, row: T) => void
  getRowKey: (row: T, index: number) => string | number

  // Data & row actions
  filteredData: T[]
  rowClassMap?: Record<string | number, string>
}

const TableContext = createContext<TableContextValue<any> | null>(null)

export interface TableProviderProps<T> {
  value: TableContextValue<T>
  children: React.ReactNode
}

export function TableProvider<T>({ value, children }: TableProviderProps<T>): React.ReactElement {
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}

export function useTableContext<T = Record<string, any>>(): TableContextValue<T> {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider')
  }
  return context as TableContextValue<T>
}

export default TableContext
