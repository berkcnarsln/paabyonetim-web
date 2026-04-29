import { useState, useEffect, useRef, useCallback } from 'react'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ResidentDashboard from './pages/ResidentDashboard'
import LandingPage from './pages/LandingPage'
import { getSubdomain } from './api/client'

const INACTIVITY_MS = 5 * 60 * 1000 // 5 dakika

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const timerRef = useRef(null)

  const subdomain  = getSubdomain()
  const isTenant   = Boolean(subdomain)
  const tenantName = subdomain
    ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
    : null

  useEffect(() => {
    const saved = localStorage.getItem('paab_user')
    if (saved) {
      const lastActive = localStorage.getItem('paab_last_active')
      const expired = !lastActive || (Date.now() - parseInt(lastActive)) > INACTIVITY_MS
      if (expired) {
        localStorage.removeItem('paab_token')
        localStorage.removeItem('paab_user')
        localStorage.removeItem('paab_last_active')
      } else {
        setUser(JSON.parse(saved))
      }
    }
    const theme = localStorage.getItem('paab_theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    setReady(true)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('paab_token', token)
    localStorage.setItem('paab_user', JSON.stringify(userData))
    localStorage.setItem('paab_last_active', Date.now().toString())
    setUser(userData)
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('paab_token')
    localStorage.removeItem('paab_user')
    localStorage.removeItem('paab_last_active')
    setUser(null)
  }, [])

  // İnaktivite takibi — sadece giriş yapılmış ve tenant sayfasındayken çalışır
  useEffect(() => {
    if (!user || !isTenant) return

    const reset = () => {
      localStorage.setItem('paab_last_active', Date.now().toString())
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(handleLogout, INACTIVITY_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [user, isTenant, handleLogout])

  if (!ready) return null
  if (!isTenant) return <LandingPage />
  if (!user) return <Login onLogin={handleLogin} tenantName={tenantName} />
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} tenantName={tenantName} />
  return <ResidentDashboard user={user} onLogout={handleLogout} tenantName={tenantName} />
}
