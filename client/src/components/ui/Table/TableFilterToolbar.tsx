import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react'
import { useTranslation } from '../../../i18n'

export interface TimeOption {
  value: string
  label: string
  color: string
}

export interface TableFilterToolbarProps {
  keyword?: string
  onKeywordChange?: (value: string) => void
  byTime?: string
  onByTimeChange?: (value: string) => void
  ips?: string
  onIpsChange?: (value: string) => void
  onResetPage?: () => void
  searchPlaceholder?: string
  timeOptions?: TimeOption[]
  showIpFilter?: boolean
  className?: string
}

export default function TableFilterToolbar({
  keyword = '',
  onKeywordChange,
  byTime = 'all',
  onByTimeChange,
  ips = '',
  onIpsChange,
  onResetPage,
  searchPlaceholder,
  timeOptions,
  showIpFilter = true,
  className = '',
}: TableFilterToolbarProps) {
  const t = useTranslation()
  const [showFilterToolkit, setShowFilterToolkit] = useState<boolean>(false)

  // Dynamic sliding indicator style & refs for variable-width time filter buttons
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 4,
    width: 0,
  })
  const timeFilterRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const options: TimeOption[] = timeOptions || [
    { value: 'all', label: t('manager.all'), color: 'bg-primary' },
    { value: 'due', label: t('manager.due'), color: 'bg-yellow' },
    { value: 'expired', label: t('manager.expired'), color: 'bg-red' },
  ]

  const updateTimeFilterIndicator = useCallback(() => {
    const activeEl = timeFilterRefs.current[byTime]
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      })
    }
  }, [byTime])

  useLayoutEffect(() => {
    updateTimeFilterIndicator()
  }, [updateTimeFilterIndicator])

  useEffect(() => {
    window.addEventListener('resize', updateTimeFilterIndicator)
    return () => window.removeEventListener('resize', updateTimeFilterIndicator)
  }, [updateTimeFilterIndicator])

  return (
    <div className={`mx-auto mt-4 max-w-380 px-4 select-none ${className}`}>
      <div className="flex flex-wrap justify-center gap-2">
        {/* Keyword Search Input */}
        <label
          className="text-text-muted border-border/70 bg-navbar/80 focus-within:border-primary flex grow items-center gap-2 rounded-xl border-2 px-3 py-2 shadow-sm transition-[border-color,box-shadow,background-color]"
          aria-label="Search proxy table"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-5 shrink-0 fill-none stroke-current stroke-2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
            />
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange?.(e.target.value)}
            placeholder={searchPlaceholder || t('manager.searchPlaceholder')}
            className="placeholder:text-text-muted min-h-0 w-full border-0 bg-transparent p-0 font-medium whitespace-normal shadow-none outline-none focus:border-0 focus:outline-none"
          />
        </label>

        <div className="flex gap-2 sm:ml-auto">
          {/* 3-Stage Filter Pills with Dynamic Width Sliding Indicator */}
          {onByTimeChange && (
            <div
              className="border-border/70 bg-navbar/70 relative z-0 flex items-center rounded-xl border-2 p-1 text-sm shadow-(--glass-inset-shadow) select-none"
              aria-label="Filter options"
            >
              {/* Dynamic Sliding indicator */}
              <div
                className="absolute top-1 bottom-1 -z-1 rounded-lg backdrop-blur-xl backdrop-saturate-150"
                style={{
                  background: 'var(--indicator-background)',
                  boxShadow: 'var(--indicator-box-shadow)',
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  transition:
                    'left 0.38s cubic-bezier(.34,1.4,.64,1), width 0.38s cubic-bezier(.34,1.4,.64,1)',
                }}
              />

              <div className="flex items-center gap-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    ref={(el) => {
                      timeFilterRefs.current[option.value] = el
                    }}
                    type="button"
                    onClick={() => {
                      onByTimeChange(option.value)
                      onResetPage?.()
                    }}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 px-2 py-1.5 font-bold transition-colors duration-300 sm:px-3 ${
                      byTime === option.value
                        ? 'text-primary'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span className={`${option.color} size-2 shrink-0 rounded-full`}></span>
                    <span className="whitespace-nowrap">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* IP Filter Toggle Button */}
          {showIpFilter && (
            <button
              type="button"
              className={`border-border/70 bg-navbar/70 text-text-primary hover:border-primary hover:bg-bg-hover flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-semibold shadow-sm transition-[background-color,border-color,box-shadow,transform] active:scale-95 ${showFilterToolkit ? 'border-primary bg-bg-selected text-highlight shadow-primary/20 shadow-md' : ''}`}
              onClick={() => setShowFilterToolkit((prev) => !prev)}
              aria-expanded={showFilterToolkit}
              aria-label="Show IP filter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-5 shrink-0 fill-current"
              >
                <path d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z" />
              </svg>
              <span className="hidden sm:inline">IPs</span>
            </button>
          )}
        </div>
      </div>

      {/* Animated IP Filter Panel */}
      {showIpFilter && (
        <div
          className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
            showFilterToolkit
              ? 'mt-2 grid-rows-[1fr] opacity-100'
              : 'pointer-events-none mt-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-border/60 bg-navbar/70 rounded-xl border-2 p-3 shadow-inner">
              <div className="text-text-muted mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.06em] uppercase">
                <span>{t('manager.ipFilter')}</span>
                <button
                  type="button"
                  onClick={() => {
                    onIpsChange?.('')
                    onResetPage?.()
                  }}
                  disabled={!ips.trim()}
                  className="text-highlight enabled:hover:bg-bg-hover enabled:hover:text-primary rounded-md px-2 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {t('delete')}
                </button>
              </div>
              <textarea
                value={ips}
                onChange={(e) => onIpsChange?.(e.target.value)}
                className="min-h-26 grow whitespace-pre"
                placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
