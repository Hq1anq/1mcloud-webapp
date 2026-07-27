import { Link } from 'react-router-dom'
import Checkbox from '../../ui/Checkbox.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import { getShortOS } from '../../../data/osMap.js'
import { useTranslation } from '../../../i18n/index.js'

export default function VpsOrderSummary({
  selectedPlanObj,
  plansLoading,
  osName,
  summary,
  isCalculating,
  discountCode,
  setDiscountCode,
  setAppliedDiscount,
  autoRenew,
  setAutoRenew,
  agreeTerms,
  setAgreeTerms,
  canPay,
  handlePay,
}) {
  const t = useTranslation()

  return (
    <>
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
                  <strong className="text-text-primary text-sm font-semibold">
                    {selectedPlanObj?.name}
                  </strong>

                  <span className="text-orange mt-0.5 text-xs font-semibold">
                    {selectedPlanObj?.cpu} - {selectedPlanObj?.ram} ({selectedPlanObj?.ssd} NVMe)
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
            element={<span className="text-green font-semibold">{summary.coupon || '—'}</span>}
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
                {(summary.must_pay || '').split(' ')[0]}{' '}
                <span className="text-lg font-normal">VNĐ</span>
              </span>
            }
            className="bg-text-muted h-[37.6px] w-40"
          />
        </div>

        {/* Balance warning */}
        {summary.warning && <div className="text-red text-xs font-medium">{summary.warning}</div>}
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
          <span className="cursor-pointer font-medium select-none">{t('buyVps.autoRenew')}</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
          <span className="cursor-pointer font-medium select-none">{t('buyVps.agreeTerms')}</span>
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
          className="text-text-muted hover:text-text-primary w-full py-2 text-center font-medium transition-colors"
        >
          {t('cancel')}
        </Link>
      </div>
    </>
  )
}
