import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import client from '../api/client'

export default function ResidentDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')

  const titles = { dashboard: 'Genel Bakış', aidatlar: 'Aidatlarım', duyurular: 'Duyurular', arizalar: 'Arıza Bildir' }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <OverviewContent user={user} />
      case 'aidatlar': return <AidatlarContent user={user} />
      case 'duyurular': return <DuyurularContent user={user} />
      case 'arizalar': return <ArizalarContent user={user} />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar role="resident" activePage={activePage} setActivePage={setActivePage} user={user} onLogout={onLogout} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>{titles[activePage]}</h1>
            <p style={s.pageDate}>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div style={s.content}>{renderContent()}</div>
      </main>
    </div>
  )
}

function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    fn().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, deps)
  return { data, loading }
}

function Spinner() {
  return <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>Yükleniyor...</div>
}

function OverviewContent({ user }) {
  const { data, loading } = useApi(() => client.get('/api/dashboard/resident'), [])

  if (loading) return <Spinner />
  if (!data) return null

  const apt = data.apartment || {}
  const payment = data.current_payment

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={s.welcomeCard}>
        <div>
          <p style={s.welcomeSub}>Hoş Geldiniz</p>
          <h2 style={s.welcomeName}>{user.name} 👋</h2>
          <p style={s.welcomeInfo}>
            Daire: <strong>{apt.block ? `${apt.block}-${apt.unit_number}` : apt.unit_number || '-'}</strong>
            &nbsp;·&nbsp; Bina: <strong>{apt.building_name || '-'}</strong>
            {apt.floor && <>&nbsp;·&nbsp; Kat: <strong>{apt.floor}</strong></>}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={s.aidatLabel}>Güncel Aidat</p>
          <p style={s.aidatAmount}>₺{payment ? Number(payment.amount).toLocaleString('tr-TR') : '-'}</p>
          {payment?.due_date && <p style={s.aidatSon}>Son ödeme: {new Date(payment.due_date).toLocaleDateString('tr-TR')}</p>}
          {payment && <StatusBadge durum={payment.status} />}
        </div>
      </div>

      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Son Duyurular</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data.announcements || []).map(d => (
              <div key={d.id} style={s.duyuruItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={s.duyuruBaslik}>{d.title}</span>
                  <PriorityBadge priority={d.priority} />
                </div>
              </div>
            ))}
            {!data.announcements?.length && <p style={{ color: '#475569', fontSize: '14px' }}>Duyuru yok</p>}
          </div>
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>Aidat Durumu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data.payment_history || []).slice(0, 4).map(a => (
              <div key={a.id} style={s.aidatRow}>
                <div>
                  <p style={{ fontSize: '14px', color: '#E2E8F0', fontWeight: '500' }}>{a.period}</p>
                  {a.due_date && <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Son ödeme: {new Date(a.due_date).toLocaleDateString('tr-TR')}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#F1F5F9' }}>₺{Number(a.amount).toLocaleString('tr-TR')}</p>
                  <StatusBadge durum={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AidatlarContent({ user }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data, loading } = useApi(() => client.get(`/api/payments?apartment_id=${user.apartment_id}`), [])

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0')
    const period = `${year}-${m}`
    const kayit = (data || []).find(p => p.period === period)
    return { period, m: i + 1, kayit }
  })

  const odendi   = months.filter(m => m.kayit?.status === 'ödendi').length
  const bekliyor = months.filter(m => m.kayit?.status === 'bekliyor').length
  const gecikm   = months.filter(m => m.kayit?.status === 'gecikmiş').length

  if (loading) return <Spinner />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Yıl seçici */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setYear(y => y - 1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>‹</button>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '700', color: '#F1F5F9', minWidth: '80px', textAlign: 'center' }}>{year}</span>
        <button onClick={() => setYear(y => y + 1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>›</button>
      </div>

      {/* Özet */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Ödendi', value: odendi, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Bekliyor', value: bekliyor, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Gecikmiş', value: gecikm, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</p>
            <p style={{ fontSize: '26px', fontWeight: '700', color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}<span style={{ fontSize: '13px', color: '#64748B', marginLeft: '2px' }}>ay</span></p>
          </div>
        ))}
      </div>

      {/* 12 aylık liste */}
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>{year} Yılı Aidat Durumu</h3>
        <table style={s.table}>
          <thead><tr>{['Ay', 'Tutar', 'Son Ödeme', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {months.map(({ period, m, kayit }) => {
              const ayAd = new Date(year, m - 1).toLocaleString('tr-TR', { month: 'long' })
              const buAy = period === new Date().toISOString().slice(0, 7)
              return (
                <tr key={period} style={{ ...s.tr, ...(buAy ? { background: 'rgba(59,130,246,0.04)' } : {}) }}>
                  <td style={s.td}>
                    <span style={{ color: buAy ? '#60A5FA' : '#E2E8F0', fontWeight: buAy ? '600' : '400', textTransform: 'capitalize' }}>
                      {ayAd} {buAy && <span style={{ fontSize: '11px', color: '#3B82F6', marginLeft: '4px' }}>● güncel</span>}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: '600', color: '#F1F5F9' }}>{kayit ? `₺${Number(kayit.amount).toLocaleString('tr-TR')}` : '—'}</td>
                  <td style={s.td}>{kayit?.due_date ? new Date(kayit.due_date).toLocaleDateString('tr-TR') : '—'}</td>
                  <td style={s.td}>{kayit ? <StatusBadge durum={kayit.status} /> : <span style={{ color: '#334155', fontSize: '13px' }}>kayıt yok</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DuyurularContent({ user }) {
  const buildingId = user.building_id || 1
  const aptParam = user.apartment_id ? `&apartment_id=${user.apartment_id}` : ''
  const { data, loading } = useApi(() => client.get(`/api/announcements?building_id=${buildingId}${aptParam}`), [])

  if (loading) return <Spinner />
  return (
    <div style={s.card}>
      <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Tüm Duyurular</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(data || []).map(d => (
          <div key={d.id} style={{ ...s.duyuruItem, padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ ...s.duyuruBaslik, fontSize: '16px' }}>{d.title}</span>
              <span style={s.duyuruTarih}>{new Date(d.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <p style={{ ...s.duyuruIcerik, fontSize: '14px' }}>{d.content}</p>
          </div>
        ))}
        {!data?.length && <p style={{ color: '#475569', fontSize: '14px' }}>Duyuru yok</p>}
      </div>
    </div>
  )
}

function ArizalarContent({ user }) {
  const [form, setForm] = useState({ konu: '', aciklama: '' })
  const [arizalar, setArizalar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    client.get(`/api/repairs?reported_by=${user.id}`)
      .then(r => setArizalar(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const bildir = async () => {
    if (!form.konu) return
    setSaving(true)
    try {
      const { data } = await client.post('/api/repairs', {
        building_id: user.building_id || 1,
        apartment_id: user.apartment_id,
        title: form.konu,
        description: form.aciklama,
      })
      setArizalar(prev => [data, ...(prev || [])])
      setForm({ konu: '', aciklama: '' })
    } catch { } finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Arıza Bildir</h3>
        <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Arıza konusu (örn: Asansör çalışmıyor)" value={form.konu} onChange={e => setForm({ ...form, konu: e.target.value })} />
        <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} placeholder="Detaylı açıklama (isteğe bağlı)..." value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} />
        <button style={{ ...s.btnPrimary, marginTop: '12px' }} onClick={bildir} disabled={saving}>
          {saving ? 'Gönderiliyor...' : '🔧 Arıza Bildir'}
        </button>
      </div>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Arıza Taleplerim</h3>
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead><tr>{['No', 'Konu', 'Tarih', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(arizalar || []).map(a => (
                <tr key={a.id} style={s.tr}>
                  <td style={{ ...s.td, color: '#64748B' }}>#{a.id}</td>
                  <td style={s.td}>{a.title}</td>
                  <td style={s.td}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
                  <td style={s.td}><StatusBadge durum={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ durum }) {
  const map = {
    'ödendi':     { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    'bekliyor':   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    'gecikmiş':   { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
    'tamamlandı': { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    'inceleniyor':{ bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
  }
  const c = map[durum] || { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' }
  return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: c.bg, color: c.color }}>{durum}</span>
}

function PriorityBadge({ priority }) {
  const map = { acil: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' }, önemli: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' }, normal: { bg: 'rgba(59,130,246,0.1)', color: '#60A5FA' } }
  const c = map[priority] || map.normal
  return <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: c.bg, color: c.color }}>{priority}</span>
}

const s = {
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#080D18' },
  topbar: { padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  pageTitle: { fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '700', color: '#F1F5F9' },
  pageDate: { fontSize: '13px', color: '#475569', marginTop: '2px' },
  content: { flex: 1, overflow: 'auto', padding: '28px 32px' },
  welcomeCard: { background: 'linear-gradient(135deg, #1E3A5F 0%, #0F2340 100%)', borderRadius: '16px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(59,130,246,0.2)' },
  welcomeSub: { fontSize: '13px', color: '#60A5FA', marginBottom: '4px' },
  welcomeName: { fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '700', color: '#F1F5F9', marginBottom: '10px' },
  welcomeInfo: { fontSize: '14px', color: '#94A3B8' },
  aidatLabel: { fontSize: '12px', color: '#94A3B8', marginBottom: '4px' },
  aidatAmount: { fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' },
  aidatSon: { fontSize: '12px', color: '#EF4444', marginBottom: '8px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: { background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#E2E8F0', marginBottom: '16px', fontFamily: 'Syne, sans-serif' },
  duyuruItem: { padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' },
  duyuruBaslik: { fontSize: '14px', fontWeight: '600', color: '#E2E8F0' },
  duyuruTarih: { fontSize: '12px', color: '#475569' },
  duyuruIcerik: { fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: 1.5 },
  aidatRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '12px', fontSize: '14px', color: '#94A3B8' },
  btnPrimary: { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 14px', color: '#F1F5F9', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', display: 'block', boxSizing: 'border-box' },
}
