/* eslint-disable react-refresh/only-export-components */
import { handleCopy, getStatusClasses } from '../../../lib/utils.js'
import { getNationFlag } from './filterUtils.jsx'
import Checkbox from '../Checkbox.jsx'
import RenewToggle from '../RenewToggle.jsx'

const TableRow = ({ context, ...props }) => {
  const { selectable, selectedIds, handleSelectRow, rowClassMap } = context
  const index = props['data-index']
  const row = props.item

  const isSelected = selectable && selectedIds.has(index)
  const overrideClass = row && rowClassMap?.[row.sid]
  const isRefunded = row?.status?.toLowerCase() === 'refunded'

  return (
    <tr
      {...props}
      className={`${isRefunded ? 'cursor-not-allowed opacity-50 select-none' : 'hover:bg-bg-hover'} ${isSelected ? 'bg-bg-selected' : overrideClass || ''} ${props.className || ''}`}
      onClick={(e) => {
        if (isRefunded || !selectable) return
        if (e.target.closest('input') || e.target.closest('button') || e.target.closest('label'))
          return
        handleSelectRow(index, e.shiftKey)
        if (props.onClick) props.onClick(e)
      }}
    />
  )
}

const TableComponent = (props) => <table {...props} className="w-full" />

export const VIRTUOSO_COMPONENTS = {
  TableRow,
  Table: TableComponent,
}

// ── Cell renderer for TableVirtuoso ───────────────────────────────────────
export const itemContent = (index, row, context) => {
  const {
    selectable,
    selectedIds,
    handleSelectRow,
    headers,
    showCountryCode,
    onAutoRenewToggle,
    controlButton,
  } = context

  const isSelected = selectable && selectedIds?.has(index)
  const isRefunded = row?.status?.toLowerCase() === 'refunded'

  return (
    <>
      {selectable && (
        <td data-capture-ignore className="border-border border-b p-2 text-center sm:px-4">
          <Checkbox
            checked={isSelected}
            onChange={(e) => handleSelectRow(index, e.shiftKey)}
            disabled={isRefunded}
          />
        </td>
      )}

      {headers.map((header) => {
        const cellValue = row[header]
        const statusClass = header === 'status' ? getStatusClasses(cellValue) : ''
        const nationFlag = header === 'country' && !showCountryCode ? getNationFlag(cellValue) : ''

        return (
          <td
            key={header}
            className={`border-border border-b px-2 whitespace-nowrap sm:px-4 ${
              [
                'ip_port',
                'note',
                'ip',
                'old_ip',
                'new_ip',
                'description',
                'update_balance',
              ].includes(header)
                ? 'text-left'
                : 'text-center'
            } ${nationFlag ? '' : 'py-2'}`}
            onClick={(e) => {
              if (e.detail === 3) handleCopy(e, cellValue)
            }}
            title="Triple click to copy"
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
            ) : header === 'trans_type' ? (
              <span
                className={
                  cellValue === 'BUY' ? 'text-green' : cellValue === 'REFUND' ? 'text-red' : ''
                }
              >
                {cellValue}
              </span>
            ) : header === 'amount' ? (
              <span
                className={
                  cellValue.startsWith('-') ? 'text-red' : cellValue === '0' ? '' : 'text-green'
                }
              >
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
