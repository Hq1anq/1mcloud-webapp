import { useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../i18n'
import axiosInstance from '../../../lib/axios'
import { maskProductKey } from '../../../utils/ui'
import Dialog from '../../ui/Dialog'

export default function DeleteLicenseDialog({ isOpen, onClose, currentLicense, onSuccess }) {
  const { addToast } = useToast()
  const t = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [unmasked, setUnmasked] = useState(false)

  const handleClose = () => {
    setUnmasked(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!currentLicense?.id) return

    setSubmitting(true)
    try {
      const res = await axiosInstance.delete(`/user/licenses/${currentLicense.id}`)
      if (res.data?.success) {
        addToast(t('licenses.deleteSuccess'), 'success')
        onSuccess(currentLicense.id)
        handleClose()
      } else {
        addToast(res.data?.error || t('licenses.deleteFailed'), 'error')
      }
    } catch (err) {
      console.error('Error deleting license:', err)
      addToast(err.response?.data?.error || t('licenses.deleteFailed'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const displayKey = currentLicense?.license_key
    ? unmasked
      ? currentLicense.license_key
      : maskProductKey(currentLicense.license_key)
    : ''

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={t('licenses.deleteConfirmTitle')}>
      <div className="text-text-primary space-y-3">
        <p className="text-sm sm:text-base">
          {t('licenses.deleteConfirmText')}
        </p>

        <div className="border-border bg-navbar text-primary flex items-center justify-between rounded-lg border p-3 font-mono text-base font-bold">
          <span>{displayKey}</span>
          <button
            type="button"
            onClick={() => setUnmasked((prev) => !prev)}
            className="text-text-muted hover:text-primary cursor-pointer p-1 transition"
            title="Hiện/Ẩn Key"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </button>
        </div>

        <p className="text-orange text-sm font-medium">{t('licenses.cannotUndo')}</p>


        <div className="border-border text-text-secondary flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg bg-gray-500 px-4 py-2 font-medium disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="bg-red rounded-lg px-4 py-2 font-medium disabled:opacity-50"
          >
            {submitting ? t('processing') : t('delete')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
