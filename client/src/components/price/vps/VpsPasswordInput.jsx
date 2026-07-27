import Checkbox from '../../ui/Checkbox.jsx'
import { useTranslation } from '../../../i18n/index.js'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/

export default function VpsPasswordInput({
  randomPassword,
  setRandomPassword,
  passwordInput,
  setPasswordInput,
}) {
  const t = useTranslation()
  const isInvalidPassword = Boolean(passwordInput && !PASSWORD_REGEX.test(passwordInput))

  return (
    <label className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox checked={randomPassword} onChange={(e) => setRandomPassword(e.target.checked)} />
        <span className="font-medium whitespace-nowrap">{t('buyVps.randomPassword')}</span>
      </div>
      {!randomPassword && (
        <div className="flex flex-col gap-1 text-lg">
          <input
            type="text"
            className={`${
              isInvalidPassword ? 'border-orange focus:border-orange focus:ring-orange/20' : ''
            }`}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          {isInvalidPassword && (
            <span className="text-orange text-xs">{t('buy.invalidPassword')}</span>
          )}
        </div>
      )}
    </label>
  )
}
