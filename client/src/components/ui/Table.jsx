import { useState, useMemo, useCallback, forwardRef } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { handleCopy, getStatusClasses } from '../../lib/utils.js'
import Checkbox from './Checkbox.jsx'

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

  return (
    <tr
      {...props}
      className={`hover:bg-bg-hover text-text-secondary ${isSelected ? 'bg-bg-selected' : overrideClass || ''} ${props.className || ''}`}
      onClick={(e) => {
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
  const { selectedIds, handleSelectRow, headers } = context
  const isSelected = selectedIds.has(index)

  return (
    <>
      <td data-capture-ignore className="border-border border-b px-2 py-2 text-center sm:px-4">
        <Checkbox checked={isSelected} onChange={(e) => handleSelectRow(index, e.shiftKey)} />
      </td>
      {headers.map((header) => {
        const cellValue = row[header]
        const statusClass = header === 'status' ? getStatusClasses(cellValue) : ''

        return (
          <td
            key={header}
            className={`border-border border-b px-2 py-2 whitespace-nowrap sm:px-4 ${
              ['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'
            }`}
            onDoubleClick={(e) => handleCopy(e, cellValue)}
            title="Double click to copy"
          >
            {statusClass ? (
              <span className={`rounded-full px-3 py-0.5 font-semibold ${statusClass}`}>
                {cellValue}
              </span>
            ) : (
              <span>{cellValue}</span>
            )}
          </td>
        )
      })}
    </>
  )
}

const Table = forwardRef(function Table(
  {
    data,
    receivedData = DEFAULT_DATA,
    renderingReceived,
    setRenderingReceived,
    useFilter,
    selectedIds = new Set(),
    title,
    headers,
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

  const filteredData = useMemo(() => {
    if (!useFilter) return data || DEFAULT_DATA
    if (renderingReceived) return receivedData
    const hasActiveFilters = Object.values(filters).some((f) => f.value)
    if (!hasActiveFilters) return data

    return data.filter((row) => {
      return Object.entries(filters).every(([key, filter]) => {
        if (!filter.value) return true // Skip empty filters

        let operator = filter.operator || 'contain'

        const cellValue = row[key]
        const filterValue = filter.value

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
              return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
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
  }, [data, receivedData, renderingReceived, filters, useFilter])

  const handleSelectRow = useCallback(
    (index, shiftKey) => {
      const newSelected = new Set(selectedIds)

      if (shiftKey && lastSelectedIndex !== null && index !== undefined) {
        // Range selection
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)

        for (let i = start; i <= end; i++) {
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
    return { selectedIds, headers, rowClassMap, handleSelectRow }
  }, [selectedIds, headers, rowClassMap, handleSelectRow])

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
        setFilters((prev) => ({
          ...prev,
          [header]: { ...(prev[header] || { operator: 'contain' }), value: inputValue },
        }))
        onSelectionChange([], new Set())
        setLastSelectedIndex(null)
        setRenderingReceived(false)
      }
    }

    return () => (
      <tr className="bg-thead">
        <th data-capture-ignore className="px-2 sm:px-4">
          <Checkbox
            checked={selectedIds.size === filteredData.length && filteredData.length > 0}
            indeterminate={selectedIds.size > 0 && selectedIds.size < filteredData.length}
            onChange={(e) => {
              let newSelected
              if (e.target.checked) {
                // Select all currently VISIBLE items
                newSelected = new Set(filteredData.map((_, index) => index))
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
                className={`flex min-w-15 flex-col gap-1 font-bold ${
                  title === 'Proxy Status' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                }`}
              >
                <span
                  className={['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'}
                >
                  {header.replace(/_/g, ' ')}
                </span>
                {useFilter && (
                  <div className="relative">
                    {/* Operator icon */}
                    {showOperator && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="bg-border-input filter-operator fill-text-secondary absolute top-[-2px] right-[-6px] h-4 w-4 cursor-pointer rounded-full p-0.5 hover:brightness-(--highlight-brightness)"
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
  ])

  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      <div id="table-wrapper" className="mx-auto max-w-7xl px-4 py-3">
        <div
          id="table-container"
          ref={tableRef}
          className="bg-surface mx-auto w-full rounded-lg shadow-lg select-none"
        >
          {/* Table Header */}
          <div
            id="container-header"
            className="bg-thead top-0 z-30 rounded-t-lg border-b-[5px] border-[color-mix(in_srgb,var(--color-thead)_50%,white)] px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center text-lg font-semibold sm:text-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-7 w-7 shrink-0 fill-none stroke-current stroke-2 sm:h-10 sm:w-10"
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
                    Selected: <span id="selectedCount">{selectedIds.size}</span> rows
                  </span>
                  <span className="text-right whitespace-nowrap">
                    Total: <span id="totalCount">{filteredData.length}</span> rows
                  </span>
                </div>
                {extraBtn && <span data-capture-ignore>{extraBtn}</span>}
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="scroll-container overflow-x-auto overflow-y-hidden rounded-b-lg **:transition-colors!">
            <TableVirtuoso
              data={filteredData}
              useWindowScroll
              overscan={1000}
              context={virtuosoContext}
              components={VIRTUOSO_COMPONENTS}
              fixedHeaderContent={fixedHeader}
              itemContent={itemContent}
            />
          </div>
          {filteredData.length === 0 && emptyMessage}
        </div>
      </div>
    </div>
  )
})

export default Table
