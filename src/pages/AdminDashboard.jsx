import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import client from '../api/client'

export default function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const buildingId = user.building_id || 1

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardContent buildingId={buildingId} />
      case 'aidatlar': return <AidatlarContent buildingId={buildingId} />
      case 'daireler': return <DairelerContent buildingId={buildingId} />
      case 'duyurular': return <DuyurularContent buildingId={buildingId} />
      case 'arizalar': return <ArizalarContent buildingId={buildingId} />
      case 'giderler': return <GiderlerContent buildingId={buildingId} />
      case 'kullanicilar': return <KullanicilarContent buildingId={buildingId} />
      default: return <DashboardContent buildingId={buildingId} />
    }
  }

  const titles = { dashboard: 'Genel Bakış', aidatlar: 'Aidat Yönetimi', daireler: 'Daireler', duyurular: 'Duyurular', arizalar: 'Arıza Takibi', giderler: 'Gider Yönetimi', kullanicilar: 'Kullanıcı Yönetimi' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />
      )}
      <Sidebar
        role="admin"
        activePage={activePage}
        setActivePage={(page) => { setActivePage(page); setSidebarOpen(false) }}
        user={user}
        onLogout={onLogout}
        isMobile={isMobile}
        isOpen={sidebarOpen}
      />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '22px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>
                ☰
              </button>
            )}
            <div>
              <h1 style={s.pageTitle}>{titles[activePage]}</h1>
              <p style={s.pageDate}>Bugün, {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
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
  const [error, setError] = useState(null)
  useEffect(() => {
    setLoading(true)
    fn().then(r => setData(r.data)).catch(e => setError(e)).finally(() => setLoading(false))
  }, deps)
  return { data, loading, error }
}

function Spinner() {
  return <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>Yükleniyor...</div>
}

