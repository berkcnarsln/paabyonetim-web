import { useState, useEffect, useRef } from 'react'
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
  { target: 150,  prefix: '',  suffix: '+',   label: 'Aktif Site' },
  { target: 6200, prefix: '',  suffix: '+',   label: 'Kayıtlı Sakin', turkish: true },
  { target: 3.8,  prefix: '₺', suffix: 'M+', label: 'Aidat Takibi', decimals: 1 },
  { target: 97,   prefix: '%', suffix: '',    label: 'Memnuniyet' },
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
    price: '₺15',
    period: '/ daire / ay',
    note: 'En fazla 15 daire',
    tag: 'İlk 30 gün ücretsiz',
    desc: 'Küçük siteler için ideal başlangıç.',
    features: ['15 daireye kadar', 'Aidat takibi', 'Duyurular', 'Arıza bildirimleri', 'E-posta desteği'],
    cta: 'Ücretsiz Başla',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₺35',
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
  const [counts, setCounts] = useState(stats.map(() => 0))
  const statsRef = useRef(null)
  const didAnimate = useRef(false)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !didAnimate.current) {
        didAnimate.current = true
        const duration = 2200
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 4)
          setCounts(stats.map(s =>
            s.decimals ? +(s.target * ease).toFixed(s.decimals) : Math.round(s.target * ease)
          ))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
        <div className="lp-nav-links">
          <a href="#ozellikler" className="lp-nav-link">Özellikler</a>
          <a href="#fiyatlar" className="lp-nav-link">Fiyatlar</a>
          <a href="#sss" className="lp-nav-link">SSS</a>
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
          Apartmanınızı<br /><span className="lp-hero-gradient">güvenle</span> yönetin.
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
      <div className="lp-stats" ref={statsRef}>
        {stats.map((s, i) => (
          <div key={s.label} className="lp-stat">
            <span className="lp-stat-value">
              {s.prefix}
              {s.turkish ? counts[i].toLocaleString('tr-TR') : counts[i]}
              {s.suffix}
            </span>
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
      <section className="lp-section" id="ozellikler">
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
      <section className="lp-section-alt" id="fiyatlar">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Şeffaf fiyatlandırma</h2>
            <p className="lp-section-sub">Gizli ücret yok. İstediğiniz zaman iptal.</p>
          </div>
          <div className="lp-pricing-note">
            Daire sayınıza göre, adil fiyatlandırma — ne kadar kullanırsanız o kadar ödersiniz.
            <span className="lp-pricing-example">Örn: 40 daire × ₺35 = <strong>₺1.400 / ay</strong></span>
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
      <section className="lp-section" id="sss">
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
        <div className="lp-footer-links">
          <a href="mailto:info@paabyonetim.com" className="lp-footer-link">info@paabyonetim.com</a>
          <a href="/gizlilik" className="lp-footer-link">Gizlilik Politikası</a>
          <a href="/kvkk" className="lp-footer-link">KVKK</a>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/90XXXXXXXXXX"
        className="lp-whatsapp-btn"
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp ile iletişime geçin"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}
