import { useTranslation } from '../../../i18n/index.js'

export default function ExtensionInstallSelector({ form = {}, updateForm }) {
  const t = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-base font-medium">{t('installExtension')}</span>
      <div className="flex gap-2 sm:gap-4">
        {/* Chrome Button */}
        <button
          type="button"
          aria-pressed={Boolean(form.install_chrome)}
          onClick={() => updateForm({ install_chrome: !form.install_chrome })}
          className={`hover:bg-blue/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold transition-colors select-none ${
            form.install_chrome
              ? 'border-blue text-blue bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-blue)_12%)]'
              : 'border-border text-text-muted bg-terminal'
          }`}
        >
          <span
            className={`slide-reveal-ease flex items-center gap-2 transition-transform ${
              form.install_chrome ? '-translate-x-4' : 'translate-x-0'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 fill-current"
            >
              <path d="M64 320C64 273.4 76.5 229.6 98.3 191.1L208.1 382.3C230 421.5 271.9 448 320 448C334.3 448 347.1 445.7 360.8 441.4L284.5 573.6C159.9 556.3 64 449.3 64 320zM429.1 385.6C441.4 366.4 448 343.1 448 320C448 281.8 431.2 247.5 404.7 224L557.4 224C569.4 253.6 576 286.1 576 320C576 461.4 461.4 575.1 320 576L429.1 385.6zM541.8 192L320 192C257.1 192 206.3 236.1 194.5 294.7L118.2 162.5C165 102.5 238 64 320 64C414.8 64 497.5 115.5 541.8 192zM408 320C408 368.6 368.6 408 320 408C271.4 408 232 368.6 232 320C232 271.4 271.4 232 320 232C368.6 232 408 271.4 408 320z" />
            </svg>
            <span>Chrome</span>
          </span>

          <svg
            className={`slide-reveal-ease absolute right-4 size-5 transition-transform ${
              form.install_chrome
                ? 'translate-x-0 scale-100 opacity-100'
                : 'translate-x-5 scale-0 opacity-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        {/* Firefox Button */}
        <button
          type="button"
          aria-pressed={Boolean(form.install_firefox)}
          onClick={() => updateForm({ install_firefox: !form.install_firefox })}
          className={`hover:bg-orange/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold transition-colors select-none ${
            form.install_firefox
              ? 'border-orange text-orange bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-orange)_12%)]'
              : 'border-border text-text-muted bg-terminal'
          }`}
        >
          <span
            className={`slide-reveal-ease flex items-center gap-2 transition-transform ${
              form.install_firefox ? '-translate-x-4' : 'translate-x-0'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 fill-current"
            >
              <path d="M194.2 191.5L194.2 191.5zM545.6 236.9C535 211.4 513.5 183.9 496.7 175.2C510.4 202.1 518.4 229.1 521.4 249.2C521.4 249.3 521.4 249.5 521.5 249.6C493.9 180.8 447.1 153.1 408.9 92.8C393.9 69.1 398 67.6 395.8 68.1L395.7 68.2C349 94.2 320.4 146.6 313.1 190.9C296.5 191.8 280.2 195.9 265.2 203C263.8 203.6 262.7 204.7 262.1 206C261.5 207.3 261.2 208.8 261.5 210.3C261.7 211.1 262.1 211.9 262.6 212.6C263.1 213.3 263.8 213.9 264.5 214.3C265.2 214.7 266.1 215 266.9 215.1C267.7 215.2 268.6 215.1 269.4 214.8L269.9 214.6C285.4 207.3 302.3 203.4 319.4 203.3C382.2 202.7 416.6 247.3 427 265.6C414 256.4 390.6 247.4 368.2 251.3C455.9 295.2 432.4 445.8 310.8 440.5C251.3 437.9 213.7 389.5 210.3 349.7C210.3 349.7 221.5 307.8 290.9 307.8C298.4 307.8 319.8 286.9 320.2 280.8C320.1 278.8 277.7 261.9 261.1 245.6C252.3 236.9 248 232.7 244.3 229.5C242.3 227.8 240.2 226.2 238 224.7C232.4 205.2 232.2 184.7 237.3 165.1C212.2 176.5 192.7 194.5 178.6 210.5L178.5 210.5C168.8 198.3 169.5 157.9 170.1 149.4C170 148.9 162.9 153.1 161.9 153.7C153.3 159.8 145.4 166.6 138.1 174.1C121.8 190.7 94 224.3 82.6 275.3C78.1 295.7 75.8 319.7 75.8 327.6C75.8 462.3 185 571.5 319.7 571.5C440.3 571.5 542.7 484.3 560.1 368.9C571.7 292.2 545.4 237.8 545.4 236.9z" />
            </svg>
            <span>Firefox</span>
          </span>

          <svg
            className={`slide-reveal-ease absolute right-4 size-5 transition-transform ${
              form.install_firefox
                ? 'translate-x-0 scale-100 opacity-100'
                : 'translate-x-5 scale-0 opacity-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
