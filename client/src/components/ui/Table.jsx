import { useState, useMemo, useCallback, forwardRef, useEffect, useRef } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { handleCopy, getStatusClasses, formatInputDate, str2date } from '../../lib/utils.js'
import { getFlagIcon } from '../../data/flags.jsx'
import { useTranslation } from '../../i18n'
import Checkbox from './Checkbox.jsx'
import RenewToggle from './RenewToggle.jsx'

const DEFAULT_DATA = []

const operatorIcons = {
  'greater-equal': (
    <path d="M117.9 158.4C101.1 152.8 92.1 134.6 97.7 117.9C103.3 101.2 121.4 92.1 138.1 97.6L522.1 225.6C535.2 230 544 242.2 544 256C544 269.8 535.2 282 522.1 286.4L138.1 414.4C121.3 420 103.2 410.9 97.6 394.2C92 377.5 101.1 359.3 117.8 353.7L410.8 256L117.9 158.4zM512 480C529.7 480 544 494.3 544 512C544 529.7 529.7 544 512 544L128 544C110.3 544 96 529.7 96 512C96 494.3 110.3 480 128 480L512 480z" />
  ),
  equal: (
    <path d="M128 192C110.3 192 96 206.3 96 224C96 241.7 110.3 256 128 256L512 256C529.7 256 544 241.7 544 224C544 206.3 529.7 192 512 192L128 192zM128 384C110.3 384 96 398.3 96 416C96 433.7 110.3 448 128 448L512 448C529.7 448 544 433.7 544 416C544 398.3 529.7 384 512 384L128 384z" />
  ),
  'less-equal': (
    <path d="M522.1 158.4C538.9 152.8 547.9 134.7 542.3 117.9C536.7 101.1 518.6 92.1 501.8 97.7L117.8 225.7C104.8 230 96 242.2 96 256C96 269.8 104.8 282 117.9 286.4L501.9 414.4C518.7 420 536.8 410.9 542.4 394.2C548 377.5 538.9 359.3 522.2 353.7L229.2 256L522.1 158.4zM128 480C110.3 480 96 494.3 96 512C96 529.7 110.3 544 128 544L512 544C529.7 544 544 529.7 544 512C544 494.3 529.7 480 512 480L128 480z" />
  ),
  contain: (
    <path d="M136,128h216c105.9,0,192,86.1,192,192s-86.1,192-192,192H136c-22.1,0-40-17.9-40-40s17.9-40,40-40h216c61.8,0,112-50.2,112-112s-50.2-112-112-112H136c-22.1,0-40-17.9-40-40S113.9,128,136,128z" />
  ),
}

const operatorCycle = ['greater-equal', 'less-equal', 'equal', 'contain']

// Custom Row Component for TableVirtuoso
const TableRow = ({ context, ...props }) => {
  const { selectedIds, handleSelectRow, rowClassMap } = context
  const index = props['data-index']
  const isSelected = selectedIds.has(index)

  // Check for row-level class override (e.g. success/error background)
  const row = props.item // = filteredData[index]
  const overrideClass = row && rowClassMap?.[row.sid]
  const isRefunded = row?.status?.toLowerCase() === 'refunded'

  return (
    <tr
      {...props}
      className={`${isRefunded ? 'cursor-not-allowed opacity-50 select-none' : 'hover:bg-bg-hover'} ${isSelected ? 'bg-bg-selected' : overrideClass || ''} ${props.className || ''}`}
      onClick={(e) => {
        if (isRefunded) return
        // Prevent row selection if clicking/interacting with inputs/buttons/labels
        if (e.target.closest('input') || e.target.closest('button') || e.target.closest('label'))
          return
        handleSelectRow(index, e.shiftKey)
        if (props.onClick) props.onClick(e)
      }}
    />
  )
}

const TableComponent = (props) => <table {...props} className="w-full" />

const VIRTUOSO_COMPONENTS = {
  TableRow,
  Table: TableComponent,
}

