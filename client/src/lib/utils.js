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

export function formatInputDate(inputValue) {
  const filterVal = inputValue.trim()
  const now = new Date()
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
  const currentYear = String(now.getFullYear())

  if (filterVal.length <= 2) {
    const day = filterVal.padStart(2, '0')
    return `${day}-${currentMonth}-${currentYear}`
  } else if (filterVal.length <= 4) {
    const day = filterVal.slice(0, 2).padStart(2, '0')
    const month = filterVal.slice(2).padStart(2, '0')
    return `${day}-${month}-${currentYear}`
  } else if (filterVal.length <= 6) {
    const day = filterVal.slice(0, 2)
    const month = filterVal.slice(2, 4)
    const year = filterVal.slice(4).padStart(2, '0')
    return `${day}-${month}-20${year}`
  } else if (filterVal.length <= 8) {
    const day = filterVal.slice(0, 2)
    const month = filterVal.slice(2, 4)
    const year = filterVal.slice(4)
    return `${day}-${month}-${year}`
  }
}

export function mergeVpsData(data, res) {
  const dataMap = new Map(data.map((row) => [row.sid, row]))

  for (const resRow of res) {
    const existingRow = dataMap.get(resRow.sid)

    // Priority: 1. resRow.user_pass, 2. existingRow.user_pass
    let userPass = resRow.user_pass !== undefined ? resRow.user_pass : existingRow?.user_pass

    // Add default user if missing based on OS
    if (!userPass || !userPass.includes('/')) {
      const os = resRow.he_dieu_hanh || existingRow?.he_dieu_hanh || ''
      const defaultUser = os.toLowerCase().includes('ubuntu')
        ? 'root'
        : os.toLowerCase().includes('win')
          ? 'Administrator'
          : ''
      if (defaultUser) {
        userPass = `${defaultUser}/`
      }
    }

    if (existingRow) {
      // Update all columns from res, but keep user_pass based on priority above
      Object.assign(existingRow, resRow)
      if (userPass !== undefined) {
        existingRow.user_pass = userPass
      }
    } else {
      // New row from res — add to data
      const newRow = { ...resRow }
      if (userPass !== undefined) newRow.user_pass = userPass
      dataMap.set(resRow.sid, newRow)
    }
  }

  return Array.from(dataMap.values())
}

export function mergeProxyData(data, res) {
  const dataMap = new Map(data.map((row) => [row.sid, row]))

  for (const resRow of res) {
    const existingRow = dataMap.get(resRow.sid)
    if (existingRow) {
      // Priority: 1. resRow.user_pass, 2. existingRow.user_pass
      const finalUserPass =
        resRow.user_pass !== undefined ? resRow.user_pass : existingRow.user_pass
      Object.assign(existingRow, resRow)
      if (finalUserPass !== undefined) {
        existingRow.user_pass = finalUserPass
      }
    } else {
      // New row from res — add to data
      dataMap.set(resRow.sid, { ...resRow })
    }
  }

  return Array.from(dataMap.values())
}
