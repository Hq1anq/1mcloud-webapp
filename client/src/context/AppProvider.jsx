import { useEffect } from 'react'
import useThemeStore from '../store/useThemeStore'
import useLanguageStore from '../store/useLanguageStore'

export function AppProvider({ children }) {
  const theme = useThemeStore((state) => state.theme)
  const language = useLanguageStore((state) => state.language)

  // 1. Instantly update document theme attribute on state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 2. Instantly update document lang attribute on state changes
  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  // 3. Enable transitions exactly once after the initial render settles
  useEffect(() => {
    const timeout = setTimeout(() => {
      document.documentElement.classList.add('theme-transitions')
    }, 200)

    return () => clearTimeout(timeout)
  }, [])

  return <>{children}</>
}
