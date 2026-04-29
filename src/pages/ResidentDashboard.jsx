import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import client from '../api/client'

export default function ResidentDashboard({ user, onLogout, tenantName }) {
  const [activePage, setActivePage] = useState('dashboard')

  const titles = {
    dashboard:   'Genel Bakış',
    aidatlar:    'Aidatlarım',
    duyurular:   'Duyurular',
    arizalar:    'Arıza Bildir',
    anket:       'Anketler',
    rezervasyon: 'Rezervasyon',
    ziyaretci:   'Ziyaretçilerim',
    belgeler:    'Belgeler',
    mesajlar:    'Mesajlar',
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':   return <OverviewContent user={user} />
      case 'aidatlar':    return <AidatlarContent user={user} />
      case 'duyurular':   return <DuyurularContent user={user} />
      case 'arizalar':    return <ArizalarContent user={user} />
      case 'anket':       return <AnketContent user={user} />
      case 'rezervasyon': return <RezervasyonContent user={user} />
      case 'ziyaretci':   return <ZiyaretciContent user={user} />
      case 'belgeler':    return <BelgelerContent user={user} />
      case 'mesajlar':    return <MesajlarContent user={user} />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar role="resident" activePage={activePage} setActivePage={setActivePage} user={user} onLogout={onLogout} tenantName={tenantName} />
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

  const genel = (data || []).filter(d => !d.apartment_id)
  const bana  = (data || []).filter(d => !!d.apartment_id)

  const DuyuruCard = ({ d }) => (
    <div style={{ ...s.duyuruItem, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ ...s.duyuruBaslik, fontSize: '15px' }}>{d.title}</span>
        <span style={s.duyuruTarih}>{new Date(d.created_at).toLocaleDateString('tr-TR')}</span>
      </div>
      <p style={{ ...s.duyuruIcerik, fontSize: '14px' }}>{d.content}</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '14px', color: '#60A5FA' }}>📢 Genel Duyurular</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {genel.map(d => <DuyuruCard key={d.id} d={d} />)}
          {!genel.length && <p style={{ color: '#475569', fontSize: '14px' }}>Genel duyuru yok</p>}
        </div>
      </div>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '14px', color: '#A78BFA' }}>🏠 Bana Gelen Duyurular</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bana.map(d => <DuyuruCard key={d.id} d={d} />)}
          {!bana.length && <p style={{ color: '#475569', fontSize: '14px' }}>Size özel duyuru yok</p>}
        </div>
      </div>
    </div>
  )
}

