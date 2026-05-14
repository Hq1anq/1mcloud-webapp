import Dialog from '../ui/Dialog'
import useAuthStore from '../../store/useAuthStore'
import { useTranslation } from '../../i18n'

export default function AddFundsDialog({ isOpen, onClose }) {
  const t = useTranslation()
  const { user } = useAuthStore()

  const bankName = user?.bank_name || ''
  const bankAccName = user?.bank_acc_name || ''
  const bankAccNo = user?.bank_acc_no || ''
  const bankingMessage = user?.banking_message || ''
  const vietqrBankId = user?.vietqr_bank_id || ''

  const qrUrl = `https://img.vietqr.io/image/${vietqrBankId}-${bankAccNo}-KvJmf8.jpg?addInfo=${bankingMessage}`

  const infoRows = [
    { label: t('addfunds.bankName'), value: bankName },
    { label: t('addfunds.accountHolder'), value: bankAccName },
    { label: t('addfunds.accountNumber'), value: bankAccNo },
    { label: t('addfunds.transferContent'), value: bankingMessage },
  ]

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="p-0!">
      <div className="text-text-primary flex max-h-[80vh] flex-col overflow-y-auto md:flex-row">
        {/* Left — QR Code */}
        <div className="flex flex-col items-center justify-center gap-3 p-6 md:p-8">
          <h1 className="text-primary font-bold">{t('addfunds.title')}</h1>
          <img src={qrUrl} alt="VietQR" className="h-auto w-64 rounded-xl shadow-lg" />
        </div>

        {/* Right — Transfer Info */}
        <div className="bg-surface border-border flex w-full flex-col gap-5 rounded-b-xl p-6 md:w-96 md:rounded-r-xl md:rounded-bl-none md:border-l md:p-8">
          <h2 className="text-primary text-lg font-bold">{t('addfunds.transferInfo')}</h2>

          <div className="flex flex-col gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <span className="text-text-muted text-sm font-medium tracking-wider uppercase">
                  {row.label}
                </span>
                <span className="font-semibold break-all">{row.value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="border-orange/30 bg-orange/10 mt-auto rounded-lg border p-3">
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
              <p className="text-orange text-md font-semibold">{t('addfunds.note')}</p>
            </div>
            <p className="text-text-muted mt-1 text-sm leading-relaxed">
              {t('addfunds.noteContent')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary h-10 w-full rounded-lg bg-transparent font-medium transition-colors"
          >
            {t('dialog.close')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
