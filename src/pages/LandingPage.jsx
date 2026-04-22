import { useState } from 'react'
import Logo from '../components/Logo'

const features = [
  { icon: '₺', title: 'Aidat Yönetimi', desc: 'Aylık aidat takibi, ödeme durumu ve gecikme bildirimleri tek ekranda.' },
  { icon: '📣', title: 'Duyurular', desc: 'Tüm siteye veya belirli bir daireye özel duyuru gönderin.' },
  { icon: '🔧', title: 'Arıza Bildirimleri', desc: 'Daire sakinleri arıza bildirir, yönetici anlık takip eder.' },
  { icon: '📊', title: 'Gider Takibi', desc: 'Site giderlerini kategorize edin, dönemsel raporlar alın.' },
  { icon: '⬡', title: 'Daire Yönetimi', desc: 'Daire bilgileri, sakin atamaları ve geçmiş kayıtlar.' },
  { icon: '👥', title: 'Kullanıcı Paneli', desc: 'Her daire sakini kendi panelinden bilgilerine ulaşır.' },
]

export default function LandingPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('paab_theme') || 'dark')

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('paab_theme', next)
    setTheme(next)
  }

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <Logo size="md" />
        <div style={s.navRight}>
          <button onClick={toggleTheme} style={s.themeBtn} title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a href="mailto:info@paabyonetim.com" style={s.navLink}>İletişim</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>Apartman Yönetim Sistemi</div>
        <h1 style={s.heroTitle}>
          Sitenizi akıllıca<br />yönetin.
        </h1>
        <p style={s.heroSub}>
          Aidat takibi, arıza bildirimleri, duyurular ve gider yönetimi —<br />
          daire sakinlerinize özel bir platform.
        </p>
        <div style={s.heroActions}>
          <a href="mailto:info@paabyonetim.com" style={s.btnPrimary}>Demo Talep Et →</a>
          <a href="mailto:info@paabyonetim.com" style={s.btnSecondary}>Bize Ulaşın</a>
        </div>
        <div style={s.bgBlob1} />
        <div style={s.bgBlob2} />
      </section>

      {/* Features */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Her şey tek platformda</h2>
          <p style={s.sectionSub}>Site yöneticileri ve daire sakinleri için tasarlandı.</p>
        </div>
        <div style={s.grid}>
          {features.map(f => (
            <div key={f.title} style={s.card}>
              <div style={s.cardIcon}>{f.icon}</div>
              <h3 style={s.cardTitle}>{f.title}</h3>
              <p style={s.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...s.section, background: 'var(--bg-card)' }}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Nasıl çalışır?</h2>
          <p style={s.sectionSub}>3 adımda sitenize özel panel hazır.</p>
        </div>
        <div style={s.steps}>
          {[
            { n: '1', title: 'Bize Ulaşın', desc: 'Demo talep edin, siteniz için özel alan adı oluşturalım.' },
            { n: '2', title: 'Daireleri Ekleyin', desc: 'Daire bilgilerini girin, sakinlere hesap açın.' },
            { n: '3', title: 'Kullanmaya Başlayın', desc: 'Sakinler kendi panelinden aidatlarını ve duyurularını görür.' },
          ].map(step => (
            <div key={step.n} style={s.step}>
              <div style={s.stepNum}>{step.n}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <h2 style={s.ctaTitle}>Siteniz için hazır mısınız?</h2>
        <p style={s.ctaSub}>Demo talep edin, size özel subdomain ile hemen başlayalım.</p>
        <a href="mailto:info@paabyonetim.com" style={s.btnPrimary}>Hemen Başla →</a>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <Logo size="sm" />
        <p style={s.footerText}>© {new Date().getFullYear()} PAAB Yönetim. Tüm hakları saklıdır.</p>
        <a href="mailto:info@paabyonetim.com" style={s.footerLink}>info@paabyonetim.com</a>
      </footer>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif' },

  // Navbar
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid var(--border-soft)', position: 'sticky', top: 0, background: 'var(--bg-page)', zIndex: 10 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navLink: { color: 'var(--t3)', fontSize: '14px', textDecoration: 'none' },
  themeBtn: { background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', padding: '5px 9px' },

  // Hero
  hero: { position: 'relative', overflow: 'hidden', padding: '100px 60px 120px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroBadge: { display: 'inline-block', background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.3px' },
  heroTitle: { fontFamily: 'Syne, sans-serif', fontSize: '72px', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', color: 'var(--t1)', position: 'relative', zIndex: 1 },
  heroSub: { fontSize: '18px', color: 'var(--t3)', lineHeight: 1.7, marginBottom: '40px', position: 'relative', zIndex: 1 },
  heroActions: { display: 'flex', gap: '16px', position: 'relative', zIndex: 1 },
  bgBlob1: { position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', top: '-150px', right: '-150px', pointerEvents: 'none' },
  bgBlob2: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none' },

  // Buttons
  btnPrimary: { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' },
  btnSecondary: { background: 'var(--bg-input)', color: 'var(--t2)', border: '1px solid var(--border-strong)', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' },

  // Features
  section: { padding: '80px 60px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
  sectionHeader: { textAlign: 'center', marginBottom: '56px' },
  sectionTitle: { fontFamily: 'Syne, sans-serif', fontSize: '40px', fontWeight: '700', color: 'var(--t1)', marginBottom: '12px' },
  sectionSub: { fontSize: '16px', color: 'var(--t3)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' },
  cardIcon: { fontSize: '28px', marginBottom: '16px' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px', fontFamily: 'Syne, sans-serif' },
  cardDesc: { fontSize: '14px', color: 'var(--t3)', lineHeight: 1.6 },

  // Steps
  steps: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
  step: { textAlign: 'center', padding: '24px' },
  stepNum: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  stepTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px', fontFamily: 'Syne, sans-serif' },
  stepDesc: { fontSize: '14px', color: 'var(--t3)', lineHeight: 1.6 },

  // CTA
  cta: { background: 'linear-gradient(135deg, #1E3A5F 0%, #1a3a6e 100%)', padding: '80px 60px', textAlign: 'center' },
  ctaTitle: { fontFamily: 'Syne, sans-serif', fontSize: '40px', fontWeight: '700', color: '#F1F5F9', marginBottom: '16px' },
  ctaSub: { fontSize: '16px', color: '#94A3B8', marginBottom: '36px' },

  // Footer
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 60px', borderTop: '1px solid var(--border-soft)' },
  footerText: { fontSize: '13px', color: 'var(--t4)' },
  footerLink: { fontSize: '13px', color: 'var(--t3)', textDecoration: 'none' },
}
