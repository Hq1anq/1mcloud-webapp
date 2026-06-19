import { useState, useMemo, useCallback, forwardRef, useEffect, useRef } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { formatInputDate } from '../../../lib/utils.js'
import { useTranslation } from '../../../i18n'

import { applyFilters, operatorCycle } from './filterUtils.jsx'
import { VIRTUOSO_COMPONENTS, itemContent, TableRow } from './TableVirtuosoRow.jsx'
import TableFilterHeader from './TableFilterHeader.jsx'
import TableSkeleton from './TableSkeleton.jsx'

const DEFAULT_DATA = []

// ── Main Table component ───────────────────────────────────────────────────
const Table = forwardRef(function Table(
  {
    // Data
    data,
    receivedData = DEFAULT_DATA,
    renderingReceived,
    setRenderingReceived,
    isLoading = false,

    // Feature toggles
    selectable = true, // false → no checkboxes, no selection state/logic
    useFilter, // false/omitted → no filter inputs
    virtualized = true,

    // Column config
    title,
    headers,
    operatorConfig, // per-column operator whitelist; omit for all operators on all columns
    controlButton, // (row) => JSX  — renderer for 'control' column
    onAutoRenewToggle, // (sid, newState) => void

    // Selection (only used when selectable=true)
    selectedIds = new Set(),
    onSelectionChange,

    // UI
    extraBtn, // JSX rendered in the top-right corner (e.g. capture button)
    emptyMessage, // JSX shown below table when data is empty and not loading
    isError,
    errorMessage,
    className,
    rowClassMap, // { [sid]: cssClass } — per-row background override
  },
  tableRef
) {
  const t = useTranslation()

  // ── Scroll parent ──────────────────────────────────────────────────────
  const [scrollParent, setScrollParent] = useState(undefined)
  useEffect(() => {
    const parent = document.getElementById('main-scroll-container')
    if (parent) setScrollParent(parent)
  }, [])

  // ── Rendering-received sync ────────────────────────────────────────────
  // Auto-commit once the useMemo has processed the incoming batch so rows
  // don't disappear on subsequent status updates.
  useEffect(() => {
    if (renderingReceived && setRenderingReceived) {
      setRenderingReceived(false)
    }
  }, [renderingReceived, setRenderingReceived])

  // ── Filter state ───────────────────────────────────────────────────────
  const [filters, setFilters] = useState({})
  const [filterInputs, setFilterInputs] = useState({})
  const [filterVersion, setFilterVersion] = useState(0)
  const [showCountryCode, setShowCountryCode] = useState(false)

  // Snapshot of matched SIDs — only recomputed on Enter, not on every data change
  const matchedSidsRef = useRef(null)
  const lastFilterVersionRef = useRef(0)

  // ── Selection state (only meaningful when selectable=true) ─────────────
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null)
  const [lastSelectionAction, setLastSelectionAction] = useState('add') // 'add' | 'delete'

  // ── Filtered + sorted data ─────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let resultData = data || DEFAULT_DATA

    const getRowKey = (r) => r.sid
    const hasKey = resultData.length > 0 && getRowKey(resultData[0]) !== undefined

    if (!useFilter) {
      return [...resultData].sort((a, b) => {
        if (a.sid !== undefined && b.sid !== undefined) return b.sid - a.sid
        return 0
      })
    }

    const isIpPortFilterActive = !!filters['ip_port']?.value
    const isStatusFilterActive = !!filters['status']?.value
    const shouldHideRefunded = !isIpPortFilterActive && !isStatusFilterActive

    if (renderingReceived) {
      lastFilterVersionRef.current = filterVersion
      let initialData = receivedData
      if (shouldHideRefunded)
        initialData = initialData.filter((row) => row?.status?.toLowerCase() !== 'refunded')

      if (hasKey) matchedSidsRef.current = new Set(initialData.map(getRowKey))
      else matchedSidsRef.current = initialData

      resultData = initialData
    } else {
      // Re-filter if version changed or if we can't snapshot (no unique key)
      if (filterVersion !== lastFilterVersionRef.current || !hasKey) {
        lastFilterVersionRef.current = filterVersion

        let result = applyFilters(data, filters)
        if (shouldHideRefunded)
          result = result.filter((row) => row?.status?.toLowerCase() !== 'refunded')

        if (hasKey) matchedSidsRef.current = new Set(result.map(getRowKey))
        else matchedSidsRef.current = result
      }

      // Apply snapshot if possible, else use dynamically filtered array
      if (!hasKey) {
        resultData = matchedSidsRef.current
      } else if (matchedSidsRef.current) {
        resultData = data.filter((row) => matchedSidsRef.current.has(getRowKey(row)))
      } else {
        resultData = data
      }
    }

    return [...resultData].sort((a, b) => {
      if (a.sid !== undefined && b.sid !== undefined) return b.sid - a.sid
      return 0
    })
  }, [data, receivedData, renderingReceived, filters, useFilter, filterVersion])

  // ── Selection handlers (no-ops when selectable=false) ──────────────────
  const handleSelectRow = useCallback(
    (index, shiftKey) => {
      if (!selectable) return

      const newSelected = new Set(selectedIds)

      if (shiftKey && lastSelectedIndex !== null && index !== undefined) {
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        for (let i = start; i <= end; i++) {
          if (filteredData[i]?.status?.toLowerCase() === 'refunded') continue
          if (lastSelectionAction === 'add') newSelected.add(i)
          else newSelected.delete(i)
        }
      } else {
        if (newSelected.has(index)) {
          newSelected.delete(index)
          setLastSelectionAction('delete')
        } else {
          newSelected.add(index)
          setLastSelectionAction('add')
        }
        setLastSelectedIndex(index)
      }

      const selectedRows = filteredData
        .map((row, idx) => ({ ...row, _index: idx }))
        .filter((_, idx) => newSelected.has(idx))
      onSelectionChange(selectedRows, newSelected)
    },
    [
      selectable,
      selectedIds,
      lastSelectedIndex,
      lastSelectionAction,
      filteredData,
      onSelectionChange,
    ]
  )

  const handleSelectAll = useCallback(
    (e) => {
      if (!selectable) return
      let newSelected
      if (e.target.checked) {
        newSelected = new Set(
          filteredData
            .map((row, index) => (row?.status?.toLowerCase() === 'refunded' ? -1 : index))
            .filter((index) => index !== -1)
        )
      } else {
        newSelected = new Set()
      }
      const selectedRows = filteredData
        .map((row, idx) => ({ ...row, _index: idx }))
        .filter((_, idx) => newSelected.has(idx))
      onSelectionChange(selectedRows, newSelected)
    },
    [selectable, filteredData, onSelectionChange]
  )

  // ── Filter handlers ────────────────────────────────────────────────────
  const handleOperatorToggle = useCallback(
    (header) => {
      const inputValue =
        filterInputs[header] !== undefined ? filterInputs[header] : filters[header]?.value || ''

      setFilters((prev) => {
        const cycle = operatorConfig ? operatorConfig[header] || operatorCycle : operatorCycle
        const defaultOperator = cycle[0]
        const current = prev[header] || { value: '', operator: defaultOperator }
        if (cycle.length <= 1) return prev

        let currentIndex = cycle.indexOf(current.operator)
        if (currentIndex === -1) currentIndex = 0
        const nextIndex = (currentIndex + 1) % cycle.length

        return { ...prev, [header]: { value: inputValue, operator: cycle[nextIndex] } }
      })
    },
    [filterInputs, filters, operatorConfig]
  )

  const handleFilterInputChange = useCallback((header, value) => {
    setFilterInputs((prev) => ({ ...prev, [header]: value }))
  }, [])

  const handleFilterKeyDown = useCallback(
    (e, header) => {
      if (e.key !== 'Enter') return

      const inputValue =
        filterInputs[header] !== undefined ? filterInputs[header] : filters[header]?.value || ''

      let finalValue = inputValue

      // Auto-format short numeric dates (e.g. "250526" → "25-05-2026")
      if (['created', 'expired'].includes(header) && /^\d+$/.test(inputValue.trim())) {
        finalValue = formatInputDate(inputValue)
        setFilterInputs((prev) => ({ ...prev, [header]: finalValue }))
      }

      const defaultOperator = operatorConfig?.[header]?.[0] || 'contain'
      setFilters((prev) => ({
        ...prev,
        [header]: { ...(prev[header] || { operator: defaultOperator }), value: finalValue },
      }))
      setFilterVersion((v) => v + 1)

      if (selectable) {
        onSelectionChange([], new Set())
        setLastSelectedIndex(null)
      }
      if (setRenderingReceived) setRenderingReceived(false)
    },
    [filterInputs, filters, selectable, operatorConfig, onSelectionChange, setRenderingReceived]
  )

  // ── Virtuoso context (stable object) ──────────────────────────────────
  const virtuosoContext = useMemo(
    () => ({
      selectable,
      selectedIds,
      headers,
      rowClassMap,
      handleSelectRow,
      showCountryCode,
      onAutoRenewToggle,
      controlButton,
      t,
    }),
    [
      selectable,
      selectedIds,
      headers,
      rowClassMap,
      handleSelectRow,
      showCountryCode,
      onAutoRenewToggle,
      controlButton,
      t,
    ]
  )

  // ── Fixed header factory (consumed by both skeleton and TableVirtuoso) ─
  const fixedHeader = useCallback(
    () => (
      <TableFilterHeader
        headers={headers}
        title={title}
        useFilter={useFilter}
        operatorConfig={operatorConfig}
        selectable={selectable}
        selectedIds={selectedIds}
        filteredData={filteredData}
        filters={filters}
        filterInputs={filterInputs}
        showCountryCode={showCountryCode}
        onToggleCountryCode={() => setShowCountryCode((prev) => !prev)}
        onOperatorToggle={handleOperatorToggle}
        onFilterInputChange={handleFilterInputChange}
        onFilterKeyDown={handleFilterKeyDown}
        onSelectAll={handleSelectAll}
        t={t}
      />
    ),
    [
      headers,
      title,
      useFilter,
      operatorConfig,
      selectable,
      selectedIds,
      filteredData,
      filters,
      filterInputs,
      showCountryCode,
      handleOperatorToggle,
      handleFilterInputChange,
      handleFilterKeyDown,
      handleSelectAll,
      t,
    ]
  )

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={`text-text-primary mx-auto max-w-7xl ${className}`}>
      <div
        id="table-container"
        ref={tableRef}
        className="bg-surface border-border mx-auto w-full rounded-lg border-2 shadow-lg select-none"
      >
        {/* ── Container header (title + stats + extra button) ── */}
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
            <span>{title}</span>
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
            {extraBtn && <span data-capture-ignore>{extraBtn}</span>}
          </div>
        </div>

        {/* ── Table body ── */}
        <div className="scroll-container overflow-x-auto overflow-y-hidden rounded-b-lg [&_td]:transition-colors!">
          {isLoading ? (
            <TableSkeleton headers={headers} selectable={selectable} fixedHeader={fixedHeader} />
          ) : virtualized && scrollParent !== undefined ? (
            <TableVirtuoso
              data={filteredData}
              customScrollParent={scrollParent}
              context={virtuosoContext}
              components={VIRTUOSO_COMPONENTS}
              fixedHeaderContent={fixedHeader}
              itemContent={itemContent}
              overscan={150}
              increaseViewportBy={{ top: 80, bottom: 80 }}
            />
          ) : !virtualized ? (
            <table className="w-full border-collapse text-left">
              <thead>{fixedHeader()}</thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <TableRow
                    key={row.sid !== undefined ? row.sid : index}
                    context={virtuosoContext}
                    item={row}
                    data-index={index}
                  >
                    {itemContent(index, row, virtuosoContext)}
                  </TableRow>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        {!isLoading && isError && errorMessage}
        {!isLoading && !isError && filteredData.length === 0 && emptyMessage}
      </div>
    </div>
  )
})

export default Table
