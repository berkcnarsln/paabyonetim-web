import { useState, useEffect } from 'react'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ResidentDashboard from './pages/ResidentDashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('paab_user')
    if (saved) setUser(JSON.parse(saved))
    const theme = localStorage.getItem('paab_theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    setReady(true)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('paab_token', token)
    localStorage.setItem('paab_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('paab_token')
    localStorage.removeItem('paab_user')
    setUser(null)
  }

  if (!ready) return null
  if (!user) return <Login onLogin={handleLogin} />
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />
  return <ResidentDashboard user={user} onLogout={handleLogout} />
}
