import HeroSection from '../components/home/HeroSection'
import VpsSection from '../components/home/VpsSection'
import ProxySection from '../components/home/ProxySection'
import ContactFab from '../components/home/ContactFab'
import { useHashScroll } from '../hooks/useHashScroll'
import useLanguageStore from '../store/useLanguageStore'

export default function Home() {
  useHashScroll()
  const language = useLanguageStore((state) => state.language)

  return (
    <main key={language}>
      <HeroSection />
      <VpsSection />
      <ProxySection />
      <ContactFab />
    </main>
  )
}

