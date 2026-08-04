/**
 * NumberStepper — reusable quantity input with − / + control buttons.
 *
 * Props:
 *   value     – controlled number value
 *   onChange  – (newValue: number) => void
 *   min       – minimum allowed value (default 1)
 *   max       – maximum allowed value (default 999)
 *   className – extra classes on the wrapper div
 */
export default function NumberStepper({ value, onChange, min = 1, max = 999, className = '' }) {
  const clamp = (v) => Math.max(min, Math.min(max, v))

  const decrement = () => onChange(clamp(Number(value) - 1))
  const increment = () => onChange(clamp(Number(value) + 1))

  const handleInput = (e) => {
    const parsed = parseInt(e.target.value, 10)
    if (!isNaN(parsed)) onChange(clamp(parsed))
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={Number(value) <= min}
        className="enabled:hover:bg-border/20 flex size-9 shrink-0 items-center justify-center rounded-lg text-base font-bold transition-colors disabled:opacity-40"
        aria-label="Decrease"
      >
        −
      </button>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInput}
        className="max-w-16 text-center font-bold"
      />

      <button
        type="button"
        onClick={increment}
        disabled={Number(value) >= max}
        className="enabled:hover:bg-border/20 flex size-9 shrink-0 items-center justify-center rounded-lg text-base font-bold transition-colors disabled:opacity-40"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}