function DashboardContent({ buildingId }) {
  const { data, loading } = useApi(() => client.get(`/api/dashboard/admin?building_id=${buildingId}`), [buildingId])
  const { data: payments, loading: pLoading } = useApi(() => client.get(`/api/payments?building_id=${buildingId}&period=${new Date().toISOString().slice(0,7)}`), [buildingId])

  if (loading || pLoading) return <Spinner />
  if (!data) return null

  const stats = [
    { label: 'Toplam Daire', value: data.apartments?.total || '0', icon: '⬡', color: '#3B82F6', sub: `${data.apartments?.occupied || 0} dolu` },
    { label: 'Tahsil Edilen', value: `₺${Number(data.payments?.collected || 0).toLocaleString('tr-TR')}`, icon: '₺', color: '#10B981', sub: 'Bu ay' },
    { label: 'Bekleyen Aidat', value: data.payments?.pending || '0', icon: '⏳', color: '#F59E0B', sub: 'Daire' },
    { label: 'Açık Arıza', value: data.repairs?.pending || '0', icon: '🔧', color: '#EF4444', sub: 'Bekliyor' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={s.statsGrid}>
        {stats.map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={s.statLabel}>{stat.label}</p>
                <p style={{ ...s.statValue, color: stat.color }}>{stat.value}</p>
                <p style={s.statSub}>{stat.sub}</p>
              </div>
              <div style={{ ...s.statIcon, background: `${stat.color}22`, color: stat.color }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Son Aidat Hareketleri</h3>
          <table style={s.table}>
            <thead><tr>{['Daire', 'Daire Sahibi', 'Tutar', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(payments || []).slice(0, 5).map(row => (
                <tr key={row.id} style={s.tr}>
                  <td style={s.td}><span style={s.daireBadge}>{row.block ? `${row.block}-${row.unit_number}` : row.unit_number}</span></td>
                  <td style={s.td}>{row.owner_name || '-'}</td>
                  <td style={s.td}>₺{Number(row.amount).toLocaleString('tr-TR')}</td>
                  <td style={s.td}><StatusBadge durum={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Son Duyurular</h3>
          {['genel', 'daire'].map(tip => {
            const liste = (data.recent_announcements || []).filter(d => tip === 'genel' ? !d.apartment_id : !!d.apartment_id)
            if (!liste.length) return null
            return (
              <div key={tip} style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: tip === 'genel' ? '#60A5FA' : '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {tip === 'genel' ? '📢 Genel' : '🏠 Daire Bazlı'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liste.map(d => (
                    <div key={d.id} style={s.duyuruItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={s.duyuruBaslik}>{d.title}</span>
                        <span style={s.duyuruTarih}>{new Date(d.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AidatlarContent({ buildingId }) {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client.get(`/api/payments?building_id=${buildingId}&period=${period}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [buildingId, period])

  const shiftMonth = (dir) => {
    const d = new Date(period + '-01')
    d.setMonth(d.getMonth() + dir)
    setPeriod(d.toISOString().slice(0, 7))
  }

  const rows = data || []
  const odendi   = rows.filter(r => r.status === 'ödendi')
  const bekliyor = rows.filter(r => r.status === 'bekliyor')
  const gecikm   = rows.filter(r => r.status === 'gecikmiş')
  const toplam   = odendi.reduce((s, r) => s + Number(r.amount), 0)

  const [y, m] = period.split('-')
  const ayAd = new Date(Number(y), Number(m) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dönem seçici */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => shiftMonth(-1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>‹</button>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', color: '#F1F5F9', minWidth: '180px', textAlign: 'center', textTransform: 'capitalize' }}>{ayAd}</span>
        <button onClick={() => shiftMonth(1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>›</button>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Tahsil Edilen', value: `₺${toplam.toLocaleString('tr-TR')}`, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Ödendi', value: odendi.length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Bekliyor', value: bekliyor.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Gecikmiş', value: gecikm.length, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div style={s.card}>
        {loading ? <Spinner /> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={s.cardTitle}>Aidat Listesi</h3>
              <span style={{ fontSize: '13px', color: '#64748B' }}>{rows.length} daire</span>
            </div>
            <table style={s.table}>
              <thead><tr>{['Daire', 'Daire Sahibi', 'Tutar', 'Son Ödeme', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} style={s.tr}>
                    <td style={s.td}><span style={s.daireBadge}>{row.block ? `${row.block}-${row.unit_number}` : row.unit_number}</span></td>
                    <td style={s.td}>{row.owner_name || '-'}</td>
                    <td style={s.td}>₺{Number(row.amount).toLocaleString('tr-TR')}</td>
                    <td style={s.td}>{row.due_date ? new Date(row.due_date).toLocaleDateString('tr-TR') : '-'}</td>
                    <td style={s.td}><StatusBadge durum={row.status} /></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '32px' }}>Bu dönem için kayıt yok</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

const emptyDaire = { unit_number: '', block: '', floor: '', type: '', owner_name: '', owner_phone: '', monthly_fee: '', status: 'boş' }

function DairelerContent({ buildingId }) {
  const { data, loading } = useApi(() => client.get(`/api/apartments?building_id=${buildingId}`), [buildingId])
  const [list, setList] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyDaire)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (data) setList(data) }, [data])

  const openEdit = (d) => {
    setEditId(d.id)
    setForm({ unit_number: d.unit_number || '', block: d.block || '', floor: d.floor || '', type: d.type || '', owner_name: d.owner_name || '', owner_phone: d.owner_phone || '', monthly_fee: d.monthly_fee || '', status: d.status || 'boş' })
    setShowForm(false)
    setError('')
  }

  const iptal = () => { setEditId(null); setShowForm(false); setForm(emptyDaire); setError('') }

  const kaydet = async () => {
    if (!form.unit_number) { setError('Daire no zorunlu'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, building_id: buildingId, floor: form.floor || null, monthly_fee: form.monthly_fee || 0 }
      if (editId) {
        const { data: updated } = await client.put(`/api/apartments/${editId}`, payload)
        setList(prev => prev.map(d => d.id === editId ? updated : d))
      } else {
        const { data: created } = await client.post('/api/apartments', payload)
        setList(prev => [...(prev || []), created])
      }
      iptal()
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const sil = async (id) => {
    if (!confirm('Bu daireyi silmek istiyor musunuz?')) return
    await client.delete(`/api/apartments/${id}`)
    setList(prev => prev.filter(d => d.id !== id))
  }

  const formAcik = showForm || !!editId

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {formAcik && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>{editId ? 'Daireyi Düzenle' : 'Yeni Daire Ekle'}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <input style={s.input} placeholder="Daire No * (örn: 101)" value={form.unit_number} onChange={e => setForm({ ...form, unit_number: e.target.value })} />
            <input style={s.input} placeholder="Blok (örn: A)" value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} />
            <input style={s.input} placeholder="Kat (örn: 3)" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
            <input style={s.input} placeholder="Tip (örn: 3+1)" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
            <input style={s.input} placeholder="Daire Sahibi" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
            <input style={s.input} placeholder="Telefon" value={form.owner_phone} onChange={e => setForm({ ...form, owner_phone: e.target.value })} />
            <input style={s.input} placeholder="Aylık Aidat (₺)" type="number" value={form.monthly_fee} onChange={e => setForm({ ...form, monthly_fee: e.target.value })} />
            <select style={s.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="boş">Boş</option>
              <option value="dolu">Dolu</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button style={s.btnPrimary} onClick={kaydet} disabled={saving}>{saving ? 'Kaydediliyor...' : '✓ Kaydet'}</button>
            <button style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)' }} onClick={iptal}>İptal</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={s.cardTitle}>Daire Listesi</h3>
          <button style={s.btnPrimary} onClick={() => { setShowForm(true); setEditId(null); setForm(emptyDaire) }}>+ Yeni Daire</button>
        </div>
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead><tr>{['Daire No', 'Kat', 'Tip', 'Daire Sahibi', 'Telefon', 'Aylık Aidat', 'Durum', 'İşlem'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(list || []).map(d => (
                <tr key={d.id} style={{ ...s.tr, ...(editId === d.id ? { background: 'rgba(59,130,246,0.06)' } : {}) }}>
                  <td style={s.td}><span style={s.daireBadge}>{d.block ? `${d.block}-${d.unit_number}` : d.unit_number}</span></td>
                  <td style={s.td}>{d.floor ? `${d.floor}. Kat` : '-'}</td>
                  <td style={s.td}>{d.type || '-'}</td>
                  <td style={s.td}>{d.owner_name || '-'}</td>
                  <td style={s.td}>{d.owner_phone || '-'}</td>
                  <td style={s.td}>₺{Number(d.monthly_fee || 0).toLocaleString('tr-TR')}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: d.status === 'dolu' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: d.status === 'dolu' ? '#10B981' : '#64748B' }}>{d.status}</span></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(d)} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Düzenle</button>
                      <button onClick={() => sil(d.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px' }}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list?.length && <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '30px' }}>Henüz daire eklenmedi</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function DuyurularContent({ buildingId }) {
  const { data: apartmentData } = useApi(() => client.get(`/api/apartments?building_id=${buildingId}`), [buildingId])
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', apartment_id: '' })
  const [saving, setSaving] = useState(false)
  const [list, setList] = useState(null)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    client.get(`/api/announcements?building_id=${buildingId}`)
      .then(r => setList(r.data))
      .finally(() => setListLoading(false))
  }, [buildingId])

  const ekle = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    try {
      const payload = {
        building_id: buildingId,
        title: form.title,
        content: form.content,
        priority: form.priority,
        apartment_id: form.apartment_id || null,
      }
      const { data: created } = await client.post('/api/announcements', payload)
      setList(prev => [created, ...(prev || [])])
      setForm({ title: '', content: '', priority: 'normal', apartment_id: '' })
    } catch { } finally { setSaving(false) }
  }

  const sil = async (id) => {
    try {
      await client.delete(`/api/announcements/${id}`)
      setList(prev => prev.filter(d => d.id !== id))
    } catch { }
  }

  const apartments = apartmentData || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Yeni Duyuru Ekle</h3>
        <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Duyuru başlığı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <select style={s.input} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="önemli">Önemli</option>
            <option value="acil">Acil</option>
          </select>
          <select style={s.input} value={form.apartment_id} onChange={e => setForm({ ...form, apartment_id: e.target.value })}>
            <option value="">📢 Tüm Binaya</option>
            {apartments.map(a => (
              <option key={a.id} value={a.id}>
                🏠 {a.block ? `${a.block}-${a.unit_number}` : a.unit_number}{a.owner_name ? ` (${a.owner_name})` : ''}
              </option>
            ))}
          </select>
        </div>
        <textarea style={{ ...s.input, height: '90px', resize: 'vertical' }} placeholder="Duyuru içeriği..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        <button style={{ ...s.btnPrimary, marginTop: '12px' }} onClick={ekle} disabled={saving}>
          {saving ? 'Yayınlanıyor...' : '📣 Duyuru Yayınla'}
        </button>
      </div>
      {listLoading ? <Spinner /> : ['genel', 'daire'].map(tip => {
        const baslik = tip === 'genel' ? '📢 Genel Duyurular' : '🏠 Daire Bazlı Duyurular'
        const renk = tip === 'genel' ? '#60A5FA' : '#A78BFA'
        const liste = (list || []).filter(d => tip === 'genel' ? !d.apartment_id : !!d.apartment_id)
        return (
          <div key={tip} style={s.card}>
            <h3 style={{ ...s.cardTitle, marginBottom: '16px', color: renk }}>{baslik}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {liste.map(d => (
                <div key={d.id} style={s.duyuruItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={s.duyuruBaslik}>{d.title}</span>
                      {d.apartment_id && (
                        <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(139,92,246,0.15)', color: '#A78BFA', fontWeight: '500' }}>
                          {d.target_block ? `${d.target_block}-${d.target_unit}` : d.target_unit}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={s.duyuruTarih}>{new Date(d.created_at).toLocaleDateString('tr-TR')}</span>
                      <button onClick={() => sil(d.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px', padding: '2px' }} title="Sil">🗑</button>
                    </div>
                  </div>
                  <p style={s.duyuruIcerik}>{d.content}</p>
                </div>
              ))}
              {!liste.length && <p style={{ color: '#475569', fontSize: '14px' }}>Henüz duyuru yok</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ArizalarContent({ buildingId }) {
  const [repairs, setRepairs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    client.get(`/api/repairs?building_id=${buildingId}`)
      .then(r => setRepairs(r.data))
      .finally(() => setLoading(false))
  }, [buildingId])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await client.put(`/api/repairs/${id}`, { status })
      setRepairs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {
      alert('Durum güncellenemedi.')
    } finally {
      setUpdating(null)
    }
  }

  const statusOptions = ['bekliyor', 'inceleniyor', 'tamamlandı']

  if (loading) return <Spinner />
  return (
    <div style={s.card}>
      <h3 style={{ ...s.cardTitle, marginBottom: '20px' }}>Arıza Bildirimleri</h3>
      <table style={s.table}>
        <thead><tr>{['No', 'Konu', 'Daire', 'Daire Sahibi', 'Tarih', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>
          {(repairs || []).map(a => (
            <tr key={a.id} style={s.tr}>
              <td style={s.td}><span style={{ color: '#64748B', fontSize: '13px' }}>#{a.id}</span></td>
              <td style={s.td}>
                <p style={{ color: '#E2E8F0', fontWeight: '500' }}>{a.title}</p>
                {a.description && <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>{a.description}</p>}
              </td>
              <td style={s.td}><span style={s.daireBadge}>{a.block ? `${a.block}-${a.unit_number}` : (a.unit_number || 'Genel')}</span></td>
              <td style={s.td}>{a.reported_by_name || '-'}</td>
              <td style={s.td}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
              <td style={s.td}>
                <select
                  value={a.status}
                  disabled={updating === a.id}
                  onChange={e => updateStatus(a.id, e.target.value)}
                  style={{
                    background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', padding: '5px 10px', color: '#F1F5F9',
                    fontSize: '13px', cursor: 'pointer', outline: 'none',
                    opacity: updating === a.id ? 0.5 : 1,
                  }}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GiderlerContent({ buildingId }) {
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ category: 'Temizlik', description: '', amount: '', period: new Date().toISOString().slice(0, 7) })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    client.get(`/api/expenses?building_id=${buildingId}&period=${selectedPeriod}`)
      .then(r => setList(r.data))
      .finally(() => setLoading(false))
  }, [buildingId, selectedPeriod])

  const shiftMonth = (dir) => {
    const d = new Date(selectedPeriod + '-01')
    d.setMonth(d.getMonth() + dir)
    setSelectedPeriod(d.toISOString().slice(0, 7))
  }

  const kaydet = async () => {
    if (!form.amount || !form.category) return
    setSaving(true)
    try {
      const { data: created } = await client.post('/api/expenses', { building_id: buildingId, ...form, amount: Number(form.amount) })
      if (created.period === selectedPeriod) setList(prev => [created, ...(prev || [])])
      setForm({ category: 'Temizlik', description: '', amount: '', period: new Date().toISOString().slice(0, 7) })
      setShowForm(false)
    } catch { } finally { setSaving(false) }
  }

  const sil = async (id) => {
    if (!confirm('Bu gideri silmek istiyor musunuz?')) return
    await client.delete(`/api/expenses/${id}`)
    setList(prev => prev.filter(g => g.id !== id))
  }

  const toplam = (list || []).reduce((acc, g) => acc + Number(g.amount), 0)
  const kategoriler = ['Temizlik', 'Bakım', 'Tadilat', 'Elektrik', 'Su', 'Asansör', 'Güvenlik', 'Diğer']

  const [y, m] = selectedPeriod.split('-')
  const ayAd = new Date(Number(y), Number(m) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dönem seçici + Ekle butonu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => shiftMonth(-1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>‹</button>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', color: '#F1F5F9', minWidth: '180px', textAlign: 'center', textTransform: 'capitalize' }}>{ayAd}</span>
          <button onClick={() => shiftMonth(1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>›</button>
        </div>
        <button onClick={() => setShowForm(f => !f)} style={s.btnPrimary}>
          {showForm ? '✕ İptal' : '+ Gider Ekle'}
        </button>
      </div>

      {/* Gider Ekleme Formu */}
      {showForm && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Yeni Gider Ekle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <select style={s.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {kategoriler.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input style={s.input} type="number" placeholder="Tutar (₺)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <input style={s.input} type="month" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
          </div>
          <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Açıklama (isteğe bağlı)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button style={s.btnPrimary} onClick={kaydet} disabled={saving}>
            {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      )}

      {/* Özet */}
      <div style={{ ...s.statCard, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p style={s.statLabel}>{ayAd} Toplam Gider</p>
        <p style={{ ...s.statValue, color: '#EF4444', fontSize: '32px' }}>₺{toplam.toLocaleString('tr-TR')}</p>
      </div>

      {/* Tablo */}
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Gider Detayları</h3>
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead><tr>{['Kategori', 'Açıklama', 'Dönem', 'Tutar', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(list || []).map(g => (
                <tr key={g.id} style={s.tr}>
                  <td style={s.td}><span style={{ ...s.badge, background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }}>{g.category}</span></td>
                  <td style={s.td}>{g.description || '-'}</td>
                  <td style={s.td}>{g.period}</td>
                  <td style={{ ...s.td, color: '#EF4444', fontWeight: '600' }}>₺{Number(g.amount).toLocaleString('tr-TR')}</td>
                  <td style={s.td}>
                    <button onClick={() => sil(g.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px' }}>🗑</button>
                  </td>
                </tr>
              ))}
              {!list?.length && <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '32px' }}>Bu dönem için gider yok</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function KullanicilarContent({ buildingId }) {
  const { data: apartments } = useApi(() => client.get(`/api/apartments?building_id=${buildingId}`), [buildingId])
  const { data, loading } = useApi(() => client.get(`/api/users?building_id=${buildingId}&role=resident`), [buildingId])
  const [list, setList] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', apartment_id: '' })
  const [editUser, setEditUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (data) setList(data) }, [data])

  const kaydet = async () => {
    if (!form.name || !form.email || !form.password) { setError('İsim, e-posta ve şifre zorunlu'); return }
    setSaving(true); setError('')
    try {
      const { data: created } = await client.post('/api/users', { ...form, role: 'resident', building_id: buildingId, apartment_id: form.apartment_id || null })
      setList(prev => [...(prev || []), created])
      setForm({ name: '', email: '', password: '', apartment_id: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const guncelle = async () => {
    if (!editUser.name) { setError('İsim zorunlu'); return }
    setSaving(true); setError('')
    try {
      const payload = { name: editUser.name, apartment_id: editUser.apartment_id || null, building_id: buildingId }
      if (editUser.password) payload.password = editUser.password
      const { data: updated } = await client.put(`/api/users/${editUser.id}`, payload)
      setList(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))
      setEditUser(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const sil = async (id) => {
    if (!confirm('Bu kullanıcıyı devre dışı bırakmak istiyor musunuz?')) return
    await client.delete(`/api/users/${id}`)
    setList(prev => prev.filter(u => u.id !== id))
  }

  const aptLabel = (id) => {
    const a = (apartments || []).find(a => a.id === parseInt(id))
    return a ? (a.block ? `${a.block}-${a.unit_number}` : a.unit_number) : '-'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Yeni kullanıcı formu */}
      {showForm && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Yeni Sakin Ekle</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input style={s.input} placeholder="Ad Soyad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={s.input} placeholder="E-posta" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input style={s.input} placeholder="Şifre (min. 6 karakter)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select style={s.input} value={form.apartment_id} onChange={e => setForm({ ...form, apartment_id: e.target.value })}>
              <option value="">Daire Seç</option>
              {(apartments || []).map(a => <option key={a.id} value={a.id}>{a.block ? `${a.block}-${a.unit_number}` : a.unit_number}{a.owner_name ? ` (${a.owner_name})` : ''}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button style={s.btnPrimary} onClick={kaydet} disabled={saving}>{saving ? 'Kaydediliyor...' : '✓ Kaydet'}</button>
            <button style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)' }} onClick={() => { setShowForm(false); setError('') }}>İptal</button>
          </div>
        </div>
      )}

      {/* Düzenleme formu */}
      {editUser && (
        <div style={{ ...s.card, border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Kullanıcı Düzenle — {editUser.email}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input style={s.input} placeholder="Ad Soyad" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
            <select style={s.input} value={editUser.apartment_id || ''} onChange={e => setEditUser({ ...editUser, apartment_id: e.target.value })}>
              <option value="">Daire Seç</option>
              {(apartments || []).map(a => <option key={a.id} value={a.id}>{a.block ? `${a.block}-${a.unit_number}` : a.unit_number}{a.owner_name ? ` (${a.owner_name})` : ''}</option>)}
            </select>
            <input style={s.input} placeholder="Yeni şifre (değiştirmek için doldur)" type="password" value={editUser.password || ''} onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button style={s.btnPrimary} onClick={guncelle} disabled={saving}>{saving ? 'Kaydediliyor...' : '✓ Güncelle'}</button>
            <button style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)' }} onClick={() => { setEditUser(null); setError('') }}>İptal</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={s.cardTitle}>Kayıtlı Sakinler</h3>
          <button style={s.btnPrimary} onClick={() => setShowForm(true)}>+ Yeni Sakin</button>
        </div>
        {loading ? <div style={{ color: '#475569' }}>Yükleniyor...</div> : (
          <table style={s.table}>
            <thead><tr>{['İsim', 'E-posta', 'Daire', 'Durum', 'İşlem'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(list || []).map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.apartment_id ? <span style={s.daireBadge}>{aptLabel(u.apartment_id)}</span> : '-'}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: u.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)', color: u.is_active ? '#10B981' : '#64748B' }}>{u.is_active ? 'Aktif' : 'Pasif'}</span></td>
                  <td style={s.td}>
                    <button onClick={() => { setEditUser({ ...u, password: '' }); setError(''); setShowForm(false) }} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '13px', marginRight: '10px' }}>Düzenle</button>
                    <button onClick={() => sil(u.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px' }}>Devre Dışı</button>
                  </td>
                </tr>
              ))}
              {!list?.length && <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '30px' }}>Henüz kayıtlı sakin yok</td></tr>}
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
  return <span style={{ ...s.badge, background: c.bg, color: c.color }}>{durum}</span>
}

const s = {
  main:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-page)' },
  topbar:     { padding: '24px 32px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-page)' },
  pageTitle:  { fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '700', color: 'var(--t1)' },
  pageDate:   { fontSize: '13px', color: 'var(--t5)', marginTop: '2px' },
  content:    { flex: 1, overflow: 'auto', padding: '28px 32px' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' },
  statCard:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' },
  statLabel:  { fontSize: '12px', color: 'var(--t4)', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue:  { fontSize: '28px', fontFamily: 'Syne, sans-serif', fontWeight: '700', marginBottom: '4px' },
  statSub:    { fontSize: '12px', color: 'var(--t5)' },
  statIcon:   { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' },
  cardTitle:  { fontSize: '15px', fontWeight: '600', color: 'var(--t1)', marginBottom: '16px', fontFamily: 'Syne, sans-serif' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: 'var(--t5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' },
  tr:         { borderBottom: '1px solid var(--border-soft)' },
  td:         { padding: '12px', fontSize: '14px', color: 'var(--t3)' },
  badge:      { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  daireBadge: { padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', fontFamily: 'monospace' },
  duyuruItem: { padding: '14px', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border)' },
  duyuruBaslik:{ fontSize: '14px', fontWeight: '600', color: 'var(--t1)' },
  duyuruTarih: { fontSize: '12px', color: 'var(--t5)' },
  duyuruIcerik:{ fontSize: '13px', color: 'var(--t4)', marginTop: '6px', lineHeight: 1.5 },
  btnPrimary: { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '8px', padding: '10px 18px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  input:      { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '12px 14px', color: 'var(--t1)', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', display: 'block', boxSizing: 'border-box' },
}
