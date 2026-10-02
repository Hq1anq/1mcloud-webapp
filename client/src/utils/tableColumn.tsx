import React from 'react'
import { getNationFlag } from './tableFilter.js'
import RenewToggle from '../components/ui/RenewToggle'
import { getStatusClasses } from './ui.js'
import { useTableContext } from '../components/ui/Table/TableContext.js'
import type { ColumnDef } from '../types/table.js'
import { ProductAction } from '../types/action.js'

export function DefaultHeader({
  headerKey,
  title,
}: {
  headerKey: string
  title?: string | React.ReactNode
}): React.ReactElement {
  const { t } = useTableContext()
  if (title) {
    return <>{title}</>
  }
  const translated = t('table.' + headerKey)
  return <span>{translated || headerKey.replace(/_/g, ' ')}</span>
}

export function CountryHeader(): React.ReactElement {
  const { showCountryCode, onToggleCountryCode, t } = useTableContext()
  return (
    <div
      className="group inline-flex cursor-pointer items-center justify-center gap-1"
      onClick={onToggleCountryCode}
      title="Toggle country display (Flag / Code)"
    >
      <span>{t('table.country') || 'Country'}</span>
      {!showCountryCode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="text-text-muted group-hover:text-text-primary size-3 shrink-0 fill-current"
        >
          <path d="M144 88C144 74.7 133.3 64 120 64C106.7 64 96 74.7 96 88L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 452L224.3 431.9C265.4 421.6 308.9 426.4 346.8 445.3C391 467.4 442.3 470.1 488.5 452.7L523.2 439.7C535.7 435 544 423.1 544 409.7L544 130C544 107 519.8 92 499.2 102.3L489.6 107.1C443.3 130.3 388.8 130.3 342.5 107.1C307.4 89.5 267.1 85.1 229 94.6L144 116L144 88zM144 165.5L240.6 141.3C267.6 134.6 296.1 137.7 321 150.1C375.9 177.5 439.7 179.8 496 156.9L496 398.7L471.6 407.8C437.9 420.4 400.4 418.5 368.2 402.4C320 378.3 264.9 372.3 212.6 385.3L144 402.5L144 165.5z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="text-text-muted group-hover:text-text-primary size-3 shrink-0 fill-current"
        >
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
        </svg>
      )}
    </div>
  )
}

export function CountryCell({ country }: { country?: string }): React.ReactElement {
  const { showCountryCode } = useTableContext()
  if (!showCountryCode && country) {
    const flag = getNationFlag(country)
    if (flag) {
      return <div className="mx-auto grid size-10 place-items-center">{flag}</div>
    }
  }
  return <span>{country || ''}</span>
}

export function createCountryColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'country',
    align: 'center',
    filterable: true,
    renderHeader: () => <CountryHeader />,
    renderCell: (row) => <CountryCell country={row.country} />,
  }
}

