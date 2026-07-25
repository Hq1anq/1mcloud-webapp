import { useState } from 'react'
import { maskProductKey, formatWindowsProductKey } from '../../utils/ui'

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