function ArizalarContent({ user }) {
  const [form, setForm] = useState({ konu: '', aciklama: '' })
  const [arizalar, setArizalar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photo, setPhoto] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    client.get(`/api/repairs?reported_by=${user.id}`)
      .then(r => setArizalar(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setPhoto({ data: dataUrl.split(',')[1], type: file.type, preview: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const bildir = async () => {
    if (!form.konu) return
    setSaving(true)
    try {
      const payload = {
        building_id: user.building_id || 1,
        apartment_id: user.apartment_id,
        title: form.konu,
        description: form.aciklama,
      }
      if (photo) {
        payload.photo_data = photo.data
        payload.photo_type = photo.type
      }
      const { data } = await client.post('/api/repairs', payload)
      setArizalar(prev => [data, ...(prev || [])])
      setForm({ konu: '', aciklama: '' })
      setPhoto(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Bilinmeyen hata'
      alert(`Arıza bildirimi gönderilemedi: ${msg}`)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Arıza Bildir</h3>
        <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Arıza konusu (örn: Asansör çalışmıyor)" value={form.konu} onChange={e => setForm({ ...form, konu: e.target.value })} />
        <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} placeholder="Detaylı açıklama (isteğe bağlı)..." value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} />
        <div style={{ marginTop: '12px' }}>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <button
            type="button"
            style={{ ...s.btnPrimary, background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            📎 Fotoğraf Ekle
          </button>
          {photo && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={photo.preview} alt="önizleme" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px' }}
                onClick={() => { setPhoto(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              >
                ✕ Kaldır
              </button>
            </div>
          )}
        </div>
        <button style={{ ...s.btnPrimary, marginTop: '12px' }} onClick={bildir} disabled={saving}>
          {saving ? 'Gönderiliyor...' : '🔧 Arıza Bildir'}
        </button>
      </div>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Arıza Taleplerim</h3>
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead><tr>{['No', 'Konu', 'Fotoğraf', 'Tarih', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(arizalar || []).map(a => (
                <tr key={a.id} style={s.tr}>
                  <td style={{ ...s.td, color: '#64748B' }}>#{a.id}</td>
                  <td style={s.td}>{a.title}</td>
                  <td style={s.td}>
                    {a.photo_data
                      ? <img
                          src={`data:${a.photo_type};base64,${a.photo_data}`}
                          alt="fotoğraf"
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => window.open(`data:${a.photo_type};base64,${a.photo_data}`, '_blank')}
                        />
                      : <span style={{ color: '#475569', fontSize: '12px' }}>—</span>
                    }
                  </td>
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

// ─── Anket ────────────────────────────────────────────────────────────────────
function AnketContent({ user }) {
  const bid = user.building_id || 1
  const [anketler, setAnketler] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [voting, setVoting] = useState(null)

  useEffect(() => {
    client.get(`/api/surveys?building_id=${bid}`)
      .then(r => setAnketler(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const vote = async (surveyId, optionId) => {
    setVoting(surveyId)
    try {
      await client.post(`/api/surveys/${surveyId}/vote`, { option_id: optionId })
      const r = await client.get(`/api/surveys/${surveyId}`)
      setAnketler(prev => prev.map(a => a.id === surveyId ? { ...a, ...r.data } : a))
    } catch { } finally { setVoting(null) }
  }

  if (loading) return <Spinner />
  const aktif = (anketler || []).filter(a => a.status === 'aktif')
  const kapali = (anketler || []).filter(a => a.status !== 'aktif')

  const AnketCard = ({ a }) => {
    const total = (a.options || []).reduce((s, o) => s + (o.vote_count || 0), 0)
    const myVote = a.my_vote
    return (
      <div style={sm.anketCard}>
        <p style={sm.anketQ}>{a.title}</p>
        <p style={{ fontSize: '12px', color: 'var(--t5)', marginBottom: '12px' }}>
          {new Date(a.created_at).toLocaleDateString('tr-TR')} · {total} oy
          {a.status !== 'aktif' && <span style={{ marginLeft: '8px', color: '#EF4444' }}>● Kapandı</span>}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(a.options || []).map(opt => {
            const pct = total ? Math.round((opt.vote_count || 0) / total * 100) : 0
            const isMyVote = myVote === opt.id
            return (
              <div key={opt.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: isMyVote ? '#60A5FA' : 'var(--t3)', fontWeight: isMyVote ? '600' : '400' }}>
                    {isMyVote && '✓ '}{opt.option_text}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--t5)' }}>{pct}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: isMyVote ? '#3B82F6' : '#334155', borderRadius: '4px', transition: 'width 0.4s' }} />
                </div>
              </div>
            )
          })}
        </div>
        {!myVote && a.status === 'aktif' && (
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(a.options || []).map(opt => (
              <button
                key={opt.id}
                onClick={() => vote(a.id, opt.id)}
                disabled={voting === a.id}
                style={{ ...sm.voteBtn, ...(selected[a.id] === opt.id ? sm.voteBtnSelected : {}) }}
              >
                {opt.option_text}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Aktif Anketler</h3>
        {aktif.length ? aktif.map(a => <AnketCard key={a.id} a={a} />) : <p style={{ color: 'var(--t5)', fontSize: '14px' }}>Aktif anket yok</p>}
      </div>
      {kapali.length > 0 && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Geçmiş Anketler</h3>
          {kapali.map(a => <AnketCard key={a.id} a={a} />)}
        </div>
      )}
    </div>
  )
}

// ─── Rezervasyon ──────────────────────────────────────────────────────────────
function RezervasyonContent({ user }) {
  const bid = user.building_id || 1
  const today = new Date().toISOString().slice(0, 10)
  const [areas, setAreas] = useState(null)
  const [reservations, setReservations] = useState(null)
  const [date, setDate] = useState(today)
  const [form, setForm] = useState({ common_area_id: '', start_time: '09:00', end_time: '10:00', note: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get(`/api/reservations/areas?building_id=${bid}`),
      client.get(`/api/reservations?building_id=${bid}`),
    ]).then(([a, r]) => {
      setAreas(a.data)
      setReservations(r.data)
      if (a.data.length) setForm(f => ({ ...f, common_area_id: a.data[0].id }))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const loadForDate = (d) => {
    setDate(d)
    client.get(`/api/reservations?building_id=${bid}&date=${d}`)
      .then(r => setReservations(r.data))
      .catch(console.error)
  }

  const submit = async () => {
    if (!form.common_area_id || !date) { setError('Alan ve tarih seçin'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await client.post('/api/reservations', {
        building_id: bid,
        common_area_id: form.common_area_id,
        date, start_time: form.start_time, end_time: form.end_time,
        notes: form.note,
        apartment_id: user.apartment_id,
        created_by: user.id,
      })
      setReservations(prev => [data, ...(prev || [])])
      setSuccess('Rezervasyon oluşturuldu!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const iptal = async (id) => {
    try {
      await client.delete(`/api/reservations/${id}`)
      setReservations(prev => prev.filter(r => r.id !== id))
    } catch { }
  }

  if (loading) return <Spinner />

  const myRes = (reservations || []).filter(r => r.user_id === user.id || r.apartment_id === user.apartment_id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Rezervasyon Yap</h3>
        {error && <div style={sm.errBox}>{error}</div>}
        {success && <div style={sm.okBox}>{success}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={sm.label}>Ortak Alan</label>
            <select style={s.input} value={form.common_area_id} onChange={e => setForm({ ...form, common_area_id: e.target.value })}>
              {(areas || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label style={sm.label}>Tarih</label>
            <input style={s.input} type="date" value={date} min={today} onChange={e => loadForDate(e.target.value)} />
          </div>
          <div>
            <label style={sm.label}>Başlangıç</label>
            <input style={s.input} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
          </div>
          <div>
            <label style={sm.label}>Bitiş</label>
            <input style={s.input} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
          </div>
        </div>
        <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Not (isteğe bağlı)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        <button style={s.btnPrimary} onClick={submit} disabled={saving}>{saving ? 'Kaydediliyor...' : '+ Rezervasyon Yap'}</button>
      </div>

      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Rezervasyonlarım</h3>
        {myRes.length ? (
          <table style={s.table}>
            <thead><tr>{['Alan', 'Tarih', 'Saat', 'Durum', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {myRes.map(r => (
                <tr key={r.id} style={s.tr}>
                  <td style={s.td}>{r.area_name || r.common_area_id}</td>
                  <td style={s.td}>{new Date(r.date).toLocaleDateString('tr-TR')}</td>
                  <td style={s.td}>{r.start_time?.slice(0,5)} – {r.end_time?.slice(0,5)}</td>
                  <td style={s.td}><StatusBadge durum={r.status} /></td>
                  <td style={s.td}>
                    {r.status === 'onaylandı' || r.status === 'bekliyor' ? (
                      <button onClick={() => iptal(r.id)} style={sm.dangerBtn}>İptal</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--t5)', fontSize: '14px' }}>Rezervasyon bulunamadı</p>}
      </div>
    </div>
  )
}

// ─── Ziyaretçi ────────────────────────────────────────────────────────────────
function ZiyaretciContent({ user }) {
  const bid = user.building_id || 1
  const [visitors, setVisitors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', vehicle_plate: '', note: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    client.get(`/api/visitors?building_id=${bid}&apartment_id=${user.apartment_id}`)
      .then(r => setVisitors(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ekle = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const { data } = await client.post('/api/visitors', {
        building_id: bid,
        apartment_id: user.apartment_id,
        visitor_name: form.name,
        vehicle_plate: form.vehicle_plate,
        notes: form.note,
      })
      setVisitors(prev => [data, ...(prev || [])])
      setForm({ name: '', vehicle_plate: '', note: '' })
    } catch { } finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Ziyaretçi Ekle</h3>
        <input style={{ ...s.input, marginBottom: '10px' }} placeholder="Ziyaretçi adı soyadı *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={{ ...s.input, marginBottom: '10px' }} placeholder="Araç plakası (isteğe bağlı)" value={form.vehicle_plate} onChange={e => setForm({ ...form, vehicle_plate: e.target.value })} />
        <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Not (isteğe bağlı)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        <button style={s.btnPrimary} onClick={ekle} disabled={saving}>{saving ? 'Kaydediliyor...' : '+ Ziyaretçi Ekle'}</button>
      </div>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Ziyaretçi Listesi</h3>
        {(visitors || []).length ? (
          <table style={s.table}>
            <thead><tr>{['Ziyaretçi', 'Araç', 'Tarih', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(visitors || []).map(v => (
                <tr key={v.id} style={s.tr}>
                  <td style={s.td}>{v.visitor_name}</td>
                  <td style={s.td}>{v.vehicle_plate || '—'}</td>
                  <td style={s.td}>{new Date(v.created_at).toLocaleDateString('tr-TR')}</td>
                  <td style={s.td}><StatusBadge durum={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--t5)', fontSize: '14px' }}>Ziyaretçi kaydı yok</p>}
      </div>
    </div>
  )
}

// ─── Belgeler ─────────────────────────────────────────────────────────────────
function BelgelerContent({ user }) {
  const bid = user.building_id || 1
  const { data, loading } = useApi(() => client.get(`/api/documents?building_id=${bid}`), [])

  const download = async (doc) => {
    try {
      const { data: full } = await client.get(`/api/documents/${doc.id}/download`)
      const a = document.createElement('a')
      a.href = `data:${full.file_type};base64,${full.file_data}`
      a.download = full.file_name
      a.click()
    } catch { }
  }

  const fmt = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (loading) return <Spinner />
  const docs = (data || []).filter(d => d.is_public)

  return (
    <div style={s.card}>
      <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Belge & Dosyalar</h3>
      {docs.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {docs.map(d => (
            <div key={d.id} style={{ ...sm.docRow }}>
              <span style={sm.docIcon}>📄</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--t1)' }}>{d.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--t5)', marginTop: '2px' }}>
                  {d.file_name} {d.file_size ? `· ${fmt(d.file_size)}` : ''} · {new Date(d.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <button onClick={() => download(d)} style={s.btnPrimary}>İndir</button>
            </div>
          ))}
        </div>
      ) : <p style={{ color: 'var(--t5)', fontSize: '14px' }}>Belge bulunamadı</p>}
    </div>
  )
}

// ─── Mesajlar ─────────────────────────────────────────────────────────────────
function MesajlarContent({ user }) {
  const bid = user.building_id || 1
  const [messages, setMessages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [replies, setReplies] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    client.get(`/api/messages?building_id=${bid}`)
      .then(r => setMessages(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openThread = async (msg) => {
    setSelected(msg)
    setReplyText('')
    try {
      const r = await client.get(`/api/messages/${msg.id}/replies`)
      setReplies(r.data)
      await client.put(`/api/messages/${msg.id}/read`)
    } catch { }
  }

  const send = async () => {
    if (!newMsg.trim()) return
    setSending(true)
    try {
      const { data } = await client.post('/api/messages', {
        building_id: bid,
        apartment_id: user.apartment_id,
        subject: newMsg.substring(0, 60),
        body: newMsg,
        sender_id: user.id,
      })
      setMessages(prev => [data, ...(prev || [])])
      setNewMsg('')
    } catch { } finally { setSending(false) }
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return
    setSending(true)
    try {
      const { data } = await client.post('/api/messages', {
        building_id: bid,
        parent_id: selected.id,
        subject: `Re: ${selected.subject}`,
        body: replyText,
        sender_id: user.id,
        apartment_id: user.apartment_id,
      })
      setReplies(prev => [...prev, data])
      setReplyText('')
    } catch { } finally { setSending(false) }
  }

  if (loading) return <Spinner />

  return (
    <div style={{ display: 'flex', gap: '16px', height: '600px' }}>
      {/* Sol liste */}
      <div style={{ ...s.card, width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ ...s.cardTitle, marginBottom: '10px' }}>Mesajlarım</h3>
          <textarea style={{ ...s.input, height: '60px', resize: 'none', fontSize: '13px' }} placeholder="Yöneticiye mesaj..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
          <button style={{ ...s.btnPrimary, marginTop: '8px', width: '100%' }} onClick={send} disabled={sending}>{sending ? 'Gönderiliyor...' : '+ Gönder'}</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(messages || []).filter(m => !m.parent_id).map(m => (
            <button key={m.id} onClick={() => openThread(m)} style={{ ...sm.msgRow, ...(selected?.id === m.id ? sm.msgRowActive : {}) }}>
              <p style={{ fontSize: '13px', fontWeight: m.is_read ? '400' : '700', color: 'var(--t1)', textAlign: 'left', marginBottom: '4px' }}>{m.subject}</p>
              <p style={{ fontSize: '11px', color: 'var(--t5)', textAlign: 'left' }}>{new Date(m.created_at).toLocaleDateString('tr-TR')}</p>
            </button>
          ))}
          {!(messages || []).filter(m => !m.parent_id).length && (
            <p style={{ padding: '16px', color: 'var(--t5)', fontSize: '13px' }}>Mesaj yok</p>
          )}
        </div>
      </div>
      {/* Sağ thread */}
      <div style={{ ...s.card, flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {selected ? (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>{selected.subject}</p>
              <p style={{ fontSize: '12px', color: 'var(--t5)', marginTop: '2px' }}>{new Date(selected.created_at).toLocaleString('tr-TR')}</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={sm.bubble(false)}><p style={{ fontSize: '14px', margin: 0 }}>{selected.body}</p></div>
              {replies.map(r => (
                <div key={r.id} style={sm.bubble(r.sender_id === user.id)}>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{r.sender_name || 'Gönderen'}</p>
                  <p style={{ fontSize: '14px', margin: 0 }}>{r.body}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Yanıtla..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
              <button style={s.btnPrimary} onClick={sendReply} disabled={sending}>Gönder</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t5)', fontSize: '14px' }}>
            Bir mesaj seçin
          </div>
        )}
      </div>
    </div>
  )
}

const sm = {
  label:     { fontSize: '12px', color: 'var(--t5)', display: 'block', marginBottom: '4px', fontWeight: '500' },
  errBox:    { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' },
  okBox:     { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px', color: '#6EE7B7', fontSize: '13px', marginBottom: '12px' },
  dangerBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '4px 10px', color: '#FCA5A5', fontSize: '12px', cursor: 'pointer' },
  anketCard: { padding: '16px', background: 'var(--bg-hover)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '12px' },
  anketQ:    { fontSize: '15px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' },
  voteBtn:   { padding: '7px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', background: 'var(--bg-input)', color: 'var(--t3)', fontSize: '13px', cursor: 'pointer' },
  voteBtnSelected: { background: 'rgba(59,130,246,0.15)', borderColor: '#3B82F6', color: '#60A5FA' },
  docRow:    { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border)' },
  docIcon:   { fontSize: '24px', flexShrink: 0 },
  msgRow:    { display: 'block', width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer' },
  msgRowActive: { background: 'rgba(59,130,246,0.08)' },
  bubble:    (mine) => ({
    alignSelf: mine ? 'flex-end' : 'flex-start',
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background: mine ? 'rgba(59,130,246,0.15)' : 'var(--bg-hover)',
    border: `1px solid ${mine ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
  }),
}

const s = {
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-page)' },
  topbar:      { padding: '24px 32px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-page)' },
  pageTitle:   { fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '700', color: 'var(--t1)' },
  pageDate:    { fontSize: '13px', color: 'var(--t5)', marginTop: '2px' },
  content:     { flex: 1, overflow: 'auto', padding: '28px 32px' },
  welcomeCard: { background: 'linear-gradient(135deg, #1E3A5F 0%, #0F2340 100%)', borderRadius: '16px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(59,130,246,0.2)' },
  welcomeSub:  { fontSize: '13px', color: '#60A5FA', marginBottom: '4px' },
  welcomeName: { fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '700', color: '#F1F5F9', marginBottom: '10px' },
  welcomeInfo: { fontSize: '14px', color: '#94A3B8' },
  aidatLabel:  { fontSize: '12px', color: '#94A3B8', marginBottom: '4px' },
  aidatAmount: { fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' },
  aidatSon:    { fontSize: '12px', color: '#EF4444', marginBottom: '8px' },
  twoCol:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card:        { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' },
  cardTitle:   { fontSize: '15px', fontWeight: '600', color: 'var(--t1)', marginBottom: '16px', fontFamily: 'Syne, sans-serif' },
  duyuruItem:  { padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border)' },
  duyuruBaslik:{ fontSize: '14px', fontWeight: '600', color: 'var(--t1)' },
  duyuruTarih: { fontSize: '12px', color: 'var(--t5)' },
  duyuruIcerik:{ fontSize: '13px', color: 'var(--t4)', marginTop: '4px', lineHeight: 1.5 },
  aidatRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: 'var(--t5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' },
  tr:          { borderBottom: '1px solid var(--border-soft)' },
  td:          { padding: '12px', fontSize: '14px', color: 'var(--t3)' },
  btnPrimary:  { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  input:       { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '12px 14px', color: 'var(--t1)', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', display: 'block', boxSizing: 'border-box' },
}
