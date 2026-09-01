import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { animate } from 'motion/react'
import type { LegalSection, UseLegalScrollReturn } from '../types/legal'

/**
 * Get element's scroll target position relative to the scroll container.
 * Uses bounding rects to reliably calculate the exact offset within the container,
 * regardless of intermediate offsetParents.
 */
export function getOffsetTop(elem: HTMLElement, container: HTMLElement): number {
  return (
    elem.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  )
}

/**
 * Custom hook for smooth scrolling to sections and section tracking with highlight animations.
 */
export function useLegalScroll(sections: LegalSection[]): UseLegalScrollReturn {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')
  const [isMobileTocOpen, setIsMobileTocOpen] = useState<boolean>(false)

  // Track active section as container scrolls
  useEffect(() => {
    const container = document.getElementById('main-scroll-container')
    if (!container || sections.length === 0) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id)
        if (section && getOffsetTop(section, container) <= scrollTop + 160) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (e: MouseEvent, id: string): void => {
    e.preventDefault()
    const elem = document.getElementById(id)
    const container = document.getElementById('main-scroll-container')
    if (elem && container) {
      // Offset by 24px for visual breathing room from the top edge
      const targetTop = Math.max(0, getOffsetTop(elem, container) - 14)
      animate(container.scrollTop, targetTop, {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest: number) => {
          container.scrollTop = latest
        },
      })
      setActiveSection(id)
      setIsMobileTocOpen(false)

      // Highlight the section immediately as scroll starts
      const section = document.getElementById(id)
      if (!section) return
      const h2 = section.querySelector('h2')
      if (h2) {
        animate(
          h2,
          {
            color: ['var(--highlight-text)', 'var(--highlight-text)', 'var(--text-primary)'],
            textShadow: [
              '0 0 24px color-mix(in srgb, var(--primary) 60%, transparent)',
              '0 0 16px color-mix(in srgb, var(--primary) 30%, transparent)',
              '0 0 0px transparent',
            ],
          },
          { duration: 2.4, ease: 'easeOut', times: [0, 0.25, 1] }
        )
      }
      animate(
        section,
        {
          boxShadow: [
            '0 0 25px -5px color-mix(in srgb, var(--highlight-text) 35%, transparent), inset 0 0 15px -3px color-mix(in srgb, var(--highlight-text) 20%, transparent)',
            '0 0 15px -5px color-mix(in srgb, var(--highlight-text) 20%, transparent), inset 0 0 8px -3px color-mix(in srgb, var(--highlight-text) 10%, transparent)',
            '0 0 0px transparent, inset 0 0 0px transparent',
          ],
        },
        { duration: 2.4, ease: 'easeOut', times: [0, 0.3, 1] }
      )
    }
  }

  return {
    activeSection,
    isMobileTocOpen,
    setIsMobileTocOpen,
    scrollToSection,
  }
}
