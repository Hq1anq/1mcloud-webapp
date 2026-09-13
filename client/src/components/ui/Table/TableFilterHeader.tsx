import React from 'react'
import Checkbox from '../Checkbox.jsx'
import { shiftDDMM } from '../../../utils/tableFilter.js'
import { useTableContext } from './TableContext'
import type { SortDirection } from '../../../types/table'

interface SortIconProps {
  direction: SortDirection
}

function SortIcon({ direction }: SortIconProps): React.ReactElement {
  if (direction === 'asc') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
        className="size-3.5 shrink-0 fill-current text-highlight"
        aria-hidden="true"
      >
        <path d="M278.6 438.6L182.6 534.6C170.1 547.1 149.8 547.1 137.3 534.6L41.3 438.6C28.8 426.1 28.8 405.8 41.3 393.3C53.8 380.8 74.1 380.8 86.6 393.3L128 434.7L128 128C128 110.3 142.3 96 160 96C177.7 96 192 110.3 192 128L192 434.7L233.4 393.3C245.9 380.8 266.2 380.8 278.7 393.3C291.2 405.8 291.2 426.1 278.7 438.6zM352 544C334.3 544 320 529.7 320 512C320 494.3 334.3 480 352 480L384 480C401.7 480 416 494.3 416 512C416 529.7 401.7 544 384 544L352 544zM352 416C334.3 416 320 401.7 320 384C320 366.3 334.3 352 352 352L448 352C465.7 352 480 366.3 480 384C480 401.7 465.7 416 448 416L352 416zM352 288C334.3 288 320 273.7 320 256C320 238.3 334.3 224 352 224L512 224C529.7 224 544 238.3 544 256C544 273.7 529.7 288 512 288L352 288zM352 160C334.3 160 320 145.7 320 128C320 110.3 334.3 96 352 96L576 96C593.7 96 608 110.3 608 128C608 145.7 593.7 160 576 160L352 160z" />
      </svg>
    )
  }

  if (direction === 'desc') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
        className="size-3.5 shrink-0 fill-current text-highlight"
        aria-hidden="true"
      >
        <path d="M182.6 105.4C170.1 92.9 149.8 92.9 137.3 105.4L41.3 201.4C28.8 213.9 28.8 234.2 41.3 246.7C53.8 259.2 74.1 259.2 86.6 246.7L128 205.3L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 205.3L233.4 246.7C245.9 259.2 266.2 259.2 278.7 246.7C291.2 234.2 291.2 213.9 278.7 201.4L182.7 105.4zM352 544L384 544C401.7 544 416 529.7 416 512C416 494.3 401.7 480 384 480L352 480C334.3 480 320 494.3 320 512C320 529.7 334.3 544 352 544zM352 416L448 416C465.7 416 480 401.7 480 384C480 366.3 465.7 352 448 352L352 352C334.3 352 320 366.3 320 384C320 401.7 334.3 416 352 416zM352 288L512 288C529.7 288 544 273.7 544 256C544 238.3 529.7 224 512 224L352 224C334.3 224 320 238.3 320 256C320 273.7 334.3 288 352 288zM352 160L576 160C593.7 160 608 145.7 608 128C608 110.3 593.7 96 576 96L352 96C334.3 96 320 110.3 320 128C320 145.7 334.3 160 352 160z" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
      className="size-3.5 shrink-0 fill-current text-text-muted opacity-40 group-hover:opacity-80 transition-opacity"
      aria-hidden="true"
    >
      <path d="M18.377 183.305C31.968 195.766 52.173 193.785 63.595 181.332L96 145.938V447.969C96 465.672 110.328 480 128 480S160 465.672 160 447.969V145.938L192.404 181.332C204.357 194.344 224.607 195.25 237.623 183.305C250.652 171.352 251.527 151.086 239.591 138.039L151.593 41.945C139.468 28.684 116.531 28.684 104.406 41.945L16.408 138.039C4.472 151.086 5.347 171.352 18.377 183.305ZM210.377 328.695C197.347 340.648 196.472 360.914 208.408 373.961L296.406 470.055C308.531 483.312 331.468 483.312 343.593 470.055L431.591 373.961C443.527 360.914 442.652 340.648 429.623 328.695C416.031 316.234 395.826 318.211 384.404 330.664L352 366.062V64.031C352 46.328 337.671 32 320 32S288 46.328 288 64.031V366.063L255.595 330.664C243.642 317.656 223.392 316.75 210.377 328.695Z" />
    </svg>
  )
}

