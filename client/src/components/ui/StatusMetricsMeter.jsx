const items = [
  {
    key: 'total',
    title: 'Total',
    tone: 'var(--blue)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-5 fill-none stroke-current sm:size-6"
        strokeWidth="2"
      >
        <path d="M3 12h18" />
        <path d="M12 3v18" />
      </svg>
    ),
  },
  {
    key: 'running',
    title: 'Running',
    tone: 'var(--green)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-5 fill-none stroke-current sm:size-6"
        strokeWidth="2"
      >
        <path d="M5 12l4 4 10-10" />
      </svg>
    ),
  },
  {
    key: 'off',
    title: 'Off',
    tone: 'var(--red)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-5 fill-none stroke-current sm:size-6"
        strokeWidth="2"
      >
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    ),
  },
  {
    key: 'other',
    title: 'Other',
    tone: 'var(--orange)',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-5 fill-none stroke-current sm:size-6"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
      </svg>
    ),
  },
]

const clampPercent = (value) => Math.max(0, Math.min(100, value))

export default function StatusMetricsMeter({ total, running, off, className }) {
  const safeTotal = Math.max(0, total)
  const safeRunning = Math.max(0, running)
  const safeOff = Math.max(0, off)
  const safeOther = Math.max(0, safeTotal - safeRunning - safeOff)

  const values = {
    total: safeTotal,
    running: safeRunning,
    off: safeOff,
    other: safeOther,
  }

  const getPercent = (value, key) => {
    if (key === 'total') return 100
    if (safeTotal <= 0) return 0
    return clampPercent((value / safeTotal) * 100)
  }

  return (
    <div
      className={`mx-auto grid max-w-7xl grid-cols-2 gap-2 px-8 sm:grid-cols-4 sm:gap-4 ${className}`}
    >
      {items.map((item) => {
        const value = values[item.key]
        const percent = getPercent(value, item.key)

        return (
          <article
            key={item.key}
            className="group border-border bg-navbar relative overflow-hidden rounded-2xl border p-3 shadow-[0_8px_20px_rgba(16,58,120,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(16,58,120,0.16)] sm:p-4"
          >
            <span
              className="pointer-events-none absolute -top-6 -right-6 size-18 rounded-full opacity-70 transition-all duration-500 group-hover:scale-110 group-hover:opacity-95 sm:size-20"
              style={{ background: `color-mix(in srgb, ${item.tone}, var(--color-navbar) 78%)` }}
            />

            <div className="flex items-center gap-2">
              <span
                className="grid size-7 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-15"
                style={{
                  color: `color-mix(in srgb, ${item.tone}, #111 10%)`,
                  background: `color-mix(in srgb, ${item.tone}, var(--color-navbar) 82%)`,
                }}
              >
                {item.icon}
              </span>
              <span className="text-text-muted text-xs font-medium sm:text-sm">{item.title}</span>
            </div>

            <div className="text-text-primary text-xl font-extrabold tracking-tight sm:text-2xl">
              {value}
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border),transparent_70%)]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percent}%`,
                  background: item.tone,
                  boxShadow: `0 0 10px color-mix(in srgb, ${item.tone}, transparent 60%)`,
                }}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}
