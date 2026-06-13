import { useState, useEffect, useRef } from 'react'

export default function DropDown({ options, value, onChange, className, menuClassName }) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const containerRef = useRef(null)

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

      // Dropdown max-height is 60 (15rem = 240px).
      // If space below is less than 260px and there's more space above, open upwards.
      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        setDropUp(true)
      } else {
        setDropUp(false)
      }
    }
    setOpen(!open)
  }

  return (
    <div className="text-text-primary relative flex" ref={containerRef}>
      {/* Trigger */}
      <button
        className={`bg-dropdown flex w-full items-center justify-between border-0 px-3 py-2 focus:outline-none ${className || ''}`}
        onClick={toggleDropdown}
      >
        <span>{value}</span>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={`ml-2 size-4 transition-transform ${open ? 'rotate-180' : ''}`}
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
        className={`scroll-container absolute right-0 z-50 w-full rounded-lg border-0 shadow-lg transition-all ${dropUp ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'} ${menuClassName || ''} ${open ? 'max-h-60 translate-y-0 scale-100 overflow-y-auto opacity-100' : `pointer-events-none max-h-0 scale-95 overflow-hidden opacity-0 ${dropUp ? 'translate-y-3' : '-translate-y-3'}`}`}
      >
        {options.map((option) => (
          <div
            key={option}
            onClick={() => handleSelect(option)}
            className={`bg-dropdown cursor-pointer px-3 py-2 hover:brightness-125 ${option === value ? 'text-highlight font-bold' : ''}`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  )
}
