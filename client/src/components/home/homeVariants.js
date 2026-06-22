/**
 * Shared Motion variants for the Home page.
 *
 * All entrance animations use expo-out easing (0.16, 1, 0.3, 1) —
 * the same curve defined in Home.css for hover/looping animations.
 *
 * Usage:
 *   import { fadeUp, slideLeft, slideRight, stagger, barFill } from './homeVariants'
 */

const expo = [0.16, 1, 0.3, 1]

/** Fade in from below */
export const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: expo } },
}

/** Slide in from the left */
export const slideLeft = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: expo } },
}

/** Slide in from the right */
export const slideRight = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: expo } },
}

/**
 * Stagger container — propagates "hidden"/"visible" to children with a delay between each.
 * @param {number} staggerChildren  seconds between each child (default 0.08)
 * @param {number} delayChildren    initial delay before the first child (default 0.05)
 */
export const stagger = (staggerChildren = 0.08, delayChildren = 0.05) => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren } },
})

/**
 * Progress bar fill — scaleX from 0 → 1.
 * The bar element must have `style={{ transformOrigin: 'left center' }}`.
 * The bar's actual fill percentage is set via `style={{ width: '...' }}` on the element.
 */
export const barFill = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.05, ease: expo } },
}

/** Card entrance + hover variants */
export const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: expo } },
  hover: {
    y: -5,
    boxShadow: '0 16px 40px color-mix(in srgb, var(--color-border) 30%, transparent)',
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
  },
}

/** Foreground icon scale on parent hover */
export const iconHover = {
  hover: {
    scale: 1.12,
    transition: { duration: 0.22, ease: [0.25, 1, 0.5, 1] },
  },
}

/** Background large icon scale + opacity fade-in on parent hover */
export const largeIconHover = {
  hover: {
    scale: 1.08,
    opacity: 0.18,
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
  },
}
