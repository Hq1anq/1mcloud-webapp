import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import axiosInstance from '../../../lib/axios'
import Checkbox from '../../ui/Checkbox'
import Dialog from '../../ui/Dialog'
import DropDown from '../../ui/DropDown'
import Skeleton from '../../ui/Skeleton'

const createInitialForm = (data) => ({
  random_password: true,
  random_remote_port: true,
  password: data?.password || '',
  remote_port: data?.remote_port || '',

  range_ip: 'Ngẫu nhiên',
  isp: 'Ngẫu nhiên',
  type: data?.type === 'HTTPS Proxy' ? 'proxy_https' : 'proxy_sock_5',
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

  const fetchSupport = useCallback(
    async (ispParam = null) => {
      try {
        setLoadingSupport(true)
        setLoadSupportError(false)
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
        // Update dependent form fields (range IP)
        if (ispParam)
          updateForm({
            remote_port: data.current_remote_port || '',
            range_ip: data.range_ip?.[0] || 'Ngẫu nhiên',
          })
        else
          updateForm({
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
    if (isOpen) {
      const id = requestAnimationFrame(() => fetchSupport())
      return () => cancelAnimationFrame(id)
    }
  }, [isOpen, fetchSupport])

  const handleIspChange = (val) => {
    if (val === 'Ngẫu nhiên') fetchSupport()
    else fetchSupport(val)
    updateForm({ isp: val })
  }

  const handleSubmit = async () => {
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
      isProxy: true,
    }

    axiosInstance
      .post('/server/change-ip', payload)
      .then((res) => {
        if (res.data?.success) {
          addToast(t('manager.changeIp') + ' ' + t('manager.success'), 'success')
          onSuccess({
            ...res.data.info,
            type: form.type === 'proxy_https' ? 'HTTPS Proxy' : 'SOCKS5 Proxy',
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
              <p className="text-text-muted mb-1">{t('table.type')}</p>
              <p className="font-mono tracking-wide">{currentData.type}</p>
            </div>
            <div className="bg-terminal border-border grow rounded-lg border p-2 shadow-xl sm:p-4">
              <p className="text-text-muted mb-1">{t('table.note')}</p>
              <p className="font-mono tracking-wide">{currentData.note}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="grow">
            <span className="mt-2 text-base font-medium">{t('buy.type')}</span>
            <DropDown
              value={form.type === 'proxy_https' ? 'HTTPS' : 'SOCKS5'}
              options={['HTTPS', 'SOCKS5']}
              onChange={(val) =>
                updateForm({ type: val === 'HTTPS' ? 'proxy_https' : 'proxy_sock_5' })
              }
              className="rounded-lg text-base sm:text-lg"
              menuClassName="sm:text-lg text-base"
            />
          </div>

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

        <div className="flex items-center justify-end gap-2 text-base">
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary rounded-lg px-4 py-2"
            disabled={submitting}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={submitting || loadingSupport || passwordInvalid}
          >
            {submitting ? t('processing') : t('manager.changeIp')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
