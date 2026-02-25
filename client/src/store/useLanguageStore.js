import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'vi',
      toggleLanguage: () => set((state) => ({ language: state.language === 'vi' ? 'en' : 'vi' })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
)

export default useLanguageStore
