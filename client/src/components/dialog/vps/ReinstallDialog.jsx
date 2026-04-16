import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import axiosInstance from '../../../lib/axios'
import Checkbox from '../../ui/Checkbox'
import Dialog from '../../ui/Dialog'
import DropDown from '../../ui/DropDown'
import Skeleton from '../../ui/Skeleton'

const createInitialForm = (data) => ({
  install_chrome: false,
  install_firefox: false,
  os: null,
  random_password: true,
  random_remote_port: true,
  password: data?.password || '',
  remote_port: data?.remote_port || '',
})

const SUPPORT_OS = [
  { id: 1, display_name: 'Windows Server 2012 R2 Standard' },
  { id: 2, display_name: 'Windows Server 2019 Standard' },
  { id: 3, display_name: 'Windows Server 2022 Standard' },
  { id: 4, display_name: 'Windows 10 Pro' },
  { id: 5, display_name: 'Win10 Enterprise' },
  { id: 6, display_name: 'CentOS 7.7' },
  { id: 7, display_name: 'CentOS 8.5.2111' },
  { id: 8, display_name: 'Ubuntu 18.04.4 LTS' },
  { id: 10, display_name: 'Ubuntu 20.04.4 LTS' },
  { id: 11, display_name: 'Windows 11 Pro' },
  { id: 18, display_name: 'Windows Server 2016 Standard' },
  { id: 19, display_name: 'Ubuntu 22.04.5 LTS' },
  { id: 20, display_name: 'Rocky Linux 9.4' },
  { id: 21, display_name: 'AlmaLinux 9.4' },
]

