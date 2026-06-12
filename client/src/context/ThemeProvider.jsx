import { useEffect } from 'react'
import useThemeStore from '../store/useThemeStore'

export function ThemeProvider({ children }) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    // Apply the theme attribute
    document.documentElement.setAttribute('data-theme', theme)

    // Smooth transition class
    const timeout = setTimeout(() => {
      document.documentElement.classList.add('theme-transitions')
    }, 300)

    return () => clearTimeout(timeout)
  }, [theme])

  return <>{children}</>
}
