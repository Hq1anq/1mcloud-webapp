import Checkbox from './Checkbox.jsx'

export default function Table({ title, headers, extraBtn, emptyMessage }) {
  return (
    <div className="flex-1 overflow-hidden text-xs sm:text-sm">
      <div id="table-wrapper" className="mx-auto max-w-7xl px-4 py-3">
        <div
          id="table-container"
          className="bg-surface mx-auto w-full rounded-lg shadow-lg select-none"
        >
          {/* Table Header */}
          <div
            id="container-header"
            className="bg-thead border-border-input top-0 z-30 rounded-t-lg border-b-[5px] px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center text-lg font-semibold sm:text-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-7 w-7 shrink-0 fill-none stroke-current stroke-2 sm:h-10 sm:w-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 9L20 9M8 9V20M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z"
                  />
                </svg>
                <span>{title}</span>
              </h2>

              <div className="flex items-center gap-3 text-xs sm:gap-5 sm:text-base">
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-5">
                  <span className="text-right whitespace-nowrap">
                    Selected: <span id="selectedCount">0</span> rows
                  </span>
                  <span className="text-right whitespace-nowrap">
                    Total: <span id="totalCount">0</span> rows
                  </span>
                </div>
                {extraBtn}
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="scroll-container overflow-x-auto rounded-b-lg">
            <table className="min-w-full table-fixed">
              <thead className="bg-thead" id="tableHeader">
                <tr>
                  <th className="px-2 sm:px-4">
                    <Checkbox />
                  </th>

                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-2 py-3 font-medium tracking-wider uppercase sm:px-4"
                    >
                      <div
                        className={
                          title === 'Proxy Status'
                            ? 'text-base sm:text-lg'
                            : 'text-sm sm:text-base' + 'flex min-w-15 flex-col gap-1 font-bold'
                        }
                      >
                        {header}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody id="tableBody" className="text-text-secondary"></tbody>
            </table>
          </div>

          {typeof emptyMessage !== 'undefined' ? emptyMessage : ''}
        </div>
      </div>
    </div>
  )
}
