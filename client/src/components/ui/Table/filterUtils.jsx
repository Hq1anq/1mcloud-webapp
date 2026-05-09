import { getFlagIcon } from '../../../data/flags.jsx'
import { str2date } from '../../../lib/utils.js'

// Operator icon SVG paths
export const operatorIcons = {
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

export const operatorCycle = ['greater-equal', 'less-equal', 'equal', 'contain']

// Nation flag helper
export function getNationFlag(nation) {
  if (['GPU', 'EU'].includes(nation)) return nation
  return getFlagIcon(nation) || ''
}

// Core filter logic
function matchesFilter(cellValue, filterValue, operator) {
  // Date comparison
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
        default:
          return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
      }
    }
  } catch {
    /* Fallback below */
  }

  // Numeric comparison
  const numCell = parseFloat(cellValue)
  const numFilter = parseFloat(filterValue)
  const isNumeric =
    !isNaN(numCell) && isFinite(cellValue) && !isNaN(numFilter) && isFinite(filterValue)

  if (isNumeric) {
    switch (operator) {
      case 'greater-equal':
        return numCell >= numFilter
      case 'less-equal':
        return numCell <= numFilter
      case 'equal':
        return numCell === numFilter
      default:
        return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
    }
  }

  // String comparison
  const strCell = String(cellValue ?? '').toLowerCase()
  const strFilter = String(filterValue).toLowerCase()
  switch (operator) {
    case 'equal':
      return strCell === strFilter
    default:
      return strCell.includes(strFilter)
  }
}

/**
 * Filters `data` against `filters` map.
 * Returns the same array reference if nothing is active (avoids re-render).
 */
export function applyFilters(data, filters) {
  const hasActiveFilters = Object.values(filters).some((f) => f.value)
  if (!hasActiveFilters) return data

  return data.filter((row) =>
    Object.entries(filters).every(([key, filter]) => {
      if (!filter.value) return true
      return matchesFilter(row[key], filter.value, filter.operator || 'contain')
    })
  )
}
