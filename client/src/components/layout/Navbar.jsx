import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import UserMenu, { LanguageToggle, ThemeToggle } from './UserMenu'
import useAuthStore from '../../store/useAuthStore'
import { useTranslation } from '../../i18n'

export default function Navbar() {
  const t = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const linkBase = 'text-text-primary py-2 px-3 rounded-sm md:p-0 flex items-center'
  const active = 'bg-wrapper md:bg-transparent text-[#cbd5e1] md:text-primary'
  const inactive = 'md:hover:text-primary hover:bg-bg-hover md:hover:bg-transparent'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinkClass = ({ isActive }) => `${linkBase} ${isActive ? active : inactive}`

  const MenuButton = (
    <button
      id="menu-toggle"
      type="button"
      className="hover:bg-bg-hover text-text-muted inline-flex size-10 items-center justify-center rounded-lg p-2 md:hidden"
      onClick={toggleMenu}
    >
      <svg className="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M1 1h15M1 7h15M1 13h15"
        />
      </svg>
    </button>
  )

  const Logo = (
    <div className="flex items-center space-x-4">
      <svg
        id="1mcloud-icon"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2.5 h-12.5 w-12.5"
      >
        <path
          fill="var(--logo-ring)"
          d="M512,95A417.14,417.14,0,0,1,674.29,896.27,417.14,417.14,0,0,1,349.71,127.73,414.29,414.29,0,0,1,512,95m0-95C229.23,0,0,229.23,0,512s229.23,512,512,512,512-229.23,512-512S794.77,0,512,0Z"
        />
        <polygon
          fill="var(--logo-inner)"
          points="278.19 279.12 204.29 369.27 204.29 416.09 254.9 416.09 254.9 745.08 362.99 745.08 362.99 279.12 278.19 279.12"
        />
        <path
          fill="var(--logo-inner)"
          d="M819.7,443.62c-.9-90.84-75.12-164.24-166.74-164.69a166,166,0,0,0-115.89,47.65,175.87,175.87,0,0,0-119.31-47.64l-1.06,0a116.39,116.39,0,0,0-34.61,5.28V397.11h0a52.2,52.2,0,0,1,38-16.73,64.38,64.38,0,0,1,16.37,2.31A62.84,62.84,0,0,1,469,404.09l.16.2a52.23,52.23,0,0,1,10.93,32.34V745H588.19V442.25a58,58,0,0,1,12.92-36.44,64.34,64.34,0,0,1,99.42,0l.16.19a51.38,51.38,0,0,1,10.94,32V745H819.71V443.62Z"
        />
      </svg>
      <h1 className="font-bold">1MCLOUD</h1>
    </div>
  )

  return (
    <nav
      className={`bg-navbar border-b-card-border z-50 flex items-center justify-between gap-1 border-b-2 px-3 py-1 shadow-md select-none md:px-5 md:py-3 ${isAuthenticated ? 'flex-row flex-wrap md:flex-nowrap' : 'flex-col md:flex-row'}`}
    >
      {isAuthenticated ? (
        <>
          {Logo}
          <div className="flex items-center gap-3 md:order-2">
            {MenuButton}
            <UserMenu />
          </div>
        </>
      ) : (
        <>
          {/* Row 1: Logo + Login button (mobile) */}
          <div className="flex w-full items-center justify-between md:w-auto md:flex-none">
            {Logo}
            <div className="flex items-center gap-3 md:hidden">
              <Link
                to="https://1mcloud.vn/"
                target="_blank"
                className="bg-blue rounded-lg px-4 py-2 font-medium text-white shadow-sm"
              >
                {t('menu.login')}
              </Link>
            </div>
          </div>

          {/* Row 2 (mobile only): Menu button left, toggles right */}
          <div className="flex w-full items-center justify-between md:hidden">
            {MenuButton}
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Desktop: all controls on one line */}
          <div className="hidden items-center gap-3 md:order-2 md:flex">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="https://1mcloud.vn/"
              target="_blank"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
            >
              {t('menu.login')}
            </Link>
          </div>
        </>
      )}

      {/* Menu Items */}
      <ul
        className={`bg-surface flex w-full flex-col justify-end overflow-hidden rounded-lg font-medium md:mr-8 md:max-h-none md:w-auto md:flex-1 md:flex-row md:items-center md:space-x-8 md:bg-transparent ${isMenuOpen ? 'mt-4 max-h-125 p-4' : 'max-h-0'}`}
      >
        <li>
          <NavLink to="/" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="mr-2 size-7 shrink-0 fill-current"
            >
              <path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z" />
            </svg>
            {t('nav.home')}
          </NavLink>
        </li>
        <li>
          <NavLink to="/proxyChecker" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="mr-2 size-7 shrink-0 fill-current"
            >
              <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z" />
            </svg>
            {t('nav.proxyChecker')}
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
