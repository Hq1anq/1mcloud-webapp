import React, { useState, useMemo, useCallback, forwardRef, useEffect } from 'react'
import { useTranslation } from '../../../i18n'
import TableFilterHeader from './TableFilterHeader'
import TableSkeleton from './TableSkeleton'
import useTableFilter from '../../../hooks/useTableFilter'
import { TableProvider, type TableContextValue } from './TableContext'
import type { BaseTableProps, TableRowContext } from '../../../types/table'

const DEFAULT_DATA: any[] = []

const BaseTable = forwardRef<HTMLDivElement, BaseTableProps>(function BaseTable(
  {
    // Data
    data = DEFAULT_DATA,
    isLoading = false,

    // Config
    selectable = true,
    useFilter = false,

    // Column config
    tableTitle,
    columns,
    isRowSelectable,

    // Selection
    selectedIds = new Set(),
    onSelectionChange,
    getRowKey: propsGetRowKey,

    // Render slots
    renderBody,
    renderFooter,

    // UI
    extraBtn,
    emptyState,
    isError,
    errorMessage,
    className = '',
    rowClassMap,

    // Detail view toggle
    showDetailToggle = false,
    isDetailView = false,
    onToggleDetailView,
  },
  tableRef
) {
  const t = useTranslation()

  // ── Headers derived from columns ────────────────────────────────────────
  const headers = useMemo(() => columns.map((col) => col.key), [columns])

  // ── Scroll parent ──────────────────────────────────────────────────────
  const [scrollParent, setScrollParent] = useState<HTMLElement | undefined>(undefined)
  useEffect(() => {
    const parent = document.getElementById('main-scroll-container')
    if (parent) setScrollParent(parent)
  }, [])

  // ── Display toggles ───────────────────────────────────────────────────
  const [showCountryCode, setShowCountryCode] = useState(false)

  const getRowKey = useCallback(
    (row: any, index: number = 0) => {
      if (propsGetRowKey) return propsGetRowKey(row, index)
      return row?.sid ?? index
    },
    [propsGetRowKey]
  )

  // ── Selection state ───────────────────────────────────────────────────
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [lastSelectionAction, setLastSelectionAction] = useState<'add' | 'delete'>('add')

  // ── Filter lifecycle ──────────────────────────────────────────────────
  const onFilterApplied = useCallback(() => {
    if (selectable) {
      onSelectionChange?.([], new Set())
      setLastSelectedIndex(null)
    }
  }, [selectable, onSelectionChange])

  const {
    filters,
    filterInputs,
    filteredData,
    handleFilterInputChange,
    applyFilter,
    handleFilterKeyDown,
  } = useTableFilter({
    data,
    useFilter,
    getRowKey,
    onFilterApplied,
  })

  // ── Selection calculations ────────────────────────────────────────────
  const selectableRows = useMemo(
    () => filteredData.filter((row) => isRowSelectable(row)),
    [filteredData, isRowSelectable]
  )

  const pageSelectedCount = useMemo(
    () => selectableRows.filter((row, i) => selectedIds?.has(getRowKey(row, i))).length,
    [selectableRows, selectedIds, getRowKey]
  )

  const isAllSelected = selectableRows.length > 0 && pageSelectedCount === selectableRows.length
  const isIndeterminate = pageSelectedCount > 0 && pageSelectedCount < selectableRows.length

  // ── Selection handlers ─────────────────────────────────────────────────
  const handleSelectRow = useCallback(
    (index: number, shiftKey: boolean, clickedRow: any) => {
      if (!selectable) return

      const row = clickedRow || filteredData[index]
      if (!row || !isRowSelectable(row)) return

      const key = getRowKey(row, index)
      const newSelected = new Set(selectedIds)

      if (shiftKey && lastSelectedIndex !== null && index !== undefined) {
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        for (let i = start; i <= end; i++) {
          const r = filteredData[i]
          if (!r || !isRowSelectable(r)) continue
          const k = getRowKey(r, i)
          if (lastSelectionAction === 'add') {
            newSelected.add(k)
          } else {
            newSelected.delete(k)
          }
        }
      } else {
        const isCurrentlySelected = newSelected.has(key)
        if (isCurrentlySelected) {
          newSelected.delete(key)
          setLastSelectionAction('delete')
        } else {
          newSelected.add(key)
          setLastSelectionAction('add')
        }
        setLastSelectedIndex(index)
      }

      const finalSelectedRows = filteredData.filter(
        (r, i) => newSelected.has(getRowKey(r, i)) && isRowSelectable(r)
      )

      onSelectionChange?.(finalSelectedRows, newSelected)
    },
    [
      selectable,
      isRowSelectable,
      selectedIds,
      lastSelectedIndex,
      lastSelectionAction,
      filteredData,
      getRowKey,
      onSelectionChange,
    ]
  )

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectable) return
      const newSelected = new Set(selectedIds)

      if (e.target.checked) {
        for (let i = 0; i < filteredData.length; i++) {
          const row = filteredData[i]
          if (!isRowSelectable(row)) continue
          newSelected.add(getRowKey(row, i))
        }
      } else {
        newSelected.clear()
      }

      const finalSelectedRows = filteredData.filter(
        (r, i) => newSelected.has(getRowKey(r, i)) && isRowSelectable(r)
      )

      onSelectionChange?.(finalSelectedRows, newSelected)
    },
    [selectable, isRowSelectable, selectedIds, filteredData, getRowKey, onSelectionChange]
  )

  // ── Virtuoso / TableRow context ─────────────────────────────────────
  const virtuosoContext = useMemo<TableRowContext>(
    () => ({
      selectable,
      selectedIds,
      columns,
      isRowSelectable,
      rowClassMap,
      handleSelectRow,
      getRowKey,
      t,
    }),
    [
      selectable,
      selectedIds,
      columns,
      isRowSelectable,
      rowClassMap,
      handleSelectRow,
      getRowKey,
      t,
    ]
  )

  // ── TableContext value ────────────────────────────────────────────────
  const tableContextValue = useMemo<TableContextValue>(
    () => ({
      headers,
      columns,
      tableTitle,
      useFilter,
      selectable,
      isRowSelectable,
      t,
      showCountryCode,
      onToggleCountryCode: () => setShowCountryCode((prev) => !prev),
      filters,
      filterInputs,
      onFilterInputChange: handleFilterInputChange,
      onFilterKeyDown: handleFilterKeyDown,
      onFilterApply: applyFilter,
      selectedIds,
      isAllSelected,
      isIndeterminate,
      onSelectAll: handleSelectAll,
      handleSelectRow,
      getRowKey,
      filteredData,
      rowClassMap,
    }),
    [
      headers,
      columns,
      tableTitle,
      useFilter,
      selectable,
      isRowSelectable,
      t,
      showCountryCode,
      filters,
      filterInputs,
      handleFilterInputChange,
      handleFilterKeyDown,
      applyFilter,
      selectedIds,
      isAllSelected,
      isIndeterminate,
      handleSelectAll,
      handleSelectRow,
      getRowKey,
      filteredData,
      rowClassMap,
    ]
  )

  // ── Fixed header rendered cleanly via context ─────────────────────────
  const fixedHeader = useCallback(() => <TableFilterHeader />, [])

  return (
    <TableProvider value={tableContextValue}>
      <div className={`text-text-primary mx-auto max-w-380 ${className}`}>
        <div
          id="table-container"
          ref={tableRef}
          className="bg-surface border-border mx-auto w-full rounded-lg border-2 shadow-lg select-none"
        >
          {/* Container header */}
          <div
            id="container-header"
            className="bg-thead border-border z-30 flex items-center justify-between rounded-t-lg px-4 py-3"
          >
            <h2 className="flex items-center text-lg font-semibold sm:text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 size-7 shrink-0 fill-none stroke-current stroke-2 sm:size-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 9L20 9M8 9V20M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z"
                />
              </svg>
              <span>{tableTitle}</span>
            </h2>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-5">
                {selectable && (
                  <span className="text-right whitespace-nowrap">
                    {t('table.selected')}:{' '}
                    <span className="text-highlight font-semibold">{selectedIds.size}</span>{' '}
                    {t('table.rows')}
                  </span>
                )}
                <span className="text-right whitespace-nowrap">
                  {t('table.total')}:{' '}
                  <span className="text-highlight font-semibold">{filteredData.length}</span>{' '}
                  {t('table.rows')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {showDetailToggle && (
                  <svg
                    id="detailToggleBtn"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    data-capture-ignore
                    onClick={onToggleDetailView}
                    className="text-text-muted hover:text-text-primary size-5 shrink-0 cursor-pointer fill-none stroke-current stroke-2 transition-colors sm:size-7"
                  >
                    <title>{isDetailView ? t('table.hideDetail') : t('table.showDetail')}</title>
                    {isDetailView ? (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </>
                    )}
                  </svg>
                )}
                {extraBtn && <span data-capture-ignore>{extraBtn}</span>}
              </div>
            </div>
          </div>

          {/* Table Body Container */}
          <div className="scroll-container overflow-x-auto overflow-y-hidden rounded-b-lg">
            {isLoading ? (
              <TableSkeleton headers={headers} selectable={selectable} fixedHeader={fixedHeader} />
            ) : (
              renderBody?.({
                filteredData,
                context: virtuosoContext,
                virtuosoContext,
                fixedHeader,
                scrollParent,
                t,
              })
            )}
          </div>

          {!isLoading && isError && errorMessage}
          {!isLoading && !isError && filteredData.length === 0 && emptyState}
        </div>

        {renderFooter?.({ filteredData, t })}
      </div>
    </TableProvider>
  )
})

export default BaseTable
