import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { proxyNations } from '../data/proxyNations.jsx'
import axiosInstance from '../lib/axios.js'
import ProxyCard from '../components/price/ProxyCard.jsx'
import { useTranslation } from '../i18n'

// Build initial prices map: { [symbol]: { price, loading, error } }
const buildInitialPrices = () => {
  const map = {}
  proxyNations.forEach(({ symbol }) => {
    map[symbol] = { price: '', loading: true, error: false }
  })
  return map
}

export default function ProxyPrice() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [prices, setPrices] = useState(buildInitialPrices)

  // Batch fetch – one parallel POST per nation on mount
  useEffect(() => {
    let isMounted = true

    proxyNations.forEach(({ symbol }) => {
      axiosInstance
        .post('/server/create/calculate', {
          plan_id: 0,
          is_proxy: true,
          quantity: 1,
          nation: symbol,
          duration: 1,
          coupon: '',
        })
        .then((res) => {
          if (!isMounted) return
          if (res.data?.success && res.data.info?.original_price) {
            const displayPrice = res.data.info.original_price.split(' ')[0]
            setPrices((prev) => ({
              ...prev,
              [symbol]: { price: displayPrice, loading: false, error: false },
            }))
          } else {
            setPrices((prev) => ({
              ...prev,
              [symbol]: { price: '', loading: false, error: true },
            }))
          }
        })
        .catch(() => {
          if (!isMounted) return
          setPrices((prev) => ({
            ...prev,
            [symbol]: { price: '', loading: false, error: true },
          }))
        })
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="bg-body text-text-primary min-h-screen">
      {/* Hero Banner */}
      <section className="bg-surface relative overflow-hidden p-6 md:p-8">
        <div className="bg-primary/10 pointer-events-none absolute -right-10 -bottom-10 size-60 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <span className="bg-primary/10 text-primary border-primary/20 mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            {t('proxyPrice.bannerBadge')}
          </span>
          <h1 className="font-headline text-text-primary mb-2 text-2xl font-bold md:text-3xl">
            {t('proxyPrice.title')}
          </h1>
          <p className="text-text-muted text-sm leading-relaxed md:text-base">
            {t('proxyPrice.subtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-380 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* Card Grid */}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary size-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
              </svg>
              <h2 className="font-headline text-text-primary text-lg font-bold">
                {t('proxyPrice.sectionTitle')}
              </h2>
            </div>
            <span className="text-text-muted text-xs font-medium">
              {proxyNations.length} {t('proxyPrice.countriesUnit')} &bull;{' '}
              {t('proxyPrice.durationUnit')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proxyNations.map((nation, idx) => {
              const { price, loading, error } = prices[nation.symbol] || {
                loading: true,
                error: false,
                price: '',
              }
              return (
                <ProxyCard
                  key={nation.symbol}
                  nation={nation}
                  price={price}
                  loading={loading}
                  error={error}
                  animDelay={idx * 45}
                  onBuy={() =>
                    navigate(`/price/proxy/buy?nation=${nation.symbol}`, {
                      state: {
                        nation: { symbol: nation.symbol, name: nation.name, shortName: nation.shortName },
                        price,
                      },
                    })
                  }
                />
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