function getSortTooltip(t: (key: string) => string, direction: SortDirection): string {
  if (direction === 'none') {
    return t('table.sort_none')
  }
  if (direction === 'asc') {
    return t('table.sort_asc')
  }
  return t('table.sort_desc')
}

// Fixed header + per-column filter inputs consuming TableContext
export default function TableFilterHeader(): React.ReactElement {
  const {
    columns,
    tableTitle,
    useFilter,
    selectable,
    filters,
    filterInputs,
    onFilterInputChange,
    onFilterKeyDown,
    onFilterApply,
    sortConfig,
    onToggleSort,
    isAllSelected,
    isIndeterminate,
    onSelectAll,
    t,
  } = useTableContext()

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    header: string,
    currentValue: string
  ) => {
    if (header === 'note' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      const shifted = shiftDDMM(currentValue, e.key === 'ArrowUp' ? 'up' : 'down')
      if (shifted !== null) {
        e.preventDefault()
        onFilterInputChange(header, shifted)
        onFilterApply(header, shifted)

        const target = e.currentTarget
        const start = target.selectionStart
        const end = target.selectionEnd
        if (start !== null && end !== null) {
          requestAnimationFrame(() => {
            target.setSelectionRange(start, end)
          })
        }
        return
      }
    }

    onFilterKeyDown(e, header)
  }

  return (
    <tr className="bg-thead border-wrapper border-t-4 border-b-2">
      {/* Select-all checkbox */}
      {selectable && (
        <th data-capture-ignore className="px-2 sm:px-4">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            disabled={false}
            onChange={onSelectAll}
          />
        </th>
      )}

      {columns.map((col) => {
        const header = col.key
        const currentFilter = filters[header] || ''
        const inputValue = filterInputs[header] !== undefined ? filterInputs[header] : currentFilter
        const isFilterable = col.filterable !== false
        const isSortable = col.sortable === true
        const isSorted = sortConfig.columnKey === header && sortConfig.direction !== 'none'
        const currentDirection: SortDirection =
          sortConfig.columnKey === header ? sortConfig.direction : 'none'
        const textAlignClass =
          col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'
        const justifyClass =
          col.align === 'left' ? 'justify-start' : col.align === 'right' ? 'justify-end' : 'justify-center'

        return (
          <th key={header} className="px-2 py-3 font-medium tracking-wider uppercase sm:px-4">
            <div
              className={`flex min-w-15 flex-col gap-1 font-bold whitespace-nowrap ${
                tableTitle === 'Proxy Status' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              {/* Column label */}
              {isSortable ? (
                <span
                  role="button"
                  tabIndex={0}
                  className={`group flex items-center ${justifyClass} gap-1.5 cursor-pointer select-none transition-colors hover:text-highlight ${
                    isSorted ? 'text-highlight' : ''
                  }`}
                  onClick={() => onToggleSort(header)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onToggleSort(header)
                    }
                  }}
                  title={getSortTooltip(t, currentDirection)}
                >
                  <span className={textAlignClass}>{col.renderHeader()}</span>
                  <SortIcon direction={currentDirection} />
                </span>
              ) : (
                <span className={textAlignClass}>{col.renderHeader()}</span>
              )}

              {/* Filter input */}
              {useFilter && isFilterable && (
                <div className="relative">
                  <input
                    type="text"
                    enterKeyHint="search"
                    placeholder={t('filter')}
                    className={`filter-input bg-dropdown mt-1 w-full px-2 py-1 ${textAlignClass}`}
                    value={inputValue}
                    onChange={(e) => onFilterInputChange(header, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, header, inputValue)}
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
