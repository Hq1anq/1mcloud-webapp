import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getSystemDefaultTheme = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

const useThemeStore = create(
  persist(
    (set) => ({
      theme: getSystemDefaultTheme(),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

export default useThemeStore

