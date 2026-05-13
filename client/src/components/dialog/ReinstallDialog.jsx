import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../i18n'
import axiosInstance from '../../lib/axios'
import Checkbox from '../ui/Checkbox'
import Dialog from '../ui/Dialog'
import DropDown from '../ui/DropDown'
import Skeleton from '../ui/Skeleton'

export default function ReinstallDialog({ isOpen, onClose, sid, onSuccess }) {
  const { addToast, removeToast } = useToast()
  const t = useTranslation()

  const [randomPassword, setRandomPassword] = useState(true)
  const [randomPort, setRandomPort] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [portInput, setPortInput] = useState('')

  const [installChrome, setInstallChrome] = useState(false)
  const [installFirefox, setInstallFirefox] = useState(false)

  const [osOptions, setOsOptions] = useState({})
  const [selectedOs, setSelectedOs] = useState(null)

  const [loadingOs, setLoadingOs] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passwordInvalid = useMemo(() => {
    if (randomPassword || !passwordInput) return false
    return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(passwordInput)
  }, [randomPassword, passwordInput])

  useEffect(() => {
    if (!isOpen) return

    const fetchOs = async () => {
      try {
        setLoadingOs(true)
        const res = await axiosInstance.get('/vps/support/os')
        const osMap = res?.data?.info.os || {}
        setOsOptions(osMap)
        const firstKey = Object.keys(osMap)[0]
        if (firstKey) {
          setSelectedOs(firstKey)
        }
      } catch {
        addToast(t('reinstall.errorLoadOS'), 'error')
      } finally {
        setLoadingOs(false)
      }
    }

    fetchOs()
  }, [isOpen])

  const renderSelect = (value, onChange, optionsMap) => {
    let options = []
    let displayValue = value
    let onSelect = onChange

    options = Object.values(optionsMap || {})
    options.sort((a, b) => String(a).localeCompare(String(b)))
    displayValue = optionsMap?.[value] || value
    onSelect = (newLabel) => {
      const key = Object.keys(optionsMap || {}).find((k) => optionsMap[k] === newLabel)
      if (key) onChange({ target: { value: key } })
    }

    return (
      <DropDown
        value={displayValue}
        options={options}
        onChange={onSelect}
        className="rounded-lg text-base sm:text-lg"
        menuClassName="sm:text-lg text-base"
      />
    )
  }

  const handleCancel = () => {
    setRandomPassword(true)
    setRandomPort(true)
    setPasswordInput('')
    setPortInput('')
    setInstallChrome(false)
    setInstallFirefox(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!selectedOs) {
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
      install_chrome: installChrome ? 'on' : '',
      install_firefox: installFirefox ? 'on' : '',
      os: Number(selectedOs),
      random_password: randomPassword ? 'on' : '',
      random_remote_port: randomPort ? 'on' : '',
      password: randomPassword ? '' : passwordInput,
      remote_port: randomPort ? '' : portInput,
      sid: String(sid),
      isProxy: false,
    }
    console.log(payload)

    axiosInstance
      .post('/server/reinstall', payload)
      .then((res) => {
        if (res.data?.success) {
          addToast(t('manager.reinstall') + ' ' + t('manager.success'), 'success')
          onSuccess({ ...res.data.info, os: osOptions[selectedOs] })
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
    <Dialog isOpen={isOpen} onClose={handleCancel} title="Reinstall" className="text-text-primary">
      <div className="bg-thead flex flex-wrap items-center gap-x-6 rounded p-2">
        <span className="text-base font-medium">{t('buyVps.software')}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={installChrome}
              onChange={(e) => setInstallChrome(e.target.checked)}
            />
            <span className="font-medium">Chrome</span>
          </label>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={installFirefox}
              onChange={(e) => setInstallFirefox(e.target.checked)}
            />
            <span className="font-medium">Firefox</span>
          </label>
        </div>
      </div>

      <span className="mt-2 text-base font-medium">{t('buyVps.os')}</span>
      <Skeleton
        isLoading={loadingOs}
        element={renderSelect(selectedOs, (e) => setSelectedOs(e.target.value), osOptions || {})}
        className="bg-text-muted h-11 w-full"
      />

      <div className="mt-2 flex flex-wrap gap-4">
        <label className="flex grow flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={randomPassword}
              onChange={(e) => setRandomPassword(e.target.checked)}
            />
            <span className="font-medium whitespace-nowrap">{t('buyVps.randomPassword')}</span>
          </div>
          {!randomPassword && (
            <div className="flex flex-col gap-1 text-lg">
              <input
                type="text"
                className={`${
                  passwordInvalid ? 'border-orange focus:border-orange focus:ring-orange/20' : ''
                }`}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {passwordInvalid && (
                <span className="text-orange text-xs">{t('buy.invalidPassword')}</span>
              )}
            </div>
          )}
        </label>

        <label className="flex grow flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={randomPort} onChange={(e) => setRandomPort(e.target.checked)} />
            <span className="font-medium">{t('buyVps.randomPort')}</span>
          </div>
          {!randomPort && (
            <div className="flex flex-col gap-1 text-lg">
              <input
                type="number"
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
              />
            </div>
          )}
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2 text-base">
        <button
          onClick={handleCancel}
          className="text-text-muted hover:bg-surface hover:text-text-primary rounded-lg px-4 py-2 transition-colors"
          disabled={submitting}
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSubmit}
          className="text-text-secondary group enabled:bg-blue flex items-center gap-2 rounded-lg px-6 py-2 font-semibold hover:brightness-90 disabled:bg-gray-500"
          disabled={submitting || loadingOs}
        >
          {submitting ? 'Processing...' : 'Reinstall'}
        </button>
      </div>
    </Dialog>
  )
}
