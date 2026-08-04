import { useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import { isValidLicense } from '../../../utils/ui'
import axiosInstance from '../../../lib/axios'
import Dialog from '../../ui/Dialog'
import WindowsKeyInput from '../../ui/WindowsKeyInput'

export default function EditLicenseDialog({ isOpen, onClose, currentLicense, onSuccess }) {
  const { addToast } = useToast()
  const t = useTranslation()

  const [prevLicense, setPrevLicense] = useState(currentLicense)
  const [licenseKey, setLicenseKey] = useState(currentLicense?.license_key || '')
  const [submitting, setSubmitting] = useState(false)

  if (currentLicense !== prevLicense) {
    setPrevLicense(currentLicense)
    setLicenseKey(currentLicense?.license_key || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedKey = licenseKey.trim()
    if (!trimmedKey) {
      addToast(t('licenses.enterKey'), 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await axiosInstance.put(`/user/licenses/${currentLicense.id}`, {
        license_key: trimmedKey,
      })
      if (res.data?.success) {
        addToast(t('licenses.editSuccess'), 'success')
        onSuccess(res.data.licenses || { ...currentLicense, license_key: trimmedKey })
        onClose()
      } else {
        addToast(res.data?.error || t('licenses.editFailed'), 'error')
      }
    } catch (err) {
      console.error('Error updating license:', err)
      addToast(err.response?.data?.error || t('licenses.editFailed'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('licenses.editTitle')}>
      <form onSubmit={handleSubmit} className="text-text-primary space-y-4">
        <div>
          <label className="text-text-muted mb-1 block text-sm font-medium">
            {t('licenses.keyLabel')}
          </label>
          <WindowsKeyInput
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="font-mono"
          />
          <p className="text-orange mt-2 text-base leading-relaxed">
            {t('licenses.editNote')} <br /> {t('licenses.legalNote')}
          </p>
        </div>

        <div className="border-border flex justify-end gap-3 border-t pt-3">
          <button
            type="button"
            onClick={onClose}
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
            {submitting ? t('processing') : t('confirm')}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