const itemContent = (index, row, context) => {
  const {
    selectedIds,
    handleSelectRow,
    headers,
    showCountryCode,
    onAutoRenewToggle,
    controlButton,
  } = context
  const isSelected = selectedIds.has(index)
  const isRefunded = row?.status?.toLowerCase() === 'refunded'

  return (
    <>
      <td data-capture-ignore className="border-border border-b px-2 py-2 text-center sm:px-4">
        <Checkbox
          checked={isSelected}
          onChange={(e) => handleSelectRow(index, e.shiftKey)}
          disabled={isRefunded}
        />
      </td>
      {headers.map((header) => {
        const cellValue = row[header]
        const statusClass = header === 'status' ? getStatusClasses(cellValue) : ''
        const nationFlag = header === 'country' && !showCountryCode ? getNationFlag(cellValue) : ''

        return (
          <td
            key={header}
            className={`border-border border-b px-2 whitespace-nowrap sm:px-4 ${
              ['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'
            } ${nationFlag ? '' : 'py-2'}`}
            onDoubleClick={(e) => handleCopy(e, cellValue)}
            title="Double click to copy"
          >
            {header === 'control' ? (
              controlButton(row)
            ) : header === 'is_auto_renew' ? (
              <RenewToggle
                isOn={cellValue}
                onConfirm={(newState) => onAutoRenewToggle?.(row.sid, newState)}
              />
            ) : statusClass ? (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${statusClass}`}
              >
                {statusClass && <span className="mr-2 size-2 rounded-full bg-current"></span>}
                {cellValue}
              </span>
            ) : nationFlag ? (
              <div className="mx-auto grid size-10 place-items-center">{nationFlag}</div>
            ) : (
              <span>{cellValue}</span>
            )}
          </td>
        )
      })}
    </>
  )
}

const SKELETON_WIDTHS = [
  ['w-20', 'w-32', 'w-24', 'w-16', 'w-24', 'w-24', 'w-24', 'w-20', 'w-32'],
  ['w-24', 'w-28', 'w-20', 'w-16', 'w-20', 'w-24', 'w-24', 'w-16', 'w-28'],
  ['w-16', 'w-32', 'w-24', 'w-20', 'w-24', 'w-24', 'w-24', 'w-20', 'w-24'],
  ['w-20', 'w-28', 'w-28', 'w-16', 'w-20', 'w-24', 'w-24', 'w-16', 'w-32'],
  ['w-24', 'w-32', 'w-20', 'w-20', 'w-24', 'w-24', 'w-24', 'w-20', 'w-24'],
  ['w-16', 'w-28', 'w-24', 'w-16', 'w-20', 'w-24', 'w-24', 'w-16', 'w-32'],
]

const Table = forwardRef(function Table(
  {
    data,
    receivedData = DEFAULT_DATA,
    renderingReceived,
    setRenderingReceived,
    isLoading = false,
    useFilter,
    onAutoRenewToggle,
    selectedIds = new Set(),
    title,
    headers,
    controlButton,
    operatorConfig,
    extraBtn,
    emptyMessage,
    className,
    rowClassMap,
    onSelectionChange,
  },
  tableRef
) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null)
  const [lastSelectionAction, setLastSelectionAction] = useState('add') // 'add' or 'delete'
  const [filters, setFilters] = useState({})
  const [filterInputs, setFilterInputs] = useState({})
  const [scrollParent, setScrollParent] = useState(undefined)
  const [showCountryCode, setShowCountryCode] = useState(false)

  // Filter snapshot: only recompute which rows match on Enter press, not on data change
  const [filterVersion, setFilterVersion] = useState(0)
  const matchedSidsRef = useRef(null)
  const lastFilterVersionRef = useRef(0)
  const t = useTranslation()

  // Attach to our new custom scroll layout
  useEffect(() => {
    const parent = document.getElementById('main-scroll-container')
    if (parent) setScrollParent(parent)
  }, [])

  // Auto-commit renderingReceived once it's been processed by useMemo
  // This "locks in" the current set of rows so they don't disappear on status updates
  useEffect(() => {
    if (renderingReceived && setRenderingReceived) {
      setRenderingReceived(false)
    }
  }, [renderingReceived, setRenderingReceived])

  const filteredData = useMemo(() => {
    let resultData = data || DEFAULT_DATA

    if (!useFilter) {
      // Keep resultData as data
      return [...resultData].sort((a, b) => b.sid - a.sid)
    }

    const isIpPortFilterActive = !!filters['ip_port']?.value
    const isStatusFilterActive = !!filters['status']?.value
    const shouldHideRefunded = !isIpPortFilterActive && !isStatusFilterActive

    if (renderingReceived) {
      lastFilterVersionRef.current = filterVersion

      let initialData = receivedData
      if (shouldHideRefunded)
        initialData = initialData.filter((row) => row?.status?.toLowerCase() !== 'refunded')
      matchedSidsRef.current = new Set(initialData.map((r) => r.sid))
      resultData = initialData
    } else {
      if (filterVersion !== lastFilterVersionRef.current) {
        lastFilterVersionRef.current = filterVersion

        let result = data
        const hasActiveFilters = Object.values(filters).some((f) => f.value)

        if (hasActiveFilters) {
          result = data.filter((row) => {
            return Object.entries(filters).every(([key, filter]) => {
              if (!filter.value) return true // Skip empty filters

              let operator = filter.operator || 'contain'

              const cellValue = row[key]
              const filterValue = filter.value

              if (['created', 'expired'].includes(key) && cellValue && filterValue) {
                try {
                  const dateCell = str2date(String(cellValue)).getTime()
                  const dateFilter = str2date(String(filterValue)).getTime()

                  if (!isNaN(dateCell) && !isNaN(dateFilter)) {
                    switch (operator) {
                      case 'greater-equal':
                        return dateCell >= dateFilter
                      case 'less-equal':
                        return dateCell <= dateFilter
                      case 'equal':
                        return dateCell === dateFilter
                      case 'contain':
                      default:
                        return String(cellValue)
                          .toLowerCase()
                          .includes(String(filterValue).toLowerCase())
                    }
                  }
                } catch {
                  // Fallback for parsing errors
                }
              }

              // Check if both values are valid numbers for numeric comparison
              const isNumeric =
                !isNaN(parseFloat(cellValue)) &&
                isFinite(cellValue) &&
                !isNaN(parseFloat(filterValue)) &&
                isFinite(filterValue)

              if (isNumeric) {
                const numCell = parseFloat(cellValue)
                const numFilter = parseFloat(filterValue)

                switch (operator) {
                  case 'greater-equal':
                    return numCell >= numFilter
                  case 'less-equal':
                    return numCell <= numFilter
                  case 'equal':
                    return numCell === numFilter
                  case 'contain':
                  default:
                    return String(cellValue)
                      .toLowerCase()
                      .includes(String(filterValue).toLowerCase())
                }
              } else {
                // String comparison
                const strCell = String(cellValue ?? '').toLowerCase()
                const strFilter = String(filterValue).toLowerCase()

                switch (operator) {
                  case 'equal':
                    return strCell === strFilter
                  case 'contain':
                  default:
                    return strCell.includes(strFilter)
                  case 'greater-equal':
                  case 'less-equal':
                    return strCell.includes(strFilter)
                }
              }
            })
          })
        }

        if (shouldHideRefunded)
          result = result.filter((row) => row?.status?.toLowerCase() !== 'refunded')

        matchedSidsRef.current = new Set(result.map((r) => r.sid))
      }

      // Use snapshotted SIDs: rows stay visible even if their data changes
      if (matchedSidsRef.current)
        resultData = data.filter((row) => matchedSidsRef.current.has(row.sid))
      else resultData = data
    }

    // Sort descending by sid
    return [...resultData].sort((a, b) => b.sid - a.sid)
  }, [data, receivedData, renderingReceived, filters, useFilter, filterVersion])

  const handleSelectRow = useCallback(
    (index, shiftKey) => {
      const newSelected = new Set(selectedIds)

      if (shiftKey && lastSelectedIndex !== null && index !== undefined) {
        // Range selection
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)

        for (let i = start; i <= end; i++) {
          const rowStatus = filteredData[i]?.status?.toLowerCase()
          if (rowStatus === 'refunded') continue

          if (lastSelectionAction === 'add') newSelected.add(i)
          else newSelected.delete(i)
        }
      } else {
        // Single selection / Toggle
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
        .map((row, idx) => ({ ...row, _index: idx })) // Add _index for mapping (row->idx of set for set.delete) (use for unselect from proxyManager)
        .filter((_, idx) => newSelected.has(idx))
      onSelectionChange(selectedRows, newSelected)
    },
    [selectedIds, lastSelectedIndex, lastSelectionAction, filteredData, onSelectionChange]
  )

  // Deselect effect removed; controlled via selectedIds parent state.

  const virtuosoContext = useMemo(() => {
    return {
      selectedIds,
      headers,
      rowClassMap,
      handleSelectRow,
      showCountryCode,
      onAutoRenewToggle,
      controlButton,
      t,
    }
  }, [
    selectedIds,
    headers,
    rowClassMap,
    handleSelectRow,
    showCountryCode,
    onAutoRenewToggle,
    controlButton,
    t,
  ])

  const fixedHeader = useMemo(() => {
    const toggleOperator = (header) => {
      // Get the current input value, defaulting to active filter value if no input change
      const inputValue =
        filterInputs[header] !== undefined ? filterInputs[header] : filters[header]?.value || ''

      setFilters((prev) => {
        const current = prev[header] || { value: '', operator: 'contain' }

        // Determine allowed cycle for this header
        const cycle = operatorConfig ? operatorConfig[header] || ['contain'] : operatorCycle

        if (cycle.length <= 1) return prev // No cycling if only 1 option (or empty)

        let currentIndex = cycle.indexOf(current.operator)
        // If current operator is invalid/not in cycle, reset to 0
        if (currentIndex === -1) currentIndex = 0

        const nextIndex = (currentIndex + 1) % cycle.length

        return {
          ...prev,
          [header]: { value: inputValue, operator: cycle[nextIndex] },
        }
      })
    }

    const handleFilterInputChange = (header, value) => {
      setFilterInputs((prev) => ({
        ...prev,
        [header]: value,
      }))
    }

    const handleFilterKeyDown = (e, header) => {
      if (e.key === 'Enter') {
        const inputValue =
          filterInputs[header] !== undefined ? filterInputs[header] : filters[header]?.value || ''

        if (['created', 'expired'].includes(header) && /^\d+$/.test(inputValue.trim()))
          setFilterInputs((prev) => ({
            ...prev,
            [header]: formatInputDate(inputValue),
          }))

        setFilters((prev) => ({
          ...prev,
          [header]: { ...(prev[header] || { operator: 'contain' }), value: inputValue },
        }))
        setFilterVersion((v) => v + 1)
        onSelectionChange([], new Set())
        setLastSelectedIndex(null)
        setRenderingReceived(false)
      }
    }

    return () => {
      const selectableCount = filteredData.reduce((count, row) => {
        const isRefunded = row?.status?.toLowerCase() === 'refunded'
        return isRefunded ? count : count + 1
      }, 0)

      return (
        <tr className="bg-thead border-wrapper border-t-4 border-b-2">
          <th data-capture-ignore className="px-2 sm:px-4">
            <Checkbox
              checked={selectedIds.size === selectableCount && selectableCount > 0}
              indeterminate={selectedIds.size > 0 && selectedIds.size < selectableCount}
              onChange={(e) => {
                let newSelected
                if (e.target.checked) {
                  // Select all currently VISIBLE and selectable items
                  newSelected = new Set(
                    filteredData
                      .map((row, index) => {
                        const isRefunded = row?.status?.toLowerCase() === 'refunded'
                        return isRefunded ? -1 : index
                      })
                      .filter((index) => index !== -1)
                  )
                } else {
                  newSelected = new Set()
                }
                const selectedRows = filteredData
                  .map((row, idx) => ({ ...row, _index: idx }))
                  .filter((_, idx) => newSelected.has(idx))
                onSelectionChange(selectedRows, newSelected)
              }}
            />
          </th>

          {headers.map((header) => {
            let currentFilter = filters[header] || { value: '', operator: 'contain' }

            let operator = currentFilter.operator

            const OperatorIcon = operatorIcons[operator]

            const showOperator = operatorConfig ? !!operatorConfig[header] : true // Default behavior matches original (show all)

            // Current input value takes precedence over active filter value
            const inputValue =
              filterInputs[header] !== undefined ? filterInputs[header] : currentFilter.value

            return (
              <th key={header} className="px-2 py-3 font-medium tracking-wider uppercase sm:px-4">
                <div
                  className={`flex min-w-15 flex-col gap-1 font-bold whitespace-nowrap ${
                    title === 'Proxy Status' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                  }`}
                >
                  <span
                    className={['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'}
                  >
                    {header === 'country' ? (
                      <div
                        className="group inline-flex cursor-pointer items-center justify-center gap-1"
                        onClick={() => setShowCountryCode((prev) => !prev)}
                        title="Toggle country display (Flag / Code)"
                      >
                        <span>{t('table.' + header) || header.replace(/_/g, ' ')}</span>
                        {!showCountryCode ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            className="size-3.5 shrink-0 fill-current text-gray-300 group-hover:text-white"
                          >
                            <path d="M144 88C144 74.7 133.3 64 120 64C106.7 64 96 74.7 96 88L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 452L224.3 431.9C265.4 421.6 308.9 426.4 346.8 445.3C391 467.4 442.3 470.1 488.5 452.7L523.2 439.7C535.7 435 544 423.1 544 409.7L544 130C544 107 519.8 92 499.2 102.3L489.6 107.1C443.3 130.3 388.8 130.3 342.5 107.1C307.4 89.5 267.1 85.1 229 94.6L144 116L144 88zM144 165.5L240.6 141.3C267.6 134.6 296.1 137.7 321 150.1C375.9 177.5 439.7 179.8 496 156.9L496 398.7L471.6 407.8C437.9 420.4 400.4 418.5 368.2 402.4C320 378.3 264.9 372.3 212.6 385.3L144 402.5L144 165.5z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="size-3.5 shrink-0 fill-current text-gray-300 group-hover:text-white"
                          >
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <>{t('table.' + header) || header.replace(/_/g, ' ')}</>
                    )}
                  </span>
                  {useFilter && !['control', 'is_auto_renew'].includes(header) && (
                    <div className="relative">
                      {/* Operator icon */}
                      {showOperator && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="bg-border filter-operator fill-text-primary absolute top-[-2px] right-[-6px] size-4 cursor-pointer rounded-full p-0.5"
                          onClick={() => toggleOperator(header)}
                          title={`Filter: ${operator}`}
                        >
                          {OperatorIcon}
                        </svg>
                      )}
                      <input
                        type="text"
                        placeholder="Filter"
                        className={`filter-input bg-dropdown mt-1 w-full px-2 py-1 text-center ${
                          ['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'
                        }`}
                        value={inputValue}
                        onChange={(e) => handleFilterInputChange(header, e.target.value)}
                        onKeyDown={(e) => handleFilterKeyDown(e, header)}
                      />
                    </div>
                  )}
                </div>
              </th>
            )
          })}
        </tr>
      )
    }
  }, [
    title,
    headers,
    useFilter,
    operatorConfig,
    selectedIds.size,
    filters,
    filterInputs,
    filteredData,
    onSelectionChange,
    setRenderingReceived,
    showCountryCode,
    t,
  ])

  return (
    <div className={`text-text-primary flex-1 ${className}`}>
      <div id="table-wrapper" className="mx-auto max-w-7xl px-4 py-3">
        <div
          id="table-container"
          ref={tableRef}
          className="bg-surface border-border mx-auto w-full rounded-lg border-2 shadow-lg select-none"
        >
          {/* Table Header */}
          <div id="container-header" className="bg-thead border-border z-30 rounded-t-lg px-4 py-3">
            <div className="flex items-center justify-between">
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
                  <span className="text-right whitespace-nowrap">
                    {t('table.selected')}:{' '}
                    <span className="text-highlight font-semibold">{selectedIds.size}</span>{' '}
                    {t('table.rows')}
                  </span>
                  <span className="text-right whitespace-nowrap">
                    {t('table.total')}:{' '}
                    <span className="text-highlight font-semibold">{filteredData.length}</span>{' '}
                    {t('table.rows')}
                  </span>
                </div>
                {extraBtn && <span data-capture-ignore>{extraBtn}</span>}
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="scroll-container overflow-x-auto overflow-y-hidden rounded-b-lg [&_td]:transition-colors!">
            {isLoading ? (
              <table className="w-full border-collapse text-left">
                <thead>{fixedHeader()}</thead>
                <tbody>
                  {SKELETON_WIDTHS.map((rowWidths, rowIndex) => (
                    <tr key={rowIndex} className="border-border/50 border-b">
                      <td className="w-12 p-4 text-center align-middle">
                        <div className="shimmer-bg mx-auto size-4 animate-pulse rounded"></div>
                      </td>
                      {headers.map((header, colIndex) => {
                        const widthClass = rowWidths[colIndex % rowWidths.length]
                        const isRoundedFull = header === 'status' || header === 'is_auto_renew'
                        return (
                          <td key={header} className="p-4 align-middle">
                            <div
                              className={`shimmer-bg h-4 ${widthClass} animate-pulse ${
                                isRoundedFull ? 'h-6! rounded-full' : 'rounded'
                              }`}
                            ></div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              scrollParent !== undefined && (
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
              )
            )}
          </div>
          {!isLoading && filteredData.length === 0 && emptyMessage}
        </div>
      </div>
    </div>
  )
})

function getNationFlag(nation) {
  if (['GPU', 'EU'].includes(nation)) return nation
  return getFlagIcon(nation) || ''
}

export default Table
