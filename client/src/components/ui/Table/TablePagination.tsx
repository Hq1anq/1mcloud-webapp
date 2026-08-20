import DropDown from '../DropDown'

const PAGE_SIZE_OPTIONS: number[] = [20, 50, 100, 200]

interface ChevronIconProps {
  double?: boolean
}

function ChevronLeftIcon({ double = false }: ChevronIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4 fill-none stroke-current stroke-2 min-[620px]:size-5"
      aria-hidden="true"
    >
      {double && <path strokeLinecap="round" strokeLinejoin="round" d="M11 6L5 12L11 18" />}
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6L9 12L15 18" />
    </svg>
  )
}

function ChevronRightIcon({ double = false }: ChevronIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4 fill-none stroke-current stroke-2 min-[620px]:size-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6L15 12L9 18" />
      {double && <path strokeLinecap="round" strokeLinejoin="round" d="M13 6L19 12L13 18" />}
    </svg>
  )
}

function getPageWindow(page: number, pageCount: number): number[] {
  if (pageCount <= 0) return []

  const windowSize = Math.min(5, pageCount)
  const currentPage = page + 1
  const maxStart = pageCount - windowSize + 1
  const startPage = Math.min(Math.max(currentPage - 2, 1), maxStart)

  return Array.from({ length: windowSize }, (_, index) => startPage + index)
}

export { PAGE_SIZE_OPTIONS }

export interface TablePaginationProps {
  t: (key: string) => string
  page: number
  pageSize: number
  pageCount: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export default function TablePagination({
  t,
  page,
  pageSize,
  pageCount,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const canGoPrev = page > 0
  const canGoNext = page < pageCount - 1
  const pageWindow = getPageWindow(page, pageCount)
  const leftPageWindow = pageWindow.slice(0, 3)
  const rightPageWindow = pageWindow.slice(3)

  const baseControlClass =
    'inline-grid min-h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none min-[620px]:min-h-11 min-[620px]:min-w-11 min-[620px]:px-3 min-[620px]:text-sm'
  const inactiveControlClass =
    'border-transparent bg-transparent text-text-muted hover:bg-bg-hover hover:text-text-primary active:bg-bg-selected active:scale-95'
  const activeControlClass =
    'border-primary bg-blue text-text-secondary shadow-md shadow-primary/30 hover:bg-primary hover:text-text-secondary active:scale-100'
  const disabledControlClass =
    'border-transparent bg-transparent text-text-muted opacity-40 pointer-events-none shadow-none'

  const getNavButtonClass = (enabled: boolean): string =>
    `${baseControlClass} ${enabled ? inactiveControlClass : disabledControlClass}`

  return (
    <div className="flex flex-col items-center justify-center gap-y-4 px-2 pt-2 text-xs min-[620px]:flex-row min-[620px]:px-4 min-[620px]:pt-3 min-[620px]:text-sm">
      <div className="bg-surface/95 border-border mr-auto flex w-max items-center gap-0.5 rounded-l-xl border border-r-0 px-1 py-1 min-[620px]:mr-0 min-[620px]:gap-1 min-[620px]:px-1.5 min-[620px]:py-1.5">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrev}
          className={getNavButtonClass(canGoPrev)}
          aria-label={t('table.firstPage')}
        >
          <ChevronLeftIcon double />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev}
          className={getNavButtonClass(canGoPrev)}
          aria-label={t('table.previousPage')}
        >
          <ChevronLeftIcon />
        </button>

        {leftPageWindow.map((pageNumber) => {
          const pageIndex = pageNumber - 1
          const isActive = pageIndex === page

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageIndex)}
              className={`${baseControlClass} ${isActive ? activeControlClass : inactiveControlClass}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          )
        })}
      </div>

      <div className="ml-auto flex gap-4 min-[620px]:ml-0 min-[620px]:gap-5">
        <div className="bg-surface/95 border-border -ml-px flex w-max items-center gap-0.5 rounded-r-xl border border-l-0 px-1 py-1 min-[620px]:gap-1 min-[620px]:px-1.5 min-[620px]:py-1.5">
          {rightPageWindow.map((pageNumber) => {
            const pageIndex = pageNumber - 1
            const isActive = pageIndex === page

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageIndex)}
                className={`${baseControlClass} ${isActive ? activeControlClass : inactiveControlClass}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            className={getNavButtonClass(canGoNext)}
            aria-label={t('table.nextPage')}
          >
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={!canGoNext}
            className={getNavButtonClass(canGoNext)}
            aria-label={t('table.lastPage')}
          >
            <ChevronRightIcon double />
          </button>
        </div>

        <DropDown<number>
          options={pageSizeOptions}
          value={pageSize}
          onChange={(nextPageSize) => onPageSizeChange(Number(nextPageSize))}
          className="bg-surface/95 border-border text-text-primary hover:bg-bg-hover rounded-xl border px-2 py-1 text-center text-xs font-bold transition-colors min-[620px]:min-h-11 min-[620px]:w-24 min-[620px]:px-3 min-[620px]:py-2 min-[620px]:text-sm"
          menuClassName="bg-dropdown border-border border"
          renderItem={(option) => <span className="block w-full text-center">{option}</span>}
        />
      </div>
    </div>
  )
}
