import Table from '../components/ui/Table'
import axiosInstance from '../lib/axios'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import { extractIP, randomDelay } from '../lib/utils'
import { useSafeCopy } from '../context/SafeCopyContext'
import { useConfirm } from '../context/ConfirmContext'
import { useTranslation } from '../i18n'
import useAuthStore from '../store/useAuthStore'

const OPERATOR_CONFIG = {
  sid: ['greater-equal', 'less-equal', 'equal', 'contain'],
  created: ['greater-equal', 'less-equal', 'contain'],
  expired: ['greater-equal', 'less-equal', 'contain'],
}

const STORAGE_KEY = 'vpsManager_data'

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Merge res into data by sid, preserving user_pass from data */
function mergeResIntoData(data, res) {
  const dataMap = new Map(data.map((row) => [row.sid, row]))

  for (const resRow of res) {
    const existingRow = dataMap.get(resRow.sid)
    let userPass = existingRow ? existingRow.user_pass : resRow.user_pass

    // Add default user if missing based on OS
    if (!userPass || !userPass.includes('/')) {
      const os = resRow.he_dieu_hanh || existingRow?.he_dieu_hanh || ''
      const defaultUser = os.toLowerCase().includes('ubuntu')
        ? 'root'
        : os.toLowerCase().includes('win')
          ? 'Administrator'
          : ''
      if (defaultUser) {
        userPass = `${defaultUser}/`
      }
    }

    if (existingRow) {
      // Update all columns from res, but keep user_pass from data
      Object.assign(existingRow, resRow)
      if (userPass !== undefined) {
        existingRow.user_pass = userPass
      }
    } else {
      // New row from res — add to data
      const newRow = { ...resRow }
      if (userPass !== undefined) newRow.user_pass = userPass
      dataMap.set(resRow.sid, newRow)
    }
  }

  return Array.from(dataMap.values())
}

