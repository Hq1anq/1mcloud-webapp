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
      return 'bg-bg-success text-text-success'
    case 'Off':
    case 'Inactive':
    case 'Stopped':
      return 'bg-bg-error text-text-error'
    case 'Paused':
      return 'bg-bg-warning text-text-warning'
    case 'Unknown':
      return 'bg-bg-unknowed text-text-unknowed'
    default:
      return ''
  }
}

export const extractIP = (line) => {
  // Looser regex: grab four groups of digits separated by dots
  const ipv4Candidate = line.match(/\d+\.\d+\.\d+\.\d+/)
  if (!ipv4Candidate) return null

  const ip = ipv4Candidate[0]

  // Validate each octet (0–255)
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  for (let part of parts) {
    const num = Number(part)
    if (num < 0 || num > 255) return null
  }

  return ip
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
export const randomDelay = () => delay(700 + Math.random() * 400)
