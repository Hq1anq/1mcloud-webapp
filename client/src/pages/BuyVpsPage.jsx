import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext.jsx'
import { useTranslation } from '../i18n/index.js'
import { getDefaultPlans } from '../data/vpsNations.jsx'
import { vpsNations, vpsSpecialOptions } from '../data/vpsNations.jsx'
import { isValidLicense, maskProductKey } from '../utils/ui.js'
import { useSafeCopy } from '../context/SafeCopyContext.jsx'
import axiosInstance from '../lib/axios.js'
import useProfileStore from '../store/useProfileStore.js'
import useVpsStore from '../store/useVpsStore.js'
import DropDown from '../components/ui/DropDown.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import NumberStepper from '../components/ui/NumberStepper.jsx'
import WindowsKeyInput from '../components/ui/WindowsKeyInput.jsx'
import getOS, { getShortOS } from '../data/osMap.js'

export default function BuyVpsPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const cardFromState = location.state?.card || null

  const { addToast, removeToast } = useToast()
  const { safeCopy } = useSafeCopy()
  const t = useTranslation()
  const fetchBalance = useProfileStore((s) => s.fetchBalance)
  const syncToDb = useVpsStore((s) => s.syncToDb)

  // Read URL params: nation + planId pre-selected from VpsCard click
  const initNation = searchParams.get('nation') || 'VN'
  const initPlanId = searchParams.get('planId') || null

  const newKeyOption = t('buyVps.enterNewKeyOption')
  const unusedLabel = t('buyVps.unusedLicense')

  // ── Plans ─────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState(() => getDefaultPlans(initNation))
  const [plansLoading, setPlansLoading] = useState(!cardFromState)
  const [selectedPlanId, setSelectedPlanId] = useState(initPlanId || cardFromState?.id || null)

  // ── Support data (OS / duration / IP / provider / location) ───────────────
  const [supportData, setSupportData] = useState({
    duration: { option: { 1: '1 Tháng' } },
    os: {
      option: {
        1: 'Windows Server 2012 R2 Standard',
        2: 'Windows Server 2019 Standard',
        3: 'Windows Server 2022 Standard',
        4: 'Windows 10 Pro',
        5: 'Win10 Enterprise',
        6: 'CentOS 7.9',
        7: 'CentOS 8.5.2111',
        8: 'Ubuntu 18.04.4 LTS',
        10: 'Ubuntu 20.04.4 LTS',
        11: 'Windows 11 Pro',
        18: 'Windows Server 2016 Standard',
        19: 'Ubuntu 22.04.5 LTS',
        20: 'Rocky Linux 9.4',
        21: 'AlmaLinux 9.4',
        22: 'Ubuntu 24.04.4 LTS',
        23: 'Ubuntu 26.04 LTS',
        24: 'Ubuntu Desktop 26.04 LTS',
      },
    },
    ip: { option: ['Ngẫu nhiên'] },
    provider: { option: ['Ngẫu nhiên'] },
  })

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedOs, setSelectedOs] = useState('19')
  const [selectedDuration, setSelectedDuration] = useState('1')
  const [selectedIp, setSelectedIp] = useState('Ngẫu nhiên')
  const [selectedProvider, setSelectedProvider] = useState('Ngẫu nhiên')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [form, setForm] = useState({ install_chrome: false, install_firefox: false })
  const updateForm = (updates) => setForm((prev) => ({ ...prev, ...updates }))

  const [amount, setAmount] = useState('1')
  const [randomPassword, setRandomPassword] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [randomPort, setRandomPort] = useState(true)
  const [portInput, setPortInput] = useState('')
  const [note, setNote] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // ── Windows BYOL ──────────────────────────────────────────────────────────
  const [userLicenses, setUserLicenses] = useState([])
  const [licensesLoading, setLicensesLoading] = useState(false)
  const [selectedLicenseOption, setSelectedLicenseOption] = useState(newKeyOption)
  const [customLicenseKey, setCustomLicenseKey] = useState('')
  const [agreeBYOL, setAgreeBYOL] = useState(false)

  const osName = supportData?.os?.option?.[selectedOs] || ''
  const isWindowsOs = Boolean(osName && /win/i.test(osName))

  const dropdownOptions = useMemo(() => {
    if (!userLicenses || userLicenses.length === 0) return [newKeyOption]
    return [
      ...userLicenses.map(
        (lic) =>
          `${maskProductKey(lic.license_key)} ${
            lic.server ? `(server: ${lic.server.ip})` : unusedLabel
          }`
      ),
      newKeyOption,
    ]
  }, [userLicenses, newKeyOption, unusedLabel])

  const effectiveLicenseKey = useMemo(() => {
    if (!isWindowsOs) return ''
    if (userLicenses.length === 0 || selectedLicenseOption === newKeyOption) {
      return customLicenseKey
    }
    const idx = dropdownOptions.indexOf(selectedLicenseOption)
    if (idx !== -1 && idx < userLicenses.length) {
      return userLicenses[idx].license_key
    }
    return customLicenseKey
  }, [
    isWindowsOs,
    userLicenses,
    selectedLicenseOption,
    dropdownOptions,
    customLicenseKey,
    newKeyOption,
  ])

  const isValidWindowsKey = isValidLicense(effectiveLicenseKey)
  const isLicenseValidForPay = !isWindowsOs || (isValidWindowsKey && agreeBYOL)

  // ── Pricing ───────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState({
    original_price: '',
    discount: '',
    coupon: '',
    warning: '',
    must_pay: '',
  })
  const [isCalculating, setIsCalculating] = useState(true)
  const [isBuying, setIsBuying] = useState(false)

  // ── Derived helpers ───────────────────────────────────────────────────────
  const allItems = [...vpsNations, ...vpsSpecialOptions]
  const selectedItem = allItems.find((n) => n.symbol === initNation)
  const selectedPlanObj =
    plans.find((p) => p.id === Number(selectedPlanId)) ||
    (cardFromState && cardFromState.id === Number(selectedPlanId) ? cardFromState : null) ||
    cardFromState ||
    (plans.length > 0 ? plans[0] : null)

  const ips = supportData && Array.isArray(supportData.ip?.option) ? supportData.ip.option : []
  const providers =
    supportData && Array.isArray(supportData.provider?.option) ? supportData.provider.option : []
  const locations =
    supportData && Array.isArray(supportData.location?.option) ? supportData.location.option : []

  // ── renderSelect helper ───────────────────────────────────────────────────
  const renderSelect = (value, onChange, optionsMap, isArray = false) => {
    const options = isArray ? optionsMap : Object.values(optionsMap || {})
    const displayValue = isArray ? value : optionsMap?.[value] || value
    const onSelect = isArray
      ? (newValue) => onChange({ target: { value: newValue } })
      : (newLabel) => {
          const key = Object.keys(optionsMap || {}).find((k) => optionsMap[k] === newLabel)
          if (key) onChange({ target: { value: key } })
        }

    return (
      <DropDown
        value={displayValue}
        options={options}
        onChange={onSelect}
        className="bg-wrapper rounded-lg text-base sm:text-lg"
        menuClassName="sm:text-lg text-base"
      />
    )
  }

  // ── Load plans + support data ─────────────────────────────────────────────
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const defaults = getDefaultPlans(initNation)
      setPlans(defaults)

      const fetchData = async () => {
        setPlansLoading(!cardFromState)
        try {
          const planRes = await axiosInstance.get(`/vps/plan?plan=${initNation}`)
          if (planRes.data?.success && Array.isArray(planRes.data.info)) {
            const sortedPlans = planRes.data.info.sort((a, b) => a.name.localeCompare(b.name))
            setPlans(sortedPlans)

            // Pre-select plan from URL param, or first available
            const available = sortedPlans.filter((p) => p.status === 'available')
            let targetPlanId =
              initPlanId && sortedPlans.find((p) => String(p.id) === String(initPlanId))
                ? initPlanId
                : (available[0]?.id ?? null)

            if (targetPlanId) {
              setSelectedPlanId(targetPlanId)
              const suppRes = await axiosInstance.get(`/vps/support?plan_id=${targetPlanId}`)
              if (suppRes.data?.success) {
                const info = suppRes.data.info
                setSupportData(info)

                const osKeys = Object.keys(info.os?.option || {})
                if (osKeys.length > 0)
                  setSelectedOs((prev) => (osKeys.includes(prev) ? prev : osKeys[0]))

                const durations = Object.keys(info.duration?.option || {})
                if (durations.length > 0)
                  setSelectedDuration((prev) => (durations.includes(prev) ? prev : durations[0]))

                const ipsOpt = Array.isArray(info.ip?.option) ? info.ip.option : []
                if (ipsOpt.length > 0)
                  setSelectedIp((prev) => (ipsOpt.includes(prev) ? prev : ipsOpt[0]))

                const providersOpt = Array.isArray(info.provider?.option)
                  ? info.provider.option
                  : []
                if (providersOpt.length > 0)
                  setSelectedProvider((prev) =>
                    providersOpt.includes(prev) ? prev : providersOpt[0]
                  )

                const locationsOpt = Array.isArray(info.location?.option)
                  ? info.location.option
                  : []
                if (locationsOpt.length > 0)
                  setSelectedLocation((prev) =>
                    locationsOpt.includes(prev) ? prev : locationsOpt[0]
                  )
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch VPS plans:', err)
          addToast(t('buyVps.fetchPlanError'), 'error')
        } finally {
          setPlansLoading(false)
        }
      }

      fetchData()
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Re-fetch support when plan selection changes ──────────────────────────
  const handleSelectPlan = useCallback(
    async (planId) => {
      if (planId === selectedPlanId) return
      setSelectedPlanId(planId)
      try {
        const suppRes = await axiosInstance.get(`/vps/support?plan_id=${planId}`)
        if (suppRes.data?.success) {
          const info = suppRes.data.info
          setSupportData(info)

          const osKeys = Object.keys(info.os?.option || {})
          if (osKeys.length > 0) setSelectedOs((prev) => (osKeys.includes(prev) ? prev : osKeys[0]))

          const durations = Object.keys(info.duration?.option || {})
          if (durations.length > 0)
            setSelectedDuration((prev) => (durations.includes(prev) ? prev : durations[0]))

          const ipsOpt = Array.isArray(info.ip?.option) ? info.ip.option : []
          if (ipsOpt.length > 0) setSelectedIp((prev) => (ipsOpt.includes(prev) ? prev : ipsOpt[0]))

          const providersOpt = Array.isArray(info.provider?.option) ? info.provider.option : []
          if (providersOpt.length > 0)
            setSelectedProvider((prev) => (providersOpt.includes(prev) ? prev : providersOpt[0]))

          const locationsOpt = Array.isArray(info.location?.option) ? info.location.option : []
          if (locationsOpt.length > 0)
            setSelectedLocation((prev) => (locationsOpt.includes(prev) ? prev : locationsOpt[0]))
        }
      } catch (err) {
        console.error('Failed to fetch VPS support:', err)
      }
    },
    [selectedPlanId]
  )

  // ── Fetch licenses when Windows OS is selected ────────────────────────────
  useEffect(() => {
    if (isWindowsOs) {
      const id = requestAnimationFrame(() => {
        setLicensesLoading(true)
        axiosInstance
          .get('/user/licenses')
          .then((res) => {
            if (res.data?.success && Array.isArray(res.data.licenses)) {
              const sorted = [...res.data.licenses].sort((a, b) =>
                (a.license_key || '').localeCompare(b.license_key || '')
              )
              setUserLicenses(sorted)
              if (sorted.length > 0) {
                const firstLic = sorted[0]
                const label = `${maskProductKey(firstLic.license_key)} ${
                  firstLic.server ? `(server: ${firstLic.server.ip})` : unusedLabel
                }`
                setSelectedLicenseOption(label)
              } else {
                setSelectedLicenseOption(newKeyOption)
              }
            }
          })
          .catch((err) => console.error('Failed to fetch user licenses:', err))
          .finally(() => setLicensesLoading(false))
      })
      return () => cancelAnimationFrame(id)
    }
  }, [isWindowsOs, newKeyOption, unusedLabel])

  // ── Calculate pricing ─────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedPlanId && Number(amount) > 0) {
      const delayFn = setTimeout(() => {
        setIsCalculating(true)
        axiosInstance
          .post('/server/create/calculate', {
            quantity: Number(amount),
            plan_id: selectedPlanId,
            duration: Number(selectedDuration),
            coupon: appliedDiscount,
          })
          .then((res) => {
            if (res.data.success) setSummary(res.data.info)
          })
          .catch(() => {})
          .finally(() => setIsCalculating(false))
      }, 300)
      return () => clearTimeout(delayFn)
    }
  }, [selectedPlanId, amount, selectedDuration, appliedDiscount])

  // ── Pay handler ───────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (
      !randomPassword &&
      passwordInput &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(passwordInput)
    ) {
      addToast(t('buy.invalidPassword'), 'error')
      return
    }
    if (!selectedPlanId) {
      addToast(t('buyVps.selectPlanFirst'), 'error')
      return
    }
    if (isWindowsOs) {
      if (!isValidWindowsKey) {
        addToast(t('buyVps.enterWinKey'), 'error')
        return
      }
      if (!agreeBYOL) {
        addToast(t('buyVps.agreeByolToast'), 'error')
        return
      }
    }

    const payload = {
      plan_id: selectedPlanId,
      duration: Number(selectedDuration),
      quantity: Number(amount),
      os_id: Number(selectedOs) || 1,
      random_password: randomPassword,
      password: randomPassword ? undefined : passwordInput,
      random_remote_port: randomPort,
      remote_port: randomPort ? undefined : portInput,
      range_ip: selectedIp || undefined,
      provider: selectedProvider || undefined,
      state: selectedLocation || undefined,
      install_firefox: form.install_firefox,
      install_chrome: form.install_chrome,
      note: note,
      coupon: appliedDiscount,
      auto_renew: autoRenew,
      is_proxy: false,
      windows_license_key: isWindowsOs ? effectiveLicenseKey : undefined,
    }

    setIsBuying(true)
    const loadingId = addToast(t('processing'), 'loading')

    try {
      const res = await axiosInstance.post('/server/create', payload)
      if (res.data.success) {
        const purchasedServers = res.data?.data || []

        addToast(
          <>
            {t('buy.purchased')}{' '}
            <span className="text-text-toast-success">{purchasedServers.length}</span> VPS!
          </>,
          'success'
        )

        fetchBalance()

        // Sync new servers to DB (same pattern as useManagerActions / syncToDb)
        if (purchasedServers.length > 0) {
          const parsedMustPay =
            parseFloat(
              (summary.must_pay || '0')
                .toString()
                .replace(/,/g, '')
                .replace(/[^\d.-]/g, '')
            ) || 0
          const qty = Number(amount) || 1
          const formattedPrice = Math.round(parsedMustPay / qty).toLocaleString('en-US')

          const extraConfig = {
            plan_number: selectedPlanObj?.name,
            country: initNation,
            he_dieu_hanh: getOS(supportData?.os?.option?.[selectedOs]),
            price_vnd: formattedPrice,
            note: note,
          }
          const rowsToSync = purchasedServers.map((srv) => ({ ...srv, ...extraConfig }))
          syncToDb(rowsToSync)

          // Copy new VPS info to clipboard
          const vpsText = purchasedServers
            .map((item) => `${item.ip_port}/${item.user_pass}`)
            .join('\n')
          safeCopy(vpsText)
        }

        // Reset form state after successful purchase
        setAgreeTerms(false)
        setAgreeBYOL(false)
        setCustomLicenseKey('')
        setNote('')
        setDiscountCode('')
        setAppliedDiscount('')
        setSummary({ original_price: '', discount: '', coupon: '', warning: '', must_pay: '' })
      } else {
        addToast(res.data?.message || t('buyVps.purchaseFailed'), 'error')
      }
    } catch (err) {
      console.error('Buy VPS Error: ', err)
      addToast(err.response?.data?.message || err.message || t('buyVps.errorOccurred'), 'error')
    } finally {
      removeToast(loadingId)
      setIsBuying(false)
    }
  }

  const canPay =
    agreeTerms &&
    !isBuying &&
    !!selectedPlanId &&
    summary.warning !== 'Tài khoản không đủ' &&
    plans.some((p) => p.status === 'available') &&
    isLicenseValidForPay

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="text-text-primary">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="bg-surface/95 border-border sticky top-0 z-30 border-b shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-text-muted flex items-center gap-2 text-xs">
            <Link to="/price/vps" className="hover:text-primary transition-colors">
              {t('nav.vpsPrice')}
            </Link>
            <span>/</span>
            <span className="text-text-primary font-semibold">
              {t('buyVps.title')} — {selectedItem?.name || initNation}
            </span>
          </div>

          {/* Back link */}
          <Link
            to="/price/vps"
            className="text-primary inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
          >
            <svg
              className="size-3.5 stroke-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('buyVps.subtitle')}
          </Link>
        </div>
      </div>

      {/* ── Main 2-col layout ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex shrink-0 flex-col gap-6 md:flex-row">
          {/* ── LEFT COLUMN: Plan banner + form ─────────────── */}
          <div className="flex flex-col gap-5">
            {/* Plan Banner */}
            {selectedPlanObj && (
              <div className="bg-surface border-border flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-blue/15 border-blue/30 flex size-12 shrink-0 items-center justify-center rounded-xl border font-bold">
                    <span className="text-primary text-lg font-black">{selectedPlanObj.name}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-text-primary text-base font-bold">
                        {t('buyVps.selectedPlan')}: {selectedPlanObj.name}
                      </h2>
                      <span className="bg-green/15 text-green border-green/30 rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                        {t('priceCard.available')}
                      </span>
                    </div>
                    <p className="text-text-muted mt-0.5 text-xs">
                      {selectedPlanObj.cpu} — {selectedPlanObj.ram} RAM
                    </p>
                  </div>
                </div>

                {/* Spec chips */}
                <div className="border-border flex items-center gap-3 border-t pt-3 sm:border-t-0 sm:pt-0">
                  <div className="bg-terminal border-border rounded-lg border px-3 py-1.5 text-center">
                    <span className="text-text-muted block text-[10px] font-medium uppercase">
                      vCPU
                    </span>
                    <strong className="text-text-primary text-sm font-semibold">
                      {selectedPlanObj.cpu}
                    </strong>
                  </div>
                  <div className="bg-terminal border-border rounded-lg border px-3 py-1.5 text-center">
                    <span className="text-text-muted block text-[10px] font-medium uppercase">
                      RAM
                    </span>
                    <strong className="text-text-primary text-sm font-semibold">
                      {selectedPlanObj.ram}
                    </strong>
                  </div>
                  <div className="bg-terminal border-border rounded-lg border px-3 py-1.5 text-center">
                    <span className="text-text-muted block text-[10px] font-medium uppercase">
                      SSD
                    </span>
                    <strong className="text-text-primary text-sm font-semibold">
                      {selectedPlanObj.ssd}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Skeleton plan banner when loading */}
            {!selectedPlanObj && plansLoading && (
              <div className="bg-surface border-border h-24 animate-pulse rounded-xl border" />
            )}

            {/* ── Form block ─────────────────────────────────────────── */}
            <div className="bg-surface border-border flex grow flex-col gap-5 rounded-xl border p-5 shadow-xs sm:p-6">
              {/* Row 1: OS / Duration / Quantity */}
              <div className="flex flex-wrap gap-5">
                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t('buyVps.amount')}</label>
                  <NumberStepper value={amount} onChange={setAmount} min={1} max={50} />
                </div>

                {/* Duration */}
                {supportData?.duration && (
                  <div className="flex min-w-48 grow flex-col gap-1.5 text-lg">
                    <span className="text-sm font-medium">{t('buyVps.duration')}</span>
                    {renderSelect(
                      selectedDuration,
                      (e) => setSelectedDuration(e.target.value),
                      supportData.duration?.option || {}
                    )}
                  </div>
                )}

                {/* OS */}
                <div className="flex min-w-78.5 grow flex-col gap-1.5 text-lg">
                  <span className="text-sm font-medium">{t('buyVps.os')}</span>
                  {renderSelect(
                    selectedOs,
                    (e) => setSelectedOs(e.target.value),
                    supportData.os?.option || {}
                  )}
                </div>

                {/* Windows BYOL Panel */}
                {isWindowsOs && (
                  <div className="border-border bg-terminal my-2 flex w-full flex-col gap-3 rounded-xl border p-4 shadow-xs">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="text-primary size-5 shrink-0 fill-current"
                      >
                        <path d="M64 128L288 96V304H64V128ZM64 336H288V544L64 512V336ZM320 91.5L576 56V304H320V91.5ZM320 336H576V584L320 548.5V336Z" />
                      </svg>
                      <span className="text-text-primary text-base font-bold">
                        {t('buyVps.winLicenseTitle')}
                      </span>
                    </div>
                    {/* Existing license dropdown */}
                    {(licensesLoading || userLicenses.length > 0) && (
                      <div className="flex flex-col gap-1.5 text-lg">
                        <span className="text-text-muted text-sm font-medium">
                          {t('buyVps.selectExistingLicense')}
                        </span>
                        <Skeleton
                          isLoading={licensesLoading}
                          element={
                            <DropDown
                              options={dropdownOptions}
                              value={selectedLicenseOption}
                              onChange={setSelectedLicenseOption}
                              className="bg-wrapper rounded-lg text-xs sm:text-lg"
                              menuClassName="text-xs sm:text-lg"
                            />
                          }
                          className="bg-text-muted h-10 w-full rounded-lg"
                        />
                      </div>
                    )}

                    {/* Key input if "Sử dụng key mới" or no licenses */}
                    {(userLicenses.length === 0 || selectedLicenseOption === newKeyOption) && (
                      <div className="flex flex-col gap-1 text-lg">
                        <span className="text-text-muted text-sm font-medium">
                          {t('buyVps.enterWinProductKey')}
                        </span>
                        <WindowsKeyInput
                          value={customLicenseKey}
                          onChange={(e) => setCustomLicenseKey(e.target.value)}
                          className={`rounded-lg px-3 py-2 font-mono text-base tracking-wider uppercase ${
                            customLicenseKey && !isValidWindowsKey
                              ? 'border-orange focus:border-orange'
                              : ''
                          }`}
                        />
                        {customLicenseKey && !isValidWindowsKey && (
                          <span className="text-orange text-xs font-medium">
                            {t('buyVps.invalidWinKeyFormat')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* BYOL Checkbox Disclaimer */}
                    <label className="hover:text-text-primary flex cursor-pointer items-start gap-2.5 pt-1 transition-colors">
                      <div className="shrink-0 pt-0.5">
                        <Checkbox
                          checked={agreeBYOL}
                          onChange={(e) => setAgreeBYOL(e.target.checked)}
                        />
                      </div>
                      <span className="text-orange text-sm leading-relaxed select-none">
                        {t('buyVps.byolDisclaimerLine1')}
                        <br />
                        {t('buyVps.byolDisclaimerLine2')}
                      </span>
                    </label>
                  </div>
                )}

                {/* Range IP */}
                {ips.length > 0 && (
                  <div className="flex grow flex-col gap-1.5 text-lg">
                    <span className="text-sm font-medium">{t('buyVps.rangeIp')}</span>
                    {renderSelect(selectedIp, (e) => setSelectedIp(e.target.value), ips, true)}
                  </div>
                )}

                {/* ISP/Provider */}
                {providers.length > 0 && (
                  <div className="flex grow flex-col gap-1.5 text-lg">
                    <span className="text-sm font-medium">{t('buyVps.provider')}</span>
                    {renderSelect(
                      selectedProvider,
                      (e) => setSelectedProvider(e.target.value),
                      providers,
                      true
                    )}
                  </div>
                )}

                {/* Location/State */}
                {locations.length > 0 && (
                  <div className="flex grow flex-col gap-1.5">
                    <span className="font-medium">{t('buyVps.location')}</span>
                    {renderSelect(
                      selectedLocation,
                      (e) => setSelectedLocation(e.target.value),
                      locations,
                      true
                    )}
                  </div>
                )}

                {/* Install Extensions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-medium">{t('installExtension')}</span>
                  <div className="flex gap-2 sm:gap-4">
                    <button
                      type="button"
                      aria-pressed={form.install_chrome}
                      onClick={() => updateForm({ install_chrome: !form.install_chrome })}
                      className={`hover:bg-blue/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold transition-colors select-none ${
                        form.install_chrome
                          ? 'border-blue text-blue bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-blue)_12%)]'
                          : 'border-border text-text-muted bg-terminal'
                      }`}
                    >
                      <span
                        className={`slide-reveal-ease flex items-center gap-2 transition-transform ${
                          form.install_chrome ? '-translate-x-4' : 'translate-x-0'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="size-5 fill-current"
                        >
                          <path d="M64 320C64 273.4 76.5 229.6 98.3 191.1L208.1 382.3C230 421.5 271.9 448 320 448C334.3 448 347.1 445.7 360.8 441.4L284.5 573.6C159.9 556.3 64 449.3 64 320zM429.1 385.6C441.4 366.4 448 343.1 448 320C448 281.8 431.2 247.5 404.7 224L557.4 224C569.4 253.6 576 286.1 576 320C576 461.4 461.4 575.1 320 576L429.1 385.6zM541.8 192L320 192C257.1 192 206.3 236.1 194.5 294.7L118.2 162.5C165 102.5 238 64 320 64C414.8 64 497.5 115.5 541.8 192zM408 320C408 368.6 368.6 408 320 408C271.4 408 232 368.6 232 320C232 271.4 271.4 232 320 232C368.6 232 408 271.4 408 320z" />
                        </svg>
                        <span>Chrome</span>
                      </span>

                      <svg
                        className={`slide-reveal-ease absolute right-4 size-5 transition-transform ${
                          form.install_chrome
                            ? 'translate-x-0 scale-100 opacity-100'
                            : 'translate-x-5 scale-0 opacity-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-pressed={form.install_firefox}
                      onClick={() => updateForm({ install_firefox: !form.install_firefox })}
                      className={`hover:bg-orange/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold transition-colors select-none ${
                        form.install_firefox
                          ? 'border-orange text-orange bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-orange)_12%)]'
                          : 'border-border text-text-muted bg-terminal'
                      }`}
                    >
                      <span
                        className={`slide-reveal-ease flex items-center gap-2 transition-transform ${
                          form.install_firefox ? '-translate-x-4' : 'translate-x-0'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="size-5 fill-current"
                        >
                          <path d="M194.2 191.5L194.2 191.5zM545.6 236.9C535 211.4 513.5 183.9 496.7 175.2C510.4 202.1 518.4 229.1 521.4 249.2C521.4 249.3 521.4 249.5 521.5 249.6C493.9 180.8 447.1 153.1 408.9 92.8C393.9 69.1 398 67.6 395.8 68.1L395.7 68.2C349 94.2 320.4 146.6 313.1 190.9C296.5 191.8 280.2 195.9 265.2 203C263.8 203.6 262.7 204.7 262.1 206C261.5 207.3 261.2 208.8 261.5 210.3C261.7 211.1 262.1 211.9 262.6 212.6C263.1 213.3 263.8 213.9 264.5 214.3C265.2 214.7 266.1 215 266.9 215.1C267.7 215.2 268.6 215.1 269.4 214.8L269.9 214.6C285.4 207.3 302.3 203.4 319.4 203.3C382.2 202.7 416.6 247.3 427 265.6C414 256.4 390.6 247.4 368.2 251.3C455.9 295.2 432.4 445.8 310.8 440.5C251.3 437.9 213.7 389.5 210.3 349.7C210.3 349.7 221.5 307.8 290.9 307.8C298.4 307.8 319.8 286.9 320.2 280.8C320.1 278.8 277.7 261.9 261.1 245.6C252.3 236.9 248 232.7 244.3 229.5C242.3 227.8 240.2 226.2 238 224.7C232.4 205.2 232.2 184.7 237.3 165.1C212.2 176.5 192.7 194.5 178.6 210.5L178.5 210.5C168.8 198.3 169.5 157.9 170.1 149.4C170 148.9 162.9 153.1 161.9 153.7C153.3 159.8 145.4 166.6 138.1 174.1C121.8 190.7 94 224.3 82.6 275.3C78.1 295.7 75.8 319.7 75.8 327.6C75.8 462.3 185 571.5 319.7 571.5C440.3 571.5 542.7 484.3 560.1 368.9C571.7 292.2 545.4 237.8 545.4 236.9z" />
                        </svg>
                        <span>Firefox</span>
                      </span>

                      <svg
                        className={`slide-reveal-ease absolute right-4 size-5 transition-transform ${
                          form.install_firefox
                            ? 'translate-x-0 scale-100 opacity-100'
                            : 'translate-x-5 scale-0 opacity-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                {/* Password */}
                <label className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={randomPassword}
                      onChange={(e) => setRandomPassword(e.target.checked)}
                    />
                    <span className="font-medium whitespace-nowrap">
                      {t('buyVps.randomPassword')}
                    </span>
                  </div>
                  {!randomPassword && (
                    <div className="flex flex-col gap-1 text-lg">
                      <input
                        type="text"
                        className={`${
                          passwordInput &&
                          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(passwordInput)
                            ? 'border-orange focus:border-orange focus:ring-orange/20'
                            : ''
                        }`}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                      {passwordInput &&
                        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(passwordInput) && (
                          <span className="text-orange text-xs">{t('buy.invalidPassword')}</span>
                        )}
                    </div>
                  )}
                </label>

                {/* Port */}
                <label className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={randomPort}
                      onChange={(e) => setRandomPort(e.target.checked)}
                    />
                    <span className="font-medium">{t('buyVps.randomPort')}</span>
                  </div>
                  {!randomPort && (
                    <div className="flex flex-col gap-1 text-lg">
                      <input
                        type="number"
                        value={portInput}
                        onChange={(e) => setPortInput(e.target.value)}
                      />
                    </div>
                  )}
                </label>
              </div>

              {/* Note */}
              <div className="flex grow items-baseline gap-2 text-lg">
                <span className="text-sm font-medium whitespace-nowrap">{t('buyVps.note')}</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('buyVps.enterNote')}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Order Summary sidebar (sticky) ──── */}
          <div className="sticky top-16 w-full max-w-92 min-w-72 self-start">
            <div className="bg-surface border-border space-y-5 rounded-xl border p-5 shadow-lg sm:p-6">
              <h3 className="text-text-primary border-border flex items-center justify-between border-b pb-3 text-base font-bold">
                <span>{t('buyVps.orderSummary')}</span>
                <span className="bg-blue/15 text-blue rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                  1MCLOUD
                </span>
              </h3>

              {/* Summary items */}
              <div className="flex flex-col gap-3 text-sm">
                {/* Selected plan */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-text-muted text-xs">{t('buyVps.selectedPlan')}:</span>
                    <Skeleton
                      isLoading={!selectedPlanObj && plansLoading}
                      element={
                        <>
                          <strong className="text-text-primary text-sm">
                            {selectedPlanObj?.name}
                          </strong>

                          <span className="text-orange mt-0.5 text-xs font-semibold">
                            {selectedPlanObj?.cpu} - {selectedPlanObj?.ram} ({selectedPlanObj?.ssd}{' '}
                            NVMe)
                          </span>
                        </>
                      }
                      className="bg-text-muted mt-0.5 h-4 w-20 rounded"
                    />
                  </div>
                  <span className="bg-terminal border-border rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold">
                    {getShortOS(osName) || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{t('buyVps.originalPrice')}:</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={<span className="font-semibold">{summary.original_price}</span>}
                    className="bg-text-muted h-4 w-24 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{t('buyVps.discount')}:</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={<span className="text-green font-semibold">-{summary.discount}</span>}
                    className="bg-text-muted h-4 w-20 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{t('buyVps.coupon')}:</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={
                      <span className="text-green font-semibold">{summary.coupon || '—'}</span>
                    }
                    className="bg-text-muted h-4 w-14 rounded"
                  />
                </div>

                <div className="border-border/60 border-t" />

                {/* Total */}
                <div className="flex items-baseline justify-between text-base">
                  <span className="font-bold">{t('buyVps.totalToPay')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={
                      <span className="text-blue text-3xl font-bold">
                        {summary.must_pay.split(' ')[0]}{' '}
                        <span className="text-lg font-normal">VND</span>
                      </span>
                    }
                    className="bg-text-muted h-[37.6px] w-40"
                  />
                </div>

                {/* Balance warning */}
                {summary.warning && (
                  <div className="text-red text-xs font-medium">{summary.warning}</div>
                )}
              </div>

              {/* Coupon code */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-text-muted text-xs font-medium tracking-wider uppercase">
                  {t('buyVps.discountCode')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setAppliedDiscount(discountCode)
                    }}
                    placeholder="e.g. SAVE20"
                    className="h-10 flex-1 font-mono text-sm uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setAppliedDiscount(discountCode)}
                    className="bg-border hover:bg-border/80 text-text-secondary shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-3 pt-2 text-base">
                <label className="flex items-center gap-2">
                  <Checkbox checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
                  <span className="cursor-pointer font-medium select-none">
                    {t('buyVps.autoRenew')}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="cursor-pointer font-medium select-none">
                    {t('buyVps.agreeTerms')}
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={!canPay}
                  className="btn-primary group flex h-11 w-full items-center justify-center gap-2 font-bold shadow-md transition-all hover:shadow-lg"
                >
                  <span>{t('buyVps.payNow')}</span>
                  <svg
                    className="size-4 transition-transform group-hover:translate-x-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>

                <Link
                  to="/price/vps"
                  className="text-text-muted hover:text-text-primary w-full py-2 text-center text-xs font-medium transition-colors"
                >
                  {t('cancel')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
