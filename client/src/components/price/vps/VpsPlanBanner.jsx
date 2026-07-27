import { useTranslation } from '../../../i18n/index.js'

export default function VpsPlanBanner({ selectedPlanObj, plansLoading }) {
  const t = useTranslation()

  if (!selectedPlanObj && plansLoading) {
    return <div className="bg-surface border-border h-24 animate-pulse rounded-xl border" />
  }

  if (!selectedPlanObj) return null

  return (
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
          <span className="text-text-muted block text-[10px] font-medium uppercase">vCPU</span>
          <strong className="text-text-primary text-sm font-semibold">{selectedPlanObj.cpu}</strong>
        </div>
        <div className="bg-terminal border-border rounded-lg border px-3 py-1.5 text-center">
          <span className="text-text-muted block text-[10px] font-medium uppercase">RAM</span>
          <strong className="text-text-primary text-sm font-semibold">{selectedPlanObj.ram}</strong>
        </div>
        <div className="bg-terminal border-border rounded-lg border px-3 py-1.5 text-center">
          <span className="text-text-muted block text-[10px] font-medium uppercase">SSD</span>
          <strong className="text-text-primary text-sm font-semibold">{selectedPlanObj.ssd}</strong>
        </div>
      </div>
    </div>
  )
}
