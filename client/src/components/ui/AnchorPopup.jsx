import { createPortal } from 'react-dom'

/**
 * AnchorPopup — shared shell for all anchor-positioned popups.
 *
 * Props:
 *  isOpen         — controls open/close CSS animation state
 *  anchorRect     — { top, left, width, height } of the anchor element
 *  direction      — [x, y] coordinates defining popup placement relative to anchor (e.g. [-1, 0] for left)
 *  onClose        — called when backdrop is clicked
 *  bgClassName    — background class (e.g. bg-white)
 *  cardClassName  — extra class on the card (e.g. background color)
 *  children       — content rendered inside the card slot
 */
export default function AnchorPopup({
  isOpen,
  anchorRect,
  direction = [-1, 0],
  onClose,
  bgClassName,
  cardClassName,
  children,
  zIndex = 10,
}) {
  const [x, y] = direction
  let top = 0
  let left = 0
  let placementClass = ''
  let caretClass = ''

  if (x === -1 && y === 0) {
    // Left (popup is to the left of anchor, caret points right)
    top = anchorRect.top + anchorRect.height / 2
    left = anchorRect.left - 12
    placementClass = 'origin-right -translate-x-full -translate-y-1/2'
    caretClass = '-right-2 top-1/2 -translate-y-1/2 border-t border-r'
  } else if (x === 1 && y === 0) {
    // Right (popup is to the right of anchor, caret points left)
    top = anchorRect.top + anchorRect.height / 2
    left = anchorRect.left + anchorRect.width + 12
    placementClass = 'origin-left -translate-y-1/2'
    caretClass = '-left-2 top-1/2 -translate-y-1/2 border-b border-l'
  } else if (x === 0 && y === -1) {
    // Top (popup is above anchor, caret points bottom)
    top = anchorRect.top - 12
    left = anchorRect.left + anchorRect.width / 2
    placementClass = 'origin-bottom -translate-x-1/2 -translate-y-full'
    caretClass = '-bottom-2 left-1/2 -translate-x-1/2 border-b border-r'
  } else if (x === 0 && y === 1) {
    // Bottom (popup is below anchor, caret points top)
    top = anchorRect.top + anchorRect.height + 12
    left = anchorRect.left + anchorRect.width / 2
    placementClass = 'origin-top -translate-x-1/2'
    caretClass = '-top-2 left-1/2 -translate-x-1/2 border-t border-l'
  }

  return createPortal(
    <>
      {/* Invisible backdrop — blocks interaction and catches outside clicks */}
      <div
        className={`fixed inset-0 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex }}
        onClick={onClose}
      />

      {/* Spring-animated card */}
      <div
        style={{ top: `${top}px`, left: `${left}px`, zIndex: zIndex }}
        className={`pop-spring border-border fixed flex flex-col rounded-xl border shadow-[0_15px_40_rgba(0,0,0,0.6)] transition-all duration-400 ${placementClass} ${cardClassName} ${bgClassName} ${
          isOpen ? 'scale-100 opacity-100' : 'scale-[0.3] opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caret arrow pointing toward the anchor element */}
        <div
          className={`border-border absolute size-4 rotate-45 rounded-sm ${caretClass} ${bgClassName}`}
        />

        {children}
      </div>
    </>,
    document.body
  )
}
