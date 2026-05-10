import { useState, useRef, useEffect, useCallback } from 'react'
import axiosInstance from '../lib/axios'
import { randomDelay } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { useTranslation } from '../i18n'

/**
 * Shared hook for batch/sequential processing actions used by VpsManager and ProxyManager.
 * Manages selection state, processing state, and row feedback (success/error cell classes).
 *
 * @param {Object} store - The Zustand store instance (useVpsStore or useProxyStore)
 *   Must expose: updateRowBySid, syncToDb
 */
export default function useManagerActions(store) {
  const { updateRowBySid, syncToDb } = store

  const { addToast, updateToast, removeToast } = useToast()
  const t = useTranslation()

  // Selection state
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const selectedRowsRef = useRef(selectedRows)
  useEffect(() => {
    selectedRowsRef.current = selectedRows
  }, [selectedRows])

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [rowClassMap, setRowClassMap] = useState({})

  // --- Selection helpers ---
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectedRows([])
  }, [])

  const deselectRows = useCallback((rows) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      for (const row of rows) newSet.delete(row._index)
      return newSet
    })
    setSelectedRows([])
  }, [])

  const onSelectionChange = useCallback((rows, ids) => {
    setSelectedRows(rows)
    setSelectedIds(ids)
  }, [])

  // --- Batch handler: single API call for all selected rows ---
  const handleBatchAction = useCallback(
    async (endpoint, actionName, statusUpdater) => {
      const rows = [...selectedRowsRef.current]
      if (rows.length === 0) {
        addToast(t('manager.noRowsSelected'), 'warning')
        return
      }
      const loadingId = addToast(actionName + '...', 'loading')
      setIsProcessing(true)
      const sids = rows.map((r) => r.sid).join(',')

      try {
        const res = await axiosInstance.post(endpoint, { sids })
        if (res.data?.success) {
          const classUpdates = {}
          const updatedRows = []
          for (const row of rows) {
            if (statusUpdater) {
              const updates = statusUpdater(row)
              updateRowBySid(row.sid, () => updates)
              updatedRows.push({ ...row, ...updates })
            }
            classUpdates[row.sid] = 'bg-success-cell'
          }

          setRowClassMap(classUpdates)
          deselectRows(rows)
          addToast(
            <>
              {actionName} {t('manager.completed')} <br />
              <span className="text-text-toast-success">
                {rows.length} {t('manager.success')}
              </span>
            </>,
            'success'
          )
          // Sync in background after feedback
          if (updatedRows.length > 0) syncToDb(updatedRows)
        } else {
          const classUpdates = {}
          for (const row of rows) classUpdates[row.sid] = 'bg-error-cell'
          setRowClassMap(classUpdates)
          deselectRows(rows)
          addToast(
            <>
              {actionName} {t('manager.completed')} <br />
              <span className="text-text-toast-error">
                {rows.length} {t('manager.failed')}
              </span>
            </>,
            'error'
          )
        }
      } catch {
        const classUpdates = {}
        for (const row of rows) classUpdates[row.sid] = 'bg-error-cell'
        setRowClassMap(classUpdates)
        deselectRows(rows)
        addToast(
          <>
            {actionName} {t('manager.completed')} <br />
            <span className="text-text-toast-error">
              {rows.length} {t('manager.failed')}
            </span>
          </>,
          'error'
        )
      }
      removeToast(loadingId)
      setIsProcessing(false)
    },
    [addToast, removeToast, syncToDb, updateRowBySid, deselectRows, t]
  )

  // --- Single handler: single API call for one row ---
  const handleSingleAction = useCallback(
    async (row, endpoint, data, actionName, statusUpdater) => {
      const loadingId = addToast(actionName + '...', 'loading')
      setIsProcessing(true)

      try {
        const res = await axiosInstance.post(endpoint, data)
        if (res.data?.success) {
          let updates = {}
          if (statusUpdater) {
            updates = statusUpdater(row)
            updateRowBySid(row.sid, () => updates)
          }
          setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-success-cell' }))
          addToast(
            <>
              {actionName} {t('manager.completed')} <br />
              <span className="text-text-toast-success">1 {t('manager.success')}</span>
            </>,
            'success'
          )
          // Sync in background after feedback
          if (statusUpdater) {
            syncToDb([{ ...row, ...updates }])
          }
        } else {
          setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-error-cell' }))
          addToast(
            <>
              {actionName} {t('manager.completed')} <br />
              <span className="text-text-toast-error">1 {t('manager.failed')}</span>
            </>,
            'error'
          )
        }
      } catch {
        setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-error-cell' }))
        addToast(
          <>
            {actionName} {t('manager.completed')} <br />
            <span className="text-text-toast-error">1 {t('manager.failed')}</span>
          </>,
          'error'
        )
      }
      removeToast(loadingId)
      setIsProcessing(false)
    },
    [addToast, removeToast, syncToDb, updateRowBySid, t]
  )

  // --- Sequential processor: one API call per row with per-row feedback ---
  const processSequential = useCallback(
    async (rows, apiCallFn, actionName) => {
      if (rows.length === 0) {
        addToast(t('manager.noRowsSelected'), 'warning')
        return
      }
      setIsProcessing(true)
      setRowClassMap({})
      let successCount = 0
      let failCount = 0

      const total = rows.length
      const loadingId = addToast(
        <>
          {actionName} <span className="text-text-toast-success">1/{total}</span>
        </>,
        'loading'
      )

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        let isSuccess = false
        try {
          const res = await apiCallFn(row)
          if (res.data?.success) {
            successCount++
            setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-success-cell' }))
            isSuccess = true
          } else {
            failCount++
            setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-error-cell' }))
          }
        } catch {
          failCount++
          setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-error-cell' }))
        }

        const isReinstallOrChangeIp = [t('manager.reinstall'), t('manager.changeIp')].includes(actionName)
        const shouldUncheck = isReinstallOrChangeIp ? !isSuccess : isSuccess

        if (shouldUncheck) {
          setSelectedIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(row._index)
            return newSet
          })
          setSelectedRows((prev) => prev.filter((r) => r._index !== row._index))
        }
        updateToast(
          loadingId,
          <>
            {actionName}{' '}
            <span className="text-text-toast-success">
              {i + 2}/{total}
            </span>
          </>
        )
        if (i < rows.length - 1) await randomDelay()
      }

      removeToast(loadingId)
      setIsProcessing(false)
      if (failCount === 0)
        addToast(
          <>
            {actionName} {t('manager.completed')} <br />
            <span className="text-text-toast-success">
              {successCount} {t('manager.success')}
            </span>
          </>,
          'success'
        )
      else if (successCount === 0)
        addToast(
          <>
            {actionName} {t('manager.completed')} <br />
            <span className="text-text-toast-error">
              {failCount} {t('manager.failed')}
            </span>
          </>,
          'error'
        )
      else
        addToast(
          <>
            {actionName} {t('manager.completed')} <br />
            <span className="text-text-toast-success">
              {successCount} {t('manager.success')}
            </span>
            ,{' '}
            <span className="text-text-toast-error">
              {failCount} {t('manager.failed')}
            </span>
          </>,
          failCount === 0 ? 'success' : 'error'
        )
    },
    [addToast, updateToast, removeToast, t]
  )

  return {
    // Selection
    selectedRows,
    setSelectedRows,
    selectedIds,
    setSelectedIds,
    selectedRowsRef,
    clearSelection,
    deselectRows,
    onSelectionChange,

    // Processing
    isProcessing,
    setIsProcessing,
    rowClassMap,
    setRowClassMap,

    // Action processors
    handleBatchAction,
    handleSingleAction,
    processSequential,
  }
}
