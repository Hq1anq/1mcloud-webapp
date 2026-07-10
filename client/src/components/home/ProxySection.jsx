import { useState } from 'react'
import { motion as M } from 'motion/react'
import { useTranslation } from '../../i18n'
import { fadeUp, slideRight, stagger, iconHover } from './homeVariants'

const featureStagger = stagger(0.1, 0.05)
const vp = { margin: '-80px' }

const flowStagger = stagger(0.2, 0.1)

const flowNode = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

const flowArrow = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

function ProxyCard({ feat }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <M.div
      className="bg-navbar border-card-border flex items-start gap-4 rounded-xl border p-4 shadow-sm"
      variants={fadeUp}
      whileHover={{
        y: -5,
        boxShadow: '0 16px 40px color-mix(in srgb, var(--color-border) 30%, transparent)',
      }}
      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <M.div
        className="flex size-10 shrink-0 items-center justify-center rounded-full p-1"
        style={{
          background: `color-mix(in srgb, ${feat.iconColor} 15%, transparent)`,
          color: feat.iconColor,
        }}
        variants={iconHover}
        animate={isHovered ? 'hover' : 'initial'}
      >
        {feat.icon}
      </M.div>
      <div>
        <h3 className="text-text-primary font-bold">{feat.title}</h3>
        <p className="mt-1 text-sm">{feat.desc}</p>
      </div>
    </M.div>
  )
}

