import CardBody from './CardBody.jsx'
import { useTranslation } from '../../i18n'
import {
  EarthIcon,
  ProtocolIcon,
  DevicesIcon,
  RouterIcon,
  SpeedIcon,
  CartIcon,
} from '../../assets/icons'

// ── Component ───────────────────────────────────────────────────

/**
 * Props:
 *   nation    – { symbol, name, flag }
 *   price     – string  (formatted price number, e.g. "150,000")
 *   loading   – boolean
 *   error     – boolean
 *   animDelay – number  (ms, for stagger animation)
 *   onBuy     – optional callback
 */
export default function ProxyCard({ nation, price, loading, error, animDelay, onBuy }) {
  const t = useTranslation()

  const primaryItems = [
    { icon: <EarthIcon />, label: t('proxyCard.ipAddress'), value: t('proxyCard.dedicatedIp') },
    { icon: <ProtocolIcon />, label: t('proxyCard.protocol'), value: t('proxyCard.protocolVal') },
  ]

  const otherItems = [
    { icon: <DevicesIcon />, text: t('proxyCard.unlimitedDevices') },
    { icon: <RouterIcon />, text: t('priceCard.bandwidthText') },
    { icon: <SpeedIcon />, text: t('priceCard.ethernetText') },
  ]

  const action = (
    <button
      type="button"
      onClick={onBuy}
      className="btn-primary flex w-full items-center justify-center gap-2 active:scale-[0.98]"
    >
      <span>{t('priceCard.buyNow')}</span>
      <CartIcon className="size-8" />
    </button>
  )

  return (
    <div
      className="vps-plan-card animate-vps-float-in border-border bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-sm"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* ── Card Header ── */}
      <div className="bg-navbar border-border border-b p-6">
        {/* Nation row */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="border-border/40 flex h-9 w-12 shrink-0 items-center overflow-hidden rounded-md border shadow-sm">
              {nation.flag}
            </div>
            <div>
              <h3 className="font-headline text-text-primary text-base leading-tight font-bold">
                {t(`nation.${nation.symbol}`) || nation.name}
              </h3>
              <p className="text-text-muted font-mono text-[10px] font-medium uppercase">
                {nation.symbol} · Proxy
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span className="bg-green h-2 w-2 animate-pulse rounded-full" />
            <span className="text-green font-mono text-[11px] font-bold tracking-wider uppercase">
              {t('priceCard.available')}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          {loading ? (
            <div className="bg-border h-8 w-32 animate-pulse rounded-lg" />
          ) : error || !price ? (
            <span className="font-headline text-text-muted text-3xl font-extrabold">--</span>
          ) : (
            <span className="font-headline text-primary text-3xl font-extrabold tracking-tight">
              {price}
            </span>
          )}
          <span className="text-text-muted text-xs font-medium">{t('priceCard.perMonth')}</span>
        </div>
      </div>

      {/* ── Card Body (shared) ── */}
      <CardBody primaryItems={primaryItems} otherItems={otherItems} action={action} />
    </div>
  )
}
