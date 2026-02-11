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
