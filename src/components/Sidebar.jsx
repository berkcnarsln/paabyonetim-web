import Logo from './Logo'
import { useState } from 'react'
import client from '../api/client'

export default function Sidebar({ role, activePage, setActivePage, user, onLogout, isMobile, isOpen, tenantName }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('paab_theme') || 'dark')
  const [showPwModal, setShowPwModal] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('paab_theme', next)
    setTheme(next)
  }

  const openPwModal = () => {
    setPw({ current: '', next: '', confirm: '' })
    setPwError('')
    setPwSuccess(false)
    setShowPwModal(true)
  }

  const changePassword = async () => {
    if (!pw.current || !pw.next || !pw.confirm) { setPwError('Tüm alanları doldurun'); return }
    if (pw.next.length < 6) { setPwError('Yeni şifre en az 6 karakter olmalı'); return }
    if (pw.next !== pw.confirm) { setPwError('Yeni şifreler eşleşmiyor'); return }
    setPwLoading(true); setPwError('')
    try {
      await client.put('/api/auth/change-password', { current_password: pw.current, new_password: pw.next })
      setPwSuccess(true)
      setTimeout(() => setShowPwModal(false), 1500)
    } catch (err) {
      setPwError(err.response?.data?.error || 'Hata oluştu')
    } finally {
      setPwLoading(false)
    }
  }

  const adminMenu = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'aidatlar', icon: '₺', label: 'Aidatlar' },
    { id: 'daireler', icon: '⬡', label: 'Daireler' },
    { id: 'duyurular', icon: '📣', label: 'Duyurular' },
    { id: 'arizalar', icon: '🔧', label: 'Arızalar' },
    { id: 'giderler', icon: '📊', label: 'Giderler' },
    { id: 'kullanicilar', icon: '👥', label: 'Kullanıcılar' },
  ]
  const residentMenu = [
    { id: 'dashboard', icon: '⊞', label: 'Genel Bakış' },
    { id: 'aidatlar', icon: '₺', label: 'Aidatlarım' },
    { id: 'duyurular', icon: '📣', label: 'Duyurular' },
    { id: 'arizalar', icon: '🔧', label: 'Arıza Bildir' },
  ]
  const menu = role === 'admin' ? adminMenu : residentMenu

  const mobileStyle = isMobile ? {
    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.25s ease',
  } : {}

  return (
    <>
      <aside style={{ ...s.sidebar, ...mobileStyle }}>
        {/* Logo */}
        <div style={s.logo}>
          <Logo size="md" tenantName={tenantName} />
        </div>

        {/* Role Badge */}
        <div style={s.roleBadge}>
          <span style={{ ...s.roleDot, background: role === 'admin' ? '#3B82F6' : '#10B981' }} />
          {role === 'admin' ? 'Yönetici Paneli' : 'Daire Sahibi'}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                ...s.navItem,
                ...(activePage === item.id ? s.navItemActive : {}),
              }}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.id && <span style={s.activeBar} />}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={s.userSection}>
          <div style={s.avatar}>{user.name.charAt(0)}</div>
          <div style={s.userInfo}>
            <p style={s.userName}>{user.name}</p>
            <p style={s.userEmail}>{user.email}</p>
          </div>
          <button onClick={openPwModal} style={s.logoutBtn} title="Şifre Değiştir">🔑</button>
          <button onClick={toggleTheme} style={{ ...s.logoutBtn, fontSize: '15px' }} title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={onLogout} style={s.logoutBtn} title="Çıkış">⏻</button>
        </div>
      </aside>

      {/* Şifre Değiştir Modal */}
      {showPwModal && (
        <div style={s.overlay} onClick={() => setShowPwModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Şifre Değiştir</h3>

            {pwSuccess ? (
              <div style={{ color: '#10B981', textAlign: 'center', padding: '16px', fontSize: '15px' }}>
                ✓ Şifre başarıyla güncellendi
              </div>
            ) : (
              <>
                {pwError && (
                  <div style={s.modalError}>{pwError}</div>
                )}
                <div style={s.modalFields}>
                  <input
                    style={s.modalInput}
                    type="password"
                    placeholder="Mevcut şifre"
                    value={pw.current}
                    onChange={e => setPw({ ...pw, current: e.target.value })}
                  />
                  <input
                    style={s.modalInput}
                    type="password"
                    placeholder="Yeni şifre (min. 6 karakter)"
                    value={pw.next}
                    onChange={e => setPw({ ...pw, next: e.target.value })}
                  />
                  <input
                    style={s.modalInput}
                    type="password"
                    placeholder="Yeni şifre tekrar"
                    value={pw.confirm}
                    onChange={e => setPw({ ...pw, confirm: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button style={s.modalBtn} onClick={changePassword} disabled={pwLoading}>
                    {pwLoading ? 'Kaydediliyor...' : 'Güncelle'}
                  </button>
                  <button style={{ ...s.modalBtn, background: 'var(--bg-input)', color: 'var(--t3)' }} onClick={() => setShowPwModal(false)}>
                    İptal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const s = {
  sidebar: {
    width: '240px', minHeight: '100vh', background: '#0D1424',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', padding: '24px 0',
    flexShrink: 0,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0 24px', marginBottom: '32px',
  },
  roleBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', margin: '0 12px 24px',
    background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
    fontSize: '12px', color: '#94A3B8', fontWeight: '500',
  },
  roleDot: { width: '7px', height: '7px', borderRadius: '50%' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 12px', borderRadius: '8px', border: 'none',
    background: 'transparent', color: '#64748B', fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
    transition: 'all 0.15s', position: 'relative', textAlign: 'left', width: '100%',
  },
  navItemActive: {
    background: 'rgba(59,130,246,0.12)', color: '#93C5FD', fontWeight: '600',
  },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' },
  activeBar: {
    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
    width: '4px', height: '4px', borderRadius: '50%', background: '#3B82F6',
  },
  userSection: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '16px', margin: '12px', marginTop: 'auto',
    background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '13px', fontWeight: '600', color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
    fontSize: '16px', padding: '4px', flexShrink: 0,
  },
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '28px', width: '360px',
  },
  modalTitle: {
    fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700',
    color: 'var(--t1)', marginBottom: '20px',
  },
  modalError: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px', padding: '10px', color: '#FCA5A5',
    fontSize: '13px', marginBottom: '12px',
  },
  modalFields: { display: 'flex', flexDirection: 'column', gap: '10px' },
  modalInput: {
    background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
    borderRadius: '8px', padding: '11px 14px', color: 'var(--t1)',
    fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif',
  },
  modalBtn: {
    flex: 1, background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    border: 'none', borderRadius: '8px', padding: '11px',
    color: '#fff', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  },
}
