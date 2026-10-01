import type { ColumnDef } from '../types/table'
import { getFlagIcon } from '../data/flags.jsx'

// Nation flag helper
export function getNationFlag(nation: string): any {
  if (['GPU', 'EU'].includes(nation)) return nation
  return getFlagIcon(nation) || ''
}

// Core filter logic: check contain keyword
export function matchesFilter(cellValue: unknown, filterValue: string): boolean {
  if (cellValue === undefined || cellValue === null) return false
  const strCell = String(cellValue).toLowerCase()
  const strFilter = filterValue.toLowerCase().trim()
  return strCell.includes(strFilter)
}

/**
 * Filters `data` against `filters` map (Record<string, string>).
 * Evaluates keyword containment for each active filter across visible columns.
 * Uses `col.getValue` if defined on the column definition.
 */
export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: Record<string, string>,
  columns: ColumnDef<T>[]
): T[] {
  if (!data || data.length === 0) return data

  const columnMap = new Map(columns.map((c) => [c.key, c]))

  const activeFilters = Object.entries(filters)
    .map(([key, val]) => [key, (val ?? '').trim()] as const)
    .filter(([key, val]) => val.length > 0 && columnMap.has(key))

  if (activeFilters.length === 0) return data

  return data.filter((row) =>
    activeFilters.every(([key, filterVal]) => {
      const col = columnMap.get(key)
      const cellValue = col?.getValue ? col.getValue(row) : row[key]
      return matchesFilter(cellValue, filterVal)
    })
  )
}

/**
 * If the input string begins with a valid DDMM date format (e.g. "2809 long2 an1" or "1409"),
 * shifts the day by +1 (for 'up') or -1 (for 'down') while preserving the remainder of the text.
 * Returns null if the first 4 characters do not represent a valid DDMM date.
 */
export function shiftDDMM(inputValue: string, direction: 'up' | 'down'): string | null {
  if (!inputValue || inputValue.length < 4) return null
  const prefix = inputValue.slice(0, 4)
  if (!/^\d{4}$/.test(prefix)) return null

  const day = parseInt(prefix.slice(0, 2), 10)
  const month = parseInt(prefix.slice(2, 4), 10)

  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const currentYear = new Date().getFullYear()
  const d = new Date(currentYear, month - 1, day)
  if (d.getFullYear() !== currentYear || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null
  }

  d.setDate(d.getDate() + (direction === 'up' ? 1 : -1))

  const newDay = String(d.getDate()).padStart(2, '0')
  const newMonth = String(d.getMonth() + 1).padStart(2, '0')

  return `${newDay}${newMonth}${inputValue.slice(4)}`
}