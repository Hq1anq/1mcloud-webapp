import { createPortal } from 'react-dom'

/**
 * AnchorPopup — shared shell for all anchor-positioned popups.
 *
 * Props:
 *  isOpen         — controls open/close CSS animation state
 *  coords         — { top, left } absolute page coordinates
 *  onClose        — called when backdrop is clicked
 *  bgClassName    — background class (e.g. bg-white)
 *  cardClassName  — extra class on the card (e.g. background color)
 *  children       — content rendered inside the card slot
 */
export default function AnchorPopup({
  isOpen,
  coords,
  onClose,
  bgClassName,
  cardClassName,
  children,
}) {
  return createPortal(
    <>
      {/* Invisible backdrop — blocks interaction and catches outside clicks */}
      <div className={`fixed inset-0 z-10 cursor-default`} onClick={onClose} />

      {/* Spring-animated card */}
      <div
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        className={`pop-spring border-border fixed z-15 flex origin-right -translate-x-full -translate-y-1/2 flex-col rounded-xl border shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-400 ${cardClassName} ${bgClassName} ${
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.3] opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caret arrow pointing right toward the anchor element */}
        <div
          className={`border-border absolute top-1/2 -right-2 size-4 -translate-y-1/2 rotate-45 rounded-sm border-t border-r ${bgClassName}`}
        />

        {children}
      </div>
    </>,
    document.body
  )
}
