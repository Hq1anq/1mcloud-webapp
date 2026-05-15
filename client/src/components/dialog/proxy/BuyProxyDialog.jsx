import { useState, useEffect, useRef } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import axiosInstance from '../../../lib/axios'
import Dialog from '../../ui/Dialog'
import DropDown from '../../ui/DropDown'
import Checkbox from '../../ui/Checkbox'
import Skeleton from '../../ui/Skeleton'

export default function BuyProxyDialog({ isOpen, onClose, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  const [supportData, setSupportData] = useState({
    type: { option: { HTTPS: 'HTTPS' } },
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
  const [selectedNation, setSelectedNation] = useState('VN')
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

  const [summary, setSummary] = useState({
    original_price: '',
    discount: '',
    coupon: '',
    warning: '',
    must_pay: '',
  })
  const [isCalculating, setIsCalculating] = useState(true)
  const [calculationError, setCalculationError] = useState(false)

  const fetchedNationsRef = useRef(null)
  const lastPayloadRef = useRef(null)

  // Fetch support data whenever dialog is open and selectedNation changes
  useEffect(() => {
    if (!isOpen) return
    if (fetchedNationsRef.current === selectedNation) return

    const fetchSupportData = async () => {
      try {
        const res = await axiosInstance.get(`/server/proxy/support?nation=${selectedNation}`)
        if (res.data?.success) {
          fetchedNationsRef.current = selectedNation
          const info = res.data.info
          setSupportData(info)

          // Initialize Defaults
          const types = Object.keys(info.type?.option || {})
          if (types.length > 0) setSelectedType((prev) => (types.includes(prev) ? prev : types[1]))

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
        console.error(err)
      }
    }

    fetchSupportData()
  }, [isOpen, selectedNation])

  // Calculate effect
  useEffect(() => {
    if (isOpen && Number(amount) > 0) {
      const payload = {
        plan_id: 0,
        is_proxy: true,
        quantity: Number(amount),
        nation: selectedNation,
        duration: Number(selectedDuration),
        coupon: appliedDiscount,
      }
      const payloadStr = JSON.stringify(payload)

      if (lastPayloadRef.current === payloadStr) return
      lastPayloadRef.current = payloadStr

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
  }, [isOpen, amount, selectedNation, selectedDuration, appliedDiscount])

  const handleNationChange = (e) => {
    setSelectedNation(e.target.value)
  }

  const handlePay = async () => {
    // Validate inputs
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

    const proxyDataBuying = {
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

    const loadingId = addToast(t('processing'), 'loading')

    try {
      const res = await axiosInstance.post('/server/create', proxyDataBuying)
      if (res.data.success) {
        removeToast(loadingId)
        addToast(
          <>
            {t('buy.purchased')}{' '}
            <span className="text-text-toast-success">{res.data?.data.length}</span>{' '}
            {t('buy.proxySuccess')}
          </>,
          'success'
        )
        const extraConfig = {
          country: selectedNation,
          type: selectedType === 'proxy_https' ? 'HTTPS Proxy' : 'SOCKS5 Proxy',
          note: note,
        }
        if (onSuccess) onSuccess(res.data?.data, extraConfig)
        onClose()
      } else {
        removeToast(loadingId)
        addToast(res.data?.message || t('buy.purchaseFailed'), 'error')
      }
    } catch (err) {
      removeToast(loadingId)
      addToast(err.response?.data?.message || err.message || t('buy.errorOccurred'), 'error')
    }
  }

  if (!supportData) return null

  const renderSelect = (value, onChange, optionsMap, isArray = false) => {
    let options = []
    let displayValue = value
    let onSelect = onChange

    if (isArray) {
      options = optionsMap
      displayValue = value
      onSelect = (newValue) => onChange({ target: { value: newValue } })
    } else {
      options = Object.values(optionsMap || {})
      displayValue = optionsMap?.[value] || value
      onSelect = (newLabel) => {
        const key = Object.keys(optionsMap || {}).find((k) => optionsMap[k] === newLabel)
        if (key) onChange({ target: { value: key } })
      }
    }

    return (
      <DropDown value={displayValue} options={options} onChange={onSelect} className="rounded-lg" />
    )
  }

  const isps = Array.isArray(supportData.isp?.option) ? supportData.isp.option : []
  const states = Array.isArray(supportData.state?.option) ? supportData.state.option : []

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="p-0!">
      <div className="scroll-container text-text-primary flex h-full max-h-[85vh] flex-col overflow-y-auto md:flex-row">
        {/* Left Form Panel */}
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-primary text-2xl leading-tight font-bold">{t('buy.title')}</h1>
          </div>

          <div className="flex flex-1 flex-col gap-5">
            <div className="flex max-w-2xl flex-wrap items-center gap-5">
              <div className="flex grow flex-col gap-2">
                <span className="text-sm font-medium">{t('buy.type')}</span>
                {renderSelect(
                  selectedType === 'proxy_https' ? 'HTTPS' : 'SOCKS5',
                  (e) => setSelectedType(e.target.value),
                  supportData.type?.option || {}
                )}
              </div>

              <div className="flex grow flex-col gap-2">
                <span className="text-sm font-medium">{t('buy.duration')}</span>
                {renderSelect(
                  selectedDuration,
                  (e) => setSelectedDuration(e.target.value),
                  supportData.duration?.option || {}
                )}
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-text-primary text-sm font-medium">{t('buy.amount')}</span>
                <input
                  className="max-w-20"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>

              <div className="m-0 w-full border-0 p-0 max-[416px]:hidden"></div>

              <div className="flex grow flex-col gap-2">
                <span className="text-text-primary text-sm font-medium">{t('buy.nation')}</span>
                {renderSelect(selectedNation, handleNationChange, supportData.nation?.option || {})}
              </div>

              <div className="flex grow flex-col gap-2">
                <span className="text-text-primary text-sm font-medium">{t('buy.rangeIp')}</span>
                {renderSelect(
                  selectedRangeIp,
                  (e) => setSelectedRangeIp(e.target.value),
                  supportData.range_ip?.option || [],
                  true
                )}
              </div>

              {isps.length > 0 && (
                <div className="flex grow flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">{t('buy.provider')}</span>
                  {renderSelect(selectedIsp, (e) => setSelectedIsp(e.target.value), isps, true)}
                </div>
              )}

              {states.length > 0 && (
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">{t('buy.state')}</span>
                  {renderSelect(
                    selectedState,
                    (e) => setSelectedState(e.target.value),
                    states,
                    true
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={randomUsername}
                    onChange={(e) => setRandomUsername(e.target.checked)}
                  />
                  <span className="text-text-primary text-sm font-medium">
                    {t('buy.randomUsername')}
                  </span>
                </div>
                {!randomUsername && (
                  <div className="flex flex-col gap-1">
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

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={randomPassword}
                    onChange={(e) => setRandomPassword(e.target.checked)}
                  />
                  <span className="text-text-primary text-sm font-medium">
                    {t('buy.randomPassword')}
                  </span>
                </div>
                {!randomPassword && (
                  <div className="flex flex-col gap-1">
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

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={randomPort}
                    onChange={(e) => setRandomPort(e.target.checked)}
                  />
                  <span className="text-text-primary text-sm font-medium">
                    {t('buy.randomPort')}
                  </span>
                </div>
                {!randomPort && (
                  <input
                    type="number"
                    value={portInput}
                    onChange={(e) => setPortInput(e.target.value)}
                    placeholder="e.g. 8080"
                  />
                )}
              </label>
            </div>

            <label className="flex flex-1 flex-col gap-2">
              <span className="text-text-primary text-sm font-medium">{t('buy.note')}</span>
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
                className="h-full min-h-0 resize-none"
              />
            </label>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="bg-surface border-border flex w-full shrink-0 flex-col justify-between rounded-b-xl p-6 md:w-[380px] md:rounded-r-xl md:rounded-bl-none md:border-l md:p-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold">{t('buy.orderSummary')}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{t('buy.originalPrice')}</span>
                <Skeleton
                  isLoading={isCalculating}
                  isError={calculationError}
                  element={<span className="font-medium">{summary.original_price}</span>}
                  className="bg-text-muted h-4 w-20"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{t('discount')}</span>
                <Skeleton
                  isLoading={isCalculating}
                  isError={calculationError}
                  element={<span className="font-medium text-green-500">-{summary.discount}</span>}
                  className="bg-text-muted h-4 w-20"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{t('buy.coupon')}</span>
                <Skeleton
                  isLoading={isCalculating}
                  isError={calculationError}
                  element={<span className="font-medium text-green-500">{summary.coupon}</span>}
                  className="bg-text-muted h-4 w-12"
                />
              </div>
              <div className="bg-border my-1 h-px"></div>
              <div className="flex items-center justify-between text-base">
                <span className="font-bold">{t('totalToPay')}</span>
                <Skeleton
                  isLoading={isCalculating}
                  isError={calculationError}
                  element={
                    <span className="text-blue text-3xl font-bold">
                      {summary.must_pay.split(' ')[0]}{' '}
                      <span className="text-lg font-normal">VND</span>
                    </span>
                  }
                  className="bg-text-muted h-[37.6px] w-40"
                />
              </div>
              {summary.warning && (
                <div className="mt-1 text-xs text-red-500">{summary.warning}</div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="text-text-muted text-xs font-medium tracking-wider uppercase">
                {t('buy.discountCode')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setAppliedDiscount(discountCode)
                    }
                  }}
                  placeholder="e.g. SAVE20"
                  className="h-10 flex-1 px-3 text-sm"
                  style={{ minHeight: '40px' }} // override defaults
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
                <span className="text-text-primary cursor-pointer text-sm font-medium select-none">
                  {t('buy.autoRenew')}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span className="text-text-primary cursor-pointer text-sm font-medium select-none">
                  {t('buy.agreeTerms')}
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={handlePay}
              disabled={!agreeTerms || summary.warning === 'Tài khoản không đủ'}
              className="group enabled:bg-blue flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold text-white shadow-sm transition-all disabled:bg-gray-500"
            >
              <span>{t('buy.payNow')}</span>
              <svg
                className="size-5 group-hover:translate-x-1"
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
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary h-12 w-full rounded-lg bg-transparent font-medium transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
