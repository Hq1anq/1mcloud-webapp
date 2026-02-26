import { useState, useEffect, useRef } from 'react'

export default function DropDown({ options, value, onChange, className }) {
  const [open, setOpen] = useState(false)
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

  return (
    <div className="text-text-primary relative flex" ref={containerRef}>
      {/* Trigger */}
      <button
        className={`bg-dropdown flex w-full items-center justify-between border-0 px-3 py-2 focus:outline-none ${className || ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value}</span>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={`ml-2 size-4 ${open ? 'rotate-180' : ''}`}
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
        className={`scroll-container absolute top-full right-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border-0 shadow-lg ${open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-3 scale-95 opacity-0'}`}
      >
        {options.map((option) => (
          <div
            key={option}
            onClick={() => handleSelect(option)}
            className={`bg-dropdown cursor-pointer px-3 py-2 hover:brightness-125 ${option === value ? 'font-bold brightness-150' : ''}`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  )
}
