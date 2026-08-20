import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useThemeStore from '../store/useThemeStore'
import useLanguageStore from '../store/useLanguageStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