export default function VpsManager({ onBuySuccessRef }) {
  const [selectedRows, setSelectedRows] = useState([])
  const { addToast, updateToast, removeToast } = useToast()
  const { safeCopy } = useSafeCopy()
  const { confirmAction } = useConfirm()
  const t = useTranslation()

  // Controlled input state
  const [ips, setIps] = useState('')
  const [amount, setAmount] = useState('')
  const [noteInput, setNoteInput] = useState('')

  // persistent data in localStorage
  const [data, setData] = useState(loadData)
  const [receivedData, setReceivedData] = useState(loadData)
  const [renderingReceived, setRenderingReceived] = useState(false)

  // Action feedback state
  const [rowClassMap, setRowClassMap] = useState({})
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const selectedRowsRef = useRef(selectedRows)
  useEffect(() => {
    selectedRowsRef.current = selectedRows
  }, [selectedRows])

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // --- DB sync helpers ---
  const syncToDb = useCallback(
    async (vpsToSync) => {
      if (!isAuthenticated || !vpsToSync || vpsToSync.length === 0) return
      try {
        await axiosInstance.post('/vps', { vpsList: vpsToSync })
      } catch (err) {
        console.error('[DB Sync] Save failed:', err.message)
      }
    },
    [isAuthenticated]
  )

  // Load from DB on mount (merge with localStorage, DB wins)
  // If DB is empty (first-time user), auto-fetch from /server/list and sync to DB
  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    async function loadFromDb() {
      try {
        const res = await axiosInstance.get('/vps')
        if (cancelled) return
        const dbData = res.data?.data || []

        if (dbData.length > 0) {
          // Returning user — load from DB
          setData((prev) => mergeResIntoData(prev, dbData))
          setReceivedData(dbData)
          setRenderingReceived(true)
        } else {
          // First-time user — DB empty, auto-fetch from API
          try {
            const listRes = await axiosInstance.get('/server/list')
            if (cancelled) return
            const listData = listRes.data?.data || []
            if (listData.length > 0) {
              setData((prev) => mergeResIntoData(prev, listData))
              setReceivedData(listData)
              setRenderingReceived(true)
              // Sync fetched data to DB so next visit loads from DB
              syncToDb(listData)
            }
          } catch (listErr) {
            console.error('[DB Sync] Initial fetch failed:', listErr.message)
          }
        }
      } catch (err) {
        console.error('[DB Sync] Load failed:', err.message)
      }
    }

    loadFromDb()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, syncToDb])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData(data)
  }, [data])

  const handleGetData = useCallback(async () => {
    const parsedIps = ips
      .split('\n')
      .map((line) => extractIP(line))
      .filter(Boolean)
      .join(',')

    const params = {}
    if (parsedIps) params.ips = parsedIps
    if (amount) params.amount = +amount

    const loadingId = addToast(t('manager.fetchingData'), 'loading')

    try {
      const res = await axiosInstance.get('/server/list', { params })

      const resData = res.data?.data || []

      setData((prevData) => {
        const mergedData = mergeResIntoData(prevData, resData)
        const finalResData = mergedData.filter((row) => resData.some((r) => r.sid === row.sid))

        setReceivedData(finalResData)
        setRenderingReceived(true)
        setSelectedIds(new Set())

        // Sync updated data to DB
        syncToDb(finalResData)

        removeToast(loadingId)
        addToast(
          <>
            {t('manager.loadedRows')}{' '}
            <span className="text-text-toast-success">{finalResData.length}</span>{' '}
            {t('manager.rows')}
          </>,
          'success'
        )

        return mergedData
      })
    } catch (err) {
      console.error('[GetData] Error:', err.message)
      removeToast(loadingId)
      addToast(`${t('manager.failedGetData')}: ${err.message}`, 'error')
    }
  }, [ips, amount, addToast, removeToast, t, syncToDb])

  // Register buy success handler on parent ref
  useEffect(() => {
    if (onBuySuccessRef) {
      onBuySuccessRef.current = (newData) => {
        if (Array.isArray(newData) && newData.length > 0) {
          setData((prev) => mergeResIntoData(prev, newData))
          syncToDb(newData)
          setReceivedData(newData)
          setRenderingReceived(true)
          setSelectedIds(new Set())
          const vps = newData.map((item) => `${item.ip_port}/${item.user_pass}`).join('\n')
          safeCopy(vps).then(
            (ok) =>
              ok &&
              addToast(
                <>
                  {t('manager.copied')}{' '}
                  <span className="text-text-toast-success">{newData.length}</span> VPS
                </>,
                'success'
              )
          )
        } else {
          handleGetData()
        }
      }
    }
  }, [onBuySuccessRef, syncToDb, safeCopy, addToast, t, handleGetData])

  // Helper: update a single row in both receivedData and data by sid
  const updateRowBySid = useCallback((sid, updater) => {
    let updatedRow = null
    setReceivedData((prev) =>
      prev.map((r) => {
        if (r.sid === sid) {
          updatedRow = { ...r, ...updater(r) }
          return updatedRow
        }
        return r
      })
    )
    setData((prev) => prev.map((r) => (r.sid === sid ? { ...r, ...updater(r) } : r)))
    return updatedRow
  }, [])

  // --- Batch handler helper ---
  const handleBatchAction = useCallback(
    async (endpoint, actionName, statusUpdater) => {
      const rows = [...selectedRowsRef.current]
      if (rows.length === 0) {
        addToast(t('manager.noRowsSelected'), 'warning')
        return
      }
      const loadingId = addToast(actionName + '...', 'loading')
      setIsProcessing(true)
      setRowClassMap({})
      const sids = rows.map((r) => r.sid).join(',')

      try {
        const res = await axiosInstance.post(endpoint, { sids })
        if (res.data?.success) {
          const classUpdates = {}
          const updatedRows = []
          for (const row of rows) {
            if (statusUpdater) {
              const updated = updateRowBySid(row.sid, statusUpdater)
              if (updated) updatedRows.push(updated)
            }
            classUpdates[row.sid] = 'bg-success-cell'
          }
          if (updatedRows.length > 0) syncToDb(updatedRows)

          setRowClassMap(classUpdates)
          setSelectedIds((prev) => {
            const newSet = new Set(prev)
            for (const row of rows) newSet.delete(row._index)
            return newSet
          })
          addToast(
            <>
              {actionName} {t('manager.completed')} <br />
              <span className="text-text-toast-success">
                {rows.length} {t('manager.success')}
              </span>
            </>,
            'success'
          )
        } else {
          const classUpdates = {}
          for (const row of rows) classUpdates[row.sid] = 'bg-error-cell'
          setRowClassMap(classUpdates)
          setSelectedIds((prev) => {
            const newSet = new Set(prev)
            for (const row of rows) newSet.delete(row._index)
            return newSet
          })
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
        setSelectedIds((prev) => {
          const newSet = new Set(prev)
          for (const row of rows) newSet.delete(row._index)
          return newSet
        })
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
    [addToast, removeToast, syncToDb, updateRowBySid, t]
  )

  // --- Sequential processor with per-row feedback ---
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
        try {
          const res = await apiCallFn(row)
          if (res.data?.success) {
            successCount++
            setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-success-cell' }))
          } else {
            failCount++
            setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-error-cell' }))
          }
        } catch {
          failCount++
          setRowClassMap((prev) => ({ ...prev, [row.sid]: 'bg-error-cell' }))
        }
        setSelectedIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(row._index)
          return newSet
        })
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

  // --- Handlers ---
  const handleCopyIp = useCallback(() => {
    const rows = [...selectedRowsRef.current]
    if (rows.length === 0) {
      addToast(t('manager.noRowsSelected'), 'warning')
      return
    }

    const ipsToCopy = rows
      .map((r) => r.ip_port?.split(':')[0])
      .filter(Boolean)
      .join('\n')

    safeCopy(ipsToCopy).then((ok) => {
      if (ok) {
        addToast(
          <>
            {t('manager.copied')} <span className="text-text-toast-success">{rows.length}</span>{' '}
            {t('manager.copiedIps')}
          </>,
          'success'
        )
      }
    })
  }, [addToast, safeCopy, t])

  const handleReboot = useCallback(
    () =>
      handleBatchAction('/server/reboot', t('manager.reboot').toUpperCase(), () => ({
        status: 'Running',
      })),
    [handleBatchAction, t]
  )

  const handlePause = useCallback(
    () =>
      handleBatchAction('/server/pause', t('manager.pause').toUpperCase(), () => ({
        status: 'Paused',
      })),
    [handleBatchAction, t]
  )

  const handleResetPassword = useCallback(
    () =>
      handleBatchAction(
        '/server/reset-password',
        t('vpsManager.resetPassword').toUpperCase(),
        (row) => {
          const [user] = (row.user_pass || '').split('/')
          const newUserPass = user ? `${user}/Httv1234` : `/Httv1234`
          return { user_pass: newUserPass }
        }
      ),
    [handleBatchAction, t]
  )

  const handleAutoFix = useCallback(
    () => handleBatchAction('/server/auto-fix', t('vpsManager.autoFix').toUpperCase()),
    [handleBatchAction, t]
  )

  // --- Change Note handler ---
  const handleChangeNote = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    const newNote = noteInput
    const updatedRowsToSync = []

    await processSequential(
      rows,
      async (row) => {
        const res = await axiosInstance.put('/server/info/note', {
          sid: row.sid.toString(),
          newNote,
        })
        if (res.data?.success) {
          const updated = updateRowBySid(row.sid, () => ({ note: newNote }))
          if (updated) updatedRowsToSync.push(updated)
        }
        return res
      },
      t('manager.changeNote').toUpperCase()
    )
    if (updatedRowsToSync.length > 0) syncToDb(updatedRowsToSync)
  }, [noteInput, processSequential, updateRowBySid, t, syncToDb])

  // --- Renew handler ---
  const handleRenew = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    if (rows.length === 0) {
      addToast(t('manager.noRowsSelected'), 'warning')
      return
    }

    const renewDataOrConfirmed = await confirmAction({
      title: t('manager.confirmRenew'),
      isRenew: true,
      selectedRows: rows,
    })

    if (!renewDataOrConfirmed) return

    const renewData = typeof renewDataOrConfirmed === 'object' ? renewDataOrConfirmed : null

    const validRows = []
    const invalidRows = []

    rows.forEach((row) => {
      const cleanIp = row.ip_port?.split(':')[0]
      if (
        renewData &&
        renewData.success &&
        renewData.success[cleanIp] &&
        renewData.success[cleanIp].new_expired_day &&
        renewData.success[cleanIp].new_expired_day !== '-'
      ) {
        validRows.push(row)
      } else {
        invalidRows.push(row)
      }
    })

    setRowClassMap((prev) => {
      const updates = { ...prev }
      invalidRows.forEach((r) => {
        updates[r.sid] = 'bg-error-cell'
      })
      return updates
    })

    if (validRows.length === 0) {
      addToast(t('manager.noValidProxies'), 'warning')
      return
    }

    const sids = validRows.map((r) => r.sid).join(',')
    setIsProcessing(true)
    const toastId = addToast(t('manager.renewing'), 'loading')

    try {
      const res = await axiosInstance.post('/server/renew', { sids: sids, month: 1 })

      const resSuccess = res.data?.result?.success || {}

      let successCount = 0
      let failCount = invalidRows.length

      const classUpdates = {}
      for (const row of validRows) {
        const cleanIp = row.ip_port?.split(':')[0]

        if (resSuccess[cleanIp]) {
          const newExpiredDay = renewData.success[cleanIp].new_expired_day
          updateRowBySid(row.sid, () => ({
            status: 'Running',
            expired: newExpiredDay,
          }))
          classUpdates[row.sid] = 'bg-success-cell'
          successCount++
        } else {
          classUpdates[row.sid] = 'bg-error-cell'
          failCount++
        }
      }

      setRowClassMap((prev) => ({ ...prev, ...classUpdates }))

      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        for (const row of rows) newSet.delete(row._index)
        return newSet
      })

      if (successCount > 0 && failCount === 0) {
        addToast(
          <>
            {t('manager.renew').toUpperCase()} {t('manager.completed')} <br />
            <span className="text-text-toast-success">
              {successCount} {t('manager.success')}
            </span>
          </>,
          'success'
        )
      } else if (successCount === 0 && failCount > 0) {
        addToast(
          <>
            {t('manager.renew').toUpperCase()} {t('manager.completed')} <br />
            <span className="text-text-toast-error">
              {failCount} {t('manager.failed')}
            </span>
          </>,
          'error'
        )
      } else {
        addToast(
          <>
            {t('manager.renew').toUpperCase()} {t('manager.completed')} <br />
            <span className="text-text-toast-success">
              {successCount} {t('manager.success')}
            </span>
            ,{' '}
            <span className="text-text-toast-error">
              {failCount} {t('manager.failed')}
            </span>
          </>,
          'warning'
        )
      }
    } catch {
      const classUpdates = {}
      for (const row of validRows) classUpdates[row.sid] = 'bg-error-cell'
      setRowClassMap((prev) => ({ ...prev, ...classUpdates }))
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        for (const row of rows) newSet.delete(row._index)
        return newSet
      })
      addToast(t('manager.renewError'), 'error')
    } finally {
      setIsProcessing(false)
      removeToast(toastId)
    }
  }, [confirmAction, addToast, removeToast, updateRowBySid, t])

  return (
    <div>
      {/* ========== TOP CONTROLS ========== */}
      <div className="bg-surface border-border z-40 border-b select-none">
        <div className="mx-auto max-w-7xl px-4">
          {/* ========== FEATURE CONTROLS ========== */}
          <div className="bg-wrapper rounded-lg p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* IPs Input */}
              <div className="relative m-1 flex flex-col sm:w-3/5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-text-primary flex items-center font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="mr-2 size-6 shrink-0 fill-current sm:h-7 sm:w-7"
                    >
                      <path d="M5 5a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H5Zm9 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H14Zm3 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17ZM3 17v-3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11-2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H14Zm3 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" />
                    </svg>
                    <label className="flex flex-wrap">
                      <span className="whitespace-pre">{t('manager.enterIps')} </span>
                      <span>{t('manager.onePerLine')}</span>
                    </label>
                  </label>
                  <button
                    onClick={() => setIps('')}
                    className="bg-action static right-0 flex items-center justify-center rounded-lg px-3 py-1 text-sm font-medium transition-colors duration-200 hover:brightness-(--highlight-brightness) md:absolute lg:static"
                    style={{ '--action-color': 'var(--red)' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="mr-1 size-5 shrink-0 fill-current"
                    >
                      <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                    </svg>
                    {t('manager.delete')}
                  </button>
                </div>
                <textarea
                  className="min-h-24 grow"
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
                  value={ips}
                  onChange={(e) => setIps(e.target.value)}
                />
              </div>

              {/* GetData & Change Note & Action Buttons */}
              <div className="w-full flex-col">
                <div className="flex w-full flex-col items-start gap-2 p-0 sm:gap-3">
                  <div className="flex w-full flex-wrap gap-2 sm:gap-3">
                    {/* Get Data */}
                    <div className="flex grow flex-col gap-1 max-[496px]:flex-row">
                      <input
                        type="number"
                        placeholder={t('manager.enterAmount')}
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="flex items-center">
                        <button
                          className="bg-action flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium hover:brightness-(--highlight-brightness)"
                          style={{ '--action-color': 'var(--purple)' }}
                          onClick={handleGetData}
                        >
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="mr-1 size-5 shrink-0 fill-none sm:mr-2 sm:h-7 sm:w-7"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                            />
                          </svg>
                          {t('manager.getData')}
                        </button>
                      </div>
                    </div>

                    {/* Change Note */}
                    <div className="flex grow flex-col gap-1 max-[496px]:flex-row">
                      <input
                        type="text"
                        placeholder={t('manager.enterNote')}
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                      />
                      <button
                        className="bg-action flex w-full items-center justify-center rounded-lg px-3 py-2 font-medium transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                        style={{ '--action-color': 'var(--orange)' }}
                        onClick={handleChangeNote}
                        disabled={isProcessing}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-7 sm:w-7"
                        >
                          <path d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z" />
                        </svg>
                        {t('manager.changeNote')}
                      </button>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap justify-center gap-2 sm:gap-3">
                    {/* Change IP (placeholder) */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--red)' }}
                      onClick={() => addToast(t('vpsManager.comingSoon'), 'warning')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-7 sm:w-7"
                      >
                        <path d="M566.6 214.6L470.6 310.6C461.4 319.8 447.7 322.5 435.7 317.5C423.7 312.5 416 300.9 416 288L416 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L416 160L416 96C416 83.1 423.8 71.4 435.8 66.4C447.8 61.4 461.5 64.2 470.7 73.3L566.7 169.3C579.2 181.8 579.2 202.1 566.7 214.6zM169.3 566.6L73.3 470.6C60.8 458.1 60.8 437.8 73.3 425.3L169.3 329.3C178.5 320.1 192.2 317.4 204.2 322.4C216.2 327.4 224 339.1 224 352L224 416L544 416C561.7 416 576 430.3 576 448C576 465.7 561.7 480 544 480L224 480L224 544C224 556.9 216.2 568.6 204.2 573.6C192.2 578.6 178.5 575.8 169.3 566.7z" />
                      </svg>
                      {t('manager.changeIp')}
                    </button>

                    {/* Copy IP */}
                    <button
                      onClick={handleCopyIp}
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--green)' }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-7 sm:w-7"
                      >
                        <path d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z" />
                      </svg>
                      {t('manager.copyIp')}
                    </button>

                    {/* Reboot */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--orange)' }}
                      onClick={handleReboot}
                      disabled={isProcessing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        className="mr-1 h-[18px] w-[18px] shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="m 8 0 c -0.550781 0 -1 0.449219 -1 1 v 5 c 0 0.550781 0.449219 1 1 1 s 1 -0.449219 1 -1 v -5 c 0 -0.550781 -0.449219 -1 -1 -1 z m -7 1 l 2.050781 2.050781 c -2.117187 2.117188 -2.652343 5.355469 -1.332031 8.039063 c 1.324219 2.683594 4.214844 4.238281 7.179688 3.851562 c 2.96875 -0.386718 5.367187 -2.625 5.960937 -5.554687 c 0.59375 -2.933594 -0.75 -5.929688 -3.335937 -7.433594 c -0.476563 -0.28125 -1.089844 -0.117187 -1.367188 0.359375 s -0.117188 1.089844 0.359375 1.367188 c 1.851563 1.078124 2.808594 3.207031 2.382813 5.3125 c -0.421876 2.101562 -2.128907 3.691406 -4.253907 3.96875 c -2.128906 0.273437 -4.183593 -0.828126 -5.128906 -2.753907 s -0.566406 -4.226562 0.949219 -5.742187 l 1.535156 1.535156 v -4.003906 c 0 -0.519532 -0.449219 -0.996094 -1 -0.996094 z m 0 0" />
                      </svg>
                      {t('manager.reboot')}
                    </button>

                    {/* Pause */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--red)' }}
                      onClick={handlePause}
                      disabled={isProcessing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z" />
                      </svg>
                      {t('manager.pause')}
                    </button>

                    {/* Get Info */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--primary)' }}
                      onClick={() => {
                        const rows = selectedRowsRef.current
                        if (rows.length === 0)
                          return addToast(t('manager.noRowsSelected'), 'warning')
                        const text = rows
                          .map((r) => {
                            const [user, pass] = (r.user_pass || '').split('/')
                            return [r.ip_port, user, pass].join('/')
                          })
                          .join('\n')
                        safeCopy(text).then(
                          (ok) =>
                            ok &&
                            addToast(
                              <>
                                {t('manager.copied')}{' '}
                                <span className="text-text-toast-success">{rows.length}</span> VPS
                              </>,
                              'success'
                            )
                        )
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="M384 32H64C28.654 32 0 60.652 0 96V416C0 451.344 28.654 480 64 480H384C419.346 480 448 451.344 448 416V96C448 60.652 419.346 32 384 32ZM224 128C241.674 128 256 142.326 256 160C256 177.672 241.674 192 224 192S192 177.672 192 160C192 142.326 206.326 128 224 128ZM264 384H184C170.75 384 160 373.25 160 360S170.75 336 184 336H200V272H192C178.75 272 168 261.25 168 248S178.75 224 192 224H224C237.25 224 248 234.75 248 248V336H264C277.25 336 288 346.75 288 360S277.25 384 264 384Z" />
                      </svg>
                      {t('manager.getInfo')}
                    </button>

                    {/* Renew */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--yellow)' }}
                      onClick={handleRenew}
                      disabled={isProcessing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM296 408L296 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296L296 296L296 232C296 218.7 306.7 208 320 208C333.3 208 344 218.7 344 232L344 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L344 344L344 408C344 421.3 333.3 432 320 432C306.7 432 296 421.3 296 408z" />
                      </svg>
                      {t('manager.renew')}
                    </button>

                    {/* Reset Password */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--blue)' }}
                      onClick={handleResetPassword}
                      disabled={isProcessing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z" />
                      </svg>
                      {t('vpsManager.resetPassword')}
                    </button>

                    {/* Auto Fix */}
                    <button
                      className="bg-action flex grow items-center justify-center rounded-lg px-3 py-2 font-medium whitespace-nowrap hover:brightness-(--highlight-brightness)"
                      style={{ '--action-color': 'var(--green)' }}
                      onClick={handleAutoFix}
                      disabled={isProcessing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 231.233 231.233"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:size-7"
                      >
                        <path d="M230.505,102.78c-0.365-3.25-4.156-5.695-7.434-5.695c-10.594,0-19.996-6.218-23.939-15.842  c-4.025-9.855-1.428-21.346,6.465-28.587c2.486-2.273,2.789-6.079,0.705-8.721c-5.424-6.886-11.586-13.107-18.316-18.498  c-2.633-2.112-6.502-1.818-8.787,0.711c-6.891,7.632-19.27,10.468-28.836,6.477c-9.951-4.187-16.232-14.274-15.615-25.101  c0.203-3.403-2.285-6.36-5.676-6.755c-8.637-1-17.35-1.029-26.012-0.068c-3.348,0.37-5.834,3.257-5.723,6.617  c0.375,10.721-5.977,20.63-15.832,24.667c-9.451,3.861-21.744,1.046-28.621-6.519c-2.273-2.492-6.074-2.798-8.725-0.731  c-6.928,5.437-13.229,11.662-18.703,18.492c-2.133,2.655-1.818,6.503,0.689,8.784c8.049,7.289,10.644,18.879,6.465,28.849  c-3.99,9.505-13.859,15.628-25.156,15.628c-3.666-0.118-6.275,2.345-6.68,5.679c-1.016,8.683-1.027,17.535-0.049,26.289  c0.365,3.264,4.268,5.688,7.582,5.688c10.07-0.256,19.732,5.974,23.791,15.841c4.039,9.855,1.439,21.341-6.467,28.592  c-2.473,2.273-2.789,6.07-0.701,8.709c5.369,6.843,11.537,13.068,18.287,18.505c2.65,2.134,6.504,1.835,8.801-0.697  c6.918-7.65,19.295-10.481,28.822-6.482c9.98,4.176,16.258,14.262,15.645,25.092c-0.201,3.403,2.293,6.369,5.672,6.755  c4.42,0.517,8.863,0.773,13.32,0.773c4.23,0,8.461-0.231,12.692-0.702c3.352-0.37,5.834-3.26,5.721-6.621  c-0.387-10.716,5.979-20.626,15.822-24.655c9.514-3.886,21.752-1.042,28.633,6.512c2.285,2.487,6.063,2.789,8.725,0.73  c6.916-5.423,13.205-11.645,18.703-18.493c2.135-2.65,1.832-6.503-0.689-8.788c-8.047-7.284-10.656-18.879-6.477-28.839  c3.928-9.377,13.43-15.673,23.65-15.673l1.43,0.038c3.318,0.269,6.367-2.286,6.768-5.671  C231.476,120.379,231.487,111.537,230.505,102.78z M115.616,182.27c-36.813,0-66.654-29.841-66.654-66.653  s29.842-66.653,66.654-66.653s66.654,29.841,66.654,66.653c0,12.495-3.445,24.182-9.428,34.176l-29.186-29.187  c2.113-4.982,3.229-10.383,3.228-15.957c0-10.915-4.251-21.176-11.97-28.893c-7.717-7.717-17.978-11.967-28.891-11.967  c-3.642,0-7.267,0.484-10.774,1.439c-1.536,0.419-2.792,1.685-3.201,3.224c-0.418,1.574,0.053,3.187,1.283,4.418  c0,0,14.409,14.52,19.23,19.34c0.505,0.505,0.504,1.71,0.433,2.144l-0.045,0.317c-0.486,5.3-1.423,11.662-2.196,14.107  c-0.104,0.103-0.202,0.19-0.308,0.296c-0.111,0.111-0.213,0.218-0.32,0.328c-2.477,0.795-8.937,1.743-14.321,2.225l0.001-0.029  l-0.242,0.061c-0.043,0.005-0.123,0.011-0.229,0.011c-0.582,0-1.438-0.163-2.216-0.94c-5.018-5.018-18.862-18.763-18.862-18.763  c-1.242-1.238-2.516-1.498-3.365-1.498c-1.979,0-3.751,1.43-4.309,3.481c-3.811,14.103,0.229,29.273,10.546,39.591  c7.719,7.718,17.981,11.968,28.896,11.968c5.574,0,10.975-1.115,15.956-3.228l29.503,29.503  C141.125,178.412,128.825,182.27,115.616,182.27z" />
                      </svg>
                      {t('vpsManager.autoFix')}
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Table
        title={t('vpsManager.title')}
        className="text-xs sm:text-sm"
        data={data}
        receivedData={receivedData}
        renderingReceived={renderingReceived}
        setRenderingReceived={setRenderingReceived}
        useFilter={true}
        headers={[
          'plan_number',
          'ip_port',
          'country',
          'he_dieu_hanh',
          'price_vnd',
          'created',
          'expired',
          'status',
          'note',
        ]}
        headerLabels={{
          plan_number: t('table.planNumber'),
          country: t('table.country'),
          he_dieu_hanh: t('table.os'),
          price_vnd: t('table.priceVnd'),
          created: t('table.created'),
          expired: t('table.expired'),
          status: t('table.status'),
          note: t('table.note'),
          _selected: t('table.selected'),
          _total: t('table.total'),
          _rows: t('table.rows'),
        }}
        operatorConfig={OPERATOR_CONFIG}
        rowClassMap={rowClassMap}
        selectedIds={selectedIds}
        extraBtn={
          <button
            id="reloadBtn"
            className="bg-action rounded-lg px-2 py-2 hover:brightness-(--highlight-brightness)"
            style={{ '--action-color': 'var(--orange)' }}
            onClick={() => {
              setReceivedData([...data])
              setRenderingReceived(true)
              setSelectedIds(new Set())
              setRowClassMap({})
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 shrink-0 fill-current sm:h-7 sm:w-7"
            >
              <path d="M544.1 256L552 256C565.3 256 576 245.3 576 232L576 88C576 78.3 570.2 69.5 561.2 65.8C552.2 62.1 541.9 64.2 535 71L483.3 122.8C439 86.1 382 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6C143.2 199.5 223.3 128 320 128C364.4 128 405.2 143 437.7 168.3L391 215C384.1 221.9 382.1 232.2 385.8 241.2C389.5 250.2 398.3 256 408 256L544.1 256zM573.5 356.5C576 339 563.8 322.8 546.4 320.3C529 317.8 512.7 330 510.2 347.4C496.9 440.4 416.8 511.9 320.1 511.9C275.7 511.9 234.9 496.9 202.4 471.6L249 425C255.9 418.1 257.9 407.8 254.2 398.8C250.5 389.8 241.7 384 232 384L88 384C74.7 384 64 394.7 64 408L64 552C64 561.7 69.8 570.5 78.8 574.2C87.8 577.9 98.1 575.8 105 569L156.8 517.2C201 553.9 258 576 320 576C449 576 555.7 480.6 573.4 356.5z" />
            </svg>
          </button>
        }
        emptyMessage={
          <div id="emptyState" className="py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="fill-text-muted mx-auto size-12 shrink-0 sm:h-16 sm:w-16"
            >
              <path d="M5 5a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H5Zm9 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H14Zm3 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17ZM3 17v-3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11-2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H14Zm3 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" />
            </svg>
            <p className="text-text-muted text-base select-none sm:text-xl">
              {t('manager.noDataAvailable')} <br />
              {t('manager.clickGetData')}{' '}
              <span className="text-highlight">{t('manager.getData')}</span>{' '}
              {t('manager.toLoadInfo')}
            </p>
          </div>
        }
        onSelectionChange={(rows, ids) => {
          setSelectedRows(rows)
          setSelectedIds(ids)
        }}
      />
    </div>
  )
}
