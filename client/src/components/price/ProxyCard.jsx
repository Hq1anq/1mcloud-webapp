import CardBody from './CardBody.jsx'
import {
  EarthIcon,
  ProtocolIcon,
  DevicesIcon,
  RouterIcon,
  SpeedIcon,
  CartIcon,
} from '../../assets/icons'

// ── Static item lists (same for every proxy nation) ─────────────

const PRIMARY_ITEMS = [
  { icon: <EarthIcon />, label: 'Địa chỉ IP', value: 'IPv4 Dedicated' },
  { icon: <ProtocolIcon />, label: 'Giao thức', value: 'HTTP / SOCKS5' },
]

const OTHER_ITEMS = [
  { icon: <DevicesIcon />, text: 'Không giới hạn thiết bị' },
  { icon: <RouterIcon />, text: 'Băng thông không giới hạn' },
  { icon: <SpeedIcon />, text: 'Ethernet port 1 Gbps' },
]

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
  const action = (
    <button
      type="button"
      onClick={onBuy}
      className="bg-primary hover:bg-primary/90 shadow-primary/20 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white shadow-sm transition-all active:scale-[0.98]"
    >
      <span>Đăng ký ngay</span>
      <CartIcon />
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
                {nation.name}
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
              Sẵn sàng
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
          <span className="text-text-muted text-xs font-medium">VNĐ / tháng</span>
        </div>
      </div>

      {/* ── Card Body (shared) ── */}
      <CardBody primaryItems={PRIMARY_ITEMS} otherItems={OTHER_ITEMS} action={action} />
    </div>
  )
}
