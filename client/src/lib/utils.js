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
    case 'Unknown':
      return 'bg-status-gray/20 border border-status-gray/30 text-status-gray'
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

// Proxy parser
// Supports: ip:port:user:pass | user:pass@ip:port
export const parseProxy = (raw) => {
  const line = raw.trim()
  if (!line) return null

  let ip, port, username, password

  if (line.includes('@')) {
    // user:pass@ip:port
    const [auth, hostPart] = line.split('@')
    ;[username, password] = auth.split(':')
    ;[ip, port] = hostPart.split(':')
  } else {
    const parts = line.split(':')
    if (parts.length === 4) [ip, port, username, password] = parts
    else if (parts.length === 2) [ip, port] = parts
    else if (parts.length === 1) [ip] = parts
    else return null
  }

  if (!ip) return null
  if (!username || !password) return `${ip}${port ? `:${port}` : ''}`
  return `${ip}:${port}:${username}:${password}`
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
export const randomDelay = () => delay(700 + Math.random() * 400)

export function str2date(str) {
  const [d, m, y] = str.split('-')
  return new Date(y, m - 1, d)
}
