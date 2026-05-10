import { useRef, useLayoutEffect, useState } from 'react'
import { useTranslation } from '../../i18n'

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value)

function AutoShrinkText({ text, className }) {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const checkSize = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const textWidth = textRef.current.scrollWidth
        if (textWidth > containerWidth && containerWidth > 0) {
          setScale(containerWidth / textWidth)
        } else {
          setScale(1)
        }
      }
    }

    const observer = new ResizeObserver(checkSize)
    if (containerRef.current) observer.observe(containerRef.current)
    checkSize()

    return () => observer.disconnect()
  }, [text])

  return (
    <div ref={containerRef} className="flex w-full items-center overflow-hidden">
      <div
        ref={textRef}
        className={`origin-left whitespace-nowrap ${className}`}
        style={{ transform: `scale(${scale})` }}
      >
        {text}
      </div>
    </div>
  )
}

export default function HistoryMetricsCards({
  numRenew,
  numRefund,
  numTransaction,
  totalPrice,
  className = '',
}) {
  const values = {
    numRenew,
    numRefund,
    numTransaction,
    totalPrice,
  }
  const t = useTranslation()

  const cards = [
    {
      key: 'numTransaction',
      title: t('history.numTransaction'),
      valueKey: 'numTransaction',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      ),
    },
    {
      key: 'totalPrice',
      title: t('history.totalPrice'),
      valueKey: 'totalPrice',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2">
          <path d="M12 1v22" />
          <path d="M17 5H9a3 3 0 0 0 0 6h6a3 3 0 1 1 0 6H7" />
        </svg>
      ),
    },
    {
      key: 'numRenew',
      title: t('history.numRenew'),
      valueKey: 'numRenew',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
          <path d="M21 3v6h-6" />
        </svg>
      ),
    },
    {
      key: 'numRefund',
      title: t('history.numRefund'),
      valueKey: 'numRefund',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2">
          <path d="M3 7h18" />
          <path d="M5 7l2 12h10l2-12" />
        </svg>
      ),
    },
  ]

  return (
    <div className={`mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}>
      {cards.map((card) => (
        <article
          key={card.key}
          className="group border-border bg-thead relative flex flex-col justify-between overflow-hidden rounded-xl border px-4 py-3 shadow-[0_4px_20px_rgba(2,132,199,.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(2,132,199,.16)]"
        >
          <div className="text-text-muted mb-2 flex justify-between gap-2 text-sm font-medium">
            {card.title}
            <span>{card.icon}</span>
          </div>

          <AutoShrinkText
            text={formatNumber(values[card.valueKey])}
            className="text-text-primary text-2xl font-extrabold tracking-tight sm:text-3xl"
          />

          <span className="via-primary absolute right-0 bottom-0 left-0 h-[3px] -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-500 group-hover:translate-x-0" />
        </article>
      ))}
    </div>
  )
}
