import React from 'react'
import Checkbox from '../Checkbox.jsx'
import { handleCopy } from '../../../utils/ui'
import type { TableCellsProps } from '../../../types/table.js'

export default function TableCells<T extends Record<string, any>>({
  row,
  index,
  context,
}: TableCellsProps<T>): React.ReactElement {
  const {
    selectable,
    selectedIds,
    handleSelectRow,
    getRowKey,
    columns,
    isRowSelectable,
  } = context

  const key = getRowKey(row, index)
  const isSelected = Boolean(selectable && selectedIds.has(key))
  const canSelect = isRowSelectable(row)

  return (
    <>
      {selectable && (
        <td data-capture-ignore className="border-border border-b p-2 text-center sm:px-4">
          <Checkbox
            checked={isSelected}
            indeterminate={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSelectRow(index, (e.nativeEvent as MouseEvent).shiftKey || false, row)
            }
            disabled={!canSelect}
          />
        </td>
      )}

      {columns.map((col) => {
        const cellValue = row[col.key]
        const alignClass =
          col.align === 'left' ? 'text-left' : col.align === 'right' ? 'text-right' : 'text-center'

        return (
          <td
            key={col.key}
            className={`border-border border-b px-2 py-2 whitespace-nowrap sm:px-4 ${alignClass}`}
            onClick={(e) => {
              if (e.detail === 3) handleCopy(e, cellValue)
            }}
            title="Triple click to copy"
          >
            {col.renderCell(row, index)}
          </td>
        )
      })}
    </>
  )
}
