import { useState, useEffect } from 'react'
import client from '../api/client'

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await client.post('/api/auth/login', { email, password })
      onLogin(data.user, data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız, lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.left, display: isMobile ? 'none' : 'flex' }}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⬡</span>
            <span style={styles.logoText}>PaaB</span>
          </div>
          <h1 style={styles.headline}>Sitenizi akıllıca yönetin.</h1>
          <p style={styles.sub}>
            Aidat takibi, duyurular, arıza bildirimleri ve çok daha fazlası — tek platformda.
          </p>
          <div style={styles.features}>
            {['Aidat & Ödeme Takibi', 'Duyuru Yönetimi', 'Arıza Bildirimleri', 'Gider Raporları'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.bgBlob1} />
        <div style={styles.bgBlob2} />
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <span style={{ fontSize: '26px', color: '#3B82F6' }}>⬡</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800', letterSpacing: '4px', color: '#F1F5F9' }}>PaaB</span>
            </div>
          )}
          <h2 style={styles.cardTitle}>Giriş Yap</h2>
          <p style={styles.cardSub}>PaaBYonetim hesabınıza erişin</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { display: 'flex', height: '100vh', overflow: 'hidden' },
  left: {
    flex: 1, background: 'linear-gradient(135deg, #0D1424 0%, #0A1628 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: '60px',
  },
  leftInner: { position: 'relative', zIndex: 2, maxWidth: '480px' },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
  logoIcon: { fontSize: '32px', color: '#3B82F6' },
  logoText: { fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', letterSpacing: '4px', color: '#F1F5F9' },
  headline: { fontFamily: 'Syne, sans-serif', fontSize: '42px', fontWeight: '700', lineHeight: 1.2, marginBottom: '16px', color: '#F1F5F9' },
  sub: { fontSize: '16px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '40px' },
  features: { display: 'flex', flexDirection: 'column', gap: '14px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', color: '#CBD5E1', fontSize: '15px' },
  checkmark: { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  bgBlob1: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', top: '-100px', right: '-100px', zIndex: 1 },
  bgBlob2: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', bottom: '-50px', left: '-50px', zIndex: 1 },
  right: { width: '480px', maxWidth: '100%', background: '#080D18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', flex: 1 },
  card: { width: '100%' },
  cardTitle: { fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#F1F5F9' },
  cardSub: { color: '#64748B', fontSize: '14px', marginBottom: '36px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#94A3B8', letterSpacing: '0.5px' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px 16px', color: '#F1F5F9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'DM Sans, sans-serif' },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', color: '#FCA5A5', fontSize: '14px' },
  btn: { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '10px', padding: '15px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.3px' },
}
