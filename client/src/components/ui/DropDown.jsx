import { useState, useEffect, useRef } from 'react'

export default function DropDown({
  options = [],
  value,
  onChange,
  className = '',
  menuClassName = '',
  renderItem,
}) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const containerRef = useRef(null)

  const matchBgColor = className.match(/\bbg-\S+/)
  const bgColorClass = matchBgColor ? matchBgColor[0] : null

  function handleClickOutside(event) {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option) => {
    setOpen(false)
    onChange(option)
  }

  const toggleDropdown = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const spaceBelow = windowHeight - rect.bottom
      const spaceAbove = rect.top

      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        setDropUp(true)
      } else {
        setDropUp(false)
      }
    }
    setOpen(!open)
  }

  // Find matching option object/value
  const currentOption =
    options.find((opt) => {
      if (opt === value) return true
      if (opt && typeof opt === 'object' && value && typeof value === 'object') {
        if (opt.id !== undefined && opt.id === value.id) return true
        if (opt.value !== undefined && opt.value === value.value) return true
        if (opt.license_key && opt.license_key === value.license_key) return true
      }
      return false
    }) || value

  const renderTriggerContent = () => {
    if (renderItem) return renderItem(currentOption)
    if (currentOption && typeof currentOption === 'object') {
      return currentOption.label !== undefined ? currentOption.label : currentOption.value
    }
    return currentOption
  }

  return (
    <div className="text-text-primary relative flex" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        className={`${bgColorClass ? bgColorClass : 'bg-dropdown'} flex w-full items-center justify-between border-0 px-3 py-2 text-left focus:outline-none ${className}`}
        onClick={toggleDropdown}
      >
        <div className="min-w-0 flex-1 truncate">{renderTriggerContent()}</div>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={`ml-2 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`scroll-container absolute right-0 z-50 w-full rounded-lg border-0 shadow-lg transition-all ${dropUp ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'} ${menuClassName} ${open ? 'max-h-60 translate-y-0 scale-100 overflow-y-auto opacity-100' : `pointer-events-none max-h-0 scale-95 overflow-hidden opacity-0 ${dropUp ? 'translate-y-3' : '-translate-y-3'}`}`}
      >
        {options.map((option, idx) => {
          const isSelected =
            option === currentOption ||
            (typeof option === 'object' &&
              typeof currentOption === 'object' &&
              (option.id === currentOption.id ||
                option.value === currentOption.value ||
                (option.license_key && option.license_key === currentOption.license_key)))

          const keyVal =
            typeof option === 'object' ? option.id || option.value || option.label || idx : option

          return (
            <div
              key={`${keyVal}-${idx}`}
              onClick={() => handleSelect(option)}
              className={`${bgColorClass ? bgColorClass : 'bg-dropdown'} cursor-pointer px-3 py-2 transition-colors hover:brightness-125 ${isSelected ? 'text-highlight font-bold' : ''}`}
            >
              {renderItem
                ? renderItem(option)
                : typeof option === 'object'
                  ? option.label !== undefined
                    ? option.label
                    : option.value
                  : option}
            </div>
          )
        })}
      </div>
    </div>
  )
}
