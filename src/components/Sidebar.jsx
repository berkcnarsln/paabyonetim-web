export default function Sidebar({ role, activePage, setActivePage, user, onLogout }) {
  const adminMenu = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'aidatlar', icon: '₺', label: 'Aidatlar' },
    { id: 'daireler', icon: '⬡', label: 'Daireler' },
    { id: 'duyurular', icon: '📣', label: 'Duyurular' },
    { id: 'arizalar', icon: '🔧', label: 'Arızalar' },
    { id: 'giderler', icon: '📊', label: 'Giderler' },
  ]
  const residentMenu = [
    { id: 'dashboard', icon: '⊞', label: 'Genel Bakış' },
    { id: 'aidatlar', icon: '₺', label: 'Aidatlarım' },
    { id: 'duyurular', icon: '📣', label: 'Duyurular' },
    { id: 'arizalar', icon: '🔧', label: 'Arıza Bildir' },
  ]
  const menu = role === 'admin' ? adminMenu : residentMenu

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logo}>
        <span style={s.logoIcon}>⬡</span>
        <span style={s.logoText}>PaaB</span>
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
        <button onClick={onLogout} style={s.logoutBtn} title="Çıkış">⏻</button>
      </div>
    </aside>
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
  logoIcon: { fontSize: '24px', color: '#3B82F6' },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800',
    letterSpacing: '4px', color: '#F1F5F9',
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
}
