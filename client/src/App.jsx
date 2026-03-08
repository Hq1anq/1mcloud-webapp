import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './context/ToastContext.jsx'
import { SafeCopyProvider } from './context/SafeCopyContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import ScrollToTop from './components/layout/ScrollToTop.jsx'
import useAuthStore from './store/useAuthStore'
import useThemeStore from './store/useThemeStore'
import Home from './pages/Home.jsx'
import ManagerPage from './pages/ManagerPage.jsx'
import ProxyChecker from './pages/ProxyChecker.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Contact from './pages/Contact.jsx'
import AccountPage from './pages/AccountPage.jsx'

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore()
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
    <div className="bg-body text-text-secondary flex h-full flex-col overflow-hidden font-sans text-base sm:text-lg">
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <div id="main-scroll-container" className="scroll-container w-full flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/account"
              element={isAuthenticated ? <AccountPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/manager"
              element={
                isAuthenticated ? (
                  <ToastProvider>
                    <SafeCopyProvider>
                      <ConfirmProvider>
                        <ManagerPage />
                      </ConfirmProvider>
                    </SafeCopyProvider>
                  </ToastProvider>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/proxyManager" element={<Navigate to="/manager" replace />} />
            <Route path="/vpsManager" element={<Navigate to="/manager" replace />} />

            <Route
              path="/proxyChecker"
              element={
                <ToastProvider>
                  <SafeCopyProvider>
                    <ProxyChecker />
                  </SafeCopyProvider>
                </ToastProvider>
              }
            />

            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
            />

            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
            />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
