import { Link } from 'react-router-dom'
import { motion as M, AnimatePresence } from 'motion/react'
import { useLegalScroll } from '../../hooks/useLegalScroll'
import type { LegalPageLayoutProps } from '../../types/legal'

/**
 * LegalPageLayout — Shared presentation component for Terms of Service, Privacy Policy, etc.
 */
export default function LegalPageLayout({ data, activeRoute, noticeIcon }: LegalPageLayoutProps) {
  const { activeSection, isMobileTocOpen, setIsMobileTocOpen, scrollToSection } =
    useLegalScroll(data.sections)

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="border-card-border relative overflow-hidden border-b bg-[linear-gradient(to_bottom,var(--home-hero-gradient-from),var(--home-hero-gradient-to))] px-4 py-12 sm:px-6 md:py-16">
        <div className="home-grid-bg absolute inset-0 opacity-20" />

        <div className="relative mx-auto flex max-w-380 flex-col items-center justify-between gap-8 lg:flex-row lg:items-end">
          <M.div
            className="flex flex-1 flex-col gap-4 text-center lg:text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow Badge */}
            <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 self-center rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase lg:self-start">
              <span className="relative flex size-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </span>
              {data.badge}
            </div>

            {/* Title */}
            <h1 className="text-text-primary text-3xl leading-tight font-black tracking-tight sm:text-4xl md:text-5xl">
              {data.title}
            </h1>

            {/* Subtitle */}
            <p className="text-text-muted max-w-2xl text-base leading-relaxed sm:text-lg">
              {data.subtitle}
            </p>
          </M.div>

          {/* Status Metadata Panel */}
          {data.status && (
            <M.aside
              className="border-border bg-terminal/80 w-full max-w-sm rounded-xl border p-4 shadow-xl backdrop-blur-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="border-border/60 flex items-center justify-between border-b py-2 text-sm">
                <span className="text-text-muted text-xs font-semibold uppercase">
                  {data.status.scopeLabel}
                </span>
                <span className="text-text-primary font-mono font-bold">{data.status.scopeValue}</span>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b py-2 text-sm">
                <span className="text-text-muted text-xs font-semibold uppercase">
                  {data.status.formatLabel}
                </span>
                <span className="text-text-primary font-mono font-bold">{data.status.formatValue}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-text-muted text-xs font-semibold uppercase">
                  {data.status.updatedLabel}
                </span>
                <span className="text-highlight font-mono font-bold">{data.status.updatedValue}</span>
              </div>
            </M.aside>
          )}
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-380 px-4 pt-8 sm:px-6 md:pt-12">
        {/* Quick Subnav Switcher */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 md:mb-8">
          <div className="bg-surface border-card-border relative inline-flex rounded-xl border p-1 shadow-sm">
            <Link
              to="/terms"
              className={`relative rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-colors sm:text-sm ${
                activeRoute === 'terms'
                  ? 'text-text-secondary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {activeRoute === 'terms' && (
                <M.span
                  layoutId="legal-subnav-indicator"
                  className="bg-blue absolute inset-0 rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{data.nav.terms}</span>
            </Link>
            <Link
              to="/privacy"
              className={`relative rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-colors sm:text-sm ${
                activeRoute === 'privacy'
                  ? 'text-text-secondary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {activeRoute === 'privacy' && (
                <M.span
                  layoutId="legal-subnav-indicator"
                  className="bg-blue absolute inset-0 rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{data.nav.privacy}</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Document Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left: Sticky Table of Contents (Desktop) */}
          <M.aside
            className="hidden lg:block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-card-border bg-navbar/90 sticky top-6 rounded-2xl border p-5 shadow-sm backdrop-blur-md">
              <p className="text-primary mb-4 text-xs font-bold tracking-wider uppercase">
                {data.tocTitle}
              </p>
              <nav className="flex flex-col gap-1">
                {data.sections.map((sec) => {
                  const isActive = activeSection === sec.id
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`flex items-center justify-between gap-1 rounded-lg border-l-2 px-3 py-2 text-sm transition-all duration-200 ${
                        isActive
                          ? 'border-primary/40 bg-primary/10 text-primary font-bold'
                          : 'text-text-muted hover:bg-bg-hover hover:text-text-primary border-transparent'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <span className="font-mono text-[10px] opacity-60">
                        {sec.kicker.split('/')[0]}
                      </span>
                    </a>
                  )
                })}
              </nav>
            </div>
          </M.aside>

          {/* Right: Document Content Card */}
          <M.article
            className="border-card-border bg-navbar/70 rounded-2xl border p-6 shadow-md backdrop-blur-sm sm:p-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Notice Banner */}
            {data.note && (
              <div className="border-primary/30 bg-primary/5 mb-10 flex flex-col gap-2 rounded-xl border p-5 sm:flex-row sm:items-start sm:gap-4">
                <div className="bg-primary/20 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                  {noticeIcon || (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <strong className="text-text-primary block text-base font-bold">
                    {data.note.title}
                  </strong>
                  <p className="text-text-muted mt-1 text-sm leading-relaxed">{data.note.text}</p>
                </div>
              </div>
            )}

            {/* Sections */}
            <div className="flex flex-col">
              {data.sections.map((sec, index) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className={`-mx-4 scroll-mt-8 rounded-xl px-4 py-8 transition-colors sm:-mx-6 sm:px-6 ${
                    index !== 0 ? 'border-border/40 border-t' : 'pt-0'
                  }`}
                >
                  <p className="text-primary mb-2 text-xs font-bold tracking-wider uppercase">
                    {sec.kicker}
                  </p>
                  <h2 className="text-text-primary mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    {sec.title}
                  </h2>

                  <div className="text-text-muted flex flex-col gap-3 text-base leading-relaxed">
                    {sec.content.map((pText, i) => (
                      <p key={i}>{pText}</p>
                    ))}
                  </div>

                  {/* Bullet points if any */}
                  {sec.bullets && (
                    <ul className="text-text-muted mt-4 flex flex-col gap-2 pl-2">
                      {sec.bullets.map((bText, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                          <span>{bText}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Clause grid if any */}
                  {sec.grid && (
                    <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {sec.grid.map((card, i) => (
                        <div
                          key={i}
                          className="border-card-border bg-terminal/40 hover:border-primary/50 hover:bg-terminal/70 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <b className="text-primary mb-1.5 flex items-center gap-2 font-bold">
                            <span className="bg-primary size-2 rounded-full" />
                            {card.title}
                          </b>
                          <span className="text-text-muted block text-sm leading-relaxed">
                            {card.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Document Footer */}
            <footer className="border-border/60 text-text-muted mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs">
              <span className="text-primary font-semibold">{data.footerInfo}</span>
              <span>© {new Date().getFullYear()} 1MCLOUD. All rights reserved.</span>
            </footer>
          </M.article>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) for Table of Contents */}
      <div className="fixed right-4 bottom-4 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileTocOpen(true)}
          className="bg-blue text-text-secondary rounded-full p-2"
          aria-label="Open Table of Contents"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile Slide-Up Drawer for Table of Contents */}
      <AnimatePresence>
        {isMobileTocOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            {/* Backdrop */}
            <M.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileTocOpen(false)}
            />

            {/* Drawer Card */}
            <M.div
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="border-card-border bg-surface relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-3xl border-t p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="border-border/40 mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary size-2 rounded-full" />
                  <h3 className="text-primary text-sm font-bold tracking-wider uppercase">
                    {data.tocTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileTocOpen(false)}
                  className="hover:bg-bg-hover text-text-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* List */}
              <nav className="flex flex-col gap-1.5 overflow-y-auto pr-1 pb-4">
                {data.sections.map((sec) => {
                  const isActive = activeSection === sec.id
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`flex items-center justify-between gap-2 rounded-xl border-l-3 px-3.5 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                          : 'text-text-muted hover:bg-bg-hover hover:text-text-primary border-transparent'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <span className="font-mono text-xs opacity-60">
                        {sec.kicker.split('/')[0]}
                      </span>
                    </a>
                  )
                })}
              </nav>
            </M.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
