import ThemeToggle from '../ui/ThemeToggle'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useLanguageStore from '../../store/useLanguageStore'
import { useTranslation } from '../../i18n'

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
      className="inline-flex h-6 scale-110 cursor-pointer"
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
        <div className="border-border border-b p-4">
          <p className="text-primary truncate font-bold" title={user?.username || user?.email}>
            {user?.username}
          </p>
        </div>

        <Link
          to="/account"
          className="group hover:bg-bg-hover flex items-center gap-2 px-4 py-2"
          onClick={() => setIsOpen(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="size-6 fill-current"
          >
            <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
          </svg>
          {t('menu.account')}
        </Link>

        <Link
          to="/history"
          className="group hover:bg-bg-hover flex items-center gap-2 px-4 py-2"
          onClick={() => setIsOpen(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            className="size-6 fill-current"
          >
            <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
          </svg>
          {t('menu.history')}
        </Link>

        <div className="flex items-center justify-evenly px-4 py-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          className="hover:bg-bg-hover border-border mt-1 flex w-full items-center border-t px-4 py-2 text-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-3 size-5 fill-none"
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
  )
}
