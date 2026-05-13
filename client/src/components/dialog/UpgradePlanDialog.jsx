import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../i18n'
import axiosInstance from '../../lib/axios'
import Dialog from '../ui/Dialog'
import Skeleton from '../ui/Skeleton'

export default function UpgradePlanDialog({ isOpen, onClose, sid, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  const [plans, setPlans] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [calculation, setCalculation] = useState({
    from_plan: '',
    to_plan: '',
    days_left: '',
    discount: '',
    expense: '',
    expense_details: '',
    warning: '',
  })
  const [calculationError, setCalculationError] = useState(false)
  const [isCalculating, setIsCalculating] = useState(true)
  const [processing, setProcessing] = useState(false)

  const handleClose = () => {
    onClose()
    // Reset state after dialog animation finishes
    setTimeout(() => {
      setPlans(null)
      setSelectedPlanId(null)
      setIsCalculating(true)
      setCalculationError(false)
      setProcessing(false)
    }, 300)
  }

  const handleSelectPlan = (id) => {
    if (id === selectedPlanId) return
    setSelectedPlanId(id)
    setIsCalculating(true)
    setCalculationError(false)
  }

  // Fetch plans
  useEffect(() => {
    if (isOpen && sid) {
      axiosInstance
        .post('/vps/upgrade/plans', { sid: sid.toString() })
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.info)) {
            setPlans(res.data.info)
            if (res.data.info.length > 0) setSelectedPlanId(res.data.info[0].id)
            else setCalculationError(true)
          } else {
            setPlans([])
            addToast('Failed to load plans', 'error')
          }
        })
        .catch((err) => {
          console.error(err)
          setPlans([])
          addToast('Error fetching plans', 'error')
          setCalculationError(true)
        })
    }
  }, [isOpen, sid, addToast])

  // Fetch calculation
  useEffect(() => {
    if (isOpen && sid && selectedPlanId) {
      setIsCalculating(true)
      axiosInstance
        .post('/vps/upgrade/calculate', { sid: sid.toString(), plan_id: selectedPlanId })
        .then((res) => {
          if (res.data?.success) setCalculation(res.data.info)
          else {
            setCalculationError(true)
            addToast(t('upgradePlan.errorCalculate'), 'error')
          }
        })
        .catch((err) => {
          console.error(err)
          setCalculationError(true)
          addToast(t('upgradePlan.errorCalculate'), 'error')
        })
        .finally(() => {
          setIsCalculating(false)
        })
    }
  }, [isOpen, sid, selectedPlanId, addToast, t])

  const handlePay = () => {
    if (!sid || !selectedPlanId) return
    setProcessing(true)
    const loadingToast = addToast(t('vpsManager.upgrade') + '...', 'loading')
    axiosInstance
      .post('/vps/upgrade', { sid: sid.toString(), plan_id: selectedPlanId })
      .then((res) => {
        if (res.data?.success) {
          addToast(t('vpsManager.upgrade') + ' ' + t('manager.success'), 'success')
          onSuccess(res.data)
          handleClose()
        } else {
          addToast(
            res.data?.message || t('vpsManager.upgrade') + ' ' + t('manager.failed'),
            'error'
          )
        }
      })
      .catch((err) => {
        console.error(err)
        addToast(t('vpsManager.upgrade') + ' ' + t('manager.failed'), 'error')
      })
      .finally(() => {
        setProcessing(false)
        removeToast(loadingToast)
      })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      className="text-text-primary w-full max-w-6xl overflow-hidden! p-0!"
    >
      <div className="flex h-[85vh] flex-col">
        {/* Dialog Header */}
        <div className="border-blue flex shrink-0 items-start justify-between border-b px-6 py-5 md:px-10">
          <div>
            <h2 className="text-2xl font-bold">{t('upgradePlan.title')}</h2>
            <p className="text-text-muted mt-1 text-base">{t('upgradePlan.subtitle')}</p>
          </div>
        </div>

        {/* Dialog Body: Two Column Layout */}
        <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row">
          {/* Left Column: Main Content (Plans Table) */}
          <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
            {/* Current & Target Status */}
            <div className="bg-thead border-border flex flex-wrap items-center gap-5 rounded-lg border p-4">
              <Skeleton
                isLoading={isCalculating}
                element={
                  <div className="flex items-center gap-2">
                    <span className="bg-surface border-border rounded border px-2 py-1 text-base font-semibold">
                      {calculation.from_plan.split(' : ')[0]}
                    </span>
                    <span className="text-text-muted text-base whitespace-nowrap">
                      {calculation.from_plan.split(' : ').slice(1).join(' : ')}
                    </span>
                  </div>
                }
                className="bg-text-muted h-[33.6px] w-36"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-text-muted hidden size-5 sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              <Skeleton
                isLoading={isCalculating}
                element={
                  <div className="flex items-center gap-2">
                    <span className="text-blue bg-blue/10 border-blue/20 rounded border px-2 py-1 text-base font-semibold">
                      {calculation.to_plan.split(' : ')[0]}
                    </span>
                    <span className="text-blue text-base whitespace-nowrap">
                      {calculation.to_plan.split(' : ').slice(1).join(' : ')}
                    </span>
                  </div>
                }
                className="bg-text-muted h-[33.6px] w-36"
              />
            </div>

            {/* Plans Table */}
            <div className="border-border bg-surface relative flex grow flex-col overflow-hidden rounded-lg border">
              {!plans ? (
                <div className="bg-surface flex h-full items-center justify-center">
                  <div className="loader"></div>
                </div>
              ) : plans.length === 0 ? (
                <div className="m-auto flex flex-col items-center justify-center py-4">
                  <div className="bg-thead mb-2 flex size-32 items-center justify-center rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="fill-text-muted mx-auto size-20 shrink-0"
                    >
                      <path d="M5 5a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H5Zm9 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H14Zm3 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17ZM3 17v-3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11-2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H14Zm3 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold sm:text-2xl">{t('noData')}</p>
                  <p className="text-text-muted text-base sm:text-lg">
                    {t('upgradePlan.noUpgradePlans')}
                  </p>
                </div>
              ) : (
                <div className="scroll-container flex-1 overflow-x-auto">
                  <table className="h-full w-full min-w-full border-collapse text-left">
                    <thead className="bg-thead text-text-muted border-border sticky top-0 z-10 border-b text-sm whitespace-nowrap">
                      <tr>
                        <th className="w-12 px-4 py-3 text-center"></th>
                        <th className="px-4 py-3 font-semibold tracking-wide uppercase">
                          {t('table.plan_number')}
                        </th>
                        <th className="px-4 py-3 text-right font-semibold tracking-wide uppercase">
                          {t('table.monthlyPrice')}
                        </th>
                        <th className="px-4 py-3 font-semibold tracking-wide uppercase">
                          {t('table.spec')}
                        </th>
                        <th className="px-4 py-3 text-center font-semibold tracking-wide uppercase">
                          {t('table.country')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y text-base">
                      {plans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id
                        return (
                          <tr
                            key={plan.id}
                            onClick={() => handleSelectPlan(plan.id)}
                            className={`relative cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-bg-selected border-l-blue border-l-4'
                                : 'hover:bg-bg-hover border-l-4 border-l-transparent'
                            }`}
                          >
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center">
                                {isSelected ? (
                                  <div className="bg-blue border-blue mx-auto flex size-5 items-center justify-center rounded-full border-2">
                                    <div className="size-2 rounded-full bg-white" />
                                  </div>
                                ) : (
                                  <div className="border-text-muted group-hover:border-blue mx-auto flex size-5 items-center justify-center rounded-full border-2 transition-colors" />
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <label className="block cursor-pointer font-semibold">
                                {plan.name}
                              </label>
                            </td>
                            <td className="p-4 text-right">
                              <span className="whitespace-nowrap">{plan.price} VND</span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-text-muted flex items-center gap-2 whitespace-nowrap">
                                <span className="bg-thead flex flex-1 items-center gap-1 rounded p-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="size-5 shrink-0 fill-none stroke-current"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                    />
                                  </svg>
                                  {plan.cpu}
                                </span>
                                <span className="bg-thead flex flex-1 items-center gap-1 rounded p-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    className="size-5 shrink-0 fill-current"
                                  >
                                    <path d="M240-360h80v-240h-80v240Zm200 0h80v-240h-80v240Zm200 0h80v-240h-80v240Zm-480 80h640v-400H160v400Zm0 0v-400 400Zm40 160v-80h-40q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h40v-80h80v80h160v-80h80v80h160v-80h80v80h40q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200h-40v80h-80v-80H520v80h-80v-80H280v80h-80Z" />
                                  </svg>
                                  {plan.ram}
                                </span>
                                <span className="bg-thead flex flex-1 items-center gap-1 rounded p-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="size-5 shrink-0 fill-none stroke-current"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                    />
                                  </svg>
                                  {plan.ssd}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-text-muted">{plan.country_short}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-surface border-blue flex w-full shrink-0 flex-col justify-between overflow-y-auto border-t p-4 md:p-6 lg:w-96 lg:border-t-0 lg:border-l">
            <div className="relative flex flex-col gap-5">
              <h3 className="border-border border-b pb-2 text-lg font-bold">
                {t('upgradePlan.summary')}
              </h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">{t('upgradePlan.currentPlan')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={
                      <span className="decoration-text-muted line-through">
                        {calculation.from_plan.split(' : ').slice(1).join(' : ')}
                      </span>
                    }
                    className="bg-text-muted h-4 w-18"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">{t('upgradePlan.targetPlan')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={
                      <span className="font-semibold">
                        {calculation.to_plan.split(' : ').slice(1).join(' : ')}
                      </span>
                    }
                    className="bg-text-muted h-4 w-18"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">{t('upgradePlan.daysRemaining')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={
                      <span className="text-purple">
                        {calculation.days_left + ' ' + t('upgradePlan.days')}
                      </span>
                    }
                    className="bg-text-muted h-4 w-12"
                  />
                </div>
                <div className="text-green flex items-center justify-between">
                  <span>{t('discount')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={<span>-{calculation.discount.replace('.0', '')}</span>}
                    className="bg-text-muted h-4 w-18"
                  />
                </div>
              </div>

              <div className="border-border mt-2 border-t pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-text-muted text-base">{t('totalToPay')}</span>
                  <Skeleton
                    isLoading={isCalculating}
                    element={
                      <span className="text-blue text-3xl font-bold">
                        {calculation.expense.split(' ')[0].replace('.0', '')}{' '}
                        <span className="text-lg font-normal">VND</span>
                      </span>
                    }
                    className="bg-text-muted h-[37.6px] w-36"
                  />
                </div>
                {calculation.warning && (
                  <span className="text-red mt-2 text-sm">{calculation.warning}</span>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue/10 border-blue/20 mt-4 flex flex-col items-start gap-3 rounded-lg border p-3">
                <span className="text-blue mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue mt-0.5 size-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('upgradePlan.calculationDetail')}
                </span>
                <Skeleton
                  isLoading={isCalculating}
                  element={(() => {
                    if (!calculation) return null
                    function renderExpenseMath(expr) {
                      const match = expr.match(
                        /^\(([\d,]+)-([\d,]+)\)\/(\d+)\*(\d+)-([\d,.]+)=([\d,.]+)$/
                      )

                      if (!match) {
                        // fallback if format breaks
                        return <span className="font-mono text-xs">{expr}</span>
                      }

                      const [, a, b, c, d, e, f] = match

                      return (
                        <span className="text-text-muted flex flex-wrap items-center gap-y-2 font-mono text-base">
                          <math className="inline-block">
                            <mrow>
                              <mfrac>
                                <mrow>
                                  <mn>{a}</mn>
                                  <mo>-</mo>
                                  <mn>{b}</mn>
                                </mrow>
                                <mn>{c}</mn>
                              </mfrac>

                              <mo>×</mo>
                              <mn className="text-purple">{d}</mn>

                              <mo>-</mo>
                              <mn className="text-green">{e}</mn>
                            </mrow>
                          </math>

                          <span className="ml-auto">
                            <math className="inline-block whitespace-nowrap">
                              <mrow>
                                <mo>=</mo>
                                <mn className="text-blue">{f}</mn>
                              </mrow>
                            </math>
                          </span>
                        </span>
                      )
                    }
                    return renderExpenseMath(calculation.expense_details)
                  })()}
                  className="bg-text-muted h-6 w-full"
                />
              </div>

              {calculation.warning && (
                <div className="bg-red/10 border-red/20 mt-2 flex items-start gap-3 rounded-lg border p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red mt-0.5 size-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-red text-xs">{calculation.warning}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-border mt-6 flex justify-end gap-3 border-t pt-5">
              <button
                onClick={handleClose}
                className="text-text-muted hover:bg-surface hover:text-text-primary rounded-lg px-4 py-2 text-base transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handlePay}
                disabled={!calculation || processing || calculation.warning}
                className="text-text-secondary group enabled:bg-blue flex items-center gap-2 rounded-lg px-6 py-2 text-base font-semibold hover:brightness-90 disabled:bg-gray-500"
              >
                {processing ? t('processing') : t('vpsManager.upgrade')}
                {!processing && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-5 stroke-current group-hover:translate-x-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
