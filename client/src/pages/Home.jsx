import './Home.css'
import HeroSection from '../components/home/HeroSection'
import VpsSection from '../components/home/VpsSection'
import ProxySection from '../components/home/ProxySection'
import { useHashScroll } from '../hooks/useHashScroll'

export default function Home() {
  useHashScroll()

  return (
    <main>
      <HeroSection />
      <VpsSection />
      <ProxySection />
    </main>
  )
}
