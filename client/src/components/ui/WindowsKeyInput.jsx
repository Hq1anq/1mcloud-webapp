import { useState } from 'react'

export const formatWindowsProductKey = (val) => {
  if (!val) return ''
  const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const groups = []
  for (let i = 0; i < cleaned.length && i < 25; i += 5) {
    groups.push(cleaned.slice(i, i + 5))
  }
  return groups.join('-')
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

export default function WindowsKeyInput({ value, onChange, className, ...props }) {
  const [focused, setFocused] = useState(false)
  const displayValue = focused ? value : maskProductKey(value)

  const handleChange = (e) => {
    const formatted = formatWindowsProductKey(e.target.value)
    e.target.value = formatted
    if (onChange) {
      onChange(e)
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={handleChange}
      placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
      className={className}
      {...props}
    />
  )
}
