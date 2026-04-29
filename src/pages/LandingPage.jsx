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

const stats = [
  { value: '150+', label: 'Aktif Site' },
  { value: '6.200+', label: 'Kayıtlı Sakin' },
  { value: '₺3.8M+', label: 'Aidat Takibi' },
  { value: '%97', label: 'Memnuniyet' },
]

const testimonials = [
  {
    quote: 'Aidat takibinde harcadığımız zamanı ciddi ölçüde azalttı. Sakinler ödeme durumlarını artık kendileri görüyor, bizi aramıyorlar.',
    name: 'Ahmet Yılmaz',
    role: 'Site Yöneticisi — Yeşiltepe Sitesi',
    avatar: 'AY',
  },
  {
    quote: 'Arıza bildirimlerini kağıttan dijitale taşıdık. Hiçbir talep kaybolmuyor, geçmişe her zaman bakabiliyoruz.',
    name: 'Fatma Kaya',
    role: 'Yönetim Kurulu Başkanı — Güneş Apartmanı',
    avatar: 'FK',
  },
  {
    quote: 'Kendi panelimden aidat ödemelerimi ve duyuruları takip etmek çok kolay. Site yöneticisini artık sadece önemli konular için arıyorum.',
    name: 'Murat Demir',
    role: 'Daire Sakini — Lale Konutları',
    avatar: 'MD',
  },
]

const plans = [
  {
    name: 'Başlangıç',
    price: '₺25',
    period: '/ daire / ay',
    note: 'En fazla 20 daire',
    tag: 'İlk 30 gün ücretsiz',
    desc: 'Küçük siteler için ideal başlangıç.',
    features: ['20 daireye kadar', 'Aidat takibi', 'Duyurular', 'Arıza bildirimleri', 'E-posta desteği'],
    cta: 'Ücretsiz Başla',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₺25',
    period: '/ daire / ay',
    note: 'Sınırsız daire',
    desc: 'Büyüdükçe birlikte büyüyoruz.',
    features: ['Sınırsız daire', 'Tüm Başlangıç özellikleri', 'Gider raporlama', 'Özel subdomain', 'Öncelikli destek'],
    cta: 'Demo Talep Et',
    highlight: true,
  },
  {
    name: 'Kurumsal',
    price: 'Özel',
    period: 'fiyatlandırma',
    note: null,
    desc: 'Birden fazla site yönetenler için.',
    features: ['Çoklu site yönetimi', 'API entegrasyonu', 'Özel domain', 'SLA garantisi', 'Dedike destek hattı'],
    cta: 'Bize Ulaşın',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'Kurulum süreci nasıl işliyor?',
    a: 'Demo talebinden sonra sitenize özel subdomain oluşturuyoruz. Daire bilgilerini sisteme giriyor, sakinlere hesap açıyoruz. Tüm süreç 1-2 iş günü içinde tamamlanıyor.',
  },
  {
    q: 'Sakinler sistemi nasıl kullanacak?',
    a: 'Her sakine e-posta ile giriş bilgileri iletilir. Kendi panelinden aidat durumunu, duyuruları ve arıza bildirimlerini takip edebilirler. Teknik bilgi gerekmez.',
  },
  {
    q: 'Verilerimiz güvende mi?',
    a: 'Tüm veriler TLS şifrelemesiyle iletilir ve düzenli olarak yedeklenir. Verileriniz hiçbir üçüncü tarafla paylaşılmaz.',
  },
  {
    q: 'Mevcut daire listesini içe aktarabilir miyiz?',
    a: 'Evet. Excel veya CSV formatındaki daire ve sakin bilgilerinizi aktarabiliyoruz. Geçmiş aidat kayıtları için de import desteği sunuyoruz.',
  },
  {
    q: 'Aboneliği istediğimde iptal edebilir miyim?',
    a: 'Evet, herhangi bir uzun vadeli taahhüt bulunmuyor. İstediğiniz zaman iptal edebilir, verilerinizin kopyasını talep edebilirsiniz.',
  },
]

