import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './context/ToastContext.jsx'
import { SafeCopyProvider } from './context/SafeCopyContext.jsx'
import ProxyManager from './pages/ProxyManager.jsx'
import ProxyChecker from './pages/ProxyChecker.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import useAuthStore from './store/useAuthStore'
import useThemeStore from './store/useThemeStore'

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Add transition class slightly after mount/change to avoid initial flash
    const timeout = setTimeout(() => {
      document.documentElement.classList.add('theme-transitions')
    }, 100)
    return () => clearTimeout(timeout)
  }, [theme])

  return (
    <div className="bg-body text-text-primary min-h-screen font-sans text-base sm:text-lg">
      <ToastProvider>
        <SafeCopyProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/proxyManager" replace />} />
              <Route path="/proxyManager" element={<ProxyManager />} />
              <Route path="/proxyChecker" element={<ProxyChecker />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </SafeCopyProvider>
      </ToastProvider>
    </div>
  )
}

export default App
