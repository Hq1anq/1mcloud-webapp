import './Home.css'
import HeroSection from '../components/home/HeroSection'
import VpsSection from '../components/home/VpsSection'
import ProxySection from '../components/home/ProxySection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <VpsSection />
      <ProxySection />
    </main>
  )
}
