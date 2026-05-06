import { useState, useEffect } from 'react'
import { getStatusClasses } from '../../lib/utils'
import Dialog from '../../components/ui/Dialog'
import axiosInstance from '../../lib/axios'
import { useTranslation } from '../../i18n'

export default function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  infoText,
  isRenew,
  isRefund,
  isProxy,
  selectedRows,
  isProcessing: externalProcessing,
}) {
  const [renewData, setRenewData] = useState(null)
  const [refundData, setRefundData] = useState(null)
  const [isFetchingRenew, setIsFetchingRenew] = useState(false)
  const [isFetchingRefund, setIsFetchingRefund] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const t = useTranslation()

  useEffect(() => {
    if (isOpen && isRenew) {
      const fetchRenewData = async () => {
        setIsFetchingRenew(true)
        setFetchError('')
        setRenewData(null)
        try {
          const sids = selectedRows.map((r) => r.sid).join(',')
          const res = await axiosInstance.post('/server/renew/calculate', { sids, month: 1 })
          if (res.data?.success) {
            setRenewData(res.data.result)
          } else {
            setFetchError(t('manager.renewCalcError'))
          }
        } catch {
          setFetchError(t('manager.renewCalcError'))
        } finally {
          setIsFetchingRenew(false)
        }
      }
      fetchRenewData()
    } else {
      setRenewData(null)
      setIsFetchingRenew(false)
      setFetchError('')
    }
    if (isOpen && isRefund) {
      const fetchRefundData = async () => {
        setIsFetchingRefund(true)
        setFetchError('')
        setRefundData(null)
        try {
          const sids = selectedRows.map((r) => r.sid).join(',')
          const res = await axiosInstance.post('/server/refund/calculate', { sid: sids })
          if (res.data?.success) {
            setRefundData(res.data.result)
          } else {
            setFetchError(t('manager.refundCalcError'))
          }
        } catch {
          setFetchError(t('manager.refundCalcError'))
        } finally {
          setIsFetchingRefund(false)
        }
      }
      fetchRefundData()
    } else {
      setRefundData(null)
      setIsFetchingRefund(false)
      setFetchError('')
    }
  }, [isOpen, isRenew, isRefund, selectedRows, t])

  // Expose renewData to parent dialog on confirm
  const handleConfirmClick = () => {
    onConfirm(isRenew ? renewData : isRefund ? refundData : true)
  }

  if (!isOpen) return null

  const isProcessing = externalProcessing || isFetchingRenew || isFetchingRefund

  // Base headers excluding sid and created
  let headers = []
  if (isProxy) headers = ['ip_port', 'country', 'type', 'expired', 'status', 'note']
  else headers = ['plan_number', 'ip_port', 'country', 'he_dieu_hanh', 'expired', 'status', 'note']

  if (isRenew) {
    headers = [...headers, 'new_expired_day', 'expense']
  }
  if (isRefund) {
    headers = [...headers, 'refund']
  }

  return (
    <Dialog isOpen={isOpen} onClose={isProcessing ? () => {} : onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-text-primary font-medium">{infoText}</p>

        {fetchError ? (
          <p className="text-orange mb-4 font-medium">{fetchError}</p>
        ) : (
          <div className="border-border scroll-container max-h-[50vh] overflow-auto rounded-lg border">
            <table className="text-text-primary min-w-full">
              <thead className="bg-thead border-wrapper sticky top-0 border-b-2">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-2 font-semibold whitespace-nowrap uppercase ${['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'}`}
                    >
                      {t('table.' + header) || header.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((row, idx) => {
                  let rowRenewData = null
                  let rowRefundData = null
                  if (isRenew && renewData) {
                    const cleanIp = row.ip_port?.split(':')[0]
                    rowRenewData = renewData.success[cleanIp]
                  }
                  if (isRefund && refundData) {
                    const cleanIp = row.ip_port?.split(':')[0]
                    rowRefundData = refundData.success[cleanIp]
                  }

                  return (
                    <tr key={idx} className="bg-surface border-border hover:bg-bg-hover border-b">
                      {headers.map((header) => {
                        let content = row[header]

                        if (header === 'new_expired_day') {
                          content = isFetchingRenew ? (
                            <div className="bg-border mx-auto h-4 w-16 animate-pulse rounded"></div>
                          ) : rowRenewData ? (
                            rowRenewData.new_expired_day
                          ) : (
                            '-'
                          )
                        } else if (header === 'expense') {
                          const expenseVal = rowRenewData?.expense
                          content = isFetchingRenew ? (
                            <div className="bg-border mx-auto h-4 w-16 animate-pulse rounded"></div>
                          ) : expenseVal && expenseVal !== '-' ? (
                            <span className="text-highlight font-semibold">
                              {expenseVal}{' '}
                              <span className="text-sm font-medium opacity-80">VNĐ</span>
                            </span>
                          ) : (
                            '-'
                          )
                        } else if (header === 'refund') {
                          const expenseVal = rowRefundData?.split(' VNĐ')[0]
                          content = isFetchingRefund ? (
                            <div className="bg-border mx-auto h-4 w-16 animate-pulse rounded"></div>
                          ) : expenseVal && expenseVal !== '-' ? (
                            <span className="text-highlight font-semibold">
                              {expenseVal}{' '}
                              <span className="text-sm font-medium opacity-80">VNĐ</span>
                            </span>
                          ) : (
                            '-'
                          )
                        }

                        const statusClass = header === 'status' ? getStatusClasses(content) : ''

                        return (
                          <td
                            key={header}
                            className={`px-4 py-2 whitespace-nowrap ${['ip_port', 'note'].includes(header) ? 'text-left' : 'text-center'}`}
                          >
                            {statusClass ? (
                              <span
                                className={`rounded-full px-2 py-0.5 font-semibold ${statusClass}`}
                              >
                                {content}
                              </span>
                            ) : (
                              content
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg bg-gray-500 px-4 py-2 font-medium transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={isProcessing || !!fetchError}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing && (
              <svg
                className="mr-2 -ml-1 size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
