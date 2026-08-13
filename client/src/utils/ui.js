import { parseDDMMYYYY } from './data'

export const handleCopy = (e, text) => {
  e.stopPropagation() // Prevent event bubbling to its parent (<tr>)
  navigator.clipboard.writeText(text).catch((err) => {
    console.error('Failed to copy: ', err)
  })
}

export const getStatusClasses = (status) => {
  switch (status) {
    case 'Running':
    case 'Active':
      return 'bg-status-green/20 border border-status-green/30 text-status-green'
    case 'Off':
    case 'Inactive':
    case 'Stopped':
      return 'bg-status-red/20 border border-status-red/30 text-status-red'
    case 'Paused':
      return 'bg-status-yellow/20 border border-status-yellow/30 text-status-yellow'
    case 'Refunded':
      return 'bg-status-gray/20 border border-status-gray/30 text-status-gray'
    case 'Unknown':
      return 'bg-purple/20 border border-purple/30 text-purple'
    default:
      return ''
  }
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
export const randomDelay = () => delay(700 + Math.random() * 400)

/**
 * Returns an inline style with a `color-mix()` background that scales linearly
 * by urgency. Each step adds 10-12 percentage points of the base expiry color.
 */
export function getExpiryStyle(expiredStr) {
  const expiry = parseDDMMYYYY(expiredStr)
  if (!expiry) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = Math.round((expiry - today) / msPerDay)

  if (daysLeft < 1) {
    return {
      backgroundColor:
        'color-mix(in srgb, color-mix(in srgb, var(--purple) 30%, var(--red)) 40%, transparent)',
    }
  }

  let pct = null
  if (daysLeft === 1) pct = 35
  else if (daysLeft === 2) pct = 25
  else if (daysLeft === 3) pct = 15

  if (pct === null) return null
  return {
    backgroundColor: `color-mix(in srgb, var(--red) ${pct}%, transparent)`,
  }
}

export const maskProductKey = (key) => {
  if (!key) return ''
  const cleaned = key.trim().toUpperCase()
  const pattern = /^([A-Z0-9]{5})-([A-Z0-9]{5})-([A-Z0-9]{5})-([A-Z0-9]{5})-([A-Z0-9]{5})$/
  if (pattern.test(cleaned)) {
    return cleaned.replace(pattern, '$1-•••••-•••••-•••••-$5')
  }
  return key
}

export const formatWindowsProductKey = (val) => {
  if (!val) return ''
  const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const groups = []
  for (let i = 0; i < cleaned.length && i < 25; i += 5) {
    groups.push(cleaned.slice(i, i + 5))
  }
  return groups.join('-')
}

export const isValidLicense = (licenseKey) =>
  /^[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}$/.test(licenseKey)
