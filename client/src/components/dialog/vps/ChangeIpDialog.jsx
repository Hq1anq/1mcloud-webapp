import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import axiosInstance from '../../../lib/axios'
import Checkbox from '../../ui/Checkbox'
import Dialog from '../../ui/Dialog'
import DropDown from '../../ui/DropDown'
import Skeleton from '../../ui/Skeleton'
import ToggleButton from '../../ui/ToggleButton'

const createInitialForm = (data) => ({
  install_chrome: false,
  install_firefox: false,
  os_id: null,
  random_password: true,
  random_remote_port: true,
  password: data?.password || '',
  remote_port: data?.remote_port || '',
  range_ip: 'Ngẫu nhiên',
  isp: 'Ngẫu nhiên',
  not_remove_data: false,
})

export default function ChangeIpDialog({ isOpen, onClose, currentData, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  const [form, setForm] = useState(() => createInitialForm(currentData))

  const updateForm = useCallback((updates) => setForm((prev) => ({ ...prev, ...updates })), [])

  const [supportData, setSupportData] = useState({})
  const [loadingSupport, setLoadingSupport] = useState(false)
  const [loadingNoIsp, setLoadingNoIsp] = useState(false)
  const [loadSupportError, setLoadSupportError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passwordInvalid = useMemo(() => {
    if (form.random_password || !form.password) return false
    return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(form.password)
  }, [form.random_password, form.password])

  // Fetch support data (OS, range IP) optionally filtered by ISP
  const fetchSupport = useCallback(
    async (ispParam = null) => {
      try {
        setLoadingSupport(true)
        let url = `/vps/change-ip-params?ip=${currentData.ip}`
        if (ispParam) {
          setLoadingNoIsp(true)
          url += `&isp=${encodeURIComponent(ispParam)}`
        } else setLoadingNoIsp(false)
        const res = await axiosInstance.get(url)
        if (!res.data?.success) {
          setLoadSupportError(true)
          return
        }
        const data = res.data.info
        setSupportData(data)
        // Update dependent form fields (OS and range IP)
        if (ispParam)
          updateForm({
            os_id: data.current_os || data.support_os?.[0]?.id,
            remote_port: data.current_remote_port || '',
            range_ip: data.range_ip?.[0] || 'Ngẫu nhiên',
          })
        else
          updateForm({
            os_id: data.current_os || data.support_os?.[0]?.id,
            remote_port: data.current_remote_port || '',
            range_ip: data.range_ip?.[0] || 'Ngẫu nhiên',
            isp: data.isp?.[0] || 'Ngẫu nhiên',
          })
      } catch {
        setLoadSupportError(true)
      } finally {
        setLoadingSupport(false)
      }
    },
    [currentData.ip, updateForm]
  )

  useEffect(() => {
    if (!isOpen) return
    setLoadSupportError(false)
    fetchSupport()
  }, [isOpen, fetchSupport])

  const handleIspChange = (val) => {
    if (val === 'Ngẫu nhiên') fetchSupport()
    else fetchSupport(val)
    updateForm({ isp: val })
  }

  const handleSubmit = async () => {
    if (!form.os_id) {
      addToast(t('reinstall.selectOS'), 'warning')
      return
    }

    if (passwordInvalid) {
      addToast(t('buy.invalidPassword'), 'warning')
      return
    }

    setSubmitting(true)
    const loadingToast = addToast(t('manager.changeIp') + '...', 'loading')
    const payload = {
      ...form,
      ip: currentData.ip, // Use the prop ip
      install_chrome: form.install_chrome,
      install_firefox: form.install_firefox,
      random_password: form.random_password,
      random_remote_port: form.random_remote_port,
      password: form.random_password ? undefined : form.password,
      remote_port: form.random_remote_port ? undefined : form.remote_port,
      isProxy: false,
    }

    axiosInstance
      .post('/server/change-ip', payload)
      .then((res) => {
        if (res.data?.success) {
          addToast(t('manager.changeIp') + ' ' + t('manager.success'), 'success')
          onSuccess({
            ...res.data.info,
            os: supportData?.support_os?.find((os) => os.id === form.os_id)?.display_name,
          })
          onClose()
        } else {
          addToast(t('manager.changeIp') + ' ' + t('manager.failed'), 'error')
        }
      })
      .catch((err) => {
        console.error(err)
        addToast(t('manager.changeIp') + ' ' + t('manager.failed'), 'error')
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
      title={t('manager.changeIp')}
      className="text-text-primary"
    >
      <div className="max-sm:overflow-y-auto">
        <div className="border-orange/30 bg-orange/10 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <svg
              className="text-orange mt-0.5 size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-orange text-md font-semibold">{t('changeIp.note')}</p>
          </div>
          <p className="text-text-muted mt-1 text-sm leading-relaxed">
            {t('changeIp.noteContent')}{' '}
            <span className="text-highlight">{3 - (supportData?.change_remind || 3)}</span>{' '}
            {t('changeIp.changeTimes')}
          </p>
        </div>
        <span className="mt-4 block text-base font-medium">{t('current')}</span>
        <div className="mt-2 flex flex-wrap gap-4">
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
          <span className="text-base font-medium">{t('buyVps.software')}</span>
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

        <span className="mt-4 mb-2 block text-base font-medium">{t('buyVps.os')}</span>
        <Skeleton
          isLoading={loadingSupport}
          isError={loadSupportError}
          element={
            <DropDown
              value={supportData?.support_os?.find((os) => os.id === form.os_id)?.display_name}
              options={supportData?.support_os?.map((os) => os.display_name) || []}
              onChange={(name) => {
                const os = supportData.support_os.find((o) => o.display_name === name)
                updateForm({ os_id: os.id })
              }}
              className="rounded-lg text-base sm:text-lg"
              menuClassName="sm:text-lg text-base"
            />
          }
          className="bg-text-muted h-11 w-full"
        />

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="grow">
            <span className="mt-2 text-base font-medium">{t('buy.rangeIp')}</span>
            <Skeleton
              isLoading={loadingSupport}
              isError={loadSupportError}
              element={
                <DropDown
                  value={form.range_ip}
                  options={supportData?.range_ip || []}
                  onChange={(val) => updateForm({ range_ip: val })}
                  className="rounded-lg text-base sm:text-lg"
                  menuClassName="sm:text-lg text-base"
                />
              }
              className="bg-text-muted h-11 w-full"
            />
          </div>

          <div className="grow">
            <span className="mt-2 text-base font-medium">{t('buy.provider')}</span>
            <Skeleton
              isLoading={loadingSupport && !loadingNoIsp}
              isError={loadSupportError}
              element={
                <DropDown
                  value={form.isp}
                  options={supportData?.isp || []}
                  onChange={handleIspChange}
                  className="rounded-lg text-base sm:text-lg"
                  menuClassName="sm:text-lg text-base"
                />
              }
              className="bg-text-muted h-11 w-full"
            />
          </div>
        </div>

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
              <div className="flex flex-col gap-1">
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

        <div className="flex flex-wrap items-center justify-between gap-y-4">
          <label
            className={`flex cursor-pointer items-center gap-2 hover:brightness-120 ${form.not_remove_data ? 'text-highlight' : 'text-text-muted'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              className="size-6 fill-current"
            >
              <path d="M480-120q-151 0-255.5-46.5T120-280v-400q0-66 105.5-113T480-840q149 0 254.5 47T840-680v400q0 67-104.5 113.5T480-120Zm0-479q89 0 179-25.5T760-679q-11-29-100.5-55T480-760q-91 0-178.5 25.5T200-679q14 30 101.5 55T480-599Zm0 199q42 0 81-4t74.5-11.5q35.5-7.5 67-18.5t57.5-25v-120q-26 14-57.5 25t-67 18.5Q600-528 561-524t-81 4q-42 0-82-4t-75.5-11.5Q287-543 256-554t-56-25v120q25 14 56 25t66.5 18.5Q358-408 398-404t82 4Zm0 200q46 0 93.5-7t87.5-18.5q40-11.5 67-26t32-29.5v-98q-26 14-57.5 25t-67 18.5Q600-328 561-324t-81 4q-42 0-82-4t-75.5-11.5Q287-343 256-354t-56-25v99q5 15 31.5 29t66.5 25.5q40 11.5 88 18.5t94 7Z" />
            </svg>

            <span className="font-medium select-none">{t('changeIp.notRemoveData')}</span>

            <ToggleButton
              isOn={form.not_remove_data}
              onClick={() => updateForm({ not_remove_data: !form.not_remove_data })}
            />
          </label>
          <div className="ml-auto flex items-center justify-center gap-2 text-base">
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
              disabled={submitting || loadingSupport}
            >
              {submitting ? t('processing') : t('manager.changeIp')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
