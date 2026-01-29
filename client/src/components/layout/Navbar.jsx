import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const SvgMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className="fill-toggle-theme h-5 w-5"
  >
    <path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z" />
  </svg>
)

const SvgSun = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className="fill-toggle-theme h-5 w-5"
  >
    <path d="M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z" />
  </svg>
)

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    document.documentElement.classList.add('theme-transitions')
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <div
      id="themeToggle"
      className="bg-toggle-theme relative h-6 w-[50px] cursor-pointer rounded-xl"
      onClick={toggleTheme}
    >
      <div
        id="theme-toggle-slider"
        className={`absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-[50%] bg-white ${
          theme === 'light' ? 'translate-x-[26px]' : 'translate-x-0'
        }`}
      >
        <span id="themeIcon">{theme === 'dark' ? <SvgSun /> : <SvgMoon />}</span>
      </div>
    </div>
  )
}

export default function Navbar() {
  const linkBase = 'text-text-secondary text-base py-2 px-3 rounded-sm md:p-0 flex items-center'
  const active = 'bg-navbar-menu-selected md:bg-transparent text-[#cbd5e1] md:text-text-title'
  const inactive = 'md:hover:text-text-title hover:bg-navbar-menu-hover md:hover:bg-transparent'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinkClass = ({ isActive }) => `${linkBase} ${isActive ? active : inactive}`

  return (
    <nav className="bg-navbar border-b-border sticky top-0 z-50 flex items-center justify-between border-b-2 px-5 py-3 shadow-md select-none">
      {/* Logo and Title */}
      <div className="flex items-center space-x-4">
        <svg
          id="1mcloud-icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-[10px] h-[50px] w-[50px]"
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

      {/* Mobile Menu Button */}
      <button
        id="menu-toggle"
        type="button"
        className="hover:bg-navbar-menu-hover text-text-muted inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm md:hidden"
        onClick={toggleMenu}
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 1h15M1 7h15M1 13h15"
          />
        </svg>
      </button>

      {/* Menu Items */}
      <div
        id="navbar"
        className={`navbar-transition w-full overflow-hidden md:max-h-none md:w-auto ${isMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        <ul className="bg-navbar-menu mt-4 flex flex-col rounded-lg p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:bg-transparent md:p-0 rtl:space-x-reverse">
          <li>
            <NavLink to="/" className={navLinkClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="mr-2 h-7 w-7 shrink-0 fill-current"
              >
                <path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z" />
              </svg>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/proxyChecker" className={navLinkClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="mr-2 h-7 w-7 shrink-0 fill-current"
              >
                <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z" />
              </svg>
              Proxy Checker
            </NavLink>
          </li>
          <li>
            <NavLink to="/proxyManager" className={navLinkClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="mr-2 h-7 w-7 shrink-0 fill-current"
              >
                <path d="M160 96C124.7 96 96 124.7 96 160L96 224C96 259.3 124.7 288 160 288L480 288C515.3 288 544 259.3 544 224L544 160C544 124.7 515.3 96 480 96L160 96zM376 168C389.3 168 400 178.7 400 192C400 205.3 389.3 216 376 216C362.7 216 352 205.3 352 192C352 178.7 362.7 168 376 168zM432 192C432 178.7 442.7 168 456 168C469.3 168 480 178.7 480 192C480 205.3 469.3 216 456 216C442.7 216 432 205.3 432 192zM160 352C124.7 352 96 380.7 96 416L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 416C544 380.7 515.3 352 480 352L160 352zM376 424C389.3 424 400 434.7 400 448C400 461.3 389.3 472 376 472C362.7 472 352 461.3 352 448C352 434.7 362.7 424 376 424zM432 448C432 434.7 442.7 424 456 424C469.3 424 480 434.7 480 448C480 461.3 469.3 472 456 472C442.7 472 432 461.3 432 448z" />
              </svg>
              Proxy Manager
            </NavLink>
          </li>
          <li className="mt-4 self-end md:mt-0">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  )
}