export function createStatusColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'status',
    align: 'center',
    filterable: true,
    renderHeader: () => <DefaultHeader headerKey="status" />,
    renderCell: (row) => {
      const statusClass = getStatusClasses(row.status)
      if (statusClass) {
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${statusClass}`}>
            <span className="mr-2 size-2 rounded-full bg-current" />
            {row.status}
          </span>
        )
      }
      return <span>{row.status}</span>
    },
  }
}

export function createRenewToggleColumn<T extends Record<string, any>>(
  onAutoRenewToggle?: (sid: number | string, newState: boolean) => void
): ColumnDef<T> {
  return {
    key: 'is_auto_renew',
    align: 'center',
    filterable: false,
    renderHeader: () => <DefaultHeader headerKey="is_auto_renew" />,
    renderCell: (row) => (
      <RenewToggle
        isOn={Boolean(row.is_auto_renew)}
        onConfirm={(newState: boolean) => onAutoRenewToggle?.(row.sid, newState)}
      />
    ),
  }
}

export function createControlColumn<T extends Record<string, any>>(
  controlButton: (row: T) => React.ReactNode
): ColumnDef<T> {
  return {
    key: 'control',
    align: 'center',
    filterable: false,
    renderHeader: () => <DefaultHeader headerKey="control" />,
    renderCell: (row) => controlButton(row),
  }
}

export function createAmountColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'amount',
    align: 'center',
    filterable: true,
    renderHeader: () => <DefaultHeader headerKey="amount" />,
    renderCell: (row) => {
      const cellValue = row.amount
      const isNegative = String(cellValue ?? '').startsWith('-')
      const isZero = cellValue === '0' || cellValue === 0
      return <span className={isNegative ? 'text-red' : isZero ? '' : 'text-green'}>{cellValue}</span>
    },
  }
}

export function createTransTypeColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'trans_type',
    align: 'center',
    filterable: true,
    renderHeader: () => <DefaultHeader headerKey="trans_type" />,
    renderCell: (row) => (
      <span className={row.trans_type === 'BUY' ? 'text-green' : row.trans_type === 'REFUND' ? 'text-red' : ''}>
        {row.trans_type}
      </span>
    ),
  }
}

export interface TextColumnOptions<T> {
  key: string
  header?: string | React.ReactNode
  align?: 'left' | 'center' | 'right'
  filterable?: boolean
  renderCell?: (row: T, index: number) => React.ReactNode
  renderHeader?: () => React.ReactNode
}

export function createTextColumn<T extends Record<string, any>>({
  key,
  header,
  align = 'center',
  filterable = true,
  renderCell = (row: T) => <span>{row[key]}</span>,
  renderHeader = () => <DefaultHeader headerKey={key} title={header} />,
}: TextColumnOptions<T>): ColumnDef<T> {
  return {
    key,
    align,
    filterable,
    renderCell,
    renderHeader,
  }
}

export function createAuthColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'auth',
    align: 'left',
    filterable: true,
    getValue: (row) => row.user_pass,
    renderHeader: () => <DefaultHeader headerKey="auth" />,
    renderCell: (row) => (
      <span className="font-mono text-xs select-all sm:text-sm">
        {row.user_pass || '-'}
      </span>
    ),
  }
}

export function createIpChangedColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'ip_changed',
    align: 'center',
    filterable: true,
    renderHeader: () => <DefaultHeader headerKey="ip_changed" />,
    renderCell: (row) => <span>{row.ip_changed ?? 0}</span>,
  }
}

export function getActionTextColor(action?: string): string {
  switch (action) {
    case ProductAction.CREATE:
      return 'text-emerald-400'
    case ProductAction.REINSTALL:
      return 'text-sky-400'
    case ProductAction.CHANGE_IP:
      return 'text-purple-400'
    case ProductAction.REBOOT:
      return 'text-amber-400'
    case ProductAction.PAUSE:
      return 'text-red-400'
    case ProductAction.RENEW:
      return 'text-teal-400'
    case ProductAction.REFUND:
      return 'text-slate-400'
    default:
      return 'text-text-primary'
  }
}

export function formatActionTime(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return ''
  const d = new Date(isoOrDateStr)
  if (isNaN(d.getTime())) return isoOrDateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${day}-${month} ${hours}:${minutes}:${seconds}`
}

export function createDetailColumn<T extends Record<string, any>>(): ColumnDef<T> {
  return {
    key: 'detail',
    align: 'center',
    filterable: true,
    getValue: (row) => `${row.last_action} ${formatActionTime(row.last_action_time)}`,
    renderHeader: () => <DefaultHeader headerKey="detail" />,
    renderCell: (row) => (
      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
        <span className={`font-semibold tracking-wide ${getActionTextColor(row.last_action)}`}>
          {row.last_action}
        </span>
        <span className="font-mono text-xs sm:text-sm">
          {formatActionTime(row.last_action_time)}
        </span>
      </div>
    ),
  }
}


