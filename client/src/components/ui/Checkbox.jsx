import { useEffect, useRef } from 'react'

export default function Checkbox({ checked, indeterminate, onChange }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate
    }
  }, [indeterminate])

  return (
    <label className="group inline-flex cursor-pointer items-center">
      {/* Hidden native checkbox */}
      <input
        ref={inputRef}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />

      {/* Custom box */}
      <span className="text-text-secondary checkbox-transition border-border bg-checkbox group-hover:border-border-checkbox-hover relative flex h-5 w-5 items-center justify-center overflow-visible rounded-md border group-hover:brightness-125 group-has-[input:checked]:bg-(--logo-ring)">
        {/* Check mark icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="checkbox-transition absolute h-5 w-5 scale-0 opacity-0 group-has-[input:checked]:scale-100 group-has-[input:checked]:opacity-100 group-has-[input:indeterminate]:scale-0 group-has-[input:indeterminate]:opacity-0"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        {/* Indeterminate icon (Rounded Square) */}
        <div className="pointer-events-none h-2 w-2 scale-0 rounded-[2px] bg-current opacity-0 transition-all duration-300 group-has-[input:indeterminate]:scale-100 group-has-[input:indeterminate]:opacity-100" />
      </span>
    </label>
  )
}
