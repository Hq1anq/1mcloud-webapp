import ThemeToggle from '../ui/ThemeToggle'
import LanguageToggle from '../ui/LanguageToggle'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { useTranslation } from '../../i18n'

export default function UserMenu({ isOpen, setIsOpen }) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const t = useTranslation()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/login')
  }

  return (
    <div
      className={`text-text-primary border-border bg-terminal absolute top-full right-0 z-50 mt-2 min-w-44 origin-top-right overflow-hidden rounded-xl border shadow-2xl transition-all duration-150 ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-3 scale-95 opacity-0'}`}
    >
      <Link
        to="/account"
        className="group hover:bg-bg-hover flex items-center gap-2 py-2 pr-4 pl-3"
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
        className="group hover:bg-bg-hover flex items-center gap-2 py-2 pr-4 pl-3"
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

      <Link
        to="/licenses"
        className="group hover:bg-bg-hover flex items-center gap-2 py-2 pr-4 pl-3"
        onClick={() => setIsOpen(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="size-6 fill-current"
        >
          <path d="M400 416C497.2 416 576 337.2 576 240C576 142.8 497.2 64 400 64C302.8 64 224 142.8 224 240C224 258.7 226.9 276.8 232.3 293.7L71 455C66.5 459.5 64 465.6 64 472L64 552C64 565.3 74.7 576 88 576L168 576C181.3 576 192 565.3 192 552L192 512L232 512C245.3 512 256 501.3 256 488L256 448L296 448C302.4 448 308.5 445.5 313 441L346.3 407.7C363.2 413.1 381.3 416 400 416zM440 160C462.1 160 480 177.9 480 200C480 222.1 462.1 240 440 240C417.9 240 400 222.1 400 200C400 177.9 417.9 160 440 160z" />
        </svg>
        {t('menu.licenses')}
      </Link>

      <div className="flex items-center justify-evenly py-2">
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
  )
}
