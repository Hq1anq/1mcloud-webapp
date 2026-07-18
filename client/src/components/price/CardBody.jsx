/**
 * Shared card body for price cards (Proxy & VPS).
 *
 * Props:
 *   primaryItems  – array of { icon: <svg/>, label: string, value: string }
 *                   Displayed in a 2–4 col grid (compact spec blocks).
 *   otherItems    – array of { icon: <svg/>, text: string }
 *                   Displayed as a vertical list below a divider.
 *   action        – JSX node rendered as the bottom action area (button or similar).
 *   primaryCols   – optional tailwind class overriding the primary grid cols (default "grid-cols-2")
 */
export default function CardBody({
  primaryItems = [],
  otherItems = [],
  action,
  primaryCols = 'grid-cols-2',
}) {
  return (
    <div className="bg-surface flex flex-1 flex-col justify-between space-y-5 p-6">
      {/* GROUP 1 – Primary specs */}
      <div className={`grid ${primaryCols} gap-2`}>
        {primaryItems.map((item, i) => {
          const isHighlighted = Boolean(item.highlight || item.isHighlighted)
          return (
            <div key={i} className="flex items-center gap-1.5">
              {/* icon wrapper keeps icon at fixed size regardless of what SVG is passed */}
              <span className="text-primary size-7 shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p
                  className={`${
                    isHighlighted ? 'text-primary/70' : 'text-text-muted'
                  } text-sm font-bold tracking-wider uppercase`}
                >
                  {item.label}
                </p>
                <p
                  className={`${
                    isHighlighted ? 'text-primary' : 'text-text-primary'
                  } truncate text-base font-bold`}
                >
                  {item.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* GROUP 2 – Other details */}
      <div className="border-border/50 flex flex-col gap-2 border-t pt-4 text-sm">
        {otherItems.map((item, i) => (
          <div key={i} className="text-text-muted flex items-center gap-2">
            <span className="text-primary/80 size-5 shrink-0">{item.icon}</span>
            <span className="text-text-primary/90 font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Action slot */}
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
