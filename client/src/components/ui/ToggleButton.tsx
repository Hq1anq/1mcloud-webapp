import React from 'react'

export type ToggleButtonSize = 'sm' | 'md' | 'lg'
export type ToggleButtonVariant = 'switch' | 'badge'
export type ToggleButtonColorScheme = 'highlight' | 'primary' | 'green' | 'purple' | 'orange'

export interface ToggleButtonProps {
  /** Current state */
  isOn: boolean
  /** Click event handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Label content: string, icon + text layout, or any ReactNode */
  label?: React.ReactNode
  /** Visual variant: 'switch' (sliding knob) | 'badge' (pill with state text badge) */
  variant?: ToggleButtonVariant
  /** Size variant */
  size?: ToggleButtonSize
  /** Color theme accent */
  colorScheme?: ToggleButtonColorScheme
  /** Custom text for badge variant (defaults to 'ON' / 'OFF') */
  onText?: string
  offText?: string
  /** Placement of label relative to indicator */
  labelPlacement?: 'left' | 'right'
  /** Disabled state */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** HTML id */
  id?: string
  /** Tooltip title */
  title?: string
  /** Ignore attribute for screenshots / tests */
  'data-capture-ignore'?: boolean | string
}

const COLOR_SCHEMES: Record<
  ToggleButtonColorScheme,
  {
    pillActive: string
    trackActive: string
    glow: string
    badgeActive: string
  }
> = {
  highlight: {
    pillActive: 'border-highlight/50 bg-highlight/10 hover:bg-highlight/15 text-highlight',
    trackActive: 'bg-highlight shadow-[0_0_10px_rgba(56,189,248,0.45)]',
    glow: 'shadow-[0_0_14px_rgba(56,189,248,0.18)]',
    badgeActive: 'bg-highlight/20 text-highlight',
  },
  primary: {
    pillActive: 'border-primary/50 bg-primary/10 hover:bg-primary/15 text-primary',
    trackActive: 'bg-primary shadow-[0_0_10px_rgba(74,163,255,0.45)]',
    glow: 'shadow-[0_0_14px_rgba(74,163,255,0.18)]',
    badgeActive: 'bg-primary/20 text-primary',
  },
  green: {
    pillActive: 'border-green/50 bg-green/10 hover:bg-green/15 text-green',
    trackActive: 'bg-green shadow-[0_0_10px_rgba(34,197,94,0.45)]',
    glow: 'shadow-[0_0_14px_rgba(34,197,94,0.18)]',
    badgeActive: 'bg-green/20 text-green',
  },
  orange: {
    pillActive: 'border-orange/50 bg-orange/10 hover:bg-orange/15 text-orange',
    trackActive: 'bg-orange shadow-[0_0_10px_rgba(255,105,0,0.45)]',
    glow: 'shadow-[0_0_14px_rgba(255,105,0,0.18)]',
    badgeActive: 'bg-orange/20 text-orange',
  },
  purple: {
    pillActive: 'border-purple/50 bg-purple/10 hover:bg-purple/15 text-purple',
    trackActive: 'bg-purple shadow-[0_0_10px_rgba(168,85,247,0.45)]',
    glow: 'shadow-[0_0_14px_rgba(168,85,247,0.18)]',
    badgeActive: 'bg-purple/20 text-purple',
  },
}

const SIZES = {
  sm: {
    button: 'h-7 px-2.5 py-1 text-xs gap-2 rounded-lg',
    badge: 'px-1.5 py-0.5 text-[10px]',
    track: 'w-7 h-4',
    thumb: 'size-3 group-active:w-4.5',
    translate: 'translate-x-3 group-active:translate-x-1.5',
  },
  md: {
    button: 'h-8.5 sm:h-9 px-3 py-1.5 text-xs sm:text-sm gap-2.5 rounded-lg sm:rounded-xl',
    badge: 'px-1.5 py-0.5 text-[10px]',
    track: 'w-9 h-5',
    thumb: 'size-4 group-active:w-5.5',
    translate: 'translate-x-4 group-active:translate-x-2.5',
  },
  lg: {
    button: 'h-10 px-4 py-2 text-sm sm:text-base gap-3 rounded-xl',
    badge: 'px-2 py-0.5 text-xs',
    track: 'w-11 h-6',
    thumb: 'size-5 group-active:w-7',
    translate: 'translate-x-5 group-active:translate-x-3',
  },
}

export default function ToggleButton({
  isOn,
  onClick,
  label,
  variant = 'switch',
  size = 'md',
  colorScheme = 'highlight',
  onText = 'ON',
  offText = 'OFF',
  labelPlacement = 'left',
  disabled = false,
  className = '',
  id,
  title,
  'data-capture-ignore': dataCaptureIgnore,
}: ToggleButtonProps) {
  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.highlight
  const s = SIZES[size] || SIZES.md

  // ── Unified Switch Indicator (dùng chung cho cả thuần switch lẫn switch kèm label) ──
  const switchIndicator = (
    <div
      className={`relative shrink-0 rounded-full border transition-colors duration-300 ${s.track} ${isOn
        ? `${colors.trackActive} border-transparent`
        : 'border-white/15 bg-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
        }`}
    >
      <div
        className={`elastic-out absolute inset-y-0 my-auto left-[1px] rounded-full bg-white shadow-md transition-all duration-400 ${s.thumb
          } ${isOn ? s.translate : 'translate-x-0'}`}
      />
    </div>
  )

  // ── 1. THUẦN SWITCH (không có label) ──
  if (variant === 'switch' && !label) {
    return (
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        onClick={onClick}
        title={title}
        data-capture-ignore={dataCaptureIgnore}
        className={`group inline-flex shrink-0 cursor-pointer rounded-full outline-none transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-highlight/60 ${className}`}
      >
        {switchIndicator}
      </button>
    )
  }

  // ── 2. INDICATOR (Switch trượt OR Badge text) ──
  const indicator =
    variant === 'switch' ? (
      switchIndicator
    ) : (
      <span
        className={`select-none rounded font-bold uppercase tracking-wider transition-colors duration-300 ${s.badge} ${isOn ? colors.badgeActive : 'bg-white/10 text-text-muted'
          }`}
      >
        {isOn ? onText : offText}
      </span>
    )

  // ── 3. BUTTON PILL (Container có viền / nền khi có nhãn hoặc variant badge) ──
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={onClick}
      title={title}
      data-capture-ignore={dataCaptureIgnore}
      className={`group relative inline-flex items-center ${label ? 'justify-between' : 'justify-center'
        } border font-medium select-none outline-none cursor-pointer transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-highlight/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${s.button} ${isOn
          ? `${colors.pillActive} ${colors.glow}`
          : 'border-border/80 bg-surface/75 text-text-muted shadow-sm hover:border-border hover:bg-surface hover:text-text-primary'
        } ${className}`}
    >
      {labelPlacement === 'left' ? (
        <>
          {label && <span className="select-none inline-flex items-center">{label}</span>}
          {indicator}
        </>
      ) : (
        <>
          {indicator}
          {label && <span className="select-none inline-flex items-center">{label}</span>}
        </>
      )}
    </button>
  )
}
