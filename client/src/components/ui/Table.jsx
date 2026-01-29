import { useState, useEffect, useMemo } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { handleCopy, getStatusClasses } from '../../lib/utils.js'
import Checkbox from './Checkbox.jsx'

const DEFAULT_DATA = []

// Custom Row Component for TableVirtuoso
const TableRow = ({ context, ...props }) => {
  const { selectedIds, handleSelectRow } = context
  const index = props['data-index']
  const isSelected = selectedIds.has(index)

  return (
    <tr
      {...props}
      className={`hover:bg-bg-hover text-text-secondary ${isSelected ? 'bg-bg-selected' : ''} ${props.className || ''}`}
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
      <td className="border-border border-b px-2 py-2 text-center sm:px-4">
        <Checkbox checked={isSelected} onChange={(e) => handleSelectRow(index, e.shiftKey)} />
      </td>
      {headers.map((header) => {
        const cellValue = row[header]
        const statusClass = getStatusClasses(cellValue)

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
              <span className={`rounded-full px-2 py-0.5 font-semibold ${statusClass}`}>
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

export default function Table({
  data = DEFAULT_DATA,
  onSelectionChange,
  title,
  headers,
  extraBtn,
  emptyMessage,
  className,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null)
  const [lastSelectionAction, setLastSelectionAction] = useState('add') // 'add' or 'delete'

  function handleSelectAll(checked) {
    if (checked) {
      const allIds = new Set(data.map((_, index) => index))
      setSelectedIds(allIds)
    } else setSelectedIds(new Set())
  }

  function handleSelectRow(index, shiftKey) {
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

    setSelectedIds(newSelected)
  }

  const virtuosoContext = useMemo(() => {
    return { selectedIds, handleSelectRow, headers }
  }, [selectedIds, headers])

  const fixedHeader = useMemo(() => {
    return () => (
      <tr className="bg-thead">
        <th className="px-2 sm:px-4">
          <Checkbox
            checked={selectedIds.size === data.length && data.length > 0}
            indeterminate={selectedIds.size > 0 && selectedIds.size < data.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        </th>

        {headers.map((header) => (
          <th key={header} className="px-2 py-3 font-medium tracking-wider uppercase sm:px-4">
            <div
              className={`flex min-w-15 flex-col gap-1 font-bold ${
                title === 'Proxy Status' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              <span className={['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'}>
                {header}
              </span>
              {title === 'Proxy Manager' && (
                <div className="relative">
                  {/* Operator icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    data-operator="contain"
                    viewBox="0 0 640 640"
                    className="bg-border-input filter-operator fill-text-primary absolute top-[-2px] right-[-6px] h-4 w-4 cursor-pointer rounded-full p-0.5 hover:brightness-(--highlight-brightness)"
                  >
                    <path d="M136,128h216c105.9,0,192,86.1,192,192s-86.1,192-192,192H136c-22.1,0-40-17.9-40-40s17.9-40,40-40h216c61.8,0,112-50.2,112-112s-50.2-112-112-112H136c-22.1,0-40-17.9-40-40S113.9,128,136,128z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Filter"
                    className={`filter-input bg-dropdown mt-1 px-2 py-1 text-center ${
                      ['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'
                    }`}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    )
  }, [title, headers, selectedIds.size, data.length])

  useEffect(() => {
    if (!onSelectionChange) return
    const selectedRows = data.filter((_, index) => selectedIds.has(index))
    onSelectionChange(selectedRows)
  }, [selectedIds, data, onSelectionChange])

  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      <div id="table-wrapper" className="mx-auto max-w-7xl px-4 py-3">
        <div
          id="table-container"
          className="bg-surface mx-auto w-full rounded-lg shadow-lg select-none"
        >
          {/* Table Header */}
          <div
            id="container-header"
            className="bg-thead border-border-input top-0 z-30 rounded-t-lg border-b-[5px] px-4 py-3"
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
                    Selected: <span id="selectedCount">0</span> rows
                  </span>
                  <span className="text-right whitespace-nowrap">
                    Total: <span id="totalCount">0</span> rows
                  </span>
                </div>
                {extraBtn}
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="scroll-container overflow-x-auto overflow-y-hidden rounded-b-lg">
            <TableVirtuoso
              data={data}
              useWindowScroll
              overscan={1000}
              context={virtuosoContext}
              components={VIRTUOSO_COMPONENTS}
              fixedHeaderContent={fixedHeader}
              itemContent={itemContent}
            />
          </div>
          {data.length === 0 && emptyMessage}
        </div>
      </div>
    </div>
  )
}
