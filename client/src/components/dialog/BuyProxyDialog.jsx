import { useState, useEffect } from 'react'
import axiosInstance from '../../lib/axios'
import { useToast } from '../../context/ToastContext'
import Dialog from '../ui/Dialog'
import DropDown from '../ui/DropDown'
import Checkbox from '../ui/Checkbox'

export default function BuyProxyDialog({ isOpen, onClose, onSuccess }) {
  const { addToast } = useToast()

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
  const [selectedType, setSelectedType] = useState('HTTPS')
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

  const fetchSupport = async (nation) => {
    try {
      const res = await axiosInstance.get(`/server/proxy/support?nation=${nation}`)
      if (res.data?.success) {
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

  // Fetch init data
  useEffect(() => {
    if (isOpen) {
      fetchSupport('VN')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Calculate effect
  useEffect(() => {
    if (isOpen && supportData && Number(amount) > 0) {
      const delayFn = setTimeout(() => {
        axiosInstance
          .post('/server/create/calculate', {
            quantity: Number(amount),
            nation: selectedNation,
            duration: Number(selectedDuration),
            coupon: appliedDiscount,
          })
          .then((res) => {
            if (res.data.success) setSummary(res.data.info)
          })
          .catch(() => {})
      }, 500)
      return () => clearTimeout(delayFn)
    }
  }, [isOpen, supportData, amount, selectedNation, selectedDuration, appliedDiscount])

  const handleNationChange = (e) => {
    const nationCode = e.target.value
    setSelectedNation(nationCode)
    fetchSupport(nationCode)
  }

  const handlePay = async () => {
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

    try {
      const res = await axiosInstance.post('/server/create', proxyDataBuying)
      if (res.data?.success || res.status === 200) {
        addToast(
          <>
            Purchased <span className="text-text-toast-success">{res.data?.data.length}</span> proxy
            successfully!
          </>,
          'success'
        )
        if (onSuccess) onSuccess(res.data?.data)
        onClose()
      } else {
        addToast(res.data?.message || 'Purchase failed', 'error')
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Error occurred', 'error')
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
      <div className="scroll-container text-text-secondary flex h-full max-h-[85vh] flex-col overflow-y-auto md:flex-row">
        {/* Left Form Panel */}
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-text-title text-2xl leading-tight font-bold">Buy Proxy</h1>
          </div>

          <div className="flex flex-1 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-sm font-medium">Type</span>
                {renderSelect(
                  selectedType,
                  (e) => setSelectedType(e.target.value),
                  supportData.type?.option || {}
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <span className="text-sm font-medium">Duration</span>
                {renderSelect(
                  selectedDuration,
                  (e) => setSelectedDuration(e.target.value),
                  supportData.duration?.option || {}
                )}
              </div>

              <label className="flex flex-1 flex-col gap-2">
                <span className="text-text-secondary text-sm font-medium">Amount</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter quantity"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <div className="flex min-w-56 flex-1 flex-col gap-2">
                <span className="text-text-secondary text-sm font-medium">Nation</span>
                {renderSelect(selectedNation, handleNationChange, supportData.nation?.option || {})}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <span className="text-text-secondary text-sm font-medium">Range IP</span>
                {renderSelect(
                  selectedRangeIp,
                  (e) => setSelectedRangeIp(e.target.value),
                  supportData.range_ip?.option || [],
                  true
                )}
              </div>

              {isps.length > 0 && (
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-text-secondary text-sm font-medium">Provider</span>
                  {renderSelect(selectedIsp, (e) => setSelectedIsp(e.target.value), isps, true)}
                </div>
              )}

              {states.length > 0 && (
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-text-secondary text-sm font-medium">State</span>
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
                  <span className="text-text-secondary text-sm font-medium">Random Username</span>
                </div>
                {!randomUsername && (
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Custom username"
                  />
                )}
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={randomPassword}
                    onChange={(e) => setRandomPassword(e.target.checked)}
                  />
                  <span className="text-text-secondary text-sm font-medium">Random Password</span>
                </div>
                {!randomPassword && (
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Custom password"
                  />
                )}
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={randomPort}
                    onChange={(e) => setRandomPort(e.target.checked)}
                  />
                  <span className="text-text-secondary text-sm font-medium">Random Port</span>
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
              <span className="text-text-secondary text-sm font-medium">Note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter note"
                className="h-full min-h-0 resize-none"
              />
            </label>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="bg-surface border-border flex w-full shrink-0 flex-col justify-between rounded-b-xl p-6 md:w-[380px] md:rounded-r-xl md:rounded-bl-none md:border-l md:p-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Original Price</span>
                <span className="font-medium">{summary.original_price}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Discount</span>
                <span className="font-medium text-green-500">
                  {summary.discount && `-${summary.discount}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Coupon</span>
                <span className="font-medium text-green-500">{summary.coupon}</span>
              </div>
              <div className="bg-border my-1 h-px"></div>
              <div className="flex items-center justify-between text-base">
                <span className="font-bold">Total to Pay</span>
                <h1 className="font-bold">{summary.must_pay}</h1>
              </div>
              {summary.warning && (
                <div className="mt-1 text-xs text-red-500">{summary.warning}</div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="text-text-muted text-xs font-medium tracking-wider uppercase">
                Discount Code
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
              <div className="flex items-center gap-2">
                <Checkbox checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
                <span
                  onClick={() => setAutoRenew(!autoRenew)}
                  className="text-text-secondary cursor-pointer text-sm font-medium select-none"
                >
                  Auto Renew
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className="text-text-secondary cursor-pointer text-sm font-medium select-none"
                >
                  Agree to our terms of service.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={handlePay}
              disabled={!agreeTerms || summary.warning === 'Tài khoản không đủ'}
              className={`group flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold text-white shadow-sm transition-all ${
                !agreeTerms || summary.warning === 'Tài khoản không đủ'
                  ? 'cursor-not-allowed bg-gray-500 opacity-50'
                  : 'bg-bg-getInfo hover:brightness-(--highlight-brightness)'
              }`}
            >
              <span>Pay Now</span>
              <svg
                className="h-5 w-5 group-hover:translate-x-1"
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
              className="text-text-muted hover:text-text-secondary h-12 w-full rounded-lg bg-transparent font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
