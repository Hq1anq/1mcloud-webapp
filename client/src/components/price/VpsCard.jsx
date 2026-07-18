import CardBody from './CardBody.jsx'
import CountUp from '../ui/CountUp.jsx'
import { parseVND, formatVND } from '../../utils/data.js'
import {
  CpuIcon,
  RamIcon,
  SsdIcon,
  VramIcon,
  EarthIcon,
  RouterIcon,
  SpeedIcon,
  CartIcon,
  SoldOutIcon,
} from '../../assets/icons'

// ── Static other-detail items (same for every VPS plan) ─────────

const OTHER_ITEMS = [
  { icon: <EarthIcon />, text: '1 Địa chỉ IPv4' },
  { icon: <RouterIcon />, text: 'Băng thông không giới hạn' },
  { icon: <SpeedIcon />, text: 'Ethernet port 1 Gbps' },
]

// ── Component ───────────────────────────────────────────────────

/**
 * Props:
 *   card      – { name, price, cpu, ram, ssd, vRAM?, status, ipv4?, bandwidth?, ethernet_port? }
 *   animDelay – number (ms)
 *   onBuy     – optional callback
 */
export default function VpsCard({ card, animDelay, onBuy }) {
  const isAvailable = card.status === 'available'
  const hasVRAM = Boolean(card.vRAM)

  const isPTU = card.region === 'EU'

  // Build primary items dynamically (vRAM conditional, highlight SSD for PTU, vRAM for GPU)
  const primaryItems = [
    { icon: <CpuIcon />, label: 'CPU', value: card.cpu || 'N/A' },
    { icon: <RamIcon />, label: 'RAM', value: card.ram || 'N/A' },
    { icon: <SsdIcon />, label: 'SSD', value: card.ssd || 'N/A', highlight: isPTU },
    ...(hasVRAM
      ? [
          {
            icon: <VramIcon />,
            label: 'vRAM',
            value: card.vRAM.trim().split(' ')[0],
            highlight: true,
          },
        ]
      : []),
  ]

  // Other details: prefer API values, fall back to static labels
  const otherItems = [
    { icon: <EarthIcon />, text: card.ipv4 || '1 Địa chỉ IPv4' },
    { icon: <RouterIcon />, text: card.bandwidth || 'Băng thông không giới hạn' },
    { icon: <SpeedIcon />, text: card.ethernet_port || 'Ethernet port 1 Gbps' },
  ]

  const action = (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={onBuy}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold shadow-sm transition-all active:scale-[0.98] ${
        isAvailable
          ? 'bg-primary hover:bg-primary/90 shadow-primary/20 cursor-pointer text-white'
          : 'bg-wrapper/40 text-text-muted border-border/40 cursor-not-allowed border opacity-70'
      }`}
    >
      <span>{isAvailable ? 'Đăng ký ngay' : 'Hết hàng'}</span>
      {isAvailable ? <CartIcon /> : <SoldOutIcon />}
    </button>
  )

  return (
    <div
      className={`vps-plan-card animate-vps-float-in border-border bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-sm ${
        !isAvailable ? 'vps-plan-card--disabled opacity-60 grayscale-30' : ''
      }`}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* ── Card Header ── */}
      <div className="bg-navbar border-border border-b p-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-headline text-text-primary text-2xl font-bold tracking-tight">
            {card.name}
          </h4>

          {/* Status dot */}
          <div className="flex items-center gap-1.5">
            {isAvailable ? (
              <span className="bg-green h-2 w-2 animate-pulse rounded-full" />
            ) : (
              <span className="bg-red h-2 w-2 rounded-full" />
            )}
            <span
              className={`font-mono text-[11px] font-bold tracking-wider uppercase ${
                isAvailable ? 'text-green' : 'text-red'
              }`}
            >
              {isAvailable ? 'Sẵn sàng' : 'Hết hàng'}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <CountUp
            value={parseVND(card.price)}
            format={formatVND}
            duration={0.5}
            middle={100000}
            className="font-headline text-primary text-3xl font-extrabold tracking-tight"
          />
          <span className="text-text-muted text-xs font-medium">VNĐ / tháng</span>
        </div>
      </div>

      {/* ── Card Body (shared) ── */}
      <CardBody
        primaryItems={primaryItems}
        otherItems={otherItems}
        action={action}
        primaryCols={hasVRAM ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}
      />
    </div>
  )
}
