import useLanguageStore from '../store/useLanguageStore'
import { useCallback } from 'react'
import vi from './vi'
import en from './en'

const translations = { vi, en }

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)
  return useCallback((key) => translations[language]?.[key] ?? key, [language])
}
