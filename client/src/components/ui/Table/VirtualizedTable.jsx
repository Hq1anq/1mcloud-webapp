import { forwardRef } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import BaseTable from './BaseTable'
import { VIRTUOSO_COMPONENTS, itemContent } from './TableVirtuosoRow.jsx'

const VirtualizedTable = forwardRef(function VirtualizedTable(props, ref) {
  return (
    <BaseTable
      {...props}
      ref={ref}
      renderBody={({ filteredData, virtuosoContext, fixedHeader, scrollParent }) => {
        if (scrollParent === undefined) return null

        return (
          <TableVirtuoso
            data={filteredData}
            customScrollParent={scrollParent}
            context={virtuosoContext}
            components={VIRTUOSO_COMPONENTS}
            fixedHeaderContent={fixedHeader}
            itemContent={itemContent}
            overscan={150}
            increaseViewportBy={{ top: 80, bottom: 80 }}
          />
        )
      }}
    />
  )
})

export default VirtualizedTable
