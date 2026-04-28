import { useState } from 'react'
import Logo from '../components/Logo'
import './LandingPage.css'

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
    <div className="lp-page">
      {/* Navbar */}
      <nav className="lp-nav">
        <Logo size="md" />
        <div className="lp-nav-right">
          <button onClick={toggleTheme} className="lp-theme-btn" title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a href="mailto:info@paabyonetim.com" className="lp-nav-link">İletişim</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-badge">Apartman Yönetim Sistemi</div>
        <h1 className="lp-hero-title">
          Sitenizi akıllıca<br />yönetin.
        </h1>
        <p className="lp-hero-sub">
          Aidat takibi, arıza bildirimleri, duyurular ve gider yönetimi —<br />
          daire sakinlerinize özel bir platform.
        </p>
        <div className="lp-hero-actions">
          <a href="mailto:info@paabyonetim.com" className="lp-btn-primary">Demo Talep Et →</a>
          <a href="mailto:info@paabyonetim.com" className="lp-btn-secondary">Bize Ulaşın</a>
        </div>
        <div className="lp-blob1" />
        <div className="lp-blob2" />
      </section>

      {/* Features */}
      <section className="lp-section">
        <div className="lp-section-header">
          <h2 className="lp-section-title">Her şey tek platformda</h2>
          <p className="lp-section-sub">Site yöneticileri ve daire sakinleri için tasarlandı.</p>
        </div>
        <div className="lp-grid">
          {features.map(f => (
            <div key={f.title} className="lp-card">
              <div className="lp-card-icon">{f.icon}</div>
              <h3 className="lp-card-title">{f.title}</h3>
              <p className="lp-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section-alt">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Nasıl çalışır?</h2>
            <p className="lp-section-sub">3 adımda sitenize özel panel hazır.</p>
          </div>
          <div className="lp-steps">
            {[
              { n: '1', title: 'Bize Ulaşın', desc: 'Demo talep edin, siteniz için özel alan adı oluşturalım.' },
              { n: '2', title: 'Daireleri Ekleyin', desc: 'Daire bilgilerini girin, sakinlere hesap açın.' },
              { n: '3', title: 'Kullanmaya Başlayın', desc: 'Sakinler kendi panelinden aidatlarını ve duyurularını görür.' },
            ].map(step => (
              <div key={step.n} className="lp-step">
                <div className="lp-step-num">{step.n}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2 className="lp-cta-title">Siteniz için hazır mısınız?</h2>
        <p className="lp-cta-sub">Demo talep edin, size özel subdomain ile hemen başlayalım.</p>
        <a href="mailto:info@paabyonetim.com" className="lp-btn-primary">Hemen Başla →</a>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <Logo size="sm" />
        <p className="lp-footer-text">© {new Date().getFullYear()} PAAB Yönetim. Tüm hakları saklıdır.</p>
        <a href="mailto:info@paabyonetim.com" className="lp-footer-link">info@paabyonetim.com</a>
      </footer>
    </div>
  )
}
