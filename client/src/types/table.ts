import type React from 'react'

export interface ColumnDef<T = Record<string, any>> {
  key: string
  align: 'left' | 'center' | 'right'
  filterable: boolean
  renderCell: (row: T, index: number) => React.ReactNode
  renderHeader: () => React.ReactNode
}

export interface TableRowContext<T = Record<string, any>> {
  selectable: boolean
  selectedIds: Set<string | number>
  columns: ColumnDef<T>[]
  isRowSelectable: (row: T) => boolean
  rowClassMap?: Record<string | number, string>
  handleSelectRow: (index: number, shiftKey: boolean, row: T) => void
  getRowKey: (row: T, index: number) => string | number
  t: (key: string) => string
}

export interface TableCellsProps<T = Record<string, any>> {
  row: T
  index: number
  context: TableRowContext<T>
}

export interface TableRowProps<
  T = Record<string, any>,
> extends React.HTMLAttributes<HTMLTableRowElement> {
  row: T
  index: number
  context: TableRowContext<T>
}

export interface VirtuosoTableRowProps<
  T = Record<string, any>,
> extends React.HTMLAttributes<HTMLTableRowElement> {
  context: TableRowContext<T>
  item: T
  'data-index': number
  children?: React.ReactNode
}

export interface RenderBodyParams<T = Record<string, any>> {
  filteredData: T[]
  context: TableRowContext<T>
  virtuosoContext: TableRowContext<T>
  fixedHeader: () => React.ReactNode
  scrollParent?: HTMLElement
  t: (key: string) => string
}

export interface RenderFooterParams<T = Record<string, any>> {
  filteredData: T[]
  t: (key: string) => string
}

export interface BaseTableProps<
  T = Record<string, any>,
> extends React.HTMLAttributes<HTMLDivElement> {
  data?: T[]
  columns: ColumnDef<T>[]
  isRowSelectable: (row: T) => boolean
  isLoading?: boolean
  selectable?: boolean
  useFilter?: boolean
  tableTitle?: string
  selectedIds?: Set<number | string>
  onSelectionChange?: (rows: T[], ids: Set<number | string>) => void
  getRowKey?: (row: T, index?: number) => number | string
  renderBody?: (params: RenderBodyParams<T>) => React.ReactNode
  renderFooter?: (params: RenderFooterParams<T>) => React.ReactNode
  extraBtn?: React.ReactNode
  emptyState?: React.ReactNode
  isError?: boolean
  errorMessage?: React.ReactNode
  className?: string
  rowClassMap?: Record<number | string, string>
  showDetailToggle?: boolean
  isDetailView?: boolean
  onToggleDetailView?: () => void
}
