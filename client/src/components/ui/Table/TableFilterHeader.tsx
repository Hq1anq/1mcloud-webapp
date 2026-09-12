import React from 'react'
import Checkbox from '../Checkbox.jsx'
import { shiftDDMM } from '../../../utils/tableFilter.js'
import { useTableContext } from './TableContext'

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
        const textAlignClass =
          col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'

        return (
          <th key={header} className="px-2 py-3 font-medium tracking-wider uppercase sm:px-4">
            <div
              className={`flex min-w-15 flex-col gap-1 font-bold whitespace-nowrap ${
                tableTitle === 'Proxy Status' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              {/* Column label */}
              <span className={textAlignClass}>{col.renderHeader()}</span>

              {/* Filter input */}
              {useFilter && isFilterable && (
                <div className="relative">
                  <input
                    type="text"
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
