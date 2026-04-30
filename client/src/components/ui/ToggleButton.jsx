import { useTranslation } from '../../i18n'

export default function ToggleButton({ isOn, onClick }) {
  const t = useTranslation()

  return (
    <button
      onClick={onClick}
      className="group relative h-7 w-16 shrink-0 overflow-hidden rounded-full bg-black/40 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-transform outline-none active:scale-95"
    >
      <div
        className={`absolute inset-0 transition-colors duration-500 ${isOn ? 'bg-oncheck/20' : 'bg-white/20'}`}
      />
      <div className="absolute inset-0 z-0 flex items-center justify-between px-2.5 text-[0.6rem] uppercase">
        <span
          className={`font-bold tracking-wide transition-all duration-500 ${
            isOn
              ? 'text-oncheck translate-x-0 opacity-100'
              : '-translate-x-4 text-transparent opacity-0'
          }`}
        >
          {t('popConfirm.on')}
        </span>
        <span
          className={`font-bold tracking-wide transition-all duration-500 ${
            !isOn
              ? 'text-text-muted translate-x-0 opacity-100'
              : 'translate-x-4 text-transparent opacity-0'
          }`}
        >
          {t('popConfirm.off')}
        </span>
      </div>

      <div
        className={`elastic-out absolute top-1 left-1 z-10 size-5 rounded-full bg-white shadow-md transition-all duration-400 group-active:w-8 ${
          isOn ? 'bg-oncheck translate-x-9 group-active:translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
