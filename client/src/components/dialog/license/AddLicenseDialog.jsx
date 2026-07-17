import { useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import { isValidLicense } from '../../../utils/ui'
import axiosInstance from '../../../lib/axios'
import Dialog from '../../ui/Dialog'
import WindowsKeyInput from '../../ui/WindowsKeyInput'

export default function AddLicenseDialog({ isOpen, onClose, onSuccess }) {
  const { addToast } = useToast()
  const t = useTranslation()

  const [licenseKey, setLicenseKey] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedKey = licenseKey.trim()
    if (!trimmedKey) {
      addToast(t('licenses.enterKey'), 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await axiosInstance.post('/user/licenses', { license_key: trimmedKey })
      if (res.data?.success) {
        addToast(t('licenses.addSuccess'), 'success')
        setLicenseKey('')
        onSuccess(res.data.licenses)
        onClose()
      } else {
        addToast(res.data?.error || t('licenses.addFailed'), 'error')
      }
    } catch (err) {
      console.error('Error adding license:', err)
      addToast(err.response?.data?.error || t('licenses.addFailed'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setLicenseKey('')
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={t('licenses.addTitle')}>
      <form onSubmit={handleSubmit} className="text-text-primary space-y-4">
        <div>
          <label className="text-text-muted mb-1 block text-sm font-medium">
            {t('licenses.keyLabel')}
          </label>
          <WindowsKeyInput
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="font-mono"
            maxLength={29}
            autoFocus
          />
          <p className="text-orange mt-2 text-base leading-relaxed">
            {t('licenses.addNote')} <br /> {t('licenses.legalNote')}
          </p>
        </div>

        <div className="border-border flex justify-end gap-3 border-t pt-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg bg-gray-500 px-4 py-2 font-medium disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !isValidLicense(licenseKey)}
            className="btn-primary"
          >
            {submitting ? t('processing') : t('licenses.addLicense')}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
