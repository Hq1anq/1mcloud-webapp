import { useState, useEffect } from 'react'
import { useToast } from '../../../context/ToastContext.jsx'
import { useTranslation } from '../../../i18n/index.js'
import { vpsNations, vpsSpecialOptions, getDefaultPlans } from '../../../data/vpsNations.jsx'
import axiosInstance from '../../../lib/axios.js'
import Dialog from '../../ui/Dialog.jsx'
import DropDown from '../../ui/DropDown.jsx'
import Checkbox from '../../ui/Checkbox.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import getOS from '../../../data/osMap.js'

export default function BuyVpsDialog({ isOpen, onClose, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  // Step: 'grid' | 'config'
  const [step, setStep] = useState('grid')
  const [selectedNation, setSelectedNation] = useState(null)

  // Plans fetched from API
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState(null)

  // Support data fetched ONCE after first plan is selected
  const [supportData, setSupportData] = useState({
    duration: { option: { 1: '1 Tháng' } },
    os: {
      option: {
        1: 'Windows Server 2012 R2 Standard',
        2: 'Windows Server 2019 Standard',
        3: 'Windows Server 2022 Standard',
        4: 'Windows 10 Pro',
        5: 'Win10 Enterprise',
        6: 'CentOS 7.7',
        7: 'CentOS 8.5.2111',
        8: 'Ubuntu 18.04.4 LTS',
        10: 'Ubuntu 20.04.4 LTS',
        11: 'Windows 11 Pro',
        18: 'Windows Server 2016 Standard',
        19: 'Ubuntu 22.04.5 LTS',
        20: 'Rocky Linux 9.4',
        21: 'AlmaLinux 9.4',
      },
    },
    ip: { option: ['Ngẫu nhiên'] },
    provider: { option: ['Ngẫu nhiên'] },
  })

  // Form fields mapped to support API response
  const [selectedOs, setSelectedOs] = useState('19')
  const [selectedDuration, setSelectedDuration] = useState('1')
  const [selectedIp, setSelectedIp] = useState('Ngẫu nhiên')
  const [selectedProvider, setSelectedProvider] = useState('Ngẫu nhiên')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [form, setForm] = useState({
    install_chrome: false,
    install_firefox: false,
  })
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

  const [summary, setSummary] = useState({
    original_price: '',
    discount: '',
    coupon: '',
    warning: '',
    must_pay: '',
  })
  const [isCalculating, setIsCalculating] = useState(true)
  const [isBuying, setIsBuying] = useState(false)

  // Reset when dialog reopens
  useEffect(() => {
    if (isOpen) {
      setStep('grid')
      setSummary({
        original_price: '',
        discount: '',
        coupon: '',
        warning: '',
        must_pay: '',
      })
    }
  }, [isOpen])

  // Fetch plans and support data ONCE when nation is selected
  useEffect(() => {
    if (!selectedNation || step !== 'config') return

    const defaults = getDefaultPlans(selectedNation)
    setPlans(defaults)

    const fetchData = async () => {
      setPlansLoading(true)
      try {
        const planRes = await axiosInstance.get(`/vps/plan?plan=${selectedNation}`)
        if (planRes.data?.success && Array.isArray(planRes.data.info)) {
          // Sort plans by string length first, then alphabetically (works great for D1, D9, D10)
          const sortedPlans = planRes.data.info.sort((a, b) => a.name.localeCompare(b.name))

          setPlans(sortedPlans)

          const available = sortedPlans.filter((p) => p.status === 'available')

          if (available.length > 0) {
            let firstSelectedPlanId = available[0].id
            setSelectedPlanId(firstSelectedPlanId)

            // Fetch support only once using the first plan id without blocking the table render
            axiosInstance
              .get(`/vps/support?plan_id=${firstSelectedPlanId}`)
              .then((suppRes) => {
                if (suppRes.data?.success) {
                  const { os, ...restInfo } = suppRes.data.info
                  setSupportData((prev) => ({
                    ...prev,
                    ...restInfo,
                  }))

                  // Initialize Defaults
                  const durations = Object.keys(restInfo.duration?.option || {})
                  if (durations.length > 0)
                    setSelectedDuration((prev) => (durations.includes(prev) ? prev : durations[0]))

                  const ips = Array.isArray(restInfo.ip?.option) ? restInfo.ip.option : []
                  if (ips.length > 0) setSelectedIp((prev) => (ips.includes(prev) ? prev : ips[0]))

                  const providers = Array.isArray(restInfo.provider?.option)
                    ? restInfo.provider.option
                    : []
                  if (providers.length > 0)
                    setSelectedProvider((prev) => (providers.includes(prev) ? prev : providers[0]))

                  const locations = Array.isArray(restInfo.location?.option)
                    ? restInfo.location.option
                    : []
                  if (locations.length > 0)
                    setSelectedLocation((prev) => (locations.includes(prev) ? prev : locations[0]))
                }
              })
              .catch((supportErr) => {
                console.error('Failed to fetch VPS support:', supportErr)
              })
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
  }, [selectedNation, step, addToast, t])

  // Calculate pricing
  useEffect(() => {
    if (isOpen && selectedPlanId && Number(amount) > 0) {
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
          .finally(() => {
            setIsCalculating(false)
          })
      }, 300)
      return () => clearTimeout(delayFn)
    }
  }, [isOpen, selectedPlanId, amount, selectedDuration, appliedDiscount])

  const handleSelectNation = (symbol) => {
    setSelectedNation(symbol)
    setStep('config')
  }

  const handleBack = () => {
    setStep('grid')
    setIsCalculating(true)
  }

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

    const vpsDataBuying = {
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
    }

    setIsBuying(true)
    const loadingId = addToast(t('processing'), 'loading')

    try {
      const res = await axiosInstance.post('/server/create', vpsDataBuying)
      if (res.data.success) {
        addToast(
          <>
            {t('buy.purchased')}{' '}
            <span className="text-text-toast-success">{res.data?.data.length}</span> VPS!
          </>,
          'success'
        )
        const extraConfig = {
          plan_number: selectedPlanObj?.name,
          country: selectedNation,
          he_dieu_hanh: getOS(supportData?.os?.option?.[selectedOs]),
          price_vnd: selectedPlanObj?.price,
          note: note,
        }
        if (onSuccess) onSuccess(res.data?.data, extraConfig)
        setAgreeTerms(false)
        onClose()
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
      <DropDown
        value={displayValue}
        options={options}
        onChange={onSelect}
        className="rounded-lg text-base sm:text-lg"
        menuClassName="sm:text-lg text-base"
      />
    )
  }

  // Common UI mappings
  const allItems = [...vpsNations, ...vpsSpecialOptions]
  const selectedItem = allItems.find((n) => n.symbol === selectedNation)
  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId)

  const ips = supportData && Array.isArray(supportData.ip?.option) ? supportData.ip.option : []
  const providers =
    supportData && Array.isArray(supportData.provider?.option) ? supportData.provider.option : []
  const locations =
    supportData && Array.isArray(supportData.location?.option) ? supportData.location.option : []

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-full overflow-hidden! p-0! text-sm md:w-[850px] lg:w-[1080px]"
    >
      {/* Slider track */}
      <div
        className="text-text-primary flex max-h-[85vh] w-full"
        style={{
          transform: step === 'grid' ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ─── PAGE 1: Nation Grid ──────────────────────── */}
        <div className="scroll-container flex max-h-[80vh] w-full flex-none shrink-0 flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-white/10 px-6 py-4">
            <div className="bg-blue flex items-center justify-center rounded-lg p-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-7 fill-current"
              >
                <path d="M112 256C112 167.6 183.6 96 272 96C319.1 96 361.4 116.4 390.7 148.7C401.3 145.6 412.5 144 424 144C490.3 144 544 197.7 544 264C544 277.2 541.9 289.9 537.9 301.8C579.5 322.9 608 366.1 608 416C608 486.7 550.7 544 480 544L176 544C96.5 544 32 479.5 32 400C32 343.2 64.9 294.1 112.7 270.6C112.3 265.8 112 260.9 112 256zM272 144C210.1 144 160 194.1 160 256C160 264.4 160.9 272.6 162.7 280.5C165.4 292.6 158.4 304.8 146.6 308.6C107.9 321 80 357.3 80 400C80 453 123 496 176 496L480 496C524.2 496 560 460.2 560 416C560 378.6 534.3 347.1 499.5 338.4C492 336.5 485.9 331.2 483 324.1C480.1 317 480.9 308.9 485 302.4C492 291.3 496 278.2 496 264.1C496 224.3 463.8 192.1 424 192.1C412.9 192.1 402.5 194.6 393.2 199C382.7 204 370.1 200.7 363.4 191.2C343.1 162.6 309.7 144.1 272.1 144.1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-primary text-2xl font-bold">{t('buyVps.title')}</h1>
              <p className="text-text-muted">{t('buyVps.subtitle')}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              onClick={onClose}
              fill="none"
              viewBox="0 0 24 24"
              className="text-text-muted hover:text-text-primary ml-auto size-7 cursor-pointer stroke-current stroke-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Nation Grid */}
          <div className="p-4 md:p-3">
            <div className="grid auto-rows-[1fr] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
              {vpsNations.map((nation) => (
                <button
                  key={nation.symbol}
                  onClick={() => handleSelectNation(nation.symbol)}
                  className="bg-thead border-card-border hover:border-blue hover:bg-surface group flex flex-col items-center justify-center gap-3 rounded-xl border p-5 active:scale-[0.97]"
                >
                  <div className="aspect-4/3 w-16 shrink-0 overflow-hidden rounded-md group-hover:scale-110 sm:w-20">
                    {nation.flag}
                  </div>
                  <span className="group-hover:text-primary leading-tight font-semibold group-hover:translate-y-1">
                    {nation.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-border m-auto my-3 h-px" />

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {vpsSpecialOptions.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelectNation(item.symbol)}
                  className="bg-thead border-card-border hover:border-blue group flex flex-col items-center justify-center rounded-xl border p-3 active:scale-[0.97]"
                >
                  <div className="text-text-muted group-hover:text-primary flex aspect-4/3 w-16 items-center justify-center rounded-md group-hover:scale-120 sm:w-20">
                    <span className="size-12">{item.flag}</span>
                  </div>
                  <span className="group-hover:text-primary leading-tight font-semibold group-hover:translate-y-1">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── PAGE 2: Config + Summary ─────────────────── */}
        <div className="flex max-h-[80vh] w-full flex-none shrink-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          {/* Left: Plan table + config */}
          <div className="flex h-fit min-w-0 flex-1 flex-col md:h-auto">
            {/* Header with back */}
            <header className="border-border flex shrink-0 items-center gap-3 border-b px-6 py-4">
              <svg
                onClick={handleBack}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="stroke-text-muted hover:stroke-text-primary size-6 fill-none stroke-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <h1 className="text-primary text-lg leading-none font-bold">
                  {t('buyVps.title')} — {selectedItem?.name || selectedNation}
                </h1>
                <p className="text-text-muted mt-1 text-xs">{t('buyVps.configureInstance')}</p>
              </div>
            </header>

            {/* Scrollable content */}
            <div className="scroll-container flex flex-1 flex-col gap-2 px-4 md:overflow-y-auto">
              {/* Plan Table */}
              <section>
                <div className="m-2 flex items-center justify-between">
                  <h3 className="text-text-muted font-semibold tracking-wider uppercase">
                    {t('buyVps.availablePlans')}
                  </h3>
                  {!plansLoading && (
                    <span className="bg-blue/10 text-blue rounded-full px-2 py-0.5 text-xs font-medium">
                      {plans.filter((p) => p.status === 'available').length}{' '}
                      {t('buyVps.tiersAvailable')}
                    </span>
                  )}
                </div>

                {/* Make table have a max height and scroll inner content */}
                <div className="scroll-container border-border overflow-x-auto overflow-y-auto rounded-lg border">
                  <table className="min-w-full text-lg">
                    <thead className="bg-thead border-wrapper border-b-2">
                      <tr className="text-text-muted">
                        <th className="w-12 px-3 py-2 text-center font-semibold whitespace-nowrap uppercase" />
                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap uppercase">
                          {t('buyVps.planName')}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap uppercase">
                          CPU - RAM
                        </th>
                        <th className="px-3 py-2 text-center font-semibold whitespace-nowrap uppercase">
                          SSD
                        </th>
                        {selectedNation === 'gpu' && (
                          <th className="px-3 py-2 text-center font-semibold whitespace-nowrap uppercase">
                            vRAM
                          </th>
                        )}
                        <th className="px-3 py-2 font-semibold whitespace-nowrap uppercase">
                          {t('buyVps.price')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-text-primary">
                      {plansLoading && plans.length === 0 ? (
                        <tr>
                          <td
                            colSpan={selectedNation === 'gpu' ? 6 : 5}
                            className="px-4 py-8 text-center"
                          >
                            <span className="text-text-muted">{t('buyVps.loadingPlans')}</span>
                          </td>
                        </tr>
                      ) : plans.length === 0 ? (
                        <tr>
                          <td
                            colSpan={selectedNation === 'gpu' ? 6 : 5}
                            className="px-4 py-8 text-center"
                          >
                            <span className="text-text-muted">{t('buyVps.noPlans')}</span>
                          </td>
                        </tr>
                      ) : (
                        plans.map((plan) => {
                          const isSelected = plan.id === selectedPlanId
                          const isSoldOut = plan.status === 'sold_out'

                          return (
                            <tr
                              key={plan.id}
                              onClick={() => {
                                if (!isSoldOut) setSelectedPlanId(plan.id)
                              }}
                              className={`border-border border-b last:border-0 ${
                                isSoldOut
                                  ? 'bg-thead cursor-not-allowed opacity-60'
                                  : isSelected
                                    ? 'bg-bg-selected cursor-pointer shadow-[inset_4px_0_0_0_var(--color-blue)]'
                                    : 'bg-surface hover:bg-bg-hover cursor-pointer'
                              }`}
                            >
                              <td className="px-3 py-2 text-center">
                                {isSoldOut ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mx-auto size-5"
                                  >
                                    <circle
                                      className="fill-text-muted text-text-muted"
                                      cx="12"
                                      cy="12"
                                      r="11"
                                    />
                                    <line
                                      className="text-thead"
                                      x1="5.93"
                                      y1="5.93"
                                      x2="18.07"
                                      y2="18.07"
                                    />
                                  </svg>
                                ) : isSelected ? (
                                  <div className="bg-blue border-blue mx-auto flex size-5 items-center justify-center rounded-full border-2">
                                    <div className="size-2 rounded-full bg-white" />
                                  </div>
                                ) : (
                                  <div className="border-text-muted group-hover:border-blue mx-auto flex size-5 items-center justify-center rounded-full border-2 transition-colors" />
                                )}
                              </td>
                              <td className="px-3 py-2 font-semibold whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {plan.name}
                                  {isSoldOut && (
                                    <span className="bg-orange/20 text-orange rounded px-1.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                                      {t('buyVps.soldOut')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="text-text-muted px-3 py-2 whitespace-nowrap">
                                {plan.cpu} - {plan.ram}
                              </td>
                              <td className="text-text-muted px-3 py-2 text-center whitespace-nowrap">
                                {plan.ssd}
                              </td>
                              {selectedNation === 'gpu' && (
                                <td className="text-text-muted px-3 py-2 text-center whitespace-nowrap">
                                  {plan.vRAM ? plan.vRAM.match(/\d+\s*GB/i)?.[0] || plan.vRAM : '-'}
                                </td>
                              )}
                              <td className="px-3 py-2 text-right font-bold whitespace-nowrap">
                                {plan.price ? (
                                  <>
                                    {plan.price}
                                    <span className="text-text-muted ml-1 text-xs font-medium">
                                      VNĐ
                                    </span>
                                  </>
                                ) : (
                                  <div className="bg-border mx-auto h-4 w-16 animate-pulse rounded"></div>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Config fields - Show only if plans array is valid and non-empty */}
              {plans.some((p) => p.status === 'available') && (
                <section className="my-2">
                  <div className="flex flex-wrap items-center gap-5">
                    {/* OS */}
                    <div className="flex min-w-[314px] grow flex-col gap-1.5 text-lg">
                      <span className="text-sm font-medium">{t('buyVps.os')}</span>
                      {renderSelect(
                        selectedOs,
                        (e) => setSelectedOs(e.target.value),
                        supportData.os?.option || {}
                      )}
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

                    {/* Amount */}
                    <label className="flex max-w-16 flex-col gap-1.5 text-lg">
                      <span className="text-sm font-medium">{t('buyVps.amount')}</span>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </label>

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
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="text-base font-medium">{t('installExtension')}</span>
                      <div className="flex gap-2 sm:gap-4">
                        <button
                          type="button"
                          aria-pressed={form.install_chrome}
                          onClick={() => updateForm({ install_chrome: !form.install_chrome })}
                          className={`hover:bg-blue/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold select-none ${
                            form.install_chrome
                              ? 'border-blue text-blue bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-blue)_12%)]'
                              : 'border-border text-text-muted bg-terminal'
                          }`}
                        >
                          <span
                            className={`slide-reveal-ease flex items-center gap-2 ${
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
                            className={`slide-reveal-ease absolute right-4 size-5 ${
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
                          className={`hover:bg-orange/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold select-none ${
                            form.install_firefox
                              ? 'border-orange text-orange bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-orange)_12%)]'
                              : 'border-border text-text-muted bg-terminal'
                          }`}
                        >
                          <span
                            className={`slide-reveal-ease flex items-center gap-2 ${
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
                            className={`slide-reveal-ease absolute right-4 size-5 ${
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

                    <div className="grid grow grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                      {/* Password */}
                      <label className="flex grow flex-col gap-2">
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
                                <span className="text-orange text-xs">
                                  {t('buy.invalidPassword')}
                                </span>
                              )}
                          </div>
                        )}
                      </label>

                      {/* Port */}
                      <label className="flex grow flex-col gap-2">
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
                    <div className="flex w-full items-center gap-2 text-lg">
                      <span className="text-sm font-medium whitespace-nowrap">
                        {t('buyVps.note')}
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('buyVps.enterNote')}
                        className="min-h-16! resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Right: Summary Panel */}
          <div className="bg-surface border-border flex w-full shrink-0 flex-col justify-between rounded-b-xl border-t p-4 md:w-[380px] md:rounded-r-xl md:rounded-bl-none md:border-l md:p-6 lg:border-t-0">
            {!plans.some((p) => p.status === 'available') ? (
              <div className="text-text-muted mt-10 flex h-full flex-col items-center justify-center gap-4 text-center md:mt-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-16 stroke-current opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                <div className="flex flex-col gap-1 font-medium">{t('buyVps.soldOutMessage')}</div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold">{t('buyVps.orderSummary')}</h2>

                <div className="flex flex-col gap-4">
                  {/* Selected Plan info */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-text-muted">{t('buyVps.selectedPlan')}</span>
                      <Skeleton
                        isLoading={plansLoading}
                        element={
                          <span className="text-orange mt-0.5 text-[11px]">
                            {selectedPlanObj?.cpu} - {selectedPlanObj?.ram}
                          </span>
                        }
                        className="bg-text-muted h-4 w-16"
                      />
                    </div>
                    <Skeleton
                      isLoading={plansLoading}
                      element={<span className="font-medium">{selectedPlanObj?.name}</span>}
                      className="bg-text-muted h-4 w-7"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t('buyVps.originalPrice')}</span>
                    <Skeleton
                      isLoading={isCalculating}
                      element={<span className="font-medium">{summary.original_price}</span>}
                      className="bg-text-muted h-4 w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t('buyVps.discount')}</span>
                    <Skeleton
                      isLoading={isCalculating}
                      element={<span className="text-green font-medium">-{summary.discount}</span>}
                      className="bg-text-muted h-4 w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t('buyVps.coupon')}</span>
                    <Skeleton
                      isLoading={isCalculating}
                      element={<span className="text-green font-medium">{summary.coupon}</span>}
                      className="bg-text-muted h-4 w-12"
                    />
                  </div>
                  <div className="bg-border my-1 h-px" />
                  <div className="flex items-center justify-between text-base">
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
                  {summary.warning && (
                    <div className="text-red mt-1 text-sm">{summary.warning}</div>
                  )}
                </div>

                {/* Discount Code */}
                <div className="flex flex-col gap-2 pt-2">
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
                      className="h-10 flex-1 px-3 text-lg"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-3 pt-2 text-lg">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                    />
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
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col gap-3 text-lg">
              <button
                onClick={handlePay}
                disabled={
                  !agreeTerms ||
                  isBuying ||
                  !selectedPlanId ||
                  summary.warning === 'Tài khoản không đủ' ||
                  !plans.some((p) => p.status === 'available')
                }
                className="group enabled:bg-blue flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold text-white shadow-sm transition-all duration-200 disabled:bg-gray-500"
              >
                <span>{t('buyVps.payNow')}</span>
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
                className="text-text-muted hover:text-text-primary h-12 w-full rounded-lg bg-transparent font-medium"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
