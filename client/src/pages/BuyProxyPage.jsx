import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext.jsx'
import { useTranslation } from '../i18n/index.js'
import { proxyNations } from '../data/proxyNations.jsx'
import { useSafeCopy } from '../context/SafeCopyContext.jsx'
import axiosInstance from '../lib/axios.js'
import useProfileStore from '../store/useProfileStore.js'
import useProxyStore from '../store/useProxyStore.js'
import DropDown from '../components/ui/DropDown.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import NumberStepper from '../components/ui/NumberStepper.jsx'

export default function BuyProxyPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const nationFromState = location.state?.nation || null
  const priceFromState = location.state?.price || null

  const { addToast, removeToast } = useToast()
  const { safeCopy } = useSafeCopy()
  const t = useTranslation()
  const fetchBalance = useProfileStore((s) => s.fetchBalance)
  const syncToDb = useProxyStore((s) => s.syncToDb)

  const selectedNation = searchParams.get('nation') || nationFromState?.symbol || 'VN'

  // ── Support data state (with initial fallback options) ────────────────────
  const [supportData, setSupportData] = useState({
    type: { option: { proxy_https: 'HTTPS', proxy_socks5: 'SOCKS5' } },
    duration: { option: { 1: '1 Tháng' } },
    nation: {
      option: {
        VNR: 'Việt Nam(VN) - Dân cư',
        VN: 'Việt Nam(VN)',
        SG: 'Singapore(SG)',
        US: 'Mỹ(US)',
        CA: 'Canada(CA)',
        AU: 'Úc(AU)',
        DE: 'Đức(DE)',
        UK: 'Anh(UK)',
        FR: 'Pháp(FR)',
        JP: 'Nhật Bản(JP)',
        HK: 'Hồng Kông(HK)',
      },
    },
    range_ip: { option: ['Ngẫu nhiên'] },
    isp: { option: ['Ngẫu nhiên'] },
  })

  // ── Form state ────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState('1')
  const [selectedType, setSelectedType] = useState('proxy_https')
  const [selectedDuration, setSelectedDuration] = useState('1')
  const [selectedRangeIp, setSelectedRangeIp] = useState('Ngẫu nhiên')
  const [selectedIsp, setSelectedIsp] = useState('Ngẫu nhiên')
  const [selectedState, setSelectedState] = useState('Ngẫu nhiên')

  const [randomUsername, setRandomUsername] = useState(true)
  const [usernameInput, setUsernameInput] = useState('')
  const [randomPassword, setRandomPassword] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [randomPort, setRandomPort] = useState(true)
  const [portInput, setPortInput] = useState('')

  const [note, setNote] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState('')

  const [autoRenew, setAutoRenew] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // ── Summary & Pricing calculation state ──────────────────────────────────
  const [summary, setSummary] = useState({
    original_price: priceFromState ? `${priceFromState} VND` : '',
    discount: '',
    coupon: '',
    warning: '',
    must_pay: priceFromState ? `${priceFromState} VND` : '',
  })
  const [isCalculating, setIsCalculating] = useState(true)
  const [calculationError, setCalculationError] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const fetchedNationsRef = useRef(null)

  // Nation object from list
  const currentNationObj = useMemo(() => {
    return (
      proxyNations.find((n) => n.symbol === selectedNation) ||
      (nationFromState && nationFromState.symbol === selectedNation ? nationFromState : null) || {
        symbol: selectedNation,
        name: selectedNation,
        flag: null,
      }
    )
  }, [selectedNation, nationFromState])

  // ── Fetch support data when selectedNation changes ────────────────────────
  useEffect(() => {
    if (fetchedNationsRef.current === selectedNation) return

    const fetchSupportData = async () => {
      try {
        const res = await axiosInstance.get(`/server/proxy/support?nation=${selectedNation}`)
        if (res.data?.success) {
          fetchedNationsRef.current = selectedNation
          const info = res.data.info
          setSupportData(info)

          // Initialize Defaults if options present
          const types = Object.keys(info.type?.option || {})
          if (types.length > 0) setSelectedType((prev) => (types.includes(prev) ? prev : types[0]))

          const durations = Object.keys(info.duration?.option || {})
          if (durations.length > 0)
            setSelectedDuration((prev) => (durations.includes(prev) ? prev : durations[0]))

          const rangeIps = Array.isArray(info.range_ip?.option) ? info.range_ip.option : []
          if (rangeIps.length > 0)
            setSelectedRangeIp((prev) => (rangeIps.includes(prev) ? prev : rangeIps[0]))

          const isps = Array.isArray(info.isp?.option) ? info.isp.option : []
          setSelectedIsp(isps.length > 0 ? isps[0] : '')

          const states = Array.isArray(info.state?.option) ? info.state.option : []
          setSelectedState(states.length > 0 ? states[0] : '')
        }
      } catch (err) {
        console.error('Failed to fetch Proxy support data:', err)
      }
    }

    fetchSupportData()
  }, [selectedNation])

  // ── Calculate price effect ────────────────────────────────────────────────
  useEffect(() => {
    if (Number(amount) > 0) {
      const payload = {
        plan_id: 0,
        is_proxy: true,
        quantity: Number(amount),
        nation: selectedNation,
        duration: Number(selectedDuration),
        coupon: appliedDiscount,
      }

      const delayFn = setTimeout(() => {
        setCalculationError(false)
        setIsCalculating(true)
        axiosInstance
          .post('/server/create/calculate', payload)
          .then((res) => {
            if (res.data.success) setSummary(res.data.info)
            else setCalculationError(true)
          })
          .catch(() => {
            setCalculationError(true)
          })
          .finally(() => {
            setIsCalculating(false)
          })
      }, 300)

      return () => clearTimeout(delayFn)
    }
  }, [amount, selectedNation, selectedDuration, appliedDiscount])

  // ── Pay handler ───────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!randomUsername && usernameInput && !/^[a-z0-9]+$/.test(usernameInput)) {
      addToast(t('buy.invalidUsername'), 'warning')
      return
    }

    if (
      !randomPassword &&
      passwordInput &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(passwordInput)
    ) {
      addToast(t('buy.invalidPassword'), 'warning')
      return
    }

    const payload = {
      plan_id: 0,
      duration: Number(selectedDuration),
      quantity: Number(amount),
      os_id: 1,
      nation: selectedNation,
      proxy_type: selectedType,
      random_username: randomUsername,
      random_password: randomPassword,
      random_remote_port: randomPort,
      username: randomUsername ? undefined : usernameInput,
      password: randomPassword ? undefined : passwordInput,
      remote_port: randomPort ? undefined : portInput,
      range_ip: selectedRangeIp,
      note: note,
      install_chrome: false,
      install_firefox: false,
      isp: selectedIsp || undefined,
      state: selectedState || undefined,
      coupon: appliedDiscount,
      auto_renew: autoRenew,
      is_proxy: true,
    }

    setIsBuying(true)
    const loadingId = addToast(t('processing'), 'loading')

    try {
      const res = await axiosInstance.post('/server/create', payload)
      if (res.data.success) {
        const purchasedProxies = res.data?.data || []

        addToast(
          <>
            {t('buy.purchased')}{' '}
            <span className="text-text-toast-success">{purchasedProxies.length}</span>{' '}
            {t('buy.proxySuccess')}
          </>,
          'success'
        )

        fetchBalance()

        // Sync new proxies to DB
        if (purchasedProxies.length > 0) {
          const extraConfig = {
            country: selectedNation,
            type: selectedType === 'proxy_https' ? 'HTTPS Proxy' : 'SOCKS5 Proxy',
            note: note,
          }
          const rowsToSync = purchasedProxies.map((srv) => ({ ...srv, ...extraConfig }))
          syncToDb(rowsToSync)

          // Copy new Proxy info to clipboard
          const proxyText = purchasedProxies
            .map((item) => `${item.ip_port}/${item.user_pass}`)
            .join('\n')
          safeCopy(proxyText).then(
            (ok) =>
              ok &&
              addToast(
                <>
                  {t('manager.copied')}{' '}
                  <span className="text-text-toast-success">{purchasedProxies.length}</span> Proxy
                </>,
                'success'
              )
          )
        }

        // Reset form state after successful purchase
        setAgreeTerms(false)
        setNote('')
        setDiscountCode('')
        setAppliedDiscount('')
      } else {
        addToast(res.data?.message || t('buy.purchaseFailed'), 'error')
      }
    } catch (err) {
      console.error('Buy Proxy Error: ', err)
      addToast(err.response?.data?.message || err.message || t('buy.errorOccurred'), 'error')
    } finally {
      removeToast(loadingId)
      setIsBuying(false)
    }
  }

  // ── renderSelect helper (matching BuyVpsPage) ──────────────────────────────
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

  const isps = Array.isArray(supportData.isp?.option) ? supportData.isp.option : []
  const states = Array.isArray(supportData.state?.option) ? supportData.state.option : []

  const canPay =
    agreeTerms && !isBuying && summary.warning !== 'Tài khoản không đủ' && !calculationError

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="bg-body text-text-primary min-h-screen pb-20">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="bg-surface/95 border-border sticky top-0 z-30 border-b shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-text-muted flex items-center gap-2 text-xs">
            <Link to="/price/proxy" className="hover:text-primary transition-colors">
              {t('nav.proxyPrice')}
            </Link>
            <span>/</span>
            <span className="text-text-primary font-semibold">
              {t('buy.title')} — {t(`nation.${selectedNation}`) || currentNationObj.name}
            </span>
          </div>

          {/* Back link */}
          <Link
            to="/price/proxy"
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
            {t('proxyPrice.sectionTitle')}
          </Link>
        </div>
      </div>

      {/* ── Main 2-col layout ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex shrink-0 flex-col gap-6 md:flex-row">
          {/* ── LEFT COLUMN: Banner + Config form ─────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Proxy Banner */}
            <div className="bg-surface border-border rounded-xl border p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg">
                  {currentNationObj.flag}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-6">
                    <h2 className="text-text-primary text-base font-bold">
                      {t(`nation.${selectedNation}`) || currentNationObj.name}
                    </h2>
                    <span className="bg-green/15 text-green border-green/30 rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                      {t('priceCard.available')}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 text-xs font-medium">IPv4 Dedicated Proxy</p>
                </div>
              </div>
            </div>

            {/* ── Form block ─────────────────────────────────────────── */}
            <div className="bg-surface border-border flex grow flex-col gap-5 rounded-xl border p-5 shadow-xs sm:p-6">
              {/* Row 1: Amount (stay first) / Duration / Type */}
              <div className="flex flex-wrap gap-5">
                {/* Quantity - stay first */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t('buy.amount')}</label>
                  <NumberStepper value={amount} onChange={setAmount} min={1} max={50} />
                </div>

                {/* Duration */}
                <div className="flex min-w-48 grow flex-col gap-1.5 text-lg">
                  <span className="text-sm font-medium">{t('buy.duration')}</span>
                  {renderSelect(
                    selectedDuration,
                    (e) => setSelectedDuration(e.target.value),
                    supportData.duration?.option || {}
                  )}
                </div>

                {/* Protocol Type */}
                <div className="flex min-w-48 grow flex-col gap-1.5 text-lg">
                  <span className="text-sm font-medium">{t('buy.type')}</span>
                  {renderSelect(
                    selectedType === 'proxy_https' ? 'HTTPS' : 'SOCKS5',
                    (e) => setSelectedType(e.target.value),
                    supportData.type?.option || {}
                  )}
                </div>

                {/* Range IP*/}
                <div className="flex min-w-48 grow flex-col gap-1.5 text-lg">
                  <span className="text-sm font-medium">{t('buy.rangeIp')}</span>
                  {renderSelect(
                    selectedRangeIp,
                    (e) => setSelectedRangeIp(e.target.value),
                    supportData.range_ip?.option || [],
                    true
                  )}
                </div>

                {isps.length > 0 && (
                  <div className="flex min-w-48 grow flex-col gap-1.5 text-lg">
                    <span className="text-sm font-medium">{t('buy.provider')}</span>
                    {renderSelect(selectedIsp, (e) => setSelectedIsp(e.target.value), isps, true)}
                  </div>
                )}

                {states.length > 0 && (
                  <div className="flex min-w-48 grow flex-col gap-1.5 text-lg">
                    <span className="text-sm font-medium">{t('buy.state')}</span>
                    {renderSelect(
                      selectedState,
                      (e) => setSelectedState(e.target.value),
                      states,
                      true
                    )}
                  </div>
                )}
              </div>

              {/* Random username, pass, port */}
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                {/* Username */}
                <label className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={randomUsername}
                      onChange={(e) => setRandomUsername(e.target.checked)}
                    />
                    <span className="font-medium whitespace-nowrap">{t('buy.randomUsername')}</span>
                  </div>
                  {!randomUsername && (
                    <div className="flex flex-col gap-1 text-lg">
                      <input
                        type="text"
                        className={`${
                          usernameInput && !/^[a-z0-9]+$/.test(usernameInput)
                            ? 'border-orange focus:border-orange focus:ring-orange/20'
                            : ''
                        }`}
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder={t('buy.customUsername')}
                      />
                      {usernameInput && !/^[a-z0-9]+$/.test(usernameInput) && (
                        <span className="text-orange text-xs">{t('buy.invalidUsername')}</span>
                      )}
                    </div>
                  )}
                </label>

                {/* Password */}
                <label className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={randomPassword}
                      onChange={(e) => setRandomPassword(e.target.checked)}
                    />
                    <span className="font-medium whitespace-nowrap">{t('buy.randomPassword')}</span>
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
                        placeholder={t('buy.customPassword')}
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
                    <span className="font-medium whitespace-nowrap">{t('buy.randomPort')}</span>
                  </div>
                  {!randomPort && (
                    <div className="flex flex-col gap-1 text-lg">
                      <input
                        type="number"
                        value={portInput}
                        onChange={(e) => setPortInput(e.target.value)}
                        placeholder="1024 – 65535"
                      />
                    </div>
                  )}
                </label>
              </div>

              {/* Note textarea: expand height if needed */}
              <div className="flex grow items-baseline gap-2 text-lg">
                <span className="text-sm font-medium whitespace-nowrap">{t('buy.note')}</span>
                <textarea
                  value={note}
                  onChange={(e) => {
                    const val = e.target.value
                    const now = new Date()
                    const keywordReplacer = (match) => {
                      let d = new Date(now)
                      if (match === '+1W') d.setDate(d.getDate() + 7)
                      else if (match === '+2W') d.setDate(d.getDate() + 14)
                      else if (match === '+1M') d.setDate(d.getDate() + 30)

                      const resD = String(d.getDate()).padStart(2, '0')
                      const resM = String(d.getMonth() + 1).padStart(2, '0')
                      return `${resD}${resM}`
                    }
                    const newVal = val.replace(/\+(1W|2W|1M)/g, keywordReplacer)
                    setNote(newVal)
                  }}
                  placeholder={t('buy.enterNote')}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Order Summary sidebar (sticky) ──── */}
          <div className="sticky top-16 w-full max-w-92 min-w-72 self-start">
            <div className="bg-surface border-border space-y-5 rounded-xl border p-5 shadow-lg sm:p-6">
              <h3 className="text-text-primary border-border flex items-center justify-between border-b pb-3 text-base font-bold">
                <span>{t('buy.orderSummary')}</span>
                <span className="bg-blue/15 text-blue rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                  1MCLOUD
                </span>
              </h3>

              {/* Summary items */}
              <div className="flex flex-col gap-3 text-sm">
                {/* Selected Nation */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-text-muted text-xs">{t('buy.nation')}:</span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="h-4 w-6 shrink-0 overflow-hidden rounded-xs">
                        {currentNationObj.flag}
                      </div>
                      <strong className="text-text-primary text-sm">
                        {t(`nation.${selectedNation}`) || currentNationObj.name}
                      </strong>
                    </div>
                  </div>
                  <span className="bg-terminal border-border rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold uppercase">
                    {selectedType === 'proxy_https' ? 'HTTPS' : 'SOCKS5'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{t('buy.originalPrice')}:</span>
                  <Skeleton
                    isLoading={isCalculating}
                    isError={calculationError}
                    element={<span className="font-semibold">{summary.original_price}</span>}
                    className="bg-text-muted h-4 w-24 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{t('discount')}:</span>
                  <Skeleton
                    isLoading={isCalculating}
                    isError={calculationError}
                    element={
                      <span className="text-green font-semibold">-{summary.discount || '0'}</span>
                    }
                    className="bg-text-muted h-4 w-20 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{t('buy.coupon')}:</span>
                  <Skeleton
                    isLoading={isCalculating}
                    isError={calculationError}
                    element={
                      <span className="text-green font-semibold">{summary.coupon || '—'}</span>
                    }
                    className="bg-text-muted h-4 w-14 rounded"
                  />
                </div>

                <div className="border-border/60 border-t" />

                {/* Total */}
                <div className="flex items-baseline justify-between text-base">
                  <span className="font-bold">{t('totalToPay')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    isError={calculationError}
                    element={
                      <span className="text-blue text-3xl font-bold">
                        {summary.must_pay ? summary.must_pay.split(' ')[0] : '--'}{' '}
                        <span className="text-lg font-normal">VND</span>
                      </span>
                    }
                    className="bg-text-muted h-[37.6px] w-40 rounded"
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
                  {t('buy.discountCode')}
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
                    {t('buy.autoRenew')}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="cursor-pointer font-medium select-none">
                    {t('buy.agreeTerms')}
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
                  <span>{t('buy.payNow')}</span>
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
                  to="/price/proxy"
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
