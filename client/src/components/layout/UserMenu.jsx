import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'

// SVG Icons for Theme Toggle (copied from Navbar.jsx for now)
const SvgMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className="fill-toggle-theme h-4 w-4"
  >
    <path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z" />
  </svg>
)

const SvgSun = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className="fill-toggle-theme h-4 w-4"
  >
    <path d="M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z" />
  </svg>
)

const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme } = useThemeStore()

  const handleToggle = (e) => {
    e.stopPropagation() // Prevent closing dropdown if inside one
    toggleTheme()
  }

  return (
    <div
      className={`bg-toggle-theme relative h-6 w-[45px] cursor-pointer rounded-full`}
      onClick={handleToggle}
    >
      <div
        className={`absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ${
          theme === 'light' ? 'translate-x-[21px]' : 'translate-x-0'
        }`}
      >
        <span className="text-gray-800">{theme === 'dark' ? <SvgSun /> : <SvgMoon />}</span>
      </div>
    </div>
  )
}

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

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

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
      >
        Login
      </Link>
    )
  }

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:ring-offset-navbar flex h-10 w-10 transform items-center justify-center rounded-full bg-linear-to-tr from-blue-500 to-purple-500 font-bold text-white shadow-md hover:scale-110 hover:shadow-lg focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`bg-navbar-menu text-text-secondary border-border absolute right-0 mt-3 min-w-44 origin-top-right overflow-hidden rounded-xl border py-2 shadow-2xl ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-3 scale-95 opacity-0'}`}
      >
        {/* Header */}
        <div className="border-border border-b px-4 py-3">
          <p className="text-text-title truncate font-bold" title={user?.username || user?.email}>
            {user?.username || 'User'}
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <Link
            to="/profile"
            className="group hover:bg-navbar-menu-hover flex items-center px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-4 w-4 group-hover:text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </Link>

          <div className="hover:bg-navbar-menu-hover flex cursor-default items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              Theme
            </div>
            <ThemeToggle />
          </div>

          <div className="border-border my-1 border-t"></div>

          <button
            onClick={handleLogout}
            className="hover:bg-navbar-menu-hover flex w-full items-center px-4 py-2 text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-4 w-4"
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
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
