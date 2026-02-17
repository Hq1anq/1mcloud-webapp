import { useEffect, useRef } from 'react'

export default function Checkbox({ checked, indeterminate, onChange }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className="inline-flex cursor-pointer items-center">
      {/* Hidden native checkbox */}
      <input
        ref={inputRef}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
      />

      {/* Custom box */}
      <span className="text-text-secondary border-border bg-checkbox peer-hover:border-border-checkbox-hover peer-checked:animate-jelly relative flex h-5 w-5 items-center justify-center rounded-sm border peer-checked:border-transparent peer-checked:bg-(--logo-ring) peer-hover:brightness-125 peer-focus-visible:ring-1 peer-indeterminate:[&_div]:scale-100 peer-indeterminate:[&_div]:opacity-100 peer-checked:[&_svg]:scale-100 peer-checked:[&_svg]:opacity-100">
        {/* Check mark icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="checkbox-transition absolute h-5 w-5 scale-0 opacity-0"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        {/* Indeterminate icon (Rounded Square) */}
        <div className="checkbox-transition h-2 w-2 scale-0 rounded-xs bg-current opacity-0" />
      </span>
    </label>
  )
}
