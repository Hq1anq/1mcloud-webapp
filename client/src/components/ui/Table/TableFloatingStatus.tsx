import { useTranslation } from '../../../i18n'
import useDraggable from '../../../hooks/useDraggable'

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
  const {
    position,
    isDragging,
    elementRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleDoubleClick,
  } = useDraggable()

  if (totalCount === 0) return null

  const hasSelection = selectable && selectedCount > 0

  return (
    <aside
      ref={elementRef}
      data-capture-ignore
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onDoubleClick={handleDoubleClick}
      title={t('table.dragToMove')}
      style={
        position
          ? {
            left: `${position.x}px`,
            top: `${position.y}px`,
            bottom: 'auto',
            right: 'auto',
            transform: 'none',
          }
          : undefined
      }
      className={`fixed z-50 flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 py-1 select-none shadow-lg backdrop-blur-md bg-surface/85 border-border/70 text-text-primary shadow-black/25 touch-none cursor-grab ${position ? '' : 'bottom-1 left-1/2 -translate-x-1/2'
        } ${isDragging
          ? 'cursor-grabbing ring-1 ring-primary/40 shadow-xl opacity-100 transition-none'
          : 'opacity-85 hover:opacity-100 transition-[opacity,box-shadow,background-color] duration-200'
        }`}
    >
      {/* Drag handle grip icon */}
      <div
        className="flex items-center text-text-muted/60 hover:text-text-primary transition-colors cursor-grab active:cursor-grabbing pointer-events-none"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-2.5 sm:size-3"
        >
          <path d="M7 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM7 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM7 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      </div>

      {/* Info labels */}
      <div className="flex items-center gap-1 text-[9px] sm:text-sm pointer-events-none">
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
          onClick={(e) => {
            e.stopPropagation()
            onClearSelection()
          }}
          title={t('table.clearSelection')}
          aria-label={t('table.clearSelection')}
          className="hover:text-text-primary text-text-muted cursor-pointer transition-colors"
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
