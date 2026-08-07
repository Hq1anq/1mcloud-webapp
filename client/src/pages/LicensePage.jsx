import { useEffect, useMemo, useState } from 'react'
import AddLicenseDialog from '../components/dialog/license/AddLicenseDialog'
import EditLicenseDialog from '../components/dialog/license/EditLicenseDialog'
import DeleteLicenseDialog from '../components/dialog/license/DeleteLicenseDialog'
import Skeleton from '../components/ui/Skeleton'
import { getStatusClasses } from '../utils/ui'
import { useToast } from '../context/ToastContext'
import { useTranslation } from '../i18n'
import axiosInstance from '../lib/axios'

export default function LicensePage() {
  const t = useTranslation()
  const { addToast } = useToast()

  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'unassigned'

  // Masking state (set of unmasked license IDs)
  const [unmaskedIds, setUnmaskedIds] = useState(new Set())

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState(null)
  const [deletingLicense, setDeletingLicense] = useState(null)

  // Fetch licenses
  useEffect(() => {
    let ignore = false
    axiosInstance
      .get('/user/licenses')
      .then((res) => {
        if (ignore) return
        if (res.data?.success && Array.isArray(res.data.licenses)) {
          setLicenses(res.data.licenses)
        } else if (Array.isArray(res.data)) {
          setLicenses(res.data)
        } else {
          setLicenses([])
        }
      })
      .catch((err) => {
        if (ignore) return
        console.error('Error fetching licenses:', err)
        addToast(t('error'), 'error')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [addToast, t])

  // Helper mask function: VK7JG-NPHTM-C97JM-9MPGT-3V6AB -> VK7JG-*****-*****-*****-3V6AB
  const formatMaskedKey = (fullKey) => {
    if (!fullKey) return ''
    const parts = fullKey.split('-')
    if (parts.length === 5) {
      return `${parts[0]}-*****-*****-*****-${parts[4]}`
    }
    return fullKey.length > 8 ? `${fullKey.slice(0, 5)}*****${fullKey.slice(-5)}` : fullKey
  }

  // Toggle mask state
  const toggleMask = (id) => {
    setUnmaskedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Copy key to clipboard
  const handleCopyKey = (key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = key
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    addToast(t('licenses.copySuccess'), 'success')
  }

  // Stat metrics
  const totalCount = licenses.length

  const activeCount = useMemo(() => licenses.filter((l) => Boolean(l.server)).length, [licenses])
  const unassignedCount = totalCount - activeCount

  // Filtered rows
  const filteredLicenses = useMemo(() => {
    return licenses
      .filter((item) => {
        const term = searchTerm.toLowerCase().trim()
        const serverIp = item.server?.ip?.toLowerCase() || ''
        const serverName = (item.server?.TenDichVu || item.server?.server_name || '').toLowerCase()
        const keyStr = (item.license_key || '').toLowerCase()

        const matchesSearch =
          !term || keyStr.includes(term) || serverIp.includes(term) || serverName.includes(term)

        const isUsed = Boolean(item.server)
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && isUsed) ||
          (statusFilter === 'unassigned' && !isUsed)

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.agreed_at || 0) - new Date(a.agreed_at || 0))
  }, [licenses, searchTerm, statusFilter])

  // Format date: 2026-07-26T10:45:13.770000+00:00 -> 17:45:13 26/07/2026
  const formatDate = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      if (isNaN(d.getTime())) return isoString
      const timeStr = d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      const dateStr = d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      return `${timeStr} ${dateStr}`
    } catch {
      return isoString
    }
  }

  return (
    <div className="bg-body text-text-primary min-h-full w-full p-4 pb-16 md:p-8">
      <main className="mx-auto max-w-380">
        {/* PAGE HEADER */}
        <header className="border-border flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-primary flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="text-primary size-7 fill-current"
              >
                <path d="M400 416C497.2 416 576 337.2 576 240C576 142.8 497.2 64 400 64C302.8 64 224 142.8 224 240C224 258.7 226.9 276.8 232.3 293.7L71 455C66.5 459.5 64 465.6 64 472L64 552C64 565.3 74.7 576 88 576L168 576C181.3 576 192 565.3 192 552L192 512L232 512C245.3 512 256 501.3 256 488L256 448L296 448C302.4 448 308.5 445.5 313 441L346.3 407.7C363.2 413.1 381.3 416 400 416zM440 160C462.1 160 480 177.9 480 200C480 222.1 462.1 240 440 240C417.9 240 400 222.1 400 200C400 177.9 417.9 160 440 160z" />
              </svg>
              {t('licenses.title')}
            </h1>
            <p className="text-text-muted mt-1 text-xs">{t('licenses.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>{t('licenses.addLicense')}</span>
          </button>
        </header>

        {/* SECTION 1: WINDOWS LICENSE ALLOCATION POOL (3 STAT CARDS) */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: ALL WINDOWS LICENSES */}
          <div className="bg-surface border-border hover:border-primary rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-muted text-[11px] font-bold tracking-wider uppercase">
                {t('licenses.all')} Windows Licenses
              </span>
              <div className="bg-primary/10 border-primary/20 text-primary flex size-8 items-center justify-center rounded-xl border text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-5 fill-current"
                >
                  <path d="M64 128L288 96V304H64V128ZM64 336H288V544L64 512V336ZM320 91.5L576 56V304H320V91.5ZM320 336H576V584L320 548.5V336Z" />
                </svg>
              </div>
            </div>
            <span className="text-text-primary text-3xl font-extrabold tracking-tight">
              {loading ? <Skeleton isLoading={true} className="h-8 w-12" /> : totalCount}
            </span>
          </div>

          {/* Card 2: IMPLANTED ON VPS */}
          <div className="bg-surface border-border hover:border-primary rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-muted text-[11px] font-bold tracking-wider uppercase">
                {t('licenses.used')}
              </span>
              <div className="bg-green/10 border-green/20 text-green flex size-8 items-center justify-center rounded-xl border text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-6 fill-current"
                >
                  <path d="M160 96C124.7 96 96 124.7 96 160L96 224C96 259.3 124.7 288 160 288L480 288C515.3 288 544 259.3 544 224L544 160C544 124.7 515.3 96 480 96L160 96zM376 168C389.3 168 400 178.7 400 192C400 205.3 389.3 216 376 216C362.7 216 352 205.3 352 192C352 178.7 362.7 168 376 168zM432 192C432 178.7 442.7 168 456 168C469.3 168 480 178.7 480 192C480 205.3 469.3 216 456 216C442.7 216 432 205.3 432 192zM160 352C124.7 352 96 380.7 96 416L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 416C544 380.7 515.3 352 480 352L160 352zM376 424C389.3 424 400 434.7 400 448C400 461.3 389.3 472 376 472C362.7 472 352 461.3 352 448C352 434.7 362.7 424 376 424zM432 448C432 434.7 442.7 424 456 424C469.3 424 480 434.7 480 448C480 461.3 469.3 472 456 472C442.7 472 432 461.3 432 448z" />
                </svg>
              </div>
            </div>
            <span className="text-green text-3xl font-extrabold tracking-tight">
              {loading ? <Skeleton isLoading={true} className="h-8 w-12" /> : activeCount}
            </span>
          </div>

          {/* Card 3: UNUSED / FREE STANDBY */}
          <div className="bg-surface border-border hover:border-primary rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-text-muted text-[11px] font-bold tracking-wider uppercase">
                {t('licenses.notUsed')}
              </span>
              <div className="bg-orange/10 border-orange/20 text-orange flex size-8 items-center justify-center rounded-xl border text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-5 fill-current"
                >
                  <path d="M400 416C497.2 416 576 337.2 576 240C576 142.8 497.2 64 400 64C302.8 64 224 142.8 224 240C224 258.7 226.9 276.8 232.3 293.7L71 455C66.5 459.5 64 465.6 64 472L64 552C64 565.3 74.7 576 88 576L168 576C181.3 576 192 565.3 192 552L192 512L232 512C245.3 512 256 501.3 256 488L256 448L296 448C302.4 448 308.5 445.5 313 441L346.3 407.7C363.2 413.1 381.3 416 400 416zM440 160C462.1 160 480 177.9 480 200C480 222.1 462.1 240 440 240C417.9 240 400 222.1 400 200C400 177.9 417.9 160 440 160z" />
                </svg>
              </div>
            </div>
            <span className="text-orange text-3xl font-extrabold tracking-tight">
              {loading ? <Skeleton isLoading={true} className="h-8 w-12" /> : unassignedCount}
            </span>
          </div>
        </section>

        {/* SECTION 2: SEARCH & 3-STAGE FILTER BAR */}
        <section className="mt-6 flex flex-wrap items-stretch justify-between gap-x-4 gap-y-2">
          {/* Search Input */}
          <div className="group relative grow">
            <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('licenses.searchPlaceholder')}
              className="border-border bg-navbar text-text-primary placeholder-text-muted focus:border-primary w-full rounded-xl border-2 py-2 pr-8 pl-10 text-sm transition focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-text-muted hover:text-text-primary absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-xs transition"
                title="Xóa ô tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* 3-Stage Filter Pills with Sliding Indicator */}
          <div className="bg-surface border-border relative z-0 grow items-center rounded-lg border p-1 text-sm shadow-(--glass-inset-shadow) select-none">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 -z-1 rounded-md backdrop-blur-xl backdrop-saturate-150"
              style={{
                background: 'var(--indicator-background)',
                boxShadow: 'var(--indicator-box-shadow)',
                left: '4px',
                width: 'calc((100% - 8px) / 3)',
                transform:
                  statusFilter === 'all'
                    ? 'translateX(0%)'
                    : statusFilter === 'active'
                      ? 'translateX(100%)'
                      : 'translateX(200%)',
                transition:
                  'transform 0.38s cubic-bezier(.34,1.4,.64,1), width 0.38s cubic-bezier(.34,1.4,.64,1)',
              }}
            />

            <div className="grid grid-cols-3">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex cursor-pointer items-center justify-center gap-1.5 px-3 py-1.5 font-bold transition-colors duration-300 ${
                  statusFilter === 'all'
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="bg-primary size-2 rounded-full"></span>
                <span>{t('licenses.all')}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-300 ${
                    statusFilter === 'all'
                      ? 'bg-primary/20 text-primary font-bold'
                      : 'bg-body text-text-muted'
                  }`}
                >
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`flex cursor-pointer items-center justify-center gap-1.5 px-3 py-1.5 font-bold transition-colors duration-300 ${
                  statusFilter === 'active'
                    ? 'text-green'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="bg-green size-2 rounded-full"></span>
                <span className="whitespace-nowrap">{t('licenses.used')}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-300 ${
                    statusFilter === 'active'
                      ? 'bg-green/20 text-green font-bold'
                      : 'bg-body text-text-muted'
                  }`}
                >
                  {activeCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('unassigned')}
                className={`flex cursor-pointer items-center justify-center gap-1.5 px-3 py-1.5 font-bold transition-colors duration-300 ${
                  statusFilter === 'unassigned'
                    ? 'text-orange'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="bg-orange size-2 rounded-full"></span>
                <span className="whitespace-nowrap">{t('licenses.notUsed')}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-300 ${
                    statusFilter === 'unassigned'
                      ? 'bg-orange/20 text-orange font-bold'
                      : 'bg-body text-text-muted'
                  }`}
                >
                  {unassignedCount}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* LICENSE DATA TABLE */}
        <section className="border-border bg-surface mt-2 overflow-hidden overflow-x-auto rounded-2xl border shadow-md">
          <table className="text-text-primary w-full text-left text-sm">
            <thead className="bg-thead text-text-muted border-border border-b text-xs font-bold uppercase">
              <tr>
                <th className="p-4">License Key</th>
                <th className="p-4">{t('licenses.dateAdded')}</th>
                <th className="p-4 text-center">{t('licenses.actions')}</th>
                <th className="p-4">{t('licenses.serviceInUse')}</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton isLoading={true} className="h-5 w-48" />
                    </td>
                    <td className="p-4">
                      <Skeleton isLoading={true} className="h-5 w-28" />
                    </td>
                    <td className="p-4">
                      <Skeleton isLoading={true} className="h-5 w-32" />
                    </td>
                    <td className="p-4">
                      <Skeleton isLoading={true} className="mx-auto h-5 w-16" />
                    </td>
                  </tr>
                ))
              ) : filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="text-text-muted mb-2 size-10 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                      <p className="text-text-primary text-sm font-semibold">
                        {t('licenses.noData')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((item) => {
                  const isUnmasked = unmaskedIds.has(item.id)
                  const keyText = isUnmasked ? item.license_key : formatMaskedKey(item.license_key)

                  return (
                    <tr key={item.id} className="hover:bg-bg-hover group transition">
                      <td className="p-4 font-mono font-bold">
                        <div className="flex items-center gap-3">
                          <span className="text-text-primary">{keyText}</span>
                          <div className="flex items-center gap-1 transition-opacity group-hover:opacity-100 sm:opacity-0">
                            <button
                              type="button"
                              onClick={() => toggleMask(item.id)}
                              className="text-text-muted hover:text-primary cursor-pointer p-1 transition"
                              title="Hiện/Ẩn Key"
                            >
                              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(item.license_key)}
                              className="text-text-muted hover:text-primary cursor-pointer p-1 transition"
                              title="Sao chép Key"
                            >
                              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="text-text-muted p-4 font-mono">
                        {formatDate(item.agreed_at)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLicense(item)}
                            className="text-text-muted hover:text-primary cursor-pointer p-1.5 transition"
                            title={t('edit')}
                          >
                            <svg className="size-4 fill-current" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(item.server)}
                            onClick={() => setDeletingLicense(item)}
                            className="text-text-muted hover:text-red disabled:hover:text-text-muted cursor-pointer p-1.5 transition disabled:cursor-not-allowed disabled:opacity-30"
                            title={
                              item.server ? t('licenses.usedLicenseDeleteFailed') : t('delete')
                            }
                          >
                            <svg className="size-4 fill-current" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {item.server ? (
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span
                              className={`w-22 rounded-full border py-0.5 text-center font-semibold ${getStatusClasses('Active')}`}
                            >
                              {t('licenses.used')}
                            </span>
                            <span className="flex items-baseline gap-1 whitespace-nowrap">
                              <span className="text-primary font-mono font-bold">
                                {item.server.ip}
                              </span>
                              {(item.server.TenDichVu || item.server.server_name) && (
                                <span className="text-text-muted">
                                  · {item.server.TenDichVu || item.server.server_name}
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`w-22 rounded-full border py-0.5 text-center font-semibold ${getStatusClasses('Paused')}`}
                          >
                            {t('licenses.notUsed')}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* Add License Dialog */}
      <AddLicenseDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newLicense) => {
          setLicenses((prev) => [newLicense, ...prev])
        }}
      />

      {/* Edit License Dialog */}
      <EditLicenseDialog
        isOpen={Boolean(editingLicense)}
        currentLicense={editingLicense}
        onClose={() => setEditingLicense(null)}
        onSuccess={(updatedLicense) => {
          setLicenses((prev) =>
            prev.map((l) => (l.id === updatedLicense.id ? { ...l, ...updatedLicense } : l))
          )
        }}
      />

      {/* Delete License Dialog */}
      <DeleteLicenseDialog
        isOpen={Boolean(deletingLicense)}
        currentLicense={deletingLicense}
        onClose={() => setDeletingLicense(null)}
        onSuccess={(deletedId) => {
          setLicenses((prev) => prev.filter((l) => l.id !== deletedId))
        }}
      />
    </div>
  )
}
