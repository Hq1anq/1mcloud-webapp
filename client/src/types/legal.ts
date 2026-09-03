import type { ReactNode } from 'react'

export interface LegalSectionGridCard {
  title: string
  desc: string
  icon?: string
}

export interface LegalSection {
  id: string
  kicker: string
  title: string
  content: string[]
  bullets?: string[]
  grid?: LegalSectionGridCard[]
}

export interface LegalStatusMetadata {
  scopeLabel: string
  scopeValue: string
  formatLabel: string
  formatValue: string
  updatedLabel: string
  updatedValue: string
}

export interface LegalNavLinks {
  terms: string
  privacy: string
}

export interface LegalNoteNotice {
  title: string
  text: string
  sourceText?: string
}

export interface LegalPageData {
  badge: string
  title: string
  subtitle: string
  status: LegalStatusMetadata
  nav: LegalNavLinks
  tocTitle: string
  note: LegalNoteNotice
  sections: LegalSection[]
  footerInfo: string
}

export type LegalActiveRoute = 'terms' | 'privacy'

export interface LegalPageLayoutProps {
  data: LegalPageData
  activeRoute: LegalActiveRoute
  noticeIcon?: ReactNode
}

export interface UseLegalScrollReturn {
  activeSection: string
  isMobileTocOpen: boolean
  setIsMobileTocOpen: (open: boolean) => void
  scrollToSection: (e: React.MouseEvent, id: string) => void
}