export default function ProxySection() {
  const t = useTranslation()

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q97-30 162-118.5T718-480H480v-315l-240 90v207q0 7 2 18h238v316Z" />
        </svg>
      ),
      iconColor: 'var(--green)',
      title: t('proxy.feat1.title'),
      desc: t('proxy.feat1.desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM440-162v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q41-45 62.5-100.5T800-480q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" />
        </svg>
      ),
      iconColor: 'var(--primary)',
      title: t('proxy.feat2.title'),
      desc: t('proxy.feat2.desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M120-80v-280h120v-160h200v-80H320v-280h320v280H520v80h200v160h120v280H520v-280h120v-80H320v80h120v280H120Zm280-600h160v-120H400v120ZM200-160h160v-120H200v120Zm400 0h160v-120H600v120ZM480-680ZM360-280Zm240 0Z" />
        </svg>
      ),
      iconColor: 'var(--purple)',
      title: t('proxy.feat3.title'),
      desc: t('proxy.feat3.desc'),
    },
  ]

  return (
    <section
      id="proxy"
      className="text-text-muted flex w-full justify-center overflow-hidden px-6 pt-16"
    >
      <div className="flex max-w-380 flex-1 flex-col">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {/*  Left: Header + Feature Cards  */}
          <M.div
            className="flex flex-1 flex-col gap-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <div className="flex flex-col gap-4">
              <div className="text-primary flex items-center gap-2 font-bold tracking-wider uppercase">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 500 500"
                  className="size-8 fill-current"
                >
                  <path d="M 121.909 114.937 C 121.909 122.502 120.024 129.626 116.698 135.865 L 202.119 203.06 C 215.635 187.258 235.718 177.243 258.14 177.243 C 271.389 177.243 283.819 180.739 294.563 186.86 L 361.155 93.877 C 351.483 83.859 345.533 70.224 345.533 55.199 C 345.533 24.441 370.467 -0.493 401.225 -0.493 C 431.982 -0.493 456.916 24.441 456.916 55.199 C 456.916 85.957 431.982 110.89 401.225 110.89 C 393.545 110.89 386.227 109.338 379.572 106.526 L 312.095 200.744 C 324.29 213.851 331.767 231.404 331.826 250.703 L 381.705 260.977 C 388.531 245.126 404.291 234.029 422.645 234.029 C 447.252 234.029 467.198 253.975 467.198 278.582 C 467.198 303.188 447.252 323.134 422.645 323.134 C 398.578 323.134 378.969 304.053 378.122 280.192 L 329.295 270.137 C 325.107 285.687 315.958 299.203 303.649 308.883 L 366.739 402.438 C 373.315 399.383 380.645 397.677 388.373 397.677 C 416.765 397.677 439.781 420.693 439.781 449.085 C 439.781 477.478 416.765 500.493 388.373 500.493 C 359.98 500.493 336.965 477.478 336.965 449.085 C 336.965 435.719 342.064 423.546 350.425 414.402 L 286.155 319.098 C 277.519 322.652 268.059 324.613 258.14 324.613 C 247.029 324.613 236.489 322.154 227.04 317.748 L 173.107 393.059 C 182.315 403.72 187.884 417.612 187.884 432.805 C 187.884 466.403 160.649 493.638 127.05 493.638 C 93.453 493.638 66.218 466.403 66.218 432.805 C 66.218 399.208 93.453 371.972 127.05 371.972 C 138.234 371.972 148.715 374.991 157.719 380.258 L 210.239 306.92 C 194.457 293.405 184.454 273.333 184.454 250.927 C 184.454 239.438 187.084 228.564 191.773 218.873 L 104.527 150.247 C 97.007 156.041 87.583 159.488 77.357 159.488 C 52.75 159.488 32.803 139.541 32.803 114.935 C 32.803 90.329 52.75 70.382 77.357 70.382 C 101.963 70.382 121.909 90.329 121.909 114.935 L 121.909 114.937 Z" />
                </svg>
                {t('proxy.label')}
              </div>
              <h2 className="text-text-primary text-3xl leading-tight font-bold md:text-4xl">
                {t('proxy.heading1')} <br />
                {t('proxy.heading2')}
              </h2>
              <p className="leading-relaxed">{t('proxy.subtitle')}</p>
            </div>

            {/* Feature cards — staggered */}
            <M.div
              className="flex flex-col gap-6"
              variants={featureStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ margin: '-100px' }}
            >
              {features.map((feat) => (
                <ProxyCard key={feat.title} feat={feat} />
              ))}
            </M.div>
          </M.div>

          {/*  Right: Network Topology Diagram  */}
          <M.div
            className="relative z-0 w-full flex-1"
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <div className="border-border bg-terminal relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border p-4 shadow-2xl sm:px-8 sm:py-14">
              <div className="home-grid-bg absolute inset-0 opacity-20" />

              {/* Flow: User → Proxy → Internet */}
              <M.div
                className="relative z-10 flex w-full items-center justify-between"
                variants={flowStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: '-100px' }}
              >
                {/* User node */}
                <M.div className="flex flex-col items-center gap-2" variants={flowNode}>
                  <div className="text-primary border-primary bg-primary/20 flex size-12 items-center justify-center rounded-full border p-2 sm:size-16">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      fill="currentColor"
                    >
                      <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                    </svg>
                  </div>
                  <span className="font-mono text-sm sm:text-lg">User</span>
                </M.div>

                {/* Arrow: Request */}
                <M.div
                  className="bg-border relative mx-2 h-px flex-1"
                  variants={flowArrow}
                  style={{ transformOrigin: 'left center' }}
                >
                  <div className="bg-terminal text-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-4 px-1 py-0 text-[10px] sm:-translate-y-1/2 sm:text-lg">
                    Request
                  </div>
                  <div className="border-border absolute -top-1 -right-1 size-2 rotate-45 border-t border-r" />
                </M.div>

                {/* Proxy node */}
                <M.div className="flex flex-col items-center gap-2" variants={flowNode}>
                  <div className="bg-primary/10 text-primary border-primary flex size-15 flex-col items-center justify-center rounded-lg border p-2 shadow-[0_0_15px_rgba(19,127,236,0.3)] sm:size-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -960 960 960"
                      fill="currentColor"
                    >
                      <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
                    </svg>
                    <span className="mt-1 text-[10px] font-bold">PROXY</span>
                  </div>
                  <span className="text-primary font-mono text-sm sm:text-lg">Anonymous</span>
                </M.div>

                {/* Arrow: Forward */}
                <M.div
                  className="bg-border relative mx-2 h-px flex-1"
                  variants={flowArrow}
                  style={{ transformOrigin: 'left center' }}
                >
                  <div className="bg-terminal text-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-4 px-1 py-0 text-[10px] sm:-translate-y-1/2 sm:text-lg">
                    Forward
                  </div>
                  <div className="border-border absolute -top-1 -right-1 size-2 rotate-45 border-t border-r" />
                </M.div>

                {/* Internet node */}
                <M.div className="flex flex-col items-center gap-2" variants={flowNode}>
                  <div className="text-green border-green bg-green/20 flex size-12 items-center justify-center rounded-full border p-2 sm:size-16">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -960 960 960"
                      fill="currentColor"
                    >
                      <path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM440-162v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q41-45 62.5-100.5T800-480q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" />
                    </svg>
                  </div>
                  <span className="font-mono text-sm sm:text-lg">Internet</span>
                </M.div>
              </M.div>

              {/* IP info row */}
              <div className="border-card-border relative z-10 mt-4 w-full border-t pt-4 sm:mt-8">
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green size-2 rounded-full" />
                    <span>IP: 192.168.1.x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green/50 size-2 rounded-full" />
                    <span>IP: 10.0.0.x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect — looping ambient, managed via motion WAAPI */}
            <M.div
              className="absolute -top-10 -right-10 -z-10 h-full w-full rounded-full bg-linear-to-br from-green-500 to-blue-500 blur-3xl"
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'easeInOut',
              }}
            />
          </M.div>
        </div>
      </div>
    </section>
  )
}
