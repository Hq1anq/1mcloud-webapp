import { motion as m } from 'motion/react'
import { useTranslation } from '../../i18n'
import { fadeUp, slideRight, stagger } from './homeVariants'

// Feature check items stagger inside the left column
const featureStagger = stagger(0.1, 0)

export default function HeroSection() {
  const t = useTranslation()

  return (
    <section
      id="hero"
      className="text-text-muted flex w-full justify-center overflow-hidden bg-[linear-gradient(to_bottom,var(--home-hero-gradient-from),var(--home-hero-gradient-to))] px-4 py-12 md:py-20"
    >
      <div className="flex max-w-7xl flex-1 flex-col">
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          {/*  Left: Text Content  */}
          <m.div
            className="z-10 flex flex-1 flex-col text-center lg:text-left"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col gap-4">
              {/* Badge */}
              <div className="bg-primary/10 text-primary inline-flex items-center gap-2 self-center rounded-full border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] px-3 py-1 text-xs font-bold tracking-wider uppercase lg:self-start">
                <span className="relative flex size-2">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-primary relative inline-flex size-2 rounded-full" />
                </span>
                {t('hero.badge')}
              </div>

              {/* Heading */}
              <h1 className="text-text-primary text-4xl leading-tight font-black tracking-tight md:text-5xl lg:text-6xl">
                {t('hero.heading1')} <br className="hidden lg:block" />
                <span className="text-primary">{t('hero.heading2')}</span>
                <br />
                {t('hero.heading3')}
              </h1>

              {/* Subtitle */}
              <p className="mx-auto max-w-2xl leading-relaxed font-normal lg:mx-0">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Feature Checks — staggered separately, slightly after heading */}
            <m.div
              className="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start"
              variants={featureStagger}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.25 }}
            >
              {[t('hero.feature1'), t('hero.feature2'), t('hero.feature3')].map((label) => (
                <m.div key={label} className="flex items-center gap-2" variants={fadeUp}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className="fill-primary size-10"
                  >
                    <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM390.7 233.9C398.5 223.2 413.5 220.8 424.2 228.6C434.9 236.4 437.3 251.4 429.5 262.1L307.4 430.1C303.3 435.8 296.9 439.4 289.9 439.9C282.9 440.4 276 437.9 271.1 433L215.2 377.1C205.8 367.7 205.8 352.5 215.2 343.2C224.6 333.9 239.8 333.8 249.1 343.2L285.1 379.2L390.7 234z" />
                  </svg>
                  <span className="text-base font-medium">{label}</span>
                </m.div>
              ))}
            </m.div>
          </m.div>

          {/*  Right: Server Rack Illustration  */}
          <m.div
            className="relative flex w-full max-w-150 flex-1 items-center justify-center lg:max-w-none"
            variants={slideRight}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.12 }}
          >
            <div className="border-border bg-terminal relative flex w-full items-center justify-center overflow-hidden rounded-xl border py-16 shadow-2xl">
              {/* Grid overlay */}
              <div className="home-grid-bg absolute inset-0 opacity-20" />

              {/* Server panel — float loop managed via motion WAAPI */}
              <m.div
                className="border-border bg-wrapper relative z-10 flex w-64 flex-col gap-3 rounded-lg border p-4 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: 'easeInOut',
                }}
              >
                {/* Server rows */}
                {[
                  {
                    bar1: 'bg-green animate-pulse',
                    bar2: 'bg-green/50',
                    dots: ['bg-primary', 'bg-primary animate-ping'],
                  },
                  {
                    bar1: 'bg-green',
                    bar2: 'bg-green/50',
                    dots: ['bg-orange', 'bg-slate-600'],
                  },
                  {
                    bar1: 'bg-green',
                    bar2: 'bg-green',
                    dots: ['bg-primary', 'bg-primary'],
                  },
                  { bar1: 'bg-slate-700', bar2: 'bg-slate-700', dots: null },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="border-border bg-terminal flex h-12 items-center gap-2 rounded border px-3"
                  >
                    <div className={`h-8 w-1 rounded-full ${row.bar1}`} />
                    <div className={`h-8 w-1 rounded-full ${row.bar2}`} />
                    <div className="flex flex-1 justify-end gap-1">
                      {row.dots ? (
                        row.dots.map((dot, j) => (
                          <div key={j} className={`size-2 rounded-full ${dot}`} />
                        ))
                      ) : (
                        <div className="h-2 w-8 rounded bg-slate-700" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Rack label */}
                <div className="mt-auto flex justify-between font-mono text-[10px]">
                  <span>RACK-01</span>
                  <span className="text-green">ONLINE</span>
                </div>
              </m.div>

              {/* Decorative lines */}
              <div className="absolute top-1/2 right-12 h-px w-20 bg-[linear-gradient(to_left,var(--primary),transparent)]" />
              <div className="absolute bottom-1/4 left-12 h-px w-24 bg-[linear-gradient(to_right,var(--primary),transparent)]" />

              {/* Bottom stats bar */}
              <div className="border-border absolute right-6 bottom-6 left-6 z-20 flex items-center rounded-lg border p-2 shadow-2xl backdrop-blur-md sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-md p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -960 960 960"
                      className="fill-primary size-6"
                    >
                      <path d="M480-316.5q38-.5 56-27.5l224-336-336 224q-27 18-28.5 55t22.5 61q24 24 62 23.5Zm0-483.5q59 0 113.5 16.5T696-734l-76 48q-33-17-68.5-25.5T480-720q-133 0-226.5 93.5T160-400q0 42 11.5 83t32.5 77h552q23-38 33.5-79t10.5-85q0-36-8.5-70T766-540l48-76q30 47 47.5 100T880-406q1 57-13 109t-41 99q-11 18-30 28t-40 10H204q-21 0-40-10t-30-28q-26-45-40-95.5T80-400q0-83 31.5-155.5t86-127Q252-737 325-768.5T480-800Zm7 313Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase">{t('hero.networkSpeed')}</p>
                    <p className="text-text-primary text-sm font-bold sm:text-base">
                      10 Gbps Uplink
                    </p>
                  </div>
                </div>
                <div className="border-border m-auto h-8 w-px border" />
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-green-500/20 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -960 960 960"
                      className="size-6 fill-green-500"
                    >
                      <path d="m438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase">{t('hero.uptime')}</p>
                    <p className="text-text-primary text-sm font-bold sm:text-base">99.99%</p>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
