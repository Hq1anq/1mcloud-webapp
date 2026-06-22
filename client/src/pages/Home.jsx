import './Home.css'
import HeroSection from '../components/home/HeroSection'
import VpsSection from '../components/home/VpsSection'
import ProxySection from '../components/home/ProxySection'
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
    </main>
  )
}