export default function ReinstallDialog({ isOpen, onClose, currentData, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  const [form, setForm] = useState(() => createInitialForm(currentData))

  const updateForm = (updates) => setForm((prev) => ({ ...prev, ...updates }))

  const [loadingOs, setLoadingOs] = useState(true)
  const [loadOsError, setLoadOsError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isFetchedMode, setIsFetchedMode] = useState(false)
  const [fetchedOsList, setFetchedOsList] = useState([])

  const staticOsList = useMemo(
    () => [{ id: 'current', display_name: t('current') }, ...SUPPORT_OS],
    [t]
  )

  const activeOsList = isFetchedMode ? fetchedOsList : staticOsList

  const passwordInvalid = useMemo(() => {
    if (form.random_password || !form.password) return false
    return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(form.password)
  }, [form.random_password, form.password])

  useEffect(() => {
    if (!isOpen) return
    setIsFetchedMode(false)
    setFetchedOsList([])
    updateForm({
      os: 'current',
    })
    setLoadingOs(false)
  }, [isOpen])

  const handleUseStaticOs = () => {
    setIsFetchedMode(false)
    updateForm({
      os: 'current',
    })
  }

  const handleFetchOs = async () => {
    setIsFetchedMode(true)
    setLoadingOs(true)
    setLoadOsError(false)
    try {
      const res = await axiosInstance.get('/vps/support/os')
      if (!res.data?.success) {
        setLoadOsError(true)
        addToast(t('reinstall.errorLoadOS'), 'error')
        return
      }
      const osMap = res?.data?.info.os || {}
      const list = Object.entries(osMap).map(([id, name]) => ({
        id: Number(id),
        display_name: name,
      }))
      setFetchedOsList(list)
      const firstId = list[0]?.id
      if (firstId) {
        updateForm({ os: firstId })
      }
    } catch (err) {
      console.error(err)
      setLoadOsError(true)
      addToast(t('reinstall.errorLoadOS'), 'error')
    } finally {
      setLoadingOs(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.os) {
      addToast(t('reinstall.selectOS'), 'warning')
      return
    }

    if (passwordInvalid) {
      addToast(t('buy.invalidPassword'), 'warning')
      return
    }

    setSubmitting(true)
    const loadingToast = addToast(t('manager.reinstall') + '...', 'loading')
    const payload = {
      install_chrome: form.install_chrome ? 'on' : '',
      install_firefox: form.install_firefox ? 'on' : '',
      random_password: form.random_password ? 'on' : '',
      random_remote_port: form.random_remote_port ? 'on' : '',
      password: form.random_password ? '' : form.password,
      remote_port: form.random_remote_port ? '' : form.remote_port,
      sid: String(currentData.sid),
      isProxy: false,
    }
    if (form.os !== 'current') {
      payload.os = Number(form.os)
    }

    axiosInstance
      .post('/server/reinstall', payload)
      .then((res) => {
        if (res.data?.success) {
          addToast(t('manager.reinstall') + ' ' + t('manager.success'), 'success')
          onSuccess({
            ...res.data.info,
            os:
              form.os === 'current'
                ? currentData.os
                : activeOsList.find((o) => o.id === form.os)?.display_name,
          })
          onClose()
        } else {
          addToast(t('manager.reinstall') + ' ' + t('manager.failed'), 'error')
        }
      })
      .catch((err) => {
        console.error(err)
        addToast(t('manager.reinstall') + ' ' + t('manager.failed'), 'error')
      })
      .finally(() => {
        setSubmitting(false)
        removeToast(loadingToast)
      })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('manager.reinstall')}
      className="text-text-primary"
    >
      <div className="max-sm:overflow-y-auto">
        <span className="text-base font-medium">{t('current')}</span>
        <div className="flex flex-wrap gap-4">
          <div className="bg-terminal border-border grow rounded-lg border p-2 shadow-xl sm:p-4">
            <p className="text-text-muted mb-1">IP</p>
            <p className="text-highlight font-mono tracking-wide">{currentData.ip}</p>
          </div>
          <div className="flex grow flex-wrap gap-4">
            <div className="bg-terminal border-border grow rounded-lg border p-2 shadow-xl sm:p-4">
              <p className="text-text-muted mb-1">{t('table.he_dieu_hanh')}</p>
              <p className="font-mono tracking-wide">{currentData.os}</p>
            </div>
            <div className="bg-terminal border-border grow rounded-lg border p-2 shadow-xl sm:p-4">
              <p className="text-text-muted mb-1">{t('table.note')}</p>
              <p className="font-mono tracking-wide">{currentData.note}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-base font-medium">{t('installExtension')}</span>
          <div className="flex gap-2 sm:gap-4">
            <button
              type="button"
              aria-pressed={form.install_chrome}
              onClick={() => updateForm({ install_chrome: !form.install_chrome })}
              className={`hover:bg-blue/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold select-none ${
                form.install_chrome
                  ? 'border-blue text-blue bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-blue)_12%)]'
                  : 'border-border text-text-muted bg-terminal'
              }`}
            >
              <span
                className={`slide-reveal-ease flex items-center gap-2 ${
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
                className={`slide-reveal-ease absolute right-4 size-5 ${
                  form.install_chrome
                    ? 'translate-x-0 scale-100 opacity-100'
                    : 'translate-x-5 scale-0 opacity-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>

            <button
              type="button"
              aria-pressed={form.install_firefox}
              onClick={() => updateForm({ install_firefox: !form.install_firefox })}
              className={`hover:bg-orange/10 relative flex items-center justify-center rounded-full border px-8 py-3 text-base font-semibold select-none ${
                form.install_firefox
                  ? 'border-orange text-orange bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-orange)_12%)]'
                  : 'border-border text-text-muted bg-terminal'
              }`}
            >
              <span
                className={`slide-reveal-ease flex items-center gap-2 ${
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
                className={`slide-reveal-ease absolute right-4 size-5 ${
                  form.install_firefox
                    ? 'translate-x-0 scale-100 opacity-100'
                    : 'translate-x-5 scale-0 opacity-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="my-2 flex justify-between">
          <span className="text-base font-medium">{t('buyVps.os')}</span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleUseStaticOs}
              className={`border-border flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                !isFetchedMode
                  ? 'border-blue text-blue bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-blue)_12%)]'
                  : 'text-text-muted bg-terminal hover:text-text-primary hover:bg-bg-hover'
              }`}
              title={t('reinstall.useLocalOS') || 'Switch to local OS list'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="size-4 fill-current"
              >
                <path d="m16.3788 6.20698c-1.1903-.95239-2.6354-1.70698-4.3788-1.70698-4.14213 0-7.5 3.35786-7.5 7.5 0 4.1421 3.35787 7.5 7.5 7.5 3.2549 0 6.028-2.0746 7.0646-4.9744.1859-.5201.7104-.8688 1.2507-.7543l.9782.2074c.5403.1145.8901.6475.7244 1.1744-1.3392 4.2581-5.3163 7.3469-10.0179 7.3469-5.79899 0-10.5-4.701-10.5-10.5 0-5.79899 4.70101-10.5 10.5-10.5 2.7835 0 4.9516 1.26847 6.5112 2.5746l1.7817-1.78171c.286-.286.7161-.37155 1.0898-.21677s.6173.51942.6173.92388v5.5c0 .55228-.4477 1-1 1h-5.5c-.4044 0-.7691-.24364-.9239-.61732-.1547-.37367-.0692-.80379.2168-1.08979z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleFetchOs}
              className={`border-border flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                isFetchedMode
                  ? 'border-blue text-blue bg-[color-mix(in_srgb,var(--bg-terminal),var(--color-blue)_12%)]'
                  : 'text-text-muted bg-terminal hover:text-text-primary hover:bg-bg-hover'
              }`}
              title={t('reinstall.fetchOS') || 'Fetch OS list from server'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 fill-current"
                viewBox="0 0 100 100"
              >
                <path d="m50.0003777 4.8265123c-1.2988396 0-2.5439453.5157838-3.4627533 1.4346166-.9179764.9179802-1.4337616 2.1638703-1.4337616 3.4627538v45.4180374l-11.8748017-11.7528133v.0008507c-1.2681046-.9512939-2.9179802-1.2296715-4.4276886-.7480545-1.5097542.4824677-2.6932545 1.6660347-3.175724 3.175724-.4816151 1.5097466-.2032375 3.1595421.7480564 4.4276886l20.1989651 20.1989593c.8992004.9273834 2.1356926 1.4508362 3.4277725 1.4508362 1.2920837 0 2.5284233-.5234528 3.4277763-1.4508362l20.1989632-20.1989593c.9512939-1.2681046 1.2296677-2.9179802.7480545-4.4276886-.4824677-1.5097542-1.6660309-2.6932564-3.1757202-3.175724-1.5097504-.481617-3.1595459-.2032394-4.4276886.7480545l-11.8748016 11.7519416v-45.4180393c0-1.2988386-.5157852-2.5448174-1.4337616-3.4627528-.9188309-.9188323-2.1638756-1.4346161-3.4627533-1.4346161z" />
                <path d="m92.6027451 58.2021065c-1.3082352-.0341568-2.5736771.4713593-3.4994812 1.3970337-.9265213.9256783-1.4311981 2.1911125-1.3970413 3.5003548v19.8319168c0 .6490097-.2578888 1.2723694-.7172928 1.7309418-.4594345.4594193-1.0819397.7172928-1.7309418.7172928h-70.5142613c-1.3517847 0-2.4481945-1.0964508-2.4481945-2.4481964v-18.3630906c.0341578-1.3090897-.4705105-2.5745468-1.3970366-3.500351-.9256754-.9256744-2.1911087-1.4303513-3.4994788-1.3970337-1.3090911-.0333061-2.5745506.4713593-3.5003533 1.3970337-.9258027.9256783-1.4312074 2.1911125-1.3970366 3.500351v18.3630905c0 3.2467651 1.2902908 6.3601837 3.5856137 8.6564484 2.2962604 2.2953873 5.4096789 3.5856094 8.6564465 3.5856094h70.514267c3.2467728 0 6.3601913-1.2902908 8.6564407-3.5856094 2.295383-2.2962647 3.5856052-5.4096833 3.5856052-8.6564484v-19.831913c0-1.2988434-.5157776-2.5448189-1.4346161-3.4627533-.917984-.9188309-2.1638641-1.4346161-3.4627609-1.4346161z" />
              </svg>
            </button>
          </div>
        </div>
        <Skeleton
          isLoading={loadingOs}
          isError={loadOsError}
          element={
            <DropDown
              value={activeOsList.find((o) => o.id === form.os)?.display_name || ''}
              onChange={(newLabel) => {
                const os = activeOsList.find((o) => o.display_name === newLabel)
                if (os) updateForm({ os: os.id })
              }}
              options={activeOsList.map((o) => o.display_name)}
              className="w-full rounded-lg text-base sm:text-lg"
              menuClassName="sm:text-lg text-base"
            />
          }
          className="bg-dropdown/70 h-11 w-full"
        />

        <div className="mt-4 mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex grow flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.random_password}
                onChange={(e) => updateForm({ random_password: e.target.checked })}
              />
              <span className="font-medium whitespace-nowrap">{t('buyVps.randomPassword')}</span>
            </div>
            {!form.random_password && (
              <div className="flex flex-col gap-1 text-lg">
                <input
                  type="text"
                  className={`${
                    passwordInvalid ? 'border-orange focus:border-orange focus:ring-orange/20' : ''
                  }`}
                  value={form.password}
                  onChange={(e) => updateForm({ password: e.target.value })}
                />
                {passwordInvalid && (
                  <span className="text-orange text-xs">{t('buy.invalidPassword')}</span>
                )}
              </div>
            )}
          </label>

          <label className="flex grow flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.random_remote_port}
                onChange={(e) => updateForm({ random_remote_port: e.target.checked })}
              />
              <span className="font-medium">{t('buyVps.randomPort')}</span>
            </div>
            {!form.random_remote_port && (
              <input
                type="number"
                value={form.remote_port}
                onChange={(e) => updateForm({ remote_port: e.target.value })}
              />
            )}
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 text-base">
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary rounded-lg px-4 py-2"
            disabled={submitting}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="text-text-secondary group enabled:bg-blue flex items-center gap-2 rounded-lg px-6 py-2 font-semibold hover:brightness-90 disabled:bg-gray-500"
            disabled={submitting || loadingOs}
          >
            {submitting ? t('processing') : t('manager.reinstall')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
