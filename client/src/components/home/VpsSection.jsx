import { useTranslation } from '../../i18n'

export default function VpsSection() {
  const t = useTranslation()

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8L12 4L20 8L12 12L4 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 12L12 16L20 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16L12 20L20 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t('vps.feat1.title'),
      desc: t('vps.feat1.desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h560q33 0 56.5 23.5T800-760v80h80v80h-80v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T720-120H160Zm0-80h560v-560H160v560Zm80-80h200v-160H240v160Zm240-280h160v-120H480v120Zm-240 80h200v-200H240v200Zm240 200h160v-240H480v240ZM160-760v560-560Z" />
        </svg>
      ),
      title: t('vps.feat2.title'),
      desc: t('vps.feat2.desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
          <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 237.3C544 220.3 537.3 204 525.3 192L448 114.7C436 102.7 419.7 96 402.7 96L160 96zM192 192C192 174.3 206.3 160 224 160L384 160C401.7 160 416 174.3 416 192L416 256C416 273.7 401.7 288 384 288L224 288C206.3 288 192 273.7 192 256L192 192zM320 352C355.3 352 384 380.7 384 416C384 451.3 355.3 480 320 480C284.7 480 256 451.3 256 416C256 380.7 284.7 352 320 352z" />
        </svg>
      ),
      title: t('vps.feat3.title'),
      desc: t('vps.feat3.desc'),
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          className="size-6"
        >
          <path d="M505.098 19.25C503.973 13.875 498.098 8 492.723 6.875C460.6 0 435.476 0 410.353 0C307.233 0 245.237 55.25 199.114 128H94.87C78.621 128 59.247 139.875 51.997 154.5L2.625 253.25C1 256.625 0.25 260.25 0 264C0.125 277.25 10.749 288 24.124 288H127.993C180.99 288 223.988 331 223.988 384V488C223.988 501.25 234.737 512 247.987 512C251.736 511.875 255.361 511 258.736 509.5L357.481 460.125C371.98 452.75 383.979 433.5 383.979 417.25V312.75C456.475 266.5 511.972 204.375 511.972 101.75C512.097 76.5 512.097 51.375 505.098 19.25ZM383.979 168C361.98 168 343.981 150.125 343.981 128C344.106 105.875 361.98 88 384.104 88C406.103 88 423.977 105.875 423.977 128S406.103 168 383.979 168ZM35.623 352.125C9.874 377.875 -3 442.625 0.625 511.375C69.746 515 134.243 502 159.991 476.25C200.239 436 202.864 382.375 166.241 345.75C129.618 309.25 75.996 311.75 35.623 352.125ZM117.369 436.125C108.744 444.625 87.245 449 64.247 447.75C62.997 424.875 67.246 403.25 75.871 394.75C89.37 381.25 107.244 380.375 119.369 392.625C131.618 404.75 130.743 422.625 117.369 436.125Z" />
        </svg>
      ),
      title: t('vps.feat4.title'),
      desc: t('vps.feat4.desc'),
    },
  ]

  const specCards = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M360-360v-240h240v240H360Zm80-80h80v-80h-80v80Zm-80 320v-80h-80q-33 0-56.5-23.5T200-280v-80h-80v-80h80v-80h-80v-80h80v-80q0-33 23.5-56.5T280-760h80v-80h80v80h80v-80h80v80h80q33 0 56.5 23.5T760-680v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T680-200h-80v80h-80v-80h-80v80h-80Zm320-160v-400H280v400h400ZM480-480Z" />
        </svg>
      ),
      iconColor: 'var(--primary)',
      title: t('vps.spec1.title'),
      desc: t('vps.spec1.desc'),
      statLabel: t('vps.spec1.statLabel'),
      statValue: t('vps.spec1.statValue'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
          <path d="M119.7 263.7L150.6 294.6C156.6 300.6 164.7 304 173.2 304L194.7 304C203.2 304 211.3 307.4 217.3 313.4L246.6 342.7C252.6 348.7 256 356.8 256 365.3L256 402.8C256 411.3 259.4 419.4 265.4 425.4L278.7 438.7C284.7 444.7 288.1 452.8 288.1 461.3L288.1 480C288.1 497.7 302.4 512 320.1 512C337.8 512 352.1 497.7 352.1 480L352.1 477.3C352.1 468.8 355.5 460.7 361.5 454.7L406.8 409.4C412.8 403.4 416.2 395.3 416.2 386.8L416.2 352.1C416.2 334.4 401.9 320.1 384.2 320.1L301.5 320.1C293 320.1 284.9 316.7 278.9 310.7L262.9 294.7C258.7 290.5 256.3 284.7 256.3 278.7C256.3 266.2 266.4 256.1 278.9 256.1L313.6 256.1C326.1 256.1 336.2 246 336.2 233.5C336.2 227.5 333.8 221.7 329.6 217.5L309.9 197.8C306 194 304 189.1 304 184C304 178.9 306 174 309.7 170.3L327 153C332.8 147.2 336.1 139.3 336.1 131.1C336.1 123.9 333.7 117.4 329.7 112.2C326.5 112.1 323.3 112 320.1 112C224.7 112 144.4 176.2 119.8 263.7zM528 320C528 285.4 519.6 252.8 504.6 224.2C498.2 225.1 491.9 228.1 486.7 233.3L473.3 246.7C467.3 252.7 463.9 260.8 463.9 269.3L463.9 304C463.9 321.7 478.2 336 495.9 336L520 336C522.5 336 525 335.7 527.3 335.2C527.7 330.2 527.8 325.1 527.8 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z" />
        </svg>
      ),
      iconColor: 'var(--purple)',
      title: t('vps.spec2.title'),
      desc: (
        <>
          {t('vps.spec2.desc')} <br /> {t('vps.spec2.desc2')}
        </>
      ),
      statLabel: t('vps.spec2.statLabel'),
      statValue: t('vps.spec2.statValue'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm140-40-56-56 103-104-104-104 57-56 160 160-160 160Zm180 0v-80h240v80H480Z" />
        </svg>
      ),
      iconColor: 'var(--green)',
      title: t('vps.spec3.title'),
      desc: t('vps.spec3.desc'),
      statLabel: t('vps.spec3.statLabel'),
      statValue: t('vps.spec3.statValue'),
    },
  ]

  const bars = [
    {
      label: 'vCPU Usage',
      value: '24%',
      color: 'from-green-500 to-green-400',
      valueColor: 'text-green-400',
      animClass: 'home-bar-cpu',
    },
    {
      label: 'RAM Allocation',
      value: '12GB / 32GB',
      color: 'from-blue-600 to-blue-400',
      valueColor: 'text-blue-400',
      animClass: 'home-bar-ram',
    },
    {
      label: 'NVMe I/O',
      value: '4500 MB/s',
      color: 'from-purple-600 to-purple-400',
      valueColor: 'text-purple-400',
      animClass: 'home-bar-nvme',
    },
  ]

  return (
    <section
      id="vps"
      className="text-text-muted bg-home-section-alt border-card-border flex w-full justify-center overflow-hidden border-t border-b px-4 py-16"
    >
      <div className="flex max-w-[1280px] flex-1 flex-col">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {/*  Left: Monitoring Panel + Spec Cards  */}
          <div className="home-animate-slide-left order-2 w-full flex-1 lg:order-1">
            {/* Resource monitor */}
            <div className="border-border bg-terminal relative flex flex-col justify-center overflow-hidden rounded-xl border px-8 py-12 shadow-xl sm:p-16">
              <div className="home-grid-bg absolute inset-0 opacity-20" />

              {/* macOS-style window dots */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#ff5f57]" />
                <div className="size-3 rounded-full bg-[#febc2e]" />
                <div className="size-3 rounded-full bg-[#28c840]" />
              </div>

              <h3 className="z-10 mb-4 text-sm font-bold tracking-widest uppercase sm:mb-6">
                {t('vps.monitor')}
              </h3>

              <div className="z-10 mx-auto w-full max-w-md space-y-4 sm:space-y-6">
                {bars.map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-2 flex justify-between font-mono text-xs sm:text-sm">
                      <span>{bar.label}</span>
                      <span className={bar.valueColor}>{bar.value}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-terminal)_80%,var(--border))]">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${bar.color} ${bar.animClass}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*  Right: Description + Features  */}
          <div className="home-animate-fade-up order-1 flex flex-1 flex-col gap-8 lg:order-2">
            <div className="flex flex-col gap-4">
              <div className="text-text-title flex items-center gap-2 font-bold tracking-wider uppercase">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  className="size-8 fill-current"
                >
                  <path d="M360-360v-240h240v240H360Zm80-80h80v-80h-80v80Zm-80 320v-80h-80q-33 0-56.5-23.5T200-280v-80h-80v-80h80v-80h-80v-80h80v-80q0-33 23.5-56.5T280-760h80v-80h80v80h80v-80h80v80h80q33 0 56.5 23.5T760-680v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T680-200h-80v80h-80v-80h-80v80h-80Zm320-160v-400H280v400h400ZM480-480Z" />
                </svg>
                {t('vps.label')}
              </div>
              <h2 className="text-text-primary text-3xl leading-tight font-bold md:text-4xl">
                {t('vps.heading')}
              </h2>
              <p className="leading-relaxed">{t('vps.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {features.map((feat) => (
                <div key={feat.title} className="home-animate-fade-up-delay-1 flex gap-4">
                  <div className="bg-primary/15 text-primary home-icon-hover flex size-12 shrink-0 items-center justify-center rounded-lg p-2">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-text-primary text-lg font-bold">{feat.title}</h3>
                    <p className="mt-1 text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Spec cards grid */}
        <div className="mx-auto mt-8 flex flex-col gap-6 md:flex-row">
          {specCards.map((card) => (
            <div
              key={card.title}
              className="border-card-border bg-navbar home-card-hover relative flex flex-1 flex-col overflow-hidden rounded-2xl border p-6 text-left shadow-sm"
            >
              {/* Background icon */}
              <div className="text-text-primary home-largeicon-hover absolute top-0 right-0 size-35 p-4 opacity-10">
                {card.icon}
              </div>

              <div
                className="home-icon-hover mb-4 flex size-10 items-center justify-center rounded-lg p-1"
                style={{
                  background: `color-mix(in srgb, ${card.iconColor} 15%, transparent)`,
                  color: card.iconColor,
                }}
              >
                {card.icon}
              </div>

              <h3 className="text-text-primary mb-2 text-xl font-bold">{card.title}</h3>
              <p className="mb-4">{card.desc}</p>

              <div className="border-card-border mt-auto flex items-center justify-between border-t pt-4 text-base">
                <span>{card.statLabel}</span>
                <span className="text-text-primary font-mono font-bold">{card.statValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
