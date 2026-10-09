import React from 'react'
import { useTranslation } from '../../../i18n'

export interface TableFloatingStatusProps {
  selectable: boolean
  selectedCount: number
  totalCount: number
  onClearSelection?: () => void
}

export default function TableFloatingStatus({
  selectable,
  selectedCount,
  totalCount,
  onClearSelection,
}: TableFloatingStatusProps) {
  const t = useTranslation()

  if (totalCount === 0) return null

  const hasSelection = selectable && selectedCount > 0

  return (
    <aside
      data-capture-ignore
      aria-live="polite"
      className='fixed bottom-1 left-1 z-40 flex items-center gap-2 rounded-full border px-2 py-1 select-none shadow-lg backdrop-blur-md transition-all duration-300 bg-surface/80 border-border/70 text-text-primary shadow-black/25 opacity-85 hover:opacity-100'
    >
      {/* Info labels */}
      <div className="flex items-center gap-1 text-[9px]">
        {selectable ? (
          <>
            <span className="whitespace-nowrap">
              {t('table.selected')}:{' '}
              <span
                className={
                  hasSelection
                    ? 'text-highlight font-bold'
                    : 'text-text-muted font-medium'
                }
              >
                {selectedCount}
              </span>
            </span>
            <span className="text-border mx-0.5 select-none" aria-hidden="true">
              /
            </span>
            <span className="whitespace-nowrap">
              <span className="font-semibold text-text-primary">{totalCount}</span>
              <span className="text-text-muted ml-1">
                {t('table.rows')}
              </span>
            </span>
          </>
        ) : (
          <span className="whitespace-nowrap">
            {t('table.total')}:{' '}
            <span className="font-semibold text-text-primary">{totalCount}</span>
            <span className="text-text-muted ml-1">
              {t('table.rows')}
            </span>
          </span>
        )}
      </div>

      {/* Quick Clear Selection Button */}
      {hasSelection && onClearSelection && (
        <button
          type="button"
          onClick={onClearSelection}
          title={t('table.clearSelection')}
          aria-label={t('table.clearSelection')}
          className="hover:text-text-primary text-text-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </aside>
  )
}
