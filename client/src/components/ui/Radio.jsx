export default function Radio({ checked, onChange, disabled, className = '' }) {
  return (
    <label
      className={`relative inline-flex items-center justify-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* Hidden native radio */}
      <input
        type="radio"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />

      {/* Custom radio indicator */}
      {disabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto size-5"
        >
          <circle className="fill-text-muted text-text-muted" cx="12" cy="12" r="11" />
          <line className="text-thead" x1="5.93" y1="5.93" x2="18.07" y2="18.07" />
        </svg>
      ) : (
        <span
          className={`border-text-muted peer-hover:border-blue group-hover:border-blue relative flex size-5 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
            checked ? 'bg-blue border-none' : ''
          }`}
        >
          {/* Inner circle dot */}
          <span
            className={`size-2.5 rounded-full bg-white transition-[scale] duration-300 ${
              checked ? 'scale-100' : 'scale-0'
            }`}
          />
        </span>
      )}
    </label>
  )
}
