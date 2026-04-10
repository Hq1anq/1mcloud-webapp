import { useEffect, useRef } from 'react'

export default function Checkbox({ checked, indeterminate, onChange, disabled }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      {/* Hidden native checkbox */}
      <input
        ref={inputRef}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />

      {/* Custom box */}
      <span className="border-border bg-checkbox peer-hover:border-primary peer-checked:animate-jelly relative flex size-5 items-center justify-center rounded-sm border text-(--bg-checkmark) peer-checked:border-transparent peer-checked:bg-(--bg-oncheck) peer-hover:brightness-125 peer-focus-visible:ring-1 peer-indeterminate:[&_div]:scale-100 peer-indeterminate:[&_div]:opacity-100 peer-checked:[&_svg]:scale-100 peer-checked:[&_svg]:opacity-100 peer-disabled:peer-hover:border-border peer-disabled:peer-hover:brightness-100">
        {/* Check mark icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="checkbox-transition absolute size-5 scale-0 opacity-0"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        {/* Indeterminate icon (Rounded Square) */}
        <div className="checkbox-transition size-2 scale-0 rounded-xs bg-current opacity-0" />
      </span>
    </label>
  )
}
