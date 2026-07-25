import { createPortal } from 'react-dom'
import { useState, useRef, useEffect } from 'react'

/**
 * AnchorPopup — shared shell for all anchor-positioned popups.
 *
 * Props:
 *  isOpen         — controls open/close CSS animation state
 *  anchorRect     — { top, left, width, height } of the anchor element
 *  direction      — [x, y] coordinates defining popup placement relative to anchor (e.g. [-1, 0] for left)
 *  align          — alignment relative to anchor ('center', 'left'/'start', 'right'/'end', 'top', 'bottom'/'down')
 *  onClose        — called when backdrop is clicked
 *  bgClassName    — background class (e.g. bg-white)
 *  cardClassName  — extra class on the card (e.g. background color)
 *  children       — content rendered inside the card slot
 */
export default function AnchorPopup({
  isOpen,
  anchorRect,
  direction = [-1, 0],
  align = 'center',
  onClose,
  bgClassName,
  cardClassName,
  children,
  zIndex = 10,
}) {
  const [x, y] = direction
  let top_start = 0
  let left_start = 0
  let top_end = 0
  let left_end = 0
  let placementClass = ''
  let caretClass = ''

  const popupRef = useRef(null)
  const [popupSize, setPopupSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (isOpen && popupRef.current) {
      setPopupSize({
        width: popupRef.current.offsetWidth,
        height: popupRef.current.offsetHeight,
      })
    } else if (!isOpen) {
      setPopupSize({ width: 0, height: 0 })
    }
  }, [isOpen])

  let yOffset = 0
  let xOffset = 0
  const padding = 8 // minimum distance to window edge

  if (x === -1 && y === 0) {
    // Left (popup is to the left of anchor, caret points right)
    top_start = anchorRect.top + anchorRect.height / 2
    left_start = anchorRect.left - 12
    top_end = top_start - popupSize.height / 2
    left_end = left_start - popupSize.width
    placementClass = '-translate-x-full -translate-y-1/2'
    caretClass = '-right-2 top-1/2 -translate-y-1/2 border-t border-r'
  } else if (x === 1 && y === 0) {
    // Right (popup is to the right of anchor, caret points left)
    top_start = anchorRect.top + anchorRect.height / 2
    left_start = anchorRect.left + anchorRect.width + 12
    top_end = top_start - popupSize.height / 2
    left_end = left_start
    placementClass = '-translate-y-1/2'
    caretClass = '-left-2 top-1/2 -translate-y-1/2 border-b border-l'
  } else if (x === 0 && y === -1) {
    // Top (popup is above anchor, caret points bottom)
    top_start = anchorRect.top - 12
    left_start = anchorRect.left + anchorRect.width / 2
    top_end = top_start - popupSize.height
    left_end = left_start - popupSize.width / 2
    placementClass = '-translate-x-1/2 -translate-y-full'
    caretClass = '-bottom-2 left-1/2 -translate-x-1/2 border-b border-r'
  } else if (x === 0 && y === 1) {
    // Bottom (popup is below anchor, caret points top)
    top_start = anchorRect.top + anchorRect.height + 12
    left_start = anchorRect.left + anchorRect.width / 2
    top_end = top_start
    left_end = left_start - popupSize.width / 2
    placementClass = '-translate-x-1/2'
    caretClass = '-top-2 left-1/2 -translate-x-1/2 border-t border-l'
  }

  if (popupSize.width > 0 && popupSize.height > 0) {
    let initial_xOffset = 0
    let initial_yOffset = 0

    if (y === -1 || y === 1) {
      if (align === 'left' || align === 'start') {
        initial_xOffset = -anchorRect.width / 2 + popupSize.width / 2
      } else if (align === 'right' || align === 'end') {
        initial_xOffset = anchorRect.width / 2 - popupSize.width / 2
      }
    } else if (x === -1 || x === 1) {
      if (align === 'top' || align === 'start') {
        initial_yOffset = -anchorRect.height / 2 + popupSize.height / 2
      } else if (align === 'bottom' || align === 'down' || align === 'end') {
        initial_yOffset = anchorRect.height / 2 - popupSize.height / 2
      }
    }

    xOffset = initial_xOffset
    yOffset = initial_yOffset

    const current_top_end = top_end + yOffset
    const current_left_end = left_end + xOffset
    const bottom_end = current_top_end + popupSize.height
    const right_end = current_left_end + popupSize.width

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    if (bottom_end > windowHeight - padding) {
      yOffset -= bottom_end - (windowHeight - padding)
    }

    if (right_end > windowWidth - padding) {
      xOffset -= right_end - (windowWidth - padding)
    }

    if (current_top_end < padding + 75) {
      yOffset -= current_top_end - (padding + 75)
    }

    if (current_left_end < padding) {
      xOffset -= current_left_end - padding
    }
  }

  top_start += yOffset
  left_start += xOffset

  const caretStyle = {}
  if (yOffset !== 0 && (x === -1 || x === 1)) {
    caretStyle.top = `clamp(16px, calc(50% - ${yOffset}px), calc(100% - 16px))`
  }
  if (xOffset !== 0 && (y === -1 || y === 1)) {
    caretStyle.left = `clamp(16px, calc(50% - ${xOffset}px), calc(100% - 16px))`
  }

  let transformOrigin = ''
  if (x === -1 && y === 0) {
    transformOrigin = `100% ${caretStyle.top || '50%'}`
  } else if (x === 1 && y === 0) {
    transformOrigin = `0% ${caretStyle.top || '50%'}`
  } else if (x === 0 && y === -1) {
    transformOrigin = `${caretStyle.left || '50%'} 100%`
  } else if (x === 0 && y === 1) {
    transformOrigin = `${caretStyle.left || '50%'} 0%`
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
        ref={popupRef}
        style={{
          top: `${top_start}px`,
          left: `${left_start}px`,
          zIndex: zIndex,
          transformOrigin: transformOrigin,
        }}
        className={`pop-spring border-border text-text-primary fixed flex flex-col rounded-xl border shadow-[0_15px_40_rgba(0,0,0,0.6)] transition-all duration-400 ${placementClass} ${cardClassName} ${bgClassName} ${
          isOpen ? 'scale-100 opacity-100' : 'scale-[0.3] opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caret arrow pointing toward the anchor element */}
        <div
          className={`border-border absolute size-4 rotate-45 rounded-sm ${caretClass} ${bgClassName}`}
          style={caretStyle}
        />

        {children}
      </div>
    </>,
    document.body
  )
}
