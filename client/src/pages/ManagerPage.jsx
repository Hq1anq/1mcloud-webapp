import { useState, useCallback, useRef } from 'react'
import BuyProxyDialog from '../components/dialog/proxy/BuyProxyDialog'
import BuyVpsDialog from '../components/dialog/vps/BuyVpsDialog'
import ProxyManager from './ProxyManager'
import VpsManager from './VpsManager'
import { useTranslation } from '../i18n'

export default function ManagerPage() {
  const t = useTranslation()
  const [activeView, setActiveView] = useState('VPS')
  const [buyProxyDialogOpen, setBuyProxyDialogOpen] = useState(false)
  const [buyVpsDialogOpen, setBuyVpsDialogOpen] = useState(false)

  // Ref to call ProxyManager's buy success handler
  const proxyBuySuccessRef = useRef(null)
  const vpsBuySuccessRef = useRef(null)

  const handleBuySuccess = useCallback((newData, type, extraConfig) => {
    if (type === 'PROXY' && proxyBuySuccessRef.current) {
      proxyBuySuccessRef.current(newData, extraConfig)
    } else if (type === 'VPS' && vpsBuySuccessRef.current) {
      vpsBuySuccessRef.current(newData, extraConfig)
    }
  }, [])

  return (
    <div>
      {/* ========== MANAGER TOP BAR ========== */}
      <div className="bg-surface select-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          {/* Left: Glass Inset Toggle */}
          <div className="bg-surface relative flex items-center rounded-xl p-1 shadow-(--glass-inset-shadow)">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-lg backdrop-blur-xl backdrop-saturate-150"
              style={{
                background: 'var(--indicator-background)',
                boxShadow: 'var(--indicator-box-shadow)',
                left: '4px',
                width: 'calc(50% - 4px)',
                transform: activeView === 'VPS' ? 'translateX(0)' : 'translateX(100%)',
                transition:
                  'transform 0.38s cubic-bezier(.34,1.4,.64,1), width 0.38s cubic-bezier(.34,1.4,.64,1)',
              }}
            />

            <button
              onClick={() => setActiveView('VPS')}
              className={`relative z-10 flex w-22 items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition-colors duration-300 sm:w-28 ${
                activeView === 'VPS' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-4 shrink-0 fill-current sm:size-5"
              >
                <path d="M112 256C112 167.6 183.6 96 272 96C319.1 96 361.4 116.4 390.7 148.7C401.3 145.6 412.5 144 424 144C490.3 144 544 197.7 544 264C544 277.2 541.9 289.9 537.9 301.8C579.5 322.9 608 366.1 608 416C608 486.7 550.7 544 480 544L176 544C96.5 544 32 479.5 32 400C32 343.2 64.9 294.1 112.7 270.6C112.3 265.8 112 260.9 112 256zM272 144C210.1 144 160 194.1 160 256C160 264.4 160.9 272.6 162.7 280.5C165.4 292.6 158.4 304.8 146.6 308.6C107.9 321 80 357.3 80 400C80 453 123 496 176 496L480 496C524.2 496 560 460.2 560 416C560 378.6 534.3 347.1 499.5 338.4C492 336.5 485.9 331.2 483 324.1C480.1 317 480.9 308.9 485 302.4C492 291.3 496 278.2 496 264.1C496 224.3 463.8 192.1 424 192.1C412.9 192.1 402.5 194.6 393.2 199C382.7 204 370.1 200.7 363.4 191.2C343.1 162.6 309.7 144.1 272.1 144.1z" />
              </svg>
              VPS
            </button>

            <button
              onClick={() => setActiveView('PROXY')}
              className={`relative z-10 flex w-22 items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition-colors duration-300 sm:w-28 ${
                activeView === 'PROXY' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                className="size-4 shrink-0 fill-current sm:size-5"
              >
                <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
              </svg>
              PROXY
            </button>
          </div>

          {/* Right: Buy More button */}
          <button
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-green-500 to-emerald-400 px-5 py-2 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-110 sm:px-6 sm:text-lg"
            onClick={() =>
              activeView === 'VPS' ? setBuyVpsDialogOpen(true) : setBuyProxyDialogOpen(true)
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 shrink-0 fill-current sm:size-6"
            >
              <path d="M0 72C0 58.7 10.7 48 24 48L69.3 48C96.4 48 119.6 67.4 124.4 94L124.8 96L537.5 96C557.5 96 572.6 114.2 568.9 133.9L537.8 299.8C532.1 330.1 505.7 352 474.9 352L171.3 352L176.4 380.3C178.5 391.7 188.4 400 200 400L456 400C469.3 400 480 410.7 480 424C480 437.3 469.3 448 456 448L200.1 448C165.3 448 135.5 423.1 129.3 388.9L77.2 102.6C76.5 98.8 73.2 96 69.3 96L24 96C10.7 96 0 85.3 0 72zM160 528C160 501.5 181.5 480 208 480C234.5 480 256 501.5 256 528C256 554.5 234.5 576 208 576C181.5 576 160 554.5 160 528zM384 528C384 501.5 405.5 480 432 480C458.5 480 480 501.5 480 528C480 554.5 458.5 576 432 576C405.5 576 384 554.5 384 528zM336 142.4C322.7 142.4 312 153.1 312 166.4L312 200L278.4 200C265.1 200 254.4 210.7 254.4 224C254.4 237.3 265.1 248 278.4 248L312 248L312 281.6C312 294.9 322.7 305.6 336 305.6C349.3 305.6 360 294.9 360 281.6L360 248L393.6 248C406.9 248 417.6 237.3 417.6 224C417.6 210.7 406.9 200 393.6 200L360 200L360 166.4C360 153.1 349.3 142.4 336 142.4z" />
            </svg>
            {t('manager.buyMore')}
          </button>
        </div>
      </div>

      {/* ========== ACTIVE VIEW ========== */}
      {activeView === 'PROXY' ? (
        <ProxyManager onBuySuccessRef={proxyBuySuccessRef} />
      ) : (
        <VpsManager onBuySuccessRef={vpsBuySuccessRef} />
      )}

      {/* ========== BUY DIALOGS ========== */}
      <BuyProxyDialog
        isOpen={buyProxyDialogOpen}
        onClose={() => setBuyProxyDialogOpen(false)}
        onSuccess={(newData, extraConfig) => handleBuySuccess(newData, 'PROXY', extraConfig)}
      />
      <BuyVpsDialog
        isOpen={buyVpsDialogOpen}
        onClose={() => setBuyVpsDialogOpen(false)}
        onSuccess={(newData, extraConfig) => handleBuySuccess(newData, 'VPS', extraConfig)}
      />
    </div>
  )
}
