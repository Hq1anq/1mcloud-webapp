import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vpsNations, vpsSpecialOptions, getDefaultPlans } from '../data/vpsNations.jsx'
import { ServerIcon, HubIcon } from '../assets/icons'
import axiosInstance from '../lib/axios.js'
import VpsCard from '../components/price/VpsCard.jsx'
import { useTranslation } from '../i18n'

export default function VpsPrice() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [selectedNation, setSelectedNation] = useState('VN')
  const [plans, setPlans] = useState(() => getDefaultPlans('VN'))

  // Fetch plans dynamically from API when selectedNation changes
  useEffect(() => {
    let isMounted = true
    // Fallback to default static plans immediately while loading
    setPlans(getDefaultPlans(selectedNation))

    axiosInstance
      .get(`/vps/plan?plan=${selectedNation}`)
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.info)) {
          const sortedPlans = [...res.data.info].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          )
          setPlans(sortedPlans)
        } else if (isMounted) {
          setPlans((prev) => prev.map((plan) => ({ ...plan, status: 'error' })))
        }
      })
      .catch((err) => {
        console.error('Failed to fetch VPS plans:', err)
        if (isMounted) {
          setPlans((prev) => prev.map((plan) => ({ ...plan, status: 'error' })))
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedNation])

  // Get current category/nation display title
  const currentSpecial = vpsSpecialOptions.find((s) => s.symbol === selectedNation)

  const sectionTitle = currentSpecial
    ? `${t('vpsPrice.listTitle')} ${currentSpecial.name}`
    : `${t('vpsPrice.listTitle')} (${selectedNation})`

  return (
    <main className="bg-body text-text-primary min-h-screen">
      {/* Hero Banner */}
      <section className="bg-surface relative overflow-hidden p-6 md:p-8">
        <div className="bg-primary/10 pointer-events-none absolute -right-10 -bottom-10 size-60 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <span className="bg-primary/10 text-primary border-primary/20 mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            {t('vpsPrice.bannerBadge')}
          </span>
          <h1 className="font-headline text-text-primary mb-2 text-2xl font-bold md:text-3xl">
            {t('vpsPrice.title')}
          </h1>
          <p className="text-text-muted text-sm leading-relaxed md:text-base">
            {t('vpsPrice.subtitle')}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-380 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* Selector Section: Standard Nations & Specialized VPS Lines */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex items-center gap-2">
              <HubIcon className="text-primary size-6" />
              <h2 className="font-headline text-text-primary text-base font-bold tracking-wider uppercase">
                {t('vpsPrice.categoriesTitle')}
              </h2>
            </div>
            <span className="text-text-muted text-xs font-medium">
              {vpsNations.length} {t('vpsPrice.categoriesSummary')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Standard Nations Grid (Left 8 cols) */}
            <div className="space-y-3 lg:col-span-8">
              <div className="text-text-muted flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary size-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
                </svg>
                {t('vpsPrice.locations')}
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {vpsNations.map((nation) => {
                  const isActive = nation.symbol === selectedNation
                  return (
                    <button
                      key={nation.symbol}
                      onClick={() => setSelectedNation(nation.symbol)}
                      className={`nation-btn border-border flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left ${
                        isActive ? 'nation-btn-active' : 'bg-surface'
                      }`}
                    >
                      <div className="flex h-5 w-7 shrink-0 items-center overflow-hidden rounded-sm shadow-xs">
                        {nation.flag}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-bold ${
                            isActive ? 'text-primary' : 'text-text-primary'
                          }`}
                        >
                          {t(`nation.${nation.symbol}`) || nation.name}
                        </p>
                        <p className="text-text-muted font-mono text-[10px] font-medium uppercase">
                          {nation.symbol}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Specialized Server Types (Right 4 cols: PTU & GPU) */}
            <div className="space-y-3 lg:col-span-4">
              <div className="text-text-muted flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary size-4"
                >
                  <rect width="12" height="12" x="6" y="6" rx="2" />
                  <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
                </svg>
                {t('vpsPrice.specializedServers')}
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {vpsSpecialOptions.map((opt) => {
                  const isActive = opt.symbol === selectedNation
                  const badgeText =
                    opt.symbol === 'gpu' ? t('vpsPrice.badgeGpu') : t('vpsPrice.badgePtu')
                  const descText =
                    opt.symbol === 'gpu' ? t('vpsPrice.descGpu') : t('vpsPrice.descPtu')

                  return (
                    <button
                      key={opt.symbol}
                      onClick={() => setSelectedNation(opt.symbol)}
                      className={`nation-btn border-border flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left ${
                        isActive ? 'nation-btn-active' : 'bg-surface'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-1.5 ${
                            isActive ? 'bg-primary/20 text-primary' : 'bg-navbar text-text-muted'
                          }`}
                        >
                          {opt.flag}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`truncate text-xs font-bold ${
                              isActive ? 'text-primary' : 'text-text-primary'
                            }`}
                          >
                            {opt.name}
                          </p>
                          <p className="text-text-muted truncate text-[10px] font-medium">
                            {descText}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-24 shrink-0 rounded py-1 text-center text-[9px] font-bold tracking-wider uppercase ${
                          isActive
                            ? 'bg-blue text-white'
                            : 'bg-navbar text-text-muted border-border/40 border'
                        }`}
                      >
                        {badgeText}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* List of VPS Cards Grid */}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <ServerIcon className="text-primary size-8" />
              <h3 className="font-headline text-text-primary text-lg font-bold">{sectionTitle}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((card, idx) => (
              <VpsCard
                key={`${selectedNation}-${idx}`}
                card={card}
                animDelay={idx * 120}
                onBuy={() =>
                  navigate(`/price/vps/buy?nation=${selectedNation}&planId=${card.id}`, {
                    state: { card },
                  })
                }
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
