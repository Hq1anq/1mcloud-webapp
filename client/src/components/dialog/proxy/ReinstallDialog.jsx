import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import axiosInstance from '../../../lib/axios'
import Checkbox from '../../ui/Checkbox'
import Dialog from '../../ui/Dialog'
import DropDown from '../../ui/DropDown'

export default function ReinstallDialog({ isOpen, onClose, currentData, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  const [form, setForm] = useState({
    random_remote_port: true,
    random_username: true,
    random_password: true,
    remote_port: '',
    username: '',
    password: '',
  })

  const updateForm = (updates) => setForm((prev) => ({ ...prev, ...updates }))
  const [submitting, setSubmitting] = useState(false)

  const passwordInvalid = useMemo(() => {
    if (form.random_password || !form.password) return false
    return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(form.password)
  }, [form.random_password, form.password])

  useEffect(() => {
    if (!isOpen) return
    setForm((prev) => ({
      ...prev,
      remote_port: currentData?.remote_port || '',
      username: currentData?.username || '',
      password: currentData?.password || '',
      type: currentData?.type === 'HTTPS Proxy' ? 'proxy_https' : 'proxy_sock_5',
    }))
  }, [isOpen, currentData?.remote_port, currentData?.username, currentData?.password])

  const handleCancel = () => {
    onClose()
    setTimeout(() => {
      setForm({
        random_remote_port: true,
        random_username: true,
        random_password: true,
        remote_port: currentData?.remote_port || '',
        username: currentData?.username || '',
        password: currentData?.password || '',
        type: currentData?.type === 'HTTPS Proxy' ? 'proxy_https' : 'proxy_sock_5',
      })
    }, 300)
  }

  const handleSubmit = async () => {
    if (passwordInvalid) {
      addToast(t('buy.invalidPassword'), 'warning')
      return
    }

    setSubmitting(true)
    const loadingToast = addToast(t('manager.reinstall') + '...', 'loading')
    const payload = {
      random_remote_port: form.random_remote_port ? 'on' : '',
      random_username: form.random_username ? 'on' : '',
      random_password: form.random_password ? 'on' : '',
      remote_port: form.random_remote_port ? '' : form.remote_port,
      username: form.random_username ? '' : form.username,
      password: form.random_password ? '' : form.password,
      type: form.type,
      sid: String(currentData.sid),
      isProxy: true,
    }

    axiosInstance
      .post('/server/reinstall', payload)
      .then((res) => {
        if (res.data?.success) {
          addToast(t('manager.reinstall') + ' ' + t('manager.success'), 'success')
          onSuccess({
            ...res.data.info,
            type: form.type === 'proxy_https' ? 'HTTPS Proxy' : 'SOCKS5 Proxy',
          })
          handleCancel()
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
      onClose={handleCancel}
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
              <p className="text-text-muted mb-1">{t('table.type')}</p>
              <p className="font-mono tracking-wide">{currentData.type}</p>
            </div>
            <div className="bg-terminal border-border grow rounded-lg border p-2 shadow-xl sm:p-4">
              <p className="text-text-muted mb-1">{t('table.note')}</p>
              <p className="font-mono tracking-wide">{currentData.note}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-4 space-y-2">
          <label className="flex flex-col gap-2">
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
                className="inline"
              />
            )}
          </label>
          <label className="flex grow flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.random_username}
                onChange={(e) => updateForm({ random_username: e.target.checked })}
              />
              <span className="font-medium">{t('buy.randomUsername')}</span>
            </div>
            {!form.random_username && (
              <input
                type="text"
                value={form.username}
                onChange={(e) => updateForm({ username: e.target.value })}
              />
            )}
          </label>
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
        </div>

        <div className="flex flex-wrap items-center justify-between gap-y-4">
          <div className="flex flex-wrap gap-2">
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
          <div className="ml-auto flex items-center justify-center gap-2 text-base">
            <button
              onClick={handleCancel}
              className="text-text-muted hover:text-text-primary rounded-lg px-4 py-2"
              disabled={submitting}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="text-text-secondary group enabled:bg-blue flex items-center gap-2 rounded-lg px-6 py-2 font-semibold hover:brightness-90 disabled:bg-gray-500"
              disabled={submitting}
            >
              {submitting ? t('processing') : t('manager.reinstall')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
