import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProxyManager from './pages/ProxyManager.jsx'
import ProxyChecker from './pages/ProxyChecker.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

function App() {
  return (
    <div className="bg-body text-text-primary min-h-screen font-sans text-base sm:text-lg">
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/proxyManager" replace />} />
            <Route path="/proxyManager" element={<ProxyManager />} />
            <Route path="/proxyChecker" element={<ProxyChecker />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </div>
  )
}

export default App
