import DropDown from '../components/ui/DropDown'
import Table from '../components/ui/Table'
import BuyProxyDialog from '../components/dialog/BuyProxyDialog'
import Checkbox from '../components/ui/Checkbox'
import axiosInstance from '../lib/axios'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import { extractIP, randomDelay } from '../lib/utils'
import { useSafeCopy } from '../context/SafeCopyContext'
import { useConfirm } from '../context/ConfirmContext'
import { useTranslation } from '../i18n'

const OPERATOR_CONFIG = {
  sid: ['greater-equal', 'less-equal', 'equal', 'contain'],
  created: ['greater-equal', 'less-equal', 'contain'],
  expired: ['greater-equal', 'less-equal', 'contain'],
}

const STORAGE_KEY = 'proxyManager_data'

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
    if (existingRow) {
      // Update all columns from res, but keep user_pass from data
      const userPass = existingRow.user_pass
      Object.assign(existingRow, resRow)
      if (userPass !== undefined) {
        existingRow.user_pass = userPass
      }
    } else {
      // New row from res — add to data
      dataMap.set(resRow.sid, { ...resRow })
    }
  }

  return Array.from(dataMap.values())
}

export default function ProxyManager() {
  const [reinstallType, setReinstallType] = useState('HTTPS')
  const [changeIpType, setChangeIpType] = useState('HTTPS')
  const [selectedRows, setSelectedRows] = useState([])
  const { addToast, updateToast, removeToast } = useToast()
  const { safeCopy } = useSafeCopy()
  const { confirmAction } = useConfirm()
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const t = useTranslation()

  // Controlled input state
  const [ips, setIps] = useState('')
  const [amount, setAmount] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [replaceNote, setReplaceNote] = useState(false)
  const [reinstallInput, setReinstallInput] = useState('')
  const [changeIpInput, setChangeIpInput] = useState('')

  // persistent data in localStorage (includes user_pass)
  const [data, setData] = useState(loadData)
  // TableData: what renders in the table (receivedData after GetData, data on first load)
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

      // Render resData in the table
      setReceivedData(resData)

      // Merge resData into data and persist
      setData((prev) => {
        const merged = mergeResIntoData(prev, resData)
        return merged
      })

      removeToast(loadingId)
      addToast(
        <>
          {t('manager.loadedRows')}{' '}
          <span className="text-text-toast-success">{resData.length}</span> {t('manager.rows')}
        </>,
        'success'
      )
      setRenderingReceived(true)
      setSelectedIds(new Set())
    } catch (err) {
      console.error('[GetData] Error:', err.message)
      removeToast(loadingId)
      addToast(`${t('manager.failedGetData')}: ${err.message}`, 'error')
    }
  }, [ips, amount, addToast, removeToast, t])

  // --- Helper: update a single row in both receivedData and data by sid ---
  const updateRowBySid = useCallback((sid, updater) => {
    setReceivedData((prev) => prev.map((r) => (r.sid === sid ? { ...r, ...updater(r) } : r)))
    setData((prev) => prev.map((r) => (r.sid === sid ? { ...r, ...updater(r) } : r)))
  }, [])

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
        // Deselect this row
        setSelectedIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(row._index)
          return newSet
        })
        // Update progress toast
        updateToast(
          loadingId,
          <>
            {actionName}{' '}
            <span className="text-text-toast-success">
              {i + 2}/{total}
            </span>
          </>
        )
        // Random delay before next request
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

  // --- Change IP handler ---
  const handleChangeIp = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    if (rows.length === 0) {
      addToast(t('manager.noRowsSelected'), 'warning')
      return
    }

    const confirmed = await confirmAction({
      title: t('manager.confirmChangeIp'),
      infoText: (
        <>
          {t('manager.type')} <span className="text-highlight font-bold">{changeIpType}</span>
        </>
      ),
      isRenew: false,
      selectedRows: rows,
    })

    if (!confirmed) return

    const type = changeIpType === 'HTTPS' ? 'proxy_https' : 'proxy_sock_5'
    const proxyResults = []

    await processSequential(
      rows,
      async (row) => {
        const ip = row.ip_port?.split(':')[0]
        const res = await axiosInstance.post('/server/change-ip', { ip, type })
        if (res.data?.success) {
          const [newIp, port, user, pass] = res.data.proxyInfo
          updateRowBySid(row.sid, () => ({
            ip_port: `${newIp}:${port}`,
            user_pass: `${user}:${pass}`,
            type: changeIpType + ' Proxy',
            status: 'Running',
          }))
          proxyResults.push(`${newIp}:${port}:${user}:${pass}`)
        }
        return res
      },
      t('manager.changeIp').toUpperCase()
    )

    if (proxyResults.length > 0) {
      const text = proxyResults.join('\n')
      safeCopy(text).then(
        (ok) =>
          ok &&
          addToast(
            <>
              {t('manager.copied')}{' '}
              <span className="text-text-toast-success">{proxyResults.length}</span>{' '}
              {t('manager.copiedProxy')}
            </>,
            'success'
          )
      )
    }
  }, [changeIpType, confirmAction, safeCopy, addToast, processSequential, updateRowBySid, t])

  // --- Reinstall handler ---
  const handleReinstall = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    if (rows.length === 0) {
      addToast(t('manager.noRowsSelected'), 'warning')
      return
    }

    let infoTextNode = t('manager.reinstallTarget')
    let ip = '__',
      port = '__',
      user = '__',
      pass = '__'

    if (reinstallInput) {
      const parts = reinstallInput.split(':')
      if (parts.length >= 4) [ip, port, user, pass] = parts
      else if (parts.length === 3) [port, user, pass] = parts
      else if (parts.length === 2) [user, pass] = parts
      else {
        addToast(t('manager.invalidReinstall'), 'error')
        return
      }
      infoTextNode = (
        <>
          {t('manager.type')} <span className="text-highlight font-bold">{reinstallType} </span>
          <br />
          {t('manager.info')}{' '}
          <span className="text-highlight font-bold">
            {ip}:{port}:{user}:{pass}
          </span>
        </>
      )
    } else {
      infoTextNode = (
        <>
          {t('manager.type')} <span className="text-highlight font-bold">{reinstallType}</span>
        </>
      )
    }

    const confirmed = await confirmAction({
      title: t('manager.confirmReinstall'),
      infoText: infoTextNode,
      isRenew: false,
      selectedRows: rows,
    })

    if (!confirmed) return

    const type = reinstallType === 'HTTPS' ? 'proxy_https' : 'proxy_sock_5'
    const proxyResults = []

    await processSequential(
      rows,
      async (row) => {
        const res = await axiosInstance.post('/server/reinstall', {
          sid: row.sid.toString(),
          custom_info: reinstallInput || undefined,
          type,
        })
        if (res.data?.success) {
          const [ip, port, user, pass] = res.data.proxyInfo
          updateRowBySid(row.sid, () => ({
            ip_port: `${ip}:${port}`,
            user_pass: `${user}:${pass}`,
            type: reinstallType + ' Proxy',
            status: 'Running',
          }))
          proxyResults.push(`${ip}:${port}:${user}:${pass}`)
        }
        return res
      },
      t('manager.reinstall').toUpperCase()
    )

    if (proxyResults.length > 0) {
      const text = proxyResults.join('\n')
      safeCopy(text).then(
        (ok) =>
          ok &&
          addToast(
            <>
              {t('manager.copied')}{' '}
              <span className="text-text-toast-success">{proxyResults.length}</span>{' '}
              {t('manager.copiedProxy')}
            </>,
            'success'
          )
      )
    }
  }, [
    reinstallType,
    reinstallInput,
    confirmAction,
    processSequential,
    updateRowBySid,
    safeCopy,
    addToast,
    t,
  ])

  // --- Change Note handler ---
  const handleChangeNote = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    const newNote = noteInput

    await processSequential(
      rows,
      async (row) => {
        const res = await axiosInstance.put('/server/info/note', {
          sid: row.sid.toString(),
          newNote,
        })
        if (res.data?.success) {
          updateRowBySid(row.sid, () => ({ note: newNote }))
        }
        return res
      },
      t('manager.changeNote').toUpperCase()
    )
  }, [noteInput, processSequential, updateRowBySid, t])

  // --- Pause handler (batch) ---
  const handlePause = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    if (rows.length === 0) {
      addToast(t('manager.noRowsSelected'), 'warning')
      return
    }
    const pausingId = addToast(t('manager.pausing'), 'loading')
    setIsProcessing(true)
    setRowClassMap({})
    const sids = rows.map((r) => r.sid).join(',')

    try {
      const res = await axiosInstance.post('/server/pause', { sids })
      if (res.data?.success) {
        const classUpdates = {}
        for (const row of rows) {
          updateRowBySid(row.sid, () => ({ status: 'Paused' }))
          classUpdates[row.sid] = 'bg-success-cell'
        }
        setRowClassMap(classUpdates)
        setSelectedIds((prev) => {
          const newSet = new Set(prev)
          for (const row of rows) newSet.delete(row._index)
          return newSet
        })
        addToast(
          <>
            {t('manager.pause').toUpperCase()} {t('manager.completed')} <br />
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
            {t('manager.pause').toUpperCase()} {t('manager.completed')} <br />
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
          PAUSE completed <br />
          <span className="text-text-toast-error">{rows.length} failed</span>
        </>,
        'error'
      )
    }
    removeToast(pausingId)
    setIsProcessing(false)
  }, [addToast, removeToast, updateRowBySid, t])

  // --- Reboot handler (batch) ---
  const handleReboot = useCallback(async () => {
    const rows = [...selectedRowsRef.current]
    if (rows.length === 0) {
      addToast(t('manager.noRowsSelected'), 'warning')
      return
    }
    const rebootingId = addToast(t('manager.rebooting'), 'loading')
    setIsProcessing(true)
    setRowClassMap({})
    const sids = rows.map((r) => r.sid).join(',')

    try {
      const res = await axiosInstance.post('/server/reboot', { sids })
      if (res.data?.success) {
        const classUpdates = {}
        for (const row of rows) {
          updateRowBySid(row.sid, () => ({ status: 'Running' }))
          classUpdates[row.sid] = 'bg-success-cell'
        }
        setRowClassMap(classUpdates)
        setSelectedIds((prev) => {
          const newSet = new Set(prev)
          for (const row of rows) newSet.delete(row._index)
          return newSet
        })
        addToast(
          <>
            {t('manager.reboot').toUpperCase()} {t('manager.completed')} <br />
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
            {t('manager.reboot').toUpperCase()} {t('manager.completed')} <br />
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
          {t('manager.reboot').toUpperCase()} {t('manager.completed')} <br />
          <span className="text-text-toast-error">
            {rows.length} {t('manager.failed')}
          </span>
        </>,
        'error'
      )
    }
    removeToast(rebootingId)
    setIsProcessing(false)
  }, [addToast, removeToast, updateRowBySid, t])

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

    // confirmAction resolves with truthy (the renewData payload if successful fetching occurred).
    // If somehow it's just TRUE, we default to whatever we can.
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

      // Deselect all processed rows
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
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* ========== FEATURE CONTROLS ========== */}
          <div className="bg-wrapper rounded-lg p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* IPs Input */}
              <div className="relative flex flex-col sm:w-3/5">
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
                    id="shuffleBtn"
                    className="bg-bg-pause static right-0 bottom-[-8px] flex items-center justify-center rounded-lg px-3 py-1 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness) sm:absolute lg:static"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="mr-1 size-5 shrink-0 fill-current"
                    >
                      <path d="M544.1 256L552 256C565.3 256 576 245.3 576 232L576 88C576 78.3 570.2 69.5 561.2 65.8C552.2 62.1 541.9 64.2 535 71L483.3 122.8C439 86.1 382 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6C143.2 199.5 223.3 128 320 128C364.4 128 405.2 143 437.7 168.3L391 215C384.1 221.9 382.1 232.2 385.8 241.2C389.5 250.2 398.3 256 408 256L544.1 256zM573.5 356.5C576 339 563.8 322.8 546.4 320.3C529 317.8 512.7 330 510.2 347.4C496.9 440.4 416.8 511.9 320.1 511.9C275.7 511.9 234.9 496.9 202.4 471.6L249 425C255.9 418.1 257.9 407.8 254.2 398.8C250.5 389.8 241.7 384 232 384L88 384C74.7 384 64 394.7 64 408L64 552C64 561.7 69.8 570.5 78.8 574.2C87.8 577.9 98.1 575.8 105 569L156.8 517.2C201 553.9 258 576 320 576C449 576 555.7 480.6 573.4 356.5z" />
                    </svg>
                    {t('manager.delete')}
                  </button>
                </div>
                <button
                  id="textCopyBtn"
                  className="group text-text-muted absolute top-12 right-1 inline-flex cursor-pointer items-center justify-center rounded-lg hover:brightness-(--highlight-brightness)"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-7 w-7 fill-none"
                  >
                    <path
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="text-text-muted stroke-current group-hover:brightness-(--highlight-brightness)"
                      d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"
                    />
                  </svg>
                  {t('dialog.copy')}
                </button>
                <textarea
                  className="min-h-24 grow"
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
                  value={ips}
                  onChange={(e) => setIps(e.target.value)}
                />
              </div>
              {/* GetData & Change Note & Reinstall and Simple Action Buttons */}
              <div className="flex w-full flex-col space-y-4">
                {/* Getdata & Change Note */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {/* Get Data */}
                  <div className="flex-1 space-y-1">
                    <input
                      type="number"
                      placeholder={t('manager.enterAmount')}
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex items-center">
                      <button
                        className="bg-bg-copyIp flex flex-1 items-center justify-center rounded-l-lg px-3 py-2 font-medium text-nowrap hover:brightness-(--highlight-brightness)"
                        onClick={handleGetData}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="h-5 w-5 shrink-0 fill-current sm:h-7 sm:w-7"
                        >
                          <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
                        </svg>
                        Down Sync
                      </button>
                      <button
                        id="upSyncBtn"
                        className="bg-bg-getData flex flex-1 items-center justify-center rounded-r-lg px-3 py-2 font-medium text-nowrap hover:brightness-(--highlight-brightness)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="h-5 w-5 shrink-0 fill-current sm:h-7 sm:w-7"
                        >
                          <path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z" />
                        </svg>
                        Up Sync
                      </button>
                    </div>
                  </div>

                  {/* Change Note */}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder={t('manager.enterNote')}
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        className="bg-bg-changeNote flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                        onClick={handleChangeNote}
                        disabled={isProcessing}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="mr-1 h-5 w-5 shrink-0 fill-current sm:mr-2 sm:h-7 sm:w-7"
                        >
                          <path d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z" />
                        </svg>
                        {t('manager.changeNote')}
                      </button>
                      <div className="ml-1 flex items-center sm:ml-2">
                        <label className="group text-text-secondary inline-flex cursor-pointer items-center gap-2 select-none">
                          <Checkbox
                            id="replaceCheckbox"
                            checked={replaceNote}
                            onChange={() => setReplaceNote(!replaceNote)}
                          />
                          Replace
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  {/* Reinstall */}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder={t('manager.portUserPass')}
                      value={reinstallInput}
                      onChange={(e) => setReinstallInput(e.target.value)}
                    />
                    <div className="flex">
                      <button
                        className="bg-bg-reinstall flex flex-1 items-center justify-center rounded-l-lg px-3 py-2 font-medium hover:brightness-(--highlight-brightness)"
                        onClick={handleReinstall}
                        disabled={isProcessing}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-7 sm:w-7"
                        >
                          <path d="M544.1 256L552 256C565.3 256 576 245.3 576 232L576 88C576 78.3 570.2 69.5 561.2 65.8C552.2 62.1 541.9 64.2 535 71L483.3 122.8C439 86.1 382 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6C143.2 199.5 223.3 128 320 128C364.4 128 405.2 143 437.7 168.3L391 215C384.1 221.9 382.1 232.2 385.8 241.2C389.5 250.2 398.3 256 408 256L544.1 256zM573.5 356.5C576 339 563.8 322.8 546.4 320.3C529 317.8 512.7 330 510.2 347.4C496.9 440.4 416.8 511.9 320.1 511.9C275.7 511.9 234.9 496.9 202.4 471.6L249 425C255.9 418.1 257.9 407.8 254.2 398.8C250.5 389.8 241.7 384 232 384L88 384C74.7 384 64 394.7 64 408L64 552C64 561.7 69.8 570.5 78.8 574.2C87.8 577.9 98.1 575.8 105 569L156.8 517.2C201 553.9 258 576 320 576C449 576 555.7 480.6 573.4 356.5z" />
                        </svg>
                        {t('manager.reinstall')}
                      </button>
                      <DropDown
                        options={['HTTPS', 'SOCKS5']}
                        value={reinstallType}
                        onChange={setReinstallType}
                        className="rounded-r-lg"
                      />
                    </div>
                  </div>

                  {/* ChangeIP */}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder="ip:port:username:password"
                      value={changeIpInput}
                      onChange={(e) => setChangeIpInput(e.target.value)}
                    />
                    <div className="flex">
                      <button
                        className="bg-bg-changeIp flex flex-1 items-center justify-center rounded-l-lg px-3 py-2 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                        onClick={handleChangeIp}
                        disabled={isProcessing}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="mr-1 h-5 w-5 shrink-0 fill-current sm:mr-2 sm:h-7 sm:w-7"
                        >
                          <path d="M566.6 214.6L470.6 310.6C461.4 319.8 447.7 322.5 435.7 317.5C423.7 312.5 416 300.9 416 288L416 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L416 160L416 96C416 83.1 423.8 71.4 435.8 66.4C447.8 61.4 461.5 64.2 470.7 73.3L566.7 169.3C579.2 181.8 579.2 202.1 566.7 214.6zM169.3 566.6L73.3 470.6C60.8 458.1 60.8 437.8 73.3 425.3L169.3 329.3C178.5 320.1 192.2 317.4 204.2 322.4C216.2 327.4 224 339.1 224 352L224 416L544 416C561.7 416 576 430.3 576 448C576 465.7 561.7 480 544 480L224 480L224 544C224 556.9 216.2 568.6 204.2 573.6C192.2 578.6 178.5 575.8 169.3 566.7z" />
                        </svg>
                        {t('manager.changeIp')}
                      </button>
                      <DropDown
                        options={['HTTPS', 'SOCKS5']}
                        value={changeIpType}
                        onChange={setChangeIpType}
                        className="rounded-r-lg"
                      />
                    </div>
                  </div>
                </div>
                {/* Simple Action Buttons (bottom) */}
                <div className="flex flex-col gap-2 md:flex-row lg:gap-3">
                  <div className="flex gap-2 lg:gap-3">
                    <button
                      className="bg-bg-reboot flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium hover:brightness-(--highlight-brightness)"
                      onClick={handleReboot}
                      disabled={isProcessing}
                    >
                      {/* Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        className="mr-1 h-[18px] w-[18px] shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="m 8 0 c -0.550781 0 -1 0.449219 -1 1 v 5 c 0 0.550781 0.449219 1 1 1 s 1 -0.449219 1 -1 v -5 c 0 -0.550781 -0.449219 -1 -1 -1 z m -7 1 l 2.050781 2.050781 c -2.117187 2.117188 -2.652343 5.355469 -1.332031 8.039063 c 1.324219 2.683594 4.214844 4.238281 7.179688 3.851562 c 2.96875 -0.386718 5.367187 -2.625 5.960937 -5.554687 c 0.59375 -2.933594 -0.75 -5.929688 -3.335937 -7.433594 c -0.476563 -0.28125 -1.089844 -0.117187 -1.367188 0.359375 s -0.117188 1.089844 0.359375 1.367188 c 1.851563 1.078124 2.808594 3.207031 2.382813 5.3125 c -0.421876 2.101562 -2.128907 3.691406 -4.253907 3.96875 c -2.128906 0.273437 -4.183593 -0.828126 -5.128906 -2.753907 s -0.566406 -4.226562 0.949219 -5.742187 l 1.535156 1.535156 v -4.003906 c 0 -0.519532 -0.449219 -0.996094 -1 -0.996094 z m 0 0" />
                      </svg>
                      {t('manager.reboot')}
                    </button>
                    <button
                      id="refundBtn"
                      className="bg-bg-refund flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        className="mr-1 h-5 w-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="M384 32H64C28.654 32 0 60.652 0 96V416C0 451.346 28.654 480 64 480H384C419.346 480 448 451.346 448 416V96C448 60.652 419.346 32 384 32ZM310.764 314.281C305.451 342.701 281.738 361.422 248.045 366.818V384C248.045 397.25 237.295 408 224.045 408S200.045 397.25 200.045 384V365.939C185.955 363.51 171.59 359 158.795 354.734L152.514 352.656C139.92 348.531 133.045 334.969 137.17 322.375S154.92 302.922 167.451 307.031L173.951 309.187C186.076 313.219 199.795 317.781 210.951 319.344C238.826 323.359 261.326 317.359 263.576 305.437C265.389 295.828 261.732 290.766 217.795 279.156L209.201 276.875C184.482 270.156 126.576 254.469 137.201 197.719C142.523 169.283 166.266 150.521 200.045 145.156V128C200.045 114.75 210.795 104 224.045 104S248.045 114.75 248.045 128V146.002C256.998 147.568 266.891 149.984 279.264 153.937C291.889 157.953 298.889 171.469 294.857 184.094C290.857 196.719 277.326 203.75 264.701 199.656C253.139 195.969 244.014 193.672 236.857 192.641C209.295 188.703 186.607 194.625 184.389 206.562C183.045 213.625 181.92 219.734 221.764 230.547L230.045 232.75C264.264 241.781 321.514 256.906 310.764 314.281Z" />
                      </svg>
                      Refund
                    </button>
                    <button
                      className="bg-bg-renew flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium transition-colors duration-200 hover:brightness-(--highlight-brightness)"
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
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      className="bg-bg-copyIp flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                      onClick={() => {
                        const rows = selectedRowsRef.current
                        if (rows.length === 0)
                          return addToast(t('manager.noRowsSelected'), 'warning')
                        const text = rows
                          .map((r) => r.ip_port?.split(':')[0])
                          .filter(Boolean)
                          .join('\n')
                        safeCopy(text).then(
                          (ok) =>
                            ok &&
                            addToast(
                              <>
                                {t('manager.copied')}{' '}
                                <span className="text-text-toast-success">{rows.length}</span>{' '}
                                {t('manager.copiedIps')}
                              </>,
                              'success'
                            )
                        )
                      }}
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
                    <button
                      className="bg-bg-pause flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium hover:brightness-(--highlight-brightness)"
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
                    <button
                      className="bg-bg-changeIp flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium hover:brightness-(--highlight-brightness)"
                      onClick={() => setBuyDialogOpen(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="mr-1 size-5 shrink-0 fill-current sm:mr-2 sm:h-6 sm:w-6"
                      >
                        <path d="M0 72C0 58.7 10.7 48 24 48L69.3 48C96.4 48 119.6 67.4 124.4 94L124.8 96L537.5 96C557.5 96 572.6 114.2 568.9 133.9L537.8 299.8C532.1 330.1 505.7 352 474.9 352L171.3 352L176.4 380.3C178.5 391.7 188.4 400 200 400L456 400C469.3 400 480 410.7 480 424C480 437.3 469.3 448 456 448L200.1 448C165.3 448 135.5 423.1 129.3 388.9L77.2 102.6C76.5 98.8 73.2 96 69.3 96L24 96C10.7 96 0 85.3 0 72zM160 528C160 501.5 181.5 480 208 480C234.5 480 256 501.5 256 528C256 554.5 234.5 576 208 576C181.5 576 160 554.5 160 528zM384 528C384 501.5 405.5 480 432 480C458.5 480 480 501.5 480 528C480 554.5 458.5 576 432 576C405.5 576 384 554.5 384 528zM336 142.4C322.7 142.4 312 153.1 312 166.4L312 200L278.4 200C265.1 200 254.4 210.7 254.4 224C254.4 237.3 265.1 248 278.4 248L312 248L312 281.6C312 294.9 322.7 305.6 336 305.6C349.3 305.6 360 294.9 360 281.6L360 248L393.6 248C406.9 248 417.6 237.3 417.6 224C417.6 210.7 406.9 200 393.6 200L360 200L360 166.4C360 153.1 349.3 142.4 336 142.4z" />
                      </svg>
                      {t('manager.buyMore')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    id="giaHan1"
                    className="bg-bg-changeNote flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                  >
                    Gia hạn tuần
                  </button>
                  <button
                    id="giaHan"
                    className="bg-bg-getData flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap hover:brightness-(--highlight-brightness)"
                  >
                    Gia hạn
                  </button>
                  <button
                    id="giaHan2"
                    className="bg-bg-reinstall flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                  >
                    Gia hạn 2 tuần
                  </button>
                  <button
                    id="getInfoBtn"
                    className="bg-bg-getInfo flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap transition-colors duration-200 hover:brightness-(--highlight-brightness)"
                    onClick={() => {
                      const rows = selectedRowsRef.current
                      if (rows.length === 0) return addToast(t('manager.noRowsSelected'), 'warning')
                      const text = rows
                        .map((r) => {
                          const [ip, port] = (r.ip_port || '').split(':')
                          const [user, pass] = (r.user_pass || '').split(':')
                          return [ip, port, user, pass].filter(Boolean).join(':')
                        })
                        .join('\n')
                      safeCopy(text).then(
                        (ok) =>
                          ok &&
                          addToast(
                            <>
                              {t('manager.copied')}{' '}
                              <span className="text-text-toast-success">{rows.length}</span>{' '}
                              {t('manager.copiedProxy')}
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
                  <button
                    id="loadBtn"
                    className="bg-bg-copyIp flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap hover:brightness-(--highlight-brightness)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="size05 shrink-0 fill-current sm:h-7 sm:w-7"
                    >
                      <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
                    </svg>
                    Load
                  </button>
                  <button
                    id="saveBtn"
                    className="bg-bg-getData flex flex-1 items-center justify-center rounded-lg px-3 py-2 font-medium text-nowrap hover:brightness-(--highlight-brightness)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="h-5 w-5 shrink-0 fill-current sm:h-7 sm:w-7"
                    >
                      <path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z" />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Table
        title={t('manager.proxyManager')}
        className="text-xs sm:text-sm"
        data={data}
        receivedData={receivedData}
        renderingReceived={renderingReceived}
        setRenderingReceived={setRenderingReceived}
        useFilter={true}
        headers={['sid', 'ip_port', 'country', 'type', 'created', 'expired', 'status', 'note']}
        headerLabels={{
          country: t('table.country'),
          type: t('table.type'),
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
            className="bg-bg-reboot rounded-lg px-2 py-2 hover:brightness-(--highlight-brightness)"
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

      <BuyProxyDialog
        isOpen={buyDialogOpen}
        onClose={() => setBuyDialogOpen(false)}
        onSuccess={(newData) => {
          if (Array.isArray(newData) && newData.length > 0) {
            // Merge into local persistent data using the helper
            setData((prev) => mergeResIntoData(prev, newData))

            // Push into the view immediately, similar to handleGetData
            setReceivedData(newData)
            setRenderingReceived(true)
            setSelectedIds(new Set())

            const proxies = newData.map((item) => `${item.ip_port}:${item.user_pass}`).join('\n')
            safeCopy(proxies).then(
              (ok) =>
                ok &&
                addToast(
                  <>
                    {t('manager.copied')}{' '}
                    <span className="text-text-toast-success">{newData.length}</span>{' '}
                    {t('manager.copiedProxy')}
                  </>,
                  'success'
                )
            )
          } else {
            // Fallback to fetch from ground up if payload is missing or invalid
            handleGetData()
          }
        }}
      />
    </div>
  )
}
