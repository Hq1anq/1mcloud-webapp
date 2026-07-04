import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getSystemDefaultLanguage = () => {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language || navigator.userLanguage
    return browserLang && browserLang.startsWith('vi') ? 'vi' : 'en'
  }
  return 'vi'
}

const useLanguageStore = create(
  persist(
    (set) => ({
      language: getSystemDefaultLanguage(),
      toggleLanguage: () => set((state) => ({ language: state.language === 'vi' ? 'en' : 'vi' })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
)

export default useLanguageStore

