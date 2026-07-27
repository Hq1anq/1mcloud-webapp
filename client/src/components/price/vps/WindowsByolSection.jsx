import DropDown from '../../ui/DropDown.jsx'
import Checkbox from '../../ui/Checkbox.jsx'
import Skeleton from '../../ui/Skeleton.jsx'
import WindowsKeyInput from '../../ui/WindowsKeyInput.jsx'
import { useTranslation } from '../../../i18n/index.js'

export default function WindowsByolSection({
  userLicenses = [],
  licensesLoading = false,
  selectedLicenseOption,
  setSelectedLicenseOption,
  customLicenseKey,
  setCustomLicenseKey,
  agreeBYOL,
  setAgreeBYOL,
  newKeyOption,
  dropdownOptions = [],
  isValidWindowsKey,
}) {
  const t = useTranslation()

  return (
    <div className="border-border bg-terminal my-2 flex w-full flex-col gap-3 rounded-xl border p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="text-primary size-5 shrink-0 fill-current"
        >
          <path d="M64 128L288 96V304H64V128ZM64 336H288V544L64 512V336ZM320 91.5L576 56V304H320V91.5ZM320 336H576V584L320 548.5V336Z" />
        </svg>
        <span className="text-text-primary text-base font-bold">{t('buyVps.winLicenseTitle')}</span>
      </div>

      {/* Existing license dropdown */}
      {(licensesLoading || userLicenses.length > 0) && (
        <div className="flex flex-col gap-1.5 text-lg">
          <span className="text-text-muted text-sm font-medium">
            {t('buyVps.selectExistingLicense')}
          </span>
          <Skeleton
            isLoading={licensesLoading}
            element={
              <DropDown
                options={dropdownOptions}
                value={selectedLicenseOption}
                onChange={setSelectedLicenseOption}
                className="bg-wrapper rounded-lg text-xs sm:text-lg"
                menuClassName="text-xs sm:text-lg"
              />
            }
            className="bg-text-muted h-10 w-full rounded-lg"
          />
        </div>
      )}

      {/* Key input if "Sử dụng key mới" or no licenses */}
      {(userLicenses.length === 0 || selectedLicenseOption === newKeyOption) && (
        <div className="flex flex-col gap-1 text-lg">
          <span className="text-text-muted text-sm font-medium">
            {t('buyVps.enterWinProductKey')}
          </span>
          <WindowsKeyInput
            value={customLicenseKey}
            onChange={(e) => setCustomLicenseKey(e.target.value)}
            className={`rounded-lg px-3 py-2 font-mono text-base tracking-wider uppercase ${
              customLicenseKey && !isValidWindowsKey ? 'border-orange focus:border-orange' : ''
            }`}
          />
          {customLicenseKey && !isValidWindowsKey && (
            <span className="text-orange text-xs font-medium">
              {t('buyVps.invalidWinKeyFormat')}
            </span>
          )}
        </div>
      )}

      {/* BYOL Checkbox Disclaimer */}
      <label className="hover:text-text-primary flex cursor-pointer items-start gap-2.5 pt-1 transition-colors">
        <div className="shrink-0 pt-0.5">
          <Checkbox checked={agreeBYOL} onChange={(e) => setAgreeBYOL(e.target.checked)} />
        </div>
        <span className="text-orange text-sm leading-relaxed select-none">
          {t('buyVps.byolDisclaimerLine1')}
          <br />
          {t('buyVps.byolDisclaimerLine2')}
        </span>
      </label>
    </div>
  )
}
