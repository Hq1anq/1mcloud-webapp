import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import useLanguageStore from '../../store/useLanguageStore'
import { useTranslation } from '../../i18n'

// SVG Icons for Theme Toggle (copied from Navbar.jsx for now)
const SvgMoon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={`fill-current ${className}`}
  >
    <path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z" />
  </svg>
)

const SvgSun = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className={`fill-current ${className}`}
  >
    <path d="M120.234 154.188C124.906 158.875 131.062 161.219 137.203 161.219S149.484 158.875 154.172 154.188C163.547 144.812 163.547 129.625 154.172 120.25L108.922 74.969C99.578 65.594 84.359 65.594 74.984 74.969S65.609 99.531 74.984 108.906L120.234 154.188ZM256 112C269.25 112 280 101.25 280 88V24C280 10.75 269.25 0 256 0S232 10.75 232 24V88C232 101.25 242.75 112 256 112ZM112 256C112 242.75 101.25 232 88 232H24C10.75 232 0 242.75 0 256S10.75 280 24 280H88C101.25 280 112 269.25 112 256ZM374.797 161.219C380.937 161.219 387.094 158.875 391.766 154.187L437.016 108.906C446.391 99.531 446.391 84.344 437.016 74.969S412.422 65.594 403.078 74.969L357.828 120.25C348.453 129.625 348.453 144.812 357.828 154.187C362.516 158.875 368.656 161.219 374.797 161.219ZM256 400C242.75 400 232 410.75 232 424V488C232 501.25 242.75 512 256 512S280 501.25 280 488V424C280 410.75 269.25 400 256 400ZM120.234 357.812L74.984 403.094C65.609 412.469 65.609 427.656 74.984 437.031C79.672 441.719 85.812 444.063 91.953 444.063S104.25 441.719 108.922 437.031L154.172 391.75C163.547 382.375 163.547 367.188 154.172 357.812S129.578 348.438 120.234 357.812ZM488 232H424C410.75 232 400 242.75 400 256S410.75 280 424 280H488C501.25 280 512 269.25 512 256S501.25 232 488 232ZM391.766 357.812C382.422 348.437 367.203 348.437 357.828 357.812S348.453 382.375 357.828 391.75L403.078 437.031C407.75 441.719 413.906 444.063 420.047 444.063S432.328 441.719 437.016 437.031C446.391 427.656 446.391 412.469 437.016 403.094L391.766 357.812ZM256 144C194.145 144 144 194.143 144 256C144 317.855 194.145 368 256 368S368 317.855 368 256C368 194.143 317.855 144 256 144Z" />
  </svg>
)

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  const handleToggle = (e) => {
    e.stopPropagation()
    toggleTheme()
  }

  return (
    <button
      onClick={handleToggle}
      className={`bg-primary/10 hover:bg-bg-hover relative flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-2xl`}
    >
      <div
        className={`absolute origin-top ease-[cubic-bezier(0.87,0,0.13,1)] ${isDark ? '-translate-x-12 -rotate-90 opacity-0' : 'translate-x-0 rotate-0 opacity-100'}`}
      >
        <SvgSun className="size-6 text-amber-500" />
      </div>
      <div
        className={`absolute origin-top ease-[cubic-bezier(0.87,0,0.13,1)] ${isDark ? 'translate-x-0 rotate-0 opacity-100' : 'translate-x-12 rotate-90 opacity-0'}`}
      >
        <SvgMoon className="size-6 text-sky-300" />
      </div>
    </button>
  )
}

const FlagVN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" className="rounded-sm">
    <rect width="640" height="320" fill="#da251d" />
    <path
      fill="#ff0"
      d="M320 70 l23.5 72.3 H420 l-61.8 44.9 L381.8 260 L320 215.1 L258.2 260 l23.6-72.8 L220 142.3 h76.5 Z"
    />
  </svg>
)

const FlagUK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="rounded-sm">
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
)

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguageStore()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = (e) => {
    e.stopPropagation()
    setIsAnimating(true)
    setTimeout(() => {
      toggleLanguage()
      setTimeout(() => setIsAnimating(false), 200)
    }, 180)
  }

  return (
    <span
      onClick={handleToggle}
      className="inline-flex h-6 cursor-pointer active:scale-95"
      style={{
        transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        transform: isAnimating ? 'scale(0.3) rotate(-20deg)' : 'scale(1) rotate(0deg)',
        opacity: isAnimating ? 0 : 1,
      }}
    >
      {language === 'vi' ? <FlagVN /> : <FlagUK />}
    </span>
  )
}

export default function UserMenu() {
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const t = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/login')
  }

  // Get first letter of username or email
  const getInitials = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:ring-offset-navbar flex size-10 transform items-center justify-center rounded-full bg-linear-to-tr from-blue-500 to-purple-500 font-bold text-white shadow-md hover:scale-110 hover:shadow-lg focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`text-text-primary border-border bg-terminal absolute right-0 mt-3 min-w-44 origin-top-right overflow-hidden rounded-xl border shadow-2xl ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-3 scale-95 opacity-0'}`}
      >
        {/* Header */}
        <div className="border-border border-b px-4 py-4">
          <p className="text-primary truncate font-bold" title={user?.username || user?.email}>
            {user?.username || 'User'}
          </p>
        </div>

        {/* Menu Items */}
        <div>
          <Link
            to="/account"
            className="group hover:bg-bg-hover flex items-center gap-2 px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 fill-current"
            >
              <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
            </svg>
            {t('menu.account')}
          </Link>

          <div className="flex items-center justify-evenly px-4 py-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <div className="border-border my-1 border-t"></div>

          <button
            onClick={handleLogout}
            className="hover:bg-bg-hover flex w-full items-center px-4 py-2 text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('menu.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
