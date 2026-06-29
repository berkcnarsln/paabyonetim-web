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
  hasFeature: () => true,
})

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)

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
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  const hasFeature = (key) => {
    if (!tenant) return true
    return Boolean(tenant.features?.[key])
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, hasFeature }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
