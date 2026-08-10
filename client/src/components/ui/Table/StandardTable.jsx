import { forwardRef } from 'react'
import BaseTable from './BaseTable'
import { TableRow, itemContent } from './TableVirtuosoRow.jsx'

const StandardTable = forwardRef(function StandardTable(props, ref) {
  return (
    <BaseTable
      {...props}
      ref={ref}
      renderBody={({ filteredData, virtuosoContext, fixedHeader }) => (
        <table className="w-full border-collapse text-left">
          <thead>{fixedHeader()}</thead>
          <tbody>
            {filteredData.map((row, index) => (
              <TableRow
                key={row.sid !== undefined ? row.sid : index}
                context={virtuosoContext}
                item={row}
                data-index={index}
              >
                {itemContent(index, row, virtuosoContext)}
              </TableRow>
            ))}
          </tbody>
        </table>
      )}
    />
  )
})

export default StandardTable
