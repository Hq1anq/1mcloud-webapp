/**
 * Shared card body for price cards (Proxy & VPS).
 *
 * Props:
 *   primaryItems  – array of { icon: <svg/>, label: string, value: string }
 *                   Displayed in a 2–4 col grid (compact spec blocks).
 *   otherItems    – array of { icon: <svg/>, text: string }
 *                   Displayed as a vertical list below a divider.
 *   action        – JSX node rendered as the bottom action area (button or similar).
 */

function PrimaryItem(props) {
  const { icon, label, value, highlight } = props
  return (
    <div className="ml-5 flex flex-1 items-center gap-1.5">
      {/* icon wrapper keeps icon at fixed size regardless of what SVG is passed */}
      <span className="text-primary size-7 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p
          className={`${
            highlight ? 'text-primary/70' : 'text-text-muted'
          } text-sm font-bold tracking-wider uppercase`}
        >
          {label}
        </p>
        <p
          className={`${
            highlight ? 'text-primary' : 'text-text-primary'
          } truncate text-base font-bold`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

export default function CardBody({ primaryItems = [], otherItems = [], action }) {
  return (
    <div className="bg-surface flex flex-1 flex-col justify-between space-y-5 p-6">
      {/* GROUP 1 – Primary specs */}
      <div className="flex flex-wrap gap-x-2 gap-y-3">
        <div className="flex grow">
          <PrimaryItem {...primaryItems[0]} />
          <PrimaryItem {...primaryItems[1]} />
        </div>
        <div className="flex grow">
          {primaryItems.slice(2).map((item) => (
            <PrimaryItem {...item} />
          ))}
        </div>
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
