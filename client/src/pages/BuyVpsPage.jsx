import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext.jsx'
import { useTranslation } from '../i18n/index.js'
import { getDefaultPlans, vpsNations, vpsSpecialOptions } from '../data/vpsNations.jsx'
import { useSafeCopy } from '../context/SafeCopyContext.jsx'
import axiosInstance from '../lib/axios.js'
import useProfileStore from '../store/useProfileStore.js'
import useVpsStore from '../store/useVpsStore.js'
import DropDown from '../components/ui/DropDown.jsx'
import NumberStepper from '../components/ui/NumberStepper.jsx'
import getOS from '../data/osMap.js'

import VpsPlanBanner from '../components/price/vps/VpsPlanBanner.jsx'
import VpsPortInput from '../components/price/vps/VpsPortInput.jsx'
import VpsPasswordInput from '../components/price/vps/VpsPasswordInput.jsx'
import WindowsByolSection from '../components/price/vps/WindowsByolSection.jsx'
import ExtensionInstallSelector from '../components/price/vps/ExtensionInstallSelector.jsx'
import VpsOrderSummary from '../components/price/vps/VpsOrderSummary.jsx'

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
      order: [1, 18, 2, 3, 4, 5, 11, 6, 7, 8, 10, 19, 22, 23, 24, 20, 21],
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
  const [portPayload, setPortPayload] = useState({
    random_remote_port: true,
    remote_port: undefined,
  })
  const [note, setNote] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // ── Windows BYOL ──────────────────────────────────────────────────────────
  const [userLicenses, setUserLicenses] = useState([])
  const [licensesLoading, setLicensesLoading] = useState(false)
  const [effectiveLicenseKey, setEffectiveLicenseKey] = useState('')
  const [isValidWindowsKey, setIsValidWindowsKey] = useState(false)
  const [agreeBYOL, setAgreeBYOL] = useState(false)

  const osName = supportData?.os?.option?.[selectedOs] || ''
  const isWindow = Boolean(osName && /win/i.test(osName))
  const isLicenseValidForPay = !isWindow || (isValidWindowsKey && agreeBYOL)

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
  const renderSelect = (value, onChange, optionsMap, isArray = false, order = null) => {
    let options = []
    if (isArray) {
      options = optionsMap || []
    } else if (order && Array.isArray(order) && order.length > 0) {
      const setOfKeys = new Set(Object.keys(optionsMap || {}))
      order.forEach((id) => {
        const keyStr = String(id)
        if (optionsMap?.[keyStr] !== undefined) {
          options.push(optionsMap[keyStr])
          setOfKeys.delete(keyStr)
        }
      })
      setOfKeys.forEach((keyStr) => {
        options.push(optionsMap[keyStr])
      })
    } else {
      options = Object.values(optionsMap || {})
    }

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
                if (osKeys.length > 0) {
                  const osOrder = Array.isArray(info.os?.order) ? info.os.order.map(String) : []
                  const firstOsKey = osOrder.find((k) => osKeys.includes(k)) || osKeys[0]
                  setSelectedOs((prev) => (osKeys.includes(prev) ? prev : firstOsKey))
                }

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
        } finally {
          setPlansLoading(false)
        }
      }

      fetchData()
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch licenses when Windows OS is selected ────────────────────────────
  useEffect(() => {
    if (isWindow) {
      const id = requestAnimationFrame(() => {
        setLicensesLoading(true)
        axiosInstance
          .get('/user/licenses')
          .then((res) => {
            if (res.data?.success && Array.isArray(res.data.licenses)) {
              setUserLicenses(res.data.licenses)
            }
          })
          .catch((err) => console.error('Failed to fetch user licenses:', err))
          .finally(() => setLicensesLoading(false))
      })
      return () => cancelAnimationFrame(id)
    }
  }, [isWindow])

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
    if (isWindow) {
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
      ...portPayload,
      range_ip: selectedIp || undefined,
      provider: selectedProvider || undefined,
      state: selectedLocation || undefined,
      install_firefox: form.install_firefox,
      install_chrome: form.install_chrome,
      note: note,
      coupon: appliedDiscount,
      auto_renew: autoRenew,
      is_proxy: false,
      windows_license_key: isWindow ? effectiveLicenseKey : undefined,
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
            <VpsPlanBanner selectedPlanObj={selectedPlanObj} plansLoading={plansLoading} />

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
                  <div className="flex min-w-48 grow flex-col gap-1.5">
                    <span className="text-sm font-medium">{t('buyVps.duration')}</span>
                    {renderSelect(
                      selectedDuration,
                      (e) => setSelectedDuration(e.target.value),
                      supportData.duration?.option || {}
                    )}
                  </div>
                )}

                {/* OS */}
                <div className="flex min-w-78.5 grow flex-col gap-1.5">
                  <span className="text-sm font-medium">{t('buyVps.os')}</span>
                  {renderSelect(
                    selectedOs,
                    (e) => setSelectedOs(e.target.value),
                    supportData.os?.option || {},
                    false,
                    supportData.os?.order
                  )}
                </div>

                {/* Windows BYOL Panel */}
                {isWindow && (
                  <WindowsByolSection
                    userLicenses={userLicenses}
                    licensesLoading={licensesLoading}
                    agreeBYOL={agreeBYOL}
                    setAgreeBYOL={setAgreeBYOL}
                    onChange={({ licenseKey, isValid }) => {
                      setEffectiveLicenseKey(licenseKey)
                      setIsValidWindowsKey(isValid)
                    }}
                  />
                )}

                {/* Range IP */}
                {ips.length > 0 && (
                  <div className="flex grow flex-col gap-1.5">
                    <span className="text-sm font-medium">{t('buyVps.rangeIp')}</span>
                    {renderSelect(selectedIp, (e) => setSelectedIp(e.target.value), ips, true)}
                  </div>
                )}

                {/* ISP/Provider */}
                {providers.length > 0 && (
                  <div className="flex grow flex-col gap-1.5">
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
                <ExtensionInstallSelector form={form} updateForm={updateForm} />
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <VpsPasswordInput
                  randomPassword={randomPassword}
                  setRandomPassword={setRandomPassword}
                  passwordInput={passwordInput}
                  setPasswordInput={setPasswordInput}
                />

                <VpsPortInput osName={osName} onChange={setPortPayload} />
              </div>

              {/* Note */}
              <div className="flex grow items-baseline gap-2">
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
          <div className="bg-surface border-border sticky top-16 w-full max-w-92 min-w-72 space-y-5 self-start rounded-xl border p-5 shadow-lg sm:p-6">
            <VpsOrderSummary
              selectedPlanObj={selectedPlanObj}
              plansLoading={plansLoading}
              osName={osName}
              summary={summary}
              isCalculating={isCalculating}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              setAppliedDiscount={setAppliedDiscount}
              autoRenew={autoRenew}
              setAutoRenew={setAutoRenew}
              agreeTerms={agreeTerms}
              setAgreeTerms={setAgreeTerms}
              actions={
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
                    className="text-text-muted hover:text-text-primary w-full py-2 text-center font-medium transition-colors"
                  >
                    {t('cancel')}
                  </Link>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </main>
  )
}
