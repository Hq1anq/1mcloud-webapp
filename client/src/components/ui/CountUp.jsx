import { useCountUp } from '../../hooks/useCountUp'

/**
 * Renders a smoothly animated number counter.
 *
 * Pass a raw **integer** as `value`; supply an optional `format` function to
 * convert the animated float to your desired display string on every tick.
 *
 * Examples:
 *   // Plain integer (rounds automatically)
 *   <CountUp value={245000} className="font-bold" />
 *   → "245000"
 *
 *   // Custom VND formatter (dots as thousands separator)
 *   <CountUp value={245000} format={(n) => Math.round(n).toLocaleString('vi-VN')} />
 *   → "245.000"
 *
 *   // Count-up from 0 on mount (default initial value is 0)
 *   <CountUp value={productCount} from={0} />
 *
 * Props:
 *   value     {number}    Target integer to animate toward.
 *   from      {number}    Override the starting value (default: same as value — snaps immediately on mount; use 0 for count-up from zero).
 *   format    {Function}  (n: number) => string — called every frame with the current animated float.
 *   duration  {number}    Animation duration in seconds (default 0.65).
 *   easing    {string}    Motion easing preset (default 'easeOut').
 *   className {string}    Extra class applied to the wrapping <span>.
 */
export default function CountUp({
  value = 0,
  middle = 0,
  format,
  duration = 0.65,
  easing = 'easeInOut',
  className = '',
}) {
  const current = useCountUp(value, { duration, easing, middle })

  const display = format ? format(current) : String(Math.round(current))

  return <span className={className}>{display}</span>
}