export default function LandingPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('paab_theme') || 'dark')
  const [faqOpen, setFaqOpen] = useState(null)

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
        <div className="lp-nav-brand">
          <Logo size="md" hideText />
          <span className="lp-nav-brand-name">PAAB Yönetim</span>
        </div>
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
          Apartmanınızı<br />güvenle yönetin.
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

      {/* Stats */}
      <div className="lp-stats">
        {stats.map(s => (
          <div key={s.label} className="lp-stat">
            <span className="lp-stat-value">{s.value}</span>
            <span className="lp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Dashboard Preview */}
      <section className="lp-preview-section">
        <div className="lp-section-header">
          <h2 className="lp-section-title">Yönetim bir ekrana sığdı</h2>
          <p className="lp-section-sub">Temiz ve sezgisel arayüz — öğrenmesi dakikalar alır.</p>
        </div>
        <div className="lp-browser">
          <div className="lp-browser-bar">
            <span className="lp-browser-dot" style={{ background: '#FF5F57' }} />
            <span className="lp-browser-dot" style={{ background: '#FEBC2E' }} />
            <span className="lp-browser-dot" style={{ background: '#28C840' }} />
            <span className="lp-browser-url">app.paabyonetim.com/dashboard</span>
          </div>
          <div className="lp-mock-layout">
            <aside className="lp-mock-sidebar">
              <div className="lp-mock-logo" />
              <nav className="lp-mock-nav">
                {['Dashboard', 'Aidatlar', 'Duyurular', 'Arıza', 'Giderler', 'Daireler'].map((item, i) => (
                  <div key={item} className={`lp-mock-nav-item${i === 0 ? ' active' : ''}`}>{item}</div>
                ))}
              </nav>
            </aside>
            <main className="lp-mock-main">
              <div className="lp-mock-topbar">
                <div className="lp-mock-title-block">
                  <div className="lp-mock-title-text" />
                  <div className="lp-mock-sub-text" />
                </div>
                <div className="lp-mock-btn-placeholder" />
              </div>
              <div className="lp-mock-cards">
                <div className="lp-mock-stat-card">
                  <div className="lp-mock-stat-icon blue" />
                  <div className="lp-mock-stat-body">
                    <div className="lp-mock-stat-num">48</div>
                    <div className="lp-mock-stat-lbl">Toplam Daire</div>
                  </div>
                </div>
                <div className="lp-mock-stat-card">
                  <div className="lp-mock-stat-icon green" />
                  <div className="lp-mock-stat-body">
                    <div className="lp-mock-stat-num">39</div>
                    <div className="lp-mock-stat-lbl">Ödeme Yapıldı</div>
                  </div>
                </div>
                <div className="lp-mock-stat-card">
                  <div className="lp-mock-stat-icon orange" />
                  <div className="lp-mock-stat-body">
                    <div className="lp-mock-stat-num">9</div>
                    <div className="lp-mock-stat-lbl">Bekleyen Aidat</div>
                  </div>
                </div>
                <div className="lp-mock-stat-card">
                  <div className="lp-mock-stat-icon red" />
                  <div className="lp-mock-stat-body">
                    <div className="lp-mock-stat-num">3</div>
                    <div className="lp-mock-stat-lbl">Açık Arıza</div>
                  </div>
                </div>
              </div>
              <div className="lp-mock-table-section">
                <div className="lp-mock-table-head" />
                <div className="lp-mock-table-row" />
                <div className="lp-mock-table-row alt" />
                <div className="lp-mock-table-row" />
                <div className="lp-mock-table-row alt" />
              </div>
            </main>
          </div>
        </div>
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

      {/* Testimonials */}
      <section className="lp-section">
        <div className="lp-section-header">
          <h2 className="lp-section-title">Kullanıcılarımız ne diyor?</h2>
          <p className="lp-section-sub">Gerçek site yöneticileri ve sakinlerden.</p>
        </div>
        <div className="lp-testimonials">
          {testimonials.map(t => (
            <div key={t.name} className="lp-testimonial">
              <p className="lp-testimonial-quote">"{t.quote}"</p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="lp-section-alt">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Şeffaf fiyatlandırma</h2>
            <p className="lp-section-sub">Gizli ücret yok. İstediğiniz zaman iptal.</p>
          </div>
          <div className="lp-pricing-note">
            Ödediğiniz kadar ödersiniz — daire sayınıza göre otomatik hesaplanır.
            <span className="lp-pricing-example">Örn: 40 daire × ₺25 = <strong>₺1.000 / ay</strong></span>
          </div>
          <div className="lp-pricing">
            {plans.map(p => (
              <div key={p.name} className={`lp-plan${p.highlight ? ' highlight' : ''}`}>
                {p.highlight && <div className="lp-plan-badge">Popüler</div>}
                {p.tag && <div className="lp-plan-tag">{p.tag}</div>}
                <h3 className="lp-plan-name">{p.name}</h3>
                <p className="lp-plan-desc">{p.desc}</p>
                <div className="lp-plan-price">
                  <span className="lp-plan-amount">{p.price}</span>
                  <span className="lp-plan-period">{p.period}</span>
                </div>
                {p.note && <div className="lp-plan-note">{p.note}</div>}
                <ul className="lp-plan-features">
                  {p.features.map(f => (
                    <li key={f} className="lp-plan-feature">
                      <span className="lp-plan-check">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:info@paabyonetim.com" className={p.highlight ? 'lp-btn-primary' : 'lp-btn-secondary'}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section">
        <div className="lp-section-header">
          <h2 className="lp-section-title">Sık sorulan sorular</h2>
          <p className="lp-section-sub">Aklınızdaki soruların cevabı burada.</p>
        </div>
        <div className="lp-faq">
          {faqs.map((item, i) => (
            <div key={i} className={`lp-faq-item${faqOpen === i ? ' open' : ''}`}>
              <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {item.q}
                <span className="lp-faq-icon">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <p className="lp-faq-a">{item.a}</p>}
            </div>
          ))}
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
