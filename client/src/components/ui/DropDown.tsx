import { useState, useEffect, useRef, ReactNode } from 'react'

export interface DropDownProps<T = any> {
  options: T[]
  value?: T | null
  onChange: (option: T) => void
  renderItem?: (option: T) => ReactNode
  isEqual?: (a: T, b: T) => boolean
  className?: string
  menuClassName?: string
}

export default function DropDown<T = any>({
  options = [],
  value,
  onChange,
  renderItem,
  isEqual = (a, b) => a === b,
  className = '',
  menuClassName = '',
}: DropDownProps<T>) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const matchBgColor = className.match(/\bbg-\S+/)
  const bgColorClass = matchBgColor ? matchBgColor[0] : null

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setDropUp(spaceBelow < 260 && spaceAbove > spaceBelow)
    }
    setOpen(!open)
  }

  const renderContent = (item: T | null | undefined) => {
    if (item === undefined || item === null) return null
    return renderItem ? renderItem(item) : (item as ReactNode)
  }

  return (
    <div className="text-text-primary relative flex" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        className={`${bgColorClass || 'bg-dropdown'} flex w-full items-center justify-between px-3 py-2 text-left focus:outline-none ${className}`}
        onClick={toggleDropdown}
      >
        <div className="min-w-0 flex-1 truncate">{renderContent(value)}</div>
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={`ml-2 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu */}
      <div
        className={`scroll-container absolute right-0 z-50 w-full rounded-lg shadow-lg transition-all ${
          dropUp ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'
        } ${menuClassName} ${
          open
            ? 'max-h-60 translate-y-0 scale-100 overflow-y-auto opacity-100'
            : `pointer-events-none max-h-0 scale-95 overflow-hidden opacity-0 ${dropUp ? 'translate-y-3' : '-translate-y-3'}`
        }`}
      >
        {options.map((option, idx) => {
          const selected = value !== undefined && value !== null && isEqual(option, value)
          return (
            <div
              key={idx}
              onClick={() => {
                setOpen(false)
                onChange(option)
              }}
              className={`${bgColorClass || 'bg-dropdown'} cursor-pointer px-3 py-2 transition-colors hover:brightness-125 ${
                selected ? 'text-highlight font-bold' : ''
              }`}
            >
              {renderContent(option)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
