import { motion as M, AnimatePresence } from 'motion/react'
import useLanguageStore from '../../store/useLanguageStore'

const FlagVN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" className="size-full object-cover">
    <rect width="640" height="320" fill="#da251d" />
    <path
      fill="#ff0"
      d="M320 70 l23.5 72.3 H420 l-61.8 44.9 L381.8 260 L320 215.1 L258.2 260 l23.6-72.8 L220 142.3 h76.5 Z"
    />
  </svg>
)

const FlagUK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="size-full object-cover">
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
)

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguageStore()

  return (
    <M.div
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleLanguage}
      className="relative h-6 w-12 cursor-pointer overflow-hidden rounded-sm md:h-7 md:w-14"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <M.div
          key={language}
          initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.2, rotate: 90 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 22,
            opacity: { duration: 0.15 },
          }}
          className="absolute inset-0 size-full"
        >
          {language === 'vi' ? <FlagVN /> : <FlagUK />}
        </M.div>
      </AnimatePresence>
    </M.div>
  )
}
