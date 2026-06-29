import { createContext, useContext, useEffect, useState } from 'react'
import client, { getSubdomain } from './client'

const DEFAULT_FEATURES = {
  maintenance: true,
  documents: true,
  surveys: true,
  reservations: true,
  visitors: true,
  staff: true,
  messaging: true,
}

const TenantContext = createContext({
  tenant: null,
  loading: true,
  notFound: false,
  hasFeature: () => true,
})

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const sub = getSubdomain()
    if (!sub) { setLoading(false); return }

    let cancelled = false
    client.get('/api/tenant')
      .then(res => {
        if (cancelled) return
        setTenant({
          ...res.data,
          features: { ...DEFAULT_FEATURES, ...(res.data.features || {}) },
        })
      })
      .catch(err => {
        if (cancelled) return
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  const hasFeature = (key) => {
    if (!tenant) return true
    return Boolean(tenant.features?.[key])
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, notFound, hasFeature }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}

export function TenantGate({ children }) {
  const { loading, notFound } = useTenant()
  if (loading) {
    return (
      <div style={gateStyles.center}>
        <div style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Yükleniyor...</div>
      </div>
    )
  }
  if (notFound) return <NotFoundPage />
  return children
}

function NotFoundPage() {
  const sub = getSubdomain()
  return (
    <div style={gateStyles.center}>
      <div style={gateStyles.card}>
        <div style={gateStyles.icon}>🔍</div>
        <h1 style={gateStyles.title}>Site bulunamadı</h1>
        <p style={gateStyles.text}>
          <code style={gateStyles.code}>{sub}.paabyonetim.com</code> adresinde kayıtlı bir site yok.
        </p>
        <p style={gateStyles.text}>
          Adresi doğru yazdığınızdan emin olun veya yöneticinizle iletişime geçin.
        </p>
        <a href="https://paabyonetim.com" style={gateStyles.btn}>Ana sayfaya dön</a>
      </div>
    </div>
  )
}

const gateStyles = {
  center: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0B1120', padding: 20,
    fontFamily: 'DM Sans, sans-serif',
  },
  card: {
    background: '#0D1424', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '40px 32px', maxWidth: 440, textAlign: 'center',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700,
    color: '#E2E8F0', marginBottom: 12,
  },
  text: { color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 12 },
  code: {
    background: 'rgba(59,130,246,0.1)', color: '#93C5FD',
    padding: '2px 8px', borderRadius: 6, fontSize: 13,
  },
  btn: {
    display: 'inline-block', marginTop: 16,
    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    color: '#fff', padding: '12px 24px', borderRadius: 8,
    textDecoration: 'none', fontWeight: 600, fontSize: 14,
  },
}
